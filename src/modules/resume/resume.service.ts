import { Injectable, Logger, NotFoundException } from '@nestjs/common';

import * as pdf from 'pdf-parse';
import { WritableStream } from 'htmlparser2/lib/WritableStream';
import { Readable } from 'stream';

import { ResumeCreateDraftDto } from '~/modules/resume/dtos/resume-create-draft.dto';

import { ScraperService } from '~/vendors/scraper/scraper.service';
import { CompletionService } from '~/vendors/openai/completion/completion.service';
import { AssistantService } from '~/vendors/openai/assistant/assistant.service';
import { UserRepository } from '~/vendors/prisma/repositories/user.repository';
import { DocumentRepository } from '~/vendors/prisma/repositories/document.repository';
import { PostingRepository } from '~/vendors/prisma/repositories/posting.repository';
import { ProfileRepository } from '~/vendors/prisma/repositories/profile.repository';
import { VersionRepository } from '~/vendors/prisma/repositories/version.repository';

import ResumeParserDefinitions from '~/vendors/openai/assistant/definitions/resume-parser.definitions';
import { ResumeVersionUpdateDto } from './dtos/resume-version-update.dto';
import { Auth0UserRepository } from '~/vendors/prisma/repositories/auth0-user.repository';

const SYSTEM_MESSAGE = {
  role: 'system',
  content: `
  I'd like to create a highly professional and visually appealing HTML resume. My goal is to make a great first impression with potential employers. 
  Here's an outline of my background, as well as specific requirements and requests:

  Resume Content Outline

  Profile/Summary: A concise, persuasive summary of my experience, skills, and goals.
  Work Experience: Detailed work history with company names, locations, dates, and job responsibilities. Descriptions tailored to the job I'm applying to.
  Education: Degree(s), programs, universities, dates. Include relevant coursework, certifications, etc.
  Skills: Technical skills, soft skills, organized into appropriate categories (e.g., Technical, Communication, etc.).
  Achievements: Significant contributions, awards, quantifiable results, exceeding expectations.
  Contact: Name, email, phone, location. Potential employers should be able to reach me easily.
  Additional (Optional): Projects, Languages, Hobbies (If relevant to the job)
  Requirements

  Applicant Tracking System (ATS) Compatability: Ensure the HTML structure is easily parsed by ATS software.
  Responsiveness: Design should flawlessly adapt to all screen sizes for easy reading on computers, tablets, and phones.
  Customizability: Offer options for editing font types, sizes, colors, etc., without requiring the user to directly edit HTML.
  Downloadable: Let me download the final resume as an HTML file and provide instructions for converting it to PDF (if desired).
  Design Requests

  Clean, Minimalist Style: Avoid cluttered layouts and distracting elements. Focus on readability and a professional look.
  Color Psychology: Suggest color schemes based on psychological associations (e.g., blue for trustworthiness, orange for creativity).
  Accessibility: Provide options for accessibility tweaks like high-contrast mode, alt-text for images, etc.
  `,
};

class ReadableString extends Readable {
  private sent = false;

  constructor(private str: string) {
    super();
  }

  _read() {
    if (!this.sent) {
      this.push(Buffer.from(this.str));
      this.sent = true;
    } else {
      this.push(null);
    }
  }
}

@Injectable()
export class ResumeService {
  private readonly logger = new Logger(ResumeService.name);
  constructor(
    private readonly completionService: CompletionService,
    private readonly assistantService: AssistantService,
    private readonly scraperService: ScraperService,
    private readonly userRepository: UserRepository,
    private readonly documentRepository: DocumentRepository,
    private readonly profileRepository: ProfileRepository,
    private readonly postingRepository: PostingRepository,
    private readonly versionRepository: VersionRepository,
    private readonly auth0UserRepository: Auth0UserRepository,
  ) {}

  async getOrCreateUser(auth: any) {
    try {
      let auth0User = await this.auth0UserRepository.user({
        id: auth.payload.sub,
      });
      if (!auth0User) {
        auth0User = await this.auth0UserRepository.createUser({
          id: auth.payload.sub,
          email: 'guest@vresume.dev',
          name: 'Guest',
          picture: 'https://resend.dev/assets/img/logo.png',
        });
      }

      let user = await this.userRepository.user({ authId: auth.payload.sub });
      if (!user) {
        user = await this.userRepository.createUser({
          authId: auth.payload.sub,
        });
      }

      return user;
    } catch (error) {
      this.logger.error('Error getting or creating user:', error);
      throw error;
    }
  }

  async get(auth0UserId: string) {
    const user = await this.userRepository.user({ authId: auth0UserId });
    const documents = await this.documentRepository.documents({
      where: {
        userId: user.id,
      },
    });

    return documents;
  }

  async getById(auth0UserId: string, id: number) {
    const user = await this.userRepository.user({ authId: auth0UserId });
    const document = await this.documentRepository.document({
      id: id,
      userId: user.id,
    });

    if (!document) {
      throw new NotFoundException('Resume not found');
    }

    return document;
  }

  async getVersions(auth0UserId: string, id: number) {
    const user = await this.userRepository.user({ authId: auth0UserId });
    const document = await this.documentRepository.document({
      id: id,
      userId: user.id,
    });

    if (!document) {
      throw new NotFoundException('Resume not found');
    }

    const versions = await this.versionRepository.versions({
      where: {
        documentId: document.id,
      },
    });

    return versions;
  }

  private async getVersionKnowledge(documentId: number) {
    const versions = await this.versionRepository.versions({
      where: {
        documentId,
      },
      orderBy: {
        version: 'asc',
      },
    });

    const knowledge = [SYSTEM_MESSAGE];

    versions.forEach((v) => {
      knowledge.push({
        role: 'user',
        content: v.prompt,
      });
      knowledge.push({
        role: 'assistant',
        content: v.data,
      });
    });

    return knowledge;
  }

  private async getVersionContext(
    knowledge: any[],
    message: string,
    selected: string,
  ) {
    return [
      ...knowledge,
      {
        role: 'user',
        content: [
          message.length
            ? `- ${message}`
            : '- Analyze the html and rebuild it with the correct improvements',
          selected.length && selected.length > 16 // 16 is the length of the default selected message (html node content)
            ? `- Only apply the changes to the selected nodes: ${selected}`
            : '- Apply the changes to the entire html',
        ].join('\n- '),
      },
    ];
  }

  async updateVersion(
    auth0UserId: string,
    resumeId: number,
    version: number,
    dto: ResumeVersionUpdateDto,
  ) {
    const user = await this.userRepository.user({ authId: auth0UserId });

    const resume = await this.documentRepository.document({
      id: resumeId,
      userId: user.id,
    });

    if (!resume) {
      throw new NotFoundException('Resume not found');
    }

    const knowledge = await this.getVersionKnowledge(resume.id);
    const context = await this.getVersionContext(
      knowledge,
      dto.query,
      dto.selected,
    );
    const html = await this.completionService.extendCompletion(context);
    if (!html) {
      throw new Error('Error updating version');
    }

    const newVersion = await this.versionRepository.createVersion({
      documentId: resume.id,
      version: version + 1,
      data: html,
      prompt: context[context.length - 1].content,
    });

    await this.documentRepository.updateDocument({
      data: {
        versionId: newVersion.id,
      },
      where: {
        id: resume.id,
      },
    });

    return newVersion;
  }

  async getVersion(auth0UserId: string, documentId: number, version: number) {
    const user = await this.userRepository.user({ authId: auth0UserId });
    const document = await this.documentRepository.document({
      id: documentId,
      userId: user.id,
    });

    if (!document) {
      throw new NotFoundException('Resume not found');
    }

    const _version = await this.versionRepository.versions({
      where: {
        documentId: document.id,
        version: version,
      },
    });

    if (!_version) {
      throw new NotFoundException('Version not found');
    }

    return _version;
  }

  private async parseResumeFromFile(file: Express.Multer.File) {
    this.assistantService.loadFunctionsFromArray(ResumeParserDefinitions);

    const parsedPDF = await pdf(file.buffer);
    const text = parsedPDF.text;

    const params = await this.assistantService.run([
      {
        role: 'user',
        content: `Evaluate this information and extract the fields, lets think step by step. ${text}`,
      },
    ]);

    return {
      params,
      text,
    };
  }

  private async generateHtmlResume(resume: string, job: string) {
    const prompt = `
    ****************************************************************************************
    - Please generate an HTML formatted resume from the following information: ${resume}
    ****************************************************************************************
    - The job description is as follows: ${job}
    ****************************************************************************************
    - Example Output: 
    <!DOCTYPE html>
    <html>
    <head>
      <title>Resume</title>
      <style> 
        /* Basic styling example - modify as needed */
        /* I will be putting this html inside a pdf viewer/editor */
        /* So make sure the styling is responsive */
        body { font-family: sans-serif; }
        h1, h2 { color: #225588; } /* Example of an accent color */
      </style>
    </head>
    <body>
      </body>
    </html> 
    ****************************************************************************************
    - Sections
    * **Objective:**  Short career summary.
    * **Education:** Degree, school, graduation year.
    * **Work Experience:** Job title, company, dates, brief descriptions.
    * **Skills:** List of relevant technical and soft skills.

    **Layout**
    * Use a two-column layout for Work Experience to present information clearly.
    * Consider  CSS Grid or Flexbox for modern  layout design.
    * Center the resume on the page.

    **Styling**
    * Create a clean, professional look. Feel free to choose suitable colors and fonts.

    **Output**
    * Valid HTML with all closing tags. 
    ****************************************************************************************
    `;

    const messages = [
      SYSTEM_MESSAGE,
      {
        role: 'user',
        content: prompt,
      },
    ];
    const html = await this.completionService.extendCompletion(messages);

    return {
      prompt,
      html,
    };
  }

  private async parseJobFromUrl(url: string): Promise<any> {
    const html = await this.scraperService.scrapeUrl(url);
    const stream = new ReadableString(html);

    const fields = [
      'jobTitle',
      'company',
      'location',
      'skills',
      'qualifications',
      'experience',
      'jobDescription',
      'salary',
      'benefits',
      'postingLink',
    ];

    let prompt = '';
    const data = null;
    const parser = new WritableStream({
      ontext(text) {
        let data = null;
        try {
          data = JSON.parse(text);
        } catch (e) {}

        if (data) {
          if (data['props']['pageProps']['data']) {
            data = data['props']['pageProps']['data'];
            prompt = `
            Below is a list of fields that need to be extracted from a job posting. Evaluate the fields here: ${fields.join(
              ',',
            )}. Analyze the job posting data here: ${JSON.stringify(
              data,
            )}. The output should be an object with the fields as keys and the extracted values as values.
        
            If a field is not found, the value should be "Unavailable".
            If a field is found multiple times (e.g., multiple SKILL entries), the value should be an array of the values.
            Pay close attention to whether the array should contain unique values or all instances.
            Perform your own self-alignment and backtesting to ensure the output is correct.
            Important Considerations
        
            Structure of Job Postings: Job postings are much less standardized than resumes. You'll likely need to use more sophisticated pattern matching or natural language processing techniques to handle this variability.
            Ambiguity: Certain fields might be challenging to disambiguate. For instance, "EXPERIENCE" could mean required experience for the applicant or a description of typical duties on the job.
            Additional Fields: You might want to include fields like "CONTACTINFO" or "APPLICATIONDEADLINE" if you want your system to understand those as well.
            Illustrative Example
        
            Let's assume the rawText contains a sample job posting. A possible output based on our modified instructions could look like this:
        
            JavaScript
            {
              jobTitle: "Software Engineer", 
              company: "Acme Tech Inc.",
              location: "Remote", 
              skills: ["Python", "JavaScript", "AWS"], 
              qualifications: ["Bachelor's degree in Computer Science or equivalent", "2+ years of experience with web development"],
              experience: "Developing scalable web applications", // Just one description
              jobDescription: ["Design and implement new features", "Collaborate with cross-functional teams", ...], // Likely an array
              salary: "Unavailable", // May not be found in all postings
              benefits: ["Competitive compensation", "Health Insurance", "401(k)"], 
              postingLink: "https://www.acmetech.com/careers/software-engineer"  
            }
            
            ** Remember to replace these placeholders with the actual values you find in the job posting. **
            `;
          }
        }
      },
    });

    return new Promise(async (resolve, reject) => {
      stream.pipe(parser).on('finish', async () => {
        try {
          const result = await this.completionService.complete({ prompt });
          try {
            resolve({
              params: JSON.parse(result),
              text: data,
            });
          } catch (error) {
            const lines = result.split('\n');
            const params = {};
            for (const line of lines) {
              const [key, value] = line.split(':');
              params[key.trim()] = value;
            }
            resolve({
              params,
              text: data,
            });
          }
        } catch (error) {
          this.logger.error('Error completing job:', error);
          reject(error);
        }
      });
    });
  }

  createDraft = async (
    auth0UserId: string,
    dto: ResumeCreateDraftDto,
  ): Promise<any> => {
    const v = 1;
    const _posting = await this.parseJobFromUrl(dto.posting);
    const _profile = await this.parseResumeFromFile(dto.resume);

    const _document = await this.generateHtmlResume(
      _profile.text,
      JSON.stringify(_posting.params),
    );

    const user = await this.userRepository.user({ authId: auth0UserId });

    const document = await this.documentRepository.createDocument({
      title: 'Resume Draft',
      versionId: -v,
      userId: user.id,
    });

    const profile = await this.profileRepository.createProfile({
      documentId: document.id,
      text: _profile.text,
      tokens: JSON.stringify(_profile.params),
    });

    const posting = await this.postingRepository.createPosting({
      documentId: document.id,
      text: _posting.text,
      blob: dto.posting,
      tokens: JSON.stringify(_posting.params),
    });

    const version = await this.versionRepository.createVersion({
      documentId: document.id,
      version: v,
      data: _document.html,
      prompt: _document.prompt,
    });

    const relationships = {
      versionId: version.id,
      postingId: posting.id,
      profileId: profile.id,
    };

    await this.documentRepository.updateDocument({
      data: relationships,
      where: {
        id: document.id,
      },
    });

    return {
      document: {
        ...document,
        ...relationships,
      },
      profile,
      posting,
      version,
    };
  };
}

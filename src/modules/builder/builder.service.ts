import { Injectable, Logger } from '@nestjs/common';
import * as pdfparse from 'pdf-parse';
import { WritableStream } from 'htmlparser2/lib/WritableStream';
import { Version } from '@prisma/client';

import { ReadableString } from '~/utils/readable-string';
import { AssistantService } from '~/vendors/openai/assistant/assistant.service';
import ResumeParserDefinitions from '~/vendors/openai/assistant/definitions/resume-parser.definitions';
import { CompletionService } from '~/vendors/openai/completion/completion.service';
import { ScraperService } from '~/vendors/scraper/scraper.service';

type KnowledgeBase = {
  role: string;
  content: string;
}[];

@Injectable()
export class BuilderService {
  private readonly logger = new Logger(BuilderService.name);
  constructor(
    private readonly assistantService: AssistantService,
    private readonly scraperService: ScraperService,
    private readonly completionService: CompletionService,
  ) {}

  async versionResume(versions: Version[], query = '', selectedHtmlNodes = '') {
    const knowledge = this.buildKnowledgeBase(versions);
    this.logger.debug('knowledge:', knowledge);
    const html = await this.buildHtmlGeneratorPrompt(
      knowledge,
      query,
      selectedHtmlNodes,
    );
    if (!html || !html.length) {
      return 'No response from the AI';
    }

    return html;
  }

  buildKnowledgeBase(versions: Version[]): KnowledgeBase {
    const base = [ResumeAssistantInstructions];
    for (const version of versions) {
      base.push({
        role: 'user',
        content: version.prompt,
      });

      base.push({
        role: 'assistant',
        content: version.data,
      });
    }
    return base;
  }

  async buildHtmlGeneratorPrompt(
    base: KnowledgeBase,
    query: string,
    selectedHtmlNodes: string,
  ) {
    const instructions = [
      query.length
        ? query
        : 'Please revise the HTML to meet professional standards.',
      selectedHtmlNodes.length && selectedHtmlNodes.length > 16
        ? `Apply these changes to the selected HTML nodes: ${selectedHtmlNodes}`
        : '',
    ];
    const messages = [
      ...base,
      {
        role: 'user',
        content: instructions.join(' '),
      },
    ];
    return await this.completionService.extend(messages);
  }

  async buildResume(document: Express.Multer.File, url: string) {
    const profile = await this.getProfileFromFile(document);
    const posting = await this.getPostingFromUrl(url);
    const { prompt, html } = await this.compile(profile.text, posting.text);

    return {
      prompt,
      html,
    };
  }

  async compile(profile: string, posting: string) {
    const prompt =
      `
      - Use the following profile information as content ${profile}
      - Use the following job posting as content ${posting}
      ` + PromptCompileResume;

    const messages = [
      ResumeAssistantInstructions,
      {
        role: 'user',
        content: prompt,
      },
    ];
    const html = await this.completionService.extend(messages);

    return {
      prompt,
      html,
    };
  }

  async getProfileFromFile(file: Express.Multer.File) {
    this.assistantService.loadFunctionsFromArray(ResumeParserDefinitions);

    const pdf = await pdfparse(file.buffer);
    const text = pdf.text;

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

  async getPostingFromUrl(url: string): Promise<any> {
    const html = await this.scraperService.scrapeUrl(url);
    const stream = new ReadableString(html);

    const keys = [
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
    const parser = new WritableStream({
      ontext(chunks) {
        let text = '';
        try {
          text = JSON.parse(chunks);
        } catch (e) {}

        if (text) {
          if (text['props']['pageProps']['data']) {
            prompt =
              `
            Below is a list of fields that need to be extracted from a job posting. Evaluate the fields here: ${keys.join(
              ',',
            )}. Analyze the job posting data here: ${JSON.stringify(
                text['props']['pageProps']['data'],
              )}. The output should be an object with the fields as keys and the extracted values as values.` +
              PromptEvaluateJob;
          }
        }
      },
    });

    return new Promise(async (resolve, reject) => {
      stream.pipe(parser).on('finish', async () => {
        try {
          const text = await this.completionService.complete({ prompt });
          try {
            resolve({
              params: JSON.parse(text),
              text,
            });
          } catch (error) {
            const lines = text.split('\n');
            const params = {};
            for (const line of lines) {
              const [key, value] = line.split(':');
              params[key.trim()] = value;
            }
            resolve({
              params,
              text,
            });
          }
        } catch (error) {
          this.logger.error('Error completing job:', error);
          reject(error);
        }
      });
    });
  }
}

const ResumeAssistantInstructions = {
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

const PromptCompileResume = ` 
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

const PromptEvaluateJob = `If a field is not found, the value should be "Unavailable".
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

** Remember to replace these placeholders with the actual values you find in the job posting. **`;

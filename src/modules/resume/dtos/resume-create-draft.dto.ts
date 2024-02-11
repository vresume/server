import { ApiProperty } from '@nestjs/swagger';

export class ResumeCreateDraftDto {
  @ApiProperty({ description: 'The job posting to tailor the resume to' })
  posting: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'The original resume file to use as a knowledge base',
  })
  resume: Express.Multer.File;
}

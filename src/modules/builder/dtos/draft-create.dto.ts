import { ApiProperty } from '@nestjs/swagger';

export class DraftCreateDto {
  @ApiProperty({
    description: 'Extra data for the document',
    type: 'string',
  })
  extras: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'The document to upload',
  })
  document: Express.Multer.File;
}

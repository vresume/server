import { ApiProperty } from '@nestjs/swagger';
import { Document } from '@prisma/client';

export class DocumentCreateDto {
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

  @ApiProperty({ description: 'The title of the document', type: 'string' })
  title: Document['title'];

  @ApiProperty({
    description: 'The description of the document',
    type: 'string',
  })
  description: Document['description'];
}

export class DocumentVersionPatchDto {
  @ApiProperty({
    description: 'The query message of what to update',
  })
  query: string;

  @ApiProperty({
    description: 'The selected ui nodes to update',
    required: false,
  })
  selected: string;
}

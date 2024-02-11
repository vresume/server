import { ApiProperty } from '@nestjs/swagger';

export class ResumeVersionUpdateDto {
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

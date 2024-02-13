import { ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';

export class UserCreateDto {
  @ApiProperty({ description: "The user's email", type: 'string' })
  email: User['email'];

  @ApiProperty({ description: "The user's nickname", type: 'string' })
  nickname: User['nickname'];

  @ApiProperty({ description: "The user's picture", type: 'string' })
  picture: User['picture'];
}

export class UserPatchDto {
  @ApiProperty({
    description: "The user's email",
    type: 'string',
    required: false,
  })
  email: User['email'];

  @ApiProperty({
    description: "The user's nickname",
    type: 'string',
    required: false,
  })
  nickname: User['nickname'];

  @ApiProperty({
    description: "The user's picture",
    type: 'string',
    required: false,
  })
  picture: User['picture'];
}

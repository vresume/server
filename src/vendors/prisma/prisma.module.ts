import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { UserRepository } from '~/vendors/prisma/repositories/user.repository';

@Module({
  imports: [],
  providers: [PrismaService, UserRepository],
  exports: [PrismaService, UserRepository],
  controllers: [],
})
export class PrismaModule {}

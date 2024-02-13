import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { VendorsModule } from '~/vendors/vendors.module';
import { UserRepository } from '~/vendors/prisma/repositories/user.repository';

@Module({
  imports: [VendorsModule],
  providers: [UsersService, UserRepository],
  controllers: [UsersController],
})
export class UsersModule {}

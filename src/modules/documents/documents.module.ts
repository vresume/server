import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { VendorsModule } from '~/vendors/vendors.module';
import { UsersService } from '~/modules/users/users.service';
import { DocumentRepository } from '~/vendors/prisma/repositories/document.repository';
import { VersionRepository } from '~/vendors/prisma/repositories/version.repository';

@Module({
  imports: [VendorsModule],
  providers: [
    DocumentsService,
    UsersService,
    DocumentRepository,
    VersionRepository,
  ],
  controllers: [DocumentsController],
})
export class DocumentsModule {}

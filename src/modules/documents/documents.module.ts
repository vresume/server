import { Module } from '@nestjs/common';
import { DocumentsService } from '~/modules/documents/documents.service';
import { DocumentsController } from '~/modules/documents/documents.controller';
import { VendorsModule } from '~/vendors/vendors.module';
import { UsersService } from '~/modules/users/users.service';
import { DocumentRepository } from '~/vendors/prisma/repositories/document.repository';
import { VersionRepository } from '~/vendors/prisma/repositories/version.repository';
import { BuilderService } from '~/modules/builder/builder.service';

@Module({
  imports: [VendorsModule],
  providers: [
    DocumentsService,
    UsersService,
    DocumentRepository,
    VersionRepository,
    BuilderService,
  ],
  controllers: [DocumentsController],
})
export class DocumentsModule {}

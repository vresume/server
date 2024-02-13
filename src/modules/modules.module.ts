import { Module } from '@nestjs/common';
import { ResumeModule } from '~/modules/resume/resume.module';
import { BillingModule } from './billing/billing.module';
import { UsersModule } from './users/users.module';
import { DocumentsModule } from './documents/documents.module';

@Module({
  imports: [ResumeModule, BillingModule, UsersModule, DocumentsModule],
  exports: [ResumeModule, DocumentsModule],
})
export class ModulesModule {}

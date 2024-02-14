import { Module } from '@nestjs/common';
import { BillingModule } from '~/modules/billing/billing.module';
import { UsersModule } from '~/modules/users/users.module';
import { DocumentsModule } from '~/modules/documents/documents.module';

@Module({
  imports: [BillingModule, UsersModule, DocumentsModule],
  exports: [DocumentsModule],
})
export class ModulesModule {}

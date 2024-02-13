import { Module } from '@nestjs/common';
import { ResumeModule } from '~/modules/resume/resume.module';
import { BillingModule } from './billing/billing.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [ResumeModule, BillingModule, UsersModule],
  exports: [ResumeModule],
})
export class ModulesModule {}

import { Module } from '@nestjs/common';
import { ResumeModule } from '~/modules/resume/resume.module';
import { UserModule } from './user/user.module';
import { BillingModule } from './billing/billing.module';

@Module({
  imports: [ResumeModule, UserModule, BillingModule],
  exports: [ResumeModule],
})
export class ModulesModule {}

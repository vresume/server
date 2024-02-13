import { Module } from '@nestjs/common';
import { ResumeController } from '~/modules/resume/resume.controller';
import { ResumeService } from '~/modules/resume/resume.service';
import { BillingService } from '~/modules/billing/billing.service';
import { VendorsModule } from '~/vendors/vendors.module';
import { ScraperService } from '~/vendors/scraper/scraper.service';
import { OpenaiService } from '~/vendors/openai/openai.service';
import { UserRepository } from '~/vendors/prisma/repositories/user.repository';
import { DocumentRepository } from '~/vendors/prisma/repositories/document.repository';
import { ProfileRepository } from '~/vendors/prisma/repositories/profile.repository';
import { PostingRepository } from '~/vendors/prisma/repositories/posting.repository';
import { VersionRepository } from '~/vendors/prisma/repositories/version.repository';
import { UsersService } from '../users/users.service';

@Module({
  imports: [VendorsModule],
  providers: [
    ResumeService,
    ScraperService,
    OpenaiService,
    UserRepository,
    DocumentRepository,
    ProfileRepository,
    PostingRepository,
    VersionRepository,
    BillingService,
    UsersService,
  ],
  controllers: [ResumeController],
  exports: [ResumeService],
})
export class ResumeModule {}

import { Module } from '@nestjs/common';
import { ScraperModule } from '~/vendors/scraper/scraper.module';
import { ResendModule } from '~/vendors/resend/resend.module';
import { OpenaiModule } from '~/vendors/openai/openai.module';
import { PrismaModule } from '~/vendors/prisma/prisma.module';

@Module({
  imports: [ScraperModule, ResendModule, OpenaiModule, PrismaModule],
  exports: [ScraperModule, ResendModule, OpenaiModule, PrismaModule],
})
export class VendorsModule {}

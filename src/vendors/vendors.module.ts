import { Module } from '@nestjs/common';
import { ScraperModule } from '~/vendors/scraper/scraper.module';
import { OpenaiModule } from '~/vendors/openai/openai.module';
import { PrismaModule } from '~/vendors/prisma/prisma.module';

@Module({
  imports: [ScraperModule, OpenaiModule, PrismaModule],
  exports: [ScraperModule, OpenaiModule, PrismaModule],
})
export class VendorsModule {}

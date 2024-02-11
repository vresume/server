import { Module } from '@nestjs/common';
import { ScraperService } from '~/vendors/scraper/scraper.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [],
      useFactory: async () => ({}),
      inject: [],
    }),
  ],
  providers: [ScraperService],
  exports: [ScraperService, HttpModule],
})
export class ScraperModule {}

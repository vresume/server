import { Module } from '@nestjs/common';
import { CompletionService } from './completion.service';
import { OpenaiService } from '~/vendors/openai/openai.service';

@Module({
  providers: [CompletionService, OpenaiService],
  exports: [CompletionService],
})
export class CompletionModule {}

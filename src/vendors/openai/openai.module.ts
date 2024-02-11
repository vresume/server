import { Module } from '@nestjs/common';
import { OpenaiService } from './openai.service';
import { AssistantModule } from './assistant/assistant.module';
import { CompletionModule } from './completion/completion.module';

@Module({
  imports: [AssistantModule, CompletionModule],
  providers: [OpenaiService],
  exports: [OpenaiService, AssistantModule, CompletionModule],
})
export class OpenaiModule {}

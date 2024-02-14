import { Module } from '@nestjs/common';
import { BuilderService } from './builder.service';
import { VendorsModule } from '~/vendors/vendors.module';
import { AssistantService } from '~/vendors/openai/assistant/assistant.service';
import { CompletionService } from '~/vendors/openai/completion/completion.service';
import { BuilderController } from './builder.controller';

@Module({
  imports: [VendorsModule],
  providers: [BuilderService, AssistantService, CompletionService],
  controllers: [BuilderController],
})
export class BuilderModule {}

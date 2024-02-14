import { Injectable, Logger } from '@nestjs/common';
import { OpenaiService } from '~/vendors/openai/openai.service';
import OpenAI from 'openai';

@Injectable()
export class CompletionService {
  private readonly logger = new Logger(CompletionService.name);
  private readonly model: string = process.env.OPENAI_DEFAULT_MODEL;
  private readonly maxTokens: number = Number(
    process.env.OPENAI_DEFAULT_MAX_TOKENS,
  );
  private readonly openai: OpenAI;

  constructor(private readonly openaiService: OpenaiService) {
    this.openai = this.openaiService.openai;
  }

  async complete({ prompt }: { prompt: string }): Promise<string> {
    return this.openai.chat.completions
      .create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: prompt,
          },
        ],
        max_tokens: this.maxTokens,
      })
      .then((response) => response.choices[0].message.content);
  }

  async extend(messages: any): Promise<string> {
    return this.openai.chat.completions
      .create({
        model: this.model,
        messages,
        max_tokens: this.maxTokens,
      })
      .then((response) => response.choices[0].message.content);
  }
}

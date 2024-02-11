import { Injectable, Logger } from '@nestjs/common';
import { OpenaiService } from '~/vendors/openai/openai.service';
import {
  ChatCompletionCreateParamsNonStreaming,
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from 'openai/resources';
import { FunctionDefinition } from '~/vendors/openai/assistant/assistant.types';
import OpenAI from 'openai';

@Injectable()
export class AssistantService {
  private readonly logger = new Logger(AssistantService.name);
  private readonly model: string = process.env.OPENAI_DEFAULT_MODEL;
  private readonly maxTokens: number = Number(
    process.env.OPENAI_DEFAULT_MAX_TOKENS,
  );
  private functionDefinitions: FunctionDefinition[] = [];
  private readonly openai: OpenAI;

  constructor(private readonly openaiService: OpenaiService) {
    this.openai = this.openaiService.openai;
  }

  registerFunction(definition: FunctionDefinition) {
    this.functionDefinitions.push(definition);
  }

  generateTools(): ChatCompletionTool[] {
    return this.functionDefinitions.map((def) => ({
      type: 'function',
      function: def,
    }));
  }

  loadFunctionsFromArray(definitions: FunctionDefinition[]) {
    definitions.forEach((definition) => this.registerFunction(definition));
  }

  // todo:
  // Currently this always uses the first function definition assuming resume parsing
  // We need to add a way to choose the function definition to use
  async run(messages: ChatCompletionMessageParam[]) {
    const tools: ChatCompletionTool[] = this.generateTools();
    if (tools.length === 0) {
      throw new Error('No function definitions registered.');
    }

    const prompt: ChatCompletionCreateParamsNonStreaming = {
      model: this.model,
      messages,
      max_tokens: this.maxTokens,
      tools,
      tool_choice: {
        type: 'function',
        function: tools[0].function,
      },
    };

    const response = await this.openai.chat.completions.create(prompt);
    const completion = response.choices[0].message;

    return JSON.parse(completion.tool_calls[0].function.arguments);
  }
}

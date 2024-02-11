import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class OpenaiService {
  private readonly oai: OpenAI;

  constructor() {
    this.oai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  get openai(): OpenAI {
    return this.oai;
  }
}

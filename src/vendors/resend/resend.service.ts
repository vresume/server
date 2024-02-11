import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class ResendService {
  private readonly ctx: Resend;

  constructor() {
    this.ctx = new Resend(process.env.RESEND_API_KEY);
  }

  get emails(): Resend['emails'] {
    return this.ctx.emails;
  }
}

import { HttpException } from '@nestjs/common';

export class BillingException extends HttpException {
  constructor(message: string, status = 401) {
    super(
      {
        statusCode: status,
        message,
      },
      status,
    );
  }
}

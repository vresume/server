import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
      method: ctx.getRequest().method,

      // Add the debug information to the response in development mode
      ...(process.env.NODE_ENV === 'development' && {
        debug:
          exception instanceof HttpException
            ? exception.getResponse()
            : 'Internal server error',
      }),

      // Add the original error message to the response in production mode
      ...(process.env.NODE_ENV !== 'development' && {
        error: 'Internal server error',
      }),
    };

    httpAdapter.reply(
      ctx.getResponse(),
      { data: null, error: responseBody },
      httpStatus,
    );
  }
}

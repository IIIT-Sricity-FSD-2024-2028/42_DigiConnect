import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { appLogger } from '../utils/winston-logger';

@Catch() // Catches ALL errors
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as any)?.message ||
          (exception as any)?.message ||
          'Internal Server Error';

    const errorPayload = {
      success: false,
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // Stream directly to Winston error log
    appLogger.error(`[EXCEPTION] ${request.method} ${request.url} - Status: ${status}`, {
      ...errorPayload,
      stack: exception instanceof Error ? exception.stack : undefined,
    });

    response.status(status).json(errorPayload);
  }
}


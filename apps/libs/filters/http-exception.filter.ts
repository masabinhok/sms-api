import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

/**
 * Global HTTP Exception Filter for Gateway
 * Catches HTTP exceptions and formats them consistently for REST API responses
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // Extract error details
    const errorResponse =
      typeof exceptionResponse === 'string'
        ? { message: exceptionResponse }
        : (exceptionResponse as any);

    // Log the error
    this.logger.error(
      `HTTP Exception: ${request.method} ${request.url} - Status: ${status}`,
      errorResponse
    );

    // Format consistent error response
    const errorPayload = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: errorResponse.message || exception.message,
      error: errorResponse.error || exception.name,
      details: errorResponse.details || null,
    };

    response.status(status).json(errorPayload);
  }
}

/**
 * Global catch-all exception filter for Gateway
 * Catches any uncaught exceptions and returns a 500 error
 */
@Catch()
export class AllHttpExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllHttpExceptionsFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    // Determine status code
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Log the error
    this.logger.error(
      `Uncaught Exception: ${request.method} ${request.url}`,
      exception.stack
    );

    // Format error response
    const errorPayload = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: exception.message || 'Internal server error',
      error: exception.name || 'Error',
    };

    response.status(status).json(errorPayload);
  }
}

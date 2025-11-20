import { Catch, RpcExceptionFilter, ArgumentsHost, Logger } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { RpcException } from '@nestjs/microservices';

/**
 * Global RPC Exception Filter
 * Catches all RPC exceptions and formats them consistently
 */
@Catch(RpcException)
export class RpcValidationFilter implements RpcExceptionFilter<RpcException> {
  private readonly logger = new Logger(RpcValidationFilter.name);

  catch(exception: RpcException, host: ArgumentsHost): Observable<any> {
    const error = exception.getError();
    
    // Log the error for debugging
    this.logger.error('RPC Exception caught:', JSON.stringify(error));

    // Ensure consistent error format
    const formattedError = typeof error === 'object' 
      ? error 
      : { status: 500, message: error };

    return throwError(() => formattedError);
  }
}

/**
 * Global Exception Filter for non-RPC exceptions
 * Catches all uncaught exceptions and converts them to RPC exceptions
 */
@Catch()
export class AllExceptionsFilter implements RpcExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: any, host: ArgumentsHost): Observable<any> {
    // Log the unexpected error
    this.logger.error('Uncaught exception:', exception);

    // Convert to RPC exception format
    const error = {
      status: exception.status || 500,
      message: exception.message || 'Internal server error',
      error: exception.name || 'Error',
    };

    return throwError(() => error);
  }
}

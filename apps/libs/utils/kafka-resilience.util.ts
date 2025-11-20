import { Observable, throwError, TimeoutError } from 'rxjs';
import { timeout, catchError, retry, tap } from 'rxjs/operators';
import { Logger } from '@nestjs/common';

export interface KafkaRequestOptions {
  timeoutMs?: number;
  retries?: number;
  retryDelay?: number;
  serviceName?: string;
  operation?: string;
}

const DEFAULT_TIMEOUT = 5000; // 5 seconds
const DEFAULT_RETRIES = 2;
const DEFAULT_RETRY_DELAY = 1000; // 1 second

/**
 * Wraps Kafka requests with timeout, retry logic, and error handling
 */
export function withKafkaErrorHandling<T>(
  observable: Observable<T>,
  options: KafkaRequestOptions = {}
): Observable<T> {
  const {
    timeoutMs = DEFAULT_TIMEOUT,
    retries = DEFAULT_RETRIES,
    retryDelay = DEFAULT_RETRY_DELAY,
    serviceName = 'Microservice',
    operation = 'request'
  } = options;

  const logger = new Logger('KafkaClient');

  return observable.pipe(
    // Add timeout
    timeout(timeoutMs),
    
    // Retry logic for retriable errors
    retry({
      count: retries,
      delay: (error, retryCount) => {
        // Only retry on network/connection errors
        const isRetriable = 
          error?.name === 'TimeoutError' ||
          error?.message?.includes('ECONNREFUSED') ||
          error?.message?.includes('Kafka') ||
          error?.message?.includes('not ready');

        if (!isRetriable) {
          throw error;
        }

        logger.warn(
          `${serviceName} ${operation} failed (attempt ${retryCount}/${retries}). Retrying in ${retryDelay}ms...`
        );

        return new Observable<void>(subscriber => {
          setTimeout(() => {
            subscriber.next(undefined);
            subscriber.complete();
          }, retryDelay);
        });
      }
    }),

    // Log successful requests
    tap(() => {
      logger.debug(`${serviceName} ${operation} succeeded`);
    }),

    // Catch and transform errors
    catchError((error) => {
      if (error instanceof TimeoutError) {
        logger.error(`${serviceName} ${operation} timed out after ${timeoutMs}ms`);
        return throwError(() => ({
          status: 504,
          message: `${serviceName} request timed out`,
          name: 'TimeoutError'
        }));
      }

      logger.error(`${serviceName} ${operation} failed:`, error);
      
      // Pass through structured errors
      if (error?.status) {
        return throwError(() => error);
      }

      // Transform unstructured errors
      return throwError(() => ({
        status: 503,
        message: `${serviceName} temporarily unavailable`,
        originalError: error
      }));
    })
  );
}

/**
 * Circuit breaker state management
 */
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime: number | null = null;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private readonly logger = new Logger('CircuitBreaker');

  constructor(
    private readonly serviceName: string,
    private readonly failureThreshold: number = 5,
    private readonly resetTimeout: number = 60000 // 1 minute
  ) {}

  /**
   * Check if circuit breaker allows the request
   */
  canExecute(): boolean {
    if (this.state === 'CLOSED') {
      return true;
    }

    if (this.state === 'OPEN') {
      const now = Date.now();
      if (this.lastFailureTime && now - this.lastFailureTime >= this.resetTimeout) {
        this.logger.log(`${this.serviceName}: Circuit breaker entering HALF_OPEN state`);
        this.state = 'HALF_OPEN';
        return true;
      }
      this.logger.warn(`${this.serviceName}: Circuit breaker is OPEN, rejecting request`);
      return false;
    }

    // HALF_OPEN state - allow request to test
    return true;
  }

  /**
   * Record successful request
   */
  recordSuccess(): void {
    if (this.state === 'HALF_OPEN') {
      this.logger.log(`${this.serviceName}: Circuit breaker test successful, closing circuit`);
      this.state = 'CLOSED';
      this.failures = 0;
      this.lastFailureTime = null;
    } else if (this.state === 'CLOSED') {
      this.failures = 0;
    }
  }

  /**
   * Record failed request
   */
  recordFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.state === 'HALF_OPEN') {
      this.logger.warn(`${this.serviceName}: Circuit breaker test failed, reopening circuit`);
      this.state = 'OPEN';
    } else if (this.failures >= this.failureThreshold) {
      this.logger.error(`${this.serviceName}: Circuit breaker threshold exceeded, opening circuit`);
      this.state = 'OPEN';
    }
  }

  /**
   * Get current circuit breaker state
   */
  getState(): string {
    return this.state;
  }

  /**
   * Reset circuit breaker
   */
  reset(): void {
    this.state = 'CLOSED';
    this.failures = 0;
    this.lastFailureTime = null;
    this.logger.log(`${this.serviceName}: Circuit breaker manually reset`);
  }
}

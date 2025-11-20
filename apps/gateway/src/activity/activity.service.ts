import { Inject, Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ClientKafkaProxy } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { QueryActivityDto } from 'apps/libs/dtos/query-activity.dto';
import { withKafkaErrorHandling, CircuitBreaker } from 'apps/libs/utils/kafka-resilience.util';
import { convertRpcExceptionToHttp } from 'apps/libs/utils/kafka-error.util';
import { 
  getKafkaRequestTimeout, 
  getKafkaRetryAttempts, 
  getKafkaRetryDelay,
  getKafkaCircuitBreakerThreshold,
  getKafkaCircuitBreakerTimeout
} from 'apps/libs/config/kafka.config';

@Injectable()
export class ActivityService implements OnModuleInit {
  private readonly logger = new Logger(ActivityService.name);
  private isClientReady = false;
  private circuitBreaker: CircuitBreaker;
  private requestTimeout: number;
  private retryAttempts: number;
  private retryDelay: number;

  constructor(
    @Inject('ACTIVITY_SERVICE') private activityClient: ClientKafkaProxy,
    private configService: ConfigService
  ) {
    this.requestTimeout = getKafkaRequestTimeout(configService);
    this.retryAttempts = getKafkaRetryAttempts(configService);
    this.retryDelay = getKafkaRetryDelay(configService);
    this.circuitBreaker = new CircuitBreaker(
      'ActivityService',
      getKafkaCircuitBreakerThreshold(configService),
      getKafkaCircuitBreakerTimeout(configService)
    );
  }

  async onModuleInit() {
    try {
      this.activityClient.subscribeToResponseOf('activity.getAll');
      this.activityClient.subscribeToResponseOf('activity.getById');
      this.activityClient.subscribeToResponseOf('activity.getStats');
      await this.activityClient.connect();

      // Wait for subscriptions to be fully established
      await new Promise((resolve) => setTimeout(resolve, 1000));
      this.isClientReady = true;
      this.logger.log('Activity service client is ready');
    } catch (error) {
      this.logger.error('Failed to initialize activity service client', error.stack);
    }
  }

  private async executeWithResilience<T>(pattern: string, data: any, operation: string): Promise<T> {
    if (!this.circuitBreaker.canExecute()) {
      throw convertRpcExceptionToHttp({
        status: 503,
        message: 'Activity service circuit breaker is open'
      });
    }

    if (!this.isClientReady) {
      this.circuitBreaker.recordFailure();
      throw convertRpcExceptionToHttp({
        status: 503,
        message: 'Activity service not ready'
      });
    }

    try {
      const result = await firstValueFrom(
        withKafkaErrorHandling(
          this.activityClient.send(pattern, data),
          {
            timeoutMs: this.requestTimeout,
            retries: this.retryAttempts,
            retryDelay: this.retryDelay,
            serviceName: 'ActivityService',
            operation
          }
        )
      );
      this.circuitBreaker.recordSuccess();
      return result;
    } catch (error) {
      this.circuitBreaker.recordFailure();
      throw convertRpcExceptionToHttp(error);
    }
  }

  async getAllActivities(query: QueryActivityDto) {
    return this.executeWithResilience('activity.getAll', query, 'getAllActivities');
  }

  async getActivityById(id: string) {
    return this.executeWithResilience('activity.getById', { id }, 'getActivityById');
  }

  async getActivityStats() {
    return this.executeWithResilience('activity.getStats', {}, 'getActivityStats');
  }
}

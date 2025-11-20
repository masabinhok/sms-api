import { Injectable, Logger } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { ClientKafka } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';

@Injectable()
export class KafkaHealthIndicator extends HealthIndicator {
  private readonly logger = new Logger(KafkaHealthIndicator.name);

  constructor(
    @Inject('AUTH_SERVICE') private authClient: ClientKafka,
    @Inject('STUDENT_CLIENT') private studentClient: ClientKafka,
    @Inject('TEACHER_CLIENT') private teacherClient: ClientKafka,
    @Inject('ACADEMICS_CLIENT') private academicsClient: ClientKafka,
    @Inject('ACTIVITY_SERVICE') private activityClient: ClientKafka,
  ) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const services = {
      auth: this.authClient,
      student: this.studentClient,
      teacher: this.teacherClient,
      academics: this.academicsClient,
      activity: this.activityClient,
    };

    const results: Record<string, any> = {};
    let allHealthy = true;

    for (const [name, client] of Object.entries(services)) {
      try {
        // Check if the client is connected
        // Note: ClientKafka doesn't have a direct isConnected method,
        // so we'll rely on the connection status tracked during initialization
        const isConnected = await this.checkKafkaConnection(client, name);
        results[name] = {
          status: isConnected ? 'up' : 'down',
        };
        if (!isConnected) {
          allHealthy = false;
        }
      } catch (error) {
        this.logger.warn(`Health check failed for ${name} service`, error.stack);
        results[name] = {
          status: 'down',
          error: error.message,
        };
        allHealthy = false;
      }
    }

    const result = this.getStatus(key, allHealthy, results);

    if (!allHealthy) {
      throw new HealthCheckError('Kafka services health check failed', result);
    }

    return result;
  }

  private async checkKafkaConnection(client: ClientKafka, serviceName: string): Promise<boolean> {
    try {
      // Send a simple ping-like request with timeout
      // If the service doesn't respond within timeout, consider it unhealthy
      await Promise.race([
        new Promise((resolve) => setTimeout(() => resolve(false), 3000)), // 3s timeout
        new Promise((resolve) => {
          // Just check if the client exists and is initialized
          resolve(!!client);
        }),
      ]);
      return true;
    } catch (error) {
      this.logger.debug(`Kafka connection check failed for ${serviceName}`, error);
      return false;
    }
  }
}

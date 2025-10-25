import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafkaProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout, catchError, throwError } from 'rxjs';
import { QueryActivityDto } from 'apps/libs/dtos/query-activity.dto';

@Injectable()
export class ActivityService implements OnModuleInit {
  private isClientReady = false;

  constructor(@Inject('ACTIVITY_SERVICE') private activityClient: ClientKafkaProxy) {}

  async onModuleInit() {
    try {
      this.activityClient.subscribeToResponseOf('activity.getAll');
      this.activityClient.subscribeToResponseOf('activity.getById');
      this.activityClient.subscribeToResponseOf('activity.getStats');
      await this.activityClient.connect();

      // Wait for subscriptions to be fully established
      await new Promise((resolve) => setTimeout(resolve, 1000));
      this.isClientReady = true;
      console.log('Activity service client is ready');
    } catch (error) {
      console.error('Failed to initialize activity service client:', error);
    }
  }

  private async ensureClientReady(): Promise<void> {
    if (!this.isClientReady) {
      const maxWaitTime = 10000; // 10 seconds
      const checkInterval = 100; // 100ms
      let waitedTime = 0;

      while (!this.isClientReady && waitedTime < maxWaitTime) {
        await new Promise((resolve) => setTimeout(resolve, checkInterval));
        waitedTime += checkInterval;
      }

      if (!this.isClientReady) {
        throw new Error('Activity service client not ready');
      }
    }
  }

  async getAllActivities(query: QueryActivityDto) {
    await this.ensureClientReady();

    try {
      return await firstValueFrom(
        this.activityClient.send('activity.getAll', query).pipe(
          timeout(5000),
          catchError((err) => {
            console.error('Activity service getAll error:', err);
            return throwError(() => new Error('Failed to fetch activities'));
          })
        )
      );
    } catch (error) {
      console.error('Get all activities failed:', error.message);
      throw error;
    }
  }

  async getActivityById(id: string) {
    await this.ensureClientReady();

    try {
      return await firstValueFrom(
        this.activityClient.send('activity.getById', { id }).pipe(
          timeout(5000),
          catchError((err) => {
            console.error('Activity service getById error:', err);
            return throwError(() => new Error('Failed to fetch activity'));
          })
        )
      );
    } catch (error) {
      console.error('Get activity by ID failed:', error.message);
      throw error;
    }
  }

  async getActivityStats() {
    await this.ensureClientReady();

    try {
      return await firstValueFrom(
        this.activityClient.send('activity.getStats', {}).pipe(
          timeout(5000),
          catchError((err) => {
            console.error('Activity service getStats error:', err);
            return throwError(() => new Error('Failed to fetch activity stats'));
          })
        )
      );
    } catch (error) {
      console.error('Get activity stats failed:', error.message);
      throw error;
    }
  }
}

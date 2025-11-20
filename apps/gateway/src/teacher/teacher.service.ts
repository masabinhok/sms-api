import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafkaProxy } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { CreateTeacherProfileDto } from 'apps/libs/dtos/create-teacher-profile.dto';
import { UpdateTeacherProfileDto } from 'apps/libs/dtos/update-teacher-profile.dto';
import { QueryTeachersDto } from 'apps/libs/dtos/query-teachers.dto';
import { firstValueFrom } from 'rxjs';
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
export class TeacherService implements OnModuleInit {
  private isClientReady = false;
  private circuitBreaker: CircuitBreaker;
  private requestTimeout: number;
  private retryAttempts: number;
  private retryDelay: number;
  
  constructor(
    @Inject('TEACHER_CLIENT') private teacherClient: ClientKafkaProxy,
    private configService: ConfigService
  ){
    this.requestTimeout = getKafkaRequestTimeout(configService);
    this.retryAttempts = getKafkaRetryAttempts(configService);
    this.retryDelay = getKafkaRetryDelay(configService);
    this.circuitBreaker = new CircuitBreaker(
      'TeacherService',
      getKafkaCircuitBreakerThreshold(configService),
      getKafkaCircuitBreakerTimeout(configService)
    );
  }

  async onModuleInit(){
    try {
      this.teacherClient.subscribeToResponseOf('teacher.createProfile');
      this.teacherClient.subscribeToResponseOf('teacher.getAll');
      this.teacherClient.subscribeToResponseOf('teacher.getById');
      this.teacherClient.subscribeToResponseOf('teacher.update');
      this.teacherClient.subscribeToResponseOf('teacher.delete');
      this.teacherClient.subscribeToResponseOf('teacher.getStats');
      await this.teacherClient.connect();
      
      // Wait a bit for subscriptions to be fully established
      await new Promise(resolve => setTimeout(resolve, 1000));
      this.isClientReady = true;
      console.log('Teacher service client is ready');
    } catch (error) {
      console.error('Failed to initialize teacher service client:', error);
    }
  }

  private async executeWithResilience<T>(pattern: string, data: any, operation: string): Promise<T> {
    if (!this.circuitBreaker.canExecute()) {
      throw convertRpcExceptionToHttp({
        status: 503,
        message: 'Teacher service circuit breaker is open'
      });
    }

    if (!this.isClientReady) {
      this.circuitBreaker.recordFailure();
      throw convertRpcExceptionToHttp({
        status: 503,
        message: 'Teacher service not ready'
      });
    }

    try {
      const result = await firstValueFrom(
        withKafkaErrorHandling(
          this.teacherClient.send(pattern, data),
          {
            timeoutMs: this.requestTimeout,
            retries: this.retryAttempts,
            retryDelay: this.retryDelay,
            serviceName: 'TeacherService',
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

  async createTeacherProfile(data: CreateTeacherProfileDto) {
    return this.executeWithResilience('teacher.createProfile', data, 'createTeacherProfile');
  }

  async getAllTeachers(query: QueryTeachersDto) {
    return this.executeWithResilience('teacher.getAll', query, 'getAllTeachers');
  }

  async getTeacherById(id: string) {
    return this.executeWithResilience('teacher.getById', id, 'getTeacherById');
  }

  async updateTeacher(id: string, updateTeacherProfileDto: UpdateTeacherProfileDto, userId: string, userRole: string) {
    return this.executeWithResilience('teacher.update', { id, updateTeacherProfileDto, userId, userRole }, 'updateTeacher');
  }

  async deleteTeacher(id: string, userId: string, userRole: string) {
    return this.executeWithResilience('teacher.delete', { id, userId, userRole }, 'deleteTeacher');
  }

  async getTeacherStats() {
    return this.executeWithResilience('teacher.getStats', {}, 'getTeacherStats');
  }
}

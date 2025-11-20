import { Inject, Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ClientKafkaProxy } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { CreateStudentProfileDto } from 'apps/libs/dtos/create-student-profile.dto';
import { UpdateStudentProfileDto } from 'apps/libs/dtos/update-student-profile.dto';
import { QueryStudentsDto } from 'apps/libs/dtos/query-students.dto';
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
export class StudentService implements OnModuleInit {
  private readonly logger = new Logger(StudentService.name);
  private isClientReady = false;
  private circuitBreaker: CircuitBreaker;
  private requestTimeout: number;
  private retryAttempts: number;
  private retryDelay: number;
  
  constructor(
    @Inject('STUDENT_CLIENT') private studentClient: ClientKafkaProxy,
    private configService: ConfigService
  ){
    this.requestTimeout = getKafkaRequestTimeout(configService);
    this.retryAttempts = getKafkaRetryAttempts(configService);
    this.retryDelay = getKafkaRetryDelay(configService);
    this.circuitBreaker = new CircuitBreaker(
      'StudentService',
      getKafkaCircuitBreakerThreshold(configService),
      getKafkaCircuitBreakerTimeout(configService)
    );
  }

  async onModuleInit(){
    try {
      this.studentClient.subscribeToResponseOf('student.createProfile');
      this.studentClient.subscribeToResponseOf('student.getAll');
      this.studentClient.subscribeToResponseOf('student.getById');
      this.studentClient.subscribeToResponseOf('student.update');
      this.studentClient.subscribeToResponseOf('student.delete');
      this.studentClient.subscribeToResponseOf('student.getStats');
      await this.studentClient.connect();
      
      // Wait a bit for subscriptions to be fully established
      await new Promise(resolve => setTimeout(resolve, 1000));
      this.isClientReady = true;
      this.logger.log('Student service client is ready');
    } catch (error) {
      this.logger.error('Failed to initialize student service client', error.stack);
    }
  }

  private async executeWithResilience<T>(pattern: string, data: any, operation: string): Promise<T> {
    if (!this.circuitBreaker.canExecute()) {
      throw convertRpcExceptionToHttp({
        status: 503,
        message: 'Student service circuit breaker is open'
      });
    }

    if (!this.isClientReady) {
      this.circuitBreaker.recordFailure();
      throw convertRpcExceptionToHttp({
        status: 503,
        message: 'Student service not ready'
      });
    }

    try {
      const result = await firstValueFrom(
        withKafkaErrorHandling(
          this.studentClient.send(pattern, data),
          {
            timeoutMs: this.requestTimeout,
            retries: this.retryAttempts,
            retryDelay: this.retryDelay,
            serviceName: 'StudentService',
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

  async createStudentProfile(createStudentProfileDto: CreateStudentProfileDto){
    return this.executeWithResilience('student.createProfile', createStudentProfileDto, 'createStudentProfile');
  }

  async getAllStudents(query: QueryStudentsDto) {
    return this.executeWithResilience('student.getAll', query, 'getAllStudents');
  }

  async getStudentById(id: string) {
    return this.executeWithResilience('student.getById', id, 'getStudentById');
  }

  async updateStudent(id: string, updateStudentProfileDto: UpdateStudentProfileDto, userId: string, userRole: string) {
    return this.executeWithResilience('student.update', { id, updateStudentProfileDto, userId, userRole }, 'updateStudent');
  }

  async deleteStudent(id: string, userId: string, userRole: string) {
    return this.executeWithResilience('student.delete', { id, userId, userRole }, 'deleteStudent');
  }

  async getStudentStats() {
    return this.executeWithResilience('student.getStats', {}, 'getStudentStats');
  }
}

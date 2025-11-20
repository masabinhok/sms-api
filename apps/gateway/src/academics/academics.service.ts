import { Inject, Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ClientKafkaProxy } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { UpdateSchoolDto } from 'apps/libs/dtos/update-school.dto';
import { CreateClassDto } from 'apps/libs/dtos/create-class.dto';
import { UpdateClassDto } from 'apps/libs/dtos/update-class.dto';
import { CreateSubjectDto } from 'apps/libs/dtos/create-subject.dto';
import { UpdateSubjectDto } from 'apps/libs/dtos/update-subject.dto';
import { AssignSubjectsToClassDto } from 'apps/libs/dtos/assign-subjects-to-class.dto';
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
export class AcademicsService implements OnModuleInit {
    private readonly logger = new Logger(AcademicsService.name);
    private isClientReady = false;
    private circuitBreaker: CircuitBreaker;
    private requestTimeout: number;
    private retryAttempts: number;
    private retryDelay: number;

    constructor(
        @Inject('ACADEMICS_CLIENT') private academicsClient: ClientKafkaProxy,
        private configService: ConfigService
    ) {
        this.requestTimeout = getKafkaRequestTimeout(configService);
        this.retryAttempts = getKafkaRetryAttempts(configService);
        this.retryDelay = getKafkaRetryDelay(configService);
        this.circuitBreaker = new CircuitBreaker(
            'AcademicsService',
            getKafkaCircuitBreakerThreshold(configService),
            getKafkaCircuitBreakerTimeout(configService)
        );
    }

    async onModuleInit(){
        try {
            // School patterns
            this.academicsClient.subscribeToResponseOf('school.get');
            this.academicsClient.subscribeToResponseOf('school.update');
            
            // Class patterns
            this.academicsClient.subscribeToResponseOf('class.create');
            this.academicsClient.subscribeToResponseOf('class.getAll');
            this.academicsClient.subscribeToResponseOf('class.getById');
            this.academicsClient.subscribeToResponseOf('class.update');
            this.academicsClient.subscribeToResponseOf('class.delete');
            
            // Subject patterns
            this.academicsClient.subscribeToResponseOf('subject.create');
            this.academicsClient.subscribeToResponseOf('subject.getAll');
            this.academicsClient.subscribeToResponseOf('subject.getById');
            this.academicsClient.subscribeToResponseOf('subject.update');
            this.academicsClient.subscribeToResponseOf('subject.delete');
            
            // Class-Subject assignment patterns
            this.academicsClient.subscribeToResponseOf('class.assignSubjects');
            this.academicsClient.subscribeToResponseOf('class.getSubjects');
            this.academicsClient.subscribeToResponseOf('class.removeSubject');
            
            await this.academicsClient.connect();

            await new Promise(resolve => setTimeout(resolve, 1000))
            this.isClientReady = true;
            this.logger.log('Academics service client is ready');
        } catch (error) {
            this.logger.error('Error initializing Academics service client', error.stack);
        }
    }

    private async executeWithResilience<T>(pattern: string, data: any, operation: string): Promise<T> {
        if (!this.circuitBreaker.canExecute()) {
            throw convertRpcExceptionToHttp({
                status: 503,
                message: 'Academics service circuit breaker is open'
            });
        }

        if (!this.isClientReady) {
            this.circuitBreaker.recordFailure();
            throw convertRpcExceptionToHttp({
                status: 503,
                message: 'Academics service not ready'
            });
        }

        try {
            const result = await firstValueFrom(
                withKafkaErrorHandling(
                    this.academicsClient.send(pattern, data),
                    {
                        timeoutMs: this.requestTimeout,
                        retries: this.retryAttempts,
                        retryDelay: this.retryDelay,
                        serviceName: 'AcademicsService',
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

    // ==================== SCHOOL METHODS ====================

    async getSchool(){
        return this.executeWithResilience('school.get', {}, 'getSchool');
    }

    async updateSchool(updateSchoolDto: UpdateSchoolDto){
        return this.executeWithResilience('school.update', updateSchoolDto, 'updateSchool');
    }

    // ==================== CLASS METHODS ====================

    async createClass(createClassDto: CreateClassDto) {
        return this.executeWithResilience('class.create', createClassDto, 'createClass');
    }

    async getAllClasses(academicYear?: string, isActive?: boolean) {
        return this.executeWithResilience('class.getAll', { academicYear, isActive }, 'getAllClasses');
    }

    async getClassById(id: string) {
        return this.executeWithResilience('class.getById', { id }, 'getClassById');
    }

    async updateClass(updateClassDto: UpdateClassDto) {
        return this.executeWithResilience('class.update', updateClassDto, 'updateClass');
    }

    async deleteClass(id: string) {
        return this.executeWithResilience('class.delete', { id }, 'deleteClass');
    }

    // ==================== SUBJECT METHODS ====================

    async createSubject(createSubjectDto: CreateSubjectDto) {
        return this.executeWithResilience('subject.create', createSubjectDto, 'createSubject');
    }

    async getAllSubjects(category?: string, isActive?: boolean) {
        return this.executeWithResilience('subject.getAll', { category, isActive }, 'getAllSubjects');
    }

    async getSubjectById(id: string) {
        return this.executeWithResilience('subject.getById', { id }, 'getSubjectById');
    }

    async updateSubject(updateSubjectDto: UpdateSubjectDto) {
        return this.executeWithResilience('subject.update', updateSubjectDto, 'updateSubject');
    }

    async deleteSubject(id: string) {
        return this.executeWithResilience('subject.delete', { id }, 'deleteSubject');
    }

    // ==================== CLASS-SUBJECT ASSIGNMENT METHODS ====================

    async assignSubjectsToClass(assignDto: AssignSubjectsToClassDto) {
        return this.executeWithResilience('class.assignSubjects', assignDto, 'assignSubjectsToClass');
    }

    async getClassSubjects(classId: string) {
        return this.executeWithResilience('class.getSubjects', { classId }, 'getClassSubjects');
    }

    async removeSubjectFromClass(classId: string, subjectId: string) {
        return this.executeWithResilience('class.removeSubject', { classId, subjectId }, 'removeSubjectFromClass');
    }
}

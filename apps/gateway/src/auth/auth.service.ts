import { Inject, Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from 'apps/libs/dtos/login.dto';
import { ClientKafkaProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { PasswordChangeDto } from 'apps/libs/dtos/password-change.dto';
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
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);
  private isClientReady = false;
  private circuitBreaker: CircuitBreaker;
  private requestTimeout: number;
  private retryAttempts: number;
  private retryDelay: number;

  constructor(
    @Inject('AUTH_SERVICE') private authClient: ClientKafkaProxy,
    private configService: ConfigService
  ) {
    this.requestTimeout = getKafkaRequestTimeout(configService);
    this.retryAttempts = getKafkaRetryAttempts(configService);
    this.retryDelay = getKafkaRetryDelay(configService);
    this.circuitBreaker = new CircuitBreaker(
      'AuthService',
      getKafkaCircuitBreakerThreshold(configService),
      getKafkaCircuitBreakerTimeout(configService)
    );
  }

  async onModuleInit(){
    try {
      this.authClient.subscribeToResponseOf('user.login');
      this.authClient.subscribeToResponseOf('user.refresh');
      this.authClient.subscribeToResponseOf('user.logout');
      this.authClient.subscribeToResponseOf('admin.createProfile');
      this.authClient.subscribeToResponseOf('user.changePassword');
      this.authClient.subscribeToResponseOf('admin.delete');
      this.authClient.subscribeToResponseOf('admin.list');
      this.authClient.subscribeToResponseOf('admin.update');
      this.authClient.subscribeToResponseOf('admin.get');
      this.authClient.subscribeToResponseOf('user.me');
      this.authClient.subscribeToResponseOf('user.forgot-password');
      await this.authClient.connect();
      
      // Wait a bit for subscriptions to be fully established
      await new Promise(resolve => setTimeout(resolve, 1000));
      this.isClientReady = true;
      this.logger.log('Auth service client is ready');
    } catch (error) {
      this.logger.error('Failed to initialize auth service client', error.stack);
    }
  }

  private async executeWithResilience<T>(pattern: string, data: any, operation: string): Promise<T> {
    if (!this.circuitBreaker.canExecute()) {
      throw convertRpcExceptionToHttp({
        status: 503,
        message: 'Auth service circuit breaker is open'
      });
    }

    if (!this.isClientReady) {
      this.circuitBreaker.recordFailure();
      throw convertRpcExceptionToHttp({
        status: 503,
        message: 'Auth service not ready'
      });
    }

    try {
      const result = await firstValueFrom(
        withKafkaErrorHandling(
          this.authClient.send(pattern, data),
          {
            timeoutMs: this.requestTimeout,
            retries: this.retryAttempts,
            retryDelay: this.retryDelay,
            serviceName: 'AuthService',
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

  async handleUserLogin(loginDto: LoginDto): Promise<{accessToken: string, refreshToken: string, passwordChangeCount: number}> {
    return this.executeWithResilience('user.login', loginDto, 'handleUserLogin');
  }

  async handleForgotPassword(username: string) {
    return this.executeWithResilience('user.forgot-password', { username }, 'handleForgotPassword');
  }

  async handleUserLogout(userId: string): Promise<{success: boolean, message: string}> {
    return this.executeWithResilience('user.logout', { userId }, 'handleUserLogout');
  }

  async handleUserRefresh(userId: string, token: string): Promise<{accessToken: string, refreshToken: string}> {
    return this.executeWithResilience('user.refresh', { userId, token }, 'handleUserRefresh');
  }

  async createAdminProfile(data: {name: string, email: string}, actorUserId?: string, actorUsername?: string, actorRole?: string) {
    return this.executeWithResilience('admin.createProfile', { ...data, actorUserId, actorUsername, actorRole }, 'createAdminProfile');
  }

  // Admin management proxy methods
  async listAdmins(params: { page?: number; limit?: number; search?: string }) {
    return this.executeWithResilience('admin.list', params, 'listAdmins');
  }

  async getAdmin(id: string) {
    return this.executeWithResilience('admin.get', { id }, 'getAdmin');
  }

  async updateAdmin(id: string, data: any, actorUserId?: string, actorUsername?: string, actorRole?: string) {
    return this.executeWithResilience('admin.update', { id, data, actorUserId, actorUsername, actorRole }, 'updateAdmin');
  }

  async deleteAdmin(id: string, actorUserId?: string, actorUsername?: string, actorRole?: string) {
    return this.executeWithResilience('admin.delete', { id, actorUserId, actorUsername, actorRole }, 'deleteAdmin');
  }

  async handlePasswordChange(data: PasswordChangeDto, userId: string){
    return this.executeWithResilience('user.changePassword', { ...data, userId }, 'handlePasswordChange');
  }

  async getMe(userId: string){
    return this.executeWithResilience('user.me', { userId }, 'getMe');
  }

}

import { Inject, Injectable, UnauthorizedException, BadRequestException, ForbiddenException, OnModuleInit } from '@nestjs/common';
import { LoginDto } from 'apps/libs/dtos/login.dto';
import {  ClientKafkaProxy,  } from '@nestjs/microservices';
import { firstValueFrom, timeout, catchError } from 'rxjs';
import { throwError } from 'rxjs';
import { PasswordChangeDto } from 'apps/libs/dtos/password-change.dto';

@Injectable()
export class AuthService implements OnModuleInit {
  private isClientReady = false;

  constructor(@Inject('AUTH_SERVICE') private authClient: ClientKafkaProxy) {}

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
      await this.authClient.connect();
      
      // Wait a bit for subscriptions to be fully established
      await new Promise(resolve => setTimeout(resolve, 1000));
      this.isClientReady = true;
      console.log('Auth service client is ready');
    } catch (error) {
      console.error('Failed to initialize auth service client:', error);
    }
  }

  private convertRpcExceptionToHttp(error: any): Error {
    // Check if it's an RPC exception with status and message
    if (error && typeof error === 'object' && error.status && error.message) {
      switch (error.status) {
        case 400:
          return new BadRequestException(error.message);
        case 401:
          return new UnauthorizedException(error.message);
        case 403:
          return new ForbiddenException(error.message);
        default:
          return new Error(error.message || 'Service error');
      }
    }
    
    // If it's not a structured RPC exception, return a generic error
    return new Error('Authentication service unavailable');
  }

  private async ensureClientReady(): Promise<void> {
    if (!this.isClientReady) {
      // Wait for client to be ready, with a maximum wait time
      const maxWaitTime = 10000; // 10 seconds
      const checkInterval = 100; // 100ms
      let waitedTime = 0;
      
      while (!this.isClientReady && waitedTime < maxWaitTime) {
        await new Promise(resolve => setTimeout(resolve, checkInterval));
        waitedTime += checkInterval;
      }
      
      if (!this.isClientReady) {
        throw new Error('Auth service client not ready');
      }
    }
  }

  async handleUserLogin(loginDto: LoginDto): Promise<{accessToken: string, refreshToken: string, passwordChangeCount: number}> {
    await this.ensureClientReady();
    
    try {
      return await firstValueFrom(
        this.authClient.send('user.login', loginDto).pipe(
          timeout(5000), // 5 second timeout
          catchError(err => {
            console.error('Auth service login error:', err);
            const httpError = this.convertRpcExceptionToHttp(err);
            return throwError(() => httpError);
          })
        )
      );
    } catch (error) {
      console.error('Login failed:', error.message);
      throw error; // Re-throw the converted HTTP exception
    }
  }

  async handleUserLogout(userId: string): Promise<{success: boolean, message: string}> {
    await this.ensureClientReady();
    
    try {
      return await firstValueFrom(
        this.authClient.send('user.logout', { userId }).pipe(
          timeout(5000),
          catchError(err => {
            console.error('Auth service logout error:', err);
            const httpError = this.convertRpcExceptionToHttp(err);
            return throwError(() => httpError);
          })
        )
      );
    } catch (error) {
      console.error('Logout failed:', error.message);
      throw error; // Re-throw the converted HTTP exception
    }
  }

  async handleUserRefresh(userId: string, token: string): Promise<{accessToken: string, refreshToken: string}> {
    await this.ensureClientReady();
    
    try {
      return await firstValueFrom(
        this.authClient.send('user.refresh', {userId, token}).pipe(
          timeout(5000),
          catchError(err => {
            console.error('Auth service refresh error:', err);
            const httpError = this.convertRpcExceptionToHttp(err);
            return throwError(() => httpError);
          })
        )
      );
    } catch (error) {
      console.error('Token refresh failed:', error.message);
      throw error; // Re-throw the converted HTTP exception
    }
  }

  async createAdminProfile(data: {name: string, email: string}) {
    await this.ensureClientReady();
    
    try {
      return await firstValueFrom(
        this.authClient.send('admin.createProfile', data).pipe(
          timeout(5000),
          catchError(err => {
            console.error('Auth service admin creation error:', err);
            const httpError = this.convertRpcExceptionToHttp(err);
            return throwError(() => httpError);
          })
        )
      );
    } catch (error) {
      console.error('Admin creation failed:', error.message);
      throw error; // Re-throw the converted HTTP exception
    }
  }

  // Admin management proxy methods
  async listAdmins(params: { page?: number; limit?: number; search?: string }) {
    await this.ensureClientReady();
    try {
      return await firstValueFrom(
        this.authClient.send('admin.list', params).pipe(
          timeout(5000),
          catchError(err => {
            console.error('Auth service admin.list error:', err);
            const httpError = this.convertRpcExceptionToHttp(err);
            return throwError(() => httpError);
          })
        )
      );
    } catch (error) {
      console.error('admin.list failed:', error.message);
      throw error;
    }
  }

  async getAdmin(id: string) {
    await this.ensureClientReady();
    try {
      return await firstValueFrom(
        this.authClient.send('admin.get', { id }).pipe(
          timeout(5000),
          catchError(err => {
            console.error('Auth service admin.get error:', err);
            const httpError = this.convertRpcExceptionToHttp(err);
            return throwError(() => httpError);
          })
        )
      );
    } catch (error) {
      console.error('admin.get failed:', error.message);
      throw error;
    }
  }

  async updateAdmin(id: string, data: any) {
    await this.ensureClientReady();
    try {
      return await firstValueFrom(
        this.authClient.send('admin.update', { id, data }).pipe(
          timeout(5000),
          catchError(err => {
            console.error('Auth service admin.update error:', err);
            const httpError = this.convertRpcExceptionToHttp(err);
            return throwError(() => httpError);
          })
        )
      );
    } catch (error) {
      console.error('admin.update failed:', error.message);
      throw error;
    }
  }

  async deleteAdmin(id: string) {
    await this.ensureClientReady();
    try {
      return await firstValueFrom(
        this.authClient.send('admin.delete', { id }).pipe(
          timeout(5000),
          catchError(err => {
            console.error('Auth service admin.delete error:', err);
            const httpError = this.convertRpcExceptionToHttp(err);
            return throwError(() => httpError);
          })
        )
      );
    } catch (error) {
      console.error('admin.delete failed:', error.message);
      throw error;
    }
  }

  async handlePasswordChange(data: PasswordChangeDto, userId: string){
    await this.ensureClientReady();
    
    try {
      return await firstValueFrom(
        this.authClient.send('user.changePassword', {...data, userId}).pipe(
          timeout(5000),
          catchError(err => {
            console.error('Auth service password change error:', err);
            const httpError = this.convertRpcExceptionToHttp(err);
            return throwError(() => httpError);
          })
        )
      );
    } catch (error) {
      console.error('Password change failed:', error.message);
      throw error; // Re-throw the converted HTTP exception
    }
  }

  async getMe(userId: string){
    await this.ensureClientReady();

    try {
      return await firstValueFrom(
        this.authClient.send('user.me', {userId}).pipe(
          timeout(5000), 
          catchError(err => {
            console.error('Auth service get profile error:', err);
            const httpError = this.convertRpcExceptionToHttp(err);
            return throwError(() => httpError) ;
          })
        )
      )
    }
      catch(error){
        console.error('Fetching user profile failed',error);
        throw error;  //rethrow the converted http exception.
      }
  }

}

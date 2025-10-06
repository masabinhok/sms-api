import { Inject, Injectable } from '@nestjs/common';
import { LoginDto } from 'apps/libs/dtos/login.dto';
import {  ClientKafkaProxy,  } from '@nestjs/microservices';
import { firstValueFrom, timeout, catchError } from 'rxjs';
import { throwError } from 'rxjs';
import { PasswordChangeDto } from 'apps/libs/dtos/password-change.dto';

@Injectable()
export class AuthService {

  constructor(@Inject('AUTH_SERVICE') private authClient: ClientKafkaProxy) {}

  async onModuleInit(){
    this.authClient.subscribeToResponseOf('user.login')
    this.authClient.subscribeToResponseOf('user.refresh')
    this.authClient.subscribeToResponseOf('user.logout')
    this.authClient.subscribeToResponseOf('admin.createProfile')
    this.authClient.subscribeToResponseOf('user.changePassword')
    await this.authClient.connect();
  }

  async handleUserLogin(loginDto: LoginDto): Promise<{accessToken: string, refreshToken: string}> {
    try {
      return await firstValueFrom(
        this.authClient.send('user.login', loginDto).pipe(
          timeout(5000), // 5 second timeout
          catchError(err => {
            console.error('Auth service login error:', err);
            return throwError(() => new Error('Authentication service unavailable'));
          })
        )
      );
    } catch (error) {
      console.error('Login failed:', error.message);
      throw new Error('Login failed: ' + error.message);
    }
  }

  async handleUserLogout(userId: string): Promise<{success: boolean, message: string}> {
    try {
      return await firstValueFrom(
        this.authClient.send('user.logout', { userId }).pipe(
          timeout(5000),
          catchError(err => {
            console.error('Auth service logout error:', err);
            return throwError(() => new Error('Authentication service unavailable'));
          })
        )
      );
    } catch (error) {
      console.error('Logout failed:', error.message);
      throw new Error('Logout failed: ' + error.message);
    }
  }

  async handleUserRefresh(userId: string, token: string): Promise<{accessToken: string, refreshToken: string}> {
    try {
      return await firstValueFrom(
        this.authClient.send('user.refresh', {userId, token}).pipe(
          timeout(5000),
          catchError(err => {
            console.error('Auth service refresh error:', err);
            return throwError(() => new Error('Authentication service unavailable'));
          })
        )
      );
    } catch (error) {
      console.error('Token refresh failed:', error.message);
      throw new Error('Token refresh failed: ' + error.message);
    }
  }

  async createAdminProfile(data: {name: string, email: string}) {
    try {
      return await firstValueFrom(
        this.authClient.send('admin.createProfile', data).pipe(
          timeout(5000),
          catchError(err => {
            console.error('Auth service admin creation error:', err);
            return throwError(() => new Error('Authentication service unavailable'));
          })
        )
      );
    } catch (error) {
      console.error('Admin creation failed:', error.message);
      throw new Error('Admin creation failed: ' + error.message);
    }
  }

  async handlePasswordChange(data: PasswordChangeDto, userId: string){
    return this.authClient.send('user.changePassword', {...data, userId})

  }
}

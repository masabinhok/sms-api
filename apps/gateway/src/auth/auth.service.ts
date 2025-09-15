import { Inject, Injectable } from '@nestjs/common';
import { LoginDto } from 'apps/libs/dtos/login.dto';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthService {

  constructor(@Inject('AUTH_SERVICE') private authClient: ClientProxy) {}

  async handleUserLogin(loginDto: LoginDto): Promise<{accessToken: string, refreshToken: string}> {
    return firstValueFrom(this.authClient.send('user.login', loginDto));
  }

  async handleUserLogout(userId: string){
    return firstValueFrom(this.authClient.send('user.logout', { userId }));
  }

  async handleUserRefresh(userId: string, token: string): Promise<{accessToken: string, refreshToken: string}> {
    return firstValueFrom(this.authClient.send('user.refresh', {userId, token}));
  } 
}

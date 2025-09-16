import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // Extract token from Authorization header OR cookies
    let token: string | undefined;
    
    // Try Authorization header first (Bearer token)
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7); // Remove 'Bearer ' prefix
    } 
    
    // Fallback to cookies if no Authorization header
    else if (request.cookies && request.cookies['access_token']) {
      token = request.cookies['access_token'];
    }

    if (!token || typeof token !== 'string') {
      console.log('No access token found in Authorization header or cookies');
      throw new UnauthorizedException('Access Token Missing or malformed');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.config.get<string>('JWT_ACCESS_SECRET'),
      });

      request.user = payload;
      console.log('User authenticated:', request.user);
      return true;
    } catch (error) {
      console.log('Token verification failed:', error.message);
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }
}

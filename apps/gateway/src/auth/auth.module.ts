import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

@Module({
  imports : [
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport:  Transport.TCP,
        options: {
          port: 3001
        }
      }
    ])
  ],
  controllers: [AuthController],
  providers: [AuthService, ConfigService],
})
export class AuthModule {}

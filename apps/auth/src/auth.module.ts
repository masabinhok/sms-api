import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaService } from './prisma.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env'
        }),
    JwtModule.register({
      global: true,
    }),
    ClientsModule.register([
      {
        name: 'EMAIL_SERVICE',
        transport: Transport.TCP,
        options: {
          port: 3004
        }
      }
    ])
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, ConfigService],
})
export class AuthModule {}

import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaService } from './prisma.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Partitioners } from 'kafkajs';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import config from '../../libs/config/config';
import { getKafkaBrokers } from '../../libs/config/kafka.config';

@Module({
  imports: [
    ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env',
          load: [config]
        }),
    JwtModule.register({
      global: true,
    }),
    ClientsModule.registerAsync([
      {
        name: 'EMAIL_SERVICE',
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'email-client-from-auth',
              brokers: getKafkaBrokers(configService)
            }, 
            consumer: {
              groupId: 'email-consumer-from-auth'
            },
            producer: {
              createPartitioner: Partitioners.LegacyPartitioner
            }
          }
        })
      },
      {
        name: 'ACTIVITY_SERVICE',
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'activity-client-from-auth',
              brokers: getKafkaBrokers(configService)
            }, 
            consumer: {
              groupId: 'activity-consumer-from-auth'
            },
            producer: {
              createPartitioner: Partitioners.LegacyPartitioner
            }
          }
        })
      }
    ])
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, ConfigService],
})
export class AuthModule {}

import { Module } from '@nestjs/common';
import { AcademicsController } from './academics.controller';
import { AcademicsService } from './academics.service';
import { PrismaService } from './prisma.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Partitioners } from 'kafkajs';
import config from '../../libs/config/config';
import { getKafkaBrokers } from '../../libs/config/kafka.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
      envFilePath: '.env',
      load: [config]
    }),
    ClientsModule.registerAsync([
      {
        name: 'AUTH_SERVICE',
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'auth-client-from-student',
              brokers: getKafkaBrokers(configService)
            }, 
            consumer: {
              groupId: 'auth-consumer-from-student'
            },
            producer: {
              createPartitioner: Partitioners.LegacyPartitioner
            }
          }
        })
      }
    ])
  ],
  controllers: [AcademicsController],
  providers: [AcademicsService, PrismaService, ConfigService],
})
export class AcademicsModule {}

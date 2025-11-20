import { Module } from '@nestjs/common';
import { AcademicsService } from './academics.service';
import { AcademicsController } from './academics.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Partitioners } from 'kafkajs';
import { ConfigService } from '@nestjs/config';
import { getKafkaBrokers } from '../../../libs/config/kafka.config';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'ACADEMICS_CLIENT',
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'academics-client',
              brokers: getKafkaBrokers(configService)
            },
            consumer: {
              groupId: 'academics-consumer-client'
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
  providers: [AcademicsService],
})
export class AcademicsModule {}

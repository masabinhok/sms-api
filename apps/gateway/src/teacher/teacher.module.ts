import { Module } from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { TeacherController } from './teacher.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Partitioners } from 'kafkajs';
import { ConfigService } from '@nestjs/config';
import { getKafkaBrokers } from '../../../libs/config/kafka.config';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'TEACHER_CLIENT',
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'teacher-client',
              brokers: getKafkaBrokers(configService)
            }, 
            consumer: {
              groupId: 'teacher-consumer-client'
            },
            producer: {
              createPartitioner: Partitioners.LegacyPartitioner
            }
          }
        })
      }
    ])
  ],
  controllers: [TeacherController],
  providers: [TeacherService, ConfigService],
})
export class TeacherModule {}

import { Module } from '@nestjs/common';
import { StudentController } from './student.controller';
import { StudentService } from './student.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Partitioners } from 'kafkajs';
import { ConfigService } from '@nestjs/config';
import { getKafkaBrokers } from '../../../libs/config/kafka.config';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'STUDENT_CLIENT',
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'student-client',
              brokers: getKafkaBrokers(configService)
            }, 
            consumer: {
              groupId: 'student-consumer-client'
            },
            producer: {
              createPartitioner: Partitioners.LegacyPartitioner
            }
          }
        })
      }
    ])
  ],
  controllers: [StudentController],
  providers: [StudentService, ConfigService]
})
export class StudentModule {}

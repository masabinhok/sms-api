import { Module } from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { TeacherController } from './teacher.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Partitioners } from 'kafkajs';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'TEACHER_CLIENT',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'teacher-client',
            brokers: ['localhost:9094', 'localhost:9095', 'localhost:9096']
          }, 
          consumer: {
            groupId: 'teacher-consumer-client'
          },
          producer: {
            createPartitioner: Partitioners.LegacyPartitioner
          }
        }
      }
    ])
  ],
  controllers: [TeacherController],
  providers: [TeacherService, ConfigService],
})
export class TeacherModule {}

import { Module } from '@nestjs/common';
import { StudentController } from './student.controller';
import { StudentService } from './student.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Partitioners } from 'kafkajs';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'STUDENT_CLIENT',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'student-client',
            brokers: ['localhost:9094', 'localhost:9095', 'localhost:9096']
          }, 
          consumer: {
            groupId: 'student-consumer-client'
          },
          producer: {
            createPartitioner: Partitioners.LegacyPartitioner
          }
        }
      }
    ])
  ],
  controllers: [StudentController],
  providers: [StudentService, ConfigService]
})
export class StudentModule {}

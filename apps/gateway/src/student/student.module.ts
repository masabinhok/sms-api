import { Module } from '@nestjs/common';
import { StudentController } from './student.controller';
import { StudentService } from './student.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'STUDENT_CLIENT',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'student',
            brokers: ['localhost:9092']
          }, 
          consumer: {
            groupId: 'student-consumer'
          }
        }
      }
    ])
  ],
  controllers: [StudentController],
  providers: [StudentService, ConfigService]
})
export class StudentModule {}

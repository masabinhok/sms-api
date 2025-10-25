import { Module } from '@nestjs/common';
import { StudentController } from './student.controller';
import { StudentService } from './student.service';
import { PrismaService } from './prisma.service';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Partitioners } from 'kafkajs';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'auth-client-from-student',
            brokers: ['localhost:9094', 'localhost:9095', 'localhost:9096']
          }, 
          consumer: {
            groupId: 'auth-consumer-from-student'
          },
          producer: {
            createPartitioner: Partitioners.LegacyPartitioner
          }
        }
      },
      {
        name: 'ACADEMICS_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'academics-client-from-student',
            brokers: ['localhost:9094', 'localhost:9095', 'localhost:9096']
          },
          consumer: {
            groupId: 'academics-consumer-from-student'
          },
          producer: {
            createPartitioner: Partitioners.LegacyPartitioner
          }
        }
      }
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env'
    }),
  ],
  controllers: [StudentController],
  providers: [StudentService, PrismaService],
})
export class StudentModule {}

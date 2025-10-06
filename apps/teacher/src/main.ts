import { NestFactory } from '@nestjs/core';
import { TeacherModule } from './teacher.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Partitioners } from 'kafkajs';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(TeacherModule, {
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'teacher-server',
        brokers: ['localhost:9094', 'localhost:9095', 'localhost:9096']
      }, 
      consumer: {
        groupId: 'teacher-server-server'
      },
      producer: {
        createPartitioner: Partitioners.LegacyPartitioner
      }
    }
  });
  await app.listen();
}
bootstrap();

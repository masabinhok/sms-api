import { NestFactory } from '@nestjs/core';
import { StudentModule } from './student.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Partitioners } from 'kafkajs';


async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(StudentModule, {
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'student-server',
        brokers: ['localhost:9094', 'localhost:9095', 'localhost:9096']
      }, 
      consumer: {
        groupId: 'student-server-server'
      },
      producer: {
        createPartitioner: Partitioners.LegacyPartitioner
      }
    }
  });
  await app.listen();
}
bootstrap();

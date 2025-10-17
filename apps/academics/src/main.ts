import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Partitioners } from 'kafkajs';
import { AcademicsModule } from './academics.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AcademicsModule, {
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'academics-server',
        brokers: ['localhost:9094', 'localhost:9095', 'localhost:9096']
      }, 
      consumer: {
        groupId: 'academics-server'
      },
      producer: {
        createPartitioner: Partitioners.LegacyPartitioner
      }
    }
  });
  await app.listen();
}
bootstrap();

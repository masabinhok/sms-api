import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Partitioners } from 'kafkajs';
import { ActivityModule } from './activity.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(ActivityModule, {
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'activity-server',
        brokers: ['localhost:9094', 'localhost:9095', 'localhost:9096']
      }, 
      consumer: {
        groupId: 'activity-server-server'
      },
      producer: {
        createPartitioner: Partitioners.LegacyPartitioner
      }
    }
  });
  await app.listen();
}
bootstrap();

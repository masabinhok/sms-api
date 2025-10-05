import { NestFactory } from '@nestjs/core';
import { EmailModule } from './email.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(EmailModule, {
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'email',
        brokers: ['localhost:9092']
      }, 
      consumer: {
        groupId: 'email-consumer'
      }
    }
  });
  await app.listen();
}
bootstrap();

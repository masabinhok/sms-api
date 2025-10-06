import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AuthModule, {
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'auth-server',
                    brokers: ['localhost:9094', 'localhost:9095', 'localhost:9096']
      }, 
      consumer: {
        groupId: 'auth-consumer-server'
      }
    }
  });
  await app.listen();
}
bootstrap();

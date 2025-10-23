import { NestFactory } from '@nestjs/core';
import { AcademicsModule } from './academics.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Partitioners } from '@nestjs/microservices/external/kafka.interface';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AcademicsModule, {
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'academics-server',
        brokers: ['localhost:9094', 'localhost:9095', 'localhost:9096']
      },
      consumer: {
        groupId: 'academics-server-server'
      },
      producer: {
        createPartitioner: Partitioners.LegacyPartitioner 
      }
    }
  });
  await app.listen();
}
bootstrap();

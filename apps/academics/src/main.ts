import { NestFactory } from '@nestjs/core';
import { AcademicsModule } from './academics.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Partitioners } from 'kafkajs';
import { ConfigService } from '@nestjs/config';
import { getKafkaBrokers } from '../../libs/config/kafka.config';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(AcademicsModule);
  const configService = appContext.get(ConfigService);
  
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AcademicsModule, {
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'academics-server',
        brokers: getKafkaBrokers(configService)
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

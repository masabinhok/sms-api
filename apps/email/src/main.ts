import { NestFactory } from '@nestjs/core';
import { EmailModule } from './email.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Partitioners } from 'kafkajs';
import { ConfigService } from '@nestjs/config';
import { getKafkaBrokers } from '../../libs/config/kafka.config';
import { RpcValidationFilter, AllExceptionsFilter } from 'apps/libs/filters';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(EmailModule);
  const configService = appContext.get(ConfigService);
  
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(EmailModule, {
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'email-server',
        brokers: getKafkaBrokers(configService)
      }, 
      consumer: {
        groupId: 'email-server-server'
      },
      producer: {
        createPartitioner: Partitioners.LegacyPartitioner
      }
    }
  });

  // Apply global exception filters for consistent error handling
  app.useGlobalFilters(new RpcValidationFilter(), new AllExceptionsFilter());

  await app.listen();
}
bootstrap();

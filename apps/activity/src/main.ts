import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Partitioners } from 'kafkajs';
import { ActivityModule } from './activity.module';
import { ConfigService } from '@nestjs/config';
import { getKafkaBrokers } from '../../libs/config/kafka.config';
import { RpcValidationFilter, AllExceptionsFilter } from 'apps/libs/filters';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(ActivityModule);
  const configService = appContext.get(ConfigService);
  
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(ActivityModule, {
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'activity-server',
        brokers: getKafkaBrokers(configService)
      }, 
      consumer: {
        groupId: 'activity-server-server'
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

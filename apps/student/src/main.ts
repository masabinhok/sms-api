import { NestFactory } from '@nestjs/core';
import { StudentModule } from './student.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Partitioners } from 'kafkajs';
import { ConfigService } from '@nestjs/config';
import { getKafkaBrokers } from '../../libs/config/kafka.config';
import { RpcValidationFilter, AllExceptionsFilter } from 'apps/libs/filters';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(StudentModule);
  const configService = appContext.get(ConfigService);
  
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(StudentModule, {
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'student-server',
        brokers: getKafkaBrokers(configService)
      }, 
      consumer: {
        groupId: 'student-server-server'
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

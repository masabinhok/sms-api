import { NestFactory } from '@nestjs/core';
import { TeacherModule } from './teacher.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Partitioners } from 'kafkajs';
import { ConfigService } from '@nestjs/config';
import { getKafkaBrokers } from '../../libs/config/kafka.config';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(TeacherModule);
  const configService = appContext.get(ConfigService);
  
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(TeacherModule, {
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'teacher-server',
        brokers: getKafkaBrokers(configService)
      }, 
      consumer: {
        groupId: 'teacher-server-server'
      },
      producer: {
        createPartitioner: Partitioners.LegacyPartitioner
      }
    }
  });
  await app.listen();
}
bootstrap();

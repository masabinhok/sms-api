import { NestFactory } from '@nestjs/core';
import { TeacherModule } from './teacher.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(TeacherModule, {
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'teacher',
        brokers: ['localhost:9092']
      }, 
      consumer: {
        groupId: 'teacher-consumer'
      }
    }
  });
  await app.listen();
}
bootstrap();

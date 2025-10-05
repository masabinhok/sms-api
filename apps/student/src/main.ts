import { NestFactory } from '@nestjs/core';
import { StudentModule } from './student.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';


async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(StudentModule, {
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'student',
        brokers: ['localhost:9092']
      }, 
      consumer: {
        groupId: 'student-consumer'
      }
    }
  });
  await app.listen();
}
bootstrap();

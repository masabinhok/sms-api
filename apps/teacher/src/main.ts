import { NestFactory } from '@nestjs/core';
import { TeacherModule } from './teacher.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(TeacherModule, {
    transport: Transport.TCP,
    options: {
      port: 3003
    }
  });
  await app.listen();
}
bootstrap();

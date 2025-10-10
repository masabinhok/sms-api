import { NestFactory } from '@nestjs/core';
import { GatewayModule } from './gateway.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser'
import { SwaggerModule } from '@nestjs/swagger';
import { 
  gatewaySwaggerConfig, 
  swaggerDocumentOptions, 
  swaggerUiOptions 
} from 'apps/libs/config/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(GatewayModule);

  // Swagger Documentation Setup
  const document = SwaggerModule.createDocument(app, gatewaySwaggerConfig, swaggerDocumentOptions);
  SwaggerModule.setup('api/docs', app, document, swaggerUiOptions);

  // Enable global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove properties that don't have decorators
      forbidNonWhitelisted: true, // Throw error if non-whitelisted properties are sent
      transform: true, // Automatically transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true, // Automatically convert types
      },
    }),
  );

  app.use(cookieParser());

  // Enable CORS for frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:4000',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

# Centralized Configuration Module

## Overview

This directory contains the centralized configuration for the SMS API microservices architecture.

## Files

### `config.ts`
Main configuration file that loads environment variables for:
- JWT authentication settings
- Kafka broker configuration

### `kafka.config.ts`
Kafka-specific configuration helpers that provide:
- `getKafkaBrokers()` - Returns configured Kafka broker addresses
- `getKafkaClientId()` - Returns configured Kafka client ID

## Usage

### In Module Files

```typescript
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule } from '@nestjs/microservices';
import config from '../../libs/config/config';
import { getKafkaBrokers } from '../../libs/config/kafka.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [config]
    }),
    ClientsModule.registerAsync([
      {
        name: 'SERVICE_NAME',
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'your-client-id',
              brokers: getKafkaBrokers(configService)
            },
            // ... other options
          }
        })
      }
    ])
  ]
})
export class YourModule {}
```

### In Main.ts Files

```typescript
import { ConfigService } from '@nestjs/config';
import { getKafkaBrokers } from '../../libs/config/kafka.config';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(YourModule);
  const configService = appContext.get(ConfigService);
  
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(YourModule, {
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'your-server-id',
        brokers: getKafkaBrokers(configService)
      },
      // ... other options
    }
  });
  await app.listen();
}
```

## Environment Variables

### Kafka Configuration

Add these variables to your `.env` file:

```bash
# Comma-separated list of Kafka broker addresses
KAFKA_BROKERS=localhost:9094,localhost:9095,localhost:9096

# Kafka Client ID (optional, defaults to 'sms-api')
KAFKA_CLIENT_ID=sms-api
```

### Environment-Specific Examples

**Development:**
```bash
KAFKA_BROKERS=localhost:9094,localhost:9095,localhost:9096
```

**Staging:**
```bash
KAFKA_BROKERS=kafka-staging-1.example.com:9092,kafka-staging-2.example.com:9092
```

**Production:**
```bash
KAFKA_BROKERS=kafka1.prod.example.com:9092,kafka2.prod.example.com:9092,kafka3.prod.example.com:9092
```

## Benefits

1. **Single Source of Truth**: Kafka brokers are configured in one place
2. **Environment Flexibility**: Easy to switch between dev/staging/prod environments
3. **No Code Changes**: Deploy to different environments without modifying code
4. **Type Safety**: Configuration is typed and validated
5. **Easy Maintenance**: Update Kafka brokers in `.env` file only

## Migration

All microservices have been updated to use this centralized configuration:
- ✅ academics
- ✅ auth
- ✅ activity
- ✅ email
- ✅ student
- ✅ teacher
- ✅ gateway (all modules: academics, auth, activity, student, teacher)

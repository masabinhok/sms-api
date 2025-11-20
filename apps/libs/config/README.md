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

# Kafka Error Handling & Resilience Configuration
KAFKA_REQUEST_TIMEOUT=5000              # Request timeout in ms (default: 5000)
KAFKA_RETRY_ATTEMPTS=2                  # Number of retry attempts (default: 2)
KAFKA_RETRY_DELAY=1000                  # Delay between retries in ms (default: 1000)
KAFKA_CIRCUIT_BREAKER_THRESHOLD=5       # Failures before circuit opens (default: 5)
KAFKA_CIRCUIT_BREAKER_TIMEOUT=60000     # Circuit reset timeout in ms (default: 60000)
```

### Environment-Specific Examples

**Development:**
```bash
KAFKA_BROKERS=localhost:9094,localhost:9095,localhost:9096
KAFKA_REQUEST_TIMEOUT=5000
KAFKA_RETRY_ATTEMPTS=2
```

**Staging:**
```bash
KAFKA_BROKERS=kafka-staging-1.example.com:9092,kafka-staging-2.example.com:9092
KAFKA_REQUEST_TIMEOUT=10000
KAFKA_RETRY_ATTEMPTS=3
KAFKA_CIRCUIT_BREAKER_THRESHOLD=3
```

**Production:**
```bash
KAFKA_BROKERS=kafka1.prod.example.com:9092,kafka2.prod.example.com:9092,kafka3.prod.example.com:9092
KAFKA_REQUEST_TIMEOUT=8000
KAFKA_RETRY_ATTEMPTS=3
KAFKA_RETRY_DELAY=2000
KAFKA_CIRCUIT_BREAKER_THRESHOLD=10
KAFKA_CIRCUIT_BREAKER_TIMEOUT=120000
```

## Error Handling & Resilience

The configuration now includes comprehensive error handling utilities:

### Features

1. **Automatic Timeouts**: All Kafka requests have configurable timeouts to prevent hanging requests
2. **Smart Retries**: Failed requests are automatically retried with exponential backoff
3. **Circuit Breaker**: Prevents cascading failures by temporarily stopping requests to failing services
4. **Proper HTTP Exceptions**: RPC errors are converted to appropriate HTTP exceptions
5. **Detailed Logging**: All failures are logged with context for debugging

### How It Works

**Timeouts**: Each request has a maximum execution time. If exceeded, the request fails gracefully.

**Retries**: Transient failures (network issues, timeouts) trigger automatic retries with delays between attempts.

**Circuit Breaker**: 
- **CLOSED** (normal): All requests pass through
- **OPEN** (failing): After threshold failures, all requests are rejected immediately
- **HALF_OPEN** (testing): After timeout period, one request is allowed to test if service recovered

### Error Types Handled

- Connection refused (ECONNREFUSED)
- Network timeouts (ETIMEDOUT)
- Service unavailable (503)
- Request timeouts (408/504)
- Kafka-specific errors
- General RPC exceptions

## Benefits

1. **Single Source of Truth**: Kafka brokers are configured in one place
2. **Environment Flexibility**: Easy to switch between dev/staging/prod environments
3. **No Code Changes**: Deploy to different environments without modifying code
4. **Type Safety**: Configuration is typed and validated
5. **Easy Maintenance**: Update Kafka brokers in `.env` file only
6. **Resilient Communication**: Automatic retry and circuit breaker prevent cascading failures
7. **Better UX**: Users get proper error messages instead of hanging requests
8. **Production Ready**: Handles transient failures gracefully

## Utilities

### `kafka-error.util.ts`
- `convertRpcExceptionToHttp()`: Converts RPC errors to HTTP exceptions
- `isRetriableError()`: Determines if an error should trigger a retry

### `kafka-resilience.util.ts`
- `withKafkaErrorHandling()`: Wraps Kafka requests with timeout, retry, and error handling
- `CircuitBreaker`: Implements circuit breaker pattern for service protection

## Migration

All microservices have been updated to use this centralized configuration:
- ✅ academics - with error handling
- ✅ auth - with error handling
- ✅ activity - with error handling
- ✅ email
- ✅ student - with error handling
- ✅ teacher - with error handling
- ✅ gateway (all modules: academics, auth, activity, student, teacher) - with error handling

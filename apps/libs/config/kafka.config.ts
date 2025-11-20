import { ConfigService } from '@nestjs/config';

export const getKafkaConfig = (configService: ConfigService) => ({
  brokers: configService.get<string>('kafka.brokers') || [
    'localhost:9094',
    'localhost:9095',
    'localhost:9096',
  ],
});

export const getKafkaBrokers = (configService: ConfigService): string[] => {
  const brokers = configService.get<string[]>('kafka.brokers');
  return brokers || ['localhost:9094', 'localhost:9095', 'localhost:9096'];
};

export const getKafkaClientId = (configService: ConfigService): string => {
  return configService.get<string>('kafka.clientId') || 'sms-api';
};

export const getKafkaRequestTimeout = (configService: ConfigService): number => {
  return configService.get<number>('kafka.requestTimeout') || 5000;
};

export const getKafkaRetryAttempts = (configService: ConfigService): number => {
  return configService.get<number>('kafka.retryAttempts') || 2;
};

export const getKafkaRetryDelay = (configService: ConfigService): number => {
  return configService.get<number>('kafka.retryDelay') || 1000;
};

export const getKafkaCircuitBreakerThreshold = (configService: ConfigService): number => {
  return configService.get<number>('kafka.circuitBreakerThreshold') || 5;
};

export const getKafkaCircuitBreakerTimeout = (configService: ConfigService): number => {
  return configService.get<number>('kafka.circuitBreakerTimeout') || 60000;
};

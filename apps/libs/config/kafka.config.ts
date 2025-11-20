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

import { Module } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { ActivityController } from './activity.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Partitioners } from 'kafkajs';
import { ConfigService } from '@nestjs/config';
import { getKafkaBrokers } from '../../../libs/config/kafka.config';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'ACTIVITY_SERVICE',
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'activity-client',
              brokers: getKafkaBrokers(configService),
            },
            consumer: {
              groupId: 'activity-client-consumer',
            },
            producer: {
              createPartitioner: Partitioners.LegacyPartitioner,
            },
          },
        })
      },
    ]),
  ],
  controllers: [ActivityController],
  providers: [ActivityService],
  exports: [ActivityService],
})
export class ActivityModule {}

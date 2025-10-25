import { Module } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { ActivityController } from './activity.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Partitioners } from 'kafkajs';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'ACTIVITY_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'activity-client',
            brokers: ['localhost:9094', 'localhost:9095', 'localhost:9096'],
          },
          consumer: {
            groupId: 'activity-client-consumer',
          },
          producer: {
            createPartitioner: Partitioners.LegacyPartitioner,
          },
        },
      },
    ]),
  ],
  controllers: [ActivityController],
  providers: [ActivityService],
  exports: [ActivityService],
})
export class ActivityModule {}

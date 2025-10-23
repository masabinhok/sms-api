import { Module } from '@nestjs/common';
import { AcademicsService } from './academics.service';
import { AcademicsController } from './academics.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Partitioners } from 'kafkajs';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'ACADEMICS_CLIENT',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'academics-client',
            brokers: ['localhost:9094', 'localhost:9095', 'localhost:9096']
          },
          consumer: {
            groupId: 'academics-consumer-client'
          }, 
          producer: {
            createPartitioner: Partitioners.LegacyPartitioner
          }
        }
      }
    ])
  ],
  controllers: [AcademicsController],
  providers: [AcademicsService],
})
export class AcademicsModule {}

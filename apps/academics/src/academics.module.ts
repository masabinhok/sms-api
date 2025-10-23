import { Module } from '@nestjs/common';
import { AcademicsController } from './academics.controller';
import { AcademicsService } from './academics.service';
import { PrismaService } from './prisma.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Partitioners } from 'kafkajs';

@Module({
  imports: [
     ClientsModule.register([
          {
            name: 'AUTH_SERVICE',
            transport: Transport.KAFKA,
            options: {
              client: {
                clientId: 'auth-client-from-student',
                brokers: ['localhost:9094', 'localhost:9095', 'localhost:9096']
              }, 
              consumer: {
                groupId: 'auth-consumer-from-student'
              },
              producer: {
                createPartitioner: Partitioners.LegacyPartitioner
              }
            }
          }
        ]),
    ConfigModule.forRoot({
      isGlobal: true, 
      envFilePath: '.env' 
    })
  ],
  controllers: [AcademicsController],
  providers: [AcademicsService, PrismaService, ConfigService],
})
export class AcademicsModule {}

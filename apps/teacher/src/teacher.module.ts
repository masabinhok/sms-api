import { Module } from '@nestjs/common';
import { TeacherController } from './teacher.controller';
import { TeacherService } from './teacher.service';
import { PrismaService } from './prisma.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Partitioners } from 'kafkajs';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
        name: 'AUTH_SERVICE',
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'auth-client-from-teacher',
              brokers: getKafkaBrokers(configService)
            }, 
            consumer: {
              groupId: 'auth-consumer-from-teacher'
            },
            producer: {
              createPartitioner: Partitioners.LegacyPartitioner
            }
          }
        })
      },
      {
        name: 'ACADEMICS_SERVICE',
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'academics-client-from-teacher',
              brokers: getKafkaBrokers(configService)
            },
            consumer: {
              groupId: 'academics-consumer-from-teacher'
            },
            producer: {
              createPartitioner: Partitioners.LegacyPartitioner
            }
          }
        })
      },
      {
        name: 'ACTIVITY_SERVICE',
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'activity-client-from-teacher',
              brokers: getKafkaBrokers(configService)
            },
            consumer: {
              groupId: 'activity-consumer-from-teacher'
            },
            producer: {
              createPartitioner: Partitioners.LegacyPartitioner
            }
          }
        })
      }
    ]),
  ],
  controllers: [TeacherController],
  providers: [TeacherService, PrismaService],
})
export class TeacherModule {}

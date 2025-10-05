import { Module } from '@nestjs/common';
import { TeacherController } from './teacher.controller';
import { TeacherService } from './teacher.service';
import { PrismaService } from './prisma.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env'
    }),
    ClientsModule.register([
          {
            name: 'AUTH_SERVICE',
            transport: Transport.KAFKA,
            options: {
              client: {
                clientId: 'auth',
                brokers: ['localhost:9092']
              }, 
              consumer: {
                groupId: 'auth-consumer'
              }
            }
          }
        ]),
  ],
  controllers: [TeacherController],
  providers: [TeacherService, PrismaService],
})
export class TeacherModule {}

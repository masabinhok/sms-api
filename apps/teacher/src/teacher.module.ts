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
                clientId: 'auth-client-from-teacher',
                            brokers: ['localhost:9094', 'localhost:9095', 'localhost:9096']
              }, 
              consumer: {
                groupId: 'auth-consumer-from-teacher'
              }
            }
          }
        ]),
  ],
  controllers: [TeacherController],
  providers: [TeacherService, PrismaService],
})
export class TeacherModule {}

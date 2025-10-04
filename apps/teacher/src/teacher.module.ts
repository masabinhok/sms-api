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
            transport: Transport.TCP,
            options: {
              port: 3001
            }
          }
        ]),
  ],
  controllers: [TeacherController],
  providers: [TeacherService, PrismaService],
})
export class TeacherModule {}

import { Module } from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { TeacherController } from './teacher.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'TEACHER_CLIENT',
        transport: Transport.TCP,
        options: {
          port: 3003
        }
      }
    ])
  ],
  controllers: [TeacherController],
  providers: [TeacherService],
})
export class TeacherModule {}

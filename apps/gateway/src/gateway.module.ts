import { Module } from '@nestjs/common';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { StudentModule } from './student/student.module';
import { TeacherModule } from './teacher/teacher.module';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

@Module({
  imports: [StudentModule, TeacherModule, AuthModule,
     JwtModule.register({
          global: true,
        }),
  ],
  controllers: [GatewayController],
  providers: [
    GatewayService,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class GatewayModule {}

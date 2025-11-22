import { Module } from '@nestjs/common';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { StudentModule } from './student/student.module';
import { TeacherModule } from './teacher/teacher.module';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AcademicsModule } from './academics/academics.module';
import { ActivityModule } from './activity/activity.module';
import { HealthModule } from './health/health.module';
import { PublicModule } from './public/public.module';

@Module({
  imports: [StudentModule, TeacherModule, AuthModule,
       ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env'
        }),
     JwtModule.register({
          global: true,
        }),
     AcademicsModule,
     ActivityModule,
     HealthModule,
     PublicModule,
        
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

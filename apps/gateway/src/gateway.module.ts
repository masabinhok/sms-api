import { Module } from '@nestjs/common';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { StudentModule } from './student/student.module';
import { TeacherModule } from './teacher/teacher.module';

@Module({
  imports: [StudentModule, TeacherModule],
  controllers: [GatewayController],
  providers: [GatewayService],
})
export class GatewayModule {}

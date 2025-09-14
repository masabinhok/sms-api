import { Module } from '@nestjs/common';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { StudentModule } from './student/student.module';

@Module({
  imports: [StudentModule],
  controllers: [GatewayController],
  providers: [GatewayService],
})
export class GatewayModule {}

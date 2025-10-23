import { Module } from '@nestjs/common';
import { AcademicsController } from './academics.controller';
import { AcademicsService } from './academics.service';

@Module({
  imports: [],
  controllers: [AcademicsController],
  providers: [AcademicsService],
})
export class AcademicsModule {}

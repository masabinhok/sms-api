import { Controller, Get } from '@nestjs/common';
import { AcademicsService } from './academics.service';

@Controller()
export class AcademicsController {
  constructor(private readonly academicsService: AcademicsService) {}

  @Get()
  getHello(): string {
    return this.academicsService.getHello();
  }
}

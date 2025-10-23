import { Injectable } from '@nestjs/common';

@Injectable()
export class AcademicsService {
  getHello(): string {
    return 'Hello World!';
  }
}

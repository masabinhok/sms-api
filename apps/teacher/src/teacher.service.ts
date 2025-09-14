import { Injectable } from '@nestjs/common';

@Injectable()
export class TeacherService {
  getHello(): string {
    return 'Hello World!';
  }
}

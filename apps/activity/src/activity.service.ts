import { Injectable } from '@nestjs/common';

@Injectable()
export class ActivityService {
  getHello(): string {
    return 'Hello World!';
  }
}

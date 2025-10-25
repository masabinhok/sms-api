import { Test, TestingModule } from '@nestjs/testing';
import { ActivityController } from './activity.controller';
import { ActivityService } from './activity.service';

describe('ActivityController', () => {
  let activityController: ActivityController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ActivityController],
      providers: [ActivityService],
    }).compile();

    activityController = app.get<ActivityController>(ActivityController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(activityController.getHello()).toBe('Hello World!');
    });
  });
});

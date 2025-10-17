import { Test, TestingModule } from '@nestjs/testing';
import { AcademicsController } from './academics.controller';
import { AcademicsService } from './academics.service';

describe('AcademicsController', () => {
  let academicsController: AcademicsController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AcademicsController],
      providers: [AcademicsService],
    }).compile();

    academicsController = app.get<AcademicsController>(AcademicsController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(academicsController.getHello()).toBe('Hello World!');
    });
  });
});

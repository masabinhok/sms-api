import { Test, TestingModule } from '@nestjs/testing';
import { TeacherController } from './teacher.controller';
import { TeacherService } from './teacher.service';

describe('TeacherController', () => {
  let teacherController: TeacherController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [TeacherController],
      providers: [TeacherService],
    }).compile();

    teacherController = app.get<TeacherController>(TeacherController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(teacherController.getHello()).toBe('Hello World!');
    });
  });
});

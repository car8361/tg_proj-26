import { Test, TestingModule } from '@nestjs/testing';
import { ObjectController } from './object.controller.js';
import { ObjectService } from './object.service.js';

describe('ObjectController', () => {
  let controller: ObjectController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ObjectController],
      providers: [ObjectService],
    }).compile();

    controller = module.get<ObjectController>(ObjectController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { RelationsController } from './relations.controller.js';
import { RelationsService } from './relations.service.js';

describe('RelationsController', () => {
  let controller: RelationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RelationsController],
      providers: [RelationsService],
    }).compile();

    controller = module.get<RelationsController>(RelationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

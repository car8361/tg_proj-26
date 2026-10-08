import { Module } from '@nestjs/common';
import { RelationsService } from './relations.service.js';
import { RelationsController } from './relations.controller.js';

@Module({
  controllers: [RelationsController],
  providers: [RelationsService],
})
export class RelationsModule {}

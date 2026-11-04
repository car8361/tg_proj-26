import { Module } from '@nestjs/common';
import { ObjectService } from './object.service.js';
import { ObjectController } from './object.controller.js';

@Module({
  controllers: [ObjectController],
  providers: [ObjectService],
})
export class ObjectModule {}

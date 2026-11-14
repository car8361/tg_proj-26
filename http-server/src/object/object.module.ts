import { Module } from '@nestjs/common';
import { ObjectService } from './object.service.js';
@Module({
  providers: [ObjectService],
})
export class ObjectModule {}

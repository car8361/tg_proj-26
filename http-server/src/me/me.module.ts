import { Module } from '@nestjs/common';
import { MeService } from './me.service.js';
import { MeController } from './me.controller.js';

@Module({
  controllers: [MeController],
  providers: [MeService],
})
export class MeModule {}

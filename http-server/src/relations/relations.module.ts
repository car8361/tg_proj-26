import { Module } from '@nestjs/common';
import { RelationsService } from './relations.service.js';
import { RelationsController } from './relations.controller.js';
import {SocketGateway} from "../socket/socket.gateway.js";

@Module({
  controllers: [RelationsController],
  providers: [RelationsService, SocketGateway],
})
export class RelationsModule {}

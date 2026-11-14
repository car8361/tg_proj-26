import { Module } from '@nestjs/common';
import { MeService } from './me.service.js';
import { MeController } from './me.controller.js';
import {ObjectService} from "../object/object.service.js";
import {SocketGateway} from "../socket/socket.gateway.js";

@Module({
  controllers: [MeController],
  providers: [MeService, ObjectService, SocketGateway],
})
export class MeModule {}

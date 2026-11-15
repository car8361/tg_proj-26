import { Module } from '@nestjs/common';
import { ChatsService } from './chats.service.js';
import { ChatsController } from './chats.controller.js';
import { SocketGateway } from '../socket/socket.gateway.js';
import {ObjectService} from "../object/object.service.js";

@Module({
  controllers: [ChatsController],
  providers: [ChatsService, SocketGateway, ObjectService],
})
export class ChatsModule {}

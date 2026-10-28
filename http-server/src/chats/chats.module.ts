import { Module } from '@nestjs/common';
import { ChatsService } from './chats.service.js';
import { ChatsController } from './chats.controller.js';
import { SocketGateway } from '../socket/socket.gateway.js';

@Module({
  controllers: [ChatsController],
  providers: [ChatsService, SocketGateway],
})
export class ChatsModule {}

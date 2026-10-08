import { Module } from '@nestjs/common';
import { ChatsService } from './chats.service.js';
import { ChatsController } from './chats.controller.js';
import { ChatsGateway } from './chats.gateway.js';

@Module({
  controllers: [ChatsController],
  providers: [ChatsService, ChatsGateway],
})
export class ChatsModule {}

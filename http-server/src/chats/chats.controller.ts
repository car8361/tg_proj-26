import {Controller, Post} from '@nestjs/common';
import { ChatsService } from './chats.service.js';

@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Post("/message")
  async message() {
    
  }
}

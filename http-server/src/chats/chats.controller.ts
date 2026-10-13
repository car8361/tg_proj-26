import {Body, Controller, Delete, Get, Patch, Post, Req, UseGuards} from '@nestjs/common';
import { ChatsService } from './chats.service.js';
import { MessageDto } from "./dto/chat.dto.js";
import { IsMessageOwner } from "./chats.guard.js";
import {SessionVerified} from "../auth/auth.guard.js";
import type { Request } from 'express';

@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Post("/message/:messageId")
  @UseGuards(SessionVerified)
  async postMessage(@Req() req: Request, @Body() body: MessageDto) {
    const userId = req.session.userId;
    return this.chatsService.handleMessage(userId, body.chatId, body.message);
  }

  @Delete("/message")
  async delMessage() {

  }

  @Patch("/message")
  @UseGuards(IsMessageOwner)
  async patchMessage() {

  }

  @Get("/message")
  async getMessages() {

  }
}

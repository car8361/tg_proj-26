import {Body, Controller, Delete, Get, Patch, Post, Req, UseGuards} from '@nestjs/common';
import { ChatsService } from './chats.service.js';
import { MessageDto } from "./dto/chat.dto.js";
import { IsMessageOwner } from "./chats.guard.js";
import {SessionVerified} from "../auth/auth.guard.js";
import type { Request } from 'express';
import {SessionUserId} from "../common/decorators/session-user-id/session-user-id.decorator.js";

@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Post("/message/:messageId")
  @UseGuards(SessionVerified)
  async postMessage(@Body() body: MessageDto, @SessionUserId() userId: bigint) {
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

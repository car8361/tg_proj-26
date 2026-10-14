import {Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards} from '@nestjs/common';
import { ChatsService } from './chats.service.js';
import {MessageDto, GetMessagesDto, PatchMessagesDto} from "./dto/chat.dto.js";
import { IsMessageOwner } from "./chats.guard.js";
import {SessionVerified} from "../auth/auth.guard.js";
import type { Request } from 'express';
import {SessionUserId} from "../common/decorators/session-user-id/session-user-id.decorator.js";
import {ParseBigintPipe} from "../common/decorators/parse-bigint-pipe/parse-bigint-pipe.decorator.js";

@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Post("/message")
  @UseGuards(SessionVerified)
  async postMessage(@Body() body: MessageDto, @SessionUserId() userId: bigint) {
    return this.chatsService.handleMessage(userId, body.chatId, body.message);
  }

  @Delete("/message/:messageId")
  @UseGuards(IsMessageOwner)
  async delMessage(@Param('messageId', ParseBigintPipe) messageId: bigint) {
    return await this.chatsService.delMessage(messageId);
  }

  @Patch("/message/:messageId")
  @UseGuards(IsMessageOwner)
  async patchMessage(
      @Body() body: PatchMessagesDto,
      @Param('messageId', ParseBigintPipe) messageId: bigint,
      @SessionUserId() userId: bigint
  ) {
    const newMessage = body.message;
    await this.chatsService.updMessage(userId, messageId, newMessage)
  }

  @Get("/message")
  async getMessages(@Body() body: GetMessagesDto) {
    const { chatId, messageId } = body;
    const amount = 50;
    return await this.chatsService.getMessages(chatId, messageId, amount);
  }
}

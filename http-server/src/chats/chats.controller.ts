import {Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards} from '@nestjs/common';
import { ChatsService } from './chats.service.js';
import {MessageDto, GetMessagesDto, PatchMessagesDto, UpdateChatDto} from "./dto/chat.dto.js";
import {IsChatOwner, IsMessageOwner} from "./chats.guard.js";
import {SessionVerified} from "../auth/auth.guard.js";
import {SessionUserId} from "../common/decorators/session-user-id/session-user-id.decorator.js";
import {ParseBigintPipe} from "../common/decorators/parse-bigint-pipe/parse-bigint-pipe.decorator.js";

@Controller('chats')
@UseGuards(SessionVerified)
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Post("/message")
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

  @Post("/")
  async createChat(@SessionUserId() userId: bigint) {
    return await this.chatsService.createChat(userId);
  }

  @Patch("/:chatId")
  @UseGuards(IsChatOwner)
  async updateChat(@Body() body: UpdateChatDto, @SessionUserId() userId: bigint, @Param('chatId', ParseBigintPipe) chatId: bigint) {
    let { name, newOwnerId } = body;
    return await this.chatsService.updateChat(chatId, newOwnerId ?? userId, name);
  }

  @Delete("/:chatId")
  @UseGuards(IsChatOwner)
  async deleteChat(@Param('chatId', ParseBigintPipe) chatId: bigint) {
    return await this.chatsService.deleteChat(chatId);
  }
}

import {Body, Controller, Delete, Get, Param, Patch, Post, Req, Res, UseGuards} from '@nestjs/common';
import { ChatsService } from './chats.service.js';
import {
  MessageDto,
  GetMessagesDto,
  PatchMessagesDto,
  UpdateChatDto,
  CreateMemberDto,
  UpdateMemberDto, GetMembersDto, DeleteMemberDto
} from "./dto/chat.dto.js";
import {IsChatPrivilage, IsHigherPriority, IsMessageOwner, Roles} from "./chats.guard.js";
import {SessionVerified} from "../auth/auth.guard.js";
import {SessionUserId} from "../common/decorators/session-user-id/session-user-id.decorator.js";
import {ParseBigintPipe} from "../common/decorators/parse-bigint-pipe/parse-bigint-pipe.decorator.js";
import {SessionUsername} from "../common/decorators/session-username/session-username.decorator.js";
import type { Response } from "express";

@Controller('chats')
@UseGuards(SessionVerified)
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Post("/message")
  async postMessage(@Body() body: MessageDto, @SessionUserId() userId: bigint, @SessionUsername() username: string) {
    return this.chatsService.handleMessage(userId, body.chatId, username, body.message);
  }

  @Delete("/message/:messageId")
  @UseGuards(IsMessageOwner)
  async delMessage(@Param('messageId', ParseBigintPipe) messageId: bigint) {
    return await this.chatsService.delMessage(messageId);
  }

  @Patch("/messages/:messageId")
  @UseGuards(IsMessageOwner)
  async patchMessage(
      @Body() body: PatchMessagesDto,
      @Param('messageId', ParseBigintPipe) messageId: bigint,
      @SessionUserId() userId: bigint
  ) {
    const newMessage = body.message;
    await this.chatsService.updMessage(userId, messageId, newMessage)
  }

  @Get("/messages/")
  async getMessages(@Body() body: GetMessagesDto) {
    const { chatId, messageId } = body;
    const amount = 50;
    return await this.chatsService.getMessages(chatId, messageId, amount);
  }

  @Get("/")
  async getChats(@SessionUserId() userId: bigint, @Res() res: Response) {
    const result = await this.chatsService.getChats(userId);
    return res.status(200).json({chats: result});
  }

  @Get("/chats/:chatId/members")
  @UseGuards(IsHigherPriority)
  async getMembers(@Param('chatId', ParseBigintPipe) chatId: bigint) {
    return this.chatsService.getMembers(chatId);
  }

  @Post("/chats/:chatId/members")
  @UseGuards(IsChatPrivilage)
  @Roles(["ADMIN"])
  async addMember(@Body() body: CreateMemberDto, @Param('chatId', ParseBigintPipe) chatId: bigint) {
    const { userId } = body;
    return this.chatsService.createMember(userId, chatId);
  }

  @Patch("/chats/:chatId/members")
  @UseGuards(IsHigherPriority)
  async updateMember(@Body() body: UpdateMemberDto, @Param('chatId', ParseBigintPipe) chatId: bigint) {
    const { userId, newRole } = body;
    return this.chatsService.updateMember(userId, chatId, newRole);
  }

  @Delete("/chats/:chatId/members")
  @UseGuards(IsHigherPriority)
  async delMember(@Body() body: DeleteMemberDto, @Param('chatId', ParseBigintPipe) chatId: bigint) {
    const { targetId } = body;
    return this.chatsService.deleteMember(targetId, chatId);
  }

  @Post("/")
  async createChat(@SessionUserId() userId: bigint, @Res() res: Response) {
    const result = await this.chatsService.createChat(userId);
    return res.status(200).json(JSON.stringify(result));
  }

  @Patch("/:chatId")
  @UseGuards(IsChatPrivilage)
  @Roles(["OWNER"])
  async updateChat(@Body() body: UpdateChatDto, @SessionUserId() userId: bigint, @Param('chatId', ParseBigintPipe) chatId: bigint) {
    let { name } = body;
    return await this.chatsService.updateChat(chatId, name);
  }

  @Delete("/:chatId")
  @UseGuards(IsChatPrivilage)
  @Roles(["OWNER"])
  async deleteChat(@Param('chatId', ParseBigintPipe) chatId: bigint) {
    return await this.chatsService.deleteChat(chatId);
  }
}

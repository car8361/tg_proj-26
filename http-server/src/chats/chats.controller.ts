import {Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Req, Res, UseGuards} from '@nestjs/common';
import { ChatsService } from './chats.service.js';
import {
  MessageDto,
  GetMessagesDto,
  PatchMessagesDto,
  UpdateChatDto,
  CreateMemberDto,
  UpdateMemberDto, DeleteMemberDto
} from "./dto/chat.dto.js";
import {IsChatPrivilage, IsHigherPriority, IsMessageOwner, Roles} from "./chats.guard.js";
import {SessionVerified} from "../auth/auth.guard.js";
import {SessionUserId} from "../common/decorators/session-user-id/session-user-id.decorator.js";
import {ParseBigintPipe} from "../common/decorators/parse-bigint-pipe/parse-bigint-pipe.decorator.js";
import {SessionUsername} from "../common/decorators/session-username/session-username.decorator.js";
import type { Response, Request } from "express";

@Controller('chats')
@UseGuards(SessionVerified)
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Post("/messages")
  @HttpCode(201)
  async postMessage(@Body() body: MessageDto, @SessionUserId() userId: bigint, @SessionUsername() username: string, @Res() res: Response) {
    await this.chatsService.handleMessage(userId, body.chatId, username, body.message);
    return {success: true};
  }

  @Delete("/messages/:messageId")
  @UseGuards(IsMessageOwner)
  @HttpCode(204)
  async delMessage(@Param('messageId', ParseBigintPipe) messageId: bigint) {
    await this.chatsService.delMessage(messageId);
    return {success: true};
  }

  @Patch("/messages/:messageId")
  @UseGuards(IsMessageOwner)
  @HttpCode(204)
  async patchMessage(
      @Body() body: PatchMessagesDto,
      @Param('messageId', ParseBigintPipe) messageId: bigint,
      @SessionUserId() userId: bigint,
      @Req() req: Request,
  ) {
    const newMessage = body.message;
    const username = req.session.username;
    await this.chatsService.updMessage(userId, username, messageId, newMessage)
    return {success: true};
  }

  @Get("/messages")
  @HttpCode(200)
  async getMessages(@Body() body: GetMessagesDto) {
    const { chatId, messageId } = body;
    const amount = 50;
    const messages = await this.chatsService.getMessages(chatId, messageId, amount);
    return {success: true, messages};
  }

  @Get("/:chatId/members")
  @HttpCode(200)
  @UseGuards(IsHigherPriority)
  async getMembers(@Param('chatId', ParseBigintPipe) chatId: bigint) {
    const members = this.chatsService.getMembers(chatId);
    return {success: true, members};
  }

  @Post("/:chatId/members")
  @UseGuards(IsChatPrivilage)
  @Roles(["ADMIN"])
  @HttpCode(201)
  async addMember(@Body() body: CreateMemberDto, @Param('chatId', ParseBigintPipe) chatId: bigint) {
    const { userId } = body;
    await this.chatsService.createMember(userId, chatId);
    return {success: true};
  }

  @Patch("/:chatId/members")
  @UseGuards(IsHigherPriority)
  @HttpCode(200)
  async updateMember(@Body() body: UpdateMemberDto, @Param('chatId', ParseBigintPipe) chatId: bigint) {
    const { userId, newRole } = body;
    await this.chatsService.updateMember(userId, chatId, newRole);
    return {success: true};
  }

  @Delete("/:chatId/members")
  @UseGuards(IsHigherPriority)
  @HttpCode(204)
  async delMember(@Body() body: DeleteMemberDto, @Param('chatId', ParseBigintPipe) chatId: bigint) {
    const { targetId } = body;
    await this.chatsService.deleteMember(targetId, chatId);
    return {success: true};
  }

  @Get("/")
  @HttpCode(200)
  async getChats(@SessionUserId() userId: bigint) {
    const result = await this.chatsService.getChats(userId);
    return {chats: result};
  }

  @Post("/")
  @HttpCode(200)
  async createChat(@SessionUserId() userId: bigint, @Res() res: Response) {
    await this.chatsService.createChat(userId);
    return res.status(200).json({success: true});
  }

  @Patch("/:chatId")
  @UseGuards(IsChatPrivilage)
  @Roles(["ADMIN"])
  @HttpCode(204)
  async updateChat(@Body() body: UpdateChatDto, @Param('chatId', ParseBigintPipe) chatId: bigint) {
    let { name } = body;
    await this.chatsService.updateChat(chatId, name);
    return {success: true};
  }

  @Delete("/:chatId")
  @UseGuards(IsChatPrivilage)
  @Roles(["OWNER"])
  @HttpCode(204)
  async deleteChat(@Param('chatId', ParseBigintPipe) chatId: bigint) {
    await this.chatsService.deleteChat(chatId);
    return {success: true};
  }
}

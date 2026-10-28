import {Body, Controller, Delete, Get, Param, Patch, Post, Req, Res, UseGuards} from '@nestjs/common';
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
  async postMessage(@Body() body: MessageDto, @SessionUserId() userId: bigint, @SessionUsername() username: string, @Res() res: Response) {
    await this.chatsService.handleMessage(userId, body.chatId, username, body.message);
    return res.status(201).json({success: true});
  }

  @Delete("/messages/:messageId")
  @UseGuards(IsMessageOwner)
  async delMessage(@Param('messageId', ParseBigintPipe) messageId: bigint, @Res() res: Response) {
    await this.chatsService.delMessage(messageId);
    return res.status(200).json({success: true});
  }

  @Patch("/messages/:messageId")
  @UseGuards(IsMessageOwner)
  async patchMessage(
      @Body() body: PatchMessagesDto,
      @Param('messageId', ParseBigintPipe) messageId: bigint,
      @SessionUserId() userId: bigint,
      @Req() req: Request,
      @Res() res: Response
  ) {
    const newMessage = body.message;
    const username = req.session.username;
    await this.chatsService.updMessage(userId, username, messageId, newMessage)
    return res.status(204).json({success: true});
  }

  @Get("/messages")
  async getMessages(@Body() body: GetMessagesDto, @Res() res: Response) {
    const { chatId, messageId } = body;
    const amount = 50;
    const messages = await this.chatsService.getMessages(chatId, messageId, amount);
    return res.status(200).json({success: true, messages});
  }

  @Get("/:chatId/members")
  @UseGuards(IsHigherPriority)
  async getMembers(@Param('chatId', ParseBigintPipe) chatId: bigint, @Res() res: Response) {
    const members = this.chatsService.getMembers(chatId);
    return res.status(200).json({success: true, members});
  }

  @Post("/:chatId/members")
  @UseGuards(IsChatPrivilage)
  @Roles(["ADMIN"])
  async addMember(@Body() body: CreateMemberDto, @Param('chatId', ParseBigintPipe) chatId: bigint, @Res() res: Response) {
    const { userId } = body;
    await this.chatsService.createMember(userId, chatId);
    return res.status(201).json({success: true});
  }

  @Patch("/:chatId/members")
  @UseGuards(IsHigherPriority)
  async updateMember(@Body() body: UpdateMemberDto, @Param('chatId', ParseBigintPipe) chatId: bigint, @Res() res: Response) {
    const { userId, newRole } = body;
    await this.chatsService.updateMember(userId, chatId, newRole);
    return res.status(200).json({success: true});
  }

  @Delete("/:chatId/members")
  @UseGuards(IsHigherPriority)
  async delMember(@Body() body: DeleteMemberDto, @Param('chatId', ParseBigintPipe) chatId: bigint, @Res() res: Response) {
    const { targetId } = body;
    await this.chatsService.deleteMember(targetId, chatId);
    return res.status(204).json({success: true});
  }

  @Get("/")
  async getChats(@SessionUserId() userId: bigint, @Res() res: Response) {
    const result = await this.chatsService.getChats(userId);
    return res.status(200).json({chats: result});
  }

  @Post("/")
  async createChat(@SessionUserId() userId: bigint, @Res() res: Response) {
    await this.chatsService.createChat(userId);
    return res.status(200).json({success: true});
  }

  @Patch("/:chatId")
  @UseGuards(IsChatPrivilage)
  @Roles(["ADMIN"])
  async updateChat(@Body() body: UpdateChatDto, @Param('chatId', ParseBigintPipe) chatId: bigint, @Res() res: Response) {
    let { name } = body;
    await this.chatsService.updateChat(chatId, name);
    return res.status(204).json({success: true});
  }

  @Delete("/:chatId")
  @UseGuards(IsChatPrivilage)
  @Roles(["OWNER"])
  async deleteChat(@Param('chatId', ParseBigintPipe) chatId: bigint, @Res() res: Response) {
    await this.chatsService.deleteChat(chatId);
    return res.status(204).json({success: true});
  }
}

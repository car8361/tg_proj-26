import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UseGuards
} from '@nestjs/common';
import { RelationsService } from './relations.service.js';
import {SessionVerified} from "../auth/auth.guard.js";
import {SessionUserId} from "../common/decorators/session-user-id/session-user-id.decorator.js";
import {AcceptInviteDto, BlockDto, DeleteFriendDto, DeleteInviteDto, InviteDto} from "./dto/relations.dto.js";
import type {Response, Request} from "express";
import {ParseBigintPipe} from "../common/decorators/parse-bigint-pipe/parse-bigint-pipe.decorator.js";

@Controller('relations')
@UseGuards(SessionVerified)
export class RelationsController {
  constructor(private readonly relationsService: RelationsService) {}

  @Get('invites/pending')
  @HttpCode(200)
  async getPendingInvites(@SessionUserId() userId: bigint) {
    const result = await this.relationsService.getIngoingInvites(userId);
    return {success: true, invites: result};
  }

  @Get('invites/outgoing')
  @HttpCode(200)
  async getSentInvites(@SessionUserId() userId: bigint) {
    const result = await this.relationsService.getOutgoingInvites(userId);
    return {success: true, invites: result};
  }

  @Post('invites/')
  @HttpCode(201)
  async postInvite(@Body() body: InviteDto, @SessionUserId() userId: bigint, @Req() req: Request) {
    const {targetName} = body;
    if (req.session.username === targetName) {
      console.log("Case 1")
      console.log(`USERNAME: ${req.session.username}, TARGET NAME: ${targetName}`);
      throw new ConflictException("Cannot send invite to yourself");
    }
    await this.relationsService.createInvite(userId, targetName);
    return {success: true};
  }

  @Delete('invites/:inviteId')
  @HttpCode(204)
  async deleteRequest(@Param('inviteId', ParseBigintPipe) inviteId: bigint, @SessionUserId() userId: bigint) {
    await this.relationsService.deleteInvite(userId, inviteId);
    return {success: true};
  }

  @Patch('invites/:inviteId')
  @HttpCode(204)
  async patchRequest(@Param('inviteId', ParseBigintPipe) inviteId: bigint, @SessionUserId() userId: bigint) {
    await this.relationsService.acceptInvite(userId, inviteId);
    return {success: true};
  }

  @Get('friends')
  @HttpCode(200)
  async getFriends(@SessionUserId() userId: bigint) {
    const result = await this.relationsService.myFriends(userId);
    return {success: true, friends: result};
  }

  @Delete('friends')
  @HttpCode(204)
  async deleteFriends(@Body() body: DeleteFriendDto, @SessionUserId() userId: bigint) {
    const {targetId} = body;
    await this.relationsService.deleteFriend(userId, targetId);
    return {success: true};
  }

  @Post('block')
  @HttpCode(201)
  async block(@Body() body: BlockDto, @SessionUserId() userId: bigint) {
    const {targetId} = body;
    if (userId === targetId) {
      throw new ConflictException('Cannot block yourself');
    }
    await this.relationsService.block(userId, targetId);
    return {success: true};
  }

  @Delete('block')
  @HttpCode(204)
  async unblock(@Body() body: BlockDto, @SessionUserId() userId: bigint) {
    const {targetId} = body;
    await this.relationsService.unblock(userId, targetId);
    return {success: true};
  }
}

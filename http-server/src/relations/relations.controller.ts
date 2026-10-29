import {Body, Controller, Delete, Get, Param, Patch, Post, Res, UseGuards} from '@nestjs/common';
import { RelationsService } from './relations.service.js';
import {SessionVerified} from "../auth/auth.guard.js";
import {SessionUserId} from "../common/decorators/session-user-id/session-user-id.decorator.js";
import {AcceptInviteDto, BlockDto, DeleteFriendDto, DeleteInviteDto, InviteDto} from "./dto/relations.dto.js";
import {HasInvitePermissions} from "./relations.guard.js";
import type {Response} from "express";
import {ParseBigintPipe} from "../common/decorators/parse-bigint-pipe/parse-bigint-pipe.decorator.js";

@Controller('relations')
@UseGuards(SessionVerified)
export class RelationsController {
  constructor(private readonly relationsService: RelationsService) {}

  @Get('invites/pending')
  async getPendingInvites(@SessionUserId() userId: bigint, @Res() res: Response) {
    const result = await this.relationsService.getIngoingInvites(userId);
    return res.status(200).json({success: true, invites: result});
  }

  @Get('invites/outgoing')
  async getSentInvites(@SessionUserId() userId: bigint, @Res() res: Response) {
    const result = await this.relationsService.getOutgoingInvites(userId);
    return res.status(200).json({success: true, invites: result});
  }

  @Post('invites/')
  async postInvite(@Body() body: InviteDto, @SessionUserId() userId: bigint, @Res() res: Response) {
    const {receiverName} = body;
    await this.relationsService.createInvite(userId, receiverName);
    return res.status(201).json({success: true});
  }

  @Delete('invites/:inviteId')
  @UseGuards(HasInvitePermissions)
  async deleteRequest(@Param('inviteId', ParseBigintPipe) inviteId: bigint, @SessionUserId() userId: bigint, @Res() res: Response) {
    await this.relationsService.deleteInvite(userId, inviteId);
    return res.status(204).json({success: true});
  }

  @Patch('invites/:inviteId')
  async patchRequest(@Param('inviteId', ParseBigintPipe) inviteId: bigint, @SessionUserId() userId: bigint, @Res() res: Response) {
    await this.relationsService.acceptInvite(userId, inviteId);
    return res.status(204).json({success: true});
  }

  @Get('friends/')
  async getFriends(@SessionUserId() userId: bigint, @Res() res: Response) {
    const result = await this.relationsService.myFriends(userId);
    return res.status(200).json({success: true, friends: result});
  }

  @Delete('friends/')
  async deleteFriends(@Body() body: DeleteFriendDto, @SessionUserId() userId: bigint, @Res() res: Response) {
    const {friendId} = body;
    await this.relationsService.deleteFriend(userId, friendId);
    return res.status(204).json({success: true});
  }

  @Post('block')
  async block(@Body() body: BlockDto, @SessionUserId() userId: bigint, @Res() res: Response) {
    const {targetId} = body;
    await this.relationsService.block(userId, targetId);
    return res.status(201).json({success: true});
  }

  @Delete('block')
  async unblock(@Body() body: BlockDto, @SessionUserId() userId: bigint, @Res() res: Response) {
    const {targetId} = body;
    await this.relationsService.unblock(userId, targetId);
    return res.status(204).json({success: true});
  }
}

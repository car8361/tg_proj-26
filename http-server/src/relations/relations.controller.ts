import {Body, Controller, Delete, Get, Patch, Post, UseGuards} from '@nestjs/common';
import { RelationsService } from './relations.service.js';
import {SessionVerified} from "../auth/auth.guard.js";
import {SessionUserId} from "../common/decorators/session-user-id/session-user-id.decorator.js";
import {AcceptInviteDto, BlockDto, DeleteFriendDto, DeleteInviteDto, InviteDto} from "./dto/relations.dto.js";
import {SenderInUntrustedFriendRequest} from "./relations.guard.js";

@Controller('relations')
@UseGuards(SessionVerified)
export class RelationsController {
  constructor(private readonly relationsService: RelationsService) {}

  @Get('invites/pending')
  async getPendingInvites(@SessionUserId() userId: bigint) {
    return await this.relationsService.getIngoingInvites(userId);
  }

  @Get('invites/outgoing')
  async getSentInvites(@SessionUserId() userId: bigint) {
    return await this.relationsService.getOutgoingInvites(userId);
  }

  @Post('invites')
  async postInvite(@Body() body: InviteDto) {
    const {senderId, receiverId} = body;
    return await this.relationsService.createInvite(senderId, receiverId);
  }

  @Delete('invites')
  @UseGuards(SenderInUntrustedFriendRequest)
  async deleteRequest(@Body() body: DeleteInviteDto, @SessionUserId() userId: bigint) {
    const {inviteId} = body;
    return await this.relationsService.deleteInvite(userId, inviteId);
  }

  @Patch('invites')
  async patchRequest(@Body() body: AcceptInviteDto, @SessionUserId() userId: bigint) {
    const {inviteId} = body;
    return await this.relationsService.acceptInvite(userId, inviteId);
  }

  @Get('my')
  async getMy(@SessionUserId() userId: bigint) {
    return await this.relationsService.myFriends(userId);
  }

  @Delete('my')
  async deleteMe(@Body() body: DeleteFriendDto, @SessionUserId() userId: bigint) {
    const {friendId} = body;
    return await this.relationsService.deleteFriend(userId, friendId);
  }

  @Post('block')
  async block(@Body() body: BlockDto, @SessionUserId() userId: bigint) {
    const {targetId} = body;
    return await this.relationsService.block(userId, targetId);
  }

  @Delete('block')
  async unblock(@Body() body: BlockDto, @SessionUserId() userId: bigint) {
    const {targetId} = body;
    return await this.relationsService.unblock(userId, targetId);
  }
}

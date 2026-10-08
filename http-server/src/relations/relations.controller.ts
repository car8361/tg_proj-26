import {Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards} from '@nestjs/common';
import { RelationsService } from './relations.service.js';
import {SessionVerified} from "../auth/auth.guard.js";
import {SessionUserId} from "../common/decorators/session-user-id/session-user-id.decorator.js";
import {AcceptInviteDto, BlockDto, DeleteFriendDto, DeleteInviteDto, InviteDto} from "./dto/relations.dto.js";

@Controller('relations')
export class RelationsController {
  constructor(private readonly relationsService: RelationsService) {}

  @UseGuards(SessionVerified)
  @Get('invite')
  async getInvites(@SessionUserId() userId: bigint) {
    return await this.relationsService.getInvites(userId);
  }

  @UseGuards(SessionVerified)
  @Post('invite')
  async postInvite(@Body() body: InviteDto) {
    const {senderId, receiverId} = body;
    return await this.relationsService.createInvite(senderId, receiverId);
  }

  @UseGuards(SessionVerified)
  @Delete('invite')
  async deleteRequest(@Body() body: DeleteInviteDto, @SessionUserId() userId: bigint) {
    const {inviteId} = body;
    return await this.relationsService.deleteInvite(userId, inviteId);
  }

  @UseGuards(SessionVerified)
  @Patch('invite')
  async patchRequest(@Body() body: AcceptInviteDto, @SessionUserId() userId: bigint) {
    const {inviteId} = body;
    return await this.relationsService.acceptInvite(userId, inviteId);
  }

  @UseGuards(SessionVerified)
  @Get('my')
  async getMy(@SessionUserId() userId: bigint) {
    return await this.relationsService.myFriends(userId);
  }

  @UseGuards(SessionVerified)
  @Delete('my')
  async deleteMe(@Body() body: DeleteFriendDto, @SessionUserId() userId: bigint) {
    const {friendId} = body;
    return await this.relationsService.deleteFriend(userId, friendId);
  }

  @UseGuards(SessionVerified)
  @Post('block')
  async block(@Body() body: BlockDto, @SessionUserId() userId: bigint) {
    const {targetId} = body;
    return await this.relationsService.block(userId, targetId);
  }

  @UseGuards(SessionVerified)
  @Delete('block')
  async unblock(@Body() body: BlockDto, @SessionUserId() userId: bigint) {
    const {targetId} = body;
    return await this.relationsService.unblock(userId, targetId);
  }
}

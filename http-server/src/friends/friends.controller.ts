import {Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards} from '@nestjs/common';
import { FriendsService } from './friends.service.js';
import {SessionVerified} from "../auth/auth.guard.js";
import {SessionUserId} from "../common/decorators/session-user-id/session-user-id.decorator.js";
import {AcceptInviteDto, DeleteFriendDto, DeleteInviteDto, InviteDto} from "./dto/friends.dto.js";

@Controller('friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @UseGuards(SessionVerified)
  @Get('invite')
  async getInvites(@SessionUserId() userId: number) {
    return await this.friendsService.getInvites(userId);
  }

  @UseGuards(SessionVerified)
  @Post('invite')
  async postInvite(@Body() body: InviteDto) {
    const {senderId, receiverId} = body;
    return await this.friendsService.createInvite(senderId, receiverId);
  }

  @UseGuards(SessionVerified)
  @Delete('invite')
  async deleteRequest(@Body() body: DeleteInviteDto, @SessionUserId() userId: number) {
    const {inviteId} = body;
    return await this.friendsService.deleteInvite(inviteId, userId);
  }

  @UseGuards(SessionVerified)
  @Patch('invite')
  async patchRequest(@Body() body: AcceptInviteDto, @SessionUserId() userId: number) {
    const {inviteId} = body;
    return await this.friendsService.acceptInvite(inviteId, userId);
  }

  @UseGuards(SessionVerified)
  @Get('my')
  async getMy(@SessionUserId() userId: number) {
    return await this.friendsService.myFriends(userId);
  }

  @UseGuards(SessionVerified)
  @Delete('my')
  async deleteMe(@Body() body: DeleteFriendDto, @SessionUserId() userId: number) {
    const {friendId} = body;
    return await this.friendsService.deleteFriend(targetId, userId);
  }
}

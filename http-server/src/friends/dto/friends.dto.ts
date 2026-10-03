import { IsString } from "class-validator"
import { IsId } from "../../common/decorators/is-id/is-id.decorator.js";

export class InviteDto {
	@IsId()
	senderId: bigint;

	@IsId()
	receiverId: bigint;
}

export class DeleteInviteDto {
	@IsId()
	inviteId: bigint;
}

export class AcceptInviteDto {
	@IsId()
	inviteId: bigint;
}

export class DeleteFriendDto {
	@IsId()
	friendId: bigint;
}
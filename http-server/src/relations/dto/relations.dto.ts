import {IsNotEmpty, IsString} from "class-validator"
import { IsId } from "../../common/decorators/is-id/is-id.decorator.js";

export class InviteDto {
	@IsString()
	@IsNotEmpty()
	targetName: string;
}

export class DeleteInviteDto {
	@IsId()
	@IsNotEmpty()
	inviteId: bigint;
}

export class AcceptInviteDto {
	@IsId()
	@IsNotEmpty()
	inviteId: bigint;
}

export class DeleteFriendDto {
	@IsId()
	@IsNotEmpty()
	targetId: bigint;
}

export class BlockDto {
	@IsId()
	@IsNotEmpty()
	targetId: bigint;
}
import { IsId } from "../../common/decorators/is-id/is-id.decorator.js"
import {IsEnum, IsNotEmpty, IsString, Length} from "class-validator";
import { PrivilageEnum, ChatEnum } from "../../generated/prisma/enums.js";

/**
 * Přijímá:
 * - chatId
 * - message
 */


export class MessageDto {
	@IsString()
	@IsNotEmpty()
	@Length(1, 500)
	message: string;
	@IsEnum(ChatEnum)
	targetType: ChatEnum;
	@IsId()
	targetId: bigint;
}

/**
 * Přijímá:
 * - chatId
 * - messageId
 */

export class GetMessagesDto {
	@IsId()
	chatId: bigint;
	@IsId()
	messageId: bigint;
}

/**
 * Přijímá:
 * - message
 */

export class PatchMessagesDto {
	@Length(1, 500)
	message: string;
}

/**
 * Přijímá
 * - **name**
 *
 * Optional:
 * - newOwnerId
 */

export class UpdateChatDto {
	@Length(1, 64)
	name: string;
}

export class CreateMemberDto {
	@IsId()
	userId: bigint;
}

export class UpdateMemberDto {
	@IsId()
	userId: bigint;

	@IsEnum(PrivilageEnum)
	newRole: PrivilageEnum;
}

export class DeleteMemberDto {
	@IsId()
	targetId: bigint;
}
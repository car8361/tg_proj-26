import { IsId } from "../../common/decorators/is-id/is-id.decorator.js"
import {IsNotEmpty, IsString, Length} from "class-validator";
import {Optional} from "@nestjs/common";

/**
 * Přijímá:
 * - chatId
 * - message
 */


export class MessageDto {
	@IsId()
	chatId: bigint;
	@IsString()
	@IsNotEmpty()
	@Length(1, 500)
	message: string;
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
	@IsId()
	@Optional()
	newOwnerId: bigint;
}

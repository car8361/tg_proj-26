import { IsId } from "../../common/decorators/is-id/is-id.decorator.js"
import {IsNotEmpty, IsString, Length} from "class-validator";

export class MessageDto {
	@IsId()
	chatId: bigint;
	@IsString()
	@IsNotEmpty()
	@Length(1, 500)
	message: string;
}
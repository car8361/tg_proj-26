import {CanActivate, ExecutionContext, Injectable} from "@nestjs/common";
import {PrismaService} from "../prisma/prisma.service.js";

/**
 * Pustí request dál pokud je vlastník zprávy
 *
 * přijímá:
 * - **messageId** z params,
 * - **session data**: verified, userId
 */

@Injectable()
export class IsMessageOwner implements CanActivate {
	constructor(private readonly conn: PrismaService) {}

	async canActivate(context: ExecutionContext) {
		const req = context.switchToHttp().getRequest();

		const messageId = req.params.messageId;
		const {userId, verified} = req.session;

		if (!messageId || !verified) {
			return false;
		}

		const cmd = await this.conn.chat_message.findFirst({
			select: {user_id: true},
			where: {id: messageId}
		});

		if (!cmd) {
			return false;
		}

		return cmd.user_id === userId;
	}
}

/**
 * Předá request pokud je vlastník chatu
 *
 * přijímá:
 * - **chatId** - z params
 * - **session data**: verified, userId
 */
@Injectable()
export class IsChatOwner implements CanActivate {
	constructor(private readonly conn: PrismaService) {}

	async canActivate(context: ExecutionContext) {
		const req = context.switchToHttp().getRequest();
		const {userId, verified} = req.session;
		const chatId = req.params.chatId;

		if (!verified || !chatId) {
			return false;
		}

		try {
			await this.conn.chat.findFirstOrThrow({
				where: {chat_owner_id: userId, id: chatId},
				select: {id: true}
			})
		} catch {
			return false;
		}

		return true;
	}
}
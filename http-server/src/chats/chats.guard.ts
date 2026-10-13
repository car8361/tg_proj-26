import {CanActivate, ExecutionContext, Injectable} from "@nestjs/common";
import {PrismaService} from "../prisma/prisma.service.js";

/**
 * Pustí request dál pokud je vlastník zprávy
 *
 * přijímá:
 * - **messageId** z params,
 * - **userId** z session
 */

@Injectable()
export class IsMessageOwner implements CanActivate {
	constructor(private readonly conn: PrismaService) {}

	async canActivate(context: ExecutionContext) {
		const request = context.switchToHttp().getRequest();

		const messageId = request.params.messageId;
		const userId = request.session.userId;

		if (!messageId || !userId) {
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
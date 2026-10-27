import {CanActivate, ExecutionContext, Injectable} from "@nestjs/common";
import {PrismaService} from "../prisma/prisma.service.js";
import {Reflector} from "@nestjs/core";
import { privilage } from "../generated/prisma/enums.js";

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
/**@Injectable()
export class IsChatPrivilage implements CanActivate {
	constructor(private readonly conn: PrismaService) {}

	async canActivate(context: ExecutionContext) {
		const req = context.switchToHttp().getRequest();
		const {userId, verified} = req.session;
		const chatId = req.params.chatId;

		if (!verified || !chatId) {
			return false;
		}

		try {
			await this.conn.chat_user.findFirstOrThrow({
				where: {chat_id: chatId, },
				select: {id: true}
			})
		} catch {
			return false;
		}

		return true;
	}
}**/

export const Roles = Reflector.createDecorator<privilage[]>();

@Injectable()
export class IsChatPrivilage implements CanActivate {
	constructor(private reflector: Reflector, private readonly conn: PrismaService) {}

	async canActivate(context: ExecutionContext) {
		console.log("GUARD IsChatPrivelage RUNNING");
		const roles = this.reflector.get(Roles, context.getHandler());
		if (!roles) { return true; }
		const request = context.switchToHttp().getRequest();
		const session = request.session;
		const chatId = request.params.chatId;
		const userId = session.user_id;
		const result = await this.conn.chat_user.findFirst({
			where: {id: userId, privilage: { in: roles}},
			select: {user_id: true},
		})
		return !!result;
	}
}
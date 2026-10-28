import {CanActivate, ExecutionContext, Injectable} from "@nestjs/common";
import {PrismaService} from "../prisma/prisma.service.js";
import {Reflector} from "@nestjs/core";
import { privilage } from "../generated/prisma/enums.js";
import { Request } from "express";
import session from "express-session";

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

/**
 * **Očekává:**
 * - chatId - params
 * - userId - session
 */
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

/**
 * **Očekává:**
 * - targetId - body
 * - chatId - params
 * - userId - session
 */
@Injectable()
export class IsHigherPriority implements CanActivate {
	constructor(private readonly conn: PrismaService) {}

	async canActivate(context: ExecutionContext) {
		const req: Request = context.switchToHttp().getRequest();
		const { targetId } = req.body.targetId;
		const chatId = req.params.chatId;
		const userId = req.session.user_id;
		if (!userId || !chatId || !targetId) {
			if (process.env.PRODUCTION === "true") {
				console.log("INVALID BODY - IsHigherPriority (NEST GUARD)");
			}
			return false;
		}
		const users = await this.conn.chat_user.findMany({
			where: {
				chat_id: targetId,
				OR: [
					{user_id: userId},
					{user_id: targetId},
				]
			},
			select: {user_id: true, privilage: true},
		})
		if (!users || users.length < 2) {
			return false;
		}
		const RequestorIndex = users[0].user_id === userId ? 0 : 1;
		const OtherIndex = users[0].user_id === targetId ? 0 : 1
		if (users[RequestorIndex].privilage <= users[OtherIndex].privilage) {
			return false;
		}
		return true;
	}
}
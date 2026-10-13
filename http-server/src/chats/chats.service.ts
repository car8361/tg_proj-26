import {BadRequestException, HttpException, Injectable} from '@nestjs/common';
import {PrismaService} from "../prisma/prisma.service.js";
import {Prisma} from "../generated/prisma/client.js";
import {ChatsGateway} from "./chats.gateway.js";

@Injectable()
export class ChatsService {
	constructor(private readonly conn: PrismaService, private readonly gateway: ChatsGateway) {}

	async handleMessage(userId: bigint, chatId: bigint, message: string) {
		const isApart = await this.conn.chat_user.findFirst({
			where: { user_id: userId, chat_id: chatId },
		})
		if (!isApart) {
			throw new HttpException("User not apart of chat", 403);
		}
		await this.conn.chat_message.create({
			data: {user_id: userId, chat_id: chatId, msg: message},
		}).catch((err) => {
			if (err instanceof Prisma.PrismaClientKnownRequestError) {
				if (err.code === "P2003") {
					throw new BadRequestException("Invalid chat ID");
				}
			}
		})
		const users = await this.conn.chat_user.findMany({
			where: { chat_id: chatId },
			select: { user_id: true, chat_user: true }
		})
		let roomIds = [];
		let senderName = "";
		for (let i = 0; i < users.length; i++) {
			roomIds.push(`chat:${users[i].user_id}`);
			if (users[i].chat_user.id === userId) {
				senderName = users[i].chat_user.username;
			}
		}
		return await this.gateway.broadcastMessage(roomIds, senderName, message);
	}
}
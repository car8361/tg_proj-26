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
			select: { user_id: true, chat_user_user_reference: true }
		})
		let roomIds = [];
		let senderName = "";
		for (let i = 0; i < users.length; i++) {
			roomIds.push(`chat:${users[i].user_id}`);
			if (users[i].chat_user_user_reference.id === userId) {
				senderName = users[i].chat_user_user_reference.username;
			}
		}
		this.gateway.emitMessageToRoom(roomIds, "chats:post", {senderName, userId, message});
	}

	async delMessage(messageId: bigint) {
		try {
			const rowsChatUsers = await this.conn.chat({
				where: {  }
			})
			const rowDeleteMsg = await this.conn.chat_message.delete({
				where: {id: messageId}
			})
		} catch (err) {

		}
	}

	async updMessage(userId: bigint, messageId: bigint, newMessage: string) {
		try {
			await this.conn.chat_message.update({
				where: {id: messageId},
				data: { msg: newMessage }
			});
			const rowChatId = await this.conn.chat_message.findFirst({
				where: { id: messageId },
				select:
					{ chat_message_chat_reference:
						{ select:
							{ id: true }
						}
					},
			})

			if (!rowChatId) { throw new HttpException("No chatId found", 409); } //ON DELETE CASCADE => CHAT ID NOT NULL (prisma), only for prisma to work

			const rowsUserIds = await this.conn.chat_user.findMany({
				where: { chat_id: rowChatId.chat_message_chat_reference.id },
				select: { user_id: true }
			})
			let roomIds = [];
			for (let i = 0; i < rowsUserIds.length; i++) {
				roomIds.push(`chat:${rowsUserIds[i]}`);
			}
			this.gateway.emitMessageToRoom(roomIds, "chat:update", {userId, newMessage});
		} catch (err) {
			if (err instanceof Prisma.PrismaClientKnownRequestError) {
				if (err.code === "P2025") {
					throw new BadRequestException("Invalid message ID");
				}
				throw err;
			}
		}
	}

	async getMessages(chatId: bigint, messageId: bigint, amount: number) {
		const msgs = this.conn.chat_message.findMany({
			where: { chat_id: chatId, id: {lt: messageId} },
			orderBy: { id: "desc"},
			take: amount,
			select: {
				id: true,
				chat_id: true,
				message_owner: {
					select: {username: true}
				},
				msg: true,
				created_at: true
			}
		})
		return msgs;
	}
}
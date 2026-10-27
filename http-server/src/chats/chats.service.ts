import {BadRequestException, ForbiddenException, HttpException, Injectable, NotFoundException} from '@nestjs/common';
import {PrismaService} from "../prisma/prisma.service.js";
import {Prisma} from "../generated/prisma/client.js";
import {ChatsGateway} from "./chats.gateway.js";

@Injectable()
export class ChatsService {
	constructor(private readonly conn: PrismaService, private readonly gateway: ChatsGateway) {}

	async handleMessage(userId: bigint, chatId: bigint, username: string, message: string) {
		const isApart = await this.conn.chat_user.findFirst({
			where: { user_id: userId, chat_id: chatId },
		})
		if (!isApart) {
			throw new ForbiddenException("User not apart of chat");
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
		let roomIds = this.usersRowToEmitField(users);
		this.gateway.emitMessageToRoom(roomIds, "chats:post", {senderName: username, userId, message});
	}

	async delMessage(messageId: bigint) {
		try {
			const rowChatMessages = await this.conn.chat_message.findFirstOrThrow({
				where: { id: messageId },
				select: { chat_message_chat_reference: {
					select: { id: true }
					}
				}
			})
			const rowsGetReceiverUsers = await this.conn.chat_user.findMany({
				where: { chat_id: rowChatMessages.chat_message_chat_reference.id },
				select: { user_id: true }
			})
			let userIds = this.usersRowToEmitField(rowsGetReceiverUsers);
			await this.conn.chat_message.delete({
				where: {id: messageId}
			})
			this.gateway.emitMessageToRoom(userIds, "chats:delete", {
				messageId: messageId,
			});

		} catch (err) {
			if (err instanceof Prisma.PrismaClientKnownRequestError) {
				if (err.code === "P2025") {
					throw new NotFoundException("Invalid message ID");
				}
			}
			throw err;
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

			if (!rowChatId) { throw new NotFoundException("Invalid message"); } //ON DELETE CASCADE => CHAT ID NOT NULL (prisma), only for prisma to work

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
					throw new NotFoundException("Invalid message ID");
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

	async getChats(userId: bigint) {
		const res = await this.conn.chat_user.findMany({
			where: { user_id: userId },
			select: { chat_user_chat_reference: { select: { chat_name: true, id: true }}}
		});
		return res.map((r) => ({chat_name: r.chat_user_chat_reference.chat_name, id: r.chat_user_chat_reference.id.toString()}));
	}

	async createChat(userId: bigint) {
		const createChat = await this.conn.chat.create({});
		await this.conn.chat_user.create({data: {user_id: userId, chat_id: createChat.id, privilage: "OWNER"}});
	}

	async updateChat(chatId: bigint, name: string) {
		await this.conn.chat.update({
			where: { id: chatId },
			data: { name: name },
		})
		const userIdRows = await this.conn.chat_user.findMany({
			where: { chat_id: chatId },
			select: { user_id: true}
		});
		const roomIds = this.usersRowToEmitField(userIdRows);
		return this.gateway.emitMessageToRoom(roomIds, "chats:update", {chatId: chatId.toString(), name})
	}

	async deleteChat(chatId: bigint) {
		try {
			const userIdsRows = await this.conn.chat_user.findMany({
				where: { chat_id: chatId },
				select: { user_id: true }
			})
			await this.conn.chat.delete({
				where: {id: chatId},
			})

			const roomIds = this.usersRowToEmitField(userIdsRows);
			this.gateway.emitMessageToRoom(roomIds, "chats:delete", {chatId: chatId.toString()})
		} catch (err) {
			if (err instanceof Prisma.PrismaClientKnownRequestError) {
				if (err.code === "P2025") {
					throw new NotFoundException("Invalid chat ID");
				}
			}
			console.error(err);
		}
	}

	private usersRowToEmitField(rowsUserIds: { user_id: bigint }[]) {
		let roomIds = [];
		console.log("UsersRowToEmitField RECEIVER: ", rowsUserIds);
		for (let i = 0; i < rowsUserIds.length; i++) {
			roomIds.push(`chat:${rowsUserIds[i].user_id.toString()}`);
		}
		return roomIds;
	}
}
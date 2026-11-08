import {
	BadRequestException,
	ConflictException,
	ForbiddenException,
	Injectable,
	NotFoundException
} from '@nestjs/common';
import {PrismaService} from "../prisma/prisma.service.js";
import {Prisma, PrivilageEnum, ChatEnum} from "../generated/prisma/client.js";
import {SocketGateway} from "../socket/socket.gateway.js";

@Injectable()
export class ChatsService {
	constructor(private readonly conn: PrismaService, private readonly gateway: SocketGateway) {}

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
		let roomIds = this.usersRowToEmitField(users); // USERID FILTRING WEBSOCKETS
		this.gateway.emitMessageToRoom(roomIds, "chats:messages:sent", {chatId: chatId.toString(), senderName: username, userId: userId.toString(), message});
		return
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
			this.gateway.emitMessageToRoom(userIds, "chats:messages:delete", {
				messageId: messageId.toString(),
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

	async updMessage(userId: bigint, username: string, messageId: bigint, newMessage: string) {
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
			this.gateway.emitMessageToRoom(roomIds, "chats:messages:update", {userId: userId.toString(), username, newMessage});
		} catch (err) {
			if (err instanceof Prisma.PrismaClientKnownRequestError) {
				if (err.code === "P2025") {
					throw new NotFoundException("Invalid message ID");
				}
				throw err;
			}
		}
	}

	async getMessages(chatId: bigint) {
		const msgs = await this.conn.chat_message.findMany({
			where: { chat_id: chatId },
			orderBy: { id: "asc"},
			select: {
				id: true,
				chat_id: true,
				chat_message_user_reference: {
					select: {username: true}
				},
				msg: true,
				created_at: true
			}
		})
		return msgs.map((m, i) => ({
			id: m.id.toString(),
			chat_id: m.chat_id.toString(),
			username: m.chat_message_user_reference.username,
			msg: m.msg,
			created_at: m.created_at,
		}));
	}

	async createChat(userId: bigint, chatType: ChatEnum, targetId: bigint) {
		if (chatType === "DIRECT") {
			if (targetId === targetId) {return;}
			const biggerId = userId > targetId ? userId : targetId;
			const smallerId = userId < targetId ? userId : targetId;
			await this.conn.$transaction(async (t) => {
				const createChat = await t.chat.create({data: {type: "DIRECT", dm_key: `${smallerId}:${biggerId}`}});
				await t.chat_user.createMany({
					data: [
						{user_id: userId, chat_id: createChat.id, privilage: "USER"},
						{user_id: targetId,	 chat_id: createChat.id, privilage: "USER"},
					]
				})
			})
		} else if (chatType === "GROUP") {
			await this.conn.$transaction(async (t) => {
				const createChat = await t.chat.create({data: {type: "GROUP"}});
				await t.chat_user.create({data: {user_id: userId, chat_id: createChat.id, privilage: "OWNER"}});
			})
		}
		return;
	}

	async getChats(userId: bigint) {
		const res = await this.conn.chat_user.findMany({
			where: { user_id: userId },
			select: { chat_user_chat_reference: { select: { name: true, id: true }}}
		});
		return res.map((r) => ({name: r.chat_user_chat_reference.name, id: r.chat_user_chat_reference.id.toString()}));
	}

	async getChat(userId: bigint, chatId: bigint) {
		try {
			const res = await this.conn.chat_user.findFirstOrThrow({
				where: {user_id: userId, chat_id: chatId},
				select: {chat_user_chat_reference: {select: {name: true, id: true, type: true}}}
			});
			return {
				name: res?.chat_user_chat_reference.name,
				id: res?.chat_user_chat_reference.id.toString()
			};
		} catch (err) {
			if (err instanceof Prisma.PrismaClientKnownRequestError) {
				if (err.code === "P2025") {
					throw new NotFoundException("Invalid chat ID");
				}
			}
			throw err;
		}
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

	async getMembers(chatId: bigint) {
		const userRows = await this.conn.chat_user.findMany({
			where: { chat_id: chatId },
			select: { privilage: true, chat_user_user_reference: { select: { id: true, username: true } } }
		})
		return userRows.map(r => ({id: r.chat_user_user_reference.id.toString(), username: r.chat_user_user_reference.username, privilage: r.privilage}));
	}

	async createMembers(userId: bigint, targetIds: bigint[], chatId: bigint) {
		try {
			const friendIds = await this.conn.relation.findMany({
				where: { owner_id: userId, other_id: { in: targetIds}, relationship: "FRIEND"},
				select: { other_id: true }
			})
			targetIds.map(tid => {
				if (!friendIds.find(fid => fid.other_id === tid)) {
					throw new NotFoundException("Invalid target IDs");
				}
			})
			await this.conn.chat_user.createMany({
				data: targetIds.map(id => ({ chat_id: chatId, user_id: id, privilage: "USER" }))
			})
			const users = await this.conn.chat_user.findMany({
				where: { chat_id: chatId },
				select: { user_id: true }
			})
			const roomIds = this.usersRowToEmitField(users);
			this.gateway.emitMessageToRoom(roomIds, "chats:members:add", {chatId: chatId.toString()});
			return;
		} catch (err) {
			if (err instanceof Prisma.PrismaClientKnownRequestError) {
				if (err.code === "P2002") {
					throw new ConflictException("User already in chat");
				}
				if (err.code === "P2025") {
					throw new ConflictException("Chat or user not found");
				}
			}
			throw err;
		}
	}

	async updateMember(userId: bigint, chatId: bigint, newRole: PrivilageEnum) {
		try {
			await this.conn.chat_user.update({
				where: { user_id_chat_id: { user_id: userId, chat_id: chatId }, },
				data: { privilage: newRole }
			})
			const userRows = await this.conn.chat_user.findMany({
				where: { chat_id: chatId },
			})
			const roomIds = this.usersRowToEmitField(userRows);
			this.gateway.emitMessageToRoom(roomIds, "chats:members:update", {chatId: chatId.toString()})
			return;
		} catch (err) {
			if (err instanceof Prisma.PrismaClientKnownRequestError) {
				if (err.code === "P2025") {
					throw new NotFoundException("User not in chat");
				}
			}
			throw err;
		}
	}

	async deleteMember(targetId: bigint, chatId: bigint) {
		try {
			await this.conn.chat_user.delete({
				where: { user_id_chat_id: { user_id: targetId, chat_id: chatId}}
			})
			const userRows = await this.conn.chat_user.findMany({
				where: { chat_id: chatId },
			})
			const userIds = this.usersRowToEmitField(userRows);
			this.gateway.emitMessageToRoom(userIds, "chats:members:delete", {chatId: chatId.toString()})
			return;
		} catch (err) {
			if (err instanceof Prisma.PrismaClientKnownRequestError) {
				if (err.code === "P2025") {
					throw new NotFoundException("User not in chat");
				}
			}
			throw err;
		}
	}

	async getChatUserPrivilages(userId: bigint, chatId: bigint) {
		const result = await this.conn.chat_user.findFirstOrThrow({
			where: { chat_id: chatId, user_id: userId },
			select: { privilage: true }
		}).catch((e) => {
			if (e instanceof Prisma.PrismaClientKnownRequestError) {
				if (e.code === "P2025") {
					throw new NotFoundException("User not found");
				}
			}
		})
		return result!.privilage;
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
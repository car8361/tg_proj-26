import {BadRequestException, Injectable} from '@nestjs/common';
import {PrismaService} from "../prisma/prisma.service.js";
import {Prisma} from "../generated/prisma/client.js";
import {ChatsGateway} from "./chats.gateway.js";

@Injectable()
export class ChatsService {
	constructor(private readonly conn: PrismaService, private readonly gateway: ChatsGateway) {}

	async handleMessage(userId: bigint, chatId: bigint, message: string) {
		await this.conn.chat_message.create({
			data: {user_id: userId, chat_id: chatId, msg: message},
		}).catch((err) => {
			if (err instanceof Prisma.PrismaClientKnownRequestError) {
				if (err.code === "P2003") {
					throw new BadRequestException("Invalid chat ID");
				}
			}
		})
		return await this.gateway.broadcastMessage();
	}
}
//setup waaka
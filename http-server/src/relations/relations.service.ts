import { Injectable } from '@nestjs/common';
import { PrismaService } from "../prisma/prisma.service.js";

@Injectable()
export class RelationsService {
	constructor(private readonly conn: PrismaService) {}
	async getInvites(userId: bigint) {

	}

	async createInvite(senderId: bigint, receiverId: bigint) {

	}

	async deleteInvite(userId: bigint, inviteId: bigint) {

	}

	async acceptInvite(userId: bigint, inviteId: bigint) {

	}

	async myFriends(userId: bigint) {

	}

	async deleteFriend(userId: bigint, friendId: bigint) {

	}

	async block(userId: bigint, targetId: bigint) {

	}

	async unblock(userId: bigint, targetId: bigint) {

	}
}

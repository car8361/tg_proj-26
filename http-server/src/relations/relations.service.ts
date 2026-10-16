import {ConflictException, Injectable, NotFoundException} from '@nestjs/common';
import { PrismaService } from "../prisma/prisma.service.js";
import {Prisma} from "../generated/prisma/client.js";
import {PrismaClientKnownRequestError} from "@prisma/client/runtime/client";

@Injectable()
export class RelationsService {
	constructor(private readonly conn: PrismaService) {}

	async getPendingInvites(userId: bigint) {
		return this.conn.friend_request.findMany({
			where: { target_id: userId },
			select: { sender_id: true, friend_request_sender_reference: { select: { username: true } } }
		})
	}

	async getOutgoingInvites(userId: bigint) {
		return this.conn.friend_request.findMany({
			where: { sender_id: userId },
			select: { target_id: true, friend_request_target_reference: { select: { username: true } } }
		})
	}

	async createInvite(senderId: bigint, targetId: bigint) {
		try {
			this.conn.friend_request.create({
				data: { sender_id: senderId, target_id: targetId}
			})
		} catch (err) {
			if (err instanceof Prisma.PrismaClientKnownRequestError) {
				if (err.code = "P2002") { //unique constraint err code
					throw new ConflictException("Friend request already sent")
				}
			}
			throw err;
		}
	}

	async deleteInvite(userId: bigint, inviteId: bigint) {
		try {
			this.conn.friend_request.delete({
				where: {
					id: inviteId,
					OR: [
						{sender_id: userId},
						{target_id: userId}
					]
				},
			})
		} catch (err) {
			if (err instanceof PrismaClientKnownRequestError) {
				if (err.code = "P2025") {
					throw new NotFoundException("Friend request not found")
				}
				throw err;
			}
		}
	}

	async acceptInvite(userId: bigint, inviteId: bigint) {
		try {
			
		} catch (err) {

		} finally {

		}
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

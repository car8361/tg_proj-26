import {ConflictException, Injectable, NotFoundException} from '@nestjs/common';
import { PrismaService } from "../prisma/prisma.service.js";
import {Prisma} from "../generated/prisma/client.js";
import {PrismaClientKnownRequestError} from "@prisma/client/runtime/client";
import {SocketGateway} from "../socket/socket.gateway.js";


//POZOR ZAJISTIT NEDUPLICITNÍ POZVÁNKY + KAMARÁDY / BLOKACE

@Injectable()
export class RelationsService {
	constructor(private readonly conn: PrismaService, private readonly gateway: SocketGateway) {}

	async getIngoingInvites(userId: bigint) {
		const result = await this.conn.relation.findMany({
			where: { owner_id: userId, relationship: "INVITE_INGOING" },
			select: { id: true, created_at: true, relation_other_user_reference: { select: { id: true, username: true } } }
		})
		return result.map(r => ({invite_id: r.id.toString(), user_id: r.relation_other_user_reference.id.toString(), username: r.relation_other_user_reference.username, created_at: r.created_at}))
	}

	async getOutgoingInvites(userId: bigint) {
		const result = await this.conn.relation.findMany({
			where: { owner_id: userId, relationship: "INVITE_OUTGOING" },
			select: { id: true, created_at: true, relation_other_user_reference: { select: { id: true, username: true } } }
		})
		return result.map(r => ({invite_id: r.id.toString(), user_id: r.relation_other_user_reference.id.toString(), username: r.relation_other_user_reference.username, created_at: r.created_at}))
	}

	async createInvite(userId: bigint, targetName: string) {
		try {
			const other_user = await this.conn.user.findFirstOrThrow({
				where: { username: targetName },
				select: { id: true }
			})
			await this.conn.$transaction(async (t) => {
				await t.relation.create({
					data: { owner_id: userId, other_id: other_user.id, relationship: "INVITE_OUTGOING" }
				})
				await t.relation.create({
					data: { owner_id: other_user.id, other_id: userId, relationship: "INVITE_INGOING" }
				})
			})
			this.gateway.emitMessageToRoom([other_user.id.toString()], "relations:invites:ingoing", {username: targetName, userId: other_user.id.toString()})
			return;
		} catch (err) {
			if (err instanceof Prisma.PrismaClientKnownRequestError) {
				if (err.code = "P2002") { //unique constraint err code
					throw new ConflictException("Friend request already sent")
				}
				if (err.code = "P2025") {
					throw new NotFoundException("User doesn't exist");
				}
			}
			throw err;
		}
	}

	async deleteInvite(userId: bigint, inviteId: bigint) {
		try {
			await this.conn.$transaction(async (t) => {
				const rowOtherId = await t.relation.delete({
					where: { owner_id: userId, id: inviteId, OR: [{relationship: "INVITE_OUTGOING"}, {relationship: "INVITE_INGOING"}] },
					select: { other_id: true }
				})
				await t.relation.delete({
					where: {
						owner_id_other_id: { owner_id: rowOtherId.other_id, other_id: userId },
						OR: [{relationship: "INVITE_OUTGOING"}, {relationship: "INVITE_INGOING"}]
					}
				})
				this.gateway.emitMessageToRoom([userId.toString(), rowOtherId.other_id.toString()], "relations:invites:delete", {})
			})
		} catch (err) {
			if (err instanceof PrismaClientKnownRequestError) {
				if (err.code === "P2002") {
					throw new ConflictException("You already have a relation with this person")
				}
				if (err.code === "P2025") {
					throw new NotFoundException("Friend request not found")
				}
				throw err;
			}
		}
	}

	async acceptInvite(userId: bigint, inviteId: bigint) { //rozbíjí logiku - nelze hledat podle inviteId
		try {
			await this.conn.$transaction(async (t) => {
				const rowOtherId = await t.relation.update({
					where: { owner_id: userId, id: inviteId, relationship: "INVITE_INGOING"},
					data: { relationship: "FRIEND"},
					select: { other_id: true }
				})
				await t.relation.update({
					where: { owner_id_other_id: { owner_id: rowOtherId.other_id, other_id: userId }, relationship: "INVITE_OUTGOING" },
					data: { relationship: "FRIEND"}
				})
				await t.relation.update({
					where: { owner_id_other_id: { owner_id: userId, other_id: rowOtherId.other_id }, relationship: "INVITE_INGOING" },
					data: { relationship: "FRIEND"}
				})
				this.gateway.emitMessageToRoom([userId.toString(), rowOtherId.other_id.toString()], "relations:invites:accepted", {})
			})
		} catch (err) {
			if (err instanceof PrismaClientKnownRequestError) {
				if (err.code === "P2002") {
					throw new ConflictException("You already have a relation with this person") //race condition? Needs to be checked
				}
				if (err.code === "P2025") {
					throw new NotFoundException("Friend request not found")
				}
			}
			throw err;
		}
	}

	async myFriends(userId: bigint) {
		const res = await this.conn.relation.findMany({
			where: {
				relationship: 'FRIEND',
				owner_id: userId
			},
			select: {
				relation_owner_user_reference: {select: {username: true, id: true}},
				relation_other_user_reference: {select: {username: true, id: true}},
			}
		})
		const relations = res.map(res => ({
			owner_username: res.relation_owner_user_reference.username,
			other_username: res.relation_other_user_reference.username,
			owner_id: res.relation_owner_user_reference.id,
			other_id: res.relation_other_user_reference.id,
		}))

		return relations;
	}

	async deleteFriend(userId: bigint, relationId: bigint) {
		try {
			await this.conn.$transaction(async (t) => {
				const otherIdRow = await t.relation.delete({
					where: {
						relationship: 'FRIEND',
						owner_id: userId,
						id: relationId,
					},
					select: { other_id: true }
				})
				await t.relation.delete({
					where: {
						relationship: 'FRIEND',
						owner_id_other_id: {
							owner_id: otherIdRow.other_id,
							other_id: userId
						}
					}
				})
				await t.relation.delete({
					where: {
						relationship: 'FRIEND',
						owner_id_other_id: {
							owner_id: userId,
							other_id: otherIdRow.other_id
						}
					}
				})
			})
		} catch (err) {
			if (err instanceof PrismaClientKnownRequestError) {
				if (err.code = "P2025") {
					throw new ConflictException("Friend not found")
				}
			}
			throw err;
		}
	}

	async block(userId: bigint, targetId: bigint) {
		try {
			await this.conn.$transaction(async (t) => {
				await t.relation.deleteMany({
					where: { OR: [
						{owner_id: userId, other_id: targetId, relationship: { in: ["FRIEND", "INVITE_OUTGOING", "INVITE_INGOING"] }},
							{owner_id: targetId, other_id: userId, relationship: { in: ["FRIEND", "INVITE_INGOING", "INVITE_INGOING"] }},
						]},
				})
				await t.relation.create({
					data: {
						owner_id: userId,
						other_id: targetId,
						relationship: "BLOCKED",
					}
				})
			})
		} catch (err) {
			if (err instanceof PrismaClientKnownRequestError) {
				if (err.code === "P2025") {
					throw new NotFoundException("User not found")
				}
			}
			throw err;
		}
	}

	async unblock(userId: bigint, targetId: bigint) {
		try {
			await this.conn.relation.delete({
				where: {
					owner_id_other_id: { owner_id: userId, other_id: targetId, relationship: "BLOCKED" },
				}
			})
		} catch (err) {
			if (err instanceof PrismaClientKnownRequestError) {
				if (err.code === "P2025") {
					throw new NotFoundException("User not blocked")
				}
			}
			throw err;
		}
	}
}

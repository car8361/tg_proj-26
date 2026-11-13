import {Injectable, NotFoundException} from '@nestjs/common';
import {PrismaService} from "../prisma/prisma.service.js";
import {PrismaClientKnownRequestError} from "@prisma/client/runtime/client";
import {SocketGateway} from "../socket/socket.gateway.js";

@Injectable()
export class MeService {
	constructor(private readonly conn: PrismaService, private readonly gateway: SocketGateway) {}

	async getMe(userId: bigint) {
		return this.conn.user.findFirst({
			where: {
				id: userId
			},
			select: {
				id: true,
				username: true,
				description: true,
				picture: true,
			}
		})
	}

	async patchMe(userId: bigint, description: string) {
		return this.conn.user.update({
			where: { id: userId },
			data: { description: description },
		})
	}

	async savePicture(userId: bigint, path: string) {
		await this.conn.user.update({
			where: { id: userId },
			data: { picture: path },
		})
	}

	async deleteUser(id: bigint) {
		try {
			await this.conn.user.delete({
				where: {id},
			});
			this.gateway.exitRoom(id.toString());
		} catch (err) {
			if (err instanceof PrismaClientKnownRequestError && err.code === "P2025") {
				throw new NotFoundException(`User ${id} not found`)
			}
			throw err;
		}
	}
}

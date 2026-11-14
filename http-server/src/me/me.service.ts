import {Injectable, NotFoundException} from '@nestjs/common';
import {PrismaService} from "../prisma/prisma.service.js";
import {PrismaClientKnownRequestError} from "@prisma/client/runtime/client";
import {SocketGateway} from "../socket/socket.gateway.js";

@Injectable()
export class MeService {
	constructor(private readonly conn: PrismaService, private readonly gateway: SocketGateway) {}

	async getMe(userId: bigint) {
		const result = await this.conn.user.findFirstOrThrow({
			where: {
				id: userId
			},
			select: {
				id: true,
				username: true,
				description: true,
				picture: true,
			}
		}).catch(e => {
			if (e instanceof PrismaClientKnownRequestError) {
				if (e.code === "P2025") {
					throw new NotFoundException("User not found");
				}
			}
			throw e;
		})
		console.log("RESULT: ", result, "\n\n\n\n\n\n")
		return {id: result.id.toString(), username: result.username, description: result.description, picture: result.picture};
	}

	async patchMe(userId: bigint, description: string) {
		await this.conn.user.update({
			where: { id: userId },
			data: { description: description },
		})
		return;
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

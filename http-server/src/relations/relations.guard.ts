import {CanActivate, ExecutionContext} from "@nestjs/common"
import {PrismaService} from "../prisma/prisma.service.js";

/**
 * Zkontroluje permise na pozvánku
 * - inviteId - z params
 */

export class HasInvitePermissions implements CanActivate {
	constructor(private readonly conn: PrismaService) {}

	async canActivate(context: ExecutionContext) {
		const req = context.switchToHttp().getRequest();
		const verified = req.session.verified;
		const userId = req.session.userId;
		if (!verified) {
			return false;
		}
		const inviteId = req.params.inviteId;
		if (!inviteId) {
			return false;
		}
		const result = await this.conn.relation.findFirst({
			where: { id: inviteId },
			select: { owner_id: userId },
		})
		if (!result || result.owner_id != userId) {
			return false;
		}
		return true;
	}
}
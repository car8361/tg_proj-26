import {CanActivate, ExecutionContext} from "@nestjs/common"
import {PrismaService} from "../prisma/prisma.service.js";
import {Reflector} from "@nestjs/core";

/**
 * UNUSED
 *
 * Zkontroluje permise na pozvánku
 * - inviteId - z params
 *
 * UNUSED
 */
export const InviteRoles = Reflector.createDecorator<string>();

export class HasInvitePermissions implements CanActivate {
	constructor(private readonly conn: PrismaService, private readonly reflector: Reflector) {}

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
		const type = this.reflector.get(InviteRoles, context.getHandler())
		if (type === "ACCEPT") {
			const result = await this.conn.relation.findFirst({
				where: { id: inviteId },
				select: { owner_id: true },
			})
			if (!result || result.owner_id != userId) {
				return false;
			}
		}
		if (type === "DELETE") {
			const result = await this.conn.relation.findFirst({
				where: { id: inviteId },
				select: { owner_id: true, other_id: true },
			})
			if (!result || (result.owner_id != userId && result.other_id != userId)) {
				return false;
			}
		}
		return true;
	}
}
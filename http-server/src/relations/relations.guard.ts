import {createParamDecorator} from "@nestjs/common";

/**
 * Zkontroluje jestli uživatel s požadvakem je target nebo sender **z neověřené pozvánky**
 */

export const SenderInUntrustedFriendRequest = createParamDecorator(
	(_, context) => {
	const req = context.switchToHttp().getRequest();
	const verified = req.session.verified;
	const userId = req.session.userId;
	if (!verified) {
		return false;
	}
	const {senderId, targetId} = req.body;
	if (userId !== senderId && userId !== targetId) {
		return false;
	}
	if (!senderId || !targetId) {
		return false;
	}

})
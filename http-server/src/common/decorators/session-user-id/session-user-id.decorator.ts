import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const SessionUserId = createParamDecorator(
    (_: unknown, ctx: ExecutionContext): bigint => {
        const req = ctx.switchToHttp().getRequest();
        return BigInt(req.session.userId)!
    }
)

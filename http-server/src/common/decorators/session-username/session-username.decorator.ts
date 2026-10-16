import {createParamDecorator, ExecutionContext} from "@nestjs/common";


export const SessionUsername = createParamDecorator(
	(_: unknown, ctx: ExecutionContext) => {
		const req = ctx.switchToHttp().getRequest();
		return req.session.userId!;
	}
)
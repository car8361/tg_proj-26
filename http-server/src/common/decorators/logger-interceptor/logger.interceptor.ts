import {
	CallHandler,
	ExecutionContext, Injectable,
	Logger,
	LoggerService,
	NestInterceptor,
	RequestTimeoutException
} from "@nestjs/common";
import {timeout, catchError, TimeoutError, tap} from "rxjs";
import type { Request } from "express";
import { randomUUID } from "node:crypto";

@Injectable()
export class GlobalInterceptor implements NestInterceptor {
	private readonly logger = new Logger('http');

	intercept(context:ExecutionContext, next:CallHandler<{data: unknown}>) {
		const req: Request = context.switchToHttp().getRequest();
		const requestId = randomUUID();
		const secret = ["password", "email"];
		this.logger.log
		(`ID: ${requestId}, Incoming HTTP request from ${req.ip}, time: ${this.generateTime()}, body: ${Object.entries(req.body ?? {}).map((pair, i) => {
			if (secret.find(s => s === pair[0])) {
				return `${pair[0]}: SECRET, `;
			} else {
				return ` ${pair[0]}: ${pair[1]}`;
			}
		})}`);
		return next.handle().pipe(
			tap((res) => {
				this.logger.log(`ID: ${requestId}, Responding to ip ${req.ip} with ${JSON.stringify(res)}`);
			}),
			timeout(5000),
			catchError(err => {
				if (err instanceof TimeoutError) {
					this.logger.error(`Request timed out from ${req.ip}, time: ${this.generateTime()}`);
					throw new RequestTimeoutException()
				}
				throw err;
			}),
		)
	}

	private generateTime() {
		return `${new Date().getUTCDate()} ${new Date().getUTCMonth()} ${new Date().getUTCFullYear()} ${new Date().getUTCHours()}:${new Date().getUTCMinutes()}:${new Date().getUTCSeconds()}.${new Date().getUTCMilliseconds()}`;
	}
}
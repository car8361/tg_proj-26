import { ThrottlerGuard } from "@nestjs/throttler";
import { Request } from "express";
import {Injectable} from "@nestjs/common";

@Injectable()
export class UserIdThrottlerGuard extends ThrottlerGuard {
	async getTracker(req: Request): Promise<string> {
		const userId = req.session?.userId;
		return userId ? `user:${userId}` : `ip:${req.ip}`;
	}
}
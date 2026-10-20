import { z } from "zod";

export interface Login {
	identifier: string;
	password: string;
}

export const LoginZod = z.object({
	identifier: z.string(),
	password: z.string()
})

export interface Auth {
	userId: string;
	verified: string;
	username: string;
}

export const AuthZod = z.object({
	userId: z.string(),
	verified: z.boolean(),
	username: z.string()
})
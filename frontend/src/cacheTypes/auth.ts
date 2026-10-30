import { z } from "zod";

export interface Login {
	identifier: string;
	password: string;
}

export interface Register {
	username: string;
	email: string;
	password: string;
	confirmPassword: string;
}

export const RegisterZod = z.object({
	username: z.string().min(3, "Username too short").max(128, "Username too long"),
	email: z.string().min(3, "Email too short").max(128, "Email too long"),
	password: z.string().min(3, "Password too short").max(128, "Password too long"),
	confirmPassword: z.string().min(1),
}).refine((v) => {
	if (!(v.confirmPassword === v.password)) {
		console.log("Passwords don't match");
		return false;
	}
	return true;
}, { message: "Passwords don't match", path: ["confirmPassword"] })

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

export interface GetChats {
	chats: {
		chat_name: string;
		id: string;
	}[];
}

export interface FriendRequestReq {
	targetName: string;
}

export interface GetFriends {
	success: boolean;
	friends: {
		owner_username: string;
		other_username: string;
		owner_id: string;
		other_id: string;
	}[]
}

export interface GetMessages {
	messages: {

	}
}

export interface GetPending {
	success: boolean;
	invites: {
		invite_id: string,
		user_id: string,
		username: string,
		created_at: string
	}[]
}

export interface GetOutgoing {
	success: boolean;
	invites: {
		invite_id: string,
		user_id: string,
		username: string,
		created_at: string
	}[]
}
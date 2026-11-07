import {useMutation, useQuery, useSuspenseQuery} from "@tanstack/react-query";
import type {GetChat, GetChatMembers, GetChatMessages, GetChats, GetMessages} from "../../types/types.ts";
import { ChatType } from "../utils.ts";
import { statusWithMessage } from "../utils.ts";
import {queryClient} from "../../queryClient.ts";

export const useQueryChats = () => useQuery<GetChats>({
	queryKey: ["chats"],
	queryFn: async () => {
		const res = await fetch("/api/chats", {
			method: "GET",
			credentials: "include",
		});
		if (!res.ok) {
			throw new Error(statusWithMessage[res.status] ?? "Failed to fetch data");
		}
		return res.json();
	},
})

export const useQueryMessages = (chatId: string) => useSuspenseQuery<GetMessages>({
	queryKey: ["messages", chatId],
	queryFn: async (chatId) => {
		const res = await fetch(`/api/chats/messages/${chatId}`, {
			method: "GET",
			credentials: "include",
		});
		if (!res.ok) {
			throw new Error(statusWithMessage[res.status] ?? "Failed to fetch data");
		}
		return res.json();
	},
})

export const useMutationChat = () => useMutation({
	mutationFn: async ({chatType, targetId} : {chatType: ChatType, targetId?: string}) => {
		const res = await fetch("/api/chats", {
			method: "POST",
			credentials: "include",
			headers: {"Content-Type": "application/json"},
			body: JSON.stringify({chatType, targetId}),
		})
		if (!res.ok) {
			throw new Error(statusWithMessage[res.status] ?? "Failed to fetch data");
		}
		return res;
	},
	onSuccess: (res) => {
		if (res.ok) {
			queryClient.invalidateQueries({queryKey: ["chats"]});
			location.reload();
		}
	}
})

export const useMutationDeleteChat = () => useMutation({
	mutationFn: async (chatId: string) => {
		const res = await fetch(`/api/chats/${chatId}`, {
			method: "DELETE",
			credentials: "include",
		})
		if (!res.ok) {
			throw new Error(statusWithMessage[res.status] ?? "Failed to fetch data");
		}
		return res;
	},
	onSuccess: (res) => {
		if (res.ok) {
			queryClient.invalidateQueries({queryKey: ["chats"]});
			location.reload();
		}
	}
})

export const useQueryChatMembers = (chatId: string | null) => useQuery({
	queryKey: ["chat_members", chatId],
	queryFn: async (): Promise<GetChatMembers> => {
		const res = await fetch(`/api/chats/${chatId}/members`, {
			method: "GET",
			credentials: "include"
		})
		if (!res.ok) {
			throw new Error(statusWithMessage[res.status] ?? "Failed to fetch data");
		}
		return res.json();
	},
	enabled: chatId !== null,
})

export const useQueryChatMessages = (chatId: string | null) => useQuery({
	queryKey: ["chat_messages", chatId],
	queryFn: async (): Promise<GetChatMessages> => {
		const res = await fetch(`/api/chats/${chatId}/messages`, {
			method: "GET",
			credentials: "include"
		})
		if (!res.ok) {
			throw new Error(statusWithMessage[res.status] ?? "Failed to fetch data");
		}
		const data = res.json()
		console.log(`UQCM RECV: `, data)
		return data;
	},
	enabled: chatId !== null,
})

export const useMutationSendMessage = () => useMutation({
	mutationFn: async ({chatId, message} : {chatId: string, message: string}) => {
		const res = await fetch(`/api/chats/${chatId}/messages`, {
			method: "POST",
			credentials: "include",
			headers: {"Content-Type": "application/json"},
			body: JSON.stringify({message})
		})
		if (!res.ok) {
			throw new Error(statusWithMessage[res.status] ?? "Failed to fetch data");
		}
		return res;
	},
	onSuccess: (res, {chatId}) => {
		if (res.ok) {
			queryClient.invalidateQueries({queryKey: ["chat_messages", chatId]});
			location.reload()
		}
	}
})

export const useQueryChat = (chatId: string | null) => useQuery({
	queryKey: ["chat_details", chatId],
	queryFn: async (): Promise<GetChat> => {
		const res = await fetch(`/api/chats/${chatId}`, {
			method: "GET",
			credentials: "include",
		});
		if (!res.ok) {
			throw new Error(statusWithMessage[res.status] ?? "Failed to fetch data");
		}
		return res.json();
	},
	enabled: chatId !== null
})
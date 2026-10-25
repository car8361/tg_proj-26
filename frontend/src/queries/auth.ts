import {useMutation, useQuery, useSuspenseQuery} from "@tanstack/react-query";
import type {Auth, FriendRequestReq, GetChats, GetFriends, GetMessages, Register} from "../cacheTypes/auth.ts";
import { queryClient } from "../queryClient.ts";
import type { Login } from "../cacheTypes/auth.ts";
import {useNavigate} from "react-router";
import type {SetStateAction} from "react";

export const useQueryFnAuth = async () => {
	const res = await fetch("/api/auth/me");
	if (!res.ok) {
		throw new Error("Failed to fetch user data");
	}
	return res.json();
}

export const useSuspenseQueryAuth = () => useSuspenseQuery<Auth>({
	queryKey: ["auth"],
	queryFn: async () => {
		console.log("Fetching auth");
		const res = await fetch ("/api/auth/me");
		console.log(`AUTH RES STATUS: ${res.status}`)
		if (!res.ok) {
			throw new Error("Failed to fetch user data");
		}
		return res.json();
	}
})

export const useMutationLogout = () => useMutation({
	mutationFn: async () => {
		const res = await fetch ("/api/auth/logout", {
			method: "POST",
			credentials: "include",
			headers: {"Content-Type": "application/json"},
		});
		if (!res.ok) { throw new Error("Failed to logout user"); }
		return res.json();
	},
	onSuccess: () => {
		queryClient.invalidateQueries({queryKey: ["auth"]})
	}
})

export const useMutation2fa = () => useMutation({
	mutationFn: async (code: string) => {
		const res = fetch("/api/auth/2fa", {
			method: "POST",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({code})
		})
		return await res;
	},
	onSettled: async (res) => {
		if (res?.status === 409 || res?.status === 403) {
			await queryClient.invalidateQueries({queryKey: ["auth"]});
		}
	}
})

export const useMutationDeleteAccount = () => useMutation({
	mutationFn: async () => {
		const res = await fetch("/api/auth", {
			method: "DELETE",
			credentials: "include",
		})
		return await res;
	},
	onSuccess: (res) => {
		if (res.ok) {
			location.reload();
		}
	}
})

export const useMutationLogin = (setErrMsg: React.Dispatch<SetStateAction<string>>) => {
	const navigate = useNavigate();
	return useMutation({
		mutationFn: async (Data: Login) => {
			const res = fetch("/api/auth/login", {
				method: "POST",
				headers: {"Content-Type": "application/json"},
				body: JSON.stringify(Data),
				credentials: "include",
			})
			return await res;
		},
		onSuccess: (res) => {
			const status = Number(res.status);
			if (status >= 200 && status <= 299) {
				queryClient.invalidateQueries({ queryKey: ["auth"] })
				navigate("/")
			}
			if (status >= 400 && status < 500) {
				setErrMsg("Incorrect login details");
			} else if (status >= 500) {
				setErrMsg("Server error");
			}
		}
	})
}

export const useMutationRegister = (setErrMsg: React.Dispatch<SetStateAction<string>>) => {
	const navigate = useNavigate();
	return useMutation({
		mutationFn: async (Data: Register) => {
			const res = fetch("/api/auth/register", {
				method: "POST",
				headers: {"Content-Type": "application/json"},
				body: JSON.stringify(Data),
				credentials: "include",
			});
			return await res;
		},
		onSuccess: (res) => {
			const status = res.status;
			if (status >= 200 && status <= 299) {
				navigate("/login");
			}
			if (status >= 400 && status < 500) {
				if (status === 409) {
					return setErrMsg("Username or e-mail already taken")
				}
				setErrMsg("Incorrect registration data");
			} else if (status >= 500) {
				setErrMsg("Server error")
			}
		}
	})
}

export const useSuspenseQueryChats = () => useSuspenseQuery<GetChats>({
	queryKey: ["chats"],
	queryFn: async () => {
		const res = await fetch("/api/chats", {
			method: "GET",
			credentials: "include",
		});
		return res.json();
	},
})


export const useSuspenseQueryFriends = () => useSuspenseQuery<GetFriends>({
	queryKey: ["friends"],
	queryFn: async () => {
		const res = await fetch("/api/relations/my", {
			method: "GET",
			credentials: "include",
		});
		return res.json();
	},
})

export const useSuspenseQueryMessages = (chatId: string) => useSuspenseQuery<GetMessages>({
	queryKey: ["messages", chatId],
	queryFn: async (chatId) => {
		const res = await fetch(`/api/chats/messages/${chatId}`, {
			method: "GET",
			credentials: "include",
		});
		return res.json();
	},
})


export const useMutationChat = () => useMutation({
	mutationFn: async () => {
		const res = await fetch("/api/chats", {
			method: "POST",
			credentials: "include",
		})
		return res;
	},
	onSuccess: () => {
		queryClient.invalidateQueries({queryKey: ["chats"]});
		location.reload();
	}
})

export const useMutationFriendRequest = () => useMutation<GetFriends>({
	mutationFn: async (Data: FriendRequestReq) => {
		const res = await fetch("/api/relations/invites", {
			method: "POST",
			credentials: "include",
			headers: {"Content-Type": "application/json"},
			body: JSON.stringify(Data),
		})
		return res.json();
	}
})

export const useMutationDeleteChat = () => useMutation({
	mutationFn: async (chatId: string) => {
		const res = await fetch(`/api/chats/${chatId}`, {
			method: "DELETE",
			credentials: "include",
		})
		return res;
	},
	onSuccess: (res) => {
		if (res.ok) {
			queryClient.invalidateQueries({queryKey: ["chats"]});
			location.reload();
		}
	}
})
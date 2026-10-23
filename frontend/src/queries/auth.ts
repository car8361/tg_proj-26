import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import type {Auth} from "../cacheTypes/auth.ts";
import { queryClient } from "../queryClient.ts";

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
		const res = await fetch ("/api/auth/me");
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
	onSettled: (res) => {
		if (res?.status === 409) {
			queryClient.invalidateQueries({queryKey: ["auth"]});
			location.reload();
		}
	}
})
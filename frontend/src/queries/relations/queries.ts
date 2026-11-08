import type {SetStateAction} from "react";
import {useMutation, useQuery} from "@tanstack/react-query";
import type {FriendRequestReq, GetFriends, GetOutgoing, GetPending} from "../../types/types.ts";
import {queryClient} from "../../queryClient.ts";
import {statusWithMessage} from "../utils.ts";

export const useQueryFriends = () => useQuery<GetFriends>({
	queryKey: ["friends"],
	queryFn: async () => {
		const res = await fetch("/api/relations/friends", {
			method: "GET",
			credentials: "include",
		});
		if (!res.ok) {
			throw new Error(statusWithMessage[res.status] ?? "Failed to fetch data");
		}
		return res.json();
	},
})

export const useMutationFriendRequest = (setInviteRes: React.Dispatch<SetStateAction<string>>) => useMutation({
	mutationFn: async (Data: FriendRequestReq) => {
		const res = await fetch("/api/relations/invites/", {
			method: "POST",
			credentials: "include",
			headers: {"Content-Type": "application/json"},
			body: JSON.stringify(Data),
		})
		if (!res.ok) {
			res.status === 409 && setInviteRes("Friend request already sent");
			res.status === 404 && setInviteRes("User doesn't exist");
			throw new Error(statusWithMessage[res.status] ?? "Failed to fetch data");
		}
		return res;
	},
	onSuccess: (res) => {
		if (res.ok) {
			setInviteRes("Invite successfully sent!");
			location.reload();
		}
	}
})

export const useQueryPending = () => useQuery({
	queryKey: ["invites_pending"],
	queryFn: async (): Promise<GetPending> => {
		const res = await fetch(`/api/relations/invites/pending`, {
			credentials: "include",
		});
		if (!res.ok) {
			throw new Error(statusWithMessage[res.status] ?? "Failed to fetch data");
		}
		return res.json();
	},
})

export const useQueryOutgoing = () => useQuery({
	queryKey: ["invites_outgoing"],
	queryFn: async (): Promise<GetOutgoing> => {
		const res = await fetch(`/api/relations/invites/outgoing`, {
			credentials: "include",
		});
		if (!res.ok) {
			throw new Error(statusWithMessage[res.status] ?? "Failed to fetch data");
		}
		return res.json();
	},
})

export const useMutationInvitesDelete = () => useMutation({
	mutationFn: async (inviteId: string) => {
		const res = await fetch(`/api/relations/invites/${inviteId}`, {
			method: "DELETE",
			credentials: "include",
		});
		if (!res.ok) {
			throw new Error(statusWithMessage[res.status] ?? "Failed to fetch data");
		}
		return res;
	},
	onSuccess: (res) => {
		if (res.ok) {
			queryClient.invalidateQueries({queryKey: ["invites_pending"]});
			queryClient.invalidateQueries({queryKey: ["invites_outgoing"]});
			location.reload();
		}
	}
})

export const useMutationInvitesAccept = () => useMutation({
	mutationFn: async (inviteId: string) => {
		const res = await fetch(`/api/relations/invites/${inviteId}`, {
			method: "PATCH",
			credentials: "include",
		});
		if (!res.ok) {
			throw new Error(statusWithMessage[res.status] ?? "Failed to fetch data");
		}
		return res;
	},
	onSuccess: (res) => {
		if (res.ok) {
			queryClient.invalidateQueries({queryKey: ["friends"]});
			location.reload();
		}
	}
})

export const useMutationDeleteFriend = () => useMutation({
	mutationFn: async (targetId: string) => {
		console.log("FUNCTION GOT: ", targetId);
		const res = await fetch(`/api/relations/friends`, {
			method: "DELETE",
			credentials: "include",
			headers: {"Content-Type": "application/json"},
			body: JSON.stringify({targetId}),
		})
		if (!res.ok) {
			throw new Error(statusWithMessage[res.status] ?? "Failed to fetch data");
		}
		return res;
	},
	onSuccess: (res) => {
		if (res.ok) {
			queryClient.invalidateQueries({queryKey: ["friends"]});
			location.reload();
		}
	}
})
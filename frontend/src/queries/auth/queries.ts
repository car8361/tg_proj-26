import {useMutation, useQuery} from "@tanstack/react-query";
import type {Login, Register, Types} from "../../types/types.ts";
import {queryClient} from "../../queryClient.ts";
import type {SetStateAction} from "react";
import {useNavigate} from "react-router";
import { statusWithMessage } from "../utils.ts";


export const useQueryAuth = () => useQuery<Types>({
	queryKey: ["auth"],
	queryFn: async () => {
		console.log("Fetching auth");
		const res = await fetch ("/api/auth/me");
		console.log(`AUTH RES STATUS: ${res.status}`)
		if (!res.ok) {
			throw new Error(statusWithMessage[res.status] ?? "Failed to fetch data");
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
		if (!res.ok) {
			throw new Error(statusWithMessage[res.status] ?? "Failed to fetch data");
		}
		return res;
	},
	onSuccess: (res) => {
		if (res.ok) {
			queryClient.invalidateQueries({queryKey: ["auth"]})
			location.reload()
		}
	}
})

export const useMutation2fa = () => useMutation({
	mutationFn: async (code: string) => {
		const res = await fetch("/api/auth/2fa", {
			method: "POST",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({code})
		})
		if (!res.ok) {
			if (res.status === 409 || res.status === 403) {
				await queryClient.invalidateQueries({queryKey: ["auth"]});
				location.reload()
			}
			throw new Error(statusWithMessage[res.status] ?? "Failed to fetch data");
		}
		return res;
	},
})

export const useMutationDeleteAccount = () => useMutation({
	mutationFn: async () => {
		const res = await fetch("/api/auth", {
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
			queryClient.invalidateQueries({queryKey: ["auth"]});
			location.reload();
		}
	}
})

export const useMutationLogin = (setErrMsg: React.Dispatch<SetStateAction<string>>) => {
	const navigate = useNavigate();
	return useMutation({
		mutationFn: async (Data: Login) => {
			const res = await fetch("/api/auth/login", {
				method: "POST",
				headers: {"Content-Type": "application/json"},
				body: JSON.stringify(Data),
				credentials: "include",
			})
			if (!res.ok) {
				res.status < 500 ? setErrMsg("Incorrect login details") : setErrMsg("Server error");
				throw new Error(statusWithMessage[res.status] ?? "Failed to fetch data");
			}
			return res;
		},
		onSuccess: (res) => {
			const status = Number(res.status);
			if (status >= 200 && status <= 299) {
				queryClient.invalidateQueries({ queryKey: ["auth"] })
				navigate("/")
			}
		}
	})
}

export const useMutationRegister = (setErrMsg: React.Dispatch<SetStateAction<string>>) => {
	const navigate = useNavigate();
	return useMutation({
		mutationFn: async (Data: Register) => {
			const res = await fetch("/api/auth/register", {
				method: "POST",
				headers: {"Content-Type": "application/json"},
				body: JSON.stringify(Data),
				credentials: "include",
			});
			if (!res.ok) {
				switch (true) {
					case res.status === 409: setErrMsg("Username or e-mail already taken"); break;
					case res.status < 500 && res.status >= 400: setErrMsg("Incorrect registration data"); break;
					case res.status >= 500: setErrMsg("Server error"); break;
				}
				throw new Error(statusWithMessage[res.status] ?? "Failed to fetch data");
			}
			return res;
		},
		onSuccess: (res) => {
			const status = res.status;
			if (status >= 200 && status <= 299) {
				navigate("/login");
			}
		}
	})
}

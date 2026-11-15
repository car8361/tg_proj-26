import {useMutation, useQuery} from "@tanstack/react-query"
import {statusWithMessage} from "../utils.ts";
import type { GetMe } from "../../types/types.ts";

export const useQueryMe = () => useQuery({
	queryKey: ["me"],
	queryFn: async (): Promise<GetMe> => {
		console.log("FETCHING /ME");
		const res = await fetch("/api/me", {
			method: "GET",
			credentials: "include",
		});
		if (!res.ok) {
			throw new Error(statusWithMessage[res.status] ?? "Failed to fetch data");
		}
		return res.json();
	}
})

interface postPicture {
	url: string;
}

type formBody = { file: File };

export const useMutationPicture = () => useMutation({
	mutationFn: async (form: FormData) => {
		const value = form.get("file");
		const file = value instanceof File ? value : null;
		if (file === null) {
			throw new Error("Missing file")
		}

		const resPicture = await fetch("/api/me/picture", {
			method: "POST",
			credentials: "include",
		});

		if (!resPicture.ok) {
			throw new Error(statusWithMessage[resPicture.status] ?? "Failed to fetch data");
		}

		console.log("PRE JSON")

		const data = await resPicture.json()
		console.log("AFTER")

		const url = data.url;

		console.log("URL: ", url);
		if (file === null) {
			console.log("FILE IS NULL")
			throw new Error();
		}
		console.log(url);
		const resCf = await fetch(url, {
			method: "PUT",
			headers: {"Content-Type": file.type},
			body: file,
		})

		if (!resCf.ok) {
			throw new Error(statusWithMessage[resPicture.status] ?? "Failed to fetch data");
		}
	},
	onSuccess: async (res, form) => {
		location.reload();
	}
})
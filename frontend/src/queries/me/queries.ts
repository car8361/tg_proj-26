import { useQuery } from "@tanstack/react-query"
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
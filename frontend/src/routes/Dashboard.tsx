import { queryClient } from "../queryClient.ts";
import {useState} from "react";
import type {Auth} from "../cacheTypes/auth.ts";

function Dashboard() {
	const [cached, setCached] = useState<Auth | undefined>(queryClient.getQueryData<Auth>(["auth"]));

	return (
		<div>
			<h2 className="text-5xl text-center">Welcome back, {cached?.username}</h2>
		</div>
	);
}

export default Dashboard;
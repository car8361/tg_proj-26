import { queryClient } from "../queryClient.ts";
import {useState} from "react";
import type {Types} from "../types/types.ts";

function Dashboard() {
	const [cached, setCached] = useState<Types | undefined>(queryClient.getQueryData<Types>(["auth"]));

	return (
		<div>
			<h2 className="text-5xl text-center">Welcome back, {cached?.username}</h2>
		</div>
	);
}

export default Dashboard;
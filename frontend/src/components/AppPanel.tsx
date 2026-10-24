import DashboardButton from "./DashboardMenuButton.tsx";
import {type ReactNode, useEffect, useState} from "react";
import {useNavigate} from "react-router";
import type {Auth} from "../cacheTypes/auth.ts";
import {queryClient} from "../queryClient.ts";

function AppPanel({children} : { children?: ReactNode }) {
	const navigate = useNavigate();
	const [auth, setAuth] = useState<Auth | undefined>(undefined);

	useEffect(() => {
		const tempAuth = queryClient?.getQueryData<Auth>(["auth"])
		if (!tempAuth?.userId) {
			navigate("/login");
		}
		console.log(tempAuth)
		setAuth(tempAuth);
	}, [])
	return (
		<div className="grid grid-cols-[1fr_8fr] h-screen">
			<div className="bg-gray-800 w-full h-full text-center">
				<DashboardButton text="Dashboard" href="/dashboard" />
				<DashboardButton text="Chats" href="/chats" />
				<DashboardButton text="Friends" href="/friends" />
			</div>
			<div>
				{children}
			</div>
		</div>
	)
}

export default AppPanel;
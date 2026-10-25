import { useSuspenseQuery } from "@tanstack/react-query";
import {useState} from "react";
import {useNavigate} from "react-router";
import type { Auth } from "../cacheTypes/auth";
import {useMutationDeleteAccount, useMutationLogout} from "../queries/auth.ts";

function Header() {
	const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

	const { data } = useSuspenseQuery<Auth>({
		queryKey: ["auth"],
		queryFn: async () => {
			const res = await fetch ("/api/auth/me");
			if (!res.ok) { throw new Error("Failed to fetch user data"); }
			return res.json();
		}
	});

	return (
		<header className="flex items-center justify-center left-0 bottom-0 bg-black w-full text-white p-5">
			<p className="mr-auto">My app</p>
			<nav className="flex mr-auto gap-4">
				<a href="/home">Home</a>
				<a href="/api">API - swagger</a>
				{data.userId && (
					<a href="/dashboard">Dashboard</a>
				)}
			</nav>
			<p className="cursor-pointer" onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}>Logged in as: {data?.username ?? "Guest"}</p>
			<div className="relative">
				{isUserMenuOpen && (
					<UserMenu/>
				)}
			</div>
		</header>
	)
}

function UserMenu() {
	const navigate = useNavigate();

	const {data} = useSuspenseQuery<Auth>({
		queryKey: ["auth"],
		queryFn: async () => {
			const res = await fetch("/api/auth/me");
			if (!res.ok) {
				throw new Error("Failed to fetch user data");
			}
			return res.json();
		}
	});

	const logoutMut = useMutationLogout();
	const deleteMut = useMutationDeleteAccount();

	const loggedInButtons: Record<string, () => void> = {
		Logout: () => logoutMut.mutate(),
		"Delete Account": () => deleteMut.mutate(),
	}

	const loggedOutButtons: Record<string, () => void> = {
		Login: () => navigate("/login"),
	}

	return (
		<div id="header-user-menu-div">
			<div className="absolute mt-5 bg-white border border-black top-full right-0 px-5 rounded-2xl">
			{data.userId ?
				(Object.entries(loggedInButtons).map(([name, func]) => <Button name={name} func={func}></Button>))
				:
				(Object.entries(loggedOutButtons).map(([name, func]) => <Button name={name} func={func}></Button>))
			}
			</div>
		</div>
	)
}

function Button({name, func} : { name: string, func: () => void }) {
	return (<button className="text-black my-4 cursor-pointer hover:text-gray-500" onClick={func}>{name}</button>)
}

export default Header;
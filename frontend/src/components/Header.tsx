import { useSuspenseQuery } from "@tanstack/react-query";
import {useState} from "react";
import {useNavigate} from "react-router";
import type { Types } from "../types/types.ts";
import {useMutationDeleteAccount, useMutationLogout} from "../queries/auth/queries.ts";
import { House, Webhook, MessageSquareMore } from "lucide-react";
import {useFloating, autoUpdate, offset, shift} from '@floating-ui/react';

function Header() {
	const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

	const { data } = useSuspenseQuery<Types>({
		queryKey: ["auth"],
		queryFn: async () => {
			const res = await fetch ("/api/auth/me");
			if (!res.ok) { throw new Error("Failed to fetch user data"); }
			return res.json();
		}
	});

	const {refs, floatingStyles} = useFloating({
		whileElementsMounted: autoUpdate,
		placement: "bottom",
		middleware: [
			offset(8),
			shift({ padding: 0 })
		]
	});

	return (
		<header className={`
			flex flex-row justify-between items-center
			sticky left-0 bottom-0
			bg-digital-600 w-full text-white
			h-[5dvh]
			min-h-[50px]
			lg:text-2xl
		`}>
			<p className="ml-2 font-bold lg:ml-8">My app</p>
			<nav className="flex flex-1 m-5 gap-4 justify-center">
				<a href="/home" className="p-2 transition-all duration-150 hover:text-digital-100 cursor-pointer hover:translate-x-2">
					<House aria-hidden="true" className="lg:size-10" />
				</a>
				<a href="/api" className="p-2 transition-all duration-150 hover:text-digital-100 cursor-pointer hover:translate-x-2">
					<Webhook className="lg:size-10" />
				</a>
				{data.userId && (
					<a href="/app" className="p-2 transition-all duration-150 hover:text-digital-100 cursor-pointer hover:translate-x-2">
						<MessageSquareMore />
					</a>
				)}
			</nav>
			<div className="relative mr-2 lg:mr-8">
				<button ref={refs.setReference} className="cursor-pointer font-bold" onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}>{data?.username ?? "Guest"}</button>
				{isUserMenuOpen && (
					<UserMenu menuRef={refs.setFloating} style={floatingStyles} />
				)}
			</div>
		</header>
	)
}

function UserMenu({menuRef, style} : {menuRef: (node: HTMLElement | null) => void, style: React.CSSProperties}) {
	const navigate = useNavigate();

	const {data} = useSuspenseQuery<Types>({
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
		<ol ref={menuRef} style={style} className="bg-white p-1 absolute flex flex-col z-10  rounded-2xl border text-center">
			{data.userId ?
				(Object.entries(loggedInButtons).map(([name, func]) => <Button name={name} func={func}></Button>))
				:
				(Object.entries(loggedOutButtons).map(([name, func]) => <Button name={name} func={func}></Button>))
			}
		</ol>
	)
}

function Button({name, func} : { name: string, func: () => void }) {
	return (
		<li className={`
			w-full
		`}>
			<button className={`
				bg-digital-500 hover:bg-digital-400
				cursor-pointer
				text-white font-bold p-2 rounded-lg
				transition-all hover:-translate-x-1 duration-150
		`} onClick={func}>{name}</button>
		</li>
			)
}

export default Header;
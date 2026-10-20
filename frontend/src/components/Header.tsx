import {useMutation, useSuspenseQuery, useQueryClient} from "@tanstack/react-query";
import {useState} from "react";
import {useNavigate} from "react-router";
import type { Auth } from "../cacheTypes/auth";

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
				{!data.userId && (
					<>
						<a href="/login">Login</a>
						<a href="/register">Register</a>
					</>
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
	const queryClient = useQueryClient();
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

	const { mutate } = useMutation({
		mutationFn: async () => {
			const res =  fetch ("/api/auth/logout", {
				method: "POST",
				credentials: "include",
			});
			return await res;
		},
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: ["auth"] });
			location.reload();
		}
	})

	return (
		<>
			{data.userId ? (
				<div className="absolute mt-5 bg-white border border-black top-full right-0 p-5 rounded-2xl">
					<button onMouseEnter={(e) => e.currentTarget.style.color = "gray"} onMouseLeave={(e) => e.currentTarget.style.color = "black"} className="text-black cursor-pointer" onClick={() => mutate()}>Logout</button>
				</div>
			) : (
				<div className="absolute mt-5 bg-white border border-black top-full right-0 p-5 rounded-2xl">
					<button onMouseEnter={(e) => e.currentTarget.style.color = "gray"} onMouseLeave={(e) => e.currentTarget.style.color = "black"} className="text-black cursor-pointer" onClick={() => navigate("/login")}>Login</button>
				</div>
				)}
		</>
	)
}

export default Header;
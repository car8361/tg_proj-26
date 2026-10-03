import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import VerifyOverlay from "./components/VerifyOverlay";

type User = { userId: number; verified: boolean };

type UserCtx = {
	user: User | null;
	refresh: () => Promise<void>;
};

const UserContext = createContext<UserCtx | null>(null);

async function fetchMe(): Promise<User | null> {
	try {
		const res = await fetch("/api/auth/me", { credentials: "include" });
		return res.ok ? await res.json() : null;
	} catch {
		return null;
	}
}

export function UserProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	async function refresh() {
		setUser(await fetchMe());
	}

	useEffect(() => {
		console.log("User effect ran (User provider)");
		fetchMe().then((u) => {
			setUser(u);
			setLoading(false);
		});
	}, []);

	if (loading) return <p>Načítám...</p>;

	return (
		<UserContext.Provider value={{ user, refresh }}>
			{user && !user.verified ? <VerifyOverlay /> : children}
		</UserContext.Provider>
	);
}

// eslint-disable-next-line react-refresh/only-export-components
export function useUser() {
	const ctx = useContext(UserContext);
	if (!ctx) throw new Error("useUser musí být uvnitř <UserProvider>");
	return ctx;
}
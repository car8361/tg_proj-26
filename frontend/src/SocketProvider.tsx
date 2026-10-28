import {io, Socket} from "socket.io-client";
import {useSuspenseQueryAuth} from "./queries/auth.ts";
import {type ReactNode, useEffect} from "react";

const socket = io({
	autoConnect: false,
	withCredentials: true,
});

function SocketProvider({children}: {children: ReactNode}) {
	const auth = useSuspenseQueryAuth();
	const verified = auth.data.verified === "true";

	useEffect(() => {
		if (!verified) { return; }
		socket.on("connection", (socket: Socket) => {
			socket.emit("room:join")
		});
		socket.connect();
		return () => {
			socket.disconnect();
		}
	}, [verified])

	return (	
		<>
			{children}
		</>
	)
}

export default SocketProvider;


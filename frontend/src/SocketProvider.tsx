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
			socket.on("chats:messages:sent", (data: {senderName: string, userId: string, message: string}) => {})
			socket.on("chats:messages:delete", (data: { messageId: string }) => {})
			socket.on("chats:messages:delete", (data: { messageId: string }) => {})
			socket.on("chats:messages:update", (data: {userId: string, username: string, newMessage: string}) => {})
			socket.on("chats:update", (data: { chatId: string, name: string }) => {})
			socket.on("chats:delete", (data: { chatId: string}) => {})
			socket.on("chats:members:add", (data: { chatId: string }) => {})
			socket.on("chats:members:update", (data: { chatId: string }) => {})
			socket.on("chats:members:add", (data: { chatId: string }) => {})
			socket.on("chats:members:update", (data: { chatId: string }) => {})
			socket.on("chats:members:delete", (data: { chatId: string }) => {})
			socket.on("relations:invites:ingoing", (data: { username: string, userId: string }) => {})
			socket.on("relations:invites:delete", () => {})
			socket.on("relations:invites:accepted", () => {})
			socket.on("relations:friends:delete", () => {})
			socket.on("relations:blocks:block", () => {})
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


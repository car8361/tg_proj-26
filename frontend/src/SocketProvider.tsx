import {io, Socket} from "socket.io-client";
import {useQueryAuth} from "./queries/auth/queries.ts";
import {type ReactNode, useEffect} from "react";
import {queryClient} from "./queryClient.ts";

const socket = io({
	autoConnect: false,
	withCredentials: true,
});

function SocketProvider({children}: {children: ReactNode}) {
	const auth = useQueryAuth();
	const verified = auth.data ? auth.data.verified === "true" ? "true" : "false" : "false";

	useEffect(() => {
		if (!verified) { return; }
		socket.on("connection", (socket: Socket) => {
			socket.emit("room:join")
			socket.on("chats:messages:sent", (data: {chatId: string, senderName: string, userId: string, message: string}) => {queryClient.invalidateQueries({queryKey: ["chat_messages", data.chatId]})})
			socket.on("chats:messages:delete", (data: { messageId: string }) => {})
			socket.on("chats:messages:update", (data: {userId: string, username: string, newMessage: string}) => {})
			socket.on("chats:update", (data: { chatId: string, name: string }) => {})
			socket.on("chats:delete", (data: { chatId: string}) => {})
			socket.on("chats:members:add", (data: { chatId: string }) => { queryClient.invalidateQueries({queryKey: ["chat_members", data.chatId]})})
			socket.on("chats:members:update", (data: { chatId: string }) => {})
			socket.on("chats:members:delete", (data: { chatId: string }) => {})
			socket.on("relations:invites:ingoing", (data: { username: string, userId: string }) => {queryClient.invalidateQueries({queryKey: ["invites_pending"]})})
			socket.on("relations:invites:delete", () => {queryClient.invalidateQueries({queryKey: ["invites_pending"]}); queryClient.invalidateQueries({queryKey: ["invites_outgoing"]})})
			socket.on("relations:invites:accepted", () => {queryClient.invalidateQueries({queryKey: ["invites_pending"]}); queryClient.invalidateQueries({queryKey: ["invites_outgoing"]}); queryClient.invalidateQueries({queryKey: ["friends"]})})
			socket.on("relations:friends:delete", () => {})
			socket.on("relations:blocks:block", () => {})
			socket.on("relations:blocks:unblock", () => {})
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


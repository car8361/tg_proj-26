import {
	useMutationChat,
	useQueryChatMembers,
	useMutationDeleteChat,
	useSuspenseQueryChats,
	useQueryChatMessages,
	useMutationSendMessage, useQueryChat
} from "../queries/queries.ts";
import {Fragment, useState} from "react";
import {useNavigate, useParams} from "react-router";

function Chats() {
	const navigate = useNavigate();
	const { chatId } = useParams();
	console.log(`CHAT ID: ${chatId}`)

	const { data } = useSuspenseQueryChats();
	const chatData = useQueryChat(chatId);
	console.log("CHAT DATA", chatData.data);
	const chatMut = useMutationChat();
	const chatDeleteMut = useMutationDeleteChat();
	const chatMembers = useQueryChatMembers(chatId);
	const chatMessages = useQueryChatMessages(chatId);
	const sendMessageMut = useMutationSendMessage();

	return (
		<div className="flex flex-row h-full">
			<div className="w-fit h-full bg-gray-100 border border-black">
				<button className="border border-black rounded-md p-2 cursor-pointer" onClick={() => chatMut.mutate()}>Create chat</button>
				<h2>Your chats</h2>
				<div className="flex-row">
					{data.chats.length > 0 ?
						data.chats.map((r, i) => (
							<div className="border border-black">
								<button className="m-2 p-2 border border-black rounded-md cursor-pointer" onClick={() => {navigate(`/chats/${r.id}`)}}>{r.chat_name}</button>
								<button className="m-2 p-2 border border-black rounded-md cursor-pointer" onClick={() => {console.log("DELETING CHAT ID: ", r.id); chatDeleteMut.mutate(r.id)}}>Delete chat</button>
								<button className="m-2 p-2 border border-black rounded-md cursor-pointer">Add member</button>
							</div>
						)
						) : (
						<div>No chats found.</div>
					)
					}
				</div>
			</div>
			{chatId !== undefined && (
					<div className="w-full h-full bg-gray-500 grid grid-rows-[1fr_19fr]">
						<div className="border border-black text-2xl grid items-center">
							{chatData.data?.chat.chat_name ?? "Invalid chat"}
						</div>
						<div className="bg-white grid grid-cols-[6fr_1fr] grid-rows-[19fr_1fr]">
							<div className="bg-gray-500 col-[2] row-span-full flex flex-col">
								<h2>Members</h2>
								{chatMembers.data?.members && chatMembers.data?.members.map((m, i) => (
									<div>{m.username}</div>
								))}
							</div>
							<div className="col-[1]">
								{(chatMessages.data && chatMessages.data?.messages.length > 0) ? (chatMessages.data?.messages.map((m, i) => (
									<>
										<div>{m.created_at} {m.username}:</div>
										<div>{m.msg}</div>
									</>
								))) : (
									<div>No messages found.</div>
								)}
							</div>
							<input className="border border-black" placeholder="Type text here, then press enter" onKeyDown={(e) => {
								if (e.key === "Enter") {
									console.log(`CHAT ID: ${chatId}, MESSAGE: ${e.currentTarget.value}`)
									sendMessageMut.mutate({chatId, message: e.currentTarget.value});
								}
							}}/>
						</div>
					</div>
			)}
		</div>
	)
}

export default Chats;
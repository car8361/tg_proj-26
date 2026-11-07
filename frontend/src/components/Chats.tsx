import {
	useQueryChatMembers,
	useQueryChatMessages,
	useMutationSendMessage,
	useQueryChat
} from "../queries/chats/queries.ts";

import {UsersRound} from "lucide-react";

function Chats({chatId} : {chatId: string}) {
	const chatData = useQueryChat(chatId);
	const chatMembers = useQueryChatMembers(chatId);
	const chatMessages = useQueryChatMessages(chatId);
	const sendMessageMut = useMutationSendMessage();

	return (
		<div className={"flex flex-1 flex-row"}>
			{chatId !== undefined && (
					<div className="w-full bg-gray-100 grid grid-rows-[1fr_19fr]">
						<div className="border border-white text-2xl grid items-center p-2 rounded-bl-2xl">
							{chatData.data?.chat.chat_name ?? "Invalid chat"}
						</div>
						<div className="bg-white grid grid-cols-[6fr_1fr] grid-rows-[19fr_1fr]">
							<div className=" col-[2] bg-gray-100  row-span-full flex flex-col">
								<div className={"flex flex-row justify-center p-2 items-center border-b"}>
									<UsersRound />
									<h2 className={"text-2xl"}>Members</h2>
								</div>
								<div className={"bg-gray-100"}>
									{chatMembers.data?.members && chatMembers.data?.members.map((m, i) => (
										<div>{m.username}</div>
									))}
								</div>
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
									if (e.currentTarget.value.length === 0 || !chatId) {
										console.log("RETURN MESS")
										return;
									}
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
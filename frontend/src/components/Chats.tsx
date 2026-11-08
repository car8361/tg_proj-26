import {
	useQueryChatMembers,
	useQueryChatMessages,
	useMutationSendMessage,
	useQueryChat, useQueryChatUserPrivilages, useMutationAddMember, useQueryAddChatMember, useMutationUpdChat
} from "../queries/chats/queries.ts";

import {UsersRound, Plus, Pencil} from "lucide-react";
import FixedContainer from "./FixedContainer.tsx";
import {useState} from "react";
import {queryClient} from "../queryClient.ts";
import {useQueryFriends} from "../queries/relations/queries.ts";

function Chats({chatId} : {chatId: string}) {
	const [membersOpen, setMembersOpen] = useState(false);
	const [chatName, setChatName] = useState<string | null>(null);

	const chatData = useQueryChat(chatId);
	const chatMembers = useQueryChatMembers(chatId);
	const chatMessages = useQueryChatMessages(chatId);
	const sendMessageMut = useMutationSendMessage();
	const userChatPrivelages = useQueryChatUserPrivilages(chatId);
	const addChatMember = useMutationAddMember();
	const userFriends = useQueryFriends();
	const updChatMut = useMutationUpdChat();

	return (
		<div className={"flex flex-1 flex-row"}>
			{chatId !== undefined && (
					<div className="w-full bg-gray-100 grid grid-rows-[1fr_19fr]">
						{(userChatPrivelages.data?.privilage === "OWNER" || userChatPrivelages.data?.privilage === "ADMIN") ? (
							<input className="border border-white text-2xl grid items-center p-2 rounded-bl-2xl transition-colors hover:text-gray-400"
							       value={chatName !== null ? chatName : chatData.data?.chat.name } onChange={(e) => {setChatName(e.currentTarget.value)}}
							       onBlur={() => {
									   if (!chatName || !chatData.data?.chat || chatData.data?.chat.name === chatName) {
										   return;
									   }
										updChatMut.mutate({chatId: chatData.data?.chat.id, name: chatName});
								   }}
							></input>
						) : (
							<div className="border border-white text-2xl grid items-center p-2 rounded-bl-2xl">
								{chatData.data?.chat.name ?? "Invalid chat"}
							</div>
						)}
						<div className="bg-white grid grid-cols-[6fr_1fr] grid-rows-[19fr_1fr]">
							<div className=" col-[2] bg-gray-100  row-span-full flex flex-col">
								<div className={"flex flex-row justify-center p-2 items-center border-b"}>
									<div className={"flex flex-row justify-center p-2 items-center mr-auto"}>
										<UsersRound />
										<h2 className={"text-2xl"}>Members</h2>
									</div>
									<Plus width="40" height="40" className="cursor-pointer" onClick={() => (setMembersOpen(true))} />
								</div>
								{membersOpen && (<div className="fixed left-[50%] top-[50%] translate-[-50%] border border-black rounded-2xl bg-white w-[20dvw] h-[40dvh] overflow-y-scroll">
									<p className="p-6 text-2xl border-b w-[80%] text-center m-auto">Add a friend to your chat!</p>
									<div className="w-[60%] border m-auto text-left">
										{userFriends.data && userFriends.data.friends.map(f => {
											if (chatMembers.data && chatMembers.data.members.find(m => m.username === f.other_username)) {
												return (<button className="">{f.other_username}</button>)
											}
											return <button>{f.other_username}</button>
										})}
									</div>
								</div>)}
								<div className={"bg-gray-100"}>
									{chatMembers.data?.members && chatMembers.data?.members.map((m, i) => (
										<div>{m.username}</div>
									))}
								</div>
							</div>
							<div className="col-[1] w-full overflow-y-scroll wrap-break-word text-2xl">
								{(chatMessages.data && chatMessages.data?.messages.length > 0) ? (chatMessages.data?.messages.map((m, i) => (
									<>
										<div className="flex flex-row gap-4 items-center">
											<p className="text-2xl">{m.username}</p>
											<p className="text-xl">{m.created_at}</p>
										</div>
										<p>{m.msg}</p>
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
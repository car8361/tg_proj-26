import {
	useMutationAddMembers,
	useMutationSendMessage,
	useMutationUpdChat,
	useQueryChat,
	useQueryChatMembers,
	useQueryChatMessages,
	useQueryChatUserPrivilages
} from "../queries/chats/queries.ts";

import {Check, Plus, UsersRound, X, SendHorizontal} from "lucide-react";
import {useState} from "react";
import {useQueryFriends} from "../queries/relations/queries.ts";
import type {GetChatMembers, GetFriends} from "../types/types.ts";
import {ChatType} from "../queries/utils.ts";

function Chats({chatId} : {chatId: string}) {
	const [membersOpen, setMembersOpen] = useState(false);
	const [chatName, setChatName] = useState<string | null>(null);
	const [inputValue, setInputValue] = useState<string>("");

	const chatData = useQueryChat(chatId);
	const chatMembers = useQueryChatMembers(chatId);
	const chatMessages = useQueryChatMessages(chatId);
	const sendMessageMut = useMutationSendMessage();
	const userChatPrivelages = useQueryChatUserPrivilages(chatId);
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
									{chatData.data?.chat.type === ChatType.GROUP && (
										<Plus width="40" height="40" className="cursor-pointer" onClick={() => (setMembersOpen(true))} />
									)}
								</div>
								{membersOpen && (
									<AddMemberDiv chatId={chatData.data!.chat.id} chatMembers={chatMembers.data} userFriends={userFriends.data} setOpen={setMembersOpen} />
								)}
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
											<p className="text-xl">{normalDate(m.created_at)}</p>
										</div>
										<p>{m.msg}</p>
									</>
								))) : (
									<div>No messages found.</div>
								)}
							</div>
							<div className="border flex flex-row items-center text-2xl">
								<Plus className="transition-colors transition-duration-300 cursor-pointer hover:text-gray-400" width={40} height={40} />
								<input className="flex-1 h-full focus:outline-none" placeholder="Hello, world!" onChange={(e) => setInputValue(e.currentTarget.value)} onKeyDown={(e) => {
									if (e.key === "Enter") {
										if (e.currentTarget.value.length === 0 || !chatId) {
											console.log("RETURN MESS")
											return;
										}
										sendMessageMut.mutate({chatId, message: e.currentTarget.value});
									}
								}}/>
								<SendHorizontal className="transition-colors transition-duration-300 cursor-pointer hover:text-gray-400" width={40} height={40}
								onClick={(e) => {
									if (inputValue.length === 0 || !chatId) {
										return;
									}
									sendMessageMut.mutate({chatId, message: inputValue});
								}}
									/>
							</div>
						</div>
					</div>
			)}
		</div>
	)
}

function normalDate(date: string) {
	return date.split('.')[0].replace(/-/g, ".").replace(/T/, " ");
}

function AddMemberDiv({chatId, userFriends, chatMembers, setOpen} : {chatId: string, userFriends: GetFriends | undefined, chatMembers: GetChatMembers | undefined, setOpen: React.Dispatch<React.SetStateAction<boolean>>}) {
	const [addToChatIds, setAddToChatIds] = useState<string[]>([]);
	const addToChat = useMutationAddMembers();

	return (
		<div className="fixed left-[50%] top-[50%] translate-[-50%] flex flex-col border border-black rounded-md bg-white w-[20dvw] h-[40dvh] overflow-hidden">
			<X width="40" height="40" className="absolute top-0 right-0 cursor-pointer" onClick={() => {setOpen(false)}}/>
			<p className="p-6 text-2xl border-b w-[80%] text-center mx-auto">Add a friend to your chat!</p>
			<div className="w-[60%] flex-1 overflow-y-scroll mx-auto text-left pt-5">
				{userFriends && userFriends.friends.map(f => {
					if (chatMembers && chatMembers.members.find(m => m.username === f.other_username)) {
						return (<div className="">{f.other_username}<Check className="ml-auto text-black" /></div>)
					}
					if (addToChatIds.find(i => i === f.other_id)) {
						return (
							<div className="flex flex-row w-full">
								<p>{f.other_username}</p>
								<X className="ml-auto cursor-pointer text-black transition-colors hover:text-gray-500"
								   onClick={() => {
									   setAddToChatIds(old => old.splice(old.indexOf(f.other_id), 1))
								   }}
								/>
							</div>
						)
					}
					return <div className="flex flex-row w-full">
						<p>{f.other_username}</p>
						<Plus className="ml-auto cursor-pointer text-black transition-colors hover:text-gray-500"
						      onClick={() => {
								  setAddToChatIds(old => [...old, f.other_id])
							  }}
						/>
					</div>
				})}
			</div>
			<button className={`mt-auto ${addToChatIds.length > 0 ? "bg-blue-500 cursor-pointer" : "bg-blue-400"} w-[98%] rounded-md text-2xl mx-auto mb-1 transition-colors hover:bg-blue-400`}
				onClick={() => {
					if (addToChatIds.length === 0) {
						return;
					}
					addToChat.mutate({chatId, targetIds: addToChatIds});
				}}
			>
				<p className="m-auto">Confirm</p>
			</button>
		</div>
	)
}

export default Chats;
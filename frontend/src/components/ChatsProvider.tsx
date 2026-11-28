import {
	useMutationAddMembers, useMutationChat, useMutationChatPicture,
	useMutationDeleteChat, useMutationDeleteMessage, useMutationPatchMessage,
	useMutationSendMessage,
	useMutationUpdChat,
	useQueryChat,
	useQueryChatMembers,
	useQueryChatMessages, useQueryChats,
	useQueryChatUserPrivilages
} from "../queries/chats/queries.ts";

import {Check, Plus, UsersRound, X, ChevronDown, ChevronLeft, SendHorizonal, FaceSlightlySmilingPlus, Search, FaceSlightlySmiling, Leaf, Soup, Activity, TrainHighSpeed, LampDesk, Asterisk, Flag, Motorbike} from "lucide-react";
import { useEffect, useMemo, useRef, useState} from "react";
import type {GetChatMembers, GetChatMessages, GetChats, GetFriends} from "../types/types.ts";
import {ChatType} from "../queries/utils.ts";
import {useNavigate, useParams, useSearchParams} from "react-router";
import React from "react";
import EmojisJSON from "../emojis.json";
import Confirm from "./Confirm";
import {
	autoUpdate,
	flip,
	offset,
	shift,
	useClick,
	useDismiss,
	useFloating,
	useInteractions,
	useTransitionStatus
} from "@floating-ui/react";

function ChatsProvider() {
	console.log("render provider")
	const navigate = useNavigate();
	const [params, setParams] = useSearchParams();

	const {data: chatsData, isLoading: chatsLoading} = useQueryChats();

	const chatId = params.get("chatId");
	const showMembers = params.get("showMembers");
	const selectedChat = useMemo(() => {
		return chatsData?.chats.find(c => String(c.id) === String(chatId)) ?? null;
	}, [chatsData, chatId])

	/*const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		console.log("INPUT CURRENT: ", inputRef.current);
		inputRef.current?.focus();
	}, [])*/

	type list = "menu" | "chat" | "members";
	//const show = (v: list) => selectedChat ? v === "chat" ? "flex" : v === "members" ? "flex" : "hidden" : v === "menu" ? "flex" : "hidden";
	const show = (v: list) => {
		if (v === "members" && showMembers && selectedChat) {
			return "flex";
		}
		if (v === "chat" && selectedChat && !showMembers) {
			return "flex";
		}
		if (v === "menu" && !selectedChat) {
			return "flex";
		}
		return "hidden"
	}
	console.log({ selectedChat, showMembers, chat: show("chat"), menu: show("menu") });
	return (
		<div className="flex min-h-dvh">
			<aside className={`${show("menu")} w-full`}>
				<ChatsMenu chatsData={chatsData} chatsLoading={chatsLoading} />
			</aside>
			{selectedChat && (
				<section className={`${show("chat")} flex-1 min-w-0 flex-col`}>
					<LoadingChat loading={chatsLoading} length={8}>
						<Chat selectedChat={selectedChat} chatId={chatId!} />
					</LoadingChat>
				</section>
			)}
			{selectedChat && (
				<aside className={`${show("members")} w-full`}>
					<Members selectedChat={selectedChat} chatId={chatId}/>
				</aside>
			)}
		</div>
	)
}

function Members({selectedChat, chatId, className} : {selectedChat: { name: string }, chatId: string | null, className?: string}) {
	const [searchValue, setSearchValue] = useState("");
	const navigate = useNavigate();
	const {data: membersData} = useQueryChatMembers(chatId);

	useEffect(() => {
		window.scrollTo(0, 0);
	}, [])

	return (
		<div className={`flex flex-col flex-1 ${className}`}>
			<div className="flex h-10 flex-row justify-between h-12 border-y border-y-white sticky top-0 bg-gray-100">
				<button className="cursor-pointer bg-white group transition-all duration-150 px-2 rounded-r-full" onClick={() => {navigate(`/app?navigation=chats&chatId=${chatId}`);}}>
					<X className="size-10 group-hover:-translate-x-1" />
				</button>
				<input value={searchValue} onChange={(e) => setSearchValue(e.currentTarget.value)} className="outline-none px-2 text-center truncate" placeholder={"search members"}/>
				<button className="cursor-pointer bg-white group transition-all duration-150 px-2 rounded-l-full" onClick={() => {}}>
					<Search className="size-10 group-hover:-translate-x-1" />
				</button>
			</div>
			<div className="flex flex-col my-2 gap-2 w-[90%] mx-auto">
				{membersData?.members.map((m, i) => (
					<div className="bg-white rounded-xl">
						<div className="flex flex-row p-2">
							<img src={m.picture} alt="pfp" className="rounded-full aspect-square h-15" />
							<div className="mb-auto ml-2 overflow-hidden">
								<h2 className="truncate">{m.display_name}</h2>
								<p className="truncate text-gray-500">@{m.username}</p>
							</div>
						</div>
					</div>
					))}
			</div>
		</div>
	)
}

function Chat({selectedChat, chatId, className} : {selectedChat: { name: string }, chatId: string, className?: string}) {
	console.log("render");
	const navigate = useNavigate();
	const {data: md, isLoading: messagesLoading} = useQueryChatMessages(chatId);
	const messages = md?.messages

	const [fastScrollVisible, setFastScrollVisible] = useState(false);

	const sendMessage = useMutationSendMessage();
	const [inputValue, setInputValue] = useState("");

	const [emojisActive, setEmojisActive] = useState<boolean>(false);
	const {refs, floatingStyles, context} = useFloating({
		open: emojisActive,
		onOpenChange: setEmojisActive,
		placement: "top-start",
		whileElementsMounted: autoUpdate,
		middleware: [
			offset(8),
			flip(),
			shift({padding: 8})
		]
	});

	const click = useClick(context);
	const dismiss = useDismiss(context);


	const {getReferenceProps, getFloatingProps} = useInteractions([click, dismiss]);

	const {isMounted, status} = useTransitionStatus(context, {duration: 200});

	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		inputRef.current?.focus();
		const observer = new IntersectionObserver((entries) => {
			setFastScrollVisible(!entries[0].isIntersecting);
		})

		if (inputRef.current) observer.observe(inputRef.current);

		return () => observer.disconnect();
	}, [])

	const emojiSectionsSymbols = [
		{"smileys": <FaceSlightlySmiling />},
		{"people": <Leaf />},
		{"nature": <Soup />},
		{"food": <Activity />},
		{"travel": <TrainHighSpeed />},
		{"activities": <Motorbike />},
		{"objects": <LampDesk />},
		{"symbols": <Asterisk />},
		{"flags": <Flag />}
	]

	const emojiDivRef = useRef<HTMLDivElement>(null);

	return (
		<div className={`flex flex-1 flex-col font-bold relative ${className}`}>
			<div className="flex h-10 flex-row h-12 border-y border-y-white  sticky top-0 bg-gray-100 z-50">
				<button className="cursor-pointer bg-white group transition-all duration-150 px-2 rounded-r-full" onClick={() => {navigate("/app?navigation=chats");}}>
					<ChevronLeft className="size-10 group-hover:-translate-x-1" />
				</button>
				<h1 className={"mx-auto min-w-0 truncate text-3xl my-auto"}>{selectedChat.name}</h1>
				<button className="cursor-pointer bg-white transition-all duration-150 rounded-l-full px-2" onClick={() => {navigate("/app?navigation=chats&chatId=6&showMembers=true")}}>
					<UsersRound className="size-10 my-auto mx-auto" />
				</button>
			</div>
			<div className="flex flex-col flex-1 relative">
				<div className="flex flex-col w-[90%] mx-auto group">
					{messages && messages.length > 0 ?
						messages.map((c, i) => (
							<div className="flex flex-row gap-2 max-w-full overflow-hidden my-4 hover:group-bg-">
								<img src={c.picture} className="rounded-full aspect-square h-10" />
								<div className="flex flex-col gap-2">
									<p className="mb-auto truncate">{c.display_name}</p>
									<p className="break-all">{c.msg}</p>
								</div>
							</div>
						))
						: (
							<h2 className="mx-auto my-auto text-4xl text-balance text-center">No chat messages!</h2>
						)}
				</div>
				{fastScrollVisible && (
					<button className={`
					z-50 left-1/2 -translate-x-1/2 bottom-5
					w-fit bg-blue-500 sticky mb-5 animate-jiggle-y rounded-full cursor-pointer`}
							onClick={() => {inputRef.current?.scrollIntoView({behavior: "smooth", block: "end"});}}
					>
						<ChevronDown className="size-10 lg:size-15 text-white" />
					</button>
				)}
			</div>
			<div className="flex gap-2 h-6dvh min-h-[50px] bg-white">
				<button className="my-auto ml-2"><Plus className="lg:size-10 size-8"/></button>
				<input className="flex flex-1 min-w-0 outline-none"
					   ref={inputRef}
					   value={inputValue}
					   onChange={(e) => setInputValue(e.currentTarget.value)}
					   onKeyDown={(e) => {
					if (e.key === "Enter") {
						e.currentTarget.value.length > 0 && sendMessage.mutate({
							message: e.currentTarget.value,
							chatId: chatId
						});
					}
				}} />
				<button className="my-auto" onClick={() => {inputValue.length > 0 && sendMessage.mutate({message: inputValue, chatId: chatId})}}>
					<SendHorizonal className="lg:size-10 size-8 cursor-pointer" />
				</button>
				<button ref={refs.setReference} {...getReferenceProps()} className="my-auto mr-2 cursor-pointer" onClick={() => setEmojisActive(v => !v)}>
					<FaceSlightlySmilingPlus className="lg:size-10 size-8"/>
				</button>
				{isMounted && (
					<div ref={refs.setFloating} {...getFloatingProps()} style={floatingStyles} className="w-[75%] h-[50%] z-51">
						<div data-status={status} className={`flex w-full h-full flex-col bg-white rounded-2xl
							origin-bottom transition duration-0
							data-[status=open]:duration-200 data-[status=close]:duration-200
    						data-[status=initial]:opacity-0 data-[status=initial]:scale-95
    						data-[status=close]:opacity-0 data-[status=close]:scale-95"
						`}
							 onBlur={(e) => {if (!e.currentTarget.contains(e.relatedTarget)) setEmojisActive(false);}}
						>
							<div className={`grid grid-cols-3 gap-1
								*:rounded-xl *:p-2 *:text-[clamp(0.8em,2xl,1em)]
								*:bg-gray-100 m-2
								`}>
								<button className={`text-[clamp(0.8em,4vw,1em)] truncate cursor-pointer`}>Emojis</button>
								<button className={`text-[clamp(0.8em,4vw,1em)] truncate cursor-pointer`}>Gifs</button>
								<button className={`text-[clamp(0.8em,4vw,1em)] truncate cursor-pointer`}>Stickers</button>
							</div>
							<div className="flex flex-row w-full h-full mx-auto my-auto p-2 min-h-0">
								<div className="flex flex-col p-1 overflow-y-scroll">
									{emojiSectionsSymbols.map((v, i) => (
										<button
											onClick={() => {
												if (!emojiDivRef.current) return;
												const target = emojiDivRef.current.querySelector<HTMLElement>(`[data-section=${Object.entries(v).map(([name, _]) => name)}]`);
												if (!target) return;
												target.scrollIntoView({behavior: "smooth", block: "start"});
											}}
											className="p-1 shrink-0 cursor-pointer hover:outline-1 rounded-lg hover:outline-gray-500 hover:bg-gray-200">{Object.entries(v).map(([name, Node]) => (
											Node
										))}</button>
									))}
								</div>
								<div ref={emojiDivRef} className="flex flex-1 min-w-0  flex-row flex-wrap justify-between bg-gray-100 rounded-lg overflow-y-scroll">
									{Object.entries(EmojisJSON).map(([section, list]) => {
										return (
											<div key={section} className="flex flex-col">
												<div className="bg-gray-200 sticky top-0">
													<div className="flex flex-row font-bold text-center text-3xl mx-auto w-fit">
														<div className={`self-center`}>
															{emojiSectionsSymbols.map((v, i) => Object.entries(v).map(([name, Node]) => {if (name === section) return Node;}))}
														</div>
														<h2 data-section={section} className="lowercase first-letter:uppercase">{section}</h2>
													</div>
												</div>
												<div className="flex flex-row flex-wrap justify-between m-1">
													{Object.entries(list).map(([value, emoji]) => (
														<button className="text-4xl hover:outline-1 hover:outline-gray-300 rounded-lg hover:bg-gray-200"
														onClick={() => setInputValue(v => v + emoji)}
														>
															{emoji}
														</button>
													))}
												</div>
											</div>
										)
									})}
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}

function ChatsMenu({chatsData, chatsLoading} : {chatsData: GetChats | undefined, chatsLoading: boolean}) {
	const navigate = useNavigate();

	const createChat = useMutationChat();
	const deleteChat = useMutationDeleteChat();

	const [confirmActive, setConfirmActive] = useState<boolean>(false);
	const deleteChatId = useRef<string>("");
	const confirmData = {
		title: "Are you sure you want to delete this chat? This action cannot be undone.",
		onAccept: () => deleteChat.mutate(deleteChatId.current),
		onReject: () => {},
		setActive: setConfirmActive
	};

	window.scrollTo(0, 0);

	return (
		<div className="flex flex-1 flex-col">
			<div className={`
					w-[90%]
					mx-auto
				`}>
				<div className="flex flex-row my-4 bg-digital-50 rounded-lg justify-between">
					<h2 className={`
							font-bold text-center text-digital-600 text-4xl
						`}>Chats</h2>
					<button className="group">
						<Plus className="size-10 text-digital-600 group-hover:rotate-10 transition-all duration-150 cursor-pointer" onClick={() => createChat.mutate({chatType: ChatType.GROUP})} />
					</button>
				</div>
			</div>
			<div className="flex flex-1 flex-col gap-1 overflow-y-scroll w-[90%] mx-auto">
				<LoadingChat loading={chatsLoading} length={8}>
					{chatsData?.chats.map((c, i) => (
						<div className={`bg-gray-200 rounded-lg px-2 h-20 flex group cursor-pointer`}>
							<div className="flex flex-row gap-2" onClick={() => { navigate("/app?navigation=chats&chatId=" + c.id)}}>
								<img src={c.picture} className={`h-[90%] rounded-full aspect-square my-auto`} />
								<p className={`self-center pl-2 text-2xl truncate text-white font-bold`}>{c.name}</p>
							</div>
							<button className="my-auto ml-auto mr-2 cursor-pointer" onClick={() => { deleteChatId.current = c.id; setConfirmActive(true);}}>
								<X className={`size-10 text-transparent text-white`}/>
							</button>
							{confirmActive && (
								<Confirm data={confirmData} />
							)}
						</div>
					))}
				</LoadingChat>
			</div>
		</div>
	)
}

function LoadingChat({loading, length, children} : {loading: boolean, length: number, children?: React.ReactNode}) {
	return loading ? (
		Array.from({length: length}).map((_, i) => (
			<div className="bg-gradient-to-r from-gray-200 via-digital-100 to-gray-200 h-[10vh] rounded-2xl [background-size:200%_100%] animate-shimmer">
			</div>
			))
	) : (
		children
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

export default ChatsProvider;

/*
const chatData = useQueryChat(chatId);
	const chatMembers = useQueryChatMembers(chatId);
	const chatMessages = useQueryChatMessages(chatId);
	const sendMessageMut = useMutationSendMessage();
	const userChatPrivelages = useQueryChatUserPrivilages(chatId);
	const userFriends = useQueryFriends();
	const updChatMut = useMutationUpdChat();
	const delMessage = useMutationDeleteMessage();
	const changeMessage = useMutationPatchMessage();
	const chatPictureMut = useMutationChatPicture();
	const pictureRef = useRef<HTMLInputElement>(null);
 */

/*
{(chatId !== undefined && chatData.data?.chat) && (
					<div className="w-full bg-gray-100 grid grid-rows-[1fr_19fr]">
						<div className="flex flex-row border border-white text-2xl items-center">
							<img className={`ml-4 rounded-full h-[3vh] aspect-square ${chatData.data?.chat.type === ChatType.GROUP && " cursor-pointer hover:opacity-[0.8]"}`} src={chatData.data?.chat.picture}
							     onClick={() =>  {
									if (chatData.data?.chat.type === ChatType.GROUP) {
										pictureRef.current?.click();
									}
								 }}
							     alt="img" />
							<input type="file" className="sr-only" ref={pictureRef}
								   onChange={(e) => {
									   if (e.currentTarget.files?.[0] === undefined) { return; }
									   const form = new FormData();
									   form.append("file", e.currentTarget.files[0])
									   chatPictureMut.mutate({form, chatId});
								   }}
							/>
							{(userChatPrivelages.data?.privilage === "OWNER" || userChatPrivelages.data?.privilage === "ADMIN") ? (
								<input className="text-2xl outline-none hover:outline-none grid items-center p-2 rounded-bl-2xl transition-colors hover:text-gray-400"
									   value={chatName !== null ? chatName : chatData.data?.chat.name } onChange={(e) => {setChatName(e.currentTarget.value)}}
									   onBlur={() => {
										   if (!chatName || !chatData.data?.chat || chatData.data?.chat.name === chatName) {
											   return;
										   }
											updChatMut.mutate({chatId: chatData.data?.chat.id, name: chatName});
									   }}
								></input>
							) : (
								<div className="grid p-2">
									{chatData.data?.chat.name ?? "Invalid chat"}
								</div>
							)}
						</div>
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
									<AddMemberDiv chatId={chatData.data?.chat.id} chatMembers={chatMembers.data} userFriends={userFriends.data} setOpen={setMembersOpen} />
								)}
								<div className={"bg-gray-100"}>
									{chatMembers.data?.members && chatMembers.data?.members.map((m, i) => (
										<div className="bg-gray-100 hover:bg-gray-200 h-[5vh]">
											<div className="flex flex-row items-center gap-5">
												<img className="ml-5 mt-5 rounded-full h-[3vh]" src={m.picture} />
												<div className="flex flex-col my-auto">
													<p>{m.display_name}</p>
													<p>@{m.username}</p>
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
							<div className="col-[1] w-full overflow-y-scroll wrap-break-word text-2xl">
								{(chatMessages.data && chatMessages.data?.messages.length > 0) ? (chatMessages.data?.messages.map((m, i) => (
									<div className="hover:bg-gray-200 relative"
										 onMouseEnter={() => setMsgHovering(i)}
										 onMouseLeave={() => setMsgHovering(-1)}
									>
										<div className="ml-4 flex flex-row gap-4 items-center">
											<img src={m.picture} alt="img" className="mt-4 border rounded-full h-[3vh]" />
											<p className="text-2xl mt-auto">{m.display_name}</p>
											<p className="text-xl mt-auto">{normalDate(m.created_at)}</p>
										</div>
										{editingId === i ? (
											<input autoFocus className="ml-6 mt-4 outline-none w-[90%]" value={editingValue}
												   onKeyDown={(e) => {
													   if (e.key === "Enter") {
														   changeMessage.mutate({messageId: m.id, chatId: m.chat_id, message: editingValue})
													   }
												   }}
												   onChange={(e) => setEditingValue(e.currentTarget.value)}/>
										) : (
											<p className="ml-6 mt-4">{m.msg}</p>
										)}
										{(msgHovering === i && m.username === username) && (
											<>
												<Pencil className={"absolute right-15 top-5 cursor-pointer hover:text-gray-500"} width={30} height={30} onClick={() => {setEditingId(i); setEditingValue(m.msg)}}/>

												<Trash className={"absolute right-5 top-5 cursor-pointer hover:text-gray-500"} width={30} height={30} onClick={() => delMessage.mutate({messageId: m.id, chatId: m.chat_id})} />
											</>
											)}
									</div>
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
 */
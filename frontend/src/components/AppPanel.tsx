import {type ReactNode, useEffect, useState} from "react";
import {useNavigate, useSearchParams} from "react-router";
import type {Types} from "../types/types.ts";
import {queryClient} from "../queryClient.ts";
import {Plus, UsersRound, X, MessagesCircle, Settings} from "lucide-react";
import {ChatType} from "../queries/utils.ts";
import {useMutationChat, useMutationDeleteChat, useQueryChats} from "../queries/chats/queries.ts";
import Chats from "./Chats.tsx";
import Friends from "./Friends.tsx"
import {useQueryMe} from "../queries/me/queries.ts";

function AppPanel({children} : { children?: ReactNode }) {
	const navigate = useNavigate();
	const [auth, setAuth] = useState<Types | undefined>(undefined);
	const [searchParams, setSearchParams] = useSearchParams();
	const [hoveringChatId, setHoveringChatId] = useState<number>();
	const [currentChatId, setCurrentChatId] = useState<number>(-1);
	const [editProfile, setEditProfile] = useState<boolean>(false);

	const chatId = searchParams.get('chatId');

	useEffect(() => {
		const tempAuth = queryClient?.getQueryData<Types>(["auth"])
		if (!tempAuth?.userId) {
			navigate("/login");
		}
		console.log(tempAuth)
		setAuth(tempAuth);
	}, [])

	const chatMut = useMutationChat();
	const chats = useQueryChats();
	const user = useQueryMe();
	console.log("USER DATA", user.data);

	return (
		<div className="flex flex-1 min-h-0">
			<div className="flex w-fit flex-col bg-gray-100">
				<div className="flex flex-col transition-colors">
					<button
						className={"cursor-pointer flex flex-row text-2xl p-2 w-full justify-left"}
						onMouseEnter={(e) => {e.currentTarget.style.backgroundColor = "#F2F2ED"}}
						onMouseLeave={(e) => {e.currentTarget.style.backgroundColor = "transparent"}}
						onClick={() => navigate("/app")}
					>
						<UsersRound />
						Friends
					</button>
					<div className={"flex flex-row border-t text-2xl p-2"}>
						<MessagesCircle />
						<h2>Chats</h2>
						<Plus className="block my-auto ml-auto cursor-pointer"
						      onClick={() => chatMut.mutate({chatType: ChatType.GROUP})}
						/>
					</div>
				</div>
				<div className="flex-1 flex-row w-[10vw] overflow-y-auto">
					{(chats.data && chats.data.chats.length > 0) ?
						chats.data.chats.map((r, i) => (
								<ChatsComp chat={r} chatIndex={i} hoveringChatId={hoveringChatId} setHoveringChatId={setHoveringChatId} currentChatId={currentChatId} setCurrentChatId={setCurrentChatId} />
							)
						) : (
							<div>No chats found.</div>
						)
					}
				</div>
				<div className="shrink-0 h-[5vh] bg-gray-200 flex flex-row items-center justify-between">
					<img className="border z-2 rounded-full h-[100%] aspect-square" src={user.data?.picture} alt="HI" />
					<p className="text-2xl">{user.data?.username}</p>
					<Settings className="cursor-pointer text-black hover:text-gray-500 transition-colors duration-100 cursor-pointer" width={40} height={40}
					          onClick={() => setEditProfile(true)}/>
					{editProfile && (
						<EditProfile setFalse={setEditProfile}/>
					)}
				</div>
			</div>
			{chatId ? (
				<Chats chatId={chatId} />
			) : (
				<Friends />
			)}
		</div>
	)
}

function EditProfile({setFalse} : {setFalse: React.Dispatch<React.SetStateAction<boolean>>}) {
	return (
		<div className="fixed flex flex-col items-center text-2xl top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[50vw] h-[50vh] bg-white border rounded-2xl">
			<div className="w-full">
				<div className={"w-fit rounded-full ml-auto bg-transparent transition-colors duration-100 hover:bg-gray-100 cursor-pointer"}>
					<X className="text-black hover:text-gray-500" width={40} height={40} onClick={() => setFalse(false)} />
				</div>
			</div>
			<div className="w-[80%] flex flex-col gap-4">
				<h2 className="mx-auto text-5xl">Profile settings</h2>
				<p>Profile picture:</p>
				<p>Display name:</p>
				<p>Description:</p>
				<h2 className="mx-auto text-5xl">Account settings</h2>
				<p>Username: </p>
				<p>E-mail: </p>
				<p>Password: </p>
			</div>
		</div>
	)
}

function ChatsComp({setHoveringChatId, chat, chatIndex, hoveringChatId, setCurrentChatId, currentChatId} :
				   {
					   setHoveringChatId: React.Dispatch<React.SetStateAction<number | undefined>>,
					   chat: {id: string, name: string, picture: string},
					   chatIndex: number,
					   hoveringChatId: number | undefined,
					   setCurrentChatId: React.Dispatch<React.SetStateAction<number>>,
					   currentChatId: number,
				   }) {

	const navigate = useNavigate();
	const chatDeleteMut = useMutationDeleteChat();
	const chatStyle = "border border-white rounded-r-2xl flex flex-row transition-colors duration-100 hover:bg-gray-300 h-[3vw] w-[10vw] cursor-pointer"

	return (
		<div className={currentChatId === chatIndex ? chatStyle + " bg-gray-300" : chatStyle + " bg-gray-200"}
		     onMouseEnter={() => {setHoveringChatId(chatIndex)}}
		     onMouseLeave={() => {setHoveringChatId(-1)}}
		     onClick={() => {setCurrentChatId(chatIndex); navigate(`/app?chatId=${chat.id}`);}}
		>
			<img className="border rounded-full h-[80%] my-auto ml-2 aspect-square" src={chat.picture} alt="img" />
			<p
				className="m-2 p-2 text-black"
			>{chat.name}</p>
			{(hoveringChatId !== undefined && hoveringChatId === Number(chatIndex)) && (
				<X className={"text-black cursor-pointer block my-auto ml-auto"} width="40" height="40" onClick={() => { chatDeleteMut.mutate(chat.id)}} />
			)}
		</div>
	)
}

export default AppPanel;
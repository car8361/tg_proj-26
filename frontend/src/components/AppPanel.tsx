import {type ReactNode, useEffect, useRef, useState} from "react";
import {useNavigate, useSearchParams} from "react-router";
import type {Types} from "../types/types.ts";
import {queryClient} from "../queryClient.ts";
import {Plus, UsersRound, X, MessagesCircle, Settings, type LucideIcon, CircleUserRound} from "lucide-react";
import {ChatType} from "../queries/utils.ts";
import {useMutationChat, useMutationDeleteChat, useQueryChats} from "../queries/chats/queries.ts";
import Chats from "./ChatsPanel.tsx";
import Friends from "./Friends.tsx"
import {useMutationPicture, useQueryMe} from "../queries/me/queries.ts";
import type { GetMe } from "../types/types.ts"

function AppPanel({children} : { children?: ReactNode }) {
	const navigate = useNavigate();
	const [auth, setAuth] = useState<Types | undefined>(undefined);
	const [searchParams, setSearchParams] = useSearchParams();

	const navigationParam = searchParams.get("navigation");
	console.log("NP:", navigationParam);
	const chatId = "1";

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

	const [activePage, setActivePage] = useState(navigationParam ?? "friends");

	const routesData = [
		{name: "settings", icon: CircleUserRound, content: <div /> },
		{name: "friends", icon: UsersRound, content: <Friends /> },
		{name: "chats", icon: MessagesCircle, content: <Chats chatId={chatId?.toString() ?? ""} username={auth?.username ?? ""} /> }
	]

	return (
		<div className="flex flex-1 min-h-0">
			<div className="flex flex-1 flex-col-reverse bg-gray-100 border-b w-full min-w-0 min-h-0">
				<nav className={`
					flex 
					bg-digital-600
					h-[6dvh]
					min-h-[50px]
					items-center
					justify-center
					gap-6
					@container-size
					sticky bottom-0
					z-50
				`}>
					{routesData.map((v, i) => (
						<button onClick={() => {setActivePage(routesData[i].name); navigate(`/app?navigation=${routesData[i].name}`)}}>
							<NavComp Icon={v.icon} name={routesData[i].name} activeName={activePage} />
						</button>))}
				</nav>
				{routesData.map((v, i) => routesData[i].name === activePage && (
					v.content
				))}
			</div>
		</div>
	)
}

function NavComp(
	{Icon, name, activeName}
	:
	{Icon: LucideIcon, name: string, activeName: string}
) {
	const cn = `lg:size-10 cursor-pointer transition-all hover:-translate-y-1 duration-150 shrink-0`;
	return (
		<Icon className={`${cn} ${activeName === name ? "text-white/80 -translate-y-1" : "text-white"}`} />
	)
}

function EditProfile({setFalse, meData} : {setFalse: React.Dispatch<React.SetStateAction<boolean>>, meData: GetMe}) {
	const [presigned, setPresigned] = useState<string | null>(null);
	const imageRef = useRef<HTMLInputElement>(null);

	const uploadPicture = useMutationPicture();

	return (
		<div className="z-2 overflow-y-scroll fixed flex flex-col items-center text-2xl top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[50vw] h-[50vh] bg-white border rounded-2xl">
			<div className="w-full">
				<div className={"w-fit rounded-full ml-auto bg-transparent transition-colors duration-100 hover:bg-gray-100 cursor-pointer"}>
					<X className="text-black hover:text-gray-500" width={40} height={40} onClick={() => setFalse(false)} />
				</div>
			</div>
			<div className="w-[80%] flex flex-col gap-4">
				<h2 className="mx-auto text-5xl">Profile settings</h2>
				<p>Profile picture:</p>
				<img src={meData.picture} alt="img" className="rounded-full w-[5vw]  aspect-square cursor-pointer hover:opacity-[0.8]" onClick={() => imageRef.current?.click()} />
				<input type="file" accept="image/*" ref={imageRef} placeholder={"HI"}
					   onChange={(e) => {
							const file = e.currentTarget.files?.[0];
							if (!file) return;
							const form = new FormData();
							form.append("file", file);
							uploadPicture.mutate(form);
					   }}
				/>
				<p>Display name:</p>
				<input value={meData.display_name} />
				<p>Description:</p>
				<input value={meData.description ?? "No description"} />
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

/*
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
					{editProfile && user.data && (
						<EditProfile setFalse={setEditProfile} meData={user.data}/>
					)}
				</div>
			</div>
			{chatId ? (
				<Chats chatId={chatId} username={auth?.username} />
			) : (
				<Friends />
			)}
		</div>
 */
import {type ReactNode, useEffect, useState} from "react";
import {useNavigate, useSearchParams} from "react-router";
import type {Types} from "../types/types.ts";
import {queryClient} from "../queryClient.ts";
import {Plus, UsersRound, X, MessagesCircle} from "lucide-react";
import {ChatType} from "../queries/utils.ts";
import {useMutationChat, useMutationDeleteChat, useQueryChats} from "../queries/chats/queries.ts";
import Chats from "./Chats.tsx";

function AppPanel({children} : { children?: ReactNode }) {
	const navigate = useNavigate();
	const [auth, setAuth] = useState<Types | undefined>(undefined);
	const [searchParams, setSearchParams] = useSearchParams();
	const [hoveringChatId, setHoveringChatId] = useState<number>();

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
	const chatDeleteMut = useMutationDeleteChat();

	return (
		<div className="flex flex-1 min-h-0">
			<div className="flex w-fit flex-col bg-gray-100">
				<div className="flex flex-col transition-colors">
					<button
						className={"cursor-pointer flex flex-row text-2xl p-2 w-full justify-left"}
						onMouseEnter={(e) => {e.currentTarget.style.backgroundColor = "#F2F2ED"}}
						onMouseLeave={(e) => {e.currentTarget.style.backgroundColor = "transparent"}}
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
								<div className="border border-white rounded-r-2xl flex flex-row bg-[#F2F2ED] w-[10vw] cursor-pointer"
								     onMouseEnter={() => {setHoveringChatId(i)}}
								     onMouseLeave={() => {setHoveringChatId(-1)}}
								     onClick={() => {navigate(`/app?chatId=${r.id}`);}}
								>
									<p
										className="m-2 p-2 text-black"
									>{r.chat_name}</p>
									{(hoveringChatId !== undefined && hoveringChatId === Number(i)) && (
										<X className={"text-black cursor-pointer block my-auto ml-auto"} width="40" height="40" onClick={() => { chatDeleteMut.mutate(r.id)}} />
									)}
								</div>
							)
						) : (
							<div>No chats found.</div>
						)
					}
				</div>
			</div>
			{chatId && (
				<Chats chatId={chatId} />
			)}
		</div>
	)
}

export default AppPanel;
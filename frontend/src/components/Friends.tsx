import {
	useMutationDeleteFriend,
	useMutationFriendRequest, useMutationInvitesAccept,
	useMutationInvitesDelete,
	useQueryFriends,
	useQueryOutgoing,
	useQueryPending,
} from "../queries/relations/queries.ts";
import { useMutationChat } from "../queries/chats/queries.ts";
import {useEffect, useState} from "react";
import { ChatType } from "../queries/utils.ts";
import Confirm from "./Confirm.tsx";

import {SendHorizontal, X, MessageCirclePlus, Leaf, Clock, ClockFading, Search, Funnel, Check} from "lucide-react";
import {
	autoUpdate,
	offset,
	useFloating,
	shift,
	useClick,
	useDismiss,
	useInteractions,
	useTransitionStatus, flip
} from "@floating-ui/react";
import type {GetPending} from "../types/types.ts";
import type {UseQueryResult} from "@tanstack/react-query";

function Friends() {
	const [sendField, setSendField] = useState("");
	const [inviteRes, setInviteRes] = useState("");
	const {data: friendsData, isLoading: friendsLoading} = useQueryFriends();
	const sendRequest = useMutationFriendRequest(setInviteRes);
	const invitesDelete = useMutationInvitesDelete();
	const invitesAccept = useMutationInvitesAccept();
	const deleteFriend = useMutationDeleteFriend();
	console.log("FRIENDS: ", friendsData);

	const chat = useMutationChat();

	const gotoDM = (friendId: string) => {
		chat.mutate({chatType: ChatType.DIRECT, targetId: friendId})
	}

	const [filtersOpen, setFiltersOpen] = useState(false);

	const {refs, floatingStyles, context} = useFloating({
		open: filtersOpen,
		whileElementsMounted: autoUpdate,
		placement: "bottom-end",
		onOpenChange: setFiltersOpen,
		middleware: [
			offset(8),
			flip(),
			shift({padding: 8})
		]
	})

	const click = useClick(context);
	const dismiss = useDismiss(context);
	const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss])

	const { isMounted, status } = useTransitionStatus(context, {duration: 200});

	const [invitesSelected, setInvitesSelected] = useState(0);

	const invitesOptions = [
		{name: "Incoming", query: useQueryPending},
		{name: "Outgoing", query: useQueryOutgoing},
	]

	const selectedInviteOption = invitesOptions[invitesSelected].query();

	const [confirmActive, setConfirmActive] = useState(false);
	const [confirmData, setConfirmData] = useState({
		title: "Do you want to proceed? You cannot undo this action.",
		onAccept: () => {},
		onReject: () => {},
		setActive: setConfirmActive
	});

	return (
			<div className="flex flex-col flex-1 min-w-0 w-full">
				<div>
					<h1 className={`font-bold text-3xl text-digital-600 text-center text-balance my-2 lg:text-5xl`}>Send a friend request!</h1>
					<div className={`
						flex flex-row min-w-0
						w-[80%] mx-auto
						bg-digital-100
						rounded-full
						p-2
						max-w-[800px]
						hover:bg-white
						transition-all
					`}>
						<input value={sendField} placeholder="Type the username" className={`
						p-1
						flex flex-1 min-w-0
						outline-none
						lg:text-4xl
						w-[75%]
						text-center
						`}
						onChange={(e) => setSendField(e.target.value)}
						></input>
						<button className="ml-auto bg-digital-500 text-white group p-2 rounded-full cursor-pointer"
							onClick={() => sendRequest.mutate({targetName: sendField})}
						>
							<SendHorizontal className="lg:size-12 group-hover:translate-x-1 transition-all"/>
						</button>
					</div>
				</div>
				{inviteRes.length > 0 && (
					<h2 className="text-center font-bold text-2xl text-balance lg:text-4xl">{inviteRes}</h2>
				)}
				<div className="flex flex-col min-w-0 my-4">
					<h2 className={`
						text-center font-bold text-2xl text-digital-500 lg:text-5xl my-2 lg:my-6
					`}>Your friends</h2>
					<div className={`
						w-[80%] mx-auto bg-digital-200 flex flex-col min-w-0
						max-h-[80vh] overflow-y-scroll max-w-[800px]
					`}>
						<div ref={refs.setReference} className={`
							flex flex-row flex-1 justify-evenly bg-digital-500 gap-2 p-2 lg:text-3xl
						`}>
							<input className={`
								flex flex-1 min-w-0
								border-l border-l-white border-l-4
								px-3
								outline-none flex-1
								transition-all duration-150
								focus:border-b focus:border-b-white
								text-white
								p-1
							`} />
							<div className="flex flex-row ml-auto min-w-0">
								<button>
									<Search className={`lg:size-10 text-white cursor-pointer hover:rotate-8 transition-all ease duration-75`}/>
								</button>
								<button {...getReferenceProps()}>
									<Funnel className={`lg:size-10 text-white cursor-pointer hover:rotate-8 transition-all ease duration-75`}/>
								</button>
							</div>
							{isMounted && (
								<div ref={refs.setFloating}
								     {...getFloatingProps()}
									 style={floatingStyles} className="z-10">
									<div data-status={status}
										 className={`p-1 gap-2 bg-digital-400 flex flex-col z-2 min-w-0
											transition duration-200 ease-out
											opacity-0 -translate-y-2
											data-[status=open]:opacity-100 
										`}
									>
										<button className="cursor-pointer hover:translate-x-1 bg-digital-500 rounded-md transition-all hover:bg-digital-400">
											<Leaf className={`lg:size-10 text-white`} />
										</button>
										<button className="cursor-pointer hover:translate-x-1 bg-digital-500 rounded-md transition-all hover:bg-digital-400">
											<Clock className={`lg:size-10 text-white`} />
										</button>
										<button className="cursor-pointer hover:translate-x-1 bg-digital-500 rounded-md transition-all hover:bg-digital-400">
											<ClockFading className={`lg:size-10 text-white`} />
										</button>
									</div>
								</div>
							)}
						</div>
						<ul className="flex flex-col min-w-0 w-full p-2 overflow-y-scroll max-h-[40cqh] min-h-[20cqh]">
							{confirmActive && (
								<Confirm data={confirmData} />
							)}
							{friendsData && friendsData.friends.map((v, i) => (
								<li key={i} className="flex flex-row h-10 items-center odd:bg-digital-200 even:bg-digital-100 w-full lg:font-bold lg:text-2xl">
									<p className="flex-1 min-w-0 overflow-hidden truncate p-2 text-white">{v.other_username}</p>
									<button className="cursor-pointer hover:translate-x-1 transition-all duration-150 hover:bg-red-500" onClick={() => setConfirmActive(true)}>
										<X className="text-white lg:size-10" />
									</button>
								</li>
							))}
						</ul>
					</div>
				</div>
				<div className="flex flex-col min-w-0 my-4">
					<div>
						<h2 className={`text-center font-bold text-digital-500 text-2xl lg:text-5xl my-2 lg:my-6`}>Friend Invites</h2>
						<div className={`w-[80%] max-w-[800px] bg-digital-500 mx-auto flex flex-row items-center justify-around relative border border-digital-500 border-b-transparent h-10 lg:h-15 lg:text-3xl rounded-t-2xl`}>
							{invitesOptions.map((v, i) => (
								<button className={`font-bold text-white truncate z-2 hover:-translate-y-1 transition-all duration-200 ${i === invitesSelected ? "-translate-y-1 hover:-translate-y-0 cursor-default" : "cursor-pointer"}`} onClick={() => setInvitesSelected(i)}>{v.name}</button>
							))}
						</div>
						<div className={`w-[80%] max-w-[800px] min-h-[20vh] bg-digital-300 mx-auto flex flex-col border border-digital-500 border-t-transparent max-h-[40dvh] overflow-y-scroll rounded-b-lg`}>
							<LoadingList isLoading={selectedInviteOption.isLoading} amount={8}>
								{selectedInviteOption.data && selectedInviteOption.data.invites.length > 0 ? (
									selectedInviteOption.data.invites.map((v, i) => (
										<li className="flex flex-row h-10 items-center odd:bg-digital-200 even:bg-digital-100 w-full">
											<p className="flex-1 min-w-0 overflow-hidden truncate p-2 text-white">{v.username}</p>
											<button><Check className="text-white" /></button>
											<button><X className="text-white" /></button>
										</li>
									))
								) : (
									<p className="font-bold text-white text-center my-auto lg:text-4xl">No invites.</p>
								)}
							</LoadingList>
						</div>
					</div>
				</div>
			</div>
	)
}

export default Friends;

function LoadingList({isLoading = false, amount, children} : {isLoading?: boolean | undefined, amount?: number, children?: React.ReactNode}) {
	if (!amount || isNaN(amount) || Number(amount) > 100 || Number(amount) <= 0) {
		return <></>;
	}
	return !isLoading ? (
		<>
			{children}
		</>
	) : (
		Array.from({length: amount}).map((_, i) => (
			<div className="w-full h-[5vh] p-1" key={i}>
				<div
					className={`
					h-full
					w-full h-full bg-gradient-to-r
					from-gray-200 via-digital-100 to-gray-200 
					rounded-md animate-shimmer [background-size:200%_100%]
				`}
				></div>
			</div>
		))
	)
}

/*
<div
			className={`
			w-[50px] aspect-square mx-auto my-auto p-2 rounded-full border border-15 border-digital-400 border-t-digital-500
			animate-spin
			`}
		>

		</div>
 */

/*
<div className="flex-1 grid grid-rows-[1fr_19fr] grid-cols-[1fr_1fr_1fr]">
				<div className="border border-white rounded-bl-2xl bg-gray-100 grid items-center col-span-3">
					<h2 className="p-2 justify-center text-2xl">Friends</h2>
				</div>
				<div className="row-2 text-center">
					<h2 className="text-3xl pt-6 pb-4">Send a friend request!</h2>
					<div className="flex flex-row text-center justify-center">
						<input type="text" id="friend-username-input" className="border rounded-l-full p-2 text-center border-black text-2xl" placeholder="myFriend123"></input>
						<button className={`flex flex-row border border-black rounded-r-full p-2
						bg-blue-500 cursor-pointer text-white justify-center text-2xl transition-colors
						hover:bg-blue-300
						`
						}
						        onClick={(e) => {
									e.preventDefault();
									const input = document.getElementById("friend-username-input") as HTMLInputElement;
									sendRequest.mutate({targetName: input.value});
								}}
						>
							<SendHorizontal
								width="40"
								height="40"
							/>
						</button>
					</div>
					{inviteRes.length > 0 && (
						<p className="text-2xl">{inviteRes}</p>
					)}
					<div className="pt-20">
						<h2 className="text-3xl">Your Friends</h2>
						<div className="pt-6">
							{data?.friends.length ?? 0 > 0 ?
								data?.friends.map((friend) => (
									<div className="flex justify-center">
										<div className="flex flex-row justify-center items-center gap-4 bg-blue-200 transition-colors hover:bg-blue-400 w-[50%] text-2xl cursor-pointer rounded-xl" onClick={() => gotoDM(friend.other_id)}>
											<img className="rounded-full h-[3vh] ml-4" src={friend.other_picture} alt="img"/>
											<p className="select-none p-2" onClick={() => gotoDM(friend.other_id)}>{friend.other_username}</p>
											<SendHorizontal className="ml-auto text-black transition-colors duration-300 hover:text-white" onClick={() => gotoDM(friend.other_id)} />
											<button className="p-2 cursor-pointer text-black transition-colors duration-300  hover:text-white" onClick={() => {console.log("TO MUTATE: ", friend.other_id); deleteFriend.mutate(friend.other_id)}}><CircleX /></button>
										</div>
									</div>
								))
							 : (
								<h2>You have no friends</h2>
							)}
						</div>
					</div>
				</div>
				<div className="row-2 text-center bg-gray-50">
					<h2 className={"text-2xl pt-6 pb-4"}>Pending friend requests</h2>
					{(invitesPending.data && invitesPending.data.invites.length > 0) ? invitesPending.data.invites.map(f => (
						<div className={"flex flex-row justify-center gap-4 text-xl"}>
							<img src={f.picture} alt="img"/>
							<p>{f.username}</p>
							<p>{f.created_at}</p>
							<button className="cursor-pointer" onClick={() => invitesAccept.mutate(f.invite_id)}><CircleCheck /></button>
							<button className="cursor-pointer" onClick={() => invitesDelete.mutate(f.invite_id)}><CircleX /></button>
						</div>
					)) : (
						<h2>No incoming friend requests D:</h2>
					)}
				</div>
				<div className="row-2 text-center bg-gray-100">
					<h2 className={"text-2xl pt-6 pb-4"}>Outgoing friend requests</h2>
					{(invitesOutgoing.data && invitesOutgoing.data.invites.length > 0) ? invitesOutgoing.data.invites.map(f => (
						<div className="flex flex-row justify-center gap-4 text-xl">
							<img src={f.picture} alt="img"/>
							<p>{f.username}</p>
							<p>{f.created_at}</p>
							<button className="cursor-pointer" onClick={() => invitesDelete.mutate(f.invite_id)}><CircleX /></button>
						</div>
					)) : (
						<h2>No outgoing friend requests D:</h2>
						)}
				</div>
			</div>
 */
import {
	useMutationDeleteFriend,
	useMutationFriendRequest, useMutationInvitesAccept,
	useMutationInvitesDelete,
	useQueryFriends,
	useQueryOutgoing,
	useQueryPending,
} from "../queries/relations/queries.ts";
import { useMutationChat } from "../queries/chats/queries.ts";
import {useState} from "react";
import { ChatType } from "../queries/utils.ts";

import {SendHorizontal, CircleX, CircleCheck} from "lucide-react";

function Friends() {
	const [inviteRes, setInviteRes] = useState("");
	const {data} = useQueryFriends();
	const sendRequest = useMutationFriendRequest(setInviteRes);
	const invitesPending = useQueryPending();
	const invitesOutgoing = useQueryOutgoing();
	const invitesDelete = useMutationInvitesDelete();
	const invitesAccept = useMutationInvitesAccept();
	const deleteFriend = useMutationDeleteFriend();
	console.log("FRIENDS: ", data);

	const chat = useMutationChat();

	const gotoDM = (friendId: string) => {
		chat.mutate({chatType: ChatType.DIRECT, targetId: friendId})
	}

	return (
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
							<p>{f.username}</p>
							<p>{f.created_at}</p>
							<button className="cursor-pointer" onClick={() => invitesDelete.mutate(f.invite_id)}><CircleX /></button>
						</div>
					)) : (
						<h2>No outgoing friend requests D:</h2>
						)}
				</div>
			</div>
	)
}

export default Friends;
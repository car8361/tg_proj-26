import {
	useMutationDeleteFriend,
	useMutationFriendRequest, useMutationInvitesAccept,
	useMutationInvitesDelete,
	useQueryFriends,
	useQueryOutgoing,
	useQueryPending
} from "../queries/queries.ts";
import {useState} from "react";

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
	return (
		<>
			<div className="flex flex-row gap-10">
				<div>
					<h2>Send a friend request!</h2>
					<input type="text" id="friend-username-input" className="border border-black" placeholder="username"></input>
					<button className="border border-black cursor-pointer"
							onClick={(e) => {
								e.preventDefault();
								const input = document.getElementById("friend-username-input") as HTMLInputElement;
								sendRequest.mutate({targetName: input.value});
							}}>Send</button>
					{inviteRes.length > 0 && (
						<p>{inviteRes}</p>
					)}
					<h1>Your Friends</h1>
					{data?.friends.length ?? 0 > 0 ?
						data?.friends.map((friend) => (
							<div>
								<p>{friend.other_username}</p>
								<button className="cursor-pointer" onClick={() => {console.log("TO MUTATE: ", friend.other_id); deleteFriend.mutate(friend.other_id)}}>Delete friend</button>
							</div>
						))
					 : (
						<h2>You have no friends</h2>
					)}
				</div>
				<div>
					<h2>Pending friend requests</h2>
					{(invitesPending.data && invitesPending.data.invites.length > 0) ? invitesPending.data.invites.map(f => (
						<div>
							<p>{f.username}</p>
							<p>{f.created_at}</p>
							<button className="cursor-pointer" onClick={() => invitesAccept.mutate(f.invite_id)}>Accept</button>
							<button className="cursor-pointer" onClick={() => invitesDelete.mutate(f.invite_id)}>Reject</button>
						</div>
					)) : (
						<h2>No incoming friend requests D:</h2>
					)}
				</div>
				<div>
					<h2>Outgoing friend requests</h2>
					{(invitesOutgoing.data && invitesOutgoing.data.invites.length > 0) ? invitesOutgoing.data.invites.map(f => (
						<div>
							<p>{f.username}</p>
							<p>{f.created_at}</p>
							<button className="cursor-pointer" onClick={() => invitesDelete.mutate(f.invite_id)}>Cancel</button>
						</div>
					)) : (
						<h2>No outgoing friend requests D:</h2>
						)}
				</div>
			</div>
		</>
	)
}

export default Friends;
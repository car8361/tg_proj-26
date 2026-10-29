import {useMutationFriendRequest, useQueryFriends} from "../queries/queries.ts";
import {useState} from "react";

function Friends() {
	const [inviteRes, setInviteRes] = useState("");
	const {data} = useQueryFriends();
	const sendRequest = useMutationFriendRequest(setInviteRes);
	console.log("FRIENDS: ", data);
	return (
		<>
			<form>
				<h2>Send a friend request!</h2>
				<input type="text" id="friend-username-input" className="border border-black" placeholder="username"></input>
				<button className="border border-black cursor-pointer" onSubmit={(e) => {
					e.preventDefault();
					const input = document.getElementById("friend-username-input") as HTMLInputElement;
					sendRequest.mutate({targetName: input.value});
				}}>Send</button>
				{inviteRes.length > 0 && (
					<p>{inviteRes}</p>
				)}
			</form>
			<h1>Your Friends</h1>
			{data?.friends.length ?? 0 > 0 ?
				data?.friends.map((friend) => (
					<p>{friend.other_username}</p>
				))
			 : (
				<h2>You have no friends</h2>
			)}
		</>
	)
}

export default Friends;
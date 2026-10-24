import {useSuspenseQueryFriends} from "../queries/auth.ts";

function Friends() {
	const {data} = useSuspenseQueryFriends();
	console.log("FRIENDS: ", data);
	return (
		<>
			<form>
				<h2>Send a friend request!</h2>
				<input type="text"></input>
				<button onSubmit={(e) => {
					e.preventDefault();

				}} type="submit"></button>
			</form>
			{data.relations.length > 0 ?
				data.relations.map((friend) => (
					<button>{friend.owner_username} to {friend.other_username}</button>
				))
			 : (
				<h2>You have no friends</h2>
			)}
		</>
	)
}

export default Friends;
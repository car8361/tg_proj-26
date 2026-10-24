import {useMutationChat, useSuspenseQueryChats} from "../queries/auth.ts";

function Chats() {
	const { data } = useSuspenseQueryChats();
	console.log("CHATS: ", data.chats);
	const chatMut = useMutationChat();

	return (
		<>
			<button className="border border-black rounded-md p-2 cursor-pointer" onClick={() => chatMut.mutate()}>Create chat</button>
			<h2>Your chats</h2>
			<div className="flex-row">
			{data.chats.length > 0 ?
				data.chats.map((_, i) => (
					<div>
						<button>{data.chats[i]}</button>
						<button>Delete chat</button>
						<button>Add member</button>
					</div>
				)
				) : (
				<div>No chats found.</div>
			)
			}
			</div>
		</>
	)
}

export default Chats;
import {useMutationChat, useMutationDeleteChat, useSuspenseQueryChats} from "../queries/auth.ts";

function Chats() {
	const { data } = useSuspenseQueryChats();
	console.log("CHATS: ", data.chats);
	const chatMut = useMutationChat();
	const chatDeleteMut = useMutationDeleteChat();

	return (
		<div>
			<div>
				<button className="border border-black rounded-md p-2 cursor-pointer" onClick={() => chatMut.mutate()}>Create chat</button>
				<h2>Your chats</h2>
				<div className="flex-row">
					{data.chats.length > 0 ?
						data.chats.map((r, i) => (
							<div>
								<button className="m-2 p-2 border border-black rounded-md cursor-pointer">{r.chat_name}</button>
								<button className="m-2 p-2 border border-black rounded-md cursor-pointer" onClick={() => {console.log("DELETING CHAT ID: ", r.id); chatDeleteMut.mutate(r.id)}}>Delete chat</button>
								<button className="m-2 p-2 border border-black rounded-md cursor-pointer">Add member</button>
							</div>
						)
						) : (
						<div>No chats found.</div>
					)
					}
				</div>
			</div>
			<div>

			</div>
		</div>
	)
}

export default Chats;
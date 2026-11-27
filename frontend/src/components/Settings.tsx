import {useQueryMe} from "../queries/me/queries.ts";

function Settings() {
	const {data: meData} = useQueryMe();

	return (
		<div className="flex flex-1">
			<div className="flex flex-row w-[90%] mx-auto mt-5 gap-5 h-25">
				<img src={meData?.picture} className="aspect-square rounded-full h-full" />
				<div className="flex flex-col overflow-hidden my-auto">
					<h1 className="font-bold text-3xl truncate">{meData?.display_name}</h1>
					<h2 className="text-2xl truncate">@{meData?.username}</h2>
				</div>
			</div>
		</div>
	)
}

export default Settings;
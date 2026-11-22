import {useRef} from "react";

function Confirm(
	{data}
	:
	{data: {title: string, onAccept: () => void, onReject: () => void, setActive: React.Dispatch<React.SetStateAction<boolean>>}}
) {
	let {title, onAccept, onReject, setActive} = data;

	const ref = useRef<HTMLDivElement>(null);

	return (
		<div ref={ref} className={`flex fixed w-[100vw] h-[100vh] left-0 bottom-0 bg-black/80 z-60`}>
			<div className={`flex my-auto mx-auto bg-white w-[90vw] h-fit rounded-2xl max-w-[600px]`}>
				<div className="flex flex-col flex-1 p-2 justify-between gap-8">
					<h2 className={`text-digital-500 font-bold text-3xl lg:text-5xl text-center mt-2 lg:mt-5a`}>{title}</h2>
					<div className={`flex flex-row gap-1 mt-auto`}>
						<button className={`bg-red-500/85 rounded-xl w-1/2 h-8 lg:h-12 lg:text-3xl font-bold text-white cursor-pointer border hover:bg-transparent hover:text-red-500 transition-all duration-300`} onClick={() => {setActive(false); onAccept()}}>Confirm</button>
						<button className={`bg-green-500 rounded-xl w-1/2 h-8 lg:h-12 lg:text-3xl font-bold text-white cursor-pointer border hover:bg-transparent hover:text-green-500 transition-all duration-300`} onClick={() => {setActive(false); onReject()}}>Discard</button>
					</div>
				</div>
			</div>
		</div>
	)
}

export default Confirm;
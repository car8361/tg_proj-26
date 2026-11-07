import type {ReactNode} from "react";

function FixedContainer({children} : {children: ReactNode}) {
	return (
		<div className="fixed bottom-0 right-0 bg-blue-500 border border-black w-[80dvw] h-[80dvh] z-80">
			{children}
		</div>
	)
}

export default FixedContainer;
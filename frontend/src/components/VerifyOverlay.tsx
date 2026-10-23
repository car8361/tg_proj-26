import {useEffect, useState} from "react";
import { useMutationLogout, useSuspenseQueryAuth} from "../queries/auth.ts";
import { useMutation2fa } from "../queries/auth.ts";


function VerifyOverlay() {
	const [target, setTarget] = useState(0);
	const [code, setCode] = useState([-1, -1, -1, -1, -1, -1])
	const allowedKeys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

	const Mut2Fa = useMutation2fa();
	const MutLogout = useMutationLogout();

	const { data } = useSuspenseQueryAuth();

	useEffect(() => {
		function keyListener(e: KeyboardEvent) {
			document.getElementById(`input:${target}`)!.style.backgroundColor = "white";
			let tempCode = code;
			if (allowedKeys.includes(e.key)) {
				document.getElementById(`input:${target}`)!.innerHTML = e.key;
				tempCode = code.with(target, Number(e.key));
				setCode(tempCode);
				if (target < 6) {
					setTarget(target + 1);
				}
			}
			if (e.key === "Backspace") {
				document.getElementById(`input:${target-1}`)!.innerHTML = "";
				if (target > 0) {setTarget(target - 1);}
			}
			if (!tempCode.includes(-1)) {
				e.preventDefault();
				const sendCode = tempCode.join('');
				Mut2Fa.mutate(sendCode);
			}
		}

		document.addEventListener("keydown", keyListener);

		try {
			document.getElementById(`input:${target}`)!.style.backgroundColor = "gray";
		} catch (e) {
			console.log("Overlay not loaded")
		}

		console.log("Overlay not loaded")
	}, [target])

	return (
		(data.userId && data.verified === "false") ? (
			<div id="verify-overlay-div" className="fixed flex flex-col justify-center align-center bg-black w-full h-full z-10">
				<div>
					<h1 className="text-white text-2xl text-center pb-10">Verify your verification code</h1>
					<div className="flex flex-row justify-center gap-4">
						{Array.from({length: 6}, (_, i) => (
							<div id={`input:${i}`} onClick={() => {setTarget(i); console.log(i);}} className="w-40 cursor-pointer aspect-square bg-white text-9xl text-center border-blue-500 rounded-2xl"></div>
						))}
					</div>
				</div>
			</div>
		) : (<></>)
	);
}

export default VerifyOverlay;
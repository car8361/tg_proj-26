import {useEffect, useState} from "react";
import { useMutationLogout, useSuspenseQueryAuth} from "../queries/queries.ts";
import { useMutation2fa } from "../queries/queries.ts";
import {useNavigate} from "react-router";
import {queryClient} from "../queryClient.ts";


function VerifyOverlay() {
	const [target, setTarget] = useState(0);
	const [code, setCode] = useState([-1, -1, -1, -1, -1, -1])
	const allowedKeys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

	const Mut2Fa = useMutation2fa();
	const MutLogout = useMutationLogout();

	const { data } = useSuspenseQueryAuth();

	useEffect(() => {
		async function keyListener(e: KeyboardEvent) {
			console.log(`Verify overlay target: ${target	}`)
			console.log("KEYBOARD EVENT: ", e);
			let tempCode = code;
			if (allowedKeys.includes(e.key)) {
				document.getElementById(`input:${target}`)!.innerHTML = e.key;
				tempCode = code.with(target, Number(e.key));
				setCode(tempCode);
				console.log(tempCode);
				if (target < 5) {
					return setTarget(target + 1);
				}
			}
			if (e.key === "Backspace") {
				document.getElementById(`input:${target-1}`)!.innerHTML = "";
				if (target > 0) {return setTarget(target - 1);}
			}
			console.log(`LOG2: ${tempCode}`);
			if (!tempCode.includes(-1)) {
				e.preventDefault();
				const sendCode = tempCode.join('');
				console.log("Waiting for result");
				const result = await Mut2Fa.mutateAsync(sendCode);
				console.log("Verify overlay result: ", result);
				if (result.status === 409) {
					document.removeEventListener("keydown", keyListener);
					MutLogout.mutate();
				} else if (result.status === 401) {
					document.removeEventListener("keydown", keyListener);
					location.reload();
				} else if (result.status === 201) {
					document.removeEventListener("keydown", keyListener);
					await queryClient.invalidateQueries({queryKey: ["auth"]});
				}
				document.removeEventListener("keydown", keyListener);
			}
		}
		document.addEventListener("keydown", keyListener);
		return () => document.removeEventListener("keydown", keyListener);
	}, [target])

	return (
		(data.userId && data.verified === "false") ? (
			<div id="verify-overlay-div" className="fixed flex flex-col justify-center align-center bg-black w-full h-full z-10">
				<div>
					<h1 className="text-white text-2xl text-center pb-10">Verify your verification code</h1>
					<div className="flex flex-row justify-center gap-4">
						{Array.from({length: 6}, (_, i) => (
							<div id={`input:${i}`} onClick={() => {setTarget(i); console.log(i);}} className={i === target ? "w-40 cursor-pointer aspect-square bg-gray-400 text-9xl text-center border-blue-500 rounded-2xl" : "w-40 cursor-pointer aspect-square bg-white text-9xl text-center border-blue-500 rounded-2xl"}></div>
						))}
					</div>
				</div>
			</div>
		) : (<></>)
	);
}

export default VerifyOverlay;
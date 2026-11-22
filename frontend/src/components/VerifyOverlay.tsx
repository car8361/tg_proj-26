import {useEffect, useState} from "react";
import { useMutationLogout, useQueryAuth, useMutation2fa } from "../queries/auth/queries.ts";
import {queryClient} from "../queryClient.ts";


function VerifyOverlay() {
	const Mut2Fa = useMutation2fa();
	const MutLogout = useMutationLogout();

	const { data } = useQueryAuth();

	const [error, setError] = useState<string>("");
	const [code, setCode] = useState("");

	const verifyCode = (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();
		const v = String(new FormData(e.currentTarget).get("code"));
		if (!/^\d{6}$/.test(v)) {
			console.log(`CODE: ${v}`)
			return setError("Not a valid code")
		}
		Mut2Fa.mutate(code);
	}

	return (
		(data && data.userId && data.verified === "false") ? (
			<div id="verify-overlay-div" className="fixed flex flex-col justify-center items-center border-box bg-black/80 w-full h-full z-10">
				<div className={`bg-white p-5 rounded-lg w-[90dvw] max-w-[750px]`}>
					<form className="flex flex-col gap-0 lg:gap-5 w-[100%] text-2xl" onSubmit={verifyCode}>
						<h1 className="font-bold text-digital-500 text-3xl lg:text-5xl mb-6">We sent you a code!</h1>
						<input placeholder="6-digit code" name="code" value={code}
							   className={`
							   p-1 bg-white w-full outline-none border-l border-b border-digital-500
							   transition-all
							   lg:text-4xl
							   focus:border-l-8
							   `}
							onChange={(e) => {
								const v = e.currentTarget.value;
								if (!/^\w{0,6}$/.test(v)) {
									return;
								}
								if (!/^\d*$/.test(v)) {
									return setError("Numbers only");
								}
								setError("");
								return setCode(v);
							}}
						/>

						{error.length > 0 && (
							<p className="m-0 p-0 font-bold text-red-500 self-center lg:text-3xl">{error}</p>
						)}
						<button
							className={`
							bg-digital-500 font-bold text-white mx-auto leading-normal w-full rounded-2xl p-1 mt-8 cursor-pointer
							lg:text-3xl hover:bg-digital-400 transition-all duration-150 hover:translate-x-1
							`}
							type="submit"
						>Submit</button>
						<button className="text-digital-400 cursor-pointer ml-auto lg:text-3xl">Resend code</button>
					</form>
				</div>
			</div>
		) : (<></>)
	);
}

/*
onst [target, setTarget] = useState(0);
	const [code, setCode] = useState([-1, -1, -1, -1, -1, -1])
	const allowedKeys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

	const Mut2Fa = useMutation2fa();
	const MutLogout = useMutationLogout();

	const { data } = useQueryAuth();

	useEffect(() => {
		async function keyListener(e: KeyboardEvent) {
			console.log(`Verify overlay target: ${target	}`)
			console.log("KEYBOARD EVENT: ", e);
			let tempCode = code;
			if (allowedKeys.includes(e.key)) {
				tempCode = code.with(target, Number(e.key));
				setCode(tempCode);
				console.log(tempCode);
				if (target < 5) {
					document.getElementById(`input:${target}`)!.focus();
					return setTarget(target + 1);
				}
			}
			if (e.key === "Backspace") {
				const chosenInp = document.getElementById(`input:${target-1}`);
				chosenInp!.innerHTML = "";
				chosenInp!.focus();
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
					location.reload();
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
 */

/*
(data && data.userId && data.verified === "false") ? (
			<div id="verify-overlay-div" className="fixed flex flex-col justify-center items-center border-box bg-black w-full h-full z-10">
				<div className={`grid grid-rows-[repeat(3,1fr)] p-10 w-full h-full bg-white`}>
						<h1 className="row-1 text-black text-3xl lg:text-8xl md:text-5xl mt-auto text-center">Verify your verification code</h1>
						<div className="row-2 grid grid-cols-6 justify-center gap-4  mx-auto my-auto max-w-[1500px]">
							{Array.from({length: 6}, (_, i) => (
								<input maxLength={1} id={`input:${i}`} onClick={() => {setTarget(i); console.log(i);}}
									   className={`w-full border border-blue-500 cursor-pointer aspect-square bg-white text-9xl text-center rounded-2xl`}>
								</input>
							))}
					</div>
				</div>
			</div>
		) : (<></>)
 */

export default VerifyOverlay;
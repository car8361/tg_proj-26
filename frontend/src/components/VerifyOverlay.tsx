import {useEffect, useState} from "react";
import {useSuspenseQuery} from "@tanstack/react-query";
import type {Auth} from "../cacheTypes/auth.ts";


function VerifyOverlay() {
	const [target, setTarget] = useState(0);
	const [code, setCode] = useState([-1, -1, -1, -1, -1, -1])
	const allowedKeys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
	const { data } = useSuspenseQuery<Auth>({
		queryKey: ["auth"],
		queryFn: async () => {
			const res = await fetch ("/api/auth/me");
			if (!res.ok) { throw new Error("Failed to fetch user data"); }
			return res.json();
		}
	})

	useEffect(() => {
		function keyListener(e: KeyboardEvent) {
			if (allowedKeys.includes(e.key)) {
				document.getElementById(`input:${target}`)!.innerHTML = e.key;
				setCode(f => f.with(target, Number(e.key)));
				if (target < 6) {
					setTarget(target + 1);
				}
			}
			if (e.key === "Backspace") {
				document.getElementById(`input:${target-1}`)!.innerHTML = "";
				if (target > 0) {setTarget(target - 1);}
			}
			if (!code.includes(-1)) {
					//fetch here
			}
		}
		document.addEventListener("keydown", keyListener)
		return () => document.removeEventListener("keydown", keyListener);
	}, [target])

	return (
		(data.userId && data.verified === "false") ? (
			<div className="fixed flex flex-col justify-center align-center bg-black w-full h-full z-10">
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
import { useRef, useState } from "react";
import Input from "../components/authInput";
import {useMutationRegister} from "../queries/auth/queries.ts";
import {RegisterZod} from "../types/types.ts";

function Login() {
    const [errMsg, setErrMsg] = useState("");
    const [userErr, setUserErr] = useState("");
    const [emailErr, setEmailErr] = useState("");
    const [passErr, setPassErr] = useState("");
    const [passConfErr, setPassConfErr] = useState("");

    const registerMut = useMutationRegister(setErrMsg);

    const Register = (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        const userInputs = Object.fromEntries(new FormData(event.currentTarget));
        console.log("USER INPUTS: ", userInputs);
        const result = RegisterZod.safeParse(userInputs);
        console.log("PARSING RESULT DATA: ", result.data);
        if (!result.success) {
            return setErrMsg(result.error.issues[0].message);
        }
        registerMut.mutate(result.data);
    }

    const timeout = useRef<number>(undefined);

    const inputChanged = (value: string, type: string) => {
        setErrMsg("");
        setUserErr("");
        setPassConfErr("");
        setPassErr("");
        clearTimeout(timeout.current);
        timeout.current = setTimeout(() => {
            if (type === "username") {
                userInputChanged(value);
            }
            if (type === "password") {
                passwordInputChanged(value);
            }
            if (type === "email") {
                emailInputChanged(value);
            }
        }, 800);
    }


    const userInputChanged = (value: string) => {
        if ((value.length < 3) && (value.length !== 0) || value.length > 64) {
            return setUserErr("Must contain 3 - 64 allowed characters");
        }
        if (/[^a-zA-Z0-9_]/.test(value)) {
            return setUserErr("Username contains blocked characters");
        }
        //fetch jestli je user volný
        fetch(`/api/auth/user?username=${value}`)
        .then(res => {
            if (res.status === 409) {
                return setUserErr("Username taken");
            }
        })
    }

    const emailInputChanged = (value: string) => {
        fetch(`/api/auth/email?email=${value}`)
            .then(res => {
                if (value.length < 3) {
                    return setEmailErr("");
                }
                if (res.status === 409) {
                    return setEmailErr("E-mail already in use");
                }
                if (res.status === 400) {
                    return setEmailErr("Not an e-mail");
                }
            })
    }

    const passwordInputChanged = (value: string) => {
        if (value.length < 3 || value.length > 64) {
            return setPassErr("Must containt 3 - 64 symbols");
        }
        if (!(/[a-zA-Z]/.test(value) && /[\d]/.test(value) && /[^a-zA-Z0-9]/.test(value))) {
            return setPassErr("Must contain 3 - 64 allowed characters, at least 1 letter, 1 number and 1 symbol");
        }
    }

    const errStyle = "text-red-500 text-lg lg:text-3xl"

    return (
        <form className={`flex flex-col w-[60%] mx-auto my-auto max-w-[500px] gap-2 lg:text-3xl`} onSubmit={Register}
        >
            <h1 className="font-bold text-digital-500 font-bold text-center text-2xl lg:text-5xl sm:mb-5 lg:mb-10">Chat Registration</h1>
            <div className="flex flex-col">
                <label htmlFor="input-login-username" className={`font-bold text-digital-500`}>Username</label>
                <input id="input-login-username" onChange={(e) => inputChanged(e.currentTarget.value, "username")}
                       className={`
                       transition-all hover:bg-digital-50 duration-75 border border-digital-300 rounded-md px-2 py-[1px]
                       `} />
                {userErr && (
                    <p className={errStyle}>{userErr}</p>
                )}
            </div>
            <div className="flex flex-col">
                <label htmlFor="input-login-email" className={`font-bold text-digital-500`}>E-mail</label>
                <input id="input-login-email" onChange={(e) => inputChanged(e.currentTarget.value, "email")}
                       className={`
                       transition-all hover:bg-digital-50 duration-75 border border-digital-300 rounded-md px-2 py-[1px]
                       `} />
                {emailErr && (
                    <p className={errStyle}>{emailErr}</p>
                )}
            </div>
            <div className="flex flex-col">
                <label htmlFor="input-login-password" className={`font-bold text-digital-500`}>Password</label>
                <input id="input-login-password" type="password" onChange={(e) => inputChanged(e.currentTarget.value, "password")} className={`
                       transition-all hover:bg-digital-50 duration-75 border border-digital-300 rounded-md px-2 py-[1px]
                       `}    />
                {passErr && (
                    <p className={errStyle}>{passErr}</p>
                )}
            </div>
            <div className="flex flex-col">
                <label htmlFor="input-login-confirm-password" className={`font-bold text-digital-500`}>Confirm password</label>
                <input id="input-login-confirm-password" type="password"
                       className={`
                       transition-all hover:bg-digital-50 duration-75 border border-digital-300 rounded-md px-2 py-[1px]
                       `} />
                {passConfErr && (
                    <p className={errStyle}>{passConfErr}</p>
                )}
            </div>
            <button className={`
            transition-all duration-150
            bg-digital-500 hover:bg-digital-400
            rounded-md mt-2 font-bold text-white cursor-pointer py-[1px] leading-normal
            `}>Register</button>
            {errMsg && (
                <p className={errStyle}>{errMsg}</p>
            )}
            <a href="/login" className="transition-colors mt-1 text-digital-400 justify-end hover:text-digital-300">Already have an account?</a>
        </form>
    )

    /*return (
        <div className="flex flex-col m-auto p-4 w-full">
            <form onSubmit={(e) => Register(e)} className="flex flex-col w-full max-w-lg mx-auto rounded-xl">
                <Input name="username" id="username" label="Username" parameters="Must contain 3 - 64 allowed symbols" placeholder="username" type="text" errMsg={userErr} inputChanged={inputChanged} />
                <Input name="email" id="email" label="E-mail" parameters="" placeholder="name@domain.com" type="email" errMsg={emailErr} inputChanged={inputChanged} />
                <Input name="password" id="password" label="Password" parameters="Must containt 3 - 64 allowed characters, at least 1 letter, 1 number a 1 symbol" placeholder="●●●●●●●●" type="password" errMsg={passErr} inputChanged={inputChanged} />
                <Input name="confirmPassword" id="confirmPassword" label="Password confirm" parameters="" placeholder="●●●●●●●●" type="password" errMsg={passConfErr} inputChanged={inputChanged}/>
                <button id="button" type="submit" className="transition-colors bg-black mt-4 rounded-sm cursor-pointer text-white py-1 hover:bg-gray-800 text-2xl   ">Register</button>
                <p className="self-center text-red-600 text-lg">{errMsg}</p>
                <a href="/login" className="transition-colors mt-1 text-blue-500 justify-end hover:text-blue-300 text-2xl">Already have an account?</a>
            </form>
        </div>
    )*/
}

export default Login;
import {useMutationLogin} from "../queries/auth/queries.ts";
import {useState} from "react";

function Login() {
    const [errMsg, setErrMsg] = useState("");
    const loginMut = useMutationLogin(setErrMsg);

    function formSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        const data = new FormData(e.target);
        loginMut.mutate({
            identifier: String(data.get("identifier")),
            password: String(data.get("password"))
        });
    }

    return (
        <form className={`flex flex-col w-[60%] mx-auto my-auto max-w-[500px] gap-2 lg:text-3xl`}
              onSubmit={formSubmit}
        >
            <h1 className="font-bold text-digital-500 font-bold text-center text-2xl lg:text-5xl sm:mb-5 lg:mb-10">Chat Login</h1>
            <div className="flex flex-col">
                <label htmlFor="input-login-username" className={`font-bold text-digital-500`}>Username or E-mail</label>
                <input id="input-login-username"
                       name="identifier"
                       placeholder="username123"
                       className={`
                       transition-all hover:bg-digital-50 duration-75 border border-digital-300 rounded-md px-2 py-[1px]
                       `} />
            </div>
            <div className="flex flex-col">
                <label htmlFor="input-login-username" className={`font-bold text-digital-500`}>Password</label>
                <input id="input-login-username" type="password"
                       name="password"
                       placeholder="●●●●●●●●●●"
                       className={`
                       transition-all hover:bg-digital-50 duration-75 border border-digital-300 rounded-md px-2 py-[1px]
                       `}    />
            </div>
            <button className={`
            transition-all duration-150
            bg-digital-500 hover:bg-digital-400
            rounded-md mt-2 font-bold text-white cursor-pointer py-[1px] leading-normal
            `}>Login</button>
            <a href="/register" className="transition-colors mt-1 text-digital-400 justify-end hover:text-digital-300">Don't have an account yet?</a>
        </form>
    )
}

/*
<h1>Login</h1>
            <form onSubmit={(e) => { e.preventDefault(); const data = LoginZod.parse(Object.fromEntries(new FormData(e.target))); loginMut.mutate(data);}} className="flex flex-col w-full max-w-lg rounded-xl">
                <Input name="identifier" id="identifier" label="Name or E-mail" parameters="" placeholder="username" type="text" errMsg=""/>
                <Input name="password" id="password" label="Password" parameters="" placeholder="●●●●●●●●" type="password" errMsg=""/>
                <button id="button" type="submit" className="transition-colors bg-black mt-4 rounded-sm cursor-pointer text-white py-1 hover:bg-gray-800 text-2xl">Login</button>
                {errMsg && (
                    <p className="text-red-500">{errMsg}</p>
                )}
                <a href="/register" className="transition-colors mt-1 text-blue-500 justify-end hover:text-blue-300 text-2xl">Don't have an account yet?</a>
            </form>
 */

export default Login;
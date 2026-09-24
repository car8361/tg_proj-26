import { useState } from "react";
import Input from "../components/authInput";
import { useNavigate } from "react-router";

function Login() {
    const [errMsg, setErrMsg] = useState("");
    const navigate = useNavigate()

    const Login = (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        const userInputs = Object.fromEntries(new FormData(event.currentTarget));
        fetch("http://localhost:3000/auth/login", {
            method: "POST",
            headers: {"Content-Type": "application/Json"},
            body: JSON.stringify(userInputs),
            credentials: "include",
        })
        .then(res => {
            const status = Number(res.status);
            if (status >= 200 && status <= 299) {
                navigate("/")
            }
            if (status >= 400 && status < 500) {
                setErrMsg("Nesprávné přihlašovací údaje");
            } else if (status >= 500) {
                setErrMsg("Chyba na serveru")
            } 
        })
    }

    return (
        <div className="flex min-h-dvh items-center justify-center p-4 w-full md:portrait:items-start md:portrait:pt-40">
            <form onSubmit={(e) => Login(e)} className="flex flex-col w-full max-w-sm md:portrait:max-w-2xl md:portrait:text-2xl mx-auto md:portrait:pt-[15dvh] rounded-xl">
                <Input name="identifier" id="identifier" label="Jméno nebo e-mail" parameters="" placeholder="uzivatel" type="text" errMsg=""/>
                <Input name="password" id="password" label="Heslo" parameters="" placeholder="●●●●●●●●" type="password" errMsg=""/>
                <button id="button" type="submit" className="transition-colors bg-black mt-4 rounded-sm cursor-pointer text-white py-1 hover:bg-gray-800">Přihlásit</button>
                <p className="self-center text-red-600 text-lg">{errMsg}</p>
                <a href="/register" className="transition-colors mt-1 text-blue-500 justify-end hover:text-blue-300">Nemáte účet?</a>
            </form>
        </div>
    )
}

export default Login;
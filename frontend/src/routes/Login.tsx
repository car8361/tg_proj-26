import Input from "../components/authInput";
import { useNavigate } from "react-router";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import { LoginZod } from "../cacheTypes/auth";
import type { Login } from "../cacheTypes/auth";

function Login() {
    const queryClient = useQueryClient();
    const navigate = useNavigate()

    const { mutate } = useMutation({
        mutationFn: fetchLogin,
        onSuccess: (res) => {
            if (res.ok) {
                queryClient.invalidateQueries({ queryKey: ["auth"] });
                navigate("/");
            }
        }
    })

    /*const Login = (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        const userInputs = Object.fromEntries(new FormData(event.currentTarget));
        fetch("/api/auth/login", {
            method: "POST",
            headers: {"Content-Type": "application/Json"},
            body: JSON.stringify(userInputs),
            credentials: "include",
        })
        .then(res => {
            const status = Number(res.status);
            if (status >= 200 && status <= 299) {
                queryClient.invalidateQueries({ queryKey: ["auth"] })
                navigate("/")
            }
            if (status >= 400 && status < 500) {
                setErrMsg("Incorrect login details");
            } else if (status >= 500) {
                setErrMsg("Server error")
            }
        })
    }*/

    return (
        <div className="flex m-auto items-center justify-center p-4 w-full md:portrait:items-start md:portrait:pt-40">
            <form onSubmit={(e) => { e.preventDefault(); const data = LoginZod.parse(Object.fromEntries(new FormData(e.target))); mutate(data);}} className="flex flex-col w-full max-w-lg rounded-xl">
                <Input name="identifier" id="identifier" label="Name or E-mail" parameters="" placeholder="username" type="text" errMsg=""/>
                <Input name="password" id="password" label="Password" parameters="" placeholder="●●●●●●●●" type="password" errMsg=""/>
                <button id="button" type="submit" className="transition-colors bg-black mt-4 rounded-sm cursor-pointer text-white py-1 hover:bg-gray-800 text-2xl">Login</button>
                <a href="/register" className="transition-colors mt-1 text-blue-500 justify-end hover:text-blue-300 text-2xl">Don't have an account yet?</a>
            </form>
        </div>
    )
}

async function fetchLogin(Data: Login) {
    const res = fetch("/api/auth/login", {
        method: "POST",
        headers: {"Content-Type": "application/Json"},
        body: JSON.stringify(Data),
        credentials: "include",
    })
    return await res;
}

export default Login;
import { useReducer, useRef, useState } from "react";
import Input from "../components/authInput";
import { useNavigate } from "react-router";

function Login() {
    const [errMsg, setErrMsg] = useState("");
    const [userErr, setUserErr] = useState("");
    const [emailErr, setEmailErr] = useState("");
    const [passErr, setPassErr] = useState("");
    const [passConfErr, setPassConfErr] = useState("");

    const navigate = useNavigate();

    const Register = (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        const userInputs = Object.fromEntries(new FormData(event.currentTarget));
        if (userInputs.password !== userInputs.confirmPassword) {
            return setPassConfErr("Neshoda hesel")
        }
        if (userInputs.username.toString().length < 3) {
            return setUserErr("Vyplňte uživatelské jméno");
        }
        if (userInputs.email.toString().length < 3) {
            return setEmailErr("Vyplňte e-mail")
        }
        if (userInputs.password.toString().length < 8) {
            return setPassErr("Vyplňte heslo");
        }
        if (errMsg.length > 0 || userErr.length > 0 || emailErr.length > 0 || passErr.length > 0 || passConfErr.length > 0) {
            setErrMsg("Nejprve vyřeš chyby 😨")
        }
        fetch("http://localhost:3000/auth/register", {
            method: "POST",
            headers: {"Content-Type": "application/Json"},
            body: JSON.stringify(userInputs),
            credentials: "include",
        })
        .then(res => {
            const status = res.status;
            if (status >= 200 && status <= 299) {
                navigate("login")
            } 
            if (status >= 400 && status < 500) {
                if (status === 409) {
                    return setUserErr("Nesprávné údaje")
                }
                setErrMsg("Nesprávné Registrační údaje");
            } else if (status >= 500) {
                setErrMsg("Chyba na serveru")
            } 
        });
    }

    const timeout = useRef<number>(undefined);

    const inputChanged = (value: string, type: string) => {
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
        }, 800);
    }


    const userInputChanged = (value: string) => {
        if ((value.length < 3) && (value.length !== 0) || value.length > 64) {
            return setUserErr("Musí obsahovat 3 - 64 povolených znaků");
        }
        if (/[^a-zA-Z0-9_]/.test(value)) {
            return setUserErr("Uživatelské jméno obsahuje nepovolené znaky");
        }
        //fetch jestli je user volný
        fetch(`http://localhost:3000/auth/user?username=${value}`)
        .then(res => {
            if (res.status === 409) {
                return setUserErr("Uživatelské jméno zabrené");
            }
        })
    }

    const passwordInputChanged = (value: string) => {
        if (value.length < 3 || value.length > 64) {
            return setPassErr("Musí obsahovat 3 - 64 znaků");
        }
        if (!(/[a-zA-Z]/.test(value) && /[\d]/.test(value) && /[^a-zA-Z0-9]/.test(value))) {
            return setPassErr("Musí obsahovat 3 - 64 povolených, alespoň 1 písmeno, 1 číslo a 1 symbol");
        }
    }

    return (
        <div className="flex min-h-dvh items-center justify-center p-4 w-full md:portrait:items-start md:portrait:pt-40">
            <form onSubmit={(e) => Register(e)} className="flex flex-col w-full max-w-sm md:portrait:max-w-2xl md:portrait:text-2xl mx-auto md:portrait:pt-[15dvh] rounded-xl">
                <Input name="username" id="username" label="Jméno" parameters="Musí obsahovat 3 - 64 povolených znaků" placeholder="uzivatel" type="text" errMsg={userErr} inputChanged={inputChanged} />
                <Input name="email" id="email" label="E-mail" parameters="" placeholder="jmeno@domena.com" type="email" errMsg={emailErr} inputChanged={inputChanged} />
                <Input name="password" id="password" label="Heslo" parameters="Musí obsahovat 3 - 64 povolených, alespoň 1 písmeno, 1 číslo a 1 symbol" placeholder="●●●●●●●●" type="password" errMsg={passErr} inputChanged={inputChanged} />
                <Input name="confirmPassword" id="confirmPassword" label="Heslo znovu" parameters="" placeholder="●●●●●●●●" type="password" errMsg={passConfErr} inputChanged={inputChanged}/>
                <button id="button" type="submit" className="transition-colors bg-black mt-4 rounded-sm cursor-pointer text-white py-1 hover:bg-gray-800">Registrovat</button>
                <p className="self-center text-red-600 text-lg">{errMsg}</p>
                <a href="/login" className="transition-colors mt-1 text-blue-500 justify-end hover:text-blue-300">Máte již účet?</a>
            </form>
        </div>
    )
}

export default Login;
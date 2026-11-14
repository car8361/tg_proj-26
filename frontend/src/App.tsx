import Header from "./components/Header.tsx";
import VerifyOverlay from "./components/VerifyOverlay.tsx";
import {Route, Routes} from "react-router";
import RedirectHome from "./routes/RedirectHome.tsx";
import Login from "./routes/Login.tsx";
import Register from "./routes/Register.tsx";
import Home from "./routes/Home.tsx";
import Dashboard from "./routes/Dashboard.tsx";
import NotFound from "./routes/NotFound.tsx";
import Footer from "./components/Footer.tsx";
import Chats from "./components/Chats.tsx";
import Friends from "./components/Friends.tsx";
import {useQueryAuth} from "./queries/auth/queries.ts";
import AppPanel from "./components/AppPanel.tsx";

function App() {
	const { data } = useQueryAuth();
	console.log("Types data: ", data);
	const showVerifyOverlay = data && data?.userId && data.verified === "false";
	return (
		<div className="flex flex-col min-h-0 h-dvh">
			{ showVerifyOverlay && <VerifyOverlay /> }
			<Header />
			<main className="flex flex-1 flex-col min-h-0 overflow-y-auto">
				<Routes>
					<Route path="" element={<RedirectHome/>}/>
					<Route path="login" element={<Login/>}/>
					<Route path="register" element={<Register/>}/>
					<Route path="home" element={<Home/>}/>
					<Route path="app" element={<AppPanel/>}/>
					<Route path="*" element={<NotFound />}/>
				</Routes>
			</main>
		</div>
	);
}

export default App;
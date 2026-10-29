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
import Chats from "./routes/Chats.tsx";
import Friends from "./routes/Friends.tsx";
import {useSuspenseQueryAuth} from "./queries/queries.ts";
import AppPanel from "./components/AppPanel.tsx";

function App() {
	const { data } = useSuspenseQueryAuth();
	console.log("Auth data: ", data);
	const showVerifyOverlay = data.userId && data.verified === "false";
	return (
		<div className="flex flex-col min-h-dvh">
			<Header />
			<main className="flex flex-1 flex-col">
				{ showVerifyOverlay && <VerifyOverlay /> }
				<Routes>
					<Route path="" element={<RedirectHome/>}/>
					<Route path="login" element={<Login/>}/>
					<Route path="register" element={<Register/>}/>
					<Route path="home" element={<Home/>}/>
					<Route path="dashboard" element={<AppPanel><Dashboard/></AppPanel>}/>
					<Route path="chats" element={<AppPanel><Chats /></AppPanel>}/>
					<Route path="friends" element={<AppPanel><Friends /></AppPanel>}/>
					<Route path="*" element={<NotFound />}/>
				</Routes>
			</main>
			<Footer />
		</div>
	);
}

export default App;
import {useNavigate} from "react-router";
import {useEffect} from "react";

function RedirectHome() {
	const navigate = useNavigate()
	useEffect(() => {
		navigate("/home")
	}, [])

	return (
		<>
			<p>Redirection home</p>
		</>
	)
}

export default RedirectHome;
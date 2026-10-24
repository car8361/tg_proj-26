import {useNavigate} from "react-router";

function DMB({text, href} : { text: string, href: string }) {
	const navigate = useNavigate();
	return (
		<button
			className="bg-white w-[80%] mt-4 border border-black border-solid rounded-md
			 text-xl cursor-pointer hover:bg-gray-100 transition-colors"
			onClick={() => {navigate(href)}}
		>{text}</button>
	)
}

export default DMB;
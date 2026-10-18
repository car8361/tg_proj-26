

function Header() {
	return (
		<header className="flex items-center justify-center left-0 bottom-0 bg-black w-full text-white p-5">
			<p className="mr-auto">My app</p>
			<nav className="flex gap-4">
				<a href="/home">Home</a>
				<a href="/login">Login</a>
				<a href="/register">Register</a>
			</nav>
		</header>
	)
}

export default Header;

function Home() {
	return (
		<div className="flex flex-col flex-1">
			<div className={`flex flex-col flex-1 w-[80dvw] self-center mx-auto text-center`}>
				<h1 className={`font-bold text-3xl lg:text-6xl my-5 mx-auto text-balance text-digital-500`}>Welcome to my app!</h1>
				<div className={`
				flex
				bg-gradient-to-b from-digital-400 to-blue-600 
				w-full aspect-square mx-auto mt-4 rounded-2xl
				shadow-2xl hover:-translate-y-5
				transition-all duration-150
				max-w-[800px]
				`}>
					<div className="p-2 flex flex-col gap-4 mx-auto overflow-y-scroll">
						<h2 className="text-2xl lg:text-5xl font-bold text-white lg:my-4">What's happening?</h2>
						<p className="font-bold text-white text-1xl text-balance lg:text-4xl">
							Hi, you're probably from Terra, wondering what's happening.
							Well, this is my project - a social media app.
							I would be glad if you looked at my github repo (https://github.com/car8361/tg_proj-26)
							and checked out my devlogs!
							Thanks
						</p>
					</div>
				</div>
				<div className={`flex flex-col w-full aspect-square mx-auto mt-4 overflow-y-scroll max-w-[800px]`}>
					<h2 className={`text-2xl font-bold text-digital-500 mx-auto lg:text-5xl`}>The project</h2>
					<p className="font-bold text-digital-400 text-1xl text-balance lg:text-4xl">
						This is a learning project, I learned and still I am learning things like
						Tailwind CSS, React (TSX), Tanstack Query, Floating UI React, ..., Nest JS (and concepts), Prisma ORM, Cloudflare,
						and yet there is still SO much more to do..
					</p>
				</div>
				<div className={`
					flex
					bg-gradient-to-b from-digital-400 to-blue-600 
					w-full aspect-square mx-auto mt-4 rounded-2xl
					shadow-2xl hover:-translate-y-5
					transition-all duration-150
					max-w-[800px]	
				`}>
					<div className="p-2 flex flex-col gap-4 overflow-y-scroll mx-auto">
						<h2 className={`text-2xl font-bold text-white mx-auto lg:text-5xl`}>Who am I?</h2>
						<p className="font-bold text-white text-1xl text-balance lg:text-4xl">
							Hi, I'm car - a young Czech developer, you can contact me on Terra or Discord (@car12345678913)
						</p>
					</div>
				</div>
			</div>
		</div>
	)
}

export default Home;
const ftl: Record<string, string> = {
	"Contact us": "/contact",
	"Terms & Conditions": "/terms",
	"Privacy Policy": "/privacy",
}

function Footer() {
	return (
		<footer className={`
		flex flex-wrap flex-row py-2
		bg-digital-600 w-full text-white font-bold
		text-[clamp(0.75rem,2.5vw,1rem)]
		`}>
			<div className="flex flex-row justify-center gap-4 mx-auto justify-center">
				{Object.entries(ftl).map(([name, link]) => (
					<a href={link} className="transition-all duration-150 hover:-translate-y-2">
						{name}
					</a>
				))}
			</div>
		</footer>
	)
}

export default Footer;
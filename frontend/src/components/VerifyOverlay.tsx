function VerifyOverlay() {
	return (
		<div className="fixed bg-black opacity-80 h-full w-full left-0">
			<div>
				<h1 className="text-white">Verify your verification code</h1>
			</div>
			<input type="number"/>
		</div>
	)
}

export default VerifyOverlay;
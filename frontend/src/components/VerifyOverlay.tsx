function VerifyOverlay() {
	return (
		<div className="fixed inset-0 pt-[33vh] flex justify-center">
			<div className="flex size-fit flex-row ">
				{Array.from({length: 6}, (_, i) => (
					<div className="mx-3">
						<input key={i} maxLength={1} className="aspect-[4/5] w-20 border text-center rounded-2xl text-4xl font-semibold"></input>
					</div>
				))}
			</div>
		</div>
	)
}

export default VerifyOverlay;
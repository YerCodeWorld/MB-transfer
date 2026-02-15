// I am guessing we would update the database setting a change event in the input element to do so
export const InfoRowWithCheck = (
	{ rows }: { rows: { title: string; description: string }[] }
) => {

	return (
		<>
		{rows.map((r, i) =>
			<div className="flex items-center justify-between" key={r.title + i}>
				<div>
					<label className="text-sm font-medium text-gray-700 dark:text-gray-300">
						{r.title}
					</label>
					<p className="text-xs text-gray-500 dark:text-gray-400">
						{r.description}
					</p>
				</div>

				<label className="relative inline-flex items-center cursor-pointer">
					<input type="checkbox" className="sr-only peer" disabled/>
					<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
				</label>
			</div>
		)}
		</>
	)
}



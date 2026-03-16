import { WorkdaySimulation } from "../types";

const MockPanel = ({
	simulation,
	selectedDate,
	setSimulation
}): {
	simulation: WorkdaySimulation;
	selectedDate: string;
} => {

	return (
		<div className="border border-dashed border-gray-300 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-500 dark:text-gray-400">
						Simulación
					</p>
					<p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
						Activa un itinerario local para probar buckets, timeline y avisos sin depender de datos reales.
					</p>
				</div>

				<label className="inline-flex items-center gap-2 text-sm font-medium text-navy-700 dark:text-white">
					<input
						type="checkbox"
						checked={simulation.enabled}
						onChange={(e) =>
						setSimulation((prev) => ({
							...prev,
							enabled: e.target.checked,
							date: e.target.checked ? prev.date : selectedDate,
							}))
						}
						className="h-4 w-4"
					/>
					Usar escenario local
				</label>
			</div>

			<div className="mt-4 grid gap-3 md:grid-cols-[160px_140px_auto]">
				<label className="text-xs text-gray-600 dark:text-gray-300">
					Fecha simulada
				<input
					type="date"
					value={simulation.date}
					onChange={(e) => setSimulation((prev) => ({ ...prev, date: e.target.value }))}
					className="mt-1.5 w-full border border-gray-300 bg-white px-3 py-2 text-sm text-navy-700 focus:border-accent-500 focus:outline-none dark:border-white/10 dark:bg-dark-700 dark:text-white"
				/>
				</label>

				<label className="text-xs text-gray-600 dark:text-gray-300">
					Hora operativa
				<input
					type="time"
					value={simulation.time}
					onChange={(e) => setSimulation((prev) => ({ ...prev, time: e.target.value }))}
					className="mt-1.5 w-full border border-gray-300 bg-white px-3 py-2 text-sm text-navy-700 focus:border-accent-500 focus:outline-none dark:border-white/10 dark:bg-dark-700 dark:text-white"
				/>
				</label>

				<div className="flex items-end gap-2">
					<button
						type="button"
						onClick={() => setSimulation((prev) => ({ ...prev, enabled: true }))}
						className="border border-gray-300 px-3 py-2 text-sm font-medium text-navy-700 transition hover:bg-gray-100 dark:border-white/10 dark:text-white dark:hover:bg-white/10"
					>
						Cargar demo
					</button>
					<button
						type="button"
						onClick={() => setSimulation({ enabled: false, date: selectedDate, time: "13:15" })}
						className="border border-gray-300 px-3 py-2 text-sm font-medium text-navy-700 transition hover:bg-gray-100 dark:border-white/10 dark:text-white dark:hover:bg-white/10"
						>
						Volver a datos reales
					</button>
				</div>
			</div>

			{simulation.enabled && (
				<p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
					Modo local activo. La hora operativa actual es {simulation.time} y los guardados no tocan la API.
				</p>
			)}

		</div>
	)
}

export default MockPanel;

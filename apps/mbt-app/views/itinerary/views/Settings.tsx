import { InfoRowWithCheck } from "../components/RowWithCheck";
import { BoxWithTitle } from "../components/BoxWithTitle";

import { FaCog } from "react-icons/fa";

type Settings = {
	title: string;
	settings: SettingsRow[]
}

type SettingsRow = {
	title: string;
	description: string;
	active?: bool;
}

const settings: Settings[] = [
	{
		title: 'Configuración de Interfáz',
		settings: [
			{ title: 'Posición del Calendario', description: 'Si se selecciona el calendario aparecerá a la izquierda, de lo contrario, a la derecha' },
			{ title: 'Temas de Compañías', description: 'Si se selecciona cada compañía recibirá una paleta de colores única' }
		]
	},
	{
		title: 'Notificaciones',
		settings: [
			{ title: 'Alerta de Servicios', description: 'Recibir notificaciones por cualquier mutación de algún servicio' },
			{ title: 'Autorecargar Información', description: 'Activar un webhook que chequee por mutuaciones en las APIs' },
			{ title: 'Edición Sincronizada', description: 'Recibir notificaciones cuando otro usuario está viendo/modificando el itinerario' }
		]

	},
	{
		title: 'Manejo de Servicios',
		settings: [
			{ title: 'Asignación Vehículos', description: 'Asignar vehículos automáticamente basado en la cantidad de pasajeros y equipaje' },
			{ title: 'Chequear Vuelos', description: 'Automáticamente chequear los códigos de vuelos de las llegadas' }
		]

	},
	{
		title: 'Configuración de Diseños',
		settings: [
			{ title: 'Generar diseños automáticamente', description: 'Una vez el diseño sea creado en la plataforma, generar PDF y guardar en la base de datos automáticamente (consume recursos sin confirmar errores)' },
			{ title: 'Conexión a Whatsapp', description: 'Automáticamente enviar hacia el número de whatsapp assignado' }
		]

	},
	{
		title: 'Exporte De Servicios',
		settings: [
			{ title: 'Exporte de Archivos Defácto', description: '...' },
			{ title: 'Incluir Metadata', description: 'Incluir metadata (invisíble en documento) sobre la fecha y la edición del itinerario exportado' }
		]

	}

];

export const ItinerarySettingsTab = () => {

	return (
		<div className="rounded-[20px] bg-white p-8 shadow-xl dark:bg-navy-800">
			<div className="mb-8">
				<FaCog className="mx-auto mb-4 h-16 w-16 text-accent-500" />
				<h2 className="mb-4 text-center text-2xl font-bold text-navy-700 dark:text-white">
				  Configuración del Itinerario 
				</h2>        
			</div>

			<div className="space-y-8">
				{settings.map(s => 
					<BoxWithTitle title={s.title} key={s.title}>
						<InfoRowWithCheck rows={s.settings}/>
					</BoxWithTitle>
				)}
							
				{/* Save Button */}
				<div className="pt-6">
					<button className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-navy-800">
						Guardar 
					</button>
				</div>

			</div>
		</div>
	) 
}
	


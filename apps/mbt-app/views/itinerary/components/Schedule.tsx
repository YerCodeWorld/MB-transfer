import { useServiceData } from "../../../contexts/ServiceDataContext";
import { useNavigation } from "../../../contexts/NavigationContext";

import { BsCalendarCheck } from "react-icons/bs";

// Needs to be attached with DB's data
const Schedule = () => {
	const { selectedDate, getServicesByDate } = useServiceData();
	const { pushView } = useNavigation();

	// Get services for selected date and calculate statistics
	const allServices = getServicesByDate(selectedDate);
	const atServices = getServicesByDate(selectedDate, 'at');
	const stServices = getServicesByDate(selectedDate, 'st');
	const mbtServices = getServicesByDate(selectedDate, 'mbt');

	const stats = {
		total: allServices.length,
		byServiceType: {
			'at': atServices.length,
			'st': stServices.length,
			'mbt': mbtServices.length
		}
	};

	const mb = 'mb-2';

	return (
		<div className="w-full rounded-[20px] bg-white px-[20px] py-8 font-dm shadow-xl shadow-gray-100 dark:border dark:!border-white/10 dark:!bg-navy-800 dark:shadow-none 3xl:px-[30px]">
			
			<div className="flex w-full items-center justify-between">
				<h4 className="leading-1 text-lg font-bold text-navy-700 dark:text-white">
				  Servicios 
				</h4>
			</div>

			<div className="mt-8">

				<div className="mb-4 text-center">
				  <div className="text-2xl font-bold text-navy-700 dark:text-white">
				    Total: {stats.total}
				  </div>
				  <div className="text-sm text-gray-600 dark:text-gray-300">                      
				    Mostrando Itinerario del <i className="text-red-400 dark:text-red-200">{
				      new Date(selectedDate).toLocaleDateString("es-ES", { 
					year: "numeric", month: "long", day: "numeric", timeZone: "UTC"
				      })          
				    }</i>          
				  </div>
				</div>

				{/* Airport Transfer */}
				<div
				  className={`flex w-full justify-between bg-blue-50 dark:!bg-blue-900/10 border-l-4 border-l-blue-500 ${mb} rounded-xl py-3 px-4 3xl:p-4 `}
				>
				  <h5 className="text-base font-bold text-blue-700 dark:text-blue-300">
				    {'Airport Transfer'}{" "}
				  </h5>
				  <p className="text-sm font-large text-blue-600 dark:text-blue-400"> {stats.byServiceType.at} Servicios </p>
				</div>

				{/* Sacbé Transfer */}
				<div
				  className={`flex w-full justify-between bg-green-50 dark:!bg-green-600/10 border-l-4 border-l-green-500 ${mb} rounded-xl py-3 px-4 3xl:p-4 `}
				>
				  <h5 className="text-base font-bold text-green-700 dark:text-green-100">
				    {'Sacbé Transfer'}{" "}
				  </h5>
				  <p className="text-sm font-large text-green-600 dark:text-green-200"> {stats.byServiceType.st} Servicios </p>
				</div>

				{/* MB Transfer */}
				<div
				  className={`flex w-full justify-between bg-purple-50 dark:!bg-purple-400/10 border-l-4 border-l-purple-500 ${mb} rounded-xl py-3 px-4 3xl:p-4 `}
				>
				  <h5 className="text-base font-bold text-purple-700 dark:text-purple-100">
				    {'MB Transfer'}{" "}
				  </h5>
				  <p className="text-sm font-large text-purple-600 dark:text-purple-100"> {stats.byServiceType.mbt} Servicios </p>
				</div>
			</div>
		</div>
	);
};

export default Schedule;

// Assets
import { BsArrowRight } from "react-icons/bs";
import { useServices } from "../../../../contexts/ServiceContext";

// Needs to be attached with DB's data
const Schedule = () => {
  const { selectedDate, getServiceStatistics } = useServices();
  const stats = getServiceStatistics(selectedDate);

  const eventBg = '';
  const mb = 'mb-2';

  return (
    <div className="w-full rounded-[20px] bg-white px-[20px] py-8 font-dm shadow-xl shadow-gray-100 dark:border dark:!border-white/10 dark:!bg-navy-800 dark:shadow-none 3xl:px-[30px]">
      {/* Header */}
      <div className="flex w-full items-center justify-between">
        <h4 className="leading-1 text-lg font-bold text-navy-700 dark:text-white">
          Cantidad de Servicios 
        </h4>
        <div className="flex items-center gap-2">
          <p className="w-max text-sm font-medium text-brand-500 transition-all hover:mr-1 hover:cursor-pointer dark:text-white">
            Ver Estadísticas 
          </p>
          <p className="text-base text-brand-500 hover:cursor-pointer dark:text-white">
            <BsArrowRight />
          </p>
        </div>
      </div>
      <div className="mt-8">
        <div className="mb-4 text-center">
          <div className="text-2xl font-bold text-navy-700 dark:text-white">
            {stats.total}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Total Services for {new Date(selectedDate).toLocaleDateString()}
          </div>
        </div>
      
        <div
          className={`flex w-full justify-between dark:!bg-navy-700 ${eventBg} ${mb} rounded-xl py-3 px-4 3xl:p-4 `}
        >
          <h5 className="text-base font-bold text-navy-700 dark:text-white">
            {'AirportTransfer'}{" "}
          </h5>
          <p className="text-sm font-large text-gray-600"> {stats.byAlly['AirportTransfer'] || 0} Services </p>
        </div>

        <div
          className={`flex w-full justify-between dark:!bg-navy-700 ${eventBg} ${mb} rounded-xl py-3 px-4 3xl:p-4 `}
        >
          <h5 className="text-base font-bold text-navy-700 dark:text-white">
            {'Sacbé Transfer'}{" "}
          </h5>
          <p className="text-sm font-large text-gray-600"> {stats.byAlly['Sacbé Transfer'] || 0} Services </p>
        </div>

        <div
          className={`flex w-full justify-between dark:!bg-navy-700 ${eventBg} ${mb} rounded-xl py-3 px-4 3xl:p-4 `}
        >
          <h5 className="text-base font-bold text-navy-700 dark:text-white">
            {'MB Transfer'}{" "}
          </h5>
          <p className="text-sm font-large text-gray-600"> {stats.byAlly['Unassigned'] || 0} Services </p>
        </div>

        {stats.edgeCases > 0 && (
          <div
            className={`flex w-full justify-between bg-yellow-50 dark:!bg-yellow-900/20 ${mb} rounded-xl py-3 px-4 3xl:p-4 border border-yellow-200 dark:border-yellow-600`}
          >
            <h5 className="text-base font-bold text-yellow-700 dark:text-yellow-300">
              {'Edge Cases'}{" "}
            </h5>
            <p className="text-sm font-large text-yellow-600 dark:text-yellow-400"> {stats.edgeCases} Issues </p>
          </div>
        )}
        
      </div>
    </div>
  );
};

export default Schedule;

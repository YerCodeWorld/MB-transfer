// Assets
import { BsArrowRight } from "react-icons/bs";

const Schedule = () => {

  const eventBg = '';
  const mb = '';

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
      
        <div
          className={`flex w-full justify-between dark:!bg-navy-700 ${eventBg} ${mb} rounded-xl py-3 px-4 3xl:p-4 `}
        >
          <h5 className="text-base font-bold text-navy-700 dark:text-white">
            {'AirportTransfer'}{" "}
          </h5>
          <p className="text-sm font-large text-gray-600"> {"24 Services"} </p>
        </div>

        <div
          className={`flex w-full justify-between dark:!bg-navy-700 ${eventBg} ${mb} rounded-xl py-3 px-4 3xl:p-4 `}
        >
          <h5 className="text-base font-bold text-navy-700 dark:text-white">
            {'Sacbé Transfer'}{" "}
          </h5>
          <p className="text-sm font-large text-gray-600"> {"14 Services"} </p>
        </div>

        <div
          className={`flex w-full justify-between dark:!bg-navy-700 ${eventBg} ${mb} rounded-xl py-3 px-4 3xl:p-4 `}
        >
          <h5 className="text-base font-bold text-navy-700 dark:text-white">
            {'MB Transfer'}{" "}
          </h5>
          <p className="text-sm font-large text-gray-600"> {"4 Services"} </p>
        </div>
        
      </div>
    </div>
  );
};

export default Schedule;

import DailyTraffic from "./components/DailyTraffic";
import OverallRevenue from "./components/OverallRevenue";
import MiniStatistics from "./components/MiniStatistics";
import WeeklyRevenue from "./components/WeeklyRevenue";
import ServiceMix from "./components/ServiceMix";
import TopRoutes from "./components/TopRoutes";

import {
  MdDirectionsCar,
  MdPaid,
  MdOutlineBarChart,
  MdRoute,
} from "react-icons/md";

const Dashboard = () => {
  return (
    <div className="h-full w-full overflow-y-auto pb-24">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-navy-700 dark:text-white">
          Estadisticas
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Panorama general de operaciones, ingresos y demanda.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-4">
        <div>
          <MiniStatistics
            icon={<MdOutlineBarChart className="text-4xl" />}
            title="Ingresos del Mes"
            value="$148,920"
            growth="+8.4%"
            growthColor="text-white"
            cardBg="bg-gradient-to-r from-accent-400 to-accent-600"
            titleColor="text-white"
            valueColor="text-white"
            bgColor="bg-gradient-to-r from-accent-600 to-accent-400"
            detailColor="text-white"
            iconColor="text-white"
          />
        </div>
        <div>
          <MiniStatistics
            icon={<MdPaid className="text-4xl" />}
            title="Gasto Operativo"
            value="$62,310"
            bgColor="bg-lightPrimary dark:!bg-navy-700"
            growth="-2.1%"
            growthColor="text-red-500"
            cardBg="bg-white"
            titleColor="text-gray-600"
            valueColor="text-navy-700 dark:text-white"
            detailColor="text-gray-600"
            iconColor="text-brand-500 dark:text-white"
          />
        </div>
        <div>
          <MiniStatistics
            icon={<MdDirectionsCar className="text-4xl" />}
            title="Servicios Completados"
            value="1,284"
            bgColor="bg-lightPrimary dark:!bg-navy-700"
            growth="+12.3%"
            growthColor="text-green-500"
            cardBg="bg-white"
            titleColor="text-gray-600"
            valueColor="text-navy-700 dark:text-white"
            detailColor="text-gray-600"
            iconColor="text-brand-500 dark:text-white"
          />
        </div>
        <div>
          <MiniStatistics
            icon={<MdRoute className="text-4xl" />}
            title="Rutas Activas"
            value="42"
            bgColor="bg-lightPrimary dark:bg-navy-700"
            growth="+5.0%"
            growthColor="text-green-500"
            cardBg="bg-white"
            titleColor="text-gray-600"
            valueColor="text-navy-700 dark:text-white"
            detailColor="text-gray-600"
            iconColor="text-brand-500 dark:text-white"
          />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 3xl:grid-cols-6">
        <div className="3xl:col-span-4">
          <OverallRevenue />
        </div>
        <div className="3xl:col-span-2">
          <WeeklyRevenue />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 3xl:grid-cols-6">
        <div className="3xl:col-span-2">
          <DailyTraffic />
        </div>
        <div className="3xl:col-span-2">
          <ServiceMix />
        </div>
        <div className="3xl:col-span-2">
          <TopRoutes />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

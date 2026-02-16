import Card from "../../../components/single/card";
import PieChart from "../../../components/charts/piechart";

const serviceMixData = [46, 31, 23];

const serviceMixOptions = {
  chart: {
    toolbar: { show: false },
  },
  labels: ["Arrival", "Departure", "Transfer"],
  colors: ["var(--color-accent-500)", "#39B8FF", "#22C55E"],
  legend: {
    position: "bottom",
    labels: {
      colors: "#A3AED0",
    },
  },
  dataLabels: {
    enabled: true,
    style: {
      fontSize: "12px",
      fontWeight: "600",
    },
  },
  stroke: {
    colors: ["transparent"],
  },
  tooltip: {
    theme: "dark",
  },
};

const ServiceMix = () => {
  return (
    <Card extra="h-[360px] p-5">
      <div className="mb-3">
        <h3 className="text-lg font-bold text-navy-700 dark:text-white">
          Mezcla de Servicios
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Distribucion del mes por tipo de operacion
        </p>
      </div>

      <div className="h-[250px] w-full">
        <PieChart chartData={serviceMixData} chartOptions={serviceMixOptions} />
      </div>
    </Card>
  );
};

export default ServiceMix;

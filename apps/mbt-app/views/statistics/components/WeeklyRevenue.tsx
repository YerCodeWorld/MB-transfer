import Card from "../../../components/single/card";
import BarChart from "../../../components/charts/barchart";

import { MdBarChart } from "react-icons/md";

const barChartDataWeeklyRevenue = [
  {
    name: "Arrivals",
    data: [5200, 4800, 5600, 6100, 5900, 6200, 6500],
    color: "#6AD2Fa",
  },
  {
    name: "Departures",
    data: [4300, 4200, 4600, 5000, 5100, 5300, 5400],
    color: "var(--color-500)",
  },
  {
    name: "Transfers",
    data: [2800, 2600, 3000, 3200, 3500, 3700, 3900],
    color: "#EFF4FB",
  },
];

const barChartOptionsWeeklyRevenue = {
  chart: {
    stacked: true,
    toolbar: {
      show: false,
    },
  },
  tooltip: {
    style: {
      fontSize: "12px",
      backgroundColor: "#000000",
    },
    theme: "dark",
    y: {
      formatter: (value: number) => `$${value.toLocaleString()}`,
    },
  },
  xaxis: {
    categories: ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"],
    show: false,
    labels: {
      show: true,
      style: {
        colors: "#A3AED0",
        fontSize: "14px",
        fontWeight: "500",
      },
    },
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
  },
  yaxis: {
    show: false,
    labels: {
      show: false,
    },
  },
  grid: {
    borderColor: "rgba(163, 174, 208, 0.3)",
    show: true,
    yaxis: {
      lines: {
        show: false,
        opacity: 0.5,
      },
    },
    xaxis: {
      lines: {
        show: false,
      },
    },
  },
  fill: {
    type: "solid",
    colors: ["#5E37FF", "#6AD2FF", "#E1E9F8"],
  },
  legend: {
    show: false,
  },
  colors: ["#5E37FF", "#6AD2FF", "#E1E9F8"],
  dataLabels: {
    enabled: false,
  },
  plotOptions: {
    bar: {
      borderRadius: 10,
      columnWidth: "22px",
    },
  },
};

const WeeklyRevenue = () => {
  return (
    <Card extra="h-[381px] w-full rounded-3xl px-2 py-6 text-center">
      <div className="mb-auto flex items-center justify-between px-6">
        <div>
          <h2 className="text-left text-lg font-bold text-navy-700 dark:text-white">
            Ingresos Semanales
          </h2>
          <p className="text-left text-sm text-gray-600 dark:text-gray-400">
            Distribucion por tipo de servicio (USD)
          </p>
        </div>
        <button className="!linear z-[1] flex items-center justify-center rounded-lg bg-lightPrimary p-2 text-brand-500 !transition !duration-200 hover:bg-gray-100 active:bg-gray-200 dark:bg-navy-700 dark:text-white dark:hover:bg-white/20 dark:active:bg-white/10">
          <MdBarChart className="h-6 w-6" />
        </button>
      </div>

      <div className="h-[280px] w-full pt-6">
        <BarChart
          chartData={barChartDataWeeklyRevenue}
          chartOptions={barChartOptionsWeeklyRevenue}
        />
      </div>
    </Card>
  );
};

export default WeeklyRevenue;

import BarChart from "../../../charts/barchart";

export const barChartDataHoursSpent = [
  {
    name: "Services This Week",
    data: [2.7, 2.3, 5, 6, 4, 3],
  },
];

export const barChartOptionsHoursSpent = {
  chart: {
    toolbar: {
      show: false,
    },
  },
  tooltip: {
    style: {
      fontSize: "12px",
    },
    onDatasetHover: {
      style: {
        fontSize: "12px",
      },
    },
    theme: "dark",
  },
  xaxis: {
    categories: ["S", "M", "T", "W", "T", "F"],
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
    show: true,
    color: "black",
    labels: {
      show: true,
      style: {
        colors: "#CBD5E0",
        fontSize: "14px",
      },
    },
  },
  grid: {
    borderColor: "rgba(163, 174, 208, 0.3)",
    show: true,
    yaxis: {
      lines: {
        show: true,
        opacity: 0.5,
      },
    },
    row: {
      opacity: 0.5,
    },
    xaxis: {
      lines: {
        show: false,
      },
    },
  },
  fill: {
    type: "solid",
    colors: ["var(--color-accent-400)"],
    opacity: 1,
  },
  dataLabels: {
    enabled: false,
  },
  plotOptions: {
    bar: {
      borderRadius: 10,
      columnWidth: "40px",
    },
  },
};

const Hours = () => {
  return (
    <div className="w-full rounded-[20px] bg-white font-dm shadow-2xl shadow-gray-100 dark:border dark:!border-white/10 dark:!bg-navy-800 dark:shadow-none">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 3xl:px-8">
        <p className="leading-1 text-lg font-bold text-navy-700 dark:text-white">
          Hours Spent
        </p>
        <p className="leading-1 text-sm font-bold text-navy-700 dark:text-white">
          22 h 45 min
        </p>
      </div>
      <div className="h-[210px] w-full px-4 2xl:px-8">
        <BarChart
          chartData={barChartDataHoursSpent}
          chartOptions={barChartOptionsHoursSpent}
        />
      </div>
    </div>
  );
};

export default Hours;

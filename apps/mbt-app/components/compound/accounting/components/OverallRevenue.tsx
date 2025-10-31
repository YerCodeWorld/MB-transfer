import Card from '../../../single/card';
import LineChart from '../../../charts/LineChart';

import { MdArrowDropUp } from 'react-icons/md';

export const lineChartDataOverallRevenue = [
  {
    name: "Revenue",
    data: [50, 64, 48, 66, 49, 68],
  },
  {
    name: "Profit",
    data: [30, 40, 24, 46, 20, 46],
  },
];

export const lineChartOptionsOverallRevenue = {
  chart: {
    toolbar: {
      show: false,
    },
    dropShadow: {
      enabled: true,
      top: 13,
      left: 0,
      blur: 10,
      opacity: 0.1,
      color: "var(--color-500)",
    },
  },
  colors: ["var(--color-accent-500)", "#39B8FF"],
  markers: {
    size: 0,
    colors: "white",
    strokeColors: "#7551FF",
    strokeWidth: 3,
    strokeOpacity: 0.9,
    strokeDashArray: 0,
    fillOpacity: 1,
    // discrete: [],
    shape: "circle",
    radius: 2,
    offsetX: 0,
    offsetY: 0,
    showNullDataPoints: true,
  },
  tooltip: {
    theme: "dark",
  },
  dataLabels: {
    enabled: false,
  },
  stroke: {
    curve: "smooth",
    type: "line",
  },
  xaxis: {
    type: "numeric",
    categories: ["SEP", "OCT", "NOV", "DEC", "JAN", "FEB"],
    labels: {
      style: {
        colors: "#A3AED0",
        fontSize: "12px",
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
  },
  legend: {
    show: false,
  },
  grid: {
    show: false,
    column: {
      color: ["#7551FF", "#39B8FF"],
      opacity: 0.5,
    },
  },
  color: ["#7551FF", "#39B8FF"],
};

function OverallRevenue() {
  const newOptions = {
    ...lineChartOptionsOverallRevenue,
    colors: ['var(--color-accent-500)', '#39B8FF'],
  };

  return (
    <Card extra={'h-[381px] pb-8 px-6 pt-6'}>
      <div className="flex justify-between px-3 pt-1">
        <div className="flex items-center">
          <div className="flex flex-col">
            <p className="text-[34px] font-bold text-navy-700 dark:text-white">
              {' '}
              $37.5K
            </p>
            <p className="text-sm font-medium text-gray-600">
              Overall Revenue{' '}
            </p>
          </div>
          <div className="ml-4 flex items-end pb-2">
            <MdArrowDropUp className="font-medium text-green-500" />
            <span className="text-sm font-bold text-green-500">+2.45%</span>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <select className="mb-3 mr-2 flex items-center justify-center text-sm font-bold text-gray-600 hover:cursor-pointer dark:!bg-navy-800 dark:text-white">
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
            <option value="weekly">Weekly</option>
          </select>
        </div>
      </div>

      {/* Charts */}
      <div className="flex h-full w-full flex-row sm:flex-wrap lg:flex-nowrap 2xl:overflow-hidden">
        <div className="h-full w-full">
          <LineChart
            chartData={lineChartDataOverallRevenue}
            chartOptions={newOptions}
          />
        </div>
      </div>
    </Card>
  );
}

export default OverallRevenue;

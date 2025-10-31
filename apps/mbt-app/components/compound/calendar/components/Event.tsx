import Card from "../../../single/card";
import LineAreaChart from "../../../charts/lineareachart";

import { RiArrowUpSFill } from "react-icons/ri";

export const lineChartDataAreaEventsCalendar = [
  {
    name: "Price",
    data: [100, 250, 300, 220, 280, 250, 300, 230, 300, 350, 250, 350],
  },
];

export const lineChartOptionsAreaEventsCalendar = {
  chart: {
    height: "70px",
    toolbar: {
      show: false,
    },
    redrawOnParentResize: true,
  },
  tooltip: {
    enabled: false,
    theme: "dark",
  },
  dataLabels: {
    enabled: false,
  },
  stroke: {
    curve: "smooth",
    width: 3.5,
  },
  xaxis: {
    type: "datetime",
    categories: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    labels: {
      show: false,
      style: {
        colors: "#c8cfca",
        fontSize: "12px",
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
      style: {
        colors: "#A3AED0",
        fontSize: "12px",
        fontWeight: "500",
      },
    },
  },
  legend: {
    show: false,
  },
  grid: {
    show: false,
    strokeDashArray: 5,
    borderColor: "#56577A",
  },
  fill: {
    type: "gradient",
    gradient: {
      shade: "dark",
      type: "vertical",
      shadeIntensity: 0,

      inverseColors: true,
      opacityFrom: 0.6,
      opacityTo: 0,
    },
    colors: ["#707EAE"],
  },
  colors: ["#707EAE"],
};

const Event = () => {
  return (
    <Card extra={"w-full h-[260px] p-5"}>
      <h4 className="text-xl font-bold text-navy-700 dark:text-white">
        Completed Events
      </h4>
      <div className="mt-[2px] flex items-center gap-1 text-sm">
        <p className="text-base font-bold text-green-500">
          <RiArrowUpSFill />
        </p>
        <p className="font-bold text-green-500">+16%</p>
        <p className="font-bold text-gray-600">Since last month</p>
      </div>
      <div>
        <LineAreaChart
          chartData={lineChartDataAreaEventsCalendar}
          chartOptions={lineChartOptionsAreaEventsCalendar}
        />
      </div>
    </Card>
  );
};

export default Event;

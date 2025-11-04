import BarChart from "../../../charts/barchart";
import { useServices } from "../../../../contexts/ServiceContext";
import { useMemo } from "react";

// Needs to be attached with DB's data
const Hours = () => {
  const { services, selectedDate } = useServices();

  const weeklyData = useMemo(() => {
    const today = new Date(selectedDate);
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
    
    const weekDays: number[] = [];
    const weekLabels = ["S", "M", "T", "W", "T", "F", "S"];
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      
      const dayServices = services.filter(service => {
        const serviceDate = new Date(service.pickupTime);
        return serviceDate.toDateString() === day.toDateString();
      });
      
      weekDays.push(dayServices.length);
    }
    
    return {
      data: weekDays,
      labels: weekLabels,
      total: weekDays.reduce((sum, count) => sum + count, 0)
    };
  }, [services, selectedDate]);

  const barChartDataHoursSpent = [
    {
      name: "Services This Week",
      data: weeklyData.data,
    },
  ];

  const barChartOptionsHoursSpent = {
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
      categories: weeklyData.labels,
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

  return (
    <div className="w-full rounded-[20px] bg-white font-dm shadow-2xl shadow-gray-100 dark:border dark:!border-white/10 dark:!bg-navy-800 dark:shadow-none">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 3xl:px-8">
        <p className="leading-1 text-lg font-bold text-navy-700 dark:text-white">
          Servicios esta Semana
        </p>
        <p className="leading-1 text-sm font-bold text-navy-700 dark:text-white">
          {weeklyData.total} servicios
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

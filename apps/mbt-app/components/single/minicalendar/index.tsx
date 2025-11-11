import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import "../../css/MiniCalendar.css";
import { useServiceData } from "../../../contexts/ServiceDataContext";

const MiniCalendar = (props: { width?: string }) => {
  const { width } = props;
  const { selectedDate, setSelectedDate, getServicesByDate } = useServiceData();
  const [value, onChange] = useState<Date | null>(new Date(selectedDate));

  const handleDateChange = (value: any) => {
    onChange(value);
    if (value instanceof Date) {
      const dateString = value.toISOString().split('T')[0];
      setSelectedDate(dateString);
    }
  };

  // Update local state when selectedDate changes from outside
  useEffect(() => {
    onChange(new Date(selectedDate));
  }, [selectedDate]);

  // Custom tile content to show service count
  const getTileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const dateString = date.toISOString().split('T')[0];
      const services = getServicesByDate(dateString);
      
      if (services.length > 0) {
        return (
          <div className="service-indicator">
            <div className="w-2 h-2 bg-blue-500 rounded-full mx-auto mt-1"></div>
            <div className="text-xs text-blue-600 font-semibold">
              {services.length}
            </div>
          </div>
        );
      }
    }
    return null;
  };

  return (
    <div>
      <div
        className={`flex ${
          width ? `w-[${width}]` : "w-full md:w-[320px]"
        } h-full max-w-full flex-col rounded-[20px] bg-white px-3 z-0 py-4 dark:border dark:!border-white/10 dark:!bg-navy-800`}
      >
        <Calendar
          onChange={handleDateChange}
          value={value}
          prevLabel={<MdChevronLeft className="ml-1 h-6 w-6" />}
          nextLabel={<MdChevronRight className="ml-1 h-6 w-6" />}
          view={"month"}
          tileContent={getTileContent}
        />
      </div>
    </div>
  );
};

export default MiniCalendar;

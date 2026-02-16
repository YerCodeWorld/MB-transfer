import React, { useEffect, useRef, useState } from "react";
import Calendar, { CalendarTileProperties } from "react-calendar";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import "../../css/MiniCalendar.css";

import { useServiceData } from "../../../contexts/ServiceDataContext";
import { isSameDay, startOfGrid, parseYMDLocal } from "../../../utils/dateUtils";
import { apiClient } from "../../../utils/api";

import "react-calendar/dist/Calendar.css";

type MiniCalendarProps = { width?: string };

const MiniCalendar: React.FC<MiniCalendarProps> = ({ width }) => {
  const { selectedDate, setSelectedDate } = useServiceData();

  const containerRef = useRef<HTMLDivElement>(null);

  const [value, setValue] = useState<Date | null>(parseYMDLocal(selectedDate));
  const [activeStartDate, setActiveStartDate] = useState<Date | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [isLoadingCounts, setIsLoadingCounts] = useState<boolean>(false);

  // Global tooltip state
  const [tip, setTip] = useState<{
    text: string;
    x: number;
    y: number;
    show: boolean;
  }>({ text: "", x: 0, y: 0, show: false });

  const showTip = (tileEl: HTMLElement, text: string, offsetY = 8) => {
    const parent = containerRef.current;
    if (!parent) return;
    const r = tileEl.getBoundingClientRect();
    const pr = parent.getBoundingClientRect();
    const x = r.left - pr.left + r.width / 2; // center of tile
    const y = r.top - pr.top - offsetY; // above tile
    setTip({ text, x, y, show: true });
  };
  const hideTip = () => setTip((t) => ({ ...t, show: false }));

  const toYMDFromDateParts = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const toYMDFromApiDate = (value: unknown): string => {
    if (typeof value === "string") {
      const match = value.match(/^(\d{4}-\d{2}-\d{2})/);
      if (match) return match[1];
    }
    return toYMDFromDateParts(new Date(value as any));
  };

  const handleDateChange = (val: Date | Date[]) => {
    if (val instanceof Date) {
      setValue(val);            
      setSelectedDate(toYMDFromDateParts(val));
    }
  };

  useEffect(() => {
    setValue(parseYMDLocal(selectedDate));
  }, [selectedDate]);

  // Precompute visible 6x7 grid counts by fetching itineraries for the month
  useEffect(() => {
    const fetchServiceCounts = async () => {
      setIsLoadingCounts(true);

      try {
        const base = activeStartDate ?? (value instanceof Date ? new Date(value) : new Date());
        const start = startOfGrid(base);

        // Calculate end date (42 days from start)
        const end = new Date(start);
        end.setDate(start.getDate() + 41);

        // Fetch itineraries for this date range
        const response = await apiClient.getItineraries({
          startDate: start.toISOString(),
          endDate: end.toISOString(),
        });

        const next: Record<string, number> = {};

        if (response.success && response.data) {
          // Count services for each itinerary
          response.data.forEach((itinerary: any) => {
            // Avoid timezone shifts when backend already returns YYYY-MM-DD.
            const key = toYMDFromApiDate(itinerary.date);
            // Count services if they exist in the itinerary
            next[key] = itinerary.services?.length || itinerary._count?.services || 0;
          });
        }

        setCounts(next);
      } catch (error) {
        console.error('Error fetching service counts:', error);
        setCounts({});
      } finally {
        setIsLoadingCounts(false);
      }
    };

    fetchServiceCounts();
  }, [activeStartDate, value]);

  const badgeClass = (count: number) => {
    if (count >= 25) return "bg-rose-600 text-white";
    if (count >= 15) return "bg-orange-500 text-white";
    if (count >= 10) return "bg-green-300 text-white";
    if (count >= 5) return "bg-green-600 text-white";
    if (count >= 0) return "bg-accent-400 text-white";
    return "bg-emerald-200 text-emerald-900";
  };

  const tileContent = ({ date, view }: CalendarTileProperties) => {
    if (view !== "month") return null;
    const key = toYMDFromDateParts(date);
    const count = counts[key] ?? 0;    
    if (!count) return null;

    const label = `${count} service${count === 1 ? "" : "s"} on ${key}`;

    return (
      <div
        className="mt-1 items-center"
        onMouseEnter={(e) => showTip(e.currentTarget as HTMLElement, label)}
        onMouseLeave={hideTip}
        onFocus={(e) => showTip(e.currentTarget as HTMLElement, label)}
        onBlur={hideTip}
      >
        <div className={`min-w-[1.5rem] px-1 text-[10px] font-semibold ${badgeClass(count)} text-center`}>
          {count}
        </div>        
      </div>
    );
  };

  const tileClassName = ({ date, view }: CalendarTileProperties) => {
    if (view !== "month") return undefined;
    const key = toYMDFromDateParts(date);
    const today = new Date();
    const selected = value instanceof Date ? value : null;
    const hasServices = (counts[key] ?? 0) > 0;

    return [
      hasServices ? "has-services" : "",
      isSameDay(date, today) ? "!bg-accent-200 !ring-accent-500 !rounded-md" : "",
      selected && isSameDay(date, selected)
        ? "!bg-accent-50 dark:!bg-accent-900/20 !rounded-md"
        : "",
    ]
      .filter(Boolean)
      .join(" ");
  };

  return (
    <div
      ref={containerRef}
      className="
        relative
        flex h-full max-w-full flex-col rounded-2xl bg-accent-100 px-3 py-4
        dark:border dark:border-white/10 dark:bg-navy-800
      "
      style={width ? { width } : undefined}
    >
      {/* Absolute overlay for global tooltip */}
      <div className="pointer-events-none absolute inset-0 z-50">
        {tip.show && (
          <div
            className="absolute -translate-x-1/2 -translate-y-full rounded-md border border-black/10 bg-white px-2 py-1 text-xs text-gray-800 shadow-lg ring-1 ring-black/5 dark:bg-navy-700 dark:text-gray-200 dark:border-white/10"
            style={{ left: tip.x, top: tip.y }}
            role="tooltip"
          >
            {tip.text}
          </div>
        )}
      </div>

      <Calendar        
        onChange={handleDateChange}
        value={value}
        view="month"
        prevLabel={<MdChevronLeft className="ml-1 h-6 w-6" aria-hidden />}
        nextLabel={<MdChevronRight className="ml-1 h-6 w-6" aria-hidden />}
        prev2Label={null}
        next2Label={null}
        onActiveStartDateChange={({ activeStartDate }) =>
          setActiveStartDate(activeStartDate)
        }
        defaultActiveStartDate={
          value instanceof Date
            ? new Date(value.getFullYear(), value.getMonth(), 1)
            : undefined
        }
        tileContent={tileContent}
        tileClassName={tileClassName}
        onClickDay={(d) => handleDateChange(d)}
        formatDay={(locale, date) => `${date.getDate()}`}
        tileAriaLabel={({ date, view }) =>
            view === "month"
              ? `${date.toDateString()}, ${(counts[toYMDFromDateParts(date)] ?? 0)} services`
              : undefined
        }
      />

      <div className="mt-3 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
        <span className="inline-flex h-3 w-3 rounded-sm bg-accent-200" /> 1 to 4
        <span className="inline-flex h-3 w-3 rounded-sm bg-green-600" /> 5 to 9
        <span className="inline-flex h-3 w-3 rounded-sm bg-green-300" /> 10 to 14
        <span className="inline-flex h-3 w-3 rounded-sm bg-orange-500" /> 15 to 24
        <span className="inline-flex h-3 w-3 rounded-sm bg-rose-600" /> 25+        
      </div>
    </div>
  );
};

export default MiniCalendar;

"use client"

import React from "react";
import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useServiceData } from "../../../contexts/ServiceDataContext";
import { parseYMDLocal } from "@/utils/dateUtils";
import MiniCalendar from "../minicalendar";

import Configurator from "./Configurator";

import { FiAlignJustify } from "react-icons/fi";
import { BsCalendar3 } from "react-icons/bs";

const HeaderBar = (props: {
  onOpenSidenav: () => void;
  brandText: string;
  secondary?: boolean | string;
  [x: string]: any;
}) => {
  const {
    onOpenSidenav,
    mini,
    theme,
    setTheme,
    themePresets,
    darkmode,
    setDarkmode,
    selectedBackground,
    setSelectedBackground,
  } = props;

  const { selectedDate } = useServiceData();
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  function capitalize(s: string): string {
    if (s.length < 2) return "";
    return s[0].toUpperCase()+s.slice(1);
  }

  const [now, setNow] = useState<Date | null>(null);          // null on SSR
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(new Date());
    const id = setInterval(() => {
      setNow(prevNow => {
        const newDate = new Date();
        // Only update if the second has actually changed
        if (!prevNow || newDate.getSeconds() !== prevNow.getSeconds()) {
          return newDate;
        }
        return prevNow;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const timeData = useMemo(() => {
    if (!now) {
      return {
        dayName: "",
        dayNum: "",
        month: "",
        time: "",
        hour: 12,
      };
    }
    const tz = "America/Santo_Domingo";
    const dayName = capitalize(
      now.toLocaleDateString("es-ES", { weekday: "long", timeZone: tz })
    );
    const dayNum = now
      .toLocaleString("es-ES", { day: "2-digit", timeZone: tz })
      .padStart(2, "0");
    const month = capitalize(
      now.toLocaleDateString("es-ES", { month: "long", timeZone: tz })
    );
    const time = now.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
      timeZone: tz,
    });
    const hour = parseInt(
      now.toLocaleString("es-ES", { hour: "2-digit", hour12: false, timeZone: tz }),
      10
    );
    return { dayName, dayNum, month, time, hour };
  }, [now]);

  const message = useMemo(() => {
    const h = timeData.hour;
    if (h < 12) return "Buenos días";
    if (h < 18) return "Buenas tardes";
    return "Buenas noches";
  }, [timeData.hour]);

  const selectedDateLabel = useMemo(() => {
    const date = parseYMDLocal(selectedDate);
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
      timeZone: "America/Santo_Domingo",
    });
  }, [selectedDate]);

  const datePickerModal = isDatePickerOpen && typeof window !== "undefined"
    ? createPortal(
      <div
        className="fixed inset-0 z-[50000] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            setIsDatePickerOpen(false);
          }
        }}
      >
        <div className="w-full max-w-md rounded-[24px] bg-white p-4 shadow-xl shadow-shadow-500 dark:!bg-navy-700 dark:text-white dark:shadow-none sm:p-5">
          <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-3 dark:border-white/10">
            <div>
              <p className="text-base font-bold text-navy-700 dark:text-white">
                Fecha de trabajo
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {selectedDateLabel}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsDatePickerOpen(false)}
              className="rounded-lg px-2 py-1 text-sm font-semibold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-navy-600"
            >
              Cerrar
            </button>
          </div>
          <MiniCalendar />
        </div>
      </div>,
      document.body
    )
    : null;

  return (
    <>
    <nav
      className={`duration-175 linear fixed top-2 left-3 right-3 z-50 flex flex-row items-center justify-between rounded-xl bg-white/30 p-2 backdrop-blur-xl transition-all dark:bg-[#0b14374d] md:top-4 xl:top-[20px] xl:left-auto xl:right-[30px] ${
        mini === false
          ? "xl:w-[calc(100vw_-_350px)] 2xl:w-[calc(100vw_-_365px)]"
          : "xl:w-[calc(100vw_-_180px)] 2xl:w-[calc(100vw_-_195px)]"
      }`}
    >

	{/** TIME INFO, GREETING **/}
      <div className="ml-[6px] min-w-0">
        <h2 className="truncate text-xs text-accent-500 dark:text-accent-100 sm:text-sm hidden md:inline">
          {now ? `${message}!` : ""} | {timeData.time}
        </h2>
        <p className="flex items-center gap-2 rounded-x1 text-sm text-accent-800 dark:text-accent-50 tabular-nums md:text-[1.3rem]">
          <span className="">
            <strong>Fecha Seleccionada:</strong> {selectedDateLabel} 
          </span>
        </p>
      </div>

      <div className="relative mt-[3px] flex h-[52px] items-center gap-2 rounded-full bg-white px-2 py-2 shadow-xl shadow-shadow-500 dark:!bg-navy-800 dark:shadow-none sm:h-[61px] sm:gap-3 sm:px-4">
        <span
          className="flex cursor-pointer text-xl text-gray-600 dark:text-white xl:hidden"
          onClick={onOpenSidenav}
        >
          <FiAlignJustify className="h-5 w-5" />
        </span>

        <button
          type="button"
          onClick={() => setIsDatePickerOpen(true)}
          className="flex items-center gap-2 rounded-full border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 dark:border-white/10 dark:text-white dark:hover:bg-navy-700"
          aria-label="Cambiar fecha de trabajo"
        >
          <BsCalendar3 className="h-4 w-4" />
          <span className="hidden lg:inline">Cambiar fecha</span>
        </button>

        {/* Settings/Configurator */}
        <div className="flex h-10 w-10 items-center justify-center">
          <Configurator
            mini={props.mini}
            setMini={props.setMini}
            theme={theme}
            setTheme={setTheme}
            themePresets={themePresets}
            darkmode={darkmode}
            setDarkmode={setDarkmode}
            selectedBackground={selectedBackground}
            setSelectedBackground={setSelectedBackground}
          />
        </div>
      </div>
    </nav>

    {datePickerModal}
    </>
  );
};

export default HeaderBar;

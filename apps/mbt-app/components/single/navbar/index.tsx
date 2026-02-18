"use client"

import React from "react";
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../../contexts/AuthContext";

import Image from "next/image";
import Dropdown from "../../../components/single/dropdown";
import Link from "next/link";
import Configurator from "./Configurator";

import { BsArrowBarUp } from "react-icons/bs";
import { FiSearch } from "react-icons/fi";
import { RiMoonFill, RiSunFill } from 'react-icons/ri';
import { FiAlignJustify } from "react-icons/fi";
import { IoMdNotificationsOutline, IoMdInformationCircleOutline } from "react-icons/io";

import avatar from  "../../../public/bg-water.jpg";

const Navbar = (props: {
  onOpenSidenav: () => void;
  brandText: string;
  secondary?: boolean | string;
  [x: string]: any;
}) => {
  const {
    onOpenSidenav,
    brandText,
    mini,
    setMini,
    theme,
    setTheme,
    themePresets,
    darkmode,
    setDarkmode,
    hovered,
    selectedBackground,
    setSelectedBackground,
  } = props;

	const { employee } = useAuth();

  function capitalize(s: string): string {
    if (s.length < 2) return "";
    return s[0].toUpperCase()+s.slice(1);
  }

  const [now, setNow] = useState<Date | null>(null);          // null on SSR
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);                                         // gate client-only UI
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

  return (
    <nav
      className={`duration-175 linear fixed top-3 right-3 flex flex-row flex-wrap items-center justify-between rounded-xl bg-white/30 transition-all ${
        mini === false
          ? "w-[calc(100vw_-_6%)] md:w-[calc(100vw_-_8%)] lg:w-[calc(100vw_-_6%)] xl:w-[calc(100vw_-_350px)] 2xl:w-[calc(100vw_-_365px)]"
          : mini === true && hovered === true
          ? "w-[calc(100vw_-_6%)] md:w-[calc(100vw_-_8%)] lg:w-[calc(100vw_-_6%)] xl:w-[calc(100vw_-_350px)] 2xl:w-[calc(100vw_-_365px)]"
          : "w-[calc(100vw_-_6%)] md:w-[calc(100vw_-_8%)] lg:w-[calc(100vw_-_6%)] xl:w-[calc(100vw_-_180px)] 2xl:w-[calc(100vw_-_195px)]"
      }  p-2 backdrop-blur-xl dark:bg-[#0b14374d] md:top-4 md:right-[30px] xl:top-[20px] z-50`}
    >

	{/** TIME INFO, GREETING **/}
      <div className="ml-[6px]">
        <h2 className="text-accent-500 dark:text-accent-100">{mounted ? `${message}!` : ""}</h2>
        <p className="flex items-center gap-2 rounded-x1 text-[1.3rem] text-accent-800 dark:text-accent-50 tabular-nums">
          <span>{timeData.dayName} {timeData.dayNum} de {timeData.month} | {timeData.time} </span>
        </p>
      </div>

      <div className="relative mt-[3px] flex h-[61px] items-center gap-3 rounded-full bg-white px-4 py-2 shadow-xl shadow-shadow-500 dark:!bg-navy-800 dark:shadow-none">
        <span
          className="flex cursor-pointer text-xl text-gray-600 dark:text-white xl:hidden"
          onClick={onOpenSidenav}
        >
          <FiAlignJustify className="h-5 w-5" />
        </span>
        {/* Notification */}
        <Dropdown
          button={
            <div className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-navy-700 transition-colors cursor-pointer">
              <IoMdNotificationsOutline className="h-5 w-5 text-gray-600 dark:text-white" />
            </div>
          }
          animation="origin-[65%_0%] md:origin-top-right transition-all duration-300 ease-in-out"
        >
          <div className="flex w-[360px] flex-col gap-3 rounded-[20px] bg-white p-4 shadow-xl shadow-shadow-500 dark:!bg-navy-700 dark:text-white dark:shadow-none sm:w-[460px]">
            <div className="flex items-center justify-between">
              <p className="text-base font-bold text-navy-700 dark:text-white">
                Notificación
              </p>
              <p className="text-sm font-bold text-navy-700 dark:text-white">
                Marcar todos como leídos
              </p>
            </div>

            <button className="flex w-full items-center">
              <div className="flex h-full w-[85px] items-center justify-center rounded-xl bg-gradient-to-b from-brand-400 to-brand-500 py-4 text-2xl text-white">
                <BsArrowBarUp />
              </div>
              <div className="ml-2 flex h-full w-full flex-col justify-center rounded-lg px-1 text-sm">
                <p className="mb-1 text-left text-base font-bold text-gray-900 dark:text-white">
                  New Update: Horizon UI Dashboard PRO
                </p>
                <p className="font-base text-left text-xs text-gray-900 dark:text-white">
                  A new update for your downloaded item is available!
                </p>
              </div>
            </button>

            <button className="flex w-full items-center">
              <div className="flex h-full w-[85px] items-center justify-center rounded-xl bg-gradient-to-b from-brand-400 to-brand-500 py-4 text-2xl text-white">
                <BsArrowBarUp />
              </div>
              <div className="ml-2 flex h-full w-full flex-col justify-center rounded-lg px-1 text-sm">
                <p className="mb-1 text-left text-base font-bold text-gray-900 dark:text-white">
                  New Update: Horizon UI Dashboard PRO
                </p>
                <p className="font-base text-left text-xs text-gray-900 dark:text-white">
                  A new update for your downloaded item is available!
                </p>
                </div>
            </button>
          </div>
        </Dropdown>

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

        {/* Profile & Dropdown */}
        <Dropdown
          button={
            <div className="flex h-10 w-10 items-center justify-center cursor-pointer">
              <Image
                src={employee.photo}
                alt="Profile"
                width={40}
                height={40}
                className="h-10 w-10 rounded-full object-cover hover:ring-2 hover:ring-accent-500 transition-all"
              />
            </div>
          }
          animation="origin-[75%_0%] md:origin-top-right transition-all duration-300 ease-in-out"
          classNames={"py-2 top-8 -left-[180px] w-max"}
        >
          <div className="flex h-max w-56 flex-col justify-start rounded-[20px] bg-white bg-cover bg-no-repeat pb-4 shadow-xl shadow-shadow-500 dark:!bg-navy-700 dark:text-white dark:shadow-none">
            <div className="mt-3 ml-4">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-navy-700 dark:text-white">
                  👋 Hey, {employee.name.split(" ")[0]}!
                </p>{" "}
              </div>
            </div>
            <div className="mt-3 h-px w-full bg-gray-200 dark:bg-white/20 " />

            <div className="mt-3 ml-4 flex flex-col">
              <a
                href=" "
                className="text-sm text-gray-800 dark:text-white hover:dark:text-white"
              >
                Profile Settings
              </a>
              <a
                href=" "
                className="mt-3 text-sm text-gray-800 dark:text-white hover:dark:text-white"
              >
                Newsletter Settings
              </a>
              <a
                href=" "
                className="mt-3 text-sm font-medium text-red-500 hover:text-red-500"
              >
                Log Out
              </a>
            </div>
          </div>
        </Dropdown>
      </div>
    </nav>
  );
};

export default Navbar;

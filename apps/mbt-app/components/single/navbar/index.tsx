"use client"

import React from "react";
import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { useDeveloperNotes } from "@/hooks/useDeveloperNotes";
import type { DeveloperNote } from "@/utils/api";

import Image from "next/image";
import Dropdown from "../../../components/single/dropdown";
import Configurator from "./Configurator";

import { FiAlignJustify } from "react-icons/fi";
import { IoMdNotificationsOutline, IoMdInformationCircleOutline, IoMdWarning } from "react-icons/io";

const Navbar = (props: {
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
    hovered,
    selectedBackground,
    setSelectedBackground,
  } = props;

	const { employee } = useAuth();
  const { data: developerNotes = [], isLoading: loadingDeveloperNotes } = useDeveloperNotes({
    active: true,
    limit: 8,
  });
  const [isDeveloperNotesOpen, setIsDeveloperNotesOpen] = useState(false);

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

  const getDeveloperNoteIcon = (type: DeveloperNote["type"]) => {
    if (type === "WARNING") return <IoMdWarning className="text-2xl text-white" />;
    if (type === "PATCH" || type === "UPDATE") return <IoMdNotificationsOutline className="text-2xl text-white" />;
    return <IoMdInformationCircleOutline className="text-2xl text-white" />;
  };

  const getDeveloperNoteColor = (type: DeveloperNote["type"]) => {
    if (type === "WARNING") return "from-red-400 to-red-500";
    if (type === "PATCH") return "from-brand-400 to-brand-500";
    if (type === "UPDATE") return "from-blue-400 to-blue-500";
    return "from-gray-400 to-gray-500";
  };

  const formatDeveloperNoteDate = (dateString: string) => {
    const date = new Date(dateString);
    const nowDate = new Date();
    const diffMs = nowDate.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return "Hace menos de 1h";
    if (diffHours < 24) return `Hace ${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return date.toLocaleDateString("es-DO");
  };

  useEffect(() => {
    if (!isDeveloperNotesOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsDeveloperNotesOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isDeveloperNotesOpen]);

  const developerNotesModal = isDeveloperNotesOpen && typeof window !== "undefined"
    ? createPortal(
      <div
        className="fixed inset-0 z-[50000] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            setIsDeveloperNotesOpen(false);
          }
        }}
      >
        <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-[20px] bg-white p-4 shadow-xl shadow-shadow-500 dark:!bg-navy-700 dark:text-white dark:shadow-none sm:p-5">
          <div className="mb-3 flex items-center justify-between border-b border-gray-200 pb-3 dark:border-white/10">
            <p className="text-base font-bold text-navy-700 dark:text-white">
              Developer Notes
            </p>
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-300">
                {developerNotes.length} activas
              </span>
              <button
                type="button"
                onClick={() => setIsDeveloperNotesOpen(false)}
                className="rounded-lg px-2 py-1 text-sm font-semibold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-navy-600"
              >
                Cerrar
              </button>
            </div>
          </div>

          {loadingDeveloperNotes && (
            <div className="py-6 text-center text-sm text-gray-600 dark:text-gray-300">
              Cargando notas...
            </div>
          )}
          {!loadingDeveloperNotes && developerNotes.length === 0 && (
            <div className="py-6 text-center text-sm text-gray-600 dark:text-gray-300">
              No hay notas de desarrollo activas.
            </div>
          )}
          {!loadingDeveloperNotes && developerNotes.length > 0 && (
            <div className="space-y-2 overflow-y-auto pr-1">
              {developerNotes.map((note) => (
                <div key={note.id} className="flex w-full items-start rounded-xl border border-gray-200 p-2 dark:border-white/10">
                  <div className={`flex h-full min-h-[64px] w-[64px] items-center justify-center rounded-xl bg-gradient-to-b ${getDeveloperNoteColor(note.type)} text-2xl text-white`}>
                    {getDeveloperNoteIcon(note.type)}
                  </div>
                  <div className="ml-2 flex h-full w-full flex-col justify-center rounded-lg px-1 text-sm">
                    <p className="mb-1 text-left text-sm font-bold text-gray-900 dark:text-white">
                      {note.title}
                    </p>
                    <p className="whitespace-pre-wrap text-left text-xs text-gray-700 dark:text-gray-200">
                      {note.content}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-300">
                      <span>{note.type}</span>
                      <span>{formatDeveloperNoteDate(note.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
          : mini === true && hovered === true
          ? "xl:w-[calc(100vw_-_350px)] 2xl:w-[calc(100vw_-_365px)]"
          : "xl:w-[calc(100vw_-_180px)] 2xl:w-[calc(100vw_-_195px)]"
      }`}
    >

	{/** TIME INFO, GREETING **/}
      <div className="ml-[6px] min-w-0">
        <h2 className="truncate text-xs text-accent-500 dark:text-accent-100 sm:text-sm">
          {now ? `${message}!` : ""}
        </h2>
        <p className="flex items-center gap-2 rounded-x1 text-sm text-accent-800 dark:text-accent-50 tabular-nums md:text-[1.3rem]">
          <span className="hidden md:inline">
            {timeData.dayName} {timeData.dayNum} de {timeData.month} | {timeData.time}
          </span>
          <span className="md:hidden">{timeData.time}</span>
        </p>
      </div>

      <div className="relative mt-[3px] flex h-[52px] items-center gap-2 rounded-full bg-white px-2 py-2 shadow-xl shadow-shadow-500 dark:!bg-navy-800 dark:shadow-none sm:h-[61px] sm:gap-3 sm:px-4">
        <span
          className="flex cursor-pointer text-xl text-gray-600 dark:text-white xl:hidden"
          onClick={onOpenSidenav}
        >
          <FiAlignJustify className="h-5 w-5" />
        </span>
        {/* Notification */}
        <button
          type="button"
          onClick={() => setIsDeveloperNotesOpen(true)}
          className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-navy-700 transition-colors cursor-pointer"
          aria-label="Abrir developer notes"
        >
          <IoMdNotificationsOutline className="h-5 w-5 text-gray-600 dark:text-white" />
          {developerNotes.length > 0 && (
            <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500" />
          )}
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
    {developerNotesModal}
    </>
  );
};

export default Navbar;

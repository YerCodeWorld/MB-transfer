"use client";

import { useState } from "react";
import { ServiceInput } from "../../types/services";
import { convertIsoStringTo12h } from "../../utils/services";
import {
  FaHashtag, FaUser, FaClock, FaUsers, FaRoute, FaPlus, FaCopy, FaMapSigns, FaTags, FaBuilding,
} from "react-icons/fa";
import ServiceDetailModal from "./ServiceDetailModal";
import { toast } from "sonner";

interface ServiceTableProps {
  services: ServiceInput[];
  selectedDate?: string;
  title?: string;
  subtitle?: string;
  onServiceSelect?: (service: ServiceInput) => void;
  company: "AT" | "MBT" | "ST";
}

// Simple theme map per company
const companyThemes: Record<
  ServiceTableProps["company"],
  {
    label: string;
    headerBg: string;
    headerText: string;
    chipBg: string;
    chipText: string;
    border: string;
    tableHeadBg: string;
    tableBodyBg: string;
    accent: string;
    accentSoft: string;
    rowHover: string;
  }
> = {
  AT: {
    label: "Airport Transfer",
    headerBg: "bg-gradient-to-r from-yellow-500 to-pink-200",
    headerText: "text-white",
    chipBg: "bg-yellow-100 dark:bg-yellow-900/40",
    chipText: "text-yellow-800 dark:text-yellow-200",
    border: "border-yellow-200 dark:border-yellow-800/70",
    tableHeadBg: "bg-yellow-50 dark:bg-yellow-900/40",
    tableBodyBg: "bg-white dark:bg-slate-900/50",
    accent: "text-yellow-500",
    accentSoft: "bg-yellow-100 dark:bg-emerald-900/50",
    rowHover: "hover:bg-yellow-50/70 dark:hover:bg-yellow-900/30",
  },
  MBT: {
    label: "MBT Services",
    headerBg: "bg-gradient-to-r from-purple-500 to-fuchsia-500",
    headerText: "text-white",
    chipBg: "bg-purple-100 dark:bg-purple-900/40",
    chipText: "text-purple-800 dark:text-purple-200",
    border: "border-purple-200 dark:border-purple-800/70",
    tableHeadBg: "bg-purple-50 dark:bg-purple-900/40",
    tableBodyBg: "bg-white dark:bg-slate-900/80",
    accent: "text-purple-500",
    accentSoft: "bg-purple-100 dark:bg-purple-900/50",
    rowHover: "hover:bg-purple-50/70 dark:hover:bg-purple-900/30",
  },
  ST: {
    label: "Sacbé Transfer",
    headerBg: "bg-gradient-to-r from-emerald-500 to-lime-500",
    headerText: "text-white",
    chipBg: "bg-emerald-100 dark:bg-emerald-900/40",
    chipText: "text-emerald-800 dark:text-emerald-200",
    border: "border-emerald-200 dark:border-emerald-800/70",
    tableHeadBg: "bg-emerald-50 dark:bg-emerald-900/40",
    tableBodyBg: "bg-white dark:bg-slate-900/80",
    accent: "text-emerald-500",
    accentSoft: "bg-emerald-100 dark:bg-emerald-900/50",
    rowHover: "hover:bg-emerald-50/70 dark:hover:bg-emerald-900/30",
  },
};

const ServiceTable = ({
  services,
  selectedDate,
  title = "Services Found",
  subtitle,
  onServiceSelect,
  company = "AT",
}: ServiceTableProps) => {
  const [selected, setSelected] = useState<ServiceInput | null>(null);

  const theme = companyThemes[company];

  const kindOfElement = (kind: "ARRIVAL" | "DEPARTURE" | "TRANSFER") => {
    const base =
      "px-2 py-1 rounded-full text-[0.7rem] font-semibold inline-flex items-center gap-1";

    switch (kind) {
      case "ARRIVAL":
        return (
          <span className={`${base} bg-emerald-500 text-white`}>
            <span className="w-2 h-2 rounded-full bg-emerald-200" />
            ARRIVAL
          </span>
        );
      case "DEPARTURE":
        return (
          <span className={`${base} bg-blue-500 text-white`}>
            <span className="w-2 h-2 rounded-full bg-blue-200" />
            DEPARTURE
          </span>
        );
      case "TRANSFER":
        return (
          <span className={`${base} bg-amber-400 text-black`}>
            <span className="w-2 h-2 rounded-full bg-amber-200" />
            TRANSFER
          </span>
        );
      default:
        return (
          <span className={`${base} bg-gray-400 text-white`}>
            UNKNOWN
          </span>
        );
    }
  };

  const handleServiceClick = (service: ServiceInput) => {
    setSelected(service);
    onServiceSelect?.(service);
  };

  return (
    <>
      <div className="w-full space-y-3">
        {/* CARD WRAPPER */}
        <div
          className={`rounded-2xl shadow-sm border ${theme.border} overflow-hidden bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm`}
        >
          {/* COLORFUL HEADER */}
          <div className={`${theme.headerBg} ${theme.headerText} px-6 py-4`}>
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wide opacity-90">
                  <FaBuilding className="text-sm" />
                  <span>{theme.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <h3 className="text-lg md:text-xl font-bold flex items-center gap-2">
                    {title}
                    <span className="inline-flex items-center justify-center rounded-full bg-white/15 px-2 py-0.5 text-xs font-semibold">
                      {services.length} services
                    </span>
                  </h3>
                </div>
                {subtitle && (
                  <p className="text-xs md:text-sm opacity-90">{subtitle}</p>
                )}
              </div>

              <div className="flex flex-col items-end gap-2 text-xs">
                {selectedDate && (
                  <div className="px-3 py-1 rounded-full bg-black/15 text-white font-semibold">
                    {selectedDate}
                  </div>
                )}
                <div
                  className={`px-3 py-1 rounded-full ${theme.chipBg} ${theme.chipText} flex items-center gap-2 shadow-sm`}
                >
                  <span className="inline-flex h-2 w-2 rounded-full bg-lime-400 animate-pulse" />
                  <span>{services.length > 0 ? "Active list" : "No services"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* TABLE CONTAINER */}
          <div className="px-2 pb-3 pt-2 md:px-4">
            <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800">
              <table className="min-w-full text-xs md:text-sm">
                <thead
                  className={`${theme.tableHeadBg} text-[0.7rem] md:text-xs font-semibold uppercase text-gray-500 dark:text-gray-300`}
                >
                  <tr>
                    <th className="px-3 py-3 text-left">
                      <span className="inline-flex items-center gap-1">
                        <FaHashtag className={theme.accent} /> Código
                      </span>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <span className="inline-flex items-center gap-1">
                        <FaUser className={theme.accent} /> Cliente
                      </span>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <span className="inline-flex items-center gap-1">
                        <FaClock className={theme.accent} /> Hora
                      </span>
                    </th>
                    <th className="px-3 py-3 text-center">
                      <span className="inline-flex items-center gap-1">
                        <FaUsers className={theme.accent} /> PAX
                      </span>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <span className="inline-flex items-center gap-1">
                        <FaRoute className={theme.accent} /> Ruta
                      </span>
                    </th>
                    <th className="px-3 py-3 text-left">
                      <span className="inline-flex items-center gap-1">
                        <FaTags className={theme.accent} /> Tipo
                      </span>
                    </th>
                    <th className="px-3 py-3 text-center">Detalles</th>
                  </tr>
                </thead>

                <tbody className={theme.tableBodyBg}>
                  {services.map((s, idx) => (
                    <tr
                      key={s.code}
                      className={`border-t border-gray-100 dark:border-gray-800 transition ${theme.rowHover} ${
                        idx % 2 === 1
                          ? "bg-gray-50/60 dark:bg-slate-900/40"
                          : ""
                      }`}
                    >
                      {/* CODE + COPY */}
                      <td className="px-3 py-3 font-semibold">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(s.code || "");
                              toast.success("Código copiano exitosamente", {
                                className: "bg-card text-card-foreground border-border"
                              });                              
                            }}
                            className="p-1 rounded-full border border-gray-200/70 dark:border-gray-700/80 bg-white dark:bg-slate-900 hover:scale-105 active:scale-95 transition"
                            title="Copy code"
                          >
                            <FaCopy className={`text-xs ${theme.accent}`} />
                          </button>
                          <span className="text-purple-700 dark:text-purple-100">
                            {s.code}
                          </span>
                        </div>
                      </td>

                      {/* CLIENT */}
                      <td className="px-3 py-3">
                        <span className="font-medium text-gray-800 dark:text-gray-100">
                          {s.clientName}
                        </span>
                      </td>

                      {/* TIME */}
                      <td className="px-3 py-3">
                        <span
                          className={`inline-flex items-center gap-2 px-2 py-1 rounded-full ${theme.accentSoft} text-[0.75rem] font-semibold text-gray-800 dark:text-gray-100`}
                        >
                          <FaClock className="text-[0.8rem]" />
                             {s.pickupTime}
                        </span>
                      </td>

                      {/* PAX */}
                      <td className="px-3 py-3 text-center">
                        <div className="inline-flex items-center justify-center gap-1 rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-1 text-[0.75rem] font-semibold text-gray-800 dark:text-gray-100">
                          <FaUsers className="text-[0.8rem]" />
                          {s.pax}
                        </div>
                      </td>

                      {/* ROUTE (tooltip) */}
                      <td className="px-3 py-3">
                        <div className="relative group inline-block">
                          <button
                            className="flex items-center gap-1 text-sm cursor-pointer rounded-full px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                            type="button"
                          >
                            <FaMapSigns className={theme.accent} />
                            <span className="hidden sm:inline">
                              Ruta
                            </span>
                          </button>

                          {/* Tooltip (more global) */}
                          <div className="pointer-events-none fixed z-40 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            {/* Empty on purpose to avoid layout jump */}
                          </div>

                          <span
                            className="absolute left-1/2 top-full mt-2 -translate-x-1/2 z-30 px-3 py-2 text-xs md:text-sm text-white bg-black/90 rounded-lg shadow-lg whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-200"
                            style={{ minWidth: "180px" }}
                          >
                            <div className="flex flex-col gap-1">
                              <div>
                                <strong>Desde:</strong> {s.pickupLocation}
                              </div>
                              <hr className="border-white/20" />
                              <div>
                                <strong>Hasta:</strong> {s.dropoffLocation}
                              </div>
                            </div>
                          </span>
                        </div>
                      </td>

                      {/* KIND */}
                      <td className="px-3 py-3">{kindOfElement(s.kindOf)}</td>

                      {/* DETAILS BUTTON */}
                      <td className="px-3 py-3 text-center">
                        <button
                          onClick={() => handleServiceClick(s)}
                          className="inline-flex items-center justify-center rounded-full border border-purple-400/80 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-purple-600 dark:text-purple-100 hover:bg-purple-500 hover:text-white hover:border-purple-500 active:scale-95 transition"
                          type="button"
                        >
                          <FaPlus className="mr-1" />
                          Ver
                        </button>
                      </td>
                    </tr>
                  ))}

                  {services.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-6 text-center text-xs md:text-sm text-gray-500 dark:text-gray-400"
                      >
                        No services for this selection.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* SERVICE DETAIL MODAL */}
      <ServiceDetailModal
        service={selected}
        onClose={() => setSelected(null)}
      />
    </>
  );
};

export default ServiceTable;


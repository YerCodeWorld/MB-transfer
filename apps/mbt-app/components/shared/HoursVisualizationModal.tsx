"use client";

import { createPortal } from "react-dom";
import { BsClockHistory } from "react-icons/bs";

export type ServiceHoursRow = {
  id: string;
  code?: string;
  clientName: string;
  kindOf: "ARRIVAL" | "DEPARTURE" | "TRANSFER";
  modifiedTime: string | null;
  originalTime: string;
  offset15Time?: string;
  isModified: boolean;
};

interface HoursVisualizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  rows: ServiceHoursRow[];
}

export default function HoursVisualizationModal({
  isOpen,
  onClose,
  rows,
}: HoursVisualizationModalProps) {
  if (!isOpen || typeof window === "undefined") return null;

  const arrivals = rows.filter((row) => row.kindOf === "ARRIVAL");
  const departures = rows.filter((row) => row.kindOf === "DEPARTURE");
  const transfers = rows.filter((row) => row.kindOf === "TRANSFER");

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-6xl rounded-xl bg-white dark:bg-navy-800 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <BsClockHistory className="text-xl text-accent-500" />
            <h2 className="text-xl font-bold text-navy-700 dark:text-white">
              Visualización de Horas
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-navy-700 dark:text-white mb-3">
              Llegadas (ARRIVAL)
            </h3>
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="min-w-full">
                <thead className="bg-gray-50 dark:bg-navy-700/60">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Código</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Cliente</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Hora Modificada</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Hora Original</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {arrivals.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-500">
                        No hay servicios de llegada para mostrar.
                      </td>
                    </tr>
                  ) : (
                    arrivals.map((row) => (
                      <tr key={row.id}>
                        <td className="px-4 py-3 text-sm text-navy-700 dark:text-white">{row.code || "N/A"}</td>
                        <td className="px-4 py-3 text-sm text-navy-700 dark:text-white">{row.clientName}</td>
                        <td className="px-4 py-3 text-sm text-navy-700 dark:text-white">
                          {row.modifiedTime ?? "—"}
                          {row.isModified && <span className="ml-2 text-xs text-green-600 dark:text-green-400">actualizada</span>}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{row.originalTime}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-navy-700 dark:text-white mb-3">
              Salidas (DEPARTURE)
            </h3>
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="min-w-full">
                <thead className="bg-gray-50 dark:bg-navy-700/60">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Código</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Cliente</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Offset -15 min</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {departures.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-6 text-center text-sm text-gray-500">
                        No hay servicios de salida para mostrar.
                      </td>
                    </tr>
                  ) : (
                    departures.map((row) => (
                      <tr key={row.id}>
                        <td className="px-4 py-3 text-sm text-navy-700 dark:text-white">{row.code || "N/A"}</td>
                        <td className="px-4 py-3 text-sm text-navy-700 dark:text-white">{row.clientName}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-indigo-700 dark:text-indigo-300">{row.offset15Time || "N/A"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-navy-700 dark:text-white mb-3">
              Transferencias (TRANSFER)
            </h3>
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="min-w-full">
                <thead className="bg-gray-50 dark:bg-navy-700/60">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Código</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Cliente</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Hora Modificada</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Hora Original</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {transfers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-500">
                        No hay transferencias para mostrar.
                      </td>
                    </tr>
                  ) : (
                    transfers.map((row) => (
                      <tr key={row.id}>
                        <td className="px-4 py-3 text-sm text-navy-700 dark:text-white">{row.code || "N/A"}</td>
                        <td className="px-4 py-3 text-sm text-navy-700 dark:text-white">{row.clientName}</td>
                        <td className="px-4 py-3 text-sm text-navy-700 dark:text-white">
                          {row.modifiedTime ?? "—"}
                          {row.isModified && <span className="ml-2 text-xs text-green-600 dark:text-green-400">actualizada</span>}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{row.originalTime}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

"use client";

import { createPortal } from "react-dom";
import { SERVICE_KIND_OPTIONS, STATUS_OPTIONS } from "@/constants/allServicesOptions";
import {
	ExtendedService,
	ServiceStatus,
	VehicleOption,
	toTimeInputValue,
	normalizeNotesForEditor,
} from "../utils/serviceManagement";

interface ServiceEditModalProps {
  editingService: ExtendedService | null;
  selectedDate: string;
  vehicleOptions: VehicleOption[];
  setEditingService: (service: ExtendedService | null) => void;
  handleSaveEdit: (service: ExtendedService) => Promise<void>;
}

export default function ServiceEditModal({
  editingService,
  selectedDate,
  vehicleOptions,
  setEditingService,
  handleSaveEdit,
}: ServiceEditModalProps) {
  if (!editingService) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setEditingService(null);
        }
      }}
    >
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white shadow-2xl dark:bg-navy-800">
        <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-700">
          <h2 className="text-xl font-bold text-navy-700 dark:text-white">
            Edición de Servicio: {editingService.clientName}
          </h2>
          <button
            onClick={() => setEditingService(null)}
            className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Código
              </label>
              <input
                type="text"
                value={editingService.code}
                onChange={(e) => setEditingService({ ...editingService, code: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 dark:bg-navy-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Compañía
              </label>
              <select
                value={editingService.serviceType}
                onChange={(e) =>
                  setEditingService({
                    ...editingService,
                    serviceType: e.target.value as "at" | "st" | "mbt",
                  })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 dark:bg-navy-700 dark:border-gray-600 dark:text-white"
              >
                <option value="mbt">MB Transfer</option>
                <option value="st">Sacbé Transfer</option>
                <option value="at">Airport Transfer</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nombre del Cliente
              </label>
              <input
                type="text"
                value={editingService.clientName}
                onChange={(e) => setEditingService({ ...editingService, clientName: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 dark:bg-navy-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tipo del Servicio
              </label>
              <select
                value={editingService.kindOf}
                onChange={(e) =>
                  setEditingService({ ...editingService, kindOf: e.target.value as ExtendedService["kindOf"] })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 dark:bg-navy-700 dark:border-gray-600 dark:text-white"
              >
                {SERVICE_KIND_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Estado
              </label>
              <select
                value={editingService.status}
                onChange={(e) =>
                  setEditingService({ ...editingService, status: e.target.value as ServiceStatus })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 dark:bg-navy-700 dark:border-gray-600 dark:text-white"
              >
                {STATUS_OPTIONS.slice(1).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Hora de Recogida
              </label>
              <input
                type="time"
                value={toTimeInputValue(editingService.pickupTime)}
                onChange={(e) =>
                  setEditingService({
                    ...editingService,
                    pickupTime: `${selectedDate}T${e.target.value}:00.000Z`,
                  })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 dark:bg-navy-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                PAX
              </label>
              <input
                type="number"
                min="1"
                value={editingService.pax}
                onChange={(e) =>
                  setEditingService({ ...editingService, pax: parseInt(e.target.value, 10) || 1 })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 dark:bg-navy-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Código de Vuelo
              </label>
              <input
                type="text"
                value={editingService.flightCode || ""}
                onChange={(e) => setEditingService({ ...editingService, flightCode: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 dark:bg-navy-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Vehículo Asignado
              </label>
              <select
                value={editingService.vehicleType || editingService.assignedVehicle || ""}
                onChange={(e) =>
                  setEditingService({
                    ...editingService,
                    vehicleType: e.target.value,
                    assignedVehicle: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 dark:bg-navy-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Sin asignar</option>
                {vehicleOptions.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.name}>
                    {vehicle.name}
                    {typeof vehicle.paxCapacity === "number" ? ` (Cap: ${vehicle.paxCapacity})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Lugar de Recogida
              </label>
              <input
                type="text"
                value={editingService.pickupLocation}
                onChange={(e) => setEditingService({ ...editingService, pickupLocation: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 dark:bg-navy-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Destino
              </label>
              <input
                type="text"
                value={editingService.dropoffLocation}
                onChange={(e) => setEditingService({ ...editingService, dropoffLocation: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 dark:bg-navy-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Notas
              </label>
              <textarea
                value={normalizeNotesForEditor(editingService.notes)}
                onChange={(e) => setEditingService({ ...editingService, notes: e.target.value })}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 dark:bg-navy-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-gray-200 p-6 dark:border-gray-700">
          <button
            onClick={() => setEditingService(null)}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancelar
          </button>
          <button
            onClick={() => handleSaveEdit(editingService)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

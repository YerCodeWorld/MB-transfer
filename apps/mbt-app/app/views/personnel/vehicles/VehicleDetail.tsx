"use client";

import React from "react";
import Card from "@/components/single/card";
import {
  MdEdit,
  MdDirectionsCar,
  MdLocalShipping,
  MdAirportShuttle,
  MdTwoWheeler,
  MdPerson,
  MdBusiness,
  MdCircle,
  MdSpeed,
  MdBuild,
  MdCalendarToday,
  MdColorLens,
  MdConfirmationNumber
} from "react-icons/md";
import { useNavigation } from "@/contexts/NavigationContext";
import { getVehicleById } from "./mockVehicles";
import { Vehicle, VehicleType, VehicleStatus } from "@/types/personnel";
import VehicleForm from "./VehicleForm";

interface VehicleDetailProps {
  vehicleId: string;
}

export default function VehicleDetail({ vehicleId }: VehicleDetailProps) {
  const { pushView } = useNavigation();
  const vehicle = getVehicleById(vehicleId);

  if (!vehicle) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <Card extra="p-8">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400">
            Vehículo no encontrado
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            No se pudo encontrar el vehículo con ID: {vehicleId}
          </p>
        </Card>
      </div>
    );
  }

  const handleEdit = () => {
    pushView({
      id: `vehicle-edit-${vehicle.id}`,
      label: `Editar ${vehicle.plate}`,
      component: VehicleForm,
      data: { mode: 'edit', vehicleId: vehicle.id },
    });
  };

  const getVehicleIcon = (type: VehicleType) => {
    const icons = {
      CAR: MdDirectionsCar,
      TRUCK: MdLocalShipping,
      VAN: MdAirportShuttle,
      MOTORCYCLE: MdTwoWheeler,
    };
    return icons[type] || MdDirectionsCar;
  };

  const VehicleIcon = getVehicleIcon(vehicle.type);

  const typeLabels: Record<VehicleType, string> = {
    CAR: 'Automóvil',
    TRUCK: 'Camión',
    VAN: 'Van',
    MOTORCYCLE: 'Motocicleta',
  };

  const statusLabels: Record<VehicleStatus, string> = {
    ACTIVE: 'Activo',
    MAINTENANCE: 'En Mantenimiento',
    INACTIVE: 'Inactivo',
    RETIRED: 'Retirado',
  };

  const statusColors: Record<VehicleStatus, string> = {
    ACTIVE: 'text-green-600 dark:text-green-400',
    MAINTENANCE: 'text-orange-600 dark:text-orange-400',
    INACTIVE: 'text-gray-600 dark:text-gray-400',
    RETIRED: 'text-red-600 dark:text-red-400',
  };

  return (
    <div className="w-full h-full pb-24 px-4">
      {/* Header Card */}
      <Card extra="p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {/* Icon */}
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-600 dark:from-brand-400 dark:to-brand-500">
              <VehicleIcon className="text-4xl text-white" />
            </div>

            {/* Plate and Info */}
            <div>
              <h1 className="text-2xl font-bold text-navy-700 dark:text-white">
                {vehicle.plate}
              </h1>
              <p className="text-base text-gray-600 dark:text-gray-400 mt-1">
                {vehicle.brand} {vehicle.model} ({vehicle.year})
              </p>
              <div className="flex items-center gap-2 mt-2">
                <MdCircle className={`text-sm ${statusColors[vehicle.status]}`} />
                <span className={`text-sm font-medium ${statusColors[vehicle.status]}`}>
                  {statusLabels[vehicle.status]}
                </span>
              </div>
            </div>
          </div>

          {/* Edit Button */}
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:hover:bg-brand-300"
          >
            <MdEdit />
            Editar
          </button>
        </div>
      </Card>

      {/* Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Vehicle Information */}
        <Card extra="p-6">
          <h2 className="text-lg font-bold text-navy-700 dark:text-white mb-4">
            Información del Vehículo
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <MdConfirmationNumber className="text-xl text-gray-600 dark:text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Placa</p>
                <p className="font-medium text-navy-700 dark:text-white">{vehicle.plate}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MdDirectionsCar className="text-xl text-gray-600 dark:text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tipo</p>
                <p className="font-medium text-navy-700 dark:text-white">
                  {typeLabels[vehicle.type]}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MdDirectionsCar className="text-xl text-gray-600 dark:text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Marca y Modelo</p>
                <p className="font-medium text-navy-700 dark:text-white">
                  {vehicle.brand} {vehicle.model}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MdCalendarToday className="text-xl text-gray-600 dark:text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Año</p>
                <p className="font-medium text-navy-700 dark:text-white">{vehicle.year}</p>
              </div>
            </div>

            {vehicle.color && (
              <div className="flex items-start gap-3">
                <MdColorLens className="text-xl text-gray-600 dark:text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Color</p>
                  <p className="font-medium text-navy-700 dark:text-white">{vehicle.color}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <MdCircle className={`text-xl ${statusColors[vehicle.status]} mt-1`} />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Estado</p>
                <p className={`font-medium ${statusColors[vehicle.status]}`}>
                  {statusLabels[vehicle.status]}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Assignment Information */}
        <Card extra="p-6">
          <h2 className="text-lg font-bold text-navy-700 dark:text-white mb-4">
            Asignación
          </h2>
          <div className="space-y-4">
            {vehicle.assignedDriverName ? (
              <div className="flex items-start gap-3">
                <MdPerson className="text-xl text-gray-600 dark:text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Conductor Asignado</p>
                  <p className="font-medium text-navy-700 dark:text-white">
                    {vehicle.assignedDriverName}
                  </p>
                </div>
              </div>
            ) : vehicle.allyName ? (
              <div className="flex items-start gap-3">
                <MdBusiness className="text-xl text-gray-600 dark:text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Aliado Asignado</p>
                  <p className="font-medium text-navy-700 dark:text-white">{vehicle.allyName}</p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Este vehículo no está asignado a ningún conductor o aliado.
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Maintenance Information */}
        <Card extra="p-6">
          <h2 className="text-lg font-bold text-navy-700 dark:text-white mb-4">
            Información de Mantenimiento
          </h2>
          <div className="space-y-4">
            {vehicle.mileage !== null && (
              <div className="flex items-start gap-3">
                <MdSpeed className="text-xl text-gray-600 dark:text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Kilometraje</p>
                  <p className="font-medium text-navy-700 dark:text-white">
                    {vehicle.mileage.toLocaleString()} km
                  </p>
                </div>
              </div>
            )}

            {vehicle.lastMaintenance && (
              <div className="flex items-start gap-3">
                <MdBuild className="text-xl text-gray-600 dark:text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Último Mantenimiento</p>
                  <p className="font-medium text-navy-700 dark:text-white">
                    {new Date(vehicle.lastMaintenance).toLocaleDateString('es-DO', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Notes */}
        {vehicle.notes && (
          <Card extra="p-6">
            <h2 className="text-lg font-bold text-navy-700 dark:text-white mb-4">
              Notas
            </h2>
            <p className="text-navy-700 dark:text-white whitespace-pre-wrap">
              {vehicle.notes}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Card from "@/components/single/card";
import { FiSearch } from "react-icons/fi";
import { MdDirectionsCar, MdLocalShipping, MdAirportShuttle, MdTwoWheeler, MdAdd, MdPerson, MdBusiness } from "react-icons/md";
import { useNavigation } from "@/contexts/NavigationContext";
import { getAllVehicles } from "./mockVehicles";
import { Vehicle, VehicleType } from "@/types/personnel";
import VehicleDetail from "./VehicleDetail";
import VehicleForm from "./VehicleForm";

export default function VehiclesGrid() {
  const { pushView } = useNavigation();
  const [searchQuery, setSearchQuery] = useState("");
  const [vehiclesData, setVehiclesData] = useState<Vehicle[]>([]);

  // Refresh data on mount
  useEffect(() => {
    setVehiclesData(getAllVehicles());
  }, []);

  const filteredVehicles = vehiclesData.filter(vehicle =>
    vehicle.plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vehicle.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vehicle.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vehicle.assignedDriverName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewVehicle = (vehicle: Vehicle) => {
    pushView({
      id: `vehicle-detail-${vehicle.id}`,
      label: vehicle.plate,
      component: VehicleDetail,
      data: { vehicleId: vehicle.id },
    });
  };

  const handleCreateVehicle = () => {
    pushView({
      id: 'vehicle-create',
      label: 'Nuevo Vehículo',
      component: VehicleForm,
      data: { mode: 'create' },
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

  const getStatusColor = (status: string) => {
    const colors = {
      ACTIVE: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      MAINTENANCE: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      INACTIVE: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
      RETIRED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return colors[status as keyof typeof colors] || colors.INACTIVE;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      ACTIVE: 'Activo',
      MAINTENANCE: 'Mantenimiento',
      INACTIVE: 'Inactivo',
      RETIRED: 'Retirado',
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getTypeLabel = (type: VehicleType) => {
    const labels = {
      CAR: 'Automóvil',
      TRUCK: 'Camión',
      VAN: 'Van',
      MOTORCYCLE: 'Motocicleta',
    };
    return labels[type];
  };

  return (
    <div className="w-full h-full px-4">
      {/* Search and Add Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex h-[38px] w-full max-w-[400px] flex-grow items-center rounded-xl bg-lightPrimary text-sm text-gray-600 dark:!bg-navy-900 dark:text-white gap-2 p-2">
          <FiSearch />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            type="text"
            placeholder="Buscar vehículo..."
            className="block w-full rounded-full bg-lightPrimary text-base text-navy-700 outline-none dark:!bg-navy-900 dark:text-white"
          />
        </div>
        <button
          onClick={handleCreateVehicle}
          className="ml-4 flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:hover:bg-brand-300"
        >
          <MdAdd className="text-lg" />
          Nuevo
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24">
        {filteredVehicles.map((vehicle) => {
          const VehicleIcon = getVehicleIcon(vehicle.type);

          return (
            <Card
              key={vehicle.id}
              extra="p-6 cursor-pointer hover:shadow-xl transition-shadow"
              onClick={() => handleViewVehicle(vehicle)}
            >
              {/* Header with icon and status */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 dark:from-brand-400 dark:to-brand-500">
                  <VehicleIcon className="text-2xl text-white" />
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(vehicle.status)}`}>
                  {getStatusLabel(vehicle.status)}
                </span>
              </div>

              {/* Plate and Type */}
              <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-1">
                {vehicle.plate}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {getTypeLabel(vehicle.type)}
              </p>

              {/* Vehicle Info */}
              <div className="space-y-1 mb-4">
                <p className="text-sm font-medium text-navy-700 dark:text-white">
                  {vehicle.brand} {vehicle.model}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Año: {vehicle.year}
                </p>
                {vehicle.color && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Color: {vehicle.color}
                  </p>
                )}
              </div>

              {/* Assignment Info */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                {vehicle.assignedDriverName ? (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <MdPerson className="text-base flex-shrink-0" />
                    <span className="truncate">{vehicle.assignedDriverName}</span>
                  </div>
                ) : vehicle.allyName ? (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <MdBusiness className="text-base flex-shrink-0" />
                    <span className="truncate">{vehicle.allyName}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500">
                    <MdPerson className="text-base flex-shrink-0" />
                    <span>Sin asignar</span>
                  </div>
                )}

                {vehicle.mileage !== null && (
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {vehicle.mileage.toLocaleString()} km
                  </p>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredVehicles.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <MdDirectionsCar className="text-6xl text-gray-300 dark:text-gray-700 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            {searchQuery ? 'No se encontraron vehículos' : 'No hay vehículos registrados'}
          </p>
          {!searchQuery && (
            <button
              onClick={handleCreateVehicle}
              className="mt-4 flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
            >
              <MdAdd />
              Agregar Primer Vehículo
            </button>
          )}
        </div>
      )}
    </div>
  );
}

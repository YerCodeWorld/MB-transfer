"use client";

import React, { useState, useEffect } from "react";
import Card from "@/components/single/card";
import { FiSearch } from "react-icons/fi";
import { MdDirectionsCar, MdAdd, MdAirlineSeatReclineNormal, MdLuggage, MdBuild } from "react-icons/md";
import { useNavigation } from "@/contexts/NavigationContext";
import { apiClient } from "@/utils/api";
import VehicleDetail from "./VehicleDetail";
import VehicleForm from "./VehicleForm";

interface Vehicle {
  id: string;
  name: string;
  image?: string;
  brand?: string;
  identifierDocument?: string;
  state: 'FUNCTIONAL' | 'DAMAGED' | 'ONSERVICE' | 'OFFSERVICE';
  paxCapacity: number;
  luggageCapacity: number;
  fuelType?: string;
  fuelUnitPrice?: number;
  fuelState: 'FULL' | 'MIDDLE' | 'EMPTY';
  usageCount: number;
  lastMaintenanceOn?: string;
  createdAt: string;
  updatedAt: string;
}

export default function VehiclesGrid() {
  const { pushView } = useNavigation();
  const [searchQuery, setSearchQuery] = useState("");
  const [vehiclesData, setVehiclesData] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<Vehicle[]>('/api/v1/vehicules?limit=100');

      if (response.success && response.data) {
        setVehiclesData(response.data);
      }
    } catch (err) {
      console.error('Error fetching vehicles:', err);
      setError('Error al cargar vehículos');
    } finally {
      setLoading(false);
    }
  };

  const filteredVehicles = vehiclesData.filter(vehicle =>
    vehicle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vehicle.brand?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewVehicle = (vehicle: Vehicle) => {
    pushView({
      id: `vehicle-detail-${vehicle.id}`,
      label: vehicle.name,
      component: VehicleDetail,
      data: { vehicleId: vehicle.id, onUpdate: fetchVehicles },
    });
  };

  const handleCreateVehicle = () => {
    pushView({
      id: 'vehicle-create',
      label: 'Nuevo Vehículo',
      component: VehicleForm,
      data: { mode: 'create', onSuccess: fetchVehicles },
    });
  };

  const getStateColor = (state: Vehicle['state']) => {
    const colors = {
      FUNCTIONAL: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      ONSERVICE: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      DAMAGED: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      OFFSERVICE: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return colors[state];
  };

  const getStateLabel = (state: Vehicle['state']) => {
    const labels = {
      FUNCTIONAL: 'Funcional',
      ONSERVICE: 'En Servicio',
      DAMAGED: 'Dañado',
      OFFSERVICE: 'Fuera de Servicio',
    };
    return labels[state];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando vehículos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <Card extra="p-8">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">
            Error
          </h2>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
          <button
            onClick={fetchVehicles}
            className="mt-4 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
          >
            Reintentar
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full h-full px-4">
      {/* Search and Add Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex h-[38px] w-full max-w-[400px] flex-grow items-center rounded-xl bg-gray-100 text-sm text-gray-700 dark:!bg-navy-900 dark:text-white gap-2 p-2 border border-gray-300 dark:border-gray-700">
          <FiSearch className="text-gray-500 dark:text-gray-400" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            type="text"
            placeholder="Buscar vehículo..."
            className="block w-full rounded-full bg-gray-100 text-base text-navy-700 placeholder:text-gray-500 outline-none dark:!bg-navy-900 dark:text-white dark:placeholder:text-gray-400"
          />
        </div>
        <button
          onClick={handleCreateVehicle}
          className="ml-4 flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-brand dark:text-white hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:hover:bg-brand-300 cursor-pointer"
        >
          <MdAdd className="text-lg" />
          Nuevo
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24 auto-rows-fr">
        {filteredVehicles.map((vehicle) => (
          <Card
            key={vehicle.id}
            extra="h-full !rounded-md !shadow-[0_18px_45px_rgba(15,23,42,0.14)] dark:!shadow-[0_22px_50px_rgba(0,0,0,0.42)] p-0 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:!shadow-[0_24px_60px_rgba(15,23,42,0.2)] border border-gray-200 dark:border-white/10 overflow-hidden group"
            onClick={() => handleViewVehicle(vehicle)}
          >
            <div className="flex h-full flex-col">
              {/* Media/Header */}
              <div className="relative h-40 w-full border-b border-gray-200 dark:border-white/10 bg-gradient-to-br from-accent-500/90 via-accent-500 to-accent-700 dark:from-accent-400 dark:via-accent-500 dark:to-accent-700">
                {vehicle.image ? (
                  <img
                    src={vehicle.image}
                    alt={vehicle.name}
                    className="h-full w-full object-cover opacity-95"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <MdDirectionsCar className="text-6xl text-white/95" />
                  </div>
                )}
                <div className="absolute inset-y-0 left-0 w-1.5 bg-accent-500 group-hover:w-2 transition-all duration-300" />
                <span className={`absolute right-3 top-3 px-3 py-1 text-xs font-semibold shadow-sm ${getStateColor(vehicle.state)}`}>
                  {getStateLabel(vehicle.state)}
                </span>
              </div>

              {/* Content */}
              <div className="flex h-full flex-col p-5">
                <h3 className="text-lg font-bold text-navy-700 dark:text-white leading-tight">
                  {vehicle.name}
                </h3>
                <p className="mt-1 min-h-[1.25rem] text-sm text-gray-600 dark:text-gray-400">
                  {vehicle.brand || "Marca no especificada"}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 border border-gray-200 dark:border-white/10 px-2 py-2 bg-gray-50 dark:bg-navy-800">
                    <MdAirlineSeatReclineNormal className="text-accent-500 dark:text-accent-400 text-base" />
                    <div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-none">Pasajeros</p>
                      <p className="text-sm font-semibold text-navy-700 dark:text-white">{vehicle.paxCapacity}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 border border-gray-200 dark:border-white/10 px-2 py-2 bg-gray-50 dark:bg-navy-800">
                    <MdLuggage className="text-accent-500 dark:text-accent-400 text-base" />
                    <div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-none">Equipaje</p>
                      <p className="text-sm font-semibold text-navy-700 dark:text-white">{vehicle.luggageCapacity}</p>
                    </div>
                  </div>
                </div>

                {/* Bottom-aligned meta */}
                <div className="mt-auto pt-4 border-t border-gray-200 dark:border-white/10">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                      <MdBuild className="text-accent-500 dark:text-accent-400" />
                      Servicios
                    </span>
                    <span className="font-bold text-navy-700 dark:text-white">{vehicle.usageCount}</span>
                  </div>
                  <p className="mt-2 text-[11px] text-gray-500 dark:text-gray-400 truncate">
                    {vehicle.lastMaintenanceOn
                      ? `Mantenimiento: ${new Date(vehicle.lastMaintenanceOn).toLocaleDateString("es-DO")}`
                      : "Sin mantenimiento registrado"}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        ))}
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

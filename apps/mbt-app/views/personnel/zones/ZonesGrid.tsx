"use client";

import React, { useState } from "react";
import Card from "@/components/single/card";
import { FiSearch } from "react-icons/fi";
import { MdMap, MdAdd, MdRoute, MdLocationOn, MdPayments } from "react-icons/md";
import { useNavigation } from "@/contexts/NavigationContext";
import { useZones } from "@/hooks/useZones";
import ZoneDetail from "./ZoneDetail";
import ZoneForm from "./ZoneForm";

interface Zone {
  id: string;
  name: string;
  description?: string;
  prices?: Array<{
    id: string;
    vehicleId: string;
    price: number;
    vehicle: {
      id: string;
      name: string;
      paxCapacity: number;
    };
  }>;
  _count?: {
    places: number;
    routesFrom: number;
    routesTo: number;
  };
  createdAt: string;
  updatedAt: string;
}

export default function ZonesGrid() {
  const { pushView } = useNavigation();
  const [searchQuery, setSearchQuery] = useState("");

  // Using React Query hook
  const { data: zones = [], isLoading, error, refetch } = useZones({ limit: 100 });

  const filteredZones = zones.filter((zone: Zone) =>
    zone.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    zone.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewZone = (zone: Zone) => {
    pushView({
      id: `zone-detail-${zone.id}`,
      label: zone.name,
      component: ZoneDetail,
      data: { zoneId: zone.id, onUpdate: refetch },
    });
  };

  const handleCreateZone = () => {
    pushView({
      id: 'zone-create',
      label: 'Nueva Zona',
      component: ZoneForm,
      data: { mode: 'create', onSuccess: refetch },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando zonas...</p>
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
          <p className="text-gray-600 dark:text-gray-400">
            {error instanceof Error ? error.message : "Error al cargar zonas"}
          </p>
          <button
            onClick={() => refetch()}
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
            placeholder="Buscar zona..."
            className="block w-full rounded-full bg-gray-100 text-base text-navy-700 placeholder:text-gray-500 outline-none dark:!bg-navy-900 dark:text-white dark:placeholder:text-gray-400"
          />
        </div>
        <button
          onClick={handleCreateZone}
          className="ml-4 flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-brand dark:text-white hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:hover:bg-brand-300 cursor-pointer"
        >
          <MdAdd className="text-lg" />
          Nuevo
        </button>
      </div>

      {/* Empty State */}
      {filteredZones.length === 0 && !searchQuery && (
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <MdMap className="mx-auto text-6xl text-gray-400 dark:text-gray-600 mb-4" />
            <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-2">
              No hay zonas registradas
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Comienza agregando zonas geográficas con precios por vehículo
            </p>
            <button
              onClick={handleCreateZone}
              className="rounded-xl bg-brand-500 px-6 py-3 text-sm font-semibold text-brand dark:text-white hover:bg-brand-600"
            >
              Agregar Primera Zona
            </button>
          </div>
        </div>
      )}

      {/* No Search Results */}
      {filteredZones.length === 0 && searchQuery && (
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">
              No se encontraron zonas que coincidan con "{searchQuery}"
            </p>
          </div>
        </div>
      )}

      {/* Grid */}
      {filteredZones.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24 auto-rows-fr">
          {filteredZones.map((zone: Zone) => {
            const totalRoutes = (zone._count?.routesFrom || 0) + (zone._count?.routesTo || 0);

            return (
              <Card
                key={zone.id}
                extra="h-full !rounded-md !shadow-[0_18px_45px_rgba(15,23,42,0.14)] dark:!shadow-[0_22px_50px_rgba(0,0,0,0.42)] p-0 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:!shadow-[0_24px_60px_rgba(15,23,42,0.2)] border border-gray-200 dark:border-white/10 overflow-hidden group"
                onClick={() => handleViewZone(zone)}
              >
                <div className="flex h-full flex-col">
                  <div className="relative h-36 w-full border-b border-gray-200 dark:border-white/10 bg-gradient-to-br from-accent-500/90 via-accent-500 to-accent-700 dark:from-accent-400 dark:via-accent-500 dark:to-accent-700">
                    <div className="flex h-full w-full items-center justify-center">
                      <MdMap className="text-6xl text-white/95" />
                    </div>
                    <div className="absolute inset-y-0 left-0 w-1.5 bg-accent-500 group-hover:w-2 transition-all duration-300" />
                  </div>

                  <div className="flex h-full flex-col p-5">
                    <h3 className="text-lg font-bold text-navy-700 dark:text-white leading-tight">
                      {zone.name}
                    </h3>

                    {zone.description ? (
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2 min-h-[2.5rem]">
                        {zone.description}
                      </p>
                    ) : (
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 min-h-[2.5rem]">
                        Sin descripcion
                      </p>
                    )}

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <div className="border border-gray-200 dark:border-white/10 px-2 py-2 bg-gray-50 dark:bg-navy-800">
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <MdLocationOn className="text-accent-500 dark:text-accent-400" />
                          Lugares
                        </p>
                        <p className="text-sm font-semibold text-navy-700 dark:text-white">{zone._count?.places || 0}</p>
                      </div>
                      <div className="border border-gray-200 dark:border-white/10 px-2 py-2 bg-gray-50 dark:bg-navy-800">
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <MdRoute className="text-accent-500 dark:text-accent-400" />
                          Rutas
                        </p>
                        <p className="text-sm font-semibold text-navy-700 dark:text-white">{totalRoutes}</p>
                      </div>
                    </div>

                    <div className="mt-auto pt-4 border-t border-gray-200 dark:border-white/10">
                      <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                        <MdPayments className="text-accent-500 dark:text-accent-400" />
                        {zone.prices?.length || 0} precio(s) configurado(s)
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Card from "@/components/single/card";
import { FiSearch } from "react-icons/fi";
import { MdRoute, MdAdd, MdArrowForward } from "react-icons/md";
import { useNavigation } from "@/contexts/NavigationContext";
import { useRoutes } from "@/hooks/useRoutes";
import RouteDetail from "./RouteDetail";
import RouteForm from "./RouteForm";

interface Route {
  id: string;
  name: string;
  from: {
    id: string;
    name: string;
    description?: string;
  };
  to: {
    id: string;
    name: string;
    description?: string;
  };
  prices?: Array<{
    id: string;
    vehicleId: string;
    price: number | string;
  }>;
  _count?: {
    services: number;
  };
  createdAt: string;
  updatedAt: string;
}

export default function RoutesGrid() {
  const { pushView } = useNavigation();
  const [searchQuery, setSearchQuery] = useState("");

  // Using React Query hook
  const { data: routes = [], isLoading, error, refetch } = useRoutes({ limit: 100 });

  const getMinRoutePrice = (route: Route): number | null => {
    if (!route.prices || route.prices.length === 0) return null;
    const numericPrices = route.prices
      .map((p) => Number(p.price))
      .filter((price) => Number.isFinite(price));
    if (numericPrices.length === 0) return null;
    return Math.min(...numericPrices);
  };

  const filteredRoutes = routes.filter((route: Route) =>
    route.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    route.from.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    route.to.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewRoute = (route: Route) => {
    pushView({
      id: `route-detail-${route.id}`,
      label: route.name,
      component: RouteDetail,
      data: { routeId: route.id, onUpdate: refetch },
    });
  };

  const handleCreateRoute = () => {
    pushView({
      id: 'route-create',
      label: 'Nueva Ruta',
      component: RouteForm,
      data: { mode: 'create', onSuccess: refetch },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando rutas...</p>
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
            {error instanceof Error ? error.message : "Error al cargar rutas"}
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
            placeholder="Buscar ruta..."
            className="block w-full rounded-full bg-gray-100 text-base text-navy-700 placeholder:text-gray-500 outline-none dark:!bg-navy-900 dark:text-white dark:placeholder:text-gray-400"
          />
        </div>
        <button
          onClick={handleCreateRoute}
          className="ml-4 flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-brand dark:text-white hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:hover:bg-brand-300 cursor-pointer"
        >
          <MdAdd className="text-lg" />
          Nuevo
        </button>
      </div>

      {/* Empty State */}
      {filteredRoutes.length === 0 && !searchQuery && (
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <MdRoute className="mx-auto text-6xl text-gray-400 dark:text-gray-600 mb-4" />
            <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-2">
              No hay rutas registradas
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Comienza creando rutas entre zonas con precios por vehículo
            </p>
            <button
              onClick={handleCreateRoute}
              className="rounded-xl bg-brand-500 px-6 py-3 text-sm font-semibold text-brand dark:text-white hover:bg-brand-600"
            >
              Agregar Primera Ruta
            </button>
          </div>
        </div>
      )}

      {/* No Search Results */}
      {filteredRoutes.length === 0 && searchQuery && (
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">
              No se encontraron rutas que coincidan con &quot;{searchQuery}&quot;
            </p>
          </div>
        </div>
      )}

      {/* Grid */}
      {filteredRoutes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24 auto-rows-fr">
          {filteredRoutes.map((route: Route) => {
            const minPrice = getMinRoutePrice(route);
            return (
              <Card
                key={route.id}
                extra="h-full !rounded-md !shadow-[0_18px_45px_rgba(15,23,42,0.14)] dark:!shadow-[0_22px_50px_rgba(0,0,0,0.42)] p-0 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:!shadow-[0_24px_60px_rgba(15,23,42,0.2)] border border-gray-200 dark:border-white/10 overflow-hidden group"
                onClick={() => handleViewRoute(route)}
              >
                <div className="flex h-full flex-col">
                  <div className="relative h-32 w-full border-b border-gray-200 dark:border-white/10 bg-gradient-to-br from-accent-500/90 via-accent-500 to-accent-700 dark:from-accent-400 dark:via-accent-500 dark:to-accent-700">
                    <div className="absolute inset-y-0 left-0 w-1.5 bg-brand-500 group-hover:w-2 transition-all duration-300" />
                    <div className="flex h-full items-center gap-3 px-5">
                      <div className="flex h-14 w-14 items-center justify-center bg-white/20 backdrop-blur-sm border border-white/30">
                        <MdRoute className="text-2xl text-white" />
                      </div>
                      <div>
                        <h3 className="line-clamp-1 text-lg font-bold text-white">{route.name}</h3>
                        <p className="text-sm text-white/90">Ruta</p>
                      </div>
                    </div>
                    <span className="absolute right-3 top-3 px-3 py-1 text-xs font-semibold shadow-sm bg-white/20 text-white border border-white/30">
                      {route.prices?.length || 0} precios
                    </span>
                  </div>

                  <div className="flex h-full flex-col p-5">
                    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 border border-gray-200 dark:border-white/10 px-2 py-3 bg-gray-50 dark:bg-navy-800">
                      <div className="min-w-0 text-center">
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-none mb-1">Desde</p>
                        <p className="text-sm font-semibold text-navy-700 dark:text-white truncate">{route.from.name}</p>
                      </div>
                      <MdArrowForward className="text-gray-400 text-lg" />
                      <div className="min-w-0 text-center">
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-none mb-1">Hasta</p>
                        <p className="text-sm font-semibold text-navy-700 dark:text-white truncate">{route.to.name}</p>
                      </div>
                    </div>

                    <div className="mt-2 border border-gray-200 dark:border-white/10 px-2 py-2 bg-gray-50 dark:bg-navy-800">
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-none">Tarifa mínima</p>
                      {minPrice !== null ? (
                        <p className="text-base font-bold text-green-600 dark:text-green-400 mt-1">Desde ${minPrice.toFixed(2)} USD</p>
                      ) : (
                        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mt-1">Sin precios</p>
                      )}
                    </div>

                    <div className="mt-auto pt-4 border-t border-gray-200 dark:border-white/10">
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        {route._count?.services || 0} servicio(s)
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

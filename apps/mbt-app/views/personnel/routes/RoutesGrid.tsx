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
              No se encontraron rutas que coincidan con "{searchQuery}"
            </p>
          </div>
        </div>
      )}

      {/* Grid */}
      {filteredRoutes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24">
          {filteredRoutes.map((route: Route) => {
            const minPrice = getMinRoutePrice(route);
            return (
              <Card
                key={route.id}
                extra="p-6 cursor-pointer hover:shadow-2xl transition-all hover:scale-[1.02]"
                onClick={() => handleViewRoute(route)}
              >
                {/* Icon */}
                <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 dark:from-brand-400 dark:to-brand-500 mb-4">
                  <MdRoute className="text-2xl text-black dark:text-white" />
                </div>

                {/* Name */}
                <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-3">
                  {route.name}
                </h3>

                {/* From → To */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex-1 text-center px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Desde</p>
                    <p className="text-sm font-semibold text-navy-700 dark:text-white">
                      {route.from.name}
                    </p>
                  </div>
                  <MdArrowForward className="text-gray-400 flex-shrink-0" />
                  <div className="flex-1 text-center px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Hasta</p>
                    <p className="text-sm font-semibold text-navy-700 dark:text-white">
                      {route.to.name}
                    </p>
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Precio
                  </span>
                  {minPrice !== null ? (
                    <span className="text-lg font-bold text-green-600 dark:text-green-400">
                      Desde ${minPrice.toFixed(2)} USD
                    </span>
                  ) : (
                    <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                      Sin precios
                    </span>
                  )}
                </div>

                <div className="mt-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {route.prices?.length || 0} precio(s) configurado(s)
                  </span>
                </div>

                {/* Services Count */}
                {route._count && route._count.services > 0 && (
                  <div className="mt-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      🚗 {route._count.services} servicio(s)
                    </span>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

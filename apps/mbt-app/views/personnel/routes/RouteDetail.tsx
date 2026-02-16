"use client";

import React from "react";
import Card from "@/components/single/card";
import {
  MdEdit,
  MdDelete,
  MdRoute,
  MdArrowForward,
} from "react-icons/md";
import { useNavigation } from "@/contexts/NavigationContext";
import { useRoute, useDeleteRoute } from "@/hooks/useRoutes";
import RouteForm from "./RouteForm";
import { toast } from "sonner";

interface RouteDetailProps {
  routeId: string;
  onUpdate?: () => void;
}

export default function RouteDetail({ routeId, onUpdate }: RouteDetailProps) {
  const { pushView, popView } = useNavigation();

  // Using React Query hooks
  const { data: route, isLoading, error, refetch } = useRoute(routeId);
  const deleteRouteMutation = useDeleteRoute();
  const routePrices = route?.prices || [];
  const numericPrices = routePrices
    .map((p: any) => Number(p.price))
    .filter((v: number) => Number.isFinite(v));
  const minRoutePrice = numericPrices.length ? Math.min(...numericPrices) : null;
  const getPriceBand = (value: number) => {
    if (!Number.isFinite(value)) return "N/A";
    if (value < 40) return "20-40";
    if (value < 80) return "40-80";
    return "80+";
  };

  const getPriceBandClass = (value: number) => {
    if (!Number.isFinite(value)) return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300";
    if (value < 40) return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    if (value < 80) return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
    return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
  };

  const getZonePlacesCount = (zone: any): number => {
    if (!zone) return 0;
    if (typeof zone._count?.places === "number") return zone._count.places;
    if (Array.isArray(zone.places)) return zone.places.length;
    if (typeof zone.placeCount === "number") return zone.placeCount;
    if (typeof zone.totalPlaces === "number") return zone.totalPlaces;
    return 0;
  };

  const handleEdit = () => {
    if (!route) return;

    pushView({
      id: `route-edit-${route.id}`,
      label: `Editar ${route.name}`,
      component: RouteForm,
      data: {
        mode: 'edit',
        routeId: route.id,
        onSuccess: () => {
          refetch();
          onUpdate?.();
        }
      },
    });
  };

  const handleDelete = async () => {
    if (!route) return;

    const totalUsage = route._count?.services || 0;

    if (totalUsage > 0) {
      toast.error(`No se puede eliminar. La ruta tiene ${totalUsage} servicio${totalUsage > 1 ? 's' : ''} asociado${totalUsage > 1 ? 's' : ''}.`);
      return;
    }

    const confirmed = window.confirm(
      `¿Está seguro que desea eliminar la ruta "${route.name}"? Esta acción no se puede deshacer.`
    );

    if (!confirmed) return;

    try {
      await deleteRouteMutation.mutateAsync(route.id);
      toast.success('Ruta eliminada exitosamente');
      onUpdate?.();
      popView();
    } catch (err: any) {
      console.error('Error deleting route:', err);
      toast.error(err.message || 'Error al eliminar ruta');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando ruta...</p>
        </div>
      </div>
    );
  }

  if (error || !route) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <Card extra="p-8">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">
            Error
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {error instanceof Error ? error.message : 'Ruta no encontrada'}
          </p>
          <button
            onClick={() => popView()}
            className="mt-4 rounded-xl bg-gray-500 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-600"
          >
            Volver
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-6 pb-24 overflow-y-auto">
      {/* Header Card */}
      <Card extra="p-6 mb-6 !rounded-md !shadow-[0_14px_35px_rgba(15,23,42,0.14)] border border-gray-200 dark:border-white/10">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {/* Icon */}
            <div className="relative flex items-center justify-center w-20 h-20 rounded-md bg-gradient-to-br from-accent-500 to-accent-700 dark:from-accent-400 dark:to-accent-600">
              <MdRoute className="text-4xl text-black dark:text-white" />
              <div className="absolute -left-2 top-2 h-10 w-1 bg-accent-500" />
            </div>

            {/* Name */}
            <div>
              <h1 className="text-2xl font-bold text-navy-700 dark:text-white mb-1">
                {route.name}
              </h1>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span className="font-semibold">{route.from.name}</span>
                <MdArrowForward />
                <span className="font-semibold">{route.to.name}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600"
            >
              <MdEdit />
              Editar
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteRouteMutation.isPending}
              className="flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50"
            >
              <MdDelete />
              {deleteRouteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        </div>
      </Card>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Route Information */}
        <Card extra="p-6 !rounded-md border border-gray-200 dark:border-white/10">
          <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-4">
            Información de Ruta
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Zona de Origen</p>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="font-semibold text-navy-700 dark:text-white">
                  {route.from.name}
                </p>
                {route.from.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {route.from.description}
                  </p>
                )}
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Zona de Destino</p>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="font-semibold text-navy-700 dark:text-white">
                  {route.to.name}
                </p>
                {route.to.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {route.to.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Pricing */}
        <Card extra="p-6 !rounded-md border border-gray-200 dark:border-white/10">
          <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-4">
            Precios de Ruta
          </h3>
          {routePrices.length > 0 ? (
            <div className="space-y-3">
              <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border border-green-200 dark:border-green-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Precio mínimo</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {minRoutePrice !== null ? `$${minRoutePrice.toFixed(2)}` : 'N/A'}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400">USD</p>
                  {minRoutePrice !== null && (
                    <span className={`px-2 py-1 text-[11px] font-semibold ${getPriceBandClass(minRoutePrice)}`}>
                      {getPriceBand(minRoutePrice)}
                    </span>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                {routePrices.map((price: any) => {
                  const value = Number(price.price);
                  return (
                  <div
                    key={price.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <span className="text-sm text-navy-700 dark:text-white">
                      {price.vehicle?.name || 'Vehículo'}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-green-600 dark:text-green-400">
                        {Number.isFinite(value) ? `$${value.toFixed(2)}` : "N/A"}
                      </span>
                      <span className={`px-2 py-1 text-[11px] font-semibold ${getPriceBandClass(value)}`}>
                        {getPriceBand(value)}
                      </span>
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                No hay precios configurados para esta ruta.
              </p>
            </div>
          )}
        </Card>

        {/* Statistics */}
        <Card extra="p-6 md:col-span-2 !rounded-md border border-gray-200 dark:border-white/10">
          <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-4">
            Estadísticas de Uso
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Servicios usando esta ruta</p>
              <p className="text-2xl font-bold text-brand-500 dark:text-brand-400">
                {route._count?.services || 0}
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Lugares en zona origen</p>
              <p className="text-2xl font-bold text-navy-700 dark:text-white">
                {getZonePlacesCount(route.from)}
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Lugares en zona destino</p>
              <p className="text-2xl font-bold text-navy-700 dark:text-white">
                {getZonePlacesCount(route.to)}
              </p>
            </div>
          </div>
        </Card>

        {/* Zone Details */}
        {(route.from.prices?.length > 0 || route.to.prices?.length > 0) && (
          <Card extra="p-6 md:col-span-2 !rounded-md border border-gray-200 dark:border-white/10">
            <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-4">
              Precios de Zonas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* From Zone Prices */}
              {route.from.prices && route.from.prices.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">
                    Precios en {route.from.name}:
                  </p>
                  <div className="space-y-2">
                    {route.from.prices.map((price: any) => {
                      const value = Number(price.price);
                      return (
                      <div
                        key={price.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <span className="text-sm text-navy-700 dark:text-white">
                          {price.vehicle.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-green-600 dark:text-green-400">
                            {Number.isFinite(value) ? `$${value.toFixed(2)}` : "N/A"}
                          </span>
                          <span className={`px-2 py-1 text-[11px] font-semibold ${getPriceBandClass(value)}`}>
                            {getPriceBand(value)}
                          </span>
                        </div>
                      </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* To Zone Prices */}
              {route.to.prices && route.to.prices.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">
                    Precios en {route.to.name}:
                  </p>
                  <div className="space-y-2">
                    {route.to.prices.map((price: any) => {
                      const value = Number(price.price);
                      return (
                      <div
                        key={price.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <span className="text-sm text-navy-700 dark:text-white">
                          {price.vehicle.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-green-600 dark:text-green-400">
                            {Number.isFinite(value) ? `$${value.toFixed(2)}` : "N/A"}
                          </span>
                          <span className={`px-2 py-1 text-[11px] font-semibold ${getPriceBandClass(value)}`}>
                            {getPriceBand(value)}
                          </span>
                        </div>
                      </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

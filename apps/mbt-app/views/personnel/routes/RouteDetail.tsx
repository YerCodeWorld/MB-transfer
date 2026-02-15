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
      <Card extra="p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {/* Icon */}
            <div className="flex items-center justify-center w-20 h-20 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 dark:from-brand-400 dark:to-brand-500">
              <MdRoute className="text-4xl text-black dark:text-white" />
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
        <Card extra="p-6">
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
        <Card extra="p-6">
          <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-4">
            Precio
          </h3>
          <div className="space-y-3">
            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border border-green-200 dark:border-green-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Precio Base</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                ${route.price.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">USD</p>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                💡 Este precio se aplica a los servicios que usan esta ruta.
              </p>
            </div>
          </div>
        </Card>

        {/* Statistics */}
        <Card extra="p-6 md:col-span-2">
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
                {route.from._count?.places || 0}
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Lugares en zona destino</p>
              <p className="text-2xl font-bold text-navy-700 dark:text-white">
                {route.to._count?.places || 0}
              </p>
            </div>
          </div>
        </Card>

        {/* Zone Details */}
        {(route.from.prices?.length > 0 || route.to.prices?.length > 0) && (
          <Card extra="p-6 md:col-span-2">
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
                    {route.from.prices.map((price: any) => (
                      <div
                        key={price.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <span className="text-sm text-navy-700 dark:text-white">
                          {price.vehicle.name}
                        </span>
                        <span className="text-sm font-bold text-green-600 dark:text-green-400">
                          ${price.price.toFixed(2)}
                        </span>
                      </div>
                    ))}
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
                    {route.to.prices.map((price: any) => (
                      <div
                        key={price.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <span className="text-sm text-navy-700 dark:text-white">
                          {price.vehicle.name}
                        </span>
                        <span className="text-sm font-bold text-green-600 dark:text-green-400">
                          ${price.price.toFixed(2)}
                        </span>
                      </div>
                    ))}
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

"use client";

import React from "react";
import Card from "@/components/single/card";
import {
  MdEdit,
  MdDelete,
  MdMap,
  MdDirectionsCar,
  MdAdd,
  MdClose,
} from "react-icons/md";
import { useNavigation } from "@/contexts/NavigationContext";
import { useZone, useDeleteZone, useDeleteZonePrice } from "@/hooks/useZones";
import ZoneForm from "./ZoneForm";
import { toast } from "sonner";

interface ZoneDetailProps {
  zoneId: string;
  onUpdate?: () => void;
}

export default function ZoneDetail({ zoneId, onUpdate }: ZoneDetailProps) {
  const { pushView, popView } = useNavigation();

  // Using React Query hooks
  const { data: zone, isLoading, error, refetch } = useZone(zoneId);
  const deleteZoneMutation = useDeleteZone();
  const deleteZonePriceMutation = useDeleteZonePrice();

  const handleEdit = () => {
    if (!zone) return;

    pushView({
      id: `zone-edit-${zone.id}`,
      label: `Editar ${zone.name}`,
      component: ZoneForm,
      data: {
        mode: 'edit',
        zoneId: zone.id,
        onSuccess: () => {
          refetch();
          onUpdate?.();
        }
      },
    });
  };

  const handleDelete = async () => {
    if (!zone) return;

    const totalUsage = (zone._count?.places || 0) + (zone._count?.routesFrom || 0) + (zone._count?.routesTo || 0);

    if (totalUsage > 0) {
      toast.error(`No se puede eliminar. La zona tiene ${zone._count?.places} lugares y ${(zone._count?.routesFrom || 0) + (zone._count?.routesTo || 0)} rutas.`);
      return;
    }

    const confirmed = window.confirm(
      `¿Está seguro que desea eliminar la zona ${zone.name}? Esta acción no se puede deshacer.`
    );

    if (!confirmed) return;

    try {
      await deleteZoneMutation.mutateAsync(zone.id);
      toast.success('Zona eliminada exitosamente');
      onUpdate?.();
      popView();
    } catch (err: any) {
      console.error('Error deleting zone:', err);
      toast.error(err.message || 'Error al eliminar zona');
    }
  };

  const handleDeletePrice = async (vehicleId: string, vehicleName: string) => {
    if (!zone) return;

    const confirmed = window.confirm(
      `¿Eliminar el precio para ${vehicleName}?`
    );

    if (!confirmed) return;

    try {
      await deleteZonePriceMutation.mutateAsync({ zoneId: zone.id, vehicleId });
      toast.success('Precio eliminado exitosamente');
      refetch();
    } catch (err: any) {
      console.error('Error deleting price:', err);
      toast.error(err.message || 'Error al eliminar precio');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando zona...</p>
        </div>
      </div>
    );
  }

  if (error || !zone) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <Card extra="p-8">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">
            Error
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {error instanceof Error ? error.message : 'Zona no encontrada'}
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

  const totalRoutes = (zone._count?.routesFrom || 0) + (zone._count?.routesTo || 0);

  return (
    <div className="w-full h-full p-6 pb-24 overflow-y-auto">
      {/* Header Card */}
      <Card extra="p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {/* Icon */}
            <div className="flex items-center justify-center w-20 h-20 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 dark:from-brand-400 dark:to-brand-500">
              <MdMap className="text-4xl text-black dark:text-white" />
            </div>

            {/* Name and Description */}
            <div>
              <h1 className="text-2xl font-bold text-navy-700 dark:text-white mb-1">
                {zone.name}
              </h1>
              {zone.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {zone.description}
                </p>
              )}
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
              disabled={deleteZoneMutation.isPending}
              className="flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50"
            >
              <MdDelete />
              {deleteZoneMutation.isPending ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        </div>
      </Card>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Statistics */}
        <Card extra="p-6">
          <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-4">
            Estadísticas
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">Lugares en esta zona</p>
              <p className="text-lg font-bold text-navy-700 dark:text-white">
                {zone._count?.places || 0}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">Rutas totales</p>
              <p className="text-lg font-bold text-navy-700 dark:text-white">
                {totalRoutes}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">Precios configurados</p>
              <p className="text-lg font-bold text-brand-500 dark:text-brand-400">
                {zone.prices?.length || 0}
              </p>
            </div>
          </div>
        </Card>

        {/* Places in Zone */}
        {zone.places && zone.places.length > 0 && (
          <Card extra="p-6">
            <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-4">
              Lugares en esta Zona
            </h3>
            <div className="space-y-2">
              {zone.places.slice(0, 10).map((place: any) => (
                <div
                  key={place.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <p className="text-sm font-semibold text-navy-700 dark:text-white">
                    {place.name}
                  </p>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {place.kind}
                  </span>
                </div>
              ))}
              {zone.places.length > 10 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center pt-2">
                  Y {zone.places.length - 10} más...
                </p>
              )}
            </div>
          </Card>
        )}

        {/* Vehicle Prices */}
        <Card extra="p-6 md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-navy-700 dark:text-white flex items-center gap-2">
              <MdDirectionsCar className="text-brand-500" />
              Precios por Vehículo
            </h3>
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 rounded-xl bg-brand-500 px-3 py-2 text-sm font-semibold text-brand dark:text-white hover:bg-brand-600"
            >
              <MdAdd />
              Agregar Precio
            </button>
          </div>

          {zone.prices && zone.prices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {zone.prices.map((price: any) => (
                <div
                  key={price.id}
                  className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-semibold text-navy-700 dark:text-white mb-1">
                        {price.vehicle.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Capacidad: {price.vehicle.paxCapacity} pax
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeletePrice(price.vehicle.id, price.vehicle.name)}
                      disabled={deleteZonePriceMutation.isPending}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <MdClose />
                    </button>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      ${price.price.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">USD</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MdDirectionsCar className="mx-auto text-4xl text-gray-400 dark:text-gray-600 mb-3" />
              <p className="text-gray-600 dark:text-gray-400">
                No hay precios configurados para esta zona
              </p>
              <button
                onClick={handleEdit}
                className="mt-4 text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                Agregar primer precio →
              </button>
            </div>
          )}
        </Card>

        {/* Routes */}
        {(zone.routesFrom?.length > 0 || zone.routesTo?.length > 0) && (
          <Card extra="p-6 md:col-span-2">
            <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-4">
              Rutas Conectadas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {zone.routesFrom && zone.routesFrom.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    Desde esta zona:
                  </p>
                  {zone.routesFrom.map((route: any) => (
                    <div
                      key={route.id}
                      className="mb-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <p className="text-sm text-navy-700 dark:text-white">
                        → {route.to.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        ${route.price.toFixed(2)} USD
                      </p>
                    </div>
                  ))}
                </div>
              )}
              {zone.routesTo && zone.routesTo.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    Hacia esta zona:
                  </p>
                  {zone.routesTo.map((route: any) => (
                    <div
                      key={route.id}
                      className="mb-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <p className="text-sm text-navy-700 dark:text-white">
                        {route.from.name} →
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        ${route.price.toFixed(2)} USD
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

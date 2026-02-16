"use client";

import React from "react";
import Card from "@/components/single/card";
import {
  MdEdit,
  MdDelete,
  MdHotel,
  MdAirplanemodeActive,
  MdPlace,
  MdLocationOn,
  MdCode,
  MdMap,
} from "react-icons/md";
import { useNavigation } from "@/contexts/NavigationContext";
import { usePlace, useDeletePlace } from "@/hooks/usePlaces";
import PlaceForm from "./PlaceForm";
import { toast } from "sonner";

interface PlaceDetailProps {
  placeId: string;
  onUpdate?: () => void;
}

export default function PlaceDetail({ placeId, onUpdate }: PlaceDetailProps) {
  const { pushView, popView } = useNavigation();

  // Using React Query hook
  const { data: place, isLoading, error, refetch } = usePlace(placeId);
  const deletePlaceMutation = useDeletePlace();

  const handleEdit = () => {
    if (!place) return;

    pushView({
      id: `place-edit-${place.id}`,
      label: `Editar ${place.name}`,
      component: PlaceForm,
      data: {
        mode: 'edit',
        placeId: place.id,
        onSuccess: () => {
          refetch();
          onUpdate?.();
        }
      },
    });
  };

  const handleDelete = async () => {
    if (!place) return;

    const confirmed = window.confirm(
      `¿Está seguro que desea eliminar ${place.name}? Esta acción no se puede deshacer.`
    );

    if (!confirmed) return;

    try {
      await deletePlaceMutation.mutateAsync(place.id);
      toast.success('Lugar eliminado exitosamente');
      onUpdate?.();
      popView();
    } catch (err: any) {
      console.error('Error deleting place:', err);
      toast.error(err.message || 'Error al eliminar lugar');
    }
  };

  const getPlaceIcon = (kind: string) => {
    const icons = {
      AIRPORT: MdAirplanemodeActive,
      HOTEL: MdHotel,
      OTHER: MdPlace,
    };
    return icons[kind as keyof typeof icons] || MdPlace;
  };

  const getPlaceLabel = (kind: string) => {
    const labels = {
      AIRPORT: 'Aeropuerto',
      HOTEL: 'Hotel',
      OTHER: 'Otro',
    };
    return labels[kind as keyof typeof labels] || 'Otro';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando lugar...</p>
        </div>
      </div>
    );
  }

  if (error || !place) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <Card extra="p-8">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">
            Error
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {error instanceof Error ? error.message : 'Lugar no encontrado'}
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

  const Icon = getPlaceIcon(place.kind);

  return (
    <div className="w-full h-full p-6 pb-24 overflow-y-auto">
      {/* Header Card */}
      <Card extra="p-6 mb-6 !rounded-md !shadow-[0_14px_35px_rgba(15,23,42,0.14)] border border-gray-200 dark:border-white/10">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {/* Icon */}
            <div className="relative flex items-center justify-center w-20 h-20 rounded-md bg-gradient-to-br from-accent-500 to-accent-700 dark:from-accent-400 dark:to-accent-600">
              <Icon className="text-4xl text-black dark:text-white" />
              <div className="absolute -left-2 top-2 h-10 w-1 bg-accent-500" />
            </div>

            {/* Name and Type */}
            <div>
              <h1 className="text-2xl font-bold text-navy-700 dark:text-white mb-1">
                {place.name}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {getPlaceLabel(place.kind)}
              </p>
              {place.iata && (
                <p className="text-sm font-mono text-gray-600 dark:text-gray-400 mt-1">
                  IATA: {place.iata}
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
              disabled={deletePlaceMutation.isPending}
              className="flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50"
            >
              <MdDelete />
              {deletePlaceMutation.isPending ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        </div>
      </Card>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Location Information */}
        <Card extra="p-6 !rounded-md border border-gray-200 dark:border-white/10">
          <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-4 flex items-center gap-2">
            <MdLocationOn className="text-brand-500" />
            Ubicación
          </h3>
          <div className="space-y-3">
            {place.latitude != null && place.longitude != null ? (
              <>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Latitud</p>
                  <p className="text-base font-semibold text-navy-700 dark:text-white">
                    {place.latitude.toFixed(6)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Longitud</p>
                  <p className="text-base font-semibold text-navy-700 dark:text-white">
                    {place.longitude.toFixed(6)}
                  </p>
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Ver en Google Maps →
                </a>
              </>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No se ha registrado ubicación
              </p>
            )}
          </div>
        </Card>

        {/* Zone Information */}
        <Card extra="p-6 !rounded-md border border-gray-200 dark:border-white/10">
          <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-4 flex items-center gap-2">
            <MdMap className="text-brand-500" />
            Zona
          </h3>
          <div className="space-y-3">
            {place.zone ? (
              <>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Nombre de la Zona</p>
                  <p className="text-base font-semibold text-navy-700 dark:text-white">
                    {place.zone.name}
                  </p>
                </div>
                {place.zone.description && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Descripción</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {place.zone.description}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No asignado a ninguna zona
              </p>
            )}
          </div>
        </Card>

        {/* Airport Code (if applicable) */}
        {place.kind === 'AIRPORT' && (
          <Card extra="p-6 !rounded-md border border-gray-200 dark:border-white/10">
            <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-4 flex items-center gap-2">
              <MdCode className="text-brand-500" />
              Código IATA
            </h3>
            <div className="space-y-3">
              {place.iata ? (
                <div className="flex items-center gap-3">
                  <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <p className="text-2xl font-mono font-bold text-navy-700 dark:text-white">
                      {place.iata}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No se ha registrado código IATA
                </p>
              )}
            </div>
          </Card>
        )}

        {/* Usage Statistics */}
        {place._count && (
          <Card extra="p-6 !rounded-md border border-gray-200 dark:border-white/10">
            <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-4">
              Estadísticas de Uso
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">Servicios como Pickup</p>
                <p className="text-lg font-bold text-navy-700 dark:text-white">
                  {place._count.pickupFor || 0}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">Servicios como Dropoff</p>
                <p className="text-lg font-bold text-navy-700 dark:text-white">
                  {place._count.dropoffFor || 0}
                </p>
              </div>
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total de Servicios</p>
                <p className="text-2xl font-bold text-brand-500 dark:text-brand-400">
                  {(place._count.pickupFor || 0) + (place._count.dropoffFor || 0)}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Access Notes */}
        {place.accessNotes && place.accessNotes.length > 0 && (
          <Card extra="p-6 md:col-span-2 !rounded-md border border-gray-200 dark:border-white/10">
            <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-4">
              Notas de Acceso
            </h3>
            <div className="space-y-3">
              {place.accessNotes.map((note: any) => (
                <div
                  key={note.id}
                  className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <p className="font-semibold text-navy-700 dark:text-white mb-1">
                    {note.title}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {note.content}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

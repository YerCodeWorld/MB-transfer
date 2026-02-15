"use client";

import React, { useState, useEffect } from "react";
import Card from "@/components/single/card";
import { MdSave, MdLocationOn, MdMap } from "react-icons/md";
import { useNavigation } from "@/contexts/NavigationContext";
import { usePlace, useCreatePlace, useUpdatePlace } from "@/hooks/usePlaces";
import { useZones } from "@/hooks/useZones";
import { toast } from "sonner";
import dynamic from "next/dynamic";

const MapPicker = dynamic(() => import("@/components/maps/MapPicker"), { ssr: false });

interface PlaceFormProps {
  mode: 'create' | 'edit';
  placeId?: string;
  onSuccess?: () => void;
}

interface PlaceFormData {
  kind: 'AIRPORT' | 'HOTEL' | 'OTHER';
  name: string;
  iata?: string;
  latitude?: number;
  longitude?: number;
  zoneId?: string;
}

export default function PlaceForm({ mode, placeId, onSuccess }: PlaceFormProps) {
  const { popView } = useNavigation();

  // React Query hooks
  const { data: place, isLoading: loadingPlace } = usePlace(placeId || '');
  const { data: zones = [] } = useZones({ limit: 100 });
  const createPlaceMutation = useCreatePlace();
  const updatePlaceMutation = useUpdatePlace();

  const [formData, setFormData] = useState<PlaceFormData>({
    kind: 'HOTEL',
    name: '',
    iata: '',
    latitude: undefined,
    longitude: undefined,
    zoneId: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showMapPicker, setShowMapPicker] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && place) {
      setFormData({
        kind: place.kind,
        name: place.name,
        iata: place.iata || '',
        latitude: place.latitude || undefined,
        longitude: place.longitude || undefined,
        zoneId: place.zone?.id || '',
      });
    }
  }, [mode, place]);

  const handleInputChange = (field: keyof PlaceFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (formData.kind === 'AIRPORT') {
      if (!formData.iata?.trim()) {
        newErrors.iata = 'El código IATA es requerido para aeropuertos';
      } else if (formData.iata.length !== 3) {
        newErrors.iata = 'El código IATA debe tener exactamente 3 caracteres';
      }
    }

    if (formData.latitude !== undefined && (formData.latitude < -90 || formData.latitude > 90)) {
      newErrors.latitude = 'La latitud debe estar entre -90 y 90';
    }

    if (formData.longitude !== undefined && (formData.longitude < -180 || formData.longitude > 180)) {
      newErrors.longitude = 'La longitud debe estar entre -180 y 180';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const payload: any = {
        kind: formData.kind,
        name: formData.name.trim(),
        iata: formData.kind === 'AIRPORT' && formData.iata ? formData.iata.toUpperCase() : undefined,
        latitude: formData.latitude || undefined,
        longitude: formData.longitude || undefined,
        zoneId: formData.zoneId || undefined,
      };

      if (mode === 'create') {
        await createPlaceMutation.mutateAsync(payload);
        toast.success('Lugar creado exitosamente');
      } else if (mode === 'edit' && placeId) {
        await updatePlaceMutation.mutateAsync({ id: placeId, data: payload });
        toast.success('Lugar actualizado exitosamente');
      }

      onSuccess?.();
      popView();
    } catch (error: any) {
      console.error('Error saving place:', error);
      toast.error(error.message || 'Error al guardar el lugar');
      setErrors({ submit: error.message || 'Error al guardar el lugar' });
    }
  };

  const kindOptions = [
    { value: 'HOTEL', label: 'Hotel' },
    { value: 'AIRPORT', label: 'Aeropuerto' },
    { value: 'OTHER', label: 'Otro' },
  ];

  if (loadingPlace && mode === 'edit') {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando lugar...</p>
        </div>
      </div>
    );
  }

  const isSubmitting = createPlaceMutation.isPending || updatePlaceMutation.isPending;

  return (
    <div className="w-full h-full pb-24 px-4 overflow-y-auto">
      <Card extra="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-navy-700 dark:text-white">
            {mode === 'create' ? 'Nuevo Lugar' : 'Editar Lugar'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {mode === 'create'
              ? 'Complete la información para agregar un nuevo hotel, aeropuerto u otro lugar'
              : 'Actualice la información del lugar'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Kind */}
            <div>
              <label className="block text-sm font-semibold text-navy-700 dark:text-white mb-2">
                Tipo <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.kind}
                onChange={(e) => handleInputChange('kind', e.target.value)}
                className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-navy-900 px-4 py-2 text-navy-700 dark:text-white outline-none focus:border-brand-500"
              >
                {kindOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.kind && (
                <p className="mt-1 text-sm text-red-500">{errors.kind}</p>
              )}
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-navy-700 dark:text-white mb-2">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Ej: Excellence Punta Cana"
                className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-navy-900 px-4 py-2 text-navy-700 dark:text-white outline-none focus:border-brand-500"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* IATA Code (only for airports) */}
            {formData.kind === 'AIRPORT' && (
              <div>
                <label className="block text-sm font-semibold text-navy-700 dark:text-white mb-2">
                  Código IATA <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.iata}
                  onChange={(e) => handleInputChange('iata', e.target.value.toUpperCase())}
                  placeholder="PUJ"
                  maxLength={3}
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-navy-900 px-4 py-2 text-navy-700 dark:text-white outline-none focus:border-brand-500 uppercase"
                />
                {errors.iata && (
                  <p className="mt-1 text-sm text-red-500">{errors.iata}</p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  3 caracteres (ej: PUJ, SDQ)
                </p>
              </div>
            )}

            {/* Zone */}
            <div>
              <label className="block text-sm font-semibold text-navy-700 dark:text-white mb-2">
                Zona (Opcional)
              </label>
              <select
                value={formData.zoneId}
                onChange={(e) => handleInputChange('zoneId', e.target.value)}
                className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-navy-900 px-4 py-2 text-navy-700 dark:text-white outline-none focus:border-brand-500"
              >
                <option value="">Sin zona asignada</option>
                {zones.map((zone: any) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Location Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MdLocationOn className="text-xl text-brand-500" />
                <h3 className="text-lg font-semibold text-navy-700 dark:text-white">
                  Ubicación (Opcional)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowMapPicker(true)}
                className="flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600"
              >
                <MdMap />
                Seleccionar en Mapa
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Latitude */}
              <div>
                <label className="block text-sm font-semibold text-navy-700 dark:text-white mb-2">
                  Latitud
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.latitude || ''}
                  onChange={(e) => handleInputChange('latitude', e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="18.5601"
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-navy-900 px-4 py-2 text-navy-700 dark:text-white outline-none focus:border-brand-500"
                />
                {errors.latitude && (
                  <p className="mt-1 text-sm text-red-500">{errors.latitude}</p>
                )}
              </div>

              {/* Longitude */}
              <div>
                <label className="block text-sm font-semibold text-navy-700 dark:text-white mb-2">
                  Longitud
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.longitude || ''}
                  onChange={(e) => handleInputChange('longitude', e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="-68.3725"
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-navy-900 px-4 py-2 text-navy-700 dark:text-white outline-none focus:border-brand-500"
                />
                {errors.longitude && (
                  <p className="mt-1 text-sm text-red-500">{errors.longitude}</p>
                )}
              </div>
            </div>

            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                💡 Puede obtener las coordenadas buscando el lugar en{' '}
                <a
                  href="https://www.google.com/maps"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-blue-800"
                >
                  Google Maps
                </a>{' '}
                y haciendo clic derecho sobre la ubicación.
              </p>
            </div>
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">{errors.submit}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-3 text-sm font-semibold text-brand dark:text-white hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:hover:bg-brand-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MdSave />
              {isSubmitting ? 'Guardando...' : 'Guardar Lugar'}
            </button>
            <button
              type="button"
              onClick={() => popView()}
              disabled={isSubmitting}
              className="rounded-xl bg-gray-200 dark:bg-gray-700 px-6 py-3 text-sm font-semibold text-navy-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      </Card>

      {/* Map Picker Modal */}
      {showMapPicker && (
        <MapPicker
          latitude={formData.latitude}
          longitude={formData.longitude}
          onLocationSelect={(lat, lng) => {
            setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
            if (errors.latitude) setErrors(prev => ({ ...prev, latitude: '' }));
            if (errors.longitude) setErrors(prev => ({ ...prev, longitude: '' }));
          }}
          onClose={() => setShowMapPicker(false)}
        />
      )}
    </div>
  );
}

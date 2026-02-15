"use client";

import React, { useState, useEffect } from "react";
import Card from "@/components/single/card";
import { MdSave, MdArrowForward } from "react-icons/md";
import { useNavigation } from "@/contexts/NavigationContext";
import { useRoute, useCreateRoute, useUpdateRoute } from "@/hooks/useRoutes";
import { useZones } from "@/hooks/useZones";
import { toast } from "sonner";

interface RouteFormProps {
  mode: 'create' | 'edit';
  routeId?: string;
  onSuccess?: () => void;
}

interface RouteFormData {
  name: string;
  fromId: string;
  toId: string;
  price: string;
}

export default function RouteForm({ mode, routeId, onSuccess }: RouteFormProps) {
  const { popView } = useNavigation();

  // React Query hooks
  const { data: route, isLoading: loadingRoute } = useRoute(routeId || '');
  const { data: zones = [] } = useZones({ limit: 100 });
  const createRouteMutation = useCreateRoute();
  const updateRouteMutation = useUpdateRoute();

  const [formData, setFormData] = useState<RouteFormData>({
    name: '',
    fromId: '',
    toId: '',
    price: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (mode === 'edit' && route) {
      setFormData({
        name: route.name,
        fromId: route.from.id,
        toId: route.to.id,
        price: route.price.toString(),
      });
    }
  }, [mode, route]);

  const handleInputChange = (field: keyof RouteFormData, value: any) => {
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

    if (!formData.fromId) {
      newErrors.fromId = 'Debe seleccionar una zona de origen';
    }

    if (!formData.toId) {
      newErrors.toId = 'Debe seleccionar una zona de destino';
    }

    if (formData.fromId && formData.toId && formData.fromId === formData.toId) {
      newErrors.toId = 'La zona de origen y destino deben ser diferentes';
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'El precio debe ser mayor a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const payload: any = {
        name: formData.name.trim(),
        fromId: formData.fromId,
        toId: formData.toId,
        price: formData.price,
      };

      if (mode === 'create') {
        await createRouteMutation.mutateAsync(payload);
        toast.success('Ruta creada exitosamente');
      } else if (mode === 'edit' && routeId) {
        await updateRouteMutation.mutateAsync({ id: routeId, data: payload });
        toast.success('Ruta actualizada exitosamente');
      }

      onSuccess?.();
      popView();
    } catch (error: any) {
      console.error('Error saving route:', error);
      toast.error(error.message || 'Error al guardar la ruta');
      setErrors({ submit: error.message || 'Error al guardar la ruta' });
    }
  };

  if (loadingRoute && mode === 'edit') {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando ruta...</p>
        </div>
      </div>
    );
  }

  const isSubmitting = createRouteMutation.isPending || updateRouteMutation.isPending;

  // Get zone name helper
  const getZoneName = (zoneId: string) => {
    const zone = zones.find((z: any) => z.id === zoneId);
    return zone?.name || '';
  };

  return (
    <div className="w-full h-full pb-24 px-4 overflow-y-auto">
      <Card extra="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-navy-700 dark:text-white">
            {mode === 'create' ? 'Nueva Ruta' : 'Editar Ruta'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {mode === 'create'
              ? 'Complete la información para agregar una nueva ruta entre zonas'
              : 'Actualice la información de la ruta'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 gap-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-navy-700 dark:text-white mb-2">
                Nombre de la Ruta <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Ej: Bávaro - Aeropuerto PUJ"
                className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-navy-900 px-4 py-2 text-navy-700 dark:text-white outline-none focus:border-brand-500"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
              )}
            </div>
          </div>

          {/* Route Configuration */}
          <div>
            <h3 className="text-lg font-semibold text-navy-700 dark:text-white mb-4">
              Configuración de Ruta
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* From Zone */}
              <div>
                <label className="block text-sm font-semibold text-navy-700 dark:text-white mb-2">
                  Zona de Origen <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.fromId}
                  onChange={(e) => handleInputChange('fromId', e.target.value)}
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-navy-900 px-4 py-2 text-navy-700 dark:text-white outline-none focus:border-brand-500"
                >
                  <option value="">Seleccionar zona de origen</option>
                  {zones.map((zone: any) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.name}
                    </option>
                  ))}
                </select>
                {errors.fromId && (
                  <p className="mt-1 text-sm text-red-500">{errors.fromId}</p>
                )}
              </div>

              {/* To Zone */}
              <div>
                <label className="block text-sm font-semibold text-navy-700 dark:text-white mb-2">
                  Zona de Destino <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.toId}
                  onChange={(e) => handleInputChange('toId', e.target.value)}
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-navy-900 px-4 py-2 text-navy-700 dark:text-white outline-none focus:border-brand-500"
                >
                  <option value="">Seleccionar zona de destino</option>
                  {zones.map((zone: any) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.name}
                    </option>
                  ))}
                </select>
                {errors.toId && (
                  <p className="mt-1 text-sm text-red-500">{errors.toId}</p>
                )}
              </div>
            </div>

            {/* Route Preview */}
            {formData.fromId && formData.toId && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-center gap-3">
                  <span className="text-base font-semibold text-navy-700 dark:text-white">
                    {getZoneName(formData.fromId)}
                  </span>
                  <MdArrowForward className="text-brand-500 dark:text-brand-400 text-xl" />
                  <span className="text-base font-semibold text-navy-700 dark:text-white">
                    {getZoneName(formData.toId)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Pricing */}
          <div>
            <h3 className="text-lg font-semibold text-navy-700 dark:text-white mb-4">
              Precio
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-navy-700 dark:text-white mb-2">
                  Precio Base (USD) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-navy-900 px-4 py-2 text-navy-700 dark:text-white outline-none focus:border-brand-500"
                />
                {errors.price && (
                  <p className="mt-1 text-sm text-red-500">{errors.price}</p>
                )}
              </div>
            </div>

            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                💡 Este precio se usa como base para los servicios que utilizan esta ruta. Todos los precios se manejan en dólares estadounidenses (USD).
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
              {isSubmitting ? 'Guardando...' : 'Guardar Ruta'}
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
    </div>
  );
}

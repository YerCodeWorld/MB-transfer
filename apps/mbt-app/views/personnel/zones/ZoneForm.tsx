"use client";

import React, { useState, useEffect } from "react";
import Card from "@/components/single/card";
import { MdSave, MdAdd, MdDelete } from "react-icons/md";
import { useNavigation } from "@/contexts/NavigationContext";
import { useZone, useCreateZone, useUpdateZone, useAddZonePrice } from "@/hooks/useZones";
import { apiClient } from "@/utils/api";
import { toast } from "sonner";

interface ZoneFormProps {
  mode: 'create' | 'edit';
  zoneId?: string;
  onSuccess?: () => void;
}

interface VehiclePrice {
  vehicleId: string;
  price: string;
}

interface ZoneFormData {
  name: string;
  description: string;
  prices: VehiclePrice[];
}

export default function ZoneForm({ mode, zoneId, onSuccess }: ZoneFormProps) {
  const { popView } = useNavigation();

  // React Query hooks
  const { data: zone, isLoading: loadingZone } = useZone(zoneId || '');
  const createZoneMutation = useCreateZone();
  const updateZoneMutation = useUpdateZone();
  const addZonePriceMutation = useAddZonePrice();

  const [formData, setFormData] = useState<ZoneFormData>({
    name: '',
    description: '',
    prices: [],
  });

  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    if (mode === 'edit' && zone) {
      setFormData({
        name: zone.name,
        description: zone.description || '',
        prices: zone.prices?.map((p: any) => ({
          vehicleId: p.vehicle.id,
          price: p.price.toString(),
        })) || [],
      });
    }
  }, [mode, zone]);

  const fetchVehicles = async () => {
    try {
      setLoadingVehicles(true);
      const response = await apiClient.get<any[]>('/api/v1/vehicules?limit=100');
      if (response.success && response.data) {
        setVehicles(response.data);
      }
    } catch (err) {
      console.error('Error fetching vehicles:', err);
      toast.error('Error al cargar vehículos');
    } finally {
      setLoadingVehicles(false);
    }
  };

  const handleInputChange = (field: keyof ZoneFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAddPrice = () => {
    setFormData(prev => ({
      ...prev,
      prices: [...prev.prices, { vehicleId: '', price: '' }],
    }));
  };

  const handleRemovePrice = (index: number) => {
    setFormData(prev => ({
      ...prev,
      prices: prev.prices.filter((_, i) => i !== index),
    }));
  };

  const handlePriceChange = (index: number, field: keyof VehiclePrice, value: string) => {
    setFormData(prev => ({
      ...prev,
      prices: prev.prices.map((p, i) =>
        i === index ? { ...p, [field]: value } : p
      ),
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    // Validate prices
    formData.prices.forEach((price, index) => {
      if (!price.vehicleId) {
        newErrors[`price_${index}_vehicle`] = 'Debe seleccionar un vehículo';
      }
      if (!price.price || parseFloat(price.price) <= 0) {
        newErrors[`price_${index}_price`] = 'El precio debe ser mayor a 0';
      }
    });

    // Check for duplicate vehicles
    const vehicleIds = formData.prices.map(p => p.vehicleId).filter(Boolean);
    const duplicates = vehicleIds.filter((id, index) => vehicleIds.indexOf(id) !== index);
    if (duplicates.length > 0) {
      newErrors.prices = 'No puede agregar el mismo vehículo dos veces';
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
        description: formData.description.trim() || undefined,
      };

      if (mode === 'create') {
        // Include prices in creation
        payload.prices = formData.prices.map(p => ({
          vehicleId: p.vehicleId,
          price: p.price,
        }));

        await createZoneMutation.mutateAsync(payload);
        toast.success('Zona creada exitosamente');
      } else if (mode === 'edit' && zoneId) {
        // Update zone info
        await updateZoneMutation.mutateAsync({
          id: zoneId,
          data: {
            name: payload.name,
            description: payload.description
          }
        });

        // Update prices individually (add new ones)
        const existingPriceVehicleIds = zone?.prices?.map((p: any) => p.vehicle.id) || [];
        const newPrices = formData.prices.filter(p => !existingPriceVehicleIds.includes(p.vehicleId));

        for (const price of newPrices) {
          await addZonePriceMutation.mutateAsync({
            zoneId,
            data: {
              vehicleId: price.vehicleId,
              price: price.price,
            },
          });
        }

        // Update existing prices
        const updatedPrices = formData.prices.filter(p => existingPriceVehicleIds.includes(p.vehicleId));
        for (const price of updatedPrices) {
          await addZonePriceMutation.mutateAsync({
            zoneId,
            data: {
              vehicleId: price.vehicleId,
              price: price.price,
            },
          });
        }

        toast.success('Zona actualizada exitosamente');
      }

      onSuccess?.();
      popView();
    } catch (error: any) {
      console.error('Error saving zone:', error);
      toast.error(error.message || 'Error al guardar la zona');
      setErrors({ submit: error.message || 'Error al guardar la zona' });
    }
  };

  if (loadingZone && mode === 'edit') {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando zona...</p>
        </div>
      </div>
    );
  }

  const isSubmitting = createZoneMutation.isPending || updateZoneMutation.isPending;

  return (
    <div className="w-full h-full pb-24 px-4 overflow-y-auto">
      <Card extra="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-navy-700 dark:text-white">
            {mode === 'create' ? 'Nueva Zona' : 'Editar Zona'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {mode === 'create'
              ? 'Complete la información para agregar una nueva zona geográfica'
              : 'Actualice la información de la zona'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 gap-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-navy-700 dark:text-white mb-2">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Ej: Zona Bávaro"
                className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-navy-900 px-4 py-2 text-navy-700 dark:text-white outline-none focus:border-brand-500"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-navy-700 dark:text-white mb-2">
                Descripción (Opcional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Descripción de la zona..."
                rows={3}
                className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-navy-900 px-4 py-2 text-navy-700 dark:text-white outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* Vehicle Prices */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-navy-700 dark:text-white">
                Precios por Vehículo
              </h3>
              <button
                type="button"
                onClick={handleAddPrice}
                disabled={loadingVehicles}
                className="flex items-center gap-2 rounded-xl bg-brand-500 px-3 py-2 text-sm font-semibold text-brand dark:text-white hover:bg-brand-600"
              >
                <MdAdd />
                Agregar Precio
              </button>
            </div>

            {errors.prices && (
              <p className="mb-3 text-sm text-red-500">{errors.prices}</p>
            )}

            {formData.prices.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <p className="text-gray-600 dark:text-gray-400">
                  No hay precios configurados
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                  Agregue precios para diferentes tipos de vehículos
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {formData.prices.map((price, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
                  >
                    {/* Vehicle */}
                    <div className="md:col-span-1">
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                        Vehículo
                      </label>
                      <select
                        value={price.vehicleId}
                        onChange={(e) => handlePriceChange(index, 'vehicleId', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-navy-900 px-3 py-2 text-sm text-navy-700 dark:text-white outline-none focus:border-brand-500"
                      >
                        <option value="">Seleccionar vehículo</option>
                        {vehicles.map(vehicle => (
                          <option key={vehicle.id} value={vehicle.id}>
                            {vehicle.name} ({vehicle.paxCapacity} pax)
                          </option>
                        ))}
                      </select>
                      {errors[`price_${index}_vehicle`] && (
                        <p className="mt-1 text-xs text-red-500">{errors[`price_${index}_vehicle`]}</p>
                      )}
                    </div>

                    {/* Price */}
                    <div className="md:col-span-1">
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                        Precio (USD)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={price.price}
                        onChange={(e) => handlePriceChange(index, 'price', e.target.value)}
                        placeholder="0.00"
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-navy-900 px-3 py-2 text-sm text-navy-700 dark:text-white outline-none focus:border-brand-500"
                      />
                      {errors[`price_${index}_price`] && (
                        <p className="mt-1 text-xs text-red-500">{errors[`price_${index}_price`]}</p>
                      )}
                    </div>

                    {/* Remove Button */}
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => handleRemovePrice(index)}
                        className="w-full md:w-auto rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 flex items-center justify-center gap-2"
                      >
                        <MdDelete />
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                💡 Los precios se guardan en dólares estadounidenses (USD).
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
              {isSubmitting ? 'Guardando...' : 'Guardar Zona'}
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

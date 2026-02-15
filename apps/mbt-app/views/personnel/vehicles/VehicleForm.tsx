"use client";

import React, { useState, useEffect } from "react";
import Card from "@/components/single/card";
import { MdSave } from "react-icons/md";
import { useNavigation } from "@/contexts/NavigationContext";
import { apiClient } from "@/utils/api";

interface Vehicle {
  id: string;
  name: string;
  image?: string;
  brand?: string;
  identifierDocument?: string;
  state: 'FUNCTIONAL' | 'DAMAGED' | 'ONSERVICE' | 'OFFSERVICE';
  paxCapacity: number;
  luggageCapacity: number;
  fuelType?: string;
  fuelUnitPrice?: number;
  fuelState: 'FULL' | 'MIDDLE' | 'EMPTY';
  lastMaintenanceOn?: string;
}

interface VehicleFormProps {
  mode: 'create' | 'edit';
  vehicleId?: string;
  onSuccess?: () => void;
}

export default function VehicleForm({ mode, vehicleId, onSuccess }: VehicleFormProps) {
  const { popView } = useNavigation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Vehicle>>({
    name: '',
    image: '',
    brand: '',
    identifierDocument: '',
    state: 'FUNCTIONAL',
    paxCapacity: 4,
    luggageCapacity: 2,
    fuelType: '',
    fuelUnitPrice: undefined,
    fuelState: 'MIDDLE',
    lastMaintenanceOn: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (mode === 'edit' && vehicleId) {
      fetchVehicle();
    }
  }, [mode, vehicleId]);

  const fetchVehicle = async () => {
    if (!vehicleId) return;

    try {
      setLoading(true);
      const response = await apiClient.get<Vehicle>(`/api/v1/vehicules/${vehicleId}`);

      if (response.success && response.data) {
        const vehicle = response.data;
        setFormData({
          name: vehicle.name,
          image: vehicle.image || '',
          brand: vehicle.brand || '',
          identifierDocument: vehicle.identifierDocument || '',
          state: vehicle.state,
          paxCapacity: vehicle.paxCapacity,
          luggageCapacity: vehicle.luggageCapacity,
          fuelType: vehicle.fuelType || '',
          fuelUnitPrice: vehicle.fuelUnitPrice || undefined,
          fuelState: vehicle.fuelState,
          lastMaintenanceOn: vehicle.lastMaintenanceOn ? new Date(vehicle.lastMaintenanceOn).toISOString().split('T')[0] : '',
        });
      }
    } catch (err) {
      console.error('Error fetching vehicle:', err);
      setErrors({ submit: 'Error al cargar vehículo' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof Vehicle, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'El nombre/placa es requerido';
    }

    if (!formData.paxCapacity || formData.paxCapacity < 1) {
      newErrors.paxCapacity = 'La capacidad de pasajeros debe ser mayor a 0';
    }

    if (!formData.luggageCapacity || formData.luggageCapacity < 0) {
      newErrors.luggageCapacity = 'La capacidad de equipaje no puede ser negativa';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      setErrors({});

      const payload: any = {
        name: formData.name,
        image: formData.image || undefined,
        brand: formData.brand || undefined,
        identifierDocument: formData.identifierDocument || undefined,
        state: formData.state,
        paxCapacity: formData.paxCapacity,
        luggageCapacity: formData.luggageCapacity,
        fuelType: formData.fuelType || undefined,
        fuelUnitPrice: formData.fuelUnitPrice?.toString() || undefined,
        fuelState: formData.fuelState,
        lastMaintenanceOn: formData.lastMaintenanceOn ? new Date(formData.lastMaintenanceOn).toISOString() : undefined,
      };

      if (mode === 'create') {
        await apiClient.post('/api/v1/vehicules', payload);
      } else if (mode === 'edit' && vehicleId) {
        await apiClient.put(`/api/v1/vehicules/${vehicleId}`, payload);
      }

      onSuccess?.();
      popView();
    } catch (error: any) {
      console.error('Error saving vehicle:', error);
      setErrors({ submit: error.message || 'Error al guardar el vehículo' });
    } finally {
      setLoading(false);
    }
  };

  const stateOptions = [
    { value: 'FUNCTIONAL', label: 'Funcional' },
    { value: 'DAMAGED', label: 'Dañado' },
    { value: 'ONSERVICE', label: 'En Servicio' },
    { value: 'OFFSERVICE', label: 'Fuera de Servicio' },
  ];

  const fuelStateOptions = [
    { value: 'FULL', label: 'Lleno' },
    { value: 'MIDDLE', label: 'Medio' },
    { value: 'EMPTY', label: 'Vacío' },
  ];

  if (loading && mode === 'edit') {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando vehículo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full pb-24 px-4">
      <Card extra="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-navy-700 dark:text-white">
            {mode === 'create' ? 'Nuevo Vehículo' : 'Editar Vehículo'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {mode === 'create'
              ? 'Complete la información para agregar un nuevo vehículo'
              : 'Actualice la información del vehículo'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-navy-700 dark:text-white mb-2">
                Nombre/Placa <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full rounded-lg border-2 ${
                  errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                } bg-white dark:bg-navy-800 text-navy-700 dark:text-white px-4 py-3 outline-none focus:border-brand-500 dark:focus:border-brand-400`}
                placeholder="A123456 o Toyota Corolla 2023"
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-navy-700 dark:text-white mb-2">
                Marca
              </label>
              <input
                type="text"
                value={formData.brand || ''}
                onChange={(e) => handleInputChange('brand', e.target.value)}
                className="w-full rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-navy-800 text-navy-700 dark:text-white px-4 py-3 outline-none focus:border-brand-500 dark:focus:border-brand-400"
                placeholder="Toyota"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-navy-700 dark:text-white mb-2">
                URL de Imagen
              </label>
              <input
                type="text"
                value={formData.image || ''}
                onChange={(e) => handleInputChange('image', e.target.value)}
                className="w-full rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-navy-800 text-navy-700 dark:text-white px-4 py-3 outline-none focus:border-brand-500 dark:focus:border-brand-400"
                placeholder="https://ejemplo.com/vehiculo.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-navy-700 dark:text-white mb-2">
                Documento Identificador
              </label>
              <input
                type="text"
                value={formData.identifierDocument || ''}
                onChange={(e) => handleInputChange('identifierDocument', e.target.value)}
                className="w-full rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-navy-800 text-navy-700 dark:text-white px-4 py-3 outline-none focus:border-brand-500 dark:focus:border-brand-400"
                placeholder="Número de documento o URL"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-navy-700 dark:text-white mb-2">
                Estado <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                className="w-full rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-navy-800 text-navy-700 dark:text-white px-4 py-3 outline-none focus:border-brand-500 dark:focus:border-brand-400"
              >
                {stateOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Capacity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-navy-700 dark:text-white mb-2">
                Capacidad de Pasajeros <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.paxCapacity || ''}
                onChange={(e) => handleInputChange('paxCapacity', parseInt(e.target.value) || 0)}
                className={`w-full rounded-lg border-2 ${
                  errors.paxCapacity ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                } bg-white dark:bg-navy-800 text-navy-700 dark:text-white px-4 py-3 outline-none focus:border-brand-500 dark:focus:border-brand-400`}
                placeholder="4"
                min="1"
              />
              {errors.paxCapacity && (
                <p className="text-sm text-red-500 mt-1">{errors.paxCapacity}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-navy-700 dark:text-white mb-2">
                Capacidad de Equipaje <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.luggageCapacity || ''}
                onChange={(e) => handleInputChange('luggageCapacity', parseInt(e.target.value) || 0)}
                className={`w-full rounded-lg border-2 ${
                  errors.luggageCapacity ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                } bg-white dark:bg-navy-800 text-navy-700 dark:text-white px-4 py-3 outline-none focus:border-brand-500 dark:focus:border-brand-400`}
                placeholder="2"
                min="0"
              />
              {errors.luggageCapacity && (
                <p className="text-sm text-red-500 mt-1">{errors.luggageCapacity}</p>
              )}
            </div>
          </div>

          {/* Fuel Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-navy-700 dark:text-white mb-2">
                Tipo de Combustible
              </label>
              <input
                type="text"
                value={formData.fuelType || ''}
                onChange={(e) => handleInputChange('fuelType', e.target.value)}
                className="w-full rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-navy-800 text-navy-700 dark:text-white px-4 py-3 outline-none focus:border-brand-500 dark:focus:border-brand-400"
                placeholder="Gasolina, Diésel, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-navy-700 dark:text-white mb-2">
                Precio por Unidad
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.fuelUnitPrice || ''}
                onChange={(e) => handleInputChange('fuelUnitPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-navy-800 text-navy-700 dark:text-white px-4 py-3 outline-none focus:border-brand-500 dark:focus:border-brand-400"
                placeholder="0.00"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-navy-700 dark:text-white mb-2">
                Estado de Combustible <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.fuelState}
                onChange={(e) => handleInputChange('fuelState', e.target.value)}
                className="w-full rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-navy-800 text-navy-700 dark:text-white px-4 py-3 outline-none focus:border-brand-500 dark:focus:border-brand-400"
              >
                {fuelStateOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Maintenance */}
          <div>
            <label className="block text-sm font-semibold text-navy-700 dark:text-white mb-2">
              Fecha de Último Mantenimiento
            </label>
            <input
              type="date"
              value={formData.lastMaintenanceOn || ''}
              onChange={(e) => handleInputChange('lastMaintenanceOn', e.target.value)}
              className="w-full rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-navy-800 text-navy-700 dark:text-white px-4 py-3 outline-none focus:border-brand-500 dark:focus:border-brand-400"
            />
          </div>

          {errors.submit && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400">{errors.submit}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => popView()}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-navy-700 dark:text-white hover:bg-gray-100 dark:hover:bg-navy-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <MdSave />
                  Guardar
                </>
              )}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}

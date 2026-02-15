"use client";

import React, { useState } from "react";
import Card from "@/components/single/card";
import { MdSave } from "react-icons/md";
import { useNavigation } from "@/contexts/NavigationContext";
import { getVehicleById, createVehicle, updateVehicle } from "./mockVehicles";
import { getAllEmployees } from "../employees/mockEmployees";
import { getAllAllies } from "../allies/mockAllies";
import { Vehicle, VehicleType, VehicleStatus } from "@/types/personnel";

interface VehicleFormProps {
  mode: 'create' | 'edit';
  vehicleId?: string;
}

export default function VehicleForm({ mode, vehicleId }: VehicleFormProps) {
  const { popView } = useNavigation();
  const existingVehicle = mode === 'edit' && vehicleId ? getVehicleById(vehicleId) : null;

  const [formData, setFormData] = useState<Partial<Vehicle>>({
    type: existingVehicle?.type || 'CAR',
    plate: existingVehicle?.plate || '',
    brand: existingVehicle?.brand || '',
    model: existingVehicle?.model || '',
    year: existingVehicle?.year || new Date().getFullYear(),
    color: existingVehicle?.color || '',
    status: existingVehicle?.status || 'ACTIVE',
    assignedDriverId: existingVehicle?.assignedDriverId || null,
    allyId: existingVehicle?.allyId || null,
    mileage: existingVehicle?.mileage || null,
    lastMaintenance: existingVehicle?.lastMaintenance || null,
    notes: existingVehicle?.notes || '',
    photo: existingVehicle?.photo || null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get employees and allies for dropdowns
  const employees = getAllEmployees().filter(emp => emp.role === 'DRIVER' && emp.state === 'WORKING');
  const allies = getAllAllies().filter(ally => ally.status === 'ACTIVE');

  const handleInputChange = (field: keyof Vehicle, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };

      // Clear opposite assignment when one is selected
      if (field === 'assignedDriverId' && value) {
        newData.allyId = null;
        newData.allyName = null;
      } else if (field === 'allyId' && value) {
        newData.assignedDriverId = null;
        newData.assignedDriverName = null;
      }

      // Update assigned names
      if (field === 'assignedDriverId') {
        const driver = employees.find(emp => emp.id === value);
        newData.assignedDriverName = driver?.name || null;
      } else if (field === 'allyId') {
        const ally = allies.find(a => a.id === value);
        newData.allyName = ally?.name || null;
      }

      return newData;
    });

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.plate?.trim()) {
      newErrors.plate = 'La placa es requerida';
    }

    if (!formData.brand?.trim()) {
      newErrors.brand = 'La marca es requerida';
    }

    if (!formData.model?.trim()) {
      newErrors.model = 'El modelo es requerido';
    }

    if (!formData.year || formData.year < 1900 || formData.year > new Date().getFullYear() + 1) {
      newErrors.year = 'Año inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      if (mode === 'create') {
        createVehicle(formData as Omit<Vehicle, 'id'>);
      } else if (mode === 'edit' && vehicleId) {
        updateVehicle(vehicleId, formData);
      }
      popView();
    } catch (error) {
      console.error('Error saving vehicle:', error);
      setErrors({ submit: 'Error al guardar el vehículo' });
    }
  };

  const typeOptions: { value: VehicleType; label: string }[] = [
    { value: 'CAR', label: 'Automóvil' },
    { value: 'TRUCK', label: 'Camión' },
    { value: 'VAN', label: 'Van' },
    { value: 'MOTORCYCLE', label: 'Motocicleta' },
  ];

  const statusOptions: { value: VehicleStatus; label: string }[] = [
    { value: 'ACTIVE', label: 'Activo' },
    { value: 'MAINTENANCE', label: 'En Mantenimiento' },
    { value: 'INACTIVE', label: 'Inactivo' },
    { value: 'RETIRED', label: 'Retirado' },
  ];

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
                Placa <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.plate || ''}
                onChange={(e) => handleInputChange('plate', e.target.value.toUpperCase())}
                className={`w-full rounded-lg border-2 ${
                  errors.plate ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                } bg-white dark:bg-navy-800 text-navy-700 dark:text-white px-4 py-3 outline-none focus:border-brand-500 dark:focus:border-brand-400`}
                placeholder="A123456"
              />
              {errors.plate && (
                <p className="text-sm text-red-500 mt-1">{errors.plate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-navy-700 dark:text-white mb-2">
                Tipo <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value as VehicleType)}
                className="w-full rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-navy-800 text-navy-700 dark:text-white px-4 py-3 outline-none focus:border-brand-500 dark:focus:border-brand-400"
              >
                {typeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-navy-700 dark:text-white mb-2">
                Marca <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.brand || ''}
                onChange={(e) => handleInputChange('brand', e.target.value)}
                className={`w-full rounded-lg border-2 ${
                  errors.brand ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                } bg-white dark:bg-navy-800 text-navy-700 dark:text-white px-4 py-3 outline-none focus:border-brand-500 dark:focus:border-brand-400`}
                placeholder="Toyota"
              />
              {errors.brand && (
                <p className="text-sm text-red-500 mt-1">{errors.brand}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-navy-700 dark:text-white mb-2">
                Modelo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.model || ''}
                onChange={(e) => handleInputChange('model', e.target.value)}
                className={`w-full rounded-lg border-2 ${
                  errors.model ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                } bg-white dark:bg-navy-800 text-navy-700 dark:text-white px-4 py-3 outline-none focus:border-brand-500 dark:focus:border-brand-400`}
                placeholder="Corolla"
              />
              {errors.model && (
                <p className="text-sm text-red-500 mt-1">{errors.model}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-navy-700 dark:text-white mb-2">
                Año <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.year || ''}
                onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                className={`w-full rounded-lg border-2 ${
                  errors.year ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                } bg-white dark:bg-navy-800 text-navy-700 dark:text-white px-4 py-3 outline-none focus:border-brand-500 dark:focus:border-brand-400`}
                placeholder="2023"
                min="1900"
                max={new Date().getFullYear() + 1}
              />
              {errors.year && (
                <p className="text-sm text-red-500 mt-1">{errors.year}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-navy-700 dark:text-white mb-2">
                Color
              </label>
              <input
                type="text"
                value={formData.color || ''}
                onChange={(e) => handleInputChange('color', e.target.value)}
                className="w-full rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-navy-800 text-navy-700 dark:text-white px-4 py-3 outline-none focus:border-brand-500 dark:focus:border-brand-400"
                placeholder="Blanco"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-navy-700 dark:text-white mb-2">
                Estado <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value as VehicleStatus)}
                className="w-full rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-navy-800 text-navy-700 dark:text-white px-4 py-3 outline-none focus:border-brand-500 dark:focus:border-brand-400"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-navy-700 dark:text-white mb-2">
                Kilometraje
              </label>
              <input
                type="number"
                value={formData.mileage || ''}
                onChange={(e) => handleInputChange('mileage', e.target.value ? parseInt(e.target.value) : null)}
                className="w-full rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-navy-800 text-navy-700 dark:text-white px-4 py-3 outline-none focus:border-brand-500 dark:focus:border-brand-400"
                placeholder="45000"
                min="0"
              />
            </div>
          </div>

          {/* Assignment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-navy-700 dark:text-white mb-2">
                Conductor Asignado
              </label>
              <select
                value={formData.assignedDriverId || ''}
                onChange={(e) => handleInputChange('assignedDriverId', e.target.value || null)}
                className="w-full rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-navy-800 text-navy-700 dark:text-white px-4 py-3 outline-none focus:border-brand-500 dark:focus:border-brand-400"
              >
                <option value="">Sin asignar</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-navy-700 dark:text-white mb-2">
                Aliado Asignado
              </label>
              <select
                value={formData.allyId || ''}
                onChange={(e) => handleInputChange('allyId', e.target.value || null)}
                className="w-full rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-navy-800 text-navy-700 dark:text-white px-4 py-3 outline-none focus:border-brand-500 dark:focus:border-brand-400"
              >
                <option value="">Sin asignar</option>
                {allies.map(ally => (
                  <option key={ally.id} value={ally.id}>
                    {ally.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-navy-700 dark:text-white mb-2">
              Notas
            </label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={4}
              className="w-full rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-navy-800 text-navy-700 dark:text-white px-4 py-3 outline-none focus:border-brand-500 dark:focus:border-brand-400 resize-none"
              placeholder="Información adicional sobre el vehículo..."
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
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-500 text-white hover:bg-brand-600 dark:bg-brand-400 dark:hover:bg-brand-300"
            >
              <MdSave />
              Guardar
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}

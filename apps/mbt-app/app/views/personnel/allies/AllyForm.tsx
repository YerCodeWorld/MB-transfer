"use client";

import React, { useState } from "react";
import Card from "@/components/single/card";
import { MdSave } from "react-icons/md";
import { useNavigation } from "@/contexts/NavigationContext";
import { getAllyById, createAlly, updateAlly } from "./mockAllies";
import { Ally, AllyType, AllyStatus } from "@/types/personnel";

interface AllyFormProps {
  mode: 'create' | 'edit';
  allyId?: string;
}

export default function AllyForm({ mode, allyId }: AllyFormProps) {
  const { popView } = useNavigation();
  const existingAlly = mode === 'edit' && allyId ? getAllyById(allyId) : null;

  const [formData, setFormData] = useState<Partial<Ally>>({
    name: existingAlly?.name || '',
    type: existingAlly?.type || 'COMPANY',
    email: existingAlly?.email || '',
    phone: existingAlly?.phone || '',
    identification: existingAlly?.identification || '',
    address: existingAlly?.address || '',
    status: existingAlly?.status || 'ACTIVE',
    vehiclesCount: existingAlly?.vehiclesCount || 0,
    contactPerson: existingAlly?.contactPerson || '',
    notes: existingAlly?.notes || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof Ally, value: any) => {
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

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (formData.phone && !/^\d{3}-\d{3}-\d{4}$/.test(formData.phone)) {
      // Basic phone validation for format XXX-XXX-XXXX
      // Allow it to be flexible
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      if (mode === 'create') {
        createAlly(formData as Omit<Ally, 'id' | 'createdAt'>);
      } else if (mode === 'edit' && allyId) {
        updateAlly(allyId, formData);
      }
      popView();
    } catch (error) {
      console.error('Error saving ally:', error);
      setErrors({ submit: 'Error al guardar el aliado' });
    }
  };

  const typeOptions: { value: AllyType; label: string }[] = [
    { value: 'COMPANY', label: 'Empresa' },
    { value: 'INDIVIDUAL', label: 'Individual' },
  ];

  const statusOptions: { value: AllyStatus; label: string }[] = [
    { value: 'ACTIVE', label: 'Activo' },
    { value: 'INACTIVE', label: 'Inactivo' },
    { value: 'SUSPENDED', label: 'Suspendido' },
  ];

  return (
    <div className="w-full h-full pb-24 px-4">
      <Card extra="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-navy-700 dark:text-white">
            {mode === 'create' ? 'Nuevo Aliado' : 'Editar Aliado'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {mode === 'create'
              ? 'Complete la información para agregar un nuevo aliado'
              : 'Actualice la información del aliado'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-navy-700 dark:text-white mb-2">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full rounded-lg border-2 ${
                  errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                } bg-white dark:bg-navy-800 text-navy-700 dark:text-white px-4 py-3 outline-none focus:border-brand-500 dark:focus:border-brand-400`}
                placeholder="Nombre del aliado"
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-navy-700 dark:text-white mb-2">
                Tipo <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value as AllyType)}
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
                Estado <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value as AllyStatus)}
                className="w-full rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-navy-800 text-navy-700 dark:text-white px-4 py-3 outline-none focus:border-brand-500 dark:focus:border-brand-400"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-navy-700 dark:text-white mb-2">
                Correo Electrónico
              </label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full rounded-lg border-2 ${
                  errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                } bg-white dark:bg-navy-800 text-navy-700 dark:text-white px-4 py-3 outline-none focus:border-brand-500 dark:focus:border-brand-400`}
                placeholder="ejemplo@correo.com"
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-navy-700 dark:text-white mb-2">
                Teléfono
              </label>
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-navy-800 text-navy-700 dark:text-white px-4 py-3 outline-none focus:border-brand-500 dark:focus:border-brand-400"
                placeholder="809-555-1234"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-navy-700 dark:text-white mb-2">
                {formData.type === 'COMPANY' ? 'RNC' : 'Identificación'}
              </label>
              <input
                type="text"
                value={formData.identification || ''}
                onChange={(e) => handleInputChange('identification', e.target.value)}
                className="w-full rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-navy-800 text-navy-700 dark:text-white px-4 py-3 outline-none focus:border-brand-500 dark:focus:border-brand-400"
                placeholder={formData.type === 'COMPANY' ? '130-12345-6' : '001-1234567-8'}
              />
            </div>

            {formData.type === 'COMPANY' && (
              <div>
                <label className="block text-sm font-semibold text-navy-700 dark:text-white mb-2">
                  Persona de Contacto
                </label>
                <input
                  type="text"
                  value={formData.contactPerson || ''}
                  onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                  className="w-full rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-navy-800 text-navy-700 dark:text-white px-4 py-3 outline-none focus:border-brand-500 dark:focus:border-brand-400"
                  placeholder="Nombre del contacto"
                />
              </div>
            )}
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-semibold text-navy-700 dark:text-white mb-2">
              Dirección
            </label>
            <input
              type="text"
              value={formData.address || ''}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className="w-full rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-navy-800 text-navy-700 dark:text-white px-4 py-3 outline-none focus:border-brand-500 dark:focus:border-brand-400"
              placeholder="Dirección completa"
            />
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
              placeholder="Información adicional sobre el aliado..."
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

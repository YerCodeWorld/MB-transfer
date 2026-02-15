"use client";

import React, { useState } from "react";
import Card from "@/components/single/card";
import { MdChevronLeft, MdChevronRight, MdSave } from "react-icons/md";
import { useNavigation } from "@/contexts/NavigationContext";
import { getEmployeeById, createEmployee, updateEmployee } from "./mockEmployees";
import { Employee, EmployeeRole, EmployeeState } from "@/types/auth";

interface EmployeeFormProps {
  mode: 'create' | 'edit';
  employeeId?: string;
  defaultRole?: EmployeeRole;
}

export default function EmployeeForm({ mode, employeeId, defaultRole }: EmployeeFormProps) {
  const { popView } = useNavigation();
  const existingEmployee = mode === 'edit' && employeeId ? getEmployeeById(employeeId) : null;

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<Employee>>({
    name: existingEmployee?.name || '',
    email: existingEmployee?.email || '',
    identification: existingEmployee?.identification || '',
    role: existingEmployee?.role || defaultRole || 'STAFF',
    state: existingEmployee?.state || 'WORKING',
    darkMode: existingEmployee?.darkMode || false,
    appAccent: existingEmployee?.appAccent || null,
    minimized: existingEmployee?.minimized || false,
    photo: existingEmployee?.photo || null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps = [
    { label: 'Información Personal', fields: ['name', 'email', 'identification'] },
    { label: 'Detalles de Empleo', fields: ['role', 'state'] },
    { label: 'Preferencias', fields: ['darkMode', 'appAccent', 'minimized'] },
  ];

  const handleInputChange = (field: keyof Employee, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    const currentFields = steps[step].fields;

    if (step === 0) {
      if (!formData.name?.trim()) {
        newErrors.name = 'El nombre es requerido';
      }
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Email inválido';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = () => {
    if (!validateStep(currentStep)) return;

    try {
      if (mode === 'create') {
        createEmployee(formData as Omit<Employee, 'id'>);
      } else if (mode === 'edit' && employeeId) {
        updateEmployee(employeeId, formData);
      }
      popView(); // Return to previous view
    } catch (error) {
      console.error('Error saving employee:', error);
      setErrors({ submit: 'Error al guardar el empleado' });
    }
  };

  const roleOptions: { value: EmployeeRole; label: string }[] = [
    { value: 'ADMINISTRATOR', label: 'Administrador' },
    { value: 'DEVELOPER', label: 'Desarrollador' },
    { value: 'MANAGER', label: 'Gerente' },
    { value: 'COORDINATOR', label: 'Coordinador' },
    { value: 'DRIVER', label: 'Conductor' },
    { value: 'STAFF', label: 'Personal' },
  ];

  const stateOptions: { value: EmployeeState; label: string }[] = [
    { value: 'WORKING', label: 'Activo' },
    { value: 'SUSPENDED', label: 'Suspendido' },
    { value: 'FIRED', label: 'Despedido' },
  ];

  const accentColors = [
    '#3b82f6', // blue
    '#8b5cf6', // purple
    '#10b981', // green
    '#f59e0b', // orange
    '#ec4899', // pink
    '#ef4444', // red
  ];

  return (
    <div className="w-full h-full pb-24 px-4">
      <Card extra="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-navy-700 dark:text-white">
            {mode === 'create' ? 'Nuevo Empleado' : 'Editar Empleado'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {mode === 'create'
              ? 'Complete la información para agregar un nuevo empleado'
              : 'Actualice la información del empleado'
            }
          </p>
        </div>

        {/* Stepper */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    index <= currentStep
                      ? 'border-brand-500 bg-brand-500 text-white dark:border-brand-400 dark:bg-brand-400'
                      : 'border-gray-300 bg-white text-gray-400 dark:border-gray-600 dark:bg-navy-800'
                  }`}>
                    {index + 1}
                  </div>
                  <p className={`text-xs mt-2 ${
                    index <= currentStep
                      ? 'text-brand-500 font-medium dark:text-brand-400'
                      : 'text-gray-400'
                  }`}>
                    {step.label}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-[2px] flex-1 mx-2 ${
                    index < currentStep
                      ? 'bg-brand-500 dark:bg-brand-400'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="space-y-6">
          {/* Step 0: Personal Information */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-navy-700 dark:text-white mb-2">
                  Nombre Completo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full rounded-lg border-2 ${
                    errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                  } bg-white dark:bg-navy-800 text-navy-700 dark:text-white px-4 py-3 outline-none focus:border-brand-500 dark:focus:border-brand-400`}
                  placeholder="Ej: Juan Pérez"
                />
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                )}
              </div>

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
                  Identificación
                </label>
                <input
                  type="text"
                  value={formData.identification || ''}
                  onChange={(e) => handleInputChange('identification', e.target.value)}
                  className="w-full rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-navy-800 text-navy-700 dark:text-white px-4 py-3 outline-none focus:border-brand-500 dark:focus:border-brand-400"
                  placeholder="001-1234567-8"
                />
              </div>
            </div>
          )}

          {/* Step 1: Employment Details */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-navy-700 dark:text-white mb-2">
                  Rol <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => handleInputChange('role', e.target.value as EmployeeRole)}
                  className="w-full rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-navy-800 text-navy-700 dark:text-white px-4 py-3 outline-none focus:border-brand-500 dark:focus:border-brand-400"
                >
                  {roleOptions.map(option => (
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
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value as EmployeeState)}
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
          )}

          {/* Step 2: Preferences */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.darkMode}
                    onChange={(e) => handleInputChange('darkMode', e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                  />
                  <span className="text-sm font-semibold text-navy-700 dark:text-white">
                    Modo Oscuro
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-semibold text-navy-700 dark:text-white mb-2">
                  Color de Acento
                </label>
                <div className="flex gap-3">
                  {accentColors.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handleInputChange('appAccent', color)}
                      className={`w-12 h-12 rounded-full border-2 transition ${
                        formData.appAccent === color
                          ? 'border-navy-700 dark:border-white scale-110'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  <button
                    type="button"
                    onClick={() => handleInputChange('appAccent', null)}
                    className={`w-12 h-12 rounded-full border-2 bg-gray-200 dark:bg-gray-700 flex items-center justify-center ${
                      formData.appAccent === null
                        ? 'border-navy-700 dark:border-white scale-110'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <span className="text-xs">Sin</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.minimized}
                    onChange={(e) => handleInputChange('minimized', e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                  />
                  <span className="text-sm font-semibold text-navy-700 dark:text-white">
                    Vista Minimizada
                  </span>
                </label>
              </div>
            </div>
          )}

          {errors.submit && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400">{errors.submit}</p>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-navy-700 dark:text-white hover:bg-gray-100 dark:hover:bg-navy-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <MdChevronLeft />
            Anterior
          </button>

          {currentStep < steps.length - 1 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-500 text-white hover:bg-brand-600 dark:bg-brand-400 dark:hover:bg-brand-300"
            >
              Siguiente
              <MdChevronRight />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600"
            >
              <MdSave />
              Guardar
            </button>
          )}
        </div>
      </Card>
    </div>
  );
}

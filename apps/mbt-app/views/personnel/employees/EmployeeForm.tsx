"use client";

import React, { useState, useEffect } from "react";
import Card from "@/components/single/card";
import { MdChevronLeft, MdChevronRight, MdSave } from "react-icons/md";
import { useNavigation } from "@/contexts/NavigationContext";
import { apiClient } from "@/utils/api";
import { Employee, EmployeeRole, EmployeeState } from "@/types/auth";

interface EmployeeFormProps {
  mode: 'create' | 'edit';
  employeeId?: string;
  defaultRole?: EmployeeRole;
  onSuccess?: () => void;
}

export default function EmployeeForm({ mode, employeeId, defaultRole, onSuccess }: EmployeeFormProps) {
  const { popView } = useNavigation();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [accessKeyValue, setAccessKeyValue] = useState(''); // Separate state for password
  const [formData, setFormData] = useState<Partial<Employee>>({
    name: '',
    email: '',
    identification: '',
    phone: '',
    emergencyPhone: '',
    photo: '',
    age: undefined,
    birthdate: '',
    role: defaultRole || 'STAFF',
    state: 'WORKING',
    startedOn: '',
    avrgWorkingHours: undefined,
    payAmount: undefined,
    payFrequency: undefined,
    darkMode: false,
    appAccent: null,
    minimized: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (mode === 'edit' && employeeId) {
      fetchEmployee();
    }
  }, [mode, employeeId]);

  const fetchEmployee = async () => {
    if (!employeeId) return;

    try {
      setLoading(true);
      const response = await apiClient.get<Employee>(`/api/v1/employees/${employeeId}`);

      if (response.success && response.data) {
        const employee = response.data;
        setFormData({
          name: employee.name,
          email: employee.email || '',
          identification: employee.identification || '',
          phone: employee.phone || '',
          emergencyPhone: employee.emergencyPhone || '',
          photo: employee.photo || '',
          age: employee.age || undefined,
          birthdate: employee.birthdate ? new Date(employee.birthdate).toISOString().split('T')[0] : '',
          role: employee.role,
          state: employee.state,
          startedOn: employee.startedOn ? new Date(employee.startedOn).toISOString().split('T')[0] : '',
          avrgWorkingHours: employee.avrgWorkingHours || undefined,
          payAmount: employee.payAmount || undefined,
          payFrequency: employee.payFrequency || undefined,
          darkMode: employee.darkMode,
          appAccent: employee.appAccent || null,
          minimized: employee.minimized,
          accessKey: employee.accessKey, // Keep the full object for reference
        });
        // Don't populate accessKeyValue in edit mode (password shouldn't be shown)
        setAccessKeyValue('');
      }
    } catch (err) {
      console.error('Error fetching employee:', err);
      setErrors({ submit: 'Error al cargar empleado' });
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { label: 'Información Personal', fields: ['name', 'identification', 'photo', 'age', 'birthdate'] },
    { label: 'Contacto & Empleo', fields: ['email', 'phone', 'emergencyPhone', 'role', 'state', 'startedOn', 'avrgWorkingHours'] },
    { label: 'Compensación & Preferencias', fields: ['payAmount', 'payFrequency', 'darkMode', 'appAccent', 'minimized'] },
  ];

  const handleInputChange = (field: keyof Employee, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 0) {
      if (!formData.name?.trim()) {
        newErrors.name = 'El nombre es requerido';
      }
      if (formData.age && (formData.age < 18 || formData.age > 100)) {
        newErrors.age = 'La edad debe estar entre 18 y 100 años';
      }
    }

    if (step === 1) {
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Email inválido';
      }
      if (!formData.role) {
        newErrors.role = 'El rol es requerido';
      }
      if (formData.avrgWorkingHours && (formData.avrgWorkingHours < 1 || formData.avrgWorkingHours > 24)) {
        newErrors.avrgWorkingHours = 'Las horas deben estar entre 1 y 24';
      }
    }

    if (step === 2) {
      if (formData.payAmount && formData.payAmount < 0) {
        newErrors.payAmount = 'El monto debe ser positivo';
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

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
	let payload: any = {}; 

    try {
      setLoading(true);
      setErrors({});

      payload = {
        name: formData.name,
        email: formData.email || undefined,
        identification: formData.identification || undefined,
        accessKey: accessKeyValue || undefined, // Use the separate accessKey state
        phone: formData.phone || undefined,
        emergencyPhone: formData.emergencyPhone || undefined,
        photo: formData.photo || undefined,
        age: formData.age || undefined,
        birthdate: formData.birthdate ? new Date(formData.birthdate).toISOString() : undefined,
        role: formData.role,
        state: formData.state,
        startedOn: formData.startedOn ? new Date(formData.startedOn).toISOString() : undefined,
        avrgWorkingHours: formData.avrgWorkingHours || undefined,
        payAmount: formData.payAmount?.toString() || undefined,
        payFrequency: formData.payFrequency || undefined,
        darkMode: formData.darkMode,
        appAccent: formData.appAccent || undefined,
        minimized: formData.minimized,
      };

      if (mode === 'create') {
        await apiClient.post('/api/v1/employees', payload);
      } else if (mode === 'edit' && employeeId) {
        await apiClient.put(`/api/v1/employees/${employeeId}`, payload);
      }

      onSuccess?.();
      popView();
    } catch (error: any) {
      console.error('Error saving employee:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response,
        payload: payload,
      });

      let errorMessage = 'Error al guardar el empleado';

      if (error.message) {
        errorMessage = error.message;
      }

      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
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

  const frequencyOptions = [
    { value: 'HOURLY', label: 'Por hora' },
    { value: 'DAILY', label: 'Diario' },
    { value: 'WEEKLY', label: 'Semanal' },
    { value: 'MONTHLY', label: 'Mensual' },
    { value: 'YEARLY', label: 'Anual' },
  ];

  const accentColors = [
    '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#ef4444',
  ];

  if (loading && mode === 'edit') {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando empleado...</p>
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
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 font-semibold ${
                    index <= currentStep
                      ? 'border-brand-500 bg-brand-500 text-black dark:text-white dark:border-brand-400 dark:bg-brand-400'
                      : 'border-gray-400 bg-gray-100 text-gray-500 dark:border-gray-600 dark:bg-navy-800 dark:text-gray-400'
                  }`}>
                    {index + 1}
                  </div>
                  <p className={`text-xs mt-2 text-center ${
                    index <= currentStep
                      ? 'text-brand-500 font-medium dark:text-brand-400'
                      : 'text-gray-500 dark:text-gray-400'
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
                {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
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

              <div>
                <label className="block text-sm font-semibold text-navy-700 dark:text-white mb-2">
                  URL de Foto
                </label>
                <input
                  type="text"
                  value={formData.photo || ''}
                  onChange={(e) => handleInputChange('photo', e.target.value)}
                  className="w-full rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-navy-800 text-navy-700 dark:text-white px-4 py-3 outline-none focus:border-brand-500 dark:focus:border-brand-400"
                  placeholder="https://ejemplo.com/foto.jpg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-navy-700 dark:text-white mb-2">
                    Edad
                  </label>
                  <input
                    type="number"
                    value={formData.age || ''}
                    onChange={(e) => handleInputChange('age', e.target.value ? parseInt(e.target.value) : undefined)}
                    className={`w-full rounded-lg border-2 ${
                      errors.age ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                    } bg-white dark:bg-navy-800 text-navy-700 dark:text-white px-4 py-3 outline-none focus:border-brand-500 dark:focus:border-brand-400`}
                    placeholder="30"
                    min="18"
                    max="100"
                  />
                  {errors.age && <p className="text-sm text-red-500 mt-1">{errors.age}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-navy-700 dark:text-white mb-2">
                    Fecha de Nacimiento
                  </label>
                  <input
                    type="date"
                    value={formData.birthdate || ''}
                    onChange={(e) => handleInputChange('birthdate', e.target.value)}
                    className="w-full rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-navy-800 text-navy-700 dark:text-white px-4 py-3 outline-none focus:border-brand-500 dark:focus:border-brand-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Contact & Employment */}
          {currentStep === 1 && (
            <div className="space-y-4">
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
                {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-navy-700 dark:text-white mb-2">
                  Clave de Acceso (Password)
                </label>
                <input
                  type="password"
                  value={accessKeyValue}
                  onChange={(e) => setAccessKeyValue(e.target.value)}
                  className={`w-full rounded-lg border-2 ${
                    errors.accessKey ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                  } bg-white dark:bg-navy-800 text-navy-700 dark:text-white px-4 py-3 outline-none focus:border-brand-500 dark:focus:border-brand-400`}
                  placeholder={mode === 'edit' ? 'Dejar en blanco para mantener la actual' : 'Contraseña para acceso al sistema'}
                />
                {errors.accessKey && <p className="text-sm text-red-500 mt-1">{errors.accessKey}</p>}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {mode === 'edit'
                    ? 'Dejar en blanco si no desea cambiar la clave actual'
                    : 'Esta clave permitirá al empleado acceder al sistema'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-navy-700 dark:text-white mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-navy-800 text-navy-700 dark:text-white px-4 py-3 outline-none focus:border-brand-500 dark:focus:border-brand-400"
                    placeholder="809-123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-navy-700 dark:text-white mb-2">
                    Teléfono de Emergencia
                  </label>
                  <input
                    type="tel"
                    value={formData.emergencyPhone || ''}
                    onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                    className="w-full rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-navy-800 text-navy-700 dark:text-white px-4 py-3 outline-none focus:border-brand-500 dark:focus:border-brand-400"
                    placeholder="809-987-6543"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-navy-700 dark:text-white mb-2">
                    Fecha de Inicio
                  </label>
                  <input
                    type="date"
                    value={formData.startedOn || ''}
                    onChange={(e) => handleInputChange('startedOn', e.target.value)}
                    className="w-full rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-navy-800 text-navy-700 dark:text-white px-4 py-3 outline-none focus:border-brand-500 dark:focus:border-brand-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-navy-700 dark:text-white mb-2">
                    Horas de Trabajo Promedio (día)
                  </label>
                  <input
                    type="number"
                    value={formData.avrgWorkingHours || ''}
                    onChange={(e) => handleInputChange('avrgWorkingHours', e.target.value ? parseInt(e.target.value) : undefined)}
                    className={`w-full rounded-lg border-2 ${
                      errors.avrgWorkingHours ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                    } bg-white dark:bg-navy-800 text-navy-700 dark:text-white px-4 py-3 outline-none focus:border-brand-500 dark:focus:border-brand-400`}
                    placeholder="8"
                    min="1"
                    max="24"
                  />
                  {errors.avrgWorkingHours && <p className="text-sm text-red-500 mt-1">{errors.avrgWorkingHours}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Compensation & Preferences */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-navy-700 dark:text-white mb-2">
                    Monto de Pago
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.payAmount || ''}
                    onChange={(e) => handleInputChange('payAmount', e.target.value ? parseFloat(e.target.value) : undefined)}
                    className={`w-full rounded-lg border-2 ${
                      errors.payAmount ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                    } bg-white dark:bg-navy-800 text-navy-700 dark:text-white px-4 py-3 outline-none focus:border-brand-500 dark:focus:border-brand-400`}
                    placeholder="0.00"
                    min="0"
                  />
                  {errors.payAmount && <p className="text-sm text-red-500 mt-1">{errors.payAmount}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-navy-700 dark:text-white mb-2">
                    Frecuencia de Pago
                  </label>
                  <select
                    value={formData.payFrequency || ''}
                    onChange={(e) => handleInputChange('payFrequency', e.target.value || undefined)}
                    className="w-full rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-navy-800 text-navy-700 dark:text-white px-4 py-3 outline-none focus:border-brand-500 dark:focus:border-brand-400"
                  >
                    <option value="">Seleccionar...</option>
                    {frequencyOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
	      
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="text-sm font-semibold text-navy-700 dark:text-white mb-4">
                  Preferencias de Aplicación
                </h3>

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
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-navy-700 dark:text-white hover:bg-gray-100 dark:hover:bg-navy-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <MdChevronLeft />
            Anterior
          </button>

          {currentStep < steps.length - 1 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-500 text-black hover:bg-brand-600 dark:text-white dark:bg-brand-400 dark:hover:bg-brand-300 cursor-pointer"
            >
              Siguiente
              <MdChevronRight />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
          )}
        </div>
      </Card>
    </div>
  );
}

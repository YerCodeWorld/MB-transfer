"use client";

import React, { useState, useEffect } from "react";
import Card from "@/components/single/card";
import { MdAdd, MdDelete, MdSave } from "react-icons/md";
import { useNavigation } from "@/contexts/NavigationContext";
import { apiClient } from "@/utils/api";
import { AccountType, Employee, EmployeeState } from "@/types/auth";

interface DriverFormProps {
  mode: 'create' | 'edit';
  driverId?: string;
  onSuccess?: () => void;
}

export default function DriverForm({ mode, driverId, onSuccess }: DriverFormProps) {
  const { popView } = useNavigation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Employee>>({
    name: '',
    phone: '',
    photo: '',
    idNumber: '',
    state: 'WORKING',
    role: 'DRIVER',
  });
  const [bankAccounts, setBankAccounts] = useState<Array<{
    bank: string;
    accountNumber: string;
    accountType?: AccountType;
  }>>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (mode === 'edit' && driverId) {
      fetchDriver();
    }
  }, [mode, driverId]);

  const fetchDriver = async () => {
    if (!driverId) return;

    try {
      setLoading(true);
      const response = await apiClient.get<Employee>(`/api/v1/employees/${driverId}`);

      if (response.success && response.data) {
        const driver = response.data;
        setFormData({
          name: driver.name,
          phone: driver.phone || '',
          photo: driver.photo || '',
          idNumber: driver.idNumber || '',
          state: driver.state,
          role: 'DRIVER',
        });
        setBankAccounts(
          driver.bankAccounts?.length
            ? driver.bankAccounts.map((account) => ({
                bank: account.bank,
                accountNumber: account.accountNumber,
                accountType: account.accountType,
              }))
            : [{
                bank: driver.bank || '',
                accountNumber: driver.accountNumber || '',
                accountType: driver.accountType || undefined,
              }].filter((account) => account.bank || account.accountNumber || account.accountType)
        );
      }
    } catch (err) {
      console.error('Error fetching driver:', err);
      setErrors({ submit: 'Error al cargar conductor' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof Employee, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };
  const handleBankAccountChange = (
    index: number,
    field: 'bank' | 'accountNumber' | 'accountType',
    value: string | AccountType | undefined
  ) => {
    setBankAccounts((prev) =>
      prev.map((account, accountIndex) =>
        accountIndex === index ? { ...account, [field]: value } : account
      )
    );
  };
  const addBankAccount = () => {
    setBankAccounts((prev) => [...prev, { bank: '', accountNumber: '', accountType: undefined }]);
  };
  const removeBankAccount = (index: number) => {
    setBankAccounts((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setLoading(true);
      setErrors({});

      const payload: any = {
        name: formData.name,
        phone: formData.phone || undefined,
        photo: formData.photo || undefined,
        idNumber: formData.idNumber || undefined,
        bankAccounts: bankAccounts
          .filter((account) => account.bank.trim() && account.accountNumber.trim() && account.accountType)
          .map((account) => ({
            bank: account.bank.trim(),
            accountNumber: account.accountNumber.trim(),
            accountType: account.accountType,
          })),
        state: formData.state,
        role: 'DRIVER',
      };

      if (mode === 'create') {
        await apiClient.post('/api/v1/employees', payload);
      } else if (mode === 'edit' && driverId) {
        await apiClient.put(`/api/v1/employees/${driverId}`, payload);
      }

      onSuccess?.();
      popView();
    } catch (error: any) {
      console.error('Error saving driver:', error);
      setErrors({ submit: error.message || 'Error al guardar el conductor' });
    } finally {
      setLoading(false);
    }
  };

  const stateOptions: { value: EmployeeState; label: string }[] = [
    { value: 'WORKING', label: 'Activo' },
    { value: 'SUSPENDED', label: 'Suspendido' },
    { value: 'FIRED', label: 'Despedido' },
  ];
  const accountTypeOptions: { value: AccountType; label: string }[] = [
    { value: 'AHORROS', label: 'Ahorros' },
    { value: 'CORRIENTE', label: 'Corriente' },
  ];

  if (loading && mode === 'edit') {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando conductor...</p>
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
            {mode === 'create' ? 'Nuevo Conductor' : 'Editar Conductor'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {mode === 'create'
              ? 'Complete la información para agregar un nuevo conductor'
              : 'Actualice la información del conductor'
            }
          </p>
        </div>

        {/* Form */}
        <div className="space-y-6">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-navy-700 dark:text-white mb-2">
                Número de ID
              </label>
              <input
                type="text"
                value={formData.idNumber || ''}
                onChange={(e) => handleInputChange('idNumber', e.target.value)}
                className="w-full rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-navy-800 text-navy-700 dark:text-white px-4 py-3 outline-none focus:border-brand-500 dark:focus:border-brand-400"
                placeholder="Ej: A001234567"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-semibold text-navy-700 dark:text-white">
                Cuentas Bancarias
              </label>
              <button
                type="button"
                onClick={addBankAccount}
                className="flex items-center gap-2 rounded-lg border border-brand-500 bg-brand-500 px-3 py-2 text-sm font-semibold text-black hover:bg-brand-600 dark:text-white"
              >
                <MdAdd />
                Agregar cuenta
              </button>
            </div>

            {bankAccounts.map((account, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div>
                  <label className="block text-sm font-semibold text-navy-700 dark:text-white mb-2">
                    Banco
                  </label>
                  <input
                    type="text"
                    value={account.bank}
                    onChange={(e) => handleBankAccountChange(index, 'bank', e.target.value)}
                    className="w-full rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-navy-800 text-navy-700 dark:text-white px-4 py-3 outline-none focus:border-brand-500 dark:focus:border-brand-400"
                    placeholder="Ej: Banreservas"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-navy-700 dark:text-white mb-2">
                    Número de Cuenta
                  </label>
                  <input
                    type="text"
                    value={account.accountNumber}
                    onChange={(e) => handleBankAccountChange(index, 'accountNumber', e.target.value)}
                    className="w-full rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-navy-800 text-navy-700 dark:text-white px-4 py-3 outline-none focus:border-brand-500 dark:focus:border-brand-400"
                    placeholder="Ej: 1234567890"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-navy-700 dark:text-white mb-2">
                    Tipo de Cuenta
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      value={account.accountType || ''}
                      onChange={(e) => handleBankAccountChange(index, 'accountType', (e.target.value as AccountType) || undefined)}
                      className="w-full rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-navy-800 text-navy-700 dark:text-white px-4 py-3 outline-none focus:border-brand-500 dark:focus:border-brand-400"
                    >
                      <option value="">Seleccionar...</option>
                      {accountTypeOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => removeBankAccount(index)}
                      className="rounded-lg bg-red-500 p-3 text-white hover:bg-red-600"
                    >
                      <MdDelete />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {bankAccounts.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                No hay cuentas agregadas.
              </p>
            )}
          </div>

          {errors.submit && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400">{errors.submit}</p>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
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
      </Card>
    </div>
  );
}

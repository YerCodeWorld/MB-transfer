"use client";

import React, { useState, useEffect } from "react";
import Card from "@/components/single/card";
import {
  MdEdit, MdPerson, MdEmail, MdBadge, MdWork, MdCircle,
  MdPhone, MdEmergencyShare, MdCake, MdCalendarToday,
  MdAccessTime, MdAttachMoney, MdDelete
} from "react-icons/md";
import { useNavigation } from "@/contexts/NavigationContext";
import { apiClient } from "@/utils/api";
import { Employee, EmployeeRole, EmployeeState } from "@/types/auth";
import EmployeeForm from "./EmployeeForm";

interface EmployeeDetailProps {
  employeeId: string;
  onUpdate?: () => void;
}

export default function EmployeeDetail({ employeeId, onUpdate }: EmployeeDetailProps) {
  const { pushView, popView } = useNavigation();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEmployee();
  }, [employeeId]);

  const fetchEmployee = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<Employee>(`/api/v1/employees/${employeeId}`);

      if (response.success && response.data) {
        setEmployee(response.data);
      }
    } catch (err) {
      console.error('Error fetching employee:', err);
      setError('Error al cargar empleado');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (!employee) return;

    pushView({
      id: `employee-edit-${employee.id}`,
      label: `Editar ${employee.name}`,
      component: EmployeeForm,
      data: {
        mode: 'edit',
        employeeId: employee.id,
        onSuccess: () => {
          fetchEmployee();
          onUpdate?.();
        }
      },
    });
  };

  const handleDelete = async () => {
    if (!employee) return;

    const confirmed = window.confirm(`¿Está seguro que desea eliminar a ${employee.name}? Esta acción no se puede deshacer.`);
    if (!confirmed) return;

    try {
      await apiClient.delete(`/api/v1/employees/${employee.id}`);
      onUpdate?.();
      popView();
    } catch (err) {
      console.error('Error deleting employee:', err);
      alert('Error al eliminar empleado');
    }
  };

  const roleLabels: Record<EmployeeRole, string> = {
    ADMINISTRATOR: 'Administrador',
    DEVELOPER: 'Desarrollador',
    MANAGER: 'Gerente',
    COORDINATOR: 'Coordinador',
    DRIVER: 'Conductor',
    STAFF: 'Personal',
  };

  const stateLabels: Record<EmployeeState, string> = {
    WORKING: 'Activo',
    SUSPENDED: 'Suspendido',
    FIRED: 'Despedido',
  };

  const stateColors: Record<EmployeeState, string> = {
    WORKING: 'text-green-600 dark:text-green-400',
    SUSPENDED: 'text-orange-600 dark:text-orange-400',
    FIRED: 'text-red-600 dark:text-red-400',
  };

  const frequencyLabels = {
    HOURLY: 'Por hora',
    DAILY: 'Diario',
    WEEKLY: 'Semanal',
    MONTHLY: 'Mensual',
    YEARLY: 'Anual',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando empleado...</p>
        </div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <Card extra="p-8">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400">
            {error || 'Empleado no encontrado'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {error ? 'No se pudo cargar la información del empleado' : `No se pudo encontrar el empleado con ID: ${employeeId}`}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full h-full pb-24 px-4">
      {/* Header Card */}
      <Card extra="p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-600 dark:from-brand-400 dark:to-brand-500 overflow-hidden">
              {employee.photo ? (
                <img
                  src={employee.photo}
                  alt={employee.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-3xl font-bold text-white">
                  {employee.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            {/* Name and Role */}
            <div>
              <h1 className="text-2xl font-bold text-navy-700 dark:text-white">
                {employee.name}
              </h1>
              <p className="text-base text-gray-600 dark:text-gray-400 mt-1">
                {roleLabels[employee.role]}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <MdCircle className={`text-sm ${stateColors[employee.state]}`} />
                <span className={`text-sm font-medium ${stateColors[employee.state]}`}>
                  {stateLabels[employee.state]}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 active:bg-red-700"
            >
              <MdDelete />
              Eliminar
            </button>
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:hover:bg-brand-300"
            >
              <MdEdit />
              Editar
            </button>
          </div>
        </div>
      </Card>

      {/* Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card extra="p-6">
          <h2 className="text-lg font-bold text-navy-700 dark:text-white mb-4">
            Información Personal
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <MdPerson className="text-xl text-gray-600 dark:text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Nombre Completo</p>
                <p className="font-medium text-navy-700 dark:text-white">{employee.name}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MdBadge className="text-xl text-gray-600 dark:text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Identificación</p>
                <p className="font-medium text-navy-700 dark:text-white">
                  {employee.identification || <span className="text-gray-400 italic">No registrada</span>}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MdBadge className="text-xl text-gray-600 dark:text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Clave de Acceso</p>
                <p className="font-medium text-navy-700 dark:text-white">
                  {employee.accessKey?.key ? '••••••••' : <span className="text-gray-400 italic">No configurada</span>}
                </p>
              </div>
            </div>

            {employee.age && (
              <div className="flex items-start gap-3">
                <MdCake className="text-xl text-gray-600 dark:text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Edad</p>
                  <p className="font-medium text-navy-700 dark:text-white">{employee.age} años</p>
                </div>
              </div>
            )}

            {employee.birthdate && (
              <div className="flex items-start gap-3">
                <MdCalendarToday className="text-xl text-gray-600 dark:text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Fecha de Nacimiento</p>
                  <p className="font-medium text-navy-700 dark:text-white">
                    {new Date(employee.birthdate).toLocaleDateString('es-DO', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Contact Information */}
        <Card extra="p-6">
          <h2 className="text-lg font-bold text-navy-700 dark:text-white mb-4">
            Información de Contacto
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <MdEmail className="text-xl text-gray-600 dark:text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Correo Electrónico</p>
                <p className="font-medium text-navy-700 dark:text-white">
                  {employee.email || <span className="text-gray-400 italic">No registrado</span>}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MdPhone className="text-xl text-gray-600 dark:text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Teléfono</p>
                <p className="font-medium text-navy-700 dark:text-white">
                  {employee.phone || <span className="text-gray-400 italic">No registrado</span>}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MdEmergencyShare className="text-xl text-gray-600 dark:text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Teléfono de Emergencia</p>
                <p className="font-medium text-navy-700 dark:text-white">
                  {employee.emergencyPhone || <span className="text-gray-400 italic">No registrado</span>}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Employment Information */}
        <Card extra="p-6">
          <h2 className="text-lg font-bold text-navy-700 dark:text-white mb-4">
            Información Laboral
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <MdWork className="text-xl text-gray-600 dark:text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Rol</p>
                <p className="font-medium text-navy-700 dark:text-white">
                  {roleLabels[employee.role]}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MdCircle className={`text-xl ${stateColors[employee.state]} mt-1`} />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Estado</p>
                <p className={`font-medium ${stateColors[employee.state]}`}>
                  {stateLabels[employee.state]}
                </p>
              </div>
            </div>

            {employee.startedOn && (
              <div className="flex items-start gap-3">
                <MdCalendarToday className="text-xl text-gray-600 dark:text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Fecha de Inicio</p>
                  <p className="font-medium text-navy-700 dark:text-white">
                    {new Date(employee.startedOn).toLocaleDateString('es-DO', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            )}

            {employee.avrgWorkingHours && (
              <div className="flex items-start gap-3">
                <MdAccessTime className="text-xl text-gray-600 dark:text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Horas de Trabajo Promedio</p>
                  <p className="font-medium text-navy-700 dark:text-white">
                    {employee.avrgWorkingHours} horas/día
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Compensation */}
        {(employee.payAmount || employee.payFrequency) && (
          <Card extra="p-6">
            <h2 className="text-lg font-bold text-navy-700 dark:text-white mb-4">
              Compensación
            </h2>
            <div className="space-y-4">
              {employee.payAmount && (
                <div className="flex items-start gap-3">
                  <MdAttachMoney className="text-xl text-gray-600 dark:text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Monto de Pago</p>
                    <p className="font-medium text-navy-700 dark:text-white">
                      ${Number(employee.payAmount).toLocaleString('es-DO', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              )}

              {employee.payFrequency && (
                <div className="flex items-start gap-3">
                  <MdCalendarToday className="text-xl text-gray-600 dark:text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Frecuencia de Pago</p>
                    <p className="font-medium text-navy-700 dark:text-white">
                      {frequencyLabels[employee.payFrequency as keyof typeof frequencyLabels]}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* App Preferences */}
        <Card extra="p-6">
          <h2 className="text-lg font-bold text-navy-700 dark:text-white mb-4">
            Preferencias de Aplicación
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Modo Oscuro</p>
              <p className="font-medium text-navy-700 dark:text-white">
                {employee.darkMode ? 'Activado' : 'Desactivado'}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Color de Acento</p>
              <div className="flex items-center gap-2 mt-1">
                {employee.appAccent ? (
                  <>
                    <div
                      className="w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-600"
                      style={{ backgroundColor: employee.appAccent }}
                    />
                    <span className="font-medium text-navy-700 dark:text-white">
                      {employee.appAccent}
                    </span>
                  </>
                ) : (
                  <span className="text-gray-400 italic">No configurado</span>
                )}
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Vista Minimizada</p>
              <p className="font-medium text-navy-700 dark:text-white">
                {employee.minimized ? 'Sí' : 'No'}
              </p>
            </div>
          </div>
        </Card>

        {/* System Information */}
        <Card extra="p-6">
          <h2 className="text-lg font-bold text-navy-700 dark:text-white mb-4">
            Información del Sistema
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">ID del Sistema</p>
              <p className="font-mono text-sm font-medium text-navy-700 dark:text-white">
                {employee.id}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Creado</p>
              <p className="text-sm font-medium text-navy-700 dark:text-white">
                {new Date(employee.createdAt).toLocaleDateString('es-DO', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Última Actualización</p>
              <p className="text-sm font-medium text-navy-700 dark:text-white">
                {new Date(employee.updatedAt).toLocaleDateString('es-DO', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Card from "@/components/single/card";
import { MdEdit, MdPerson, MdPhone, MdCircle, MdLocalShipping, MdDelete } from "react-icons/md";
import { useNavigation } from "@/contexts/NavigationContext";
import { apiClient } from "@/utils/api";
import { Employee, EmployeeState } from "@/types/auth";
import DriverForm from "./DriverForm";

interface DriverDetailProps {
  driverId: string;
  onUpdate?: () => void;
}

export default function DriverDetail({ driverId, onUpdate }: DriverDetailProps) {
  const { pushView, popView } = useNavigation();
  const [driver, setDriver] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDriver();
  }, [driverId]);

  const fetchDriver = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<Employee>(`/api/v1/employees/${driverId}`);

      if (response.success && response.data) {
        setDriver(response.data);
      }
    } catch (err) {
      console.error('Error fetching driver:', err);
      setError('Error al cargar conductor');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (!driver) return;

    pushView({
      id: `driver-edit-${driver.id}`,
      label: `Editar ${driver.name}`,
      component: DriverForm,
      data: {
        mode: 'edit',
        driverId: driver.id,
        onSuccess: () => {
          fetchDriver();
          onUpdate?.();
        }
      },
    });
  };

  const handleDelete = async () => {
    if (!driver) return;

    const confirmed = window.confirm(
      `¿Está seguro que desea eliminar a ${driver.name}? Esta acción no se puede deshacer.`
    );

    if (!confirmed) return;

    try {
      await apiClient.delete(`/api/v1/employees/${driver.id}`);
      onUpdate?.();
      popView();
    } catch (err) {
      console.error('Error deleting driver:', err);
      alert('Error al eliminar conductor');
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando conductor...</p>
        </div>
      </div>
    );
  }

  if (error || !driver) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <Card extra="p-8">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400">
            {error || 'Conductor no encontrado'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {error ? 'No se pudo cargar la información del conductor' : `No se pudo encontrar el conductor con ID: ${driverId}`}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full h-full pb-24 px-4">
      {/* Header Card */}
      <Card extra="p-6 mb-6 !rounded-md !shadow-[0_14px_35px_rgba(15,23,42,0.14)] border border-gray-200 dark:border-white/10">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative flex h-20 w-20 items-center justify-center rounded-md bg-gradient-to-br from-accent-500 to-accent-700 dark:from-accent-400 dark:to-accent-600 overflow-hidden">
              {driver.photo ? (
                <img
                  src={driver.photo}
                  alt={driver.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <MdLocalShipping className="text-3xl text-white" />
              )}
              <div className="absolute -left-2 top-2 h-10 w-1 bg-accent-500" />
            </div>

            {/* Name and Status */}
            <div>
              <h1 className="text-2xl font-bold text-navy-700 dark:text-white">
                {driver.name}
              </h1>
              <p className="text-base text-gray-600 dark:text-gray-400 mt-1">
                Conductor
              </p>
              <div className="flex items-center gap-2 mt-2">
                <MdCircle className={`text-sm ${stateColors[driver.state]}`} />
                <span className={`text-sm font-medium ${stateColors[driver.state]}`}>
                  {stateLabels[driver.state]}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:hover:bg-brand-300"
            >
              <MdEdit />
              Editar
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 active:bg-red-700"
            >
              <MdDelete />
              Eliminar
            </button>
          </div>
        </div>
      </Card>

      {/* Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card extra="p-6 !rounded-md border border-gray-200 dark:border-white/10">
          <h2 className="text-lg font-bold text-navy-700 dark:text-white mb-4">
            Información Básica
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <MdPerson className="text-xl text-gray-600 dark:text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Nombre</p>
                <p className="font-medium text-navy-700 dark:text-white">{driver.name}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MdPhone className="text-xl text-gray-600 dark:text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Teléfono</p>
                <p className="font-medium text-navy-700 dark:text-white">
                  {driver.phone || <span className="text-gray-400 italic">No registrado</span>}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MdCircle className={`text-xl ${stateColors[driver.state]} mt-1`} />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Estado</p>
                <p className={`font-medium ${stateColors[driver.state]}`}>
                  {stateLabels[driver.state]}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* System Information */}
        <Card extra="p-6 !rounded-md border border-gray-200 dark:border-white/10">
          <h2 className="text-lg font-bold text-navy-700 dark:text-white mb-4">
            Información del Sistema
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">ID del Sistema</p>
              <p className="font-mono text-sm font-medium text-navy-700 dark:text-white">
                {driver.id}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Creado</p>
              <p className="text-sm font-medium text-navy-700 dark:text-white">
                {new Date(driver.createdAt).toLocaleDateString('es-DO', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Última Actualización</p>
              <p className="text-sm font-medium text-navy-700 dark:text-white">
                {new Date(driver.updatedAt).toLocaleDateString('es-DO', {
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

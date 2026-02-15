"use client";

import React from "react";
import Card from "@/components/single/card";
import { MdEdit, MdBusiness, MdPerson, MdEmail, MdPhone, MdLocationOn, MdBadge, MdDirectionsCar, MdCircle, MdCalendarToday } from "react-icons/md";
import { useNavigation } from "@/contexts/NavigationContext";
import { getAllyById } from "./mockAllies";
import { Ally, AllyType, AllyStatus } from "@/types/personnel";
import AllyForm from "./AllyForm";

interface AllyDetailProps {
  allyId: string;
}

export default function AllyDetail({ allyId }: AllyDetailProps) {
  const { pushView } = useNavigation();
  const ally = getAllyById(allyId);

  if (!ally) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <Card extra="p-8">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400">
            Aliado no encontrado
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            No se pudo encontrar el aliado con ID: {allyId}
          </p>
        </Card>
      </div>
    );
  }

  const handleEdit = () => {
    pushView({
      id: `ally-edit-${ally.id}`,
      label: `Editar ${ally.name}`,
      component: AllyForm,
      data: { mode: 'edit', allyId: ally.id },
    });
  };

  const typeLabels: Record<AllyType, string> = {
    COMPANY: 'Empresa',
    INDIVIDUAL: 'Individual',
  };

  const statusLabels: Record<AllyStatus, string> = {
    ACTIVE: 'Activo',
    INACTIVE: 'Inactivo',
    SUSPENDED: 'Suspendido',
  };

  const statusColors: Record<AllyStatus, string> = {
    ACTIVE: 'text-green-600 dark:text-green-400',
    INACTIVE: 'text-gray-600 dark:text-gray-400',
    SUSPENDED: 'text-orange-600 dark:text-orange-400',
  };

  return (
    <div className="w-full h-full pb-24 px-4">
      {/* Header Card */}
      <Card extra="p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {/* Icon */}
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-600 dark:from-brand-400 dark:to-brand-500">
              {ally.type === 'COMPANY' ? (
                <MdBusiness className="text-4xl text-white" />
              ) : (
                <MdPerson className="text-4xl text-white" />
              )}
            </div>

            {/* Name and Type */}
            <div>
              <h1 className="text-2xl font-bold text-navy-700 dark:text-white">
                {ally.name}
              </h1>
              <p className="text-base text-gray-600 dark:text-gray-400 mt-1">
                {typeLabels[ally.type]}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <MdCircle className={`text-sm ${statusColors[ally.status]}`} />
                <span className={`text-sm font-medium ${statusColors[ally.status]}`}>
                  {statusLabels[ally.status]}
                </span>
              </div>
            </div>
          </div>

          {/* Edit Button */}
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:hover:bg-brand-300"
          >
            <MdEdit />
            Editar
          </button>
        </div>
      </Card>

      {/* Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  {ally.email || <span className="text-gray-400 italic">No registrado</span>}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MdPhone className="text-xl text-gray-600 dark:text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Teléfono</p>
                <p className="font-medium text-navy-700 dark:text-white">
                  {ally.phone || <span className="text-gray-400 italic">No registrado</span>}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MdLocationOn className="text-xl text-gray-600 dark:text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Dirección</p>
                <p className="font-medium text-navy-700 dark:text-white">
                  {ally.address || <span className="text-gray-400 italic">No registrada</span>}
                </p>
              </div>
            </div>

            {ally.type === 'COMPANY' && ally.contactPerson && (
              <div className="flex items-start gap-3">
                <MdPerson className="text-xl text-gray-600 dark:text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Persona de Contacto</p>
                  <p className="font-medium text-navy-700 dark:text-white">{ally.contactPerson}</p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Business Information */}
        <Card extra="p-6">
          <h2 className="text-lg font-bold text-navy-700 dark:text-white mb-4">
            Información del Negocio
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <MdBadge className="text-xl text-gray-600 dark:text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {ally.type === 'COMPANY' ? 'RNC' : 'Identificación'}
                </p>
                <p className="font-medium text-navy-700 dark:text-white">
                  {ally.identification || <span className="text-gray-400 italic">No registrada</span>}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MdDirectionsCar className="text-xl text-gray-600 dark:text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Vehículos Registrados</p>
                <p className="font-medium text-navy-700 dark:text-white">{ally.vehiclesCount}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MdCircle className={`text-xl ${statusColors[ally.status]} mt-1`} />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Estado</p>
                <p className={`font-medium ${statusColors[ally.status]}`}>
                  {statusLabels[ally.status]}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MdCalendarToday className="text-xl text-gray-600 dark:text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Fecha de Registro</p>
                <p className="font-medium text-navy-700 dark:text-white">
                  {new Date(ally.createdAt).toLocaleDateString('es-DO', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Notes */}
        {ally.notes && (
          <Card extra="p-6 md:col-span-2">
            <h2 className="text-lg font-bold text-navy-700 dark:text-white mb-4">
              Notas
            </h2>
            <p className="text-navy-700 dark:text-white whitespace-pre-wrap">
              {ally.notes}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}

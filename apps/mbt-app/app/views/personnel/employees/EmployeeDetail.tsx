"use client";

import React from "react";
import Card from "@/components/single/card";
import { MdEdit, MdPerson, MdEmail, MdBadge, MdWork, MdCircle } from "react-icons/md";
import { useNavigation } from "@/contexts/NavigationContext";
import { getEmployeeById } from "./mockEmployees";
import { Employee, EmployeeRole, EmployeeState } from "@/types/auth";
import EmployeeForm from "./EmployeeForm";

interface EmployeeDetailProps {
  employeeId: string;
}

export default function EmployeeDetail({ employeeId }: EmployeeDetailProps) {
  const { pushView } = useNavigation();
  const employee = getEmployeeById(employeeId);

  if (!employee) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <Card extra="p-8">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400">
            Empleado no encontrado
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            No se pudo encontrar el empleado con ID: {employeeId}
          </p>
        </Card>
      </div>
    );
  }

  const handleEdit = () => {
    pushView({
      id: `employee-edit-${employee.id}`,
      label: `Editar ${employee.name}`,
      component: EmployeeForm,
      data: { mode: 'edit', employeeId: employee.id },
    });
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
              <MdEmail className="text-xl text-gray-600 dark:text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Correo Electrónico</p>
                <p className="font-medium text-navy-700 dark:text-white">
                  {employee.email || <span className="text-gray-400 italic">No registrado</span>}
                </p>
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
          </div>
        </Card>

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

        {/* Additional Information */}
        <Card extra="p-6">
          <h2 className="text-lg font-bold text-navy-700 dark:text-white mb-4">
            Información Adicional
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">ID del Sistema</p>
              <p className="font-mono text-sm font-medium text-navy-700 dark:text-white">
                {employee.id}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

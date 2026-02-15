"use client";

import React, { useState, useEffect } from "react";
import Card from "@/components/single/card";
import { FiSearch } from "react-icons/fi";
import { MdAdd, MdPerson, MdEmail, MdPhone, MdCircle } from "react-icons/md";
import { useNavigation } from "@/contexts/NavigationContext";
import { apiClient } from "@/utils/api";
import { Employee, EmployeeRole, EmployeeState } from "@/types/auth";
import EmployeeDetail from "./EmployeeDetail";
import EmployeeForm from "./EmployeeForm";

export default function EmployeesGrid() {
  console.log('🔥 NEW EmployeesGrid component loaded!');
  const { pushView } = useNavigation();
  const [searchQuery, setSearchQuery] = useState("");
  const [employeesData, setEmployeesData] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch employees from API
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<Employee[]>('/api/v1/employees?limit=100');

      if (response.success && response.data) {
        // Filter out drivers (drivers have their own tab)
        const nonDrivers = response.data.filter((emp: Employee) => emp.role !== 'DRIVER');
        setEmployeesData(nonDrivers);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError('Error al cargar empleados');
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employeesData.filter(employee =>
    employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.identification?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewEmployee = (employee: Employee) => {
    pushView({
      id: `employee-detail-${employee.id}`,
      label: employee.name,
      component: EmployeeDetail,
      data: { employeeId: employee.id, onUpdate: fetchEmployees },
    });
  };

  const handleCreateEmployee = () => {
    pushView({
      id: 'employee-create',
      label: 'Nuevo Empleado',
      component: EmployeeForm,
      data: { mode: 'create', onSuccess: fetchEmployees },
    });
  };

  const getRoleLabel = (role: EmployeeRole) => {
    const labels: Record<EmployeeRole, string> = {
      ADMINISTRATOR: 'Administrador',
      DEVELOPER: 'Desarrollador',
      MANAGER: 'Gerente',
      COORDINATOR: 'Coordinador',
      DRIVER: 'Conductor',
      STAFF: 'Personal',
    };
    return labels[role];
  };

  const getStateColor = (state: EmployeeState) => {
    const colors: Record<EmployeeState, string> = {
      WORKING: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      SUSPENDED: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      FIRED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return colors[state];
  };

  const getStateLabel = (state: EmployeeState) => {
    const labels: Record<EmployeeState, string> = {
      WORKING: 'Activo',
      SUSPENDED: 'Suspendido',
      FIRED: 'Despedido',
    };
    return labels[state];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando empleados...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <Card extra="p-8">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">
            Error
          </h2>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
          <button
            onClick={fetchEmployees}
            className="mt-4 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
          >
            Reintentar
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full h-full px-4">
      {/* Search and Add Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex h-[38px] w-full max-w-[400px] flex-grow items-center rounded-xl bg-gray-100 text-sm text-gray-700 dark:!bg-navy-900 dark:text-white gap-2 p-2 border border-gray-300 dark:border-gray-700">
          <FiSearch className="text-gray-500 dark:text-gray-400" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            type="text"
            placeholder="Buscar..."
            className="block w-full rounded-full bg-gray-100 text-base text-navy-700 placeholder:text-gray-500 outline-none dark:!bg-navy-900 dark:text-white dark:placeholder:text-gray-400"
          />
        </div>
        <button
          onClick={handleCreateEmployee}
          className="ml-4 flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-black dark:text-white hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:hover:bg-brand-300 cursor-pointer"
        >
          <MdAdd className="text-lg" />
          Nuevo
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24">
        {filteredEmployees.map((employee) => (
          <Card
            key={employee.id}
            extra="p-6 cursor-pointer hover:shadow-xl transition-shadow"
            onClick={() => handleViewEmployee(employee)}
          >
	   <div className="flex gap-6">
            {/* Header with avatar and status */}
            <div className="flex-column h-full">
              <div className="flex h-14 w-14 items-center justify-center bg-gradient-to-br from-brand-500 to-brand-600 dark:from-brand-400 dark:to-brand-500 overflow-hidden">
                {employee.photo ? (
                  <img
                    src={employee.photo}
                    alt={employee.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-xl font-bold text-white">
                    {employee.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStateColor(employee.state)}`}>
                {getStateLabel(employee.state)}
              </span>
            </div>

            {/* Name and Role */}
            <div className="flex-column">
            <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-1 truncate">
              {employee.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {getRoleLabel(employee.role)}
            </p>

            {/* Contact Info */}
            <div className="space-y-2">
              {employee.email && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <MdEmail className="text-base flex-shrink-0" />
                  <span className="truncate">{employee.email}</span>
                </div>
              )}
              {employee.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <MdPhone className="text-base flex-shrink-0" />
                  <span>{employee.phone}</span>
                </div>
              )}
              {employee.identification && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <MdPerson className="text-base flex-shrink-0" />
                  <span className="truncate">{employee.identification}</span>
                </div>
              )}
            </div>
	    </div>
	   </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredEmployees.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <MdPerson className="text-6xl text-gray-300 dark:text-gray-700 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            {searchQuery ? 'No se encontraron empleados' : 'No hay empleados registrados'}
          </p>
          {!searchQuery && (
            <button
              onClick={handleCreateEmployee}
              className="mt-4 flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
            >
              <MdAdd />
              Agregar Primer Empleado
            </button>
          )}
        </div>
      )}
    </div>
  );
}

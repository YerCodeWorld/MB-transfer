"use client";

import React, { useState, useEffect } from "react";
import Card from "@/components/single/card";
import { FiSearch } from "react-icons/fi";
import { MdAdd, MdLocalShipping, MdPhone, MdCircle } from "react-icons/md";
import { useNavigation } from "@/contexts/NavigationContext";
import { apiClient } from "@/utils/api";
import { Employee, EmployeeState } from "@/types/auth";
import DriverDetail from "./DriverDetail";
import DriverForm from "./DriverForm";

export default function DriversGrid() {
  const { pushView } = useNavigation();
  const [searchQuery, setSearchQuery] = useState("");
  const [driversData, setDriversData] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<Employee[]>('/api/v1/employees?role=DRIVER&limit=100');

      if (response.success && response.data) {
        setDriversData(response.data);
      }
    } catch (err) {
      console.error('Error fetching drivers:', err);
      setError('Error al cargar conductores');
    } finally {
      setLoading(false);
    }
  };

  const filteredDrivers = driversData.filter(driver =>
    driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    driver.phone?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewDriver = (driver: Employee) => {
    pushView({
      id: `driver-detail-${driver.id}`,
      label: driver.name,
      component: DriverDetail,
      data: { driverId: driver.id, onUpdate: fetchDrivers },
    });
  };

  const handleCreateDriver = () => {
    pushView({
      id: 'driver-create',
      label: 'Nuevo Conductor',
      component: DriverForm,
      data: { mode: 'create', onSuccess: fetchDrivers },
    });
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
          <p className="text-gray-600 dark:text-gray-400">Cargando conductores...</p>
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
            onClick={fetchDrivers}
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
            placeholder="Buscar conductor..."
            className="block w-full rounded-full bg-gray-100 text-base text-navy-700 placeholder:text-gray-500 outline-none dark:!bg-navy-900 dark:text-white dark:placeholder:text-gray-400"
          />
        </div>
        <button
          onClick={handleCreateDriver}
          className="ml-4 flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-brand hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:hover:bg-brand-300 cursor-pointer"
        >
          <MdAdd className="text-lg" />
          Nuevo
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24">
        {filteredDrivers.map((driver) => (
          <Card
            key={driver.id}
            extra="p-6 cursor-pointer hover:shadow-xl transition-shadow"
            onClick={() => handleViewDriver(driver)}
          >
            {/* Header with avatar and status */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-600 dark:from-brand-400 dark:to-brand-500 overflow-hidden">
                {driver.photo ? (
                  <img
                    src={driver.photo}
                    alt={driver.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <MdLocalShipping className="text-2xl text-white" />
                )}
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStateColor(driver.state)}`}>
                {getStateLabel(driver.state)}
              </span>
            </div>

            {/* Name */}
            <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-1">
              {driver.name}
            </h3>

            {/* Phone */}
            {driver.phone && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-2">
                <MdPhone className="text-base flex-shrink-0" />
                <span>{driver.phone}</span>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredDrivers.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <MdLocalShipping className="text-6xl text-gray-300 dark:text-gray-700 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            {searchQuery ? 'No se encontraron conductores' : 'No hay conductores registrados'}
          </p>
          {!searchQuery && (
            <button
              onClick={handleCreateDriver}
              className="mt-4 flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
            >
              <MdAdd />
              Agregar Primer Conductor
            </button>
          )}
        </div>
      )}
    </div>
  );
}

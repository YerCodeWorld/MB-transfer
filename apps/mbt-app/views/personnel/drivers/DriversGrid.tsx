"use client";

import React, { useState, useEffect } from "react";
import Card from "@/components/single/card";
import { FiSearch } from "react-icons/fi";
import { MdAdd, MdLocalShipping, MdPhone, MdBadge, MdEmail } from "react-icons/md";
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24 auto-rows-fr">
        {filteredDrivers.map((driver) => (
          <Card
            key={driver.id}
            extra="h-full !rounded-md !shadow-[0_18px_45px_rgba(15,23,42,0.14)] dark:!shadow-[0_22px_50px_rgba(0,0,0,0.42)] p-0 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:!shadow-[0_24px_60px_rgba(15,23,42,0.2)] border border-gray-200 dark:border-white/10 overflow-hidden group"
            onClick={() => handleViewDriver(driver)}
          >
            <div className="flex h-full flex-col">
              <div className="relative h-32 w-full border-b border-gray-200 dark:border-white/10 bg-gradient-to-br from-accent-500/90 via-accent-500 to-accent-700 dark:from-accent-400 dark:via-accent-500 dark:to-accent-700">
                <div className="absolute inset-y-0 left-0 w-1.5 bg-brand-500 group-hover:w-2 transition-all duration-300" />
                <div className="flex h-full items-center gap-3 px-5">
                  <div className="flex h-14 w-14 items-center justify-center overflow-hidden bg-white/20 backdrop-blur-sm border border-white/30">
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
                  <div>
                    <h3 className="line-clamp-1 text-lg font-bold text-white">{driver.name}</h3>
                    <p className="text-sm text-white/90">Conductor</p>
                  </div>
                </div>
                <span className={`absolute right-3 top-3 px-3 py-1 text-xs font-semibold shadow-sm ${getStateColor(driver.state)}`}>
                  {getStateLabel(driver.state)}
                </span>
              </div>

              <div className="flex h-full flex-col p-5">
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center gap-2 border border-gray-200 dark:border-white/10 px-2 py-2 bg-gray-50 dark:bg-navy-800 min-h-[42px]">
                    <MdPhone className="text-brand-500 dark:text-brand-400 text-base flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-none">Teléfono</p>
                      <p className="text-sm font-semibold text-navy-700 dark:text-white truncate">{driver.phone || "Sin teléfono"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 border border-gray-200 dark:border-white/10 px-2 py-2 bg-gray-50 dark:bg-navy-800 min-h-[42px]">
                    <MdEmail className="text-brand-500 dark:text-brand-400 text-base flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-none">Correo</p>
                      <p className="text-sm font-semibold text-navy-700 dark:text-white truncate">{driver.email || "Sin correo"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 border border-gray-200 dark:border-white/10 px-2 py-2 bg-gray-50 dark:bg-navy-800 min-h-[42px]">
                    <MdBadge className="text-brand-500 dark:text-brand-400 text-base flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-none">Identificación</p>
                      <p className="text-sm font-semibold text-navy-700 dark:text-white truncate">{driver.idNumber || driver.identification || "Sin ID"}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-gray-200 dark:border-white/10">
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                    Actualizado: {driver.updatedAt ? new Date(driver.updatedAt).toLocaleDateString("es-DO") : "N/A"}
                  </p>
                </div>
              </div>
            </div>
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

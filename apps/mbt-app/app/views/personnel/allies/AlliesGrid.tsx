"use client";

import React, { useState, useEffect } from "react";
import Card from "@/components/single/card";
import { FiSearch } from "react-icons/fi";
import { MdBusiness, MdPerson, MdAdd, MdPhone, MdEmail, MdDirectionsCar } from "react-icons/md";
import { useNavigation } from "@/contexts/NavigationContext";
import { getAllAllies } from "./mockAllies";
import { Ally } from "@/types/personnel";
import AllyDetail from "./AllyDetail";
import AllyForm from "./AllyForm";

export default function AlliesGrid() {
  const { pushView } = useNavigation();
  const [searchQuery, setSearchQuery] = useState("");
  const [alliesData, setAlliesData] = useState<Ally[]>([]);

  // Refresh data on mount
  useEffect(() => {
    setAlliesData(getAllAllies());
  }, []);

  const filteredAllies = alliesData.filter(ally =>
    ally.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ally.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ally.identification?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewAlly = (ally: Ally) => {
    pushView({
      id: `ally-detail-${ally.id}`,
      label: ally.name,
      component: AllyDetail,
      data: { allyId: ally.id },
    });
  };

  const handleCreateAlly = () => {
    pushView({
      id: 'ally-create',
      label: 'Nuevo Aliado',
      component: AllyForm,
      data: { mode: 'create' },
    });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      ACTIVE: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      INACTIVE: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
      SUSPENDED: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    };
    return colors[status as keyof typeof colors] || colors.INACTIVE;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      ACTIVE: 'Activo',
      INACTIVE: 'Inactivo',
      SUSPENDED: 'Suspendido',
    };
    return labels[status as keyof typeof labels] || status;
  };

  return (
    <div className="w-full h-full px-4">
      {/* Search and Add Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex h-[38px] w-full max-w-[400px] flex-grow items-center rounded-xl bg-lightPrimary text-sm text-gray-600 dark:!bg-navy-900 dark:text-white gap-2 p-2">
          <FiSearch />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            type="text"
            placeholder="Buscar aliado..."
            className="block w-full rounded-full bg-lightPrimary text-base text-navy-700 outline-none dark:!bg-navy-900 dark:text-white"
          />
        </div>
        <button
          onClick={handleCreateAlly}
          className="ml-4 flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:hover:bg-brand-300"
        >
          <MdAdd className="text-lg" />
          Nuevo
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24">
        {filteredAllies.map((ally) => (
          <Card
            key={ally.id}
            extra="p-6 cursor-pointer hover:shadow-xl transition-shadow"
            onClick={() => handleViewAlly(ally)}
          >
            {/* Header with icon and status */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 dark:from-brand-400 dark:to-brand-500">
                {ally.type === 'COMPANY' ? (
                  <MdBusiness className="text-2xl text-white" />
                ) : (
                  <MdPerson className="text-2xl text-white" />
                )}
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(ally.status)}`}>
                {getStatusLabel(ally.status)}
              </span>
            </div>

            {/* Name and Type */}
            <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-1 truncate">
              {ally.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {ally.type === 'COMPANY' ? 'Empresa' : 'Individual'}
            </p>

            {/* Contact Info */}
            <div className="space-y-2 mb-4">
              {ally.email && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <MdEmail className="text-base flex-shrink-0" />
                  <span className="truncate">{ally.email}</span>
                </div>
              )}
              {ally.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <MdPhone className="text-base flex-shrink-0" />
                  <span>{ally.phone}</span>
                </div>
              )}
            </div>

            {/* Vehicles Count */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <MdDirectionsCar className="text-base" />
                <span>{ally.vehiclesCount} vehículos</span>
              </div>
              {ally.type === 'COMPANY' && ally.contactPerson && (
                <span className="text-xs text-gray-500 dark:text-gray-500 truncate max-w-[120px]">
                  {ally.contactPerson}
                </span>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredAllies.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <MdBusiness className="text-6xl text-gray-300 dark:text-gray-700 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            {searchQuery ? 'No se encontraron aliados' : 'No hay aliados registrados'}
          </p>
          {!searchQuery && (
            <button
              onClick={handleCreateAlly}
              className="mt-4 flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
            >
              <MdAdd />
              Agregar Primer Aliado
            </button>
          )}
        </div>
      )}
    </div>
  );
}

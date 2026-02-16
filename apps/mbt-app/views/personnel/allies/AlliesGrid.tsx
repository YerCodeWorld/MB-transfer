"use client";

import React, { useState } from "react";
import Card from "@/components/single/card";
import { FiSearch } from "react-icons/fi";
import { MdBusiness, MdAdd, MdLanguage, MdEmail, MdPhone } from "react-icons/md";
import { useNavigation } from "@/contexts/NavigationContext";
import { useAllies } from "@/hooks/useAllies";
import AllyDetail from "./AllyDetail";
import AllyForm from "./AllyForm";

interface AllyListItem {
  id: string;
  name: string;
  website?: string | null;
  email?: string | null;
  contactNumber?: string | null;
  _count?: {
    services: number;
  };
  createdAt: string;
}

export default function AlliesGrid() {
  const { pushView } = useNavigation();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: allies = [], isLoading, error, refetch } = useAllies({ limit: 100 });

  const filteredAllies = allies.filter((ally: AllyListItem) => {
    const query = searchQuery.toLowerCase();
    return (
      ally.name.toLowerCase().includes(query) ||
      (ally.email || "").toLowerCase().includes(query) ||
      (ally.contactNumber || "").toLowerCase().includes(query)
    );
  });

  const handleViewAlly = (ally: AllyListItem) => {
    pushView({
      id: `ally-detail-${ally.id}`,
      label: ally.name,
      component: AllyDetail,
      data: { allyId: ally.id, onUpdate: refetch },
    });
  };

  const handleCreateAlly = () => {
    pushView({
      id: "ally-create",
      label: "Nuevo Aliado",
      component: AllyForm,
      data: { mode: "create", onSuccess: refetch },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando aliados...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <Card extra="p-8">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">Error</h2>
          <p className="text-gray-600 dark:text-gray-400">
            {error instanceof Error ? error.message : "Error al cargar aliados"}
          </p>
          <button
            onClick={() => refetch()}
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
      <div className="flex items-center justify-between mb-6">
        <div className="flex h-[38px] w-full max-w-[400px] flex-grow items-center rounded-xl bg-gray-100 text-sm text-gray-700 dark:!bg-navy-900 dark:text-white gap-2 p-2 border border-gray-300 dark:border-gray-700">
          <FiSearch className="text-gray-500 dark:text-gray-400" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            type="text"
            placeholder="Buscar aliado..."
            className="block w-full rounded-full bg-gray-100 text-base text-navy-700 placeholder:text-gray-500 outline-none dark:!bg-navy-900 dark:text-white dark:placeholder:text-gray-400"
          />
        </div>
        <button
          onClick={handleCreateAlly}
          className="ml-4 flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-brand dark:text-white hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:hover:bg-brand-300"
        >
          <MdAdd className="text-lg" />
          Nuevo
        </button>
      </div>

      {filteredAllies.length === 0 && !searchQuery && (
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <MdBusiness className="mx-auto text-6xl text-gray-400 dark:text-gray-600 mb-4" />
            <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-2">
              No hay aliados registrados
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Agregue sus empresas aliadas y gestione sus datos de contacto
            </p>
            <button
              onClick={handleCreateAlly}
              className="rounded-xl bg-brand-500 px-6 py-3 text-sm font-semibold text-brand dark:text-white hover:bg-brand-600"
            >
              Agregar Primer Aliado
            </button>
          </div>
        </div>
      )}

      {filteredAllies.length === 0 && searchQuery && (
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">
              No se encontraron aliados que coincidan con "{searchQuery}"
            </p>
          </div>
        </div>
      )}

      {filteredAllies.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24">
          {filteredAllies.map((ally: AllyListItem) => (
            <Card
              key={ally.id}
              extra="p-6 cursor-pointer hover:shadow-2xl transition-all hover:scale-[1.02]"
              onClick={() => handleViewAlly(ally)}
            >
              <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 dark:from-brand-400 dark:to-brand-500 mb-4">
                <MdBusiness className="text-2xl text-black dark:text-white" />
              </div>

              <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-3">{ally.name}</h3>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <MdLanguage className="text-base" />
                  <span className="truncate">{ally.website || "Sin sitio web"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <MdEmail className="text-base" />
                  <span className="truncate">{ally.email || "Sin correo"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <MdPhone className="text-base" />
                  <span className="truncate">{ally.contactNumber || "Sin telefono"}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {ally._count?.services || 0} servicio(s)
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

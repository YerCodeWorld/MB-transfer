"use client";

import React, { useState } from "react";
import Card from "@/components/single/card";
import { FiSearch } from "react-icons/fi";
import { MdHotel, MdAdd, MdAirplanemodeActive, MdPlace, MdLocationOn, MdTag } from "react-icons/md";
import { useNavigation } from "@/contexts/NavigationContext";
import { usePlaces } from "@/hooks/usePlaces";
import PlaceDetail from "./PlaceDetail";
import PlaceForm from "./PlaceForm";

interface Place {
  id: string;
  kind: "AIRPORT" | "HOTEL" | "OTHER";
  name: string;
  iata?: string;
  latitude?: number;
  longitude?: number;
  zone?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function HotelsGrid() {
  const { pushView } = useNavigation();
  const [searchQuery, setSearchQuery] = useState("");

  // Using React Query hook
  const { data: places = [], isLoading, error, refetch } = usePlaces({ limit: 100 });

  const filteredPlaces = places.filter((place: Place) =>
    place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    place.iata?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewPlace = (place: Place) => {
    pushView({
      id: `place-detail-${place.id}`,
      label: place.name,
      component: PlaceDetail,
      data: { placeId: place.id, onUpdate: refetch },
    });
  };

  const handleCreatePlace = () => {
    pushView({
      id: 'place-create',
      label: 'Nuevo Lugar',
      component: PlaceForm,
      data: { mode: 'create', onSuccess: refetch },
    });
  };

  const getPlaceIcon = (kind: Place["kind"]) => {
    const icons = {
      AIRPORT: MdAirplanemodeActive,
      HOTEL: MdHotel,
      OTHER: MdPlace,
    };
    return icons[kind];
  };

  const getPlaceColor = (kind: Place["kind"]) => {
    const colors = {
      AIRPORT: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      HOTEL: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
      OTHER: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
    };
    return colors[kind];
  };

  const getPlaceLabel = (kind: Place["kind"]) => {
    const labels = {
      AIRPORT: "Aeropuerto",
      HOTEL: "Hotel",
      OTHER: "Otro",
    };
    return labels[kind];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando lugares...</p>
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
          <p className="text-gray-600 dark:text-gray-400">
            {error instanceof Error ? error.message : "Error al cargar lugares"}
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
      {/* Search and Add Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex h-[38px] w-full max-w-[400px] flex-grow items-center rounded-xl bg-gray-100 text-sm text-gray-700 dark:!bg-navy-900 dark:text-white gap-2 p-2 border border-gray-300 dark:border-gray-700">
          <FiSearch className="text-gray-500 dark:text-gray-400" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            type="text"
            placeholder="Buscar lugar..."
            className="block w-full rounded-full bg-gray-100 text-base text-navy-700 placeholder:text-gray-500 outline-none dark:!bg-navy-900 dark:text-white dark:placeholder:text-gray-400"
          />
        </div>
        <button
          onClick={handleCreatePlace}
          className="ml-4 flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-brand dark:text-white hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:hover:bg-brand-300 cursor-pointer"
        >
          <MdAdd className="text-lg" />
          Nuevo
        </button>
      </div>

      {/* Empty State */}
      {filteredPlaces.length === 0 && !searchQuery && (
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <MdHotel className="mx-auto text-6xl text-gray-400 dark:text-gray-600 mb-4" />
            <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-2">
              No hay lugares registrados
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Comienza agregando hoteles y aeropuertos
            </p>
            <button
              onClick={handleCreatePlace}
              className="rounded-xl bg-brand-500 px-6 py-3 text-sm font-semibold text-brand dark:text-white hover:bg-brand-600"
            >
              Agregar Primer Lugar
            </button>
          </div>
        </div>
      )}

      {/* No Search Results */}
      {filteredPlaces.length === 0 && searchQuery && (
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">
              No se encontraron lugares que coincidan con "{searchQuery}"
            </p>
          </div>
        </div>
      )}

      {/* Grid */}
      {filteredPlaces.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24 auto-rows-fr">
          {filteredPlaces.map((place: Place) => {
            const Icon = getPlaceIcon(place.kind);
            const gradientByKind: Record<Place["kind"], string> = {
              AIRPORT: "from-blue-500/90 via-accent-500 to-accent-700",
              HOTEL: "from-accent-500/90 via-accent-500 to-accent-700",
              OTHER: "from-slate-500/90 via-slate-500 to-slate-700",
            };

            return (
              <Card
                key={place.id}
                extra="h-full !rounded-md !shadow-[0_18px_45px_rgba(15,23,42,0.14)] dark:!shadow-[0_22px_50px_rgba(0,0,0,0.42)] p-0 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:!shadow-[0_24px_60px_rgba(15,23,42,0.2)] border border-gray-200 dark:border-white/10 overflow-hidden group"
                onClick={() => handleViewPlace(place)}
              >
                <div className="flex h-full flex-col">
                  <div className={`relative h-36 w-full border-b border-gray-200 dark:border-white/10 bg-gradient-to-br ${gradientByKind[place.kind]}`}>
                    <div className="flex h-full w-full items-center justify-center">
                      <Icon className="text-6xl text-white/95" />
                    </div>
                    <div className="absolute inset-y-0 left-0 w-1.5 bg-accent-500 group-hover:w-2 transition-all duration-300" />
                    <span className={`absolute right-3 top-3 px-3 py-1 text-xs font-semibold shadow-sm ${getPlaceColor(place.kind)}`}>
                      {getPlaceLabel(place.kind)}
                    </span>
                  </div>

                  <div className="flex h-full flex-col p-5">
                    <h3 className="text-lg font-bold text-navy-700 dark:text-white leading-tight">
                      {place.name}
                    </h3>

                    <div className="mt-3 space-y-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                        <MdTag className="text-accent-500 dark:text-accent-400" />
                        {place.iata ? `IATA: ${place.iata}` : "Sin codigo IATA"}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                        <MdPlace className="text-accent-500 dark:text-accent-400" />
                        {place.zone ? `Zona: ${place.zone.name}` : "Sin zona asignada"}
                      </p>
                    </div>

                    <div className="mt-auto pt-4 border-t border-gray-200 dark:border-white/10">
                      <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 truncate">
                        <MdLocationOn className="text-accent-500 dark:text-accent-400" />
                        {place.latitude != null && place.longitude != null
                          ? `${place.latitude.toFixed(4)}, ${place.longitude.toFixed(4)}`
                          : "Sin coordenadas"}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

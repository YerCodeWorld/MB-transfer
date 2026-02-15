"use client";

import React, { useState, useEffect } from "react";
import Card from "@/components/single/card";
import {
  MdEdit,
  MdDelete,
  MdDirectionsCar,
  MdCircle,
  MdPerson,
  MdBuild,
  MdCalendarToday,
  MdLocalGasStation,
  MdAirlineSeatReclineNormal,
  MdLuggage,
  MdConfirmationNumber,
  MdImage
} from "react-icons/md";
import { useNavigation } from "@/contexts/NavigationContext";
import { apiClient } from "@/utils/api";
import VehicleForm from "./VehicleForm";

interface Vehicle {
  id: string;
  name: string;
  image?: string;
  brand?: string;
  identifierDocument?: string;
  state: 'FUNCTIONAL' | 'DAMAGED' | 'ONSERVICE' | 'OFFSERVICE';
  paxCapacity: number;
  luggageCapacity: number;
  fuelType?: string;
  fuelUnitPrice?: number;
  fuelState: 'FULL' | 'MIDDLE' | 'EMPTY';
  lastMaintenanceOn?: string;
}

type VehicleState = 'FUNCTIONAL' | 'DAMAGED' | 'ONSERVICE' | 'OFFSERVICE';
type FuelState = 'FULL' | 'MIDDLE' | 'EMPTY';

interface VehicleDetailProps {
  vehicleId: string;
  onUpdate?: () => void;
}

export default function VehicleDetail({ vehicleId, onUpdate }: VehicleDetailProps) {
  const { pushView, popView } = useNavigation();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVehicle();
  }, [vehicleId]);

  const fetchVehicle = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<Vehicle>(`/api/v1/vehicules/${vehicleId}`);

      if (response.success && response.data) {
        setVehicle(response.data);
      }
    } catch (err) {
      console.error('Error fetching vehicle:', err);
      setError('Error al cargar vehículo');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (!vehicle) return;

    pushView({
      id: `vehicle-edit-${vehicle.id}`,
      label: `Editar ${vehicle.name}`,
      component: VehicleForm,
      data: {
        mode: 'edit',
        vehicleId: vehicle.id,
        onSuccess: () => {
          fetchVehicle();
          onUpdate?.();
        }
      },
    });
  };

  const handleDelete = async () => {
    if (!vehicle) return;

    const confirmed = window.confirm(
      `¿Está seguro que desea eliminar el vehículo ${vehicle.name}? Esta acción no se puede deshacer.`
    );

    if (!confirmed) return;

    try {
      await apiClient.delete(`/api/v1/vehicules/${vehicle.id}`);
      onUpdate?.();
      popView();
    } catch (err) {
      console.error('Error deleting vehicle:', err);
      alert('Error al eliminar vehículo');
    }
  };

  const stateLabels: Record<VehicleState, string> = {
    FUNCTIONAL: 'Funcional',
    DAMAGED: 'Dañado',
    ONSERVICE: 'En Servicio',
    OFFSERVICE: 'Fuera de Servicio',
  };

  const stateColors: Record<VehicleState, string> = {
    FUNCTIONAL: 'text-green-600 dark:text-green-400',
    DAMAGED: 'text-red-600 dark:text-red-400',
    ONSERVICE: 'text-blue-600 dark:text-blue-400',
    OFFSERVICE: 'text-gray-600 dark:text-gray-400',
  };

  const fuelStateLabels: Record<FuelState, string> = {
    FULL: 'Lleno',
    MIDDLE: 'Medio',
    EMPTY: 'Vacío',
  };

  const fuelStateColors: Record<FuelState, string> = {
    FULL: 'text-green-600 dark:text-green-400',
    MIDDLE: 'text-orange-600 dark:text-orange-400',
    EMPTY: 'text-red-600 dark:text-red-400',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando vehículo...</p>
        </div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <Card extra="p-8">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400">
            {error || 'Vehículo no encontrado'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {error ? 'No se pudo cargar la información del vehículo' : `No se pudo encontrar el vehículo con ID: ${vehicleId}`}
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
            {/* Vehicle Image or Icon */}
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-600 dark:from-brand-400 dark:to-brand-500 overflow-hidden">
              {vehicle.image ? (
                <img
                  src={vehicle.image}
                  alt={vehicle.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <MdDirectionsCar className="text-4xl text-white" />
              )}
            </div>

            {/* Name and Info */}
            <div>
              <h1 className="text-2xl font-bold text-navy-700 dark:text-white">
                {vehicle.name}
              </h1>
              {vehicle.brand && (
                <p className="text-base text-gray-600 dark:text-gray-400 mt-1">
                  {vehicle.brand}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <MdCircle className={`text-sm ${stateColors[vehicle.state]}`} />
                <span className={`text-sm font-medium ${stateColors[vehicle.state]}`}>
                  {stateLabels[vehicle.state]}
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

      {/* Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card extra="p-6">
          <h2 className="text-lg font-bold text-navy-700 dark:text-white mb-4">
            Información Básica
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <MdConfirmationNumber className="text-xl text-gray-600 dark:text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Nombre/Placa</p>
                <p className="font-medium text-navy-700 dark:text-white">{vehicle.name}</p>
              </div>
            </div>

            {vehicle.brand && (
              <div className="flex items-start gap-3">
                <MdDirectionsCar className="text-xl text-gray-600 dark:text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Marca</p>
                  <p className="font-medium text-navy-700 dark:text-white">{vehicle.brand}</p>
                </div>
              </div>
            )}

            {vehicle.identifierDocument && (
              <div className="flex items-start gap-3">
                <MdConfirmationNumber className="text-xl text-gray-600 dark:text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Documento Identificador</p>
                  <p className="font-medium text-navy-700 dark:text-white">{vehicle.identifierDocument}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <MdCircle className={`text-xl ${stateColors[vehicle.state]} mt-1`} />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Estado</p>
                <p className={`font-medium ${stateColors[vehicle.state]}`}>
                  {stateLabels[vehicle.state]}
                </p>
              </div>
            </div>

            {vehicle.image && (
              <div className="flex items-start gap-3">
                <MdImage className="text-xl text-gray-600 dark:text-gray-400 mt-1" />
                <div className="w-full">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Imagen</p>
                  <img
                    src={vehicle.image}
                    alt={vehicle.name}
                    className="w-full max-w-xs rounded-lg border border-gray-300 dark:border-gray-700"
                  />
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Capacity Information */}
        <Card extra="p-6">
          <h2 className="text-lg font-bold text-navy-700 dark:text-white mb-4">
            Capacidad
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <MdAirlineSeatReclineNormal className="text-xl text-gray-600 dark:text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Capacidad de Pasajeros</p>
                <p className="font-medium text-navy-700 dark:text-white">
                  {vehicle.paxCapacity} {vehicle.paxCapacity === 1 ? 'pasajero' : 'pasajeros'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MdLuggage className="text-xl text-gray-600 dark:text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Capacidad de Equipaje</p>
                <p className="font-medium text-navy-700 dark:text-white">
                  {vehicle.luggageCapacity} {vehicle.luggageCapacity === 1 ? 'maleta' : 'maletas'}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Fuel Information */}
        <Card extra="p-6">
          <h2 className="text-lg font-bold text-navy-700 dark:text-white mb-4">
            Información de Combustible
          </h2>
          <div className="space-y-4">
            {vehicle.fuelType && (
              <div className="flex items-start gap-3">
                <MdLocalGasStation className="text-xl text-gray-600 dark:text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Tipo de Combustible</p>
                  <p className="font-medium text-navy-700 dark:text-white">{vehicle.fuelType}</p>
                </div>
              </div>
            )}

            {vehicle.fuelUnitPrice !== undefined && vehicle.fuelUnitPrice !== null && (
              <div className="flex items-start gap-3">
                <MdLocalGasStation className="text-xl text-gray-600 dark:text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Precio por Unidad</p>
                  <p className="font-medium text-navy-700 dark:text-white">
                    ${vehicle.fuelUnitPrice}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <MdCircle className={`text-xl ${fuelStateColors[vehicle.fuelState]} mt-1`} />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Estado de Combustible</p>
                <p className={`font-medium ${fuelStateColors[vehicle.fuelState]}`}>
                  {fuelStateLabels[vehicle.fuelState]}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Maintenance Information */}
        <Card extra="p-6">
          <h2 className="text-lg font-bold text-navy-700 dark:text-white mb-4">
            Información de Mantenimiento
          </h2>
          <div className="space-y-4">
            {vehicle.lastMaintenanceOn ? (
              <div className="flex items-start gap-3">
                <MdBuild className="text-xl text-gray-600 dark:text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Último Mantenimiento</p>
                  <p className="font-medium text-navy-700 dark:text-white">
                    {new Date(vehicle.lastMaintenanceOn).toLocaleDateString('es-DO', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  No hay registro de mantenimiento
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

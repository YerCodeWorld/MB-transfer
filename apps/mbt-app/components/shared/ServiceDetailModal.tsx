"use client";

import { ServiceInput } from '../../types/services';
import { convertIsoStringTo12h, convertTo12Hour } from '../../utils/services';
import { createPortal } from 'react-dom';
import { useEffect } from 'react';
import {
  FaUser, FaClock, FaUsers, FaRoute, FaInfoCircle, FaTimes, FaCopy, FaMapSigns,
} from "react-icons/fa";
import { PiAirplaneBold } from 'react-icons/pi';
import { toast } from "sonner";
import { useIsClient } from '@/hooks/useIsClient';

interface ServiceDetailModalProps {
  service: ServiceInput | null;
  onClose: () => void;
  onEdit?: () => void;
  onRemove?: () => void;
}

const ServiceDetailModal = ({ service, onClose, onEdit, onRemove }: ServiceDetailModalProps) => {
  const isClient = useIsClient();

  useEffect(() => {
    if (service) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [service]);

  if (!service || !isClient) return null;

  const getNotesText = (notes: unknown): string => {
    if (!notes) return '';
    if (typeof notes === 'string') return notes.trim();

    if (Array.isArray(notes)) {
      return notes
        .map((note) => {
          if (typeof note === 'string') return note.trim();
          if (!note || typeof note !== 'object') return '';
          const item = note as { title?: string; caption?: string; content?: string };
          const content = typeof item.content === 'string' ? item.content.trim() : '';
          if (content) return content;
          return [item.title, item.caption]
            .filter((part): part is string => typeof part === 'string' && part.trim().length > 0)
            .join(' - ')
            .trim();
        })
        .filter(Boolean)
        .join('\n');
    }

    if (typeof notes === 'object') {
      const item = notes as { title?: string; caption?: string; content?: string };
      const content = typeof item.content === 'string' ? item.content.trim() : '';
      if (content) return content;
      return [item.title, item.caption]
        .filter((part): part is string => typeof part === 'string' && part.trim().length > 0)
        .join(' - ')
        .trim();
    }

    return '';
  };

  const notesText = getNotesText(service.notes);

  const formatPickupTime = (value?: string) => {
    const input = String(value || '').trim();
    if (!input) return 'N/A';
    if (/^\d{4}-\d{2}-\d{2}[T\s]/.test(input) || input.endsWith('Z')) {
      return convertIsoStringTo12h(input);
    }
    if (/^\d{1,2}:\d{2}(?::\d{2})?$/.test(input)) {
      return convertTo12Hour(input);
    }
    return input;
  };

  const kindOfElement = (kind: 'ARRIVAL' | 'DEPARTURE' | 'TRANSFER') => {
    const base =
      'px-2 py-1 rounded-full text-xs font-semibold text-white inline-block';

    switch (kind) {
      case 'ARRIVAL':
        return <span className={`${base} bg-green-500`}>ARRIVAL</span>;
      case 'DEPARTURE':
        return <span className={`${base} bg-blue-500`}>DEPARTURE</span>;
      case 'TRANSFER':
        return <span className={`${base} bg-yellow-500 text-black`}>TRANSFER</span>;
      default:
        return <span className={`${base} bg-gray-400`}>UNKNOWN</span>;
    }
  };

  const modalContent = (
    <div 
      className="fixed inset-0 z-[10000] backdrop-blur-sm flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-2xl rounded-xl bg-white dark:bg-navy-800 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <PiAirplaneBold className="text-2xl text-blue-500" />
            <div>
              <h2 className="text-xl font-bold text-navy-700 dark:text-white">
                Detalles de Servicio 
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {service.code}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <FaTimes className="text-lg" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Service Type Badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {kindOfElement(service.kindOf)}
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(service.code || '');
                toast.success("Código copiano exitosamente", {
                  className: "bg-card text-card-foreground border-border"
                });     
              }}
              className="flex items-center gap-2 px-3 py-1 text-sm text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-200/20 dark:text-purple-100 rounded-lg transition-colors"
            >
              <FaCopy />
              Copiar Código
            </button>
          </div>

          {/* Client Information */}
          <div className="bg-gray-50 dark:bg-navy-700 rounded-lg p-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-navy-700 dark:text-white mb-3">
              <FaUser className="text-blue-500" />
              Información del Cliente
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  Nombre 
                </label>
                <p className="text-sm font-medium text-navy-700 dark:text-white">
                  {service.clientName}
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  PAX
                </label>
                <div className="flex items-center gap-1">
                  <FaUsers className="text-blue-500 text-xs" />
                  <p className="text-sm font-medium text-navy-700 dark:text-white">
                    {service.pax} pasajero{service.pax !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              {service.luggage && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Equipaje
                  </label>
                  <p className="text-sm font-medium text-navy-700 dark:text-white">
                    {service.luggage} pieza{service.luggage !== 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Service Details */}
          <div className="bg-gray-50 dark:bg-navy-700 rounded-lg p-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-navy-700 dark:text-white mb-3">
              <FaClock className="text-green-500" />
              Detalles Del Servicio
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  Hora 
                </label>
                <p className="text-sm font-medium text-navy-700 dark:text-white">
                  {formatPickupTime(service.pickupTime)}
                </p>
              </div>
              {service.flightCode && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Código de Vuelo 
                  </label>
                  <div className="flex items-center gap-1">
                    <PiAirplaneBold className="text-blue-500 text-xs" />
                    <p className="text-sm font-medium text-navy-700 dark:text-white">
                      {service.flightCode}
                    </p>
                  </div>
                </div>
              )}
              {service.vehicleType && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Vehículo 
                  </label>
                  <p className="text-sm font-medium text-navy-700 dark:text-white">
                    {service.vehicleType}
                  </p>
                </div>
              )}
              {service.ally && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Aliado 
                  </label>
                  <p className="text-sm font-medium text-navy-700 dark:text-white">
                    {service.ally}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Route Information */}
          <div className="bg-gray-50 dark:bg-navy-700 rounded-lg p-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-navy-700 dark:text-white mb-3">
              <FaRoute className="text-orange-500" />
              Información de Ruta 
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Lugar de Recogida 
                  </label>
                  <div className="flex items-start gap-2 mt-1">
                    <div className="w-3 h-3 rounded-full bg-green-500 mt-1 flex-shrink-0"></div>
                    <p className="text-sm font-medium text-navy-700 dark:text-white">
                      {service.pickupLocation}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center">
                <FaMapSigns className="text-gray-400 text-lg" />
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Destino
                  </label>
                  <div className="flex items-start gap-2 mt-1">
                    <div className="w-3 h-3 rounded-full bg-red-500 mt-1 flex-shrink-0"></div>
                    <p className="text-sm font-medium text-navy-700 dark:text-white">
                      {service.dropoffLocation}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          {notesText && (
            <div className="bg-gray-50 dark:bg-navy-700 rounded-lg p-4">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-navy-700 dark:text-white mb-3">
                <FaInfoCircle className="text-purple-500" />
                Notas Adicionales 
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {notesText}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          {onRemove && (
            <button
              onClick={onRemove}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              Eliminar
            </button>
          )}
          {onEdit && (
            <button
              onClick={onEdit}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Editar
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cerrar
          </button>
          <button
            onClick={() => {
              navigator.clipboard.writeText(JSON.stringify(service, null, 2));
              toast.success("Información Copiada Exitosamente", {
                className: "bg-card text-card-foreground border-border"
              });
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
          >
            <FaCopy />
            Copiar Información (.CSV)
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ServiceDetailModal;

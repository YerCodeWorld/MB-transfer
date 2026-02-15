"use client";

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { BsClock, BsCheckCircle, BsExclamationTriangle, BsXCircle, BsArrowRepeat } from 'react-icons/bs';
import { FaPlane } from 'react-icons/fa';
import { fetchFlightTimes } from '../../utils/services';
import { FlightInfo } from '../../types/services';

type ComparisonStatus = 'loading' | 'found' | 'not_found' | 'error' | 'no_discrepancy' | 'discrepancy';
type ResultTab = 'no_discrepancy' | 'discrepancy' | 'error';

interface FlightComparisonData {
  service: {
    id: string;
    code: string;
    clientName: string;
    flightCode: string;
    pickupTime: string;
    serviceType: string;
  };
  flightData?: FlightInfo;
  status: ComparisonStatus;
  message?: string;
  differenceMinutes?: number;
}

interface FlightComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  services: any[];
  selectedDate: string;
  onUpdateServiceTime?: (serviceId: string, formattedTime: string) => Promise<void> | void;
  embedded?: boolean;
}

const CACHE_TTL_MS = 10 * 60 * 1000;

const getComparisonCacheKey = (services: any[], selectedDate: string): string => {
  const arrivalSignature = services
    .filter((service) => service.kindOf === 'ARRIVAL' && service.flightCode)
    .map((service) => `${service.id || service.code || 'unknown'}:${service.flightCode}:${service.pickupTime}`)
    .sort()
    .join('|');

  return `${selectedDate}::${arrivalSignature}`;
};

const parse12HourTime = (rawTime: string, selectedDate: string): Date => {
  const match = rawTime.trim().match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) {
    throw new Error('Invalid 12-hour time format');
  }

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();

  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  const [selectedYear, selectedMonth, selectedDay] = selectedDate.split('-').map(Number);
  return new Date(selectedYear, selectedMonth - 1, selectedDay, hours, minutes);
};

const parseServiceTime = (serviceTimeString: string, selectedDate: string): Date => {
  const [selectedYear, selectedMonth, selectedDay] = selectedDate.split('-').map(Number);

  if (serviceTimeString.includes('T')) {
    const [datePart, timePart] = serviceTimeString.replace('Z', '').split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [h, m] = timePart.split(':').map(Number);
    return new Date(year, month - 1, day, h, m);
  }

  if (serviceTimeString.includes('AM') || serviceTimeString.includes('PM')) {
    return parse12HourTime(serviceTimeString, selectedDate);
  }

  const timeParts = serviceTimeString.split(':');
  if (timeParts.length >= 2) {
    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);
    return new Date(selectedYear, selectedMonth - 1, selectedDay, hours, minutes);
  }

  throw new Error('Invalid service time format');
};

const normalizeServiceTimeFormat = (service: any, newTime: string): string => {
  const match = newTime.trim().match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) {
    return newTime;
  }

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();

  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  const serviceType = (service.serviceType || '').toLowerCase();

  if (serviceType === 'at' || service.pickupTime?.includes('T')) {
    const normalizedMinutes = String(minutes).padStart(2, '0');
    const hour12 = hours % 12 || 12;
    const nextPeriod = hours >= 12 ? 'PM' : 'AM';
    return `${hour12}:${normalizedMinutes} ${nextPeriod}`;
  }

  if (serviceType === 'st' || service.pickupTime?.includes('AM') || service.pickupTime?.includes('PM')) {
    const normalizedMinutes = String(minutes).padStart(2, '0');
    const hour12 = hours % 12 || 12;
    const nextPeriod = hours >= 12 ? 'PM' : 'AM';
    return `${hour12}:${normalizedMinutes} ${nextPeriod}`;
  }

  const paddedHours = String(hours).padStart(2, '0');
  const paddedMinutes = String(minutes).padStart(2, '0');
  return `${paddedHours}:${paddedMinutes}`;
};

const isInternalError = (message?: string) => {
  if (!message) return false;

  const normalized = message.toLowerCase();
  return (
    normalized.includes('parse') ||
    normalized.includes('formato') ||
    normalized.includes('fallo') ||
    normalized.includes('unable')
  );
};

const buildComparisonFromFlightInfo = (
  comparison: FlightComparisonData,
  flightInfo: FlightInfo | undefined,
  selectedDate: string
): FlightComparisonData => {
  if (!flightInfo) {
    return {
      ...comparison,
      status: 'not_found',
      message: 'No se encontró el vuelo en la base de datos de FlightAware',
    };
  }

  if (flightInfo.error) {
    return {
      ...comparison,
      flightData: flightInfo,
      status: 'error',
      message: `Error adquiriendo la información del vuelo: ${flightInfo.error}`,
    };
  }

  if (flightInfo.message) {
    return {
      ...comparison,
      flightData: flightInfo,
      status: 'not_found',
      message: flightInfo.message,
    };
  }

  if (flightInfo.status && flightInfo.status.toLowerCase().includes('cancelled')) {
    return {
      ...comparison,
      flightData: flightInfo,
      status: 'error',
      message: `El vuelo ${flightInfo.code} ha sido cancelado`,
    };
  }

  if (!flightInfo.scheduled_in) {
    return {
      ...comparison,
      flightData: flightInfo,
      status: 'not_found',
      message: 'No hay horarios de llegadas programados disponibles.',
    };
  }

  try {
    const flightTime = parse12HourTime(flightInfo.scheduled_in, selectedDate);
    const serviceTime = parseServiceTime(comparison.service.pickupTime, selectedDate);

    if (isNaN(flightTime.getTime()) || isNaN(serviceTime.getTime())) {
      return {
        ...comparison,
        flightData: flightInfo,
        status: 'error',
        message: 'Formato de hora inválido para la comparación',
      };
    }

    const timeDiff = Math.abs(serviceTime.getTime() - flightTime.getTime());
    const minutesDiff = timeDiff / (1000 * 60);

    if (minutesDiff <= 5) {
      return {
        ...comparison,
        flightData: flightInfo,
        status: 'no_discrepancy',
        differenceMinutes: minutesDiff,
        message: 'Misma hora detectada (dentro de un offset de 5 minutos)',
      };
    }

    const hoursDiff = Math.floor(minutesDiff / 60);
    const remainingMinutes = Math.floor(minutesDiff % 60);
    const timeDiffText = hoursDiff > 0 ? `${hoursDiff}h ${remainingMinutes}m` : `${remainingMinutes}m`;

    return {
      ...comparison,
      flightData: flightInfo,
      status: 'discrepancy',
      differenceMinutes: minutesDiff,
      message: `Discrepancia de: ${timeDiffText}, por favor revisar y actualizar.`,
    };
  } catch {
    return {
      ...comparison,
      flightData: flightInfo,
      status: 'error',
      message: 'Unable to parse scheduled arrival time',
    };
  }
};

const FlightComparisonModal = ({
  isOpen,
  onClose,
  services,
  selectedDate,
  onUpdateServiceTime,
  embedded = false,
}: FlightComparisonModalProps) => {
  const [mounted, setMounted] = useState(false);
  const [comparisons, setComparisons] = useState<FlightComparisonData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [updatingServiceId, setUpdatingServiceId] = useState<string | null>(null);
  const [activeResultTab, setActiveResultTab] = useState<ResultTab>('discrepancy');
  const [comparisonCache, setComparisonCache] = useState<Record<string, { timestamp: number; data: FlightComparisonData[] }>>({});
  const [activeCacheKey, setActiveCacheKey] = useState<string | null>(null);

  const [y, m, d] = selectedDate.split('-').map(Number);
  const date = `${m}/${d}/${y}`;

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      if (!embedded) {
        document.body.style.overflow = 'unset';
      }
      return;
    }

    if (!embedded) {
      document.body.style.overflow = 'hidden';
    }

    checkFlightTimes();

    return () => {
      if (!embedded) {
        document.body.style.overflow = 'unset';
      }
    };
  }, [isOpen, selectedDate, embedded]);

  const checkFlightTimes = async (opts?: { force?: boolean }) => {
    const force = opts?.force ?? false;
    const cacheKey = getComparisonCacheKey(services, selectedDate);
    setActiveCacheKey(cacheKey);

    if (!force) {
      const cached = comparisonCache[cacheKey];
      if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        setComparisons(cached.data);
        return;
      }
    }

    setIsLoading(true);

    const arrivalServices = services.filter((service) => service.kindOf === 'ARRIVAL' && service.flightCode);

    if (arrivalServices.length === 0) {
      const noArrival: FlightComparisonData[] = [
        {
          service: {
            id: 'no-arrivals',
            code: 'N/A',
            clientName: 'No se encontraron servicios de llegada',
            flightCode: '',
            pickupTime: '',
            serviceType: '',
          },
          status: 'not_found',
          message: 'No se encontraron servicios de llegada con códigos de vuelo para esta fecha.',
        },
      ];
      setComparisons(noArrival);
      setComparisonCache((prev) => ({ ...prev, [cacheKey]: { timestamp: Date.now(), data: noArrival } }));
      setIsLoading(false);
      return;
    }

    const initialComparisons: FlightComparisonData[] = arrivalServices.map((service) => ({
      service: {
        id: service.id,
        code: service.code,
        clientName: service.clientName,
        flightCode: service.flightCode,
        pickupTime: service.pickupTime,
        serviceType: service.serviceType,
      },
      status: 'loading',
    }));

    setComparisons(initialComparisons);

    try {
      const flightCodes = Array.from(new Set(arrivalServices.map((service) => service.flightCode).filter(Boolean)));
      const flightData = await fetchFlightTimes(flightCodes, selectedDate);

      if (!flightData || !Array.isArray(flightData)) {
        throw new Error('Flight API unavailable');
      }

      const updatedComparisons = initialComparisons.map((comparison) =>
        buildComparisonFromFlightInfo(
          comparison,
          flightData.find((flight) => flight.code === comparison.service.flightCode),
          selectedDate
        )
      );

      setComparisons(updatedComparisons);
      setComparisonCache((prev) => ({ ...prev, [cacheKey]: { timestamp: Date.now(), data: updatedComparisons } }));
    } catch (error) {
      console.error('Error checking flight times:', error);

      const failed = initialComparisons.map((comp) => ({
        ...comp,
        status: 'error' as const,
        message: 'Fallo en adquirir la información del vuelo',
      }));

      setComparisons(failed);
      setComparisonCache((prev) => ({ ...prev, [cacheKey]: { timestamp: Date.now(), data: failed } }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTime = async (serviceId: string, newTime: string) => {
    setUpdatingServiceId(serviceId);

    try {
      const service = services.find((s) => s.id === serviceId);
      if (!service) {
        throw new Error('Service not found');
      }

      const formattedTime = normalizeServiceTimeFormat(service, newTime);

      if (onUpdateServiceTime) {
        await onUpdateServiceTime(serviceId, formattedTime);
      }

      const updateComparison = (prevComparisons: FlightComparisonData[]) =>
        prevComparisons.map((comp) => {
          if (comp.service.id !== serviceId) return comp;

          return {
            ...comp,
            service: {
              ...comp.service,
              pickupTime: formattedTime,
            },
            status: 'no_discrepancy' as const,
            differenceMinutes: 0,
            message: 'Hora actualizada correctamente en caché local',
          };
        });

      setComparisons((prev) => {
        const next = updateComparison(prev);

        if (activeCacheKey) {
          setComparisonCache((cache) => {
            const active = cache[activeCacheKey];
            if (!active) return cache;

            return {
              ...cache,
              [activeCacheKey]: {
                timestamp: Date.now(),
                data: updateComparison(active.data),
              },
            };
          });
        }

        return next;
      });
    } catch (error) {
      console.error('Error updating service time:', error);
      alert('Failed to update service time. Please try again.');
    } finally {
      setUpdatingServiceId(null);
    }
  };


  const getStatusIcon = (status: ComparisonStatus) => {
    switch (status) {
      case 'loading':
        return <BsClock className="animate-spin" />;
      case 'no_discrepancy':
        return <BsCheckCircle className="text-green-500" />;
      case 'discrepancy':
        return <BsExclamationTriangle className="text-yellow-500" />;
      case 'error':
      case 'not_found':
        return <BsXCircle className="text-red-500" />;
      default:
        return <BsClock />;
    }
  };

  const getStatusColor = (status: ComparisonStatus) => {
    switch (status) {
      case 'no_discrepancy':
        return 'bg-green-50 border-green-500 dark:bg-green-400';
      case 'discrepancy':
        return 'bg-yellow-50 border-yellow-500 dark:bg-yellow-600';
      case 'error':
      case 'not_found':
        return 'bg-red-50 border-red-200 dark:bg-red-600';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const noDiffItems = comparisons.filter((item) => item.status === 'no_discrepancy');
  const discrepancyItems = comparisons.filter((item) => item.status === 'discrepancy');
  const errorItems = comparisons.filter((item) => item.status === 'error' || item.status === 'not_found');

  const tabItems: Record<ResultTab, FlightComparisonData[]> = {
    no_discrepancy: noDiffItems,
    discrepancy: discrepancyItems,
    error: errorItems,
  };

  const visibleComparisons = [...tabItems[activeResultTab]].sort((a, b) => {
    if (activeResultTab === 'discrepancy') {
      return (b.differenceMinutes || 0) - (a.differenceMinutes || 0);
    }

    return a.service.clientName.localeCompare(b.service.clientName);
  });

  const internalErrorCount = errorItems.filter((item) => isInternalError(item.message)).length;
  const externalErrorCount = errorItems.length - internalErrorCount;

  if (!embedded && !mounted) return null;
  if (!isOpen) return null;

  const panelContent = (
    <div className={`w-full max-w-6xl rounded-2xl bg-white dark:bg-navy-800 ${embedded ? 'shadow border border-slate-200/70 dark:border-slate-700/60' : 'shadow-2xl border border-slate-200/70 dark:border-slate-700/60'} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-sky-500/10 via-transparent to-transparent">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500">
              <FaPlane className="text-xl" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-navy-700 dark:text-white">
                Comparación de Horarios de Vuelos
              </h2>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-300">
                Revisa las diferencias entre las horas provistas por ST y AT con las reportadas por aeropuertos.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => checkFlightTimes({ force: true })}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs md:text-sm font-medium border border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              <BsArrowRepeat />
              Refrescar
            </button>
            <span className="hidden md:inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-medium text-slate-700 dark:text-slate-200">
              Fecha: <span className="ml-1 font-semibold">{date}</span>
            </span>
            {!embedded && (
              <button
                onClick={onClose}
                className="h-9 w-9 flex items-center justify-center rounded-xl text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 text-lg"
              >
                ×
              </button>
            )}
          </div>
        </div>

        <div className="p-4 md:p-6">
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 mb-4 md:mb-6">
            Comparando la hora de servicios de llegada con fecha del <span className="font-semibold">&quot;{date}&quot;</span>.
          </p>

          {errorItems.length > 0 && (
            <div className="mb-5 space-y-2">
              {internalErrorCount >= 2 && (
                <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  Señal: detectamos {internalErrorCount} errores internos de parseo/formato. Conviene revisar normalización de horas.
                </div>
              )}
              {externalErrorCount >= 3 && (
                <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900">
                  Señal: detectamos {externalErrorCount} errores de fuente externa (Flight API o códigos no encontrados).
                </div>
              )}
            </div>
          )}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="relative">
                <div className="h-16 w-16 rounded-full border-4 border-sky-200 dark:border-sky-900/40 dark:border-t-sky-200 border-t-sky-500 animate-spin" />
                <FaPlane className="absolute inset-0 m-auto text-sky-500 text-xl rotate-6" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-gray-700 dark:text-gray-100 font-medium">Solicitando API de FlightAware...</p>
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-300">
                  Buscando la hora exacta de los servicios de llegada.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-4 flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveResultTab('no_discrepancy')}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                    activeResultTab === 'no_discrepancy'
                      ? 'bg-green-100 border-green-400 text-green-800'
                      : 'bg-white border-slate-300 text-slate-700'
                  }`}
                >
                  Sin diferencia ({noDiffItems.length})
                </button>
                <button
                  onClick={() => setActiveResultTab('discrepancy')}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                    activeResultTab === 'discrepancy'
                      ? 'bg-amber-100 border-amber-400 text-amber-900'
                      : 'bg-white border-slate-300 text-slate-700'
                  }`}
                >
                  Diferencia encontrada ({discrepancyItems.length})
                </button>
                <button
                  onClick={() => setActiveResultTab('error')}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                    activeResultTab === 'error'
                      ? 'bg-red-100 border-red-400 text-red-900'
                      : 'bg-white border-slate-300 text-slate-700'
                  }`}
                >
                  Error ({errorItems.length})
                </button>
              </div>

              <div className="space-y-4 md:space-y-5">
                {visibleComparisons.length === 0 && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-700">
                    No hay resultados en esta pestaña.
                  </div>
                )}

                {visibleComparisons.map((comparison) => {
                  const hasFlightData = comparison.flightData && comparison.flightData.scheduled_in;

                  return (
                    <div
                      key={comparison.service.id}
                      className={`group relative rounded-2xl border p-4 md:p-5 transition-all ${getStatusColor(
                        comparison.status
                      )} hover:shadow-md hover:-translate-y-0.5`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="mt-1">{getStatusIcon(comparison.status)}</div>
                          <div>
                            <h3 className="font-semibold text-navy-700 dark:text-white text-sm md:text-base">
                              {comparison.service.clientName}{' '}
                              <span className="text-xs md:text-sm text-gray-500 dark:text-gray-300">
                                • {comparison.service.code}
                              </span>
                            </h3>
                            <div className="mt-1 flex flex-wrap items-center gap-2">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">
                                Vuelo: {comparison.service.flightCode}
                              </span>
                              {comparison.status === 'no_discrepancy' && (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-semibold">
                                  No hay diferencias visibles
                                </span>
                              )}
                              {comparison.status === 'discrepancy' && (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-semibold">
                                  Discrepancia Detectada
                                </span>
                              )}
                              {(comparison.status === 'error' || comparison.status === 'not_found') && (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-red-100 text-red-800 text-[11px] font-semibold">
                                  Problema del Vuelo
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <div className="rounded-xl border border-sky-200/60 bg-sky-50/80 dark:bg-sky-900/20 dark:border-sky-800/70 p-3 md:p-4">
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="text-[11px] font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-200">
                              Horario en el itinerario
                            </span>
                          </div>
                          <p className="text-lg md:text-2xl font-bold text-sky-900 dark:text-sky-100 leading-tight">
                            {comparison.service.pickupTime}
                          </p>
                        </div>

                        <div className="rounded-xl border border-violet-200/60 bg-violet-50/80 dark:bg-violet-900/20 dark:border-violet-800/70 p-3 md:p-4">
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="text-[11px] font-semibold uppercase tracking-wide text-violet-700 dark:text-violet-100">
                              Nuevo horario detectado (FlightAware API)
                            </span>
                          </div>
                          {hasFlightData ? (
                            <p className="text-lg md:text-2xl font-bold text-violet-900 dark:text-violet-50 leading-tight">
                              {comparison.flightData!.scheduled_in}
                            </p>
                          ) : (
                            <p className="text-sm text-violet-800/80 dark:text-violet-100/80">
                              No se encontró tiempo de llegada para este vuelo. Por favor investigar de manera independiente.
                            </p>
                          )}
                        </div>
                      </div>

                      {comparison.flightData && (
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs md:text-sm">
                          {comparison.flightData.departure_airport && (
                            <div className="rounded-lg bg-white/60 dark:bg-navy-900/40 p-2.5">
                              <span className="block text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-0.5">
                                Desde
                              </span>
                              <p className="font-medium text-gray-800 dark:text-gray-100">
                                {comparison.flightData.departure_airport}
                              </p>
                            </div>
                          )}
                          {comparison.flightData.arrival_airport && (
                            <div className="rounded-lg bg-white/60 dark:bg-navy-900/40 p-2.5">
                              <span className="block text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-0.5">
                                Hasta
                              </span>
                              <p className="font-medium text-gray-800 dark:text-gray-100">
                                {comparison.flightData.arrival_airport}
                              </p>
                            </div>
                          )}
                          {comparison.flightData.status && (
                            <div className="rounded-lg bg-white/60 dark:bg-navy-900/40 p-2.5">
                              <span className="block text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-0.5">
                                Estado
                              </span>
                              <p className="font-medium text-gray-800 dark:text-gray-100">
                                {comparison.flightData.status}
                              </p>
                            </div>
                          )}
                          {comparison.flightData.scheduled_out && (
                            <div className="rounded-lg bg-white/60 dark:bg-navy-900/40 p-2.5">
                              <span className="block text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-0.5">
                                Salida (Programada)
                              </span>
                              <p className="font-medium text-gray-800 dark:text-gray-100">
                                {comparison.flightData.scheduled_out}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {comparison.message && (
                        <p className="mt-3 text-xs md:text-sm text-gray-600 dark:text-gray-300">{comparison.message}</p>
                      )}

                      <div className="mt-4 flex items-center justify-end gap-2">
                      {comparison.status === 'discrepancy' && comparison.flightData?.scheduled_in && (
                        <div className="flex items-center justify-end">
                          <button
                            onClick={() => handleUpdateTime(comparison.service.id, comparison.flightData!.scheduled_in!)}
                            disabled={updatingServiceId === comparison.service.id}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {updatingServiceId === comparison.service.id ? (
                              <>
                                <BsClock className="animate-spin" />
                                <span>Actualizando...</span>
                              </>
                            ) : (
                              <>
                                <BsCheckCircle />
                                <span>Actualizar Hora del Servicio</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-4 md:p-6 border-t border-gray-200 dark:border-gray-700 bg-slate-50/70 dark:bg-navy-900/40">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {embedded ? 'Volver al Itinerario' : 'Close'}
          </button>
        </div>
      </div>
  );

  if (embedded) {
    return panelContent;
  }

  const modalContent = (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {panelContent}
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default FlightComparisonModal;

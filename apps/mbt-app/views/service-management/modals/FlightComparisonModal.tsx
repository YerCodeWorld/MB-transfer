"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { fetchFlightTimes } from '@/utils/services';
import { FlightInfo } from '@/types/services';
import { convertIsoStringTo12h, convertTo12Hour } from '@/utils/services';
import LoadingStep from '@/components/shared/loading-step';

import { BsClock, BsCheckCircle, BsExclamationTriangle, BsXCircle, BsArrowRepeat } from 'react-icons/bs';
import { HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi';
import { FaPlane } from 'react-icons/fa';

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
const MAX_SELECTED_SERVICES = 5;

const getComparisonCacheKey = (services: any[], selectedDate: string, selectedServiceIds: string[]): string => {
  const selectedIds = new Set(selectedServiceIds);
  const arrivalSignature = services
    .filter((service) => service.kindOf === 'ARRIVAL' && service.flightCode && selectedIds.has(service.id))
    .map((service) => `${service.id || service.code || 'unknown'}:${service.flightCode}:${service.pickupTime}`)
    .sort()
    .join('|');

  return `${selectedDate}::${arrivalSignature}`;
};

const isIsoLikeDateTime = (value?: string) =>
  typeof value === 'string' && (/^\d{4}-\d{2}-\d{2}[T\s]/.test(value) || value.endsWith('Z'));

const formatServiceDisplayTime = (value: string | undefined): string => {
  if (!value) return 'N/A';
  const input = String(value).trim();

  if (isIsoLikeDateTime(input)) {
    // Keep same clock semantics used by service tables to avoid cross-view drifts.
    return convertIsoStringTo12h(input);
  }

  if (/(\d{1,2}):(\d{2})\s*(AM|PM)/i.test(input)) {
    return input.toUpperCase().replace(/\s+/g, ' ');
  }

  if (/^\d{1,2}:\d{2}(?::\d{2})?$/.test(input)) {
    return convertTo12Hour(input);
  }

  return input;
};

const displayTimeToMinutes = (displayTime: string): number => {
  const input = String(displayTime || '').trim();
  const ampm = input.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (ampm) {
    let hours = Number(ampm[1]);
    const minutes = Number(ampm[2]);
    const period = ampm[3].toUpperCase();
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  }

  const hhmm = input.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (hhmm) {
    return Number(hhmm[1]) * 60 + Number(hhmm[2]);
  }

  throw new Error('Invalid display time');
};

const normalizeServiceTimeFormat = (service: any, newTime: string, selectedDate: string): string => {
  const normalizedDisplay = formatServiceDisplayTime(newTime, service?.serviceType);
  const match = normalizedDisplay.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return newTime;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  const serviceType = (service.serviceType || '').toLowerCase();

  if (serviceType === 'at') {
    // AT flow in this project has been handled with clock-preserving ISO.
    const [y, m, d] = selectedDate.split('-');
    const hh = String(hours).padStart(2, '0');
    const mm = String(minutes).padStart(2, '0');
    return `${y}-${m}-${d}T${hh}:${mm}:00.000Z`;
  }

  if (serviceType === 'st' || serviceType === 'mbt') {
    const [y, m, d] = selectedDate.split('-');
    const hh = String(hours).padStart(2, '0');
    const mm = String(minutes).padStart(2, '0');
    return `${y}-${m}-${d}T${hh}:${mm}:00.000Z`;
  }

  if (service.pickupTime?.includes('AM') || service.pickupTime?.includes('PM')) {
    const normalizedMinutes = String(minutes).padStart(2, '0');
    const hour12 = hours % 12 || 12;
    const nextPeriod = hours >= 12 ? 'PM' : 'AM';
    return `${hour12}:${normalizedMinutes} ${nextPeriod}`;
  }

  if (service.pickupTime?.includes('T')) {
    const [y, m, d] = selectedDate.split('-');
    const hh = String(hours).padStart(2, '0');
    const mm = String(minutes).padStart(2, '0');
    return `${y}-${m}-${d}T${hh}:${mm}:00.000Z`;
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
  flightInfo: FlightInfo | undefined
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
    const serviceDisplay = formatServiceDisplayTime(comparison.service.pickupTime, comparison.service.serviceType);
    const flightDisplay = formatServiceDisplayTime(flightInfo.scheduled_in, comparison.service.serviceType);
    const serviceMinutes = displayTimeToMinutes(serviceDisplay);
    const flightMinutes = displayTimeToMinutes(flightDisplay);
    const minutesDiff = Math.abs(serviceMinutes - flightMinutes);

    if (minutesDiff === 0) {
      return {
        ...comparison,
        flightData: flightInfo,
        status: 'no_discrepancy',
        differenceMinutes: minutesDiff,
        message: 'Misma hora detectada',
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
  const [activeChunkIndex, setActiveChunkIndex] = useState(0);

  const [y, m, d] = selectedDate.split('-').map(Number);
  const date = `${m}/${d}/${y}`;
  const arrivalServices = useMemo(
    () => services.filter((service) => service.kindOf === 'ARRIVAL' && service.flightCode),
    [services]
  );
  const arrivalServiceChunks = useMemo(() => {
    const chunks: typeof arrivalServices[] = [];

    for (let index = 0; index < arrivalServices.length; index += MAX_SELECTED_SERVICES) {
      chunks.push(arrivalServices.slice(index, index + MAX_SELECTED_SERVICES));
    }

    return chunks;
  }, [arrivalServices]);
  const activeChunkServices = useMemo(
    () => arrivalServiceChunks[activeChunkIndex] ?? [],
    [activeChunkIndex, arrivalServiceChunks]
  );
  const activeChunkServiceIds = useMemo(
    () => activeChunkServices.map((service) => service.id),
    [activeChunkServices]
  );

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setActiveChunkIndex(0);
      setComparisons([]);
      return;
    }
    setActiveChunkIndex((prev) => Math.min(prev, Math.max(arrivalServiceChunks.length - 1, 0)));
  }, [arrivalServiceChunks.length, isOpen]);

  const checkFlightTimes = useCallback(async (opts?: { force?: boolean; serviceIds?: string[] }) => {
    const force = opts?.force ?? false;
    const effectiveServiceIds = (opts?.serviceIds ?? activeChunkServiceIds).slice(0, MAX_SELECTED_SERVICES);
    const cacheKey = getComparisonCacheKey(services, selectedDate, effectiveServiceIds);
    setActiveCacheKey(cacheKey);

    if (!force) {
      const cached = comparisonCache[cacheKey];
      if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        setComparisons(cached.data);
        return;
      }
    }

    setIsLoading(true);

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

    if (effectiveServiceIds.length === 0) {
      setComparisons([]);
      setIsLoading(false);
      return;
    }

    const targetServices = arrivalServices.filter((service) => effectiveServiceIds.includes(service.id));

    const initialComparisons: FlightComparisonData[] = targetServices.map((service) => ({
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
      const flightCodes = Array.from(new Set(targetServices.map((service) => service.flightCode).filter(Boolean)));
      const flightData = await fetchFlightTimes(flightCodes, selectedDate);

      if (!flightData || !Array.isArray(flightData)) {
        throw new Error('Flight API unavailable');
      }

      const updatedComparisons = initialComparisons.map((comparison) =>
        buildComparisonFromFlightInfo(
          comparison,
          flightData.find((flight) => flight.code === comparison.service.flightCode)
        )
      );

      setComparisons(updatedComparisons);
      setComparisonCache((prev) => ({ ...prev, [cacheKey]: { timestamp: Date.now(), data: updatedComparisons } }));
      if (updatedComparisons.some((item) => item.status === 'discrepancy')) {
        setActiveResultTab('discrepancy');
      } else if (updatedComparisons.some((item) => item.status === 'error' || item.status === 'not_found')) {
        setActiveResultTab('error');
      } else {
        setActiveResultTab('no_discrepancy');
      }
    } catch (error) {
      console.error('Error checking flight times:', error);

      const failed = initialComparisons.map((comp) => ({
        ...comp,
        status: 'error' as const,
        message: 'Fallo en adquirir la información del vuelo',
      }));

      setComparisons(failed);
      setComparisonCache((prev) => ({ ...prev, [cacheKey]: { timestamp: Date.now(), data: failed } }));
      setActiveResultTab('error');
    } finally {
      setIsLoading(false);
    }
  }, [activeChunkServiceIds, arrivalServices, comparisonCache, selectedDate, services]);



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

    return () => {
      if (!embedded) {
        document.body.style.overflow = 'unset';
      }
    };
  }, [isOpen, embedded]);

  const handleUpdateTime = async (serviceId: string, newTime: string) => {
    setUpdatingServiceId(serviceId);

    try {
      const service = services.find((s) => s.id === serviceId);
      if (!service) {
        throw new Error('Service not found');
      }

      const formattedTime = normalizeServiceTimeFormat(service, newTime, selectedDate);

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
        return 'border-emerald-300 bg-emerald-50/80 dark:border-emerald-700/60 dark:bg-emerald-950/20';
      case 'discrepancy':
        return 'border-amber-300 bg-amber-50/80 dark:border-amber-700/60 dark:bg-amber-950/20';
      case 'error':
      case 'not_found':
        return 'border-red-300 bg-red-50/80 dark:border-red-700/60 dark:bg-red-950/20';
      default:
        return 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/30';
    }
  };

  const getStatusBadgeClassName = (status: ComparisonStatus) => {
    switch (status) {
      case 'no_discrepancy':
        return 'border-emerald-200 bg-emerald-100 text-emerald-900 dark:border-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-100';
      case 'discrepancy':
        return 'border-amber-200 bg-amber-100 text-amber-950 dark:border-amber-700 dark:bg-amber-900/40 dark:text-amber-100';
      case 'error':
      case 'not_found':
        return 'border-red-200 bg-red-100 text-red-900 dark:border-red-700 dark:bg-red-900/40 dark:text-red-100';
      default:
        return 'border-slate-200 bg-slate-100 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100';
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
  const tabMeta: Array<{ key: ResultTab; label: string; tone: string }> = [
    { key: 'no_discrepancy', label: 'Sin diferencia', tone: 'emerald' },
    { key: 'discrepancy', label: 'Diferencia encontrada', tone: 'amber' },
    { key: 'error', label: 'Error', tone: 'red' },
  ];

  const visibleComparisons = [...tabItems[activeResultTab]].sort((a, b) => {
    if (activeResultTab === 'discrepancy') {
      return (b.differenceMinutes || 0) - (a.differenceMinutes || 0);
    }

    return a.service.clientName.localeCompare(b.service.clientName);
  });

  const internalErrorCount = errorItems.filter((item) => isInternalError(item.message)).length;
  const externalErrorCount = errorItems.length - internalErrorCount;

  const getTabButtonClassName = (tab: ResultTab, isActive: boolean, hasResults: boolean) => {
    const base =
      'relative flex min-h-[72px] flex-col items-center justify-center gap-1 overflow-hidden border-r px-3 py-3 text-center text-xs font-semibold transition last:border-r-0';

    if (isActive) {
      if (tab === 'no_discrepancy') {
        return `${base} border-emerald-300 bg-emerald-600 text-white dark:border-emerald-500`;
      }

      if (tab === 'discrepancy') {
        return `${base} border-amber-300 bg-amber-500 text-slate-950 dark:border-amber-400`;
      }

      return `${base} border-red-300 bg-red-600 text-white dark:border-red-500`;
    }

    if (tab === 'no_discrepancy') {
      return `${base} border-slate-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100 dark:border-slate-700 dark:bg-emerald-950/30 dark:text-emerald-100 dark:hover:bg-emerald-950/50 ${hasResults ? 'tab-result-pulse' : ''}`;
    }

    if (tab === 'discrepancy') {
      return `${base} border-slate-200 bg-amber-50 text-amber-950 hover:bg-amber-100 dark:border-slate-700 dark:bg-amber-950/30 dark:text-amber-100 dark:hover:bg-amber-950/50 ${hasResults ? 'tab-result-pulse' : ''}`;
    }

    return `${base} border-slate-200 bg-red-50 text-red-900 hover:bg-red-100 dark:border-slate-700 dark:bg-red-950/30 dark:text-red-100 dark:hover:bg-red-950/50 ${hasResults ? 'tab-result-pulse' : ''}`;
  };

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
              disabled={activeChunkServices.length === 0 || isLoading}
              className="inline-flex items-center gap-2 border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
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
          {!isLoading ? (
          <div className="mb-6 border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700/60 dark:bg-navy-900/30">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  Lote activo para comparar
                </p>
                <p className="mt-1 text-xs md:text-sm text-slate-600 dark:text-slate-300">
                  Navegue los servicios en bloques de hasta {MAX_SELECTED_SERVICES} elementos y compare solo el lote visible para evitar errores de demasiadas solicitudes en FlightAware.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700 dark:border-slate-600 dark:bg-navy-800 dark:text-slate-200">
                  {arrivalServiceChunks.length > 0 ? `Lote ${activeChunkIndex + 1}/${arrivalServiceChunks.length}` : 'Sin servicios'}
                </span>
                <button
                  onClick={() => checkFlightTimes({ force: true, serviceIds: activeChunkServiceIds })}
                  disabled={activeChunkServices.length === 0 || isLoading}
                  className="inline-flex items-center gap-2 border border-sky-300 bg-sky-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FaPlane className="text-xs" />
                  Comparar lote
                </button>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3 border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-navy-800">
              <button
                type="button"
                onClick={() => setActiveChunkIndex((prev) => Math.max(prev - 1, 0))}
                disabled={activeChunkIndex === 0}
                className="inline-flex h-10 w-10 items-center justify-center border border-slate-300 text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-navy-700"
              >
                <HiOutlineChevronLeft className="text-lg" />
              </button>

              <div className="min-w-0 flex-1 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                  Servicios incluidos en este lote
                </p>
                <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">
                  {activeChunkServices.length > 0
                    ? `${activeChunkServices.length} servicio(s) listos para consultar`
                    : 'No hay servicios ARRIVAL disponibles'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveChunkIndex((prev) => Math.min(prev + 1, Math.max(arrivalServiceChunks.length - 1, 0)))}
                disabled={activeChunkIndex >= arrivalServiceChunks.length - 1}
                className="inline-flex h-10 w-10 items-center justify-center border border-slate-300 text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-navy-700"
              >
                <HiOutlineChevronRight className="text-lg" />
              </button>
            </div>

            <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
              {arrivalServices.length === 0 ? (
                <div className="border border-dashed border-slate-300 bg-white px-4 py-3 text-sm text-slate-600 dark:border-slate-600 dark:bg-navy-800 dark:text-slate-300">
                  No hay servicios ARRIVAL con código de vuelo disponible para esta fecha.
                </div>
              ) : (
                activeChunkServices.map((service) => (
                  <div
                    key={service.id}
                    className="border border-slate-200 bg-white px-4 py-4 text-sm shadow-[0_10px_30px_rgba(15,23,42,0.04)] dark:border-slate-700 dark:bg-navy-800 dark:shadow-none"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 dark:text-slate-100">
                          {service.clientName}
                        </p>
                        <p className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                          Servicio {service.code}
                        </p>
                      </div>
                      <span className="shrink-0 border border-sky-200 bg-sky-50 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-sky-800 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-100">
                        {service.flightCode}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-navy-900/40">
                        <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                          Hora actual
                        </span>
                        <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {formatServiceDisplayTime(service.pickupTime)}
                        </p>
                      </div>
                      <div className="border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-navy-900/40">
                        <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                          Tipo
                        </span>
                        <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {service.serviceType || 'ARRIVAL'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          ) : null}

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
            <LoadingStep
              isLoading
              variant="inline"
              title="Consultando FlightAware"
              description={`Buscando horarios para ${activeChunkServices.length} servicio(s) del lote activo.`}
              currentStep="Comparando horas de llegada"
              steps={[
                { label: 'Preparar lote activo', status: 'completed' },
                { label: 'Consultar FlightAware', status: 'active' },
                { label: 'Clasificar resultados', status: 'pending' },
              ]}
              panelClassName="max-w-2xl"
              minHeightClassName="min-h-[420px]"
            />
          ) : (
            <>
              <div className="mb-4 grid grid-cols-3 border border-slate-200 dark:border-slate-700">
                {tabMeta.map((tab) => {
                  const count = tabItems[tab.key].length;
                  const isActive = activeResultTab === tab.key;
                  const hasResults = count > 0;

                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveResultTab(tab.key)}
                      className={getTabButtonClassName(tab.key, isActive, hasResults)}
                    >
                      <span>{tab.label}</span>
                      <span className={`text-[11px] ${isActive ? 'text-white/80 dark:text-slate-600' : 'text-slate-500 dark:text-slate-400'}`}>
                        {count} resultado(s)
                      </span>
                      {!isActive && hasResults ? <span className="tab-result-bar absolute inset-x-0 bottom-0 h-1 bg-current opacity-80" /> : null}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-4 md:space-y-5">
                {visibleComparisons.length === 0 && (
                  <div className="border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-700 dark:border-slate-700 dark:bg-navy-900/30 dark:text-slate-200">
                    {comparisons.length === 0
                      ? 'Seleccione un lote y ejecute la comparación para ver resultados.'
                      : 'No hay resultados en esta pestaña.'}
                  </div>
                )}

                {visibleComparisons.map((comparison) => {
                  const hasFlightData = comparison.flightData && comparison.flightData.scheduled_in;
                  const statusLabel =
                    comparison.status === 'no_discrepancy'
                      ? 'Sin diferencia'
                      : comparison.status === 'discrepancy'
                      ? 'Discrepancia'
                      : 'Error de vuelo';

                  return (
                    <div
                      key={comparison.service.id}
                      className={`group relative border p-5 md:p-6 transition-all ${getStatusColor(
                        comparison.status
                      )} shadow-[0_14px_34px_rgba(15,23,42,0.05)] hover:shadow-[0_18px_38px_rgba(15,23,42,0.08)] dark:shadow-none`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-black/5 pb-4 dark:border-white/10">
                        <div className="flex min-w-0 items-start gap-3">
                          <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center border border-black/10 bg-white/70 text-base dark:border-white/10 dark:bg-white/5">
                            {getStatusIcon(comparison.status)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                              <h3 className="text-sm font-semibold text-navy-700 dark:text-white md:text-base">
                                {comparison.service.clientName}
                              </h3>
                              <span className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                                {comparison.service.code}
                              </span>
                            </div>
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              <span className="inline-flex items-center border border-sky-200 bg-sky-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-sky-900 dark:border-sky-700 dark:bg-sky-900/40 dark:text-sky-100">
                                Vuelo {comparison.service.flightCode}
                              </span>
                              <span className={`inline-flex items-center border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${getStatusBadgeClassName(comparison.status)}`}>
                                {statusLabel}
                              </span>
                              {typeof comparison.differenceMinutes === 'number' && comparison.differenceMinutes > 0 ? (
                                <span className="inline-flex items-center border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-700 dark:border-slate-600 dark:bg-navy-900 dark:text-slate-200">
                                  Delta {comparison.differenceMinutes} min
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 grid gap-4 md:grid-cols-2">
                        <div className="border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-navy-900/40">
                          <div className="mb-2 flex items-center justify-between gap-2">
                            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                              Horario en el itinerario
                            </span>
                          </div>
                          <p className="text-lg font-semibold leading-tight text-slate-950 dark:text-slate-100 md:text-2xl">
                            {formatServiceDisplayTime(comparison.service.pickupTime)}
                          </p>
                        </div>

                        <div className="border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-navy-900/40">
                          <div className="mb-2 flex items-center justify-between gap-2">
                            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                              Nuevo horario detectado (FlightAware API)
                            </span>
                          </div>
                          {hasFlightData ? (
                            <p className="text-lg font-semibold leading-tight text-slate-950 dark:text-slate-100 md:text-2xl">
                              {formatServiceDisplayTime(comparison.flightData!.scheduled_in)}
                            </p>
                          ) : (
                            <p className="text-sm text-slate-600 dark:text-slate-300">
                              No se encontró tiempo de llegada para este vuelo. Por favor investigar de manera independiente.
                            </p>
                          )}
                        </div>
                      </div>

                      {comparison.flightData && (
                        <div className="mt-4 grid grid-cols-1 gap-3 text-xs md:grid-cols-2 md:text-sm xl:grid-cols-4">
                          {comparison.flightData.departure_airport && (
                            <div className="border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-navy-900/40">
                              <span className="mb-1 block text-[11px] uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
                                Desde
                              </span>
                              <p className="font-medium text-gray-800 dark:text-gray-100">
                                {comparison.flightData.departure_airport}
                              </p>
                            </div>
                          )}
                          {comparison.flightData.arrival_airport && (
                            <div className="border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-navy-900/40">
                              <span className="mb-1 block text-[11px] uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
                                Hasta
                              </span>
                              <p className="font-medium text-gray-800 dark:text-gray-100">
                                {comparison.flightData.arrival_airport}
                              </p>
                            </div>
                          )}
                          {comparison.flightData.status && (
                            <div className="border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-navy-900/40">
                              <span className="mb-1 block text-[11px] uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
                                Estado
                              </span>
                              <p className="font-medium text-gray-800 dark:text-gray-100">
                                {comparison.flightData.status}
                              </p>
                            </div>
                          )}
                          {comparison.flightData.scheduled_out && (
                            <div className="border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-navy-900/40">
                              <span className="mb-1 block text-[11px] uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
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
                        <div className="mt-4 border-l-2 border-black/10 pl-3 text-xs md:text-sm text-gray-600 dark:border-white/10 dark:text-gray-300">
                          {comparison.message}
                        </div>
                      )}

                      <div className="mt-4 flex items-center justify-end gap-2">
                      {comparison.status === 'discrepancy' && comparison.flightData?.scheduled_in && (
                        <div className="flex items-center justify-end">
                          <button
                            onClick={() => handleUpdateTime(comparison.service.id, comparison.flightData!.scheduled_in!)}
                            disabled={updatingServiceId === comparison.service.id}
                            className="inline-flex items-center gap-2 border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
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

  const styledModalContent = (
    <>
      {modalContent}
      <style jsx>{`
        .tab-result-pulse::after {
          content: "";
          position: absolute;
          inset: auto 0 0 0;
          height: 4px;
          background: currentColor;
          opacity: 0.55;
          animation: tabWidePulse 1.4s ease-in-out infinite;
        }

        .tab-result-bar {
          animation: tabWidePulse 1.4s ease-in-out infinite;
        }

        @keyframes tabWidePulse {
          0% {
            opacity: 0.22;
            transform: scaleX(0.35);
            transform-origin: center;
          }
          50% {
            opacity: 0.9;
            transform: scaleX(1);
            transform-origin: center;
          }
          100% {
            opacity: 0.22;
            transform: scaleX(0.35);
            transform-origin: center;
          }
        }
      `}</style>
    </>
  );

  return createPortal(styledModalContent, document.body);
};

export default FlightComparisonModal;

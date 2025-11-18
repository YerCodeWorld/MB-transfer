"use client";

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { BsClock, BsCheckCircle, BsExclamationTriangle, BsXCircle } from 'react-icons/bs';
import { FaPlane } from 'react-icons/fa';
import { fetchFlightTimes, convertIsoStringTo12h } from '../../utils/services';
import { FlightInfo } from '../../types/services';

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
  status: 'loading' | 'found' | 'not_found' | 'error' | 'no_discrepancy' | 'discrepancy';
  message?: string;
}

interface FlightComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  services: any[];
  selectedDate: string;
}

const FlightComparisonModal = ({ isOpen, onClose, services, selectedDate }: FlightComparisonModalProps) => {
  const [mounted, setMounted] = useState(false);
  const [comparisons, setComparisons] = useState<FlightComparisonData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [y, m, d] = selectedDate.split('-').map(Number);
  const date = `${m}/${d}/${y}`;          

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      checkFlightTimes();
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const checkFlightTimes = async () => {
    setIsLoading(true);
    
    // Filter services that are arrivals and have flight codes
    const arrivalServices = services.filter(service => 
      service.kindOf === 'ARRIVAL' && service.flightCode
    );

    if (arrivalServices.length === 0) {
      setComparisons([{
        service: {
          id: 'no-arrivals',
          code: 'N/A',
          clientName: 'No arrival services found',
          flightCode: '',
          pickupTime: '',
          serviceType: ''
        },
        status: 'not_found',
        message: 'No arrival services with flight codes found for the selected date.'
      }]);
      setIsLoading(false);
      return;
    }

    // Initialize comparison data
    const initialComparisons: FlightComparisonData[] = arrivalServices.map(service => ({
      service: {
        id: service.id,
        code: service.code,
        clientName: service.clientName,
        flightCode: service.flightCode,
        pickupTime: service.pickupTime,
        serviceType: service.serviceType
      },
      status: 'loading'
    }));

    setComparisons(initialComparisons);

    try {
      // Get all flight codes
      const flightCodes = arrivalServices.map(service => service.flightCode);
      
      // Fetch flight data from FlightAware API
      const flightData = await fetchFlightTimes(flightCodes);

      // Compare and update status
      const updatedComparisons = initialComparisons.map(comparison => {
        const flightInfo = flightData.find(flight => flight.code === comparison.service.flightCode);        
        
        if (!flightInfo) {
          return {
            ...comparison,
            status: 'not_found' as const,
            message: 'Flight not found in FlightAware database'
          };
        }

        if (flightInfo.error) {
          return {
            ...comparison,
            flightData: flightInfo,
            status: 'error' as const,
            message: `Error fetching flight data: ${flightInfo.error}`
          };
        }

        if (flightInfo.message) {
          return {
            ...comparison,
            flightData: flightInfo,
            status: 'not_found' as const,
            message: flightInfo.message 
          };
        }
        
        if (flightInfo.status && flightInfo.status.toLowerCase().includes('cancelled')) {
          return {
            ...comparison,
            flightData: flightInfo,
            status: 'error' as const,
            message: `Flight ${flightInfo.code} has been cancelled`
          };
        }

        // Compare times
        const scheduledIn = flightInfo.scheduled_in;
        
        if (!scheduledIn) {
          return {
            ...comparison,
            flightData: flightInfo,
            status: 'not_found' as const,
            message: 'No scheduled arrival time available'
          };
        }

        // Parse times properly using Santo Domingo timezone
        let flightTime: Date;
        let serviceTime: Date;
        
        try {
          const serviceTimeString = comparison.service.pickupTime;
          const [selectedYear, selectedMonth, selectedDay] = selectedDate.split('-').map(Number);
          
          // Handle different time formats based on service type
          if (serviceTimeString.includes('T')) {
            // Airport Transfer (AT) - ISO format (2024-11-17T14:30:00Z)
            const [datePart, timePart] = serviceTimeString.replace("Z", "").split("T");
            const [year, month, day] = datePart.split("-").map(Number);
            const [h, m] = timePart.split(":").map(Number);
            serviceTime = new Date(year, month - 1, day, h, m);
          } else if (serviceTimeString.includes('AM') || serviceTimeString.includes('PM')) {
            // Sacbé Transfer (ST) - 12-hour format (12:30:00 PM)
            const match = serviceTimeString.trim().match(/(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)/i);
            if (match) {
              let hours = parseInt(match[1]);
              const minutes = parseInt(match[2]);
              const period = match[3].toUpperCase();
              
              if (period === 'PM' && hours !== 12) hours += 12;
              if (period === 'AM' && hours === 12) hours = 0;
              
              serviceTime = new Date(selectedYear, selectedMonth - 1, selectedDay, hours, minutes);
            } else {
              throw new Error('Invalid 12-hour time format');
            }
          } else {
            // MB Transfer (MBT) - Simple time format (11:30)
            const timeParts = serviceTimeString.split(':');
            if (timeParts.length >= 2) {
              const hours = parseInt(timeParts[0]);
              const minutes = parseInt(timeParts[1]);
              serviceTime = new Date(selectedYear, selectedMonth - 1, selectedDay, hours, minutes);
            } else {
              throw new Error('Invalid time format');
            }
          }
          
          // FlightAware time is already in 12-hour format for Santo Domingo timezone
          // Parse it by combining with the selected date

          const timeStr = scheduledIn.trim();

          // Manual parsing for 12-hour format to ensure consistent timezone handling
          const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
          if (match) {
            let hours = parseInt(match[1]);
            const minutes = parseInt(match[2]);
            const period = match[3].toUpperCase();
            
            if (period === 'PM' && hours !== 12) hours += 12;
            if (period === 'AM' && hours === 12) hours = 0;
            
            // Create flight time in local timezone (Santo Domingo)
            flightTime = new Date(selectedYear, selectedMonth - 1, selectedDay, hours, minutes);
          } else {
            throw new Error('Invalid time format');
          }
          
        } catch (error) {
          return {
            ...comparison,
            flightData: flightInfo,
            status: 'error' as const,
            message: 'Unable to parse scheduled arrival time'
          };
        }

        if (isNaN(flightTime.getTime()) || isNaN(serviceTime.getTime())) {
          return {
            ...comparison,
            flightData: flightInfo,
            status: 'error' as const,
            message: 'Invalid time format for comparison'
          };
        }
        
        const timeDiff = Math.abs(serviceTime.getTime() - flightTime.getTime());
        const hoursDiff = timeDiff / (1000 * 60 * 60);

        if (hoursDiff <= 2) {
          return {
            ...comparison,
            flightData: flightInfo,
            status: 'no_discrepancy' as const,
            message: `Times match (within 2 hours difference)`
          };
        } else {
          return {
            ...comparison,
            flightData: flightInfo,
            status: 'discrepancy' as const,
            message: `Time discrepancy: ${hoursDiff.toFixed(1)} hours difference`
          };
        }
      });

      setComparisons(updatedComparisons);
    } catch (error) {
      console.error('Error checking flight times:', error);
      setComparisons(prev => prev.map(comp => ({
        ...comp,
        status: 'error' as const,
        message: 'Failed to fetch flight data'
      })));
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
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

  const getStatusColor = (status: string) => {
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

  if (!mounted || !isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-6xl rounded-2xl bg-white dark:bg-navy-800 shadow-2xl max-h-[90vh] overflow-y-auto border border-slate-200/70 dark:border-slate-700/60">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-sky-500/10 via-transparent to-transparent">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500">
              <FaPlane className="text-xl" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-navy-700 dark:text-white">
                Comparación de Horas de los Vuelos
              </h2>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-300">
                Revisa diferencias entre tu hora de servicio y la hora de llegada de FlightAware.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden md:inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-medium text-slate-700 dark:text-slate-200">
              Fecha: <span className="ml-1 font-semibold">{date}</span>
            </span>
            <button
              onClick={onClose}
              className="h-9 w-9 flex items-center justify-center rounded-xl text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 text-lg"
            >
              ×
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 md:p-6">
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 mb-4 md:mb-6">
            Comparando las horas de recogida de los servicios de llegada del <span className="font-semibold">{date}</span>.
          </p>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="relative">
                <div className="h-16 w-16 rounded-full border-4 border-sky-200 dark:border-sky-900/40 border-t-sky-500 animate-spin" />
                <FaPlane className="absolute inset-0 m-auto text-sky-500 text-xl rotate-6" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-gray-700 dark:text-gray-100 font-medium">
                  Consultando FlightAware API...
                </p>
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-300">
                  Buscando horarios de llegada para los vuelos de tus servicios.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 md:space-y-5">
              {comparisons.map((comparison) => {
                const hasFlightData =
                  comparison.flightData && comparison.flightData.scheduled_in;

                return (
                  <div
                    key={comparison.service.id}
                    className={`group relative rounded-2xl border p-4 md:p-5 transition-all ${getStatusColor(
                      comparison.status
                    )} hover:shadow-md hover:-translate-y-0.5`}
                  >
                    {/* Top row: client + flight + status */}
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {getStatusIcon(comparison.status)}
                        </div>
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
                                Sin diferencia visible
                              </span>
                            )}
                            {comparison.status === 'discrepancy' && (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-semibold">
                                Posible discrepancia
                              </span>
                            )}
                            {(comparison.status === 'error' ||
                              comparison.status === 'not_found') && (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-red-100 text-red-800 text-[11px] font-semibold">
                                Problema con el vuelo
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1 text-xs md:text-[11px] text-gray-500 dark:text-gray-300">
                        <div className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1">
                          <span className="h-2 w-2 rounded-full bg-sky-500" />
                          <span>Servicio</span>
                          <span className="mx-1 text-[10px] text-slate-400">vs</span>
                          <span className="h-2 w-2 rounded-full bg-purple-500" />
                          <span>FlightAware API</span>
                        </div>
                      </div>
                    </div>

                    {/* Time comparison: two columns */}
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      {/* Company / Servicio column */}
                      <div className="rounded-xl border border-sky-200/60 bg-sky-50/80 dark:bg-sky-900/20 dark:border-sky-800/70 p-3 md:p-4">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-[11px] font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-200">
                            Hora en el Servicio
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-200">
                            Tu Empresa
                          </span>
                        </div>
                        <p className="text-lg md:text-2xl font-bold text-sky-900 dark:text-sky-100 leading-tight">
                          {comparison.service.pickupTime}
                        </p>
                      </div>

                      {/* FlightAware column */}
                      <div className="rounded-xl border border-purple-200/60 bg-purple-50/80 dark:bg-purple-900/20 dark:border-purple-800/70 p-3 md:p-4">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-[11px] font-semibold uppercase tracking-wide text-purple-700 dark:text-purple-100">
                            Hora de Llegada (FlightAware)
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-100">
                            FlightAware API
                          </span>
                        </div>
                        {hasFlightData ? (
                          <p className="text-lg md:text-2xl font-bold text-purple-900 dark:text-purple-50 leading-tight">
                            {comparison.flightData!.scheduled_in}
                          </p>
                        ) : (
                          <p className="text-sm text-purple-800/80 dark:text-purple-100/80">
                            No se encontró una hora de llegada para este vuelo.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Extra flight details */}
                    {comparison.flightData && (
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs md:text-sm">
                        {comparison.flightData.departure_airport && (
                          <div className="rounded-lg bg-white/60 dark:bg-navy-900/40 p-2.5">
                            <span className="block text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-0.5">
                              From
                            </span>
                            <p className="font-medium text-gray-800 dark:text-gray-100">
                              {comparison.flightData.departure_airport}
                            </p>
                          </div>
                        )}
                        {comparison.flightData.arrival_airport && (
                          <div className="rounded-lg bg-white/60 dark:bg-navy-900/40 p-2.5">
                            <span className="block text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-0.5">
                              To
                            </span>
                            <p className="font-medium text-gray-800 dark:text-gray-100">
                              {comparison.flightData.arrival_airport}
                            </p>
                          </div>
                        )}
                        {comparison.flightData.status && (
                          <div className="rounded-lg bg-white/60 dark:bg-navy-900/40 p-2.5">
                            <span className="block text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-0.5">
                              Status
                            </span>
                            <p className="font-medium text-gray-800 dark:text-gray-100">
                              {comparison.flightData.status}
                            </p>
                          </div>
                        )}
                        {comparison.flightData.scheduled_out && (
                          <div className="rounded-lg bg-white/60 dark:bg-navy-900/40 p-2.5">
                            <span className="block text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-0.5">
                              Departure (Sched.)
                            </span>
                            <p className="font-medium text-gray-800 dark:text-gray-100">
                              {comparison.flightData.scheduled_out}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Message */}
                    {comparison.message && (
                      <p className="mt-3 text-xs md:text-sm text-gray-600 dark:text-gray-300">
                        {comparison.message}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 md:p-6 border-t border-gray-200 dark:border-gray-700 bg-slate-50/70 dark:bg-navy-900/40">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default FlightComparisonModal;

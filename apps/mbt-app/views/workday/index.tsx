"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useBottomBar } from "@/contexts/BottomBarContext";
import { useServiceData } from "@/contexts/ServiceDataContext";
import { useAuth } from "@/contexts/AuthContext";

import { apiClient } from "@/utils/api";

import {
	HiOutlineChevronLeft,
	HiOutlineChevronRight,
	HiOutlineClock,
	HiOutlineRefresh,
} from "react-icons/hi";

import { WorkdayStatus, ServiceState, WorkdayServiceApiItem, DriverOption, WorkdaySimulation } from "./types";
import { buildMockWorkdayData } from "./mock";
import { getTimelineRange, formatServiceTime, clampIndex, mapService, formatSelectedDateLabel, formatTimelineTick, mapRoute } from "./utils";

import MockPanel from "./mock/mockPanel";
import { STATUS_TABS, STATUS_STYLES } from "./utils/constants";
import LoadingStep from "@/components/shared/loading-step";

export default function WorkdayView() {
 
	const { employee } = useAuth();

	const { selectedDate } = useServiceData();
	const { setActions, clearActions } = useBottomBar();

	// flag for tab functionality
	const [activeStatus, setActiveStatus] = useState<WorkdayStatus>("ongoing");

	// help for our carouse-like logic
	const [activeCardIndex, setActiveCardIndex] = useState<Record<WorkdayStatus, number>>({
		past: 0,
		ongoing: 0,
		upcoming: 0,
	});
	
	// gotta map the services here
	const [servicesByBucket, setServicesByBucket] = useState<Record<WorkdayStatus, WorkdayService[]>>({
		past: [],
		ongoing: [],
		upcoming: [],
	});

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [notifyCount, setNotifyCount] = useState(0);
	const [drivers, setDrivers] = useState<DriverOption[]>([]);
	const [savingById, setSavingById] = useState<Record<string, boolean>>({});
	const [dirtyById, setDirtyById] = useState<Record<string, boolean>>({});
	const [saveMessageById, setSaveMessageById] = useState<Record<string, string>>({});

	const [simulation, setSimulation] = useState<WorkdaySimulation>({
		enabled: false,
		date: selectedDate,
		time: "13:15",
	});

	const visibleServices = useMemo(
		() => servicesByBucket[activeStatus] ?? [],
		[servicesByBucket, activeStatus]
	);

	const currentCardIndex = clampIndex(activeCardIndex[activeStatus] ?? 0, visibleServices.length);
	const activeService = visibleServices[currentCardIndex] ?? null;

	const timelineRange = useMemo(() => getTimelineRange(visibleServices), [visibleServices]);

  const timelineTicks = useMemo(() => {
    const spread = Math.max(120, timelineRange.max - timelineRange.min);
    const step = spread <= 180 ? 30 : 60;
    const firstTick = Math.ceil(timelineRange.min / step) * step;
    const ticks: number[] = [];

    for (let cursor = firstTick; cursor <= timelineRange.max; cursor += step) {
      ticks.push(cursor);
    }

    if (ticks.length === 0) {
      ticks.push(timelineRange.min, timelineRange.max);
    }

    return ticks;
  }, [timelineRange]);

	const activeStatusMeta = STATUS_TABS.find((tab) => tab.key === activeStatus) ?? STATUS_TABS[1];
	const activeStatusStyles = STATUS_STYLES[activeStatus];
	const effectiveDate = simulation.enabled ? simulation.date : selectedDate;

  const setSafeActiveCard = useCallback((status: WorkdayStatus, nextIndex: number, length?: number) => {
    setActiveCardIndex((prev) => ({
      ...prev,
      [status]: clampIndex(nextIndex, length ?? servicesByBucket[status].length),
    }));
  }, [servicesByBucket]);

  const updateService = (serviceId: string, patch: Partial<WorkdayService>) => {
    setDirtyById((prev) => ({ ...prev, [serviceId]: true }));
    setSaveMessageById((prev) => ({ ...prev, [serviceId]: "" }));
    setServicesByBucket((prev) => ({
      past: prev.past.map((service) => (service.id === serviceId ? { ...service, ...patch } : service)),
      ongoing: prev.ongoing.map((service) => (service.id === serviceId ? { ...service, ...patch } : service)),
      upcoming: prev.upcoming.map((service) => (service.id === serviceId ? { ...service, ...patch } : service)),
    }));
  };

  const fetchWorkday = useCallback(async (options?: { silent?: boolean }) => {
    const silent = options?.silent === true;
    if (!silent) setLoading(true);
    setError(null);

    try {
      const response = simulation.enabled
        ? { data: buildMockWorkdayData(simulation, drivers) }
        : await apiClient.get<{
            date: string;
            itineraryId: string | null;
            buckets: Record<WorkdayStatus, WorkdayServiceApiItem[]>;
            counts: {
              total: number;
              past: number;
              ongoing: number;
              upcoming: number;
              notifyIn30Min: number;
            };
          }>(`/api/v1/workday/services?date=${selectedDate}`);

      const buckets = response.data?.buckets;
      const nextBuckets = {
        past: (buckets?.past ?? []).map(mapService),
        ongoing: (buckets?.ongoing ?? []).map(mapService),
        upcoming: (buckets?.upcoming ?? []).map(mapService),
      };

      setServicesByBucket(nextBuckets);
      setNotifyCount(response.data?.counts?.notifyIn30Min ?? 0);
      setActiveCardIndex((prev) => ({
        past: clampIndex(prev.past ?? 0, nextBuckets.past.length),
        ongoing: clampIndex(prev.ongoing ?? 0, nextBuckets.ongoing.length),
        upcoming: clampIndex(prev.upcoming ?? 0, nextBuckets.upcoming.length),
      }));
    } catch (err: any) {
      setError(err?.message || "No se pudieron cargar los servicios.");
      setServicesByBucket({ past: [], ongoing: [], upcoming: [] });
      setNotifyCount(0);
      setActiveCardIndex({ past: 0, ongoing: 0, upcoming: 0 });
    } finally {
      if (!silent) setLoading(false);
    }
  }, [drivers, selectedDate, simulation]);

  useEffect(() => {
    fetchWorkday();
  }, [fetchWorkday]);

  useEffect(() => {
    if (!simulation.enabled) {
      setSimulation((prev) => (prev.date === selectedDate ? prev : { ...prev, date: selectedDate }));
    }
  }, [selectedDate, simulation.enabled]);

  useEffect(() => {
    setActions(
      STATUS_TABS.map((tab) => ({
        key: `workday-${tab.key}`,
        label: `${tab.label} (${servicesByBucket[tab.key]?.length ?? 0})`,
        Icon: HiOutlineClock,
        onClick: () => setActiveStatus(tab.key),
        active: activeStatus === tab.key,
        square: true,
      }))
    );
  }, [activeStatus, servicesByBucket, setActions]);

	useEffect(() => () => clearActions(), [clearActions]);

	useEffect(() => {
		const fetchDrivers = async () => {
			try {
				const response = await apiClient.get<Array<{ id: string; name: string }>>(
					"/api/v1/employees?role=DRIVER&state=WORKING&limit=200"
				);
				setDrivers((response.data ?? []).map((driver) => ({ id: driver.id, name: driver.name })));
			} catch (err) {
				console.error("Error cargando conductores:", err);
			}
		};

		fetchDrivers();
	}, []);

  const findServiceById = (serviceId: string): WorkdayService | null => {
    const all = [...servicesByBucket.past, ...servicesByBucket.ongoing, ...servicesByBucket.upcoming];
    return all.find((service) => service.id === serviceId) ?? null;
  };

  const saveService = async (serviceId: string) => {
    const service = findServiceById(serviceId);
    if (!service) return;

    setSavingById((prev) => ({ ...prev, [serviceId]: true }));
    setSaveMessageById((prev) => ({ ...prev, [serviceId]: "" }));

    try {
      if (simulation.enabled) {
        setDirtyById((prev) => ({ ...prev, [serviceId]: false }));
        setSaveMessageById((prev) => ({ ...prev, [serviceId]: "Guardado en simulacion" }));
        return;
      }

      await apiClient.put(`/api/v1/services/${serviceId}`, {
        state: service.state,
        price: service.revenue,
        driverId: service.driverId,
      });
      setDirtyById((prev) => ({ ...prev, [serviceId]: false }));
      setSaveMessageById((prev) => ({ ...prev, [serviceId]: "Guardado" }));
      await fetchWorkday({ silent: true });
    } catch (err: any) {
      setSaveMessageById((prev) => ({ ...prev, [serviceId]: err?.message || "Error al guardar" }));
    } finally {
      setSavingById((prev) => ({ ...prev, [serviceId]: false }));
    }
  };

	if (loading) {
		return (
			<div className="border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-dark-700">
				<LoadingStep
					isLoading
					variant="inline"
					title="Cargando jornada"
					description="Estamos consultando los servicios operativos del día seleccionado."
					currentStep="Obteniendo servicios de la jornada"
					steps={[
						{ label: "Preparar consulta", status: "completed" },
						{ label: "Cargar servicios", status: "active" },
					]}
				/>
			</div>
		);
	}

	return (
		<div className="mt-4 border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-dark-700 md:p-6">
			<div className="flex flex-col gap-4 border-b border-gray-200 pb-5 dark:border-white/10">
				<div className="flex flex-wrap items-start justify-between gap-3">
					<div>
						<h2 className="font-bold uppercase tracking-[0.28em]">
							Centro operativo
						</h2>
						<p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{formatSelectedDateLabel(effectiveDate)}</p>
					</div>

					<div className="flex flex-wrap items-center gap-2">
						<span className="border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-800 dark:border-orange-900/30 dark:bg-orange-900/20 dark:text-orange-200">
							Avisos en 30 min: {notifyCount}
						</span>
						<button
							onClick={() => fetchWorkday()}
							className="inline-flex items-center gap-2 border border-gray-300 px-3 py-2 text-sm font-medium text-navy-700 transition hover:bg-gray-100 dark:border-white/10 dark:text-white dark:hover:bg-white/10"
						>
							<HiOutlineRefresh className="text-base" />
							Actualizar
						</button>
					</div>
				</div>

				{employee.role === "DEVELOPER" &&
					<MockPanel simulation={simulation} selectedDate={selectedDate} setSimulation={setSimulation} />
				}

			</div>

			{error && (
				<div className="mt-4 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
					{error}
				</div>
			)}

      <section className="mt-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className={`text-sm font-semibold ${activeStatusStyles.text}`}>{activeStatusMeta.label}</p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              Selecciona un punto en la línea para abrir el servicio y revisar qué información debe vivir en la tarjeta.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSafeActiveCard(activeStatus, currentCardIndex - 1, visibleServices.length)}
              disabled={visibleServices.length === 0 || currentCardIndex <= 0}
              className="inline-flex h-10 w-10 items-center justify-center border border-gray-300 text-navy-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:text-white dark:hover:bg-white/10"
            >
              <HiOutlineChevronLeft className="text-lg" />
            </button>
            <button
              type="button"
              onClick={() => setSafeActiveCard(activeStatus, currentCardIndex + 1, visibleServices.length)}
              disabled={visibleServices.length === 0 || currentCardIndex >= visibleServices.length - 1}
              className="inline-flex h-10 w-10 items-center justify-center border border-gray-300 text-navy-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:text-white dark:hover:bg-white/10"
            >
              <HiOutlineChevronRight className="text-lg" />
            </button>
          </div>
        </div>

        {visibleServices.length === 0 ? (
          <div className="mt-4 border border-dashed border-gray-300 bg-gray-50 p-8 text-sm text-gray-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-gray-300">
            No hay servicios en esta sección para {formatSelectedDateLabel(effectiveDate)}.
          </div>
        ) : (
          <>
            <div className={`mt-5 border p-5 ${activeStatusStyles.soft} ${activeStatusStyles.border}`}>
              <div className="relative pb-10 pt-8">
                <div className={`absolute left-0 right-0 top-[46px] h-1 bg-gradient-to-r ${activeStatusStyles.rail}`} />

                {timelineTicks.map((tick) => {
                  const denominator = Math.max(1, timelineRange.max - timelineRange.min);
                  const left = ((tick - timelineRange.min) / denominator) * 100;
                  return (
                    <div
                      key={tick}
                      className="absolute top-0 -translate-x-1/2"
                      style={{ left: `${left}%` }}
                    >
                      <div className="h-12 w-px bg-gray-300 dark:bg-white/10" />
                      <span className="mt-2 block whitespace-nowrap text-[11px] font-medium uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                        {formatTimelineTick(tick)}
                      </span>
                    </div>
                  );
                })}

                <div className="relative h-20">
                  {visibleServices.map((service, index) => {
                    const denominator = Math.max(1, timelineRange.max - timelineRange.min);
                    const left = ((service.timeInMinutes - timelineRange.min) / denominator) * 100;
                    const isActive = index === currentCardIndex;
                    return (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() => setSafeActiveCard(activeStatus, index, visibleServices.length)}
                        className="absolute top-5 -translate-x-1/2 text-left"
                        style={{ left: `${Math.min(100, Math.max(0, left))}%` }}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <span
                            className={`border px-3 py-1 text-xs font-semibold transition ${
                              isActive
                                ? "border-navy-700 bg-navy-700 text-white dark:border-white dark:bg-white dark:text-navy-700"
                                : "border-gray-200 bg-white text-navy-700 dark:border-white/10 dark:bg-dark-700 dark:text-white"
                            }`}
                          >
                            {service.time}
                          </span>
                          <span
                            className={`h-4 w-4 border-4 border-white transition dark:border-dark-700 ${
                              isActive ? activeStatusStyles.accent : "bg-gray-300 dark:bg-gray-500"
                            }`}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {visibleServices.map((service, index) => (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => setSafeActiveCard(activeStatus, index, visibleServices.length)}
                    className={`border px-3 py-1.5 text-xs font-semibold transition ${
                      index === currentCardIndex
                        ? "border-navy-700 bg-navy-700 text-white dark:border-white dark:bg-white dark:text-navy-700"
                        : "border-gray-200 bg-white/80 text-gray-700 hover:bg-white dark:border-white/10 dark:bg-dark-700 dark:text-gray-200 dark:hover:bg-dark-600"
                    }`}
                  >
                    {service.time} · {service.code}
                  </button>
                ))}
              </div>
            </div>

            {activeService && (
              <div className="mt-5 overflow-hidden">
                <div
                  className="flex transition-transform duration-300 ease-out"
                  style={{ transform: `translateX(-${currentCardIndex * 100}%)` }}
                >
                  {visibleServices.map((service) => (
                    <article key={service.id} className="w-full shrink-0 pr-0">
                      <div className="border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-dark-700">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`border px-3 py-1 text-xs font-semibold ${activeStatusStyles.badge}`}>
                                {service.time}
                              </span>
                              <span className="border border-gray-200 bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 dark:border-white/10 dark:bg-white/10 dark:text-gray-200">
                                {service.code}
                              </span>
                              {service.notifyIn30Min && (
                                <span className="border border-orange-200 bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-800 dark:border-orange-900/30 dark:bg-orange-900/20 dark:text-orange-200">
                                  Sale pronto
                                </span>
                              )}
                            </div>
                            <h4 className="mt-4 text-2xl font-bold text-navy-700 dark:text-white">{service.passenger}</h4>
                            <p className="mt-2 max-w-3xl text-sm text-gray-600 dark:text-gray-300">{service.route}</p>
                          </div>

                          <div className="border border-gray-200 bg-gray-50 px-4 py-3 text-right dark:border-white/10 dark:bg-white/[0.03]">
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-500 dark:text-gray-400">
                              Seguimiento
                            </p>
                            <p className="mt-2 text-sm font-semibold text-navy-700 dark:text-white">
                              {service.notifyIn30Min ? "Inicia en 30 min o menos" : `Inicia en ${service.startsInMinutes} min`}
                            </p>
                          </div>
                        </div>

                        <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                                Resumen
                              </p>
                              <div className="mt-3 space-y-3 text-sm text-gray-700 dark:text-gray-200">
                                <div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">Ruta</p>
                                  <p className="mt-1 font-medium">{service.route}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">Conductor asignado</p>
                                  <p className="mt-1 font-medium">{service.driver ?? "Sin asignar"}</p>
                                </div>
                              </div>
                            </div>

                            <div className="border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                                Estado actual
                              </p>
                              <p className="mt-3 text-2xl font-bold text-navy-700 dark:text-white">{service.state}</p>
                              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                                Este bloque ayuda a decidir si el estado merece más peso visual o más contexto operativo.
                              </p>
                            </div>
                          </div>

                          <div className="border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                              Edición rápida
                            </p>

                            <div className="mt-4 grid gap-3">
                              <label className="text-xs text-gray-600 dark:text-gray-300">
                                Conductor
                                <select
                                  value={service.driverId ?? ""}
                                  onChange={(e) => {
                                    const driverId = e.target.value || null;
                                    const driverName = drivers.find((driver) => driver.id === driverId)?.name ?? null;
                                    updateService(service.id, { driverId, driver: driverName });
                                  }}
                                  className="mt-1.5 w-full border border-gray-300 bg-white px-3 py-2 text-sm text-navy-700 focus:border-accent-500 focus:outline-none dark:border-white/10 dark:bg-dark-700 dark:text-white"
                                >
                                  <option value="">Sin asignar</option>
                                  {drivers.map((driver) => (
                                    <option key={driver.id} value={driver.id}>
                                      {driver.name}
                                    </option>
                                  ))}
                                </select>
                              </label>

                              <label className="text-xs text-gray-600 dark:text-gray-300">
                                Estado
                                <select
                                  value={service.state}
                                  onChange={(e) => updateService(service.id, { state: e.target.value as ServiceState })}
                                  className="mt-1.5 w-full border border-gray-300 bg-white px-3 py-2 text-sm text-navy-700 focus:border-accent-500 focus:outline-none dark:border-white/10 dark:bg-dark-700 dark:text-white"
                                >
                                  <option value="UPCOMING">UPCOMING</option>
                                  <option value="ONGOING">ONGOING</option>
                                  <option value="COMPLETED">COMPLETED</option>
                                  <option value="CANCELED">CANCELED</option>
                                  <option value="REFUNDED">REFUNDED</option>
                                </select>
                              </label>

                              <label className="text-xs text-gray-600 dark:text-gray-300">
                                Ingreso
                                <input
                                  type="number"
                                  min={0}
                                  value={service.revenue}
                                  onChange={(e) => updateService(service.id, { revenue: Number(e.target.value) || 0 })}
                                  className="mt-1.5 w-full border border-gray-300 bg-white px-3 py-2 text-sm text-navy-700 focus:border-accent-500 focus:outline-none dark:border-white/10 dark:bg-dark-700 dark:text-white"
                                />
                              </label>
                            </div>

                            <div className="mt-4 flex items-center justify-between gap-3">
                              <div className="text-xs text-gray-600 dark:text-gray-300">
                                {saveMessageById[service.id] || "Haz cambios y guarda para validar el flujo."}
                              </div>
                              <button
                                onClick={() => saveService(service.id)}
                                disabled={savingById[service.id] || !dirtyById[service.id]}
                                className="bg-accent-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {savingById[service.id] ? "Guardando..." : "Guardar"}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

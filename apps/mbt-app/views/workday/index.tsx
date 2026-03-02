"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { apiClient } from "../../utils/api";
import { HiOutlineRefresh } from "react-icons/hi";

type WorkdayStatus = "past" | "ongoing" | "upcoming";
type ServiceState = "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELED" | "REFUNDED";

interface WorkdayServiceApiItem {
  id: string;
  code?: string | null;
  clientName: string;
  pickupTime: string;
  state: ServiceState;
  price?: string | number | null;
  driver?: { id: string; name: string } | null;
  route?: { id: string; name: string } | null;
  routeName?: string | null;
  pickup?: { id: string; name: string } | null;
  dropoff?: { id: string; name: string } | null;
  pickupLocationName?: string | null;
  dropoffLocationName?: string | null;
  startsInMinutes: number;
  notifyIn30Min: boolean;
  bucket: WorkdayStatus;
}

interface WorkdayService {
  id: string;
  code: string;
  time: string;
  passenger: string;
  route: string;
  driverId: string | null;
  driver: string | null;
  state: ServiceState;
  revenue: number;
  startsInMinutes: number;
  notifyIn30Min: boolean;
}

interface DriverOption {
  id: string;
  name: string;
}

const STATUS_TABS: Array<{ key: WorkdayStatus; label: string }> = [
  { key: "past", label: "Pasados" },
  { key: "ongoing", label: "En curso" },
  { key: "upcoming", label: "Próximos" },
];

function formatHHmm(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleTimeString("es-DO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function mapRoute(service: WorkdayServiceApiItem): string {
  if (service.route?.name) return service.route.name;
  if (service.routeName) return service.routeName;
  const pickup = service.pickup?.name ?? service.pickupLocationName ?? "Origen";
  const dropoff = service.dropoff?.name ?? service.dropoffLocationName ?? "Destino";
  return `${pickup} -> ${dropoff}`;
}

function mapService(service: WorkdayServiceApiItem): WorkdayService {
  const amount = Number(service.price ?? 0);
  return {
    id: service.id,
    code: service.code ?? service.id,
    time: formatHHmm(service.pickupTime),
    passenger: service.clientName,
    route: mapRoute(service),
    driverId: service.driver?.id ?? null,
    driver: service.driver?.name ?? null,
    state: service.state,
    revenue: Number.isFinite(amount) ? amount : 0,
    startsInMinutes: service.startsInMinutes,
    notifyIn30Min: service.notifyIn30Min,
  };
}

export default function WorkdayView() {
  const [activeStatus, setActiveStatus] = useState<WorkdayStatus>("ongoing");
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

  const visibleServices = useMemo(
    () => servicesByBucket[activeStatus] ?? [],
    [servicesByBucket, activeStatus]
  );

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
      const today = new Date().toISOString().split("T")[0];
      const response = await apiClient.get<{
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
      }>(`/api/v1/workday/services?date=${today}`);

      const buckets = response.data?.buckets;
      setServicesByBucket({
        past: (buckets?.past ?? []).map(mapService),
        ongoing: (buckets?.ongoing ?? []).map(mapService),
        upcoming: (buckets?.upcoming ?? []).map(mapService),
      });
      setNotifyCount(response.data?.counts?.notifyIn30Min ?? 0);
    } catch (err: any) {
      setError(err?.message || "No se pudieron cargar los servicios.");
      setServicesByBucket({ past: [], ongoing: [], upcoming: [] });
      setNotifyCount(0);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkday();
  }, [fetchWorkday]);

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
      <div className="rounded-[20px] bg-background-100 p-6 shadow-3xl shadow-shadow-100 dark:!bg-background-900 dark:shadow-none">
        <h2 className="text-xl font-bold text-navy-700 dark:text-white">Jornada</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Cargando servicios de hoy...</p>
      </div>
    );
  }

  return (
    <div className="rounded-[20px] bg-background-100 p-4 shadow-3xl shadow-shadow-100 dark:!bg-background-900 dark:shadow-none md:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-navy-700 dark:text-white">Jornada</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">Gestiona el itinerario de hoy</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-orange-100 px-2 py-1 text-xs font-semibold text-orange-800 dark:bg-orange-900/20 dark:text-orange-200">
            Avisos en 30 min: {notifyCount}
          </span>
          <button
            onClick={fetchWorkday}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-navy-700 hover:bg-gray-100 dark:border-gray-700 dark:text-white dark:hover:bg-white/10"
          >
            <HiOutlineRefresh className="text-base" />
            Actualizar
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => {
          const isActive = tab.key === activeStatus;
          const count = servicesByBucket[tab.key]?.length ?? 0;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveStatus(tab.key)}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? "bg-accent-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-white/10 dark:text-white/90 dark:hover:bg-white/20"
              }`}
            >
              {tab.label} ({count})
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        {visibleServices.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 p-4 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-300">
            No hay servicios en esta sección.
          </div>
        ) : (
          visibleServices.map((service) => (
            <article
              key={service.id}
              className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-dark-700"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-navy-700 dark:text-white">{service.time} - {service.route}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300">{service.passenger}</p>
                </div>
                <span className="rounded-full bg-accent-100 px-2 py-1 text-xs font-medium text-accent-800 dark:bg-accent-900/30 dark:text-accent-200">
                  {service.code}
                </span>
              </div>

              <div className="mt-3 grid gap-2 md:grid-cols-3">
                <label className="text-xs text-gray-600 dark:text-gray-300">
                  Conductor
                  <select
                    value={service.driverId ?? ""}
                    onChange={(e) => {
                      const driverId = e.target.value || null;
                      const driverName = drivers.find((driver) => driver.id === driverId)?.name ?? null;
                      updateService(service.id, { driverId, driver: driverName });
                    }}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-2 py-1 text-sm text-navy-700 focus:border-accent-500 focus:outline-none dark:border-gray-700 dark:bg-dark-700 dark:text-white"
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
                    className="mt-1 w-full rounded-lg border border-gray-300 px-2 py-1 text-sm text-navy-700 focus:border-accent-500 focus:outline-none dark:border-gray-700 dark:bg-dark-700 dark:text-white"
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
                    className="mt-1 w-full rounded-lg border border-gray-300 px-2 py-1 text-sm text-navy-700 focus:border-accent-500 focus:outline-none dark:border-gray-700 dark:bg-dark-700 dark:text-white"
                  />
                </label>
              </div>

              <div className="mt-3 flex items-center justify-between gap-2">
                <div className="text-xs text-gray-600 dark:text-gray-300">
                  {service.notifyIn30Min
                    ? "Este servicio inicia en <= 30 minutos."
                    : `Inicia en ${service.startsInMinutes} min`}
                </div>
                <div className="flex items-center gap-2">
                  {saveMessageById[service.id] && (
                    <span className="text-xs text-gray-600 dark:text-gray-300">{saveMessageById[service.id]}</span>
                  )}
                  <button
                    onClick={() => saveService(service.id)}
                    disabled={savingById[service.id] || !dirtyById[service.id]}
                    className="rounded-lg bg-accent-600 px-3 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 hover:bg-accent-700"
                  >
                    {savingById[service.id] ? "Guardando..." : "Guardar"}
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}

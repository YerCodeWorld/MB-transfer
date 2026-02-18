"use client";

import { useEffect, useMemo, useState } from "react";
import { useServiceData } from "../../contexts/ServiceDataContext";
import { apiClient } from "../../utils/api";
import { toYMDLocal } from "../../utils/dateUtils";
import Card from "../../components/single/card";
import LineChart from "../../components/charts/LineChart";
import BarChart from "../../components/charts/barchart";
import PieChart from "../../components/charts/piechart";

import {
  MdDirectionsCar,
  MdOutlineBarChart,
  MdRoute,
  MdPeople,
  MdTrendingUp,
  MdLocationOn,
} from "react-icons/md";
import { FaPlaneArrival, FaPlaneDeparture, FaExchangeAlt } from "react-icons/fa";

type CompanyBucket = "AT" | "ST" | "MBT";

type WeekPoint = {
  date: string;
  label: string;
  total: number;
  pax: number;
  byCompany: Record<CompanyBucket, number>;
};

const getCompanyBucket = (service: any): CompanyBucket => {
  const allyName = (service?.ally?.name || service?.ally || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "");
  const code = (service?.code || "").toUpperCase();

  if (allyName.includes("airport") || code.startsWith("AT")) return "AT";
  if (allyName.includes("sacbe") || code.startsWith("ST")) return "ST";
  return "MBT";
};

const formatNumber = (value: number) => value.toLocaleString("es-DO");

const StatisticsView = () => {
  const { services, selectedDate, isLoading } = useServiceData();
  const [weekData, setWeekData] = useState<WeekPoint[]>([]);
  const [isWeekLoading, setIsWeekLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchWeekData = async () => {
      setIsWeekLoading(true);
      try {
        const base = new Date(`${selectedDate}T12:00:00`);
        const dates = Array.from({ length: 7 }, (_, i) => {
          const d = new Date(base);
          d.setDate(base.getDate() - (6 - i));
          return toYMDLocal(d);
        });

        const results = await Promise.all(
          dates.map((date) =>
            apiClient
              .getServices({ date })
              .then((response) => (response.success && Array.isArray(response.data) ? response.data : []))
              .catch(() => [])
          )
        );

        const points: WeekPoint[] = dates.map((date, idx) => {
          const dayServices = results[idx];
          const byCompany: Record<CompanyBucket, number> = { AT: 0, ST: 0, MBT: 0 };

          dayServices.forEach((service: any) => {
            byCompany[getCompanyBucket(service)] += 1;
          });

          return {
            date,
            label: new Date(`${date}T12:00:00`).toLocaleDateString("es-ES", {
              weekday: "short",
            }),
            total: dayServices.length,
            pax: dayServices.reduce((sum: number, service: any) => sum + (service.pax || 0), 0),
            byCompany,
          };
        });

        if (!cancelled) setWeekData(points);
      } finally {
        if (!cancelled) setIsWeekLoading(false);
      }
    };

    fetchWeekData();
    return () => {
      cancelled = true;
    };
  }, [selectedDate]);

  const stats = useMemo(() => {
    const totalServices = services.length;
    const completedServices = services.filter((service) => service.state === "COMPLETED").length;
    const totalPax = services.reduce((sum, service) => sum + (service.pax || 0), 0);
    const activeZones = new Set<string>();

    const byCompany: Record<CompanyBucket, number> = { AT: 0, ST: 0, MBT: 0 };
    const byKind = { ARRIVAL: 0, DEPARTURE: 0, TRANSFER: 0 };
    const routesCounter = new Map<string, number>();
    const vehiclesCounter = new Map<string, number>();

    services.forEach((service: any) => {
      byCompany[getCompanyBucket(service)] += 1;
      if (service.kindOf in byKind) byKind[service.kindOf as keyof typeof byKind] += 1;

      const pickupZone = service.pickup?.zone?.name;
      const dropoffZone = service.dropoff?.zone?.name;
      if (pickupZone) activeZones.add(pickupZone);
      if (dropoffZone) activeZones.add(dropoffZone);

      const routeKey = `${service.pickup?.name || service.pickupLocationName || "Origen"} -> ${service.dropoff?.name || service.dropoffLocationName || "Destino"}`;
      routesCounter.set(routeKey, (routesCounter.get(routeKey) || 0) + 1);

      const vehicleName = service.vehicleTypeName || service.vehicle?.name || service.vehicleType;
      if (vehicleName) vehiclesCounter.set(vehicleName, (vehiclesCounter.get(vehicleName) || 0) + 1);
    });

    const topRoutes = Array.from(routesCounter.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const topVehicles = Array.from(vehiclesCounter.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalServices,
      completedServices,
      totalPax,
      activeZones: activeZones.size,
      byCompany,
      byKind,
      topRoutes,
      topVehicles,
    };
  }, [services]);

  const servicesToday = weekData[weekData.length - 1]?.total || 0;
  const servicesYesterday = weekData[weekData.length - 2]?.total || 0;
  const dailyDelta = servicesYesterday
    ? `${(((servicesToday - servicesYesterday) / servicesYesterday) * 100).toFixed(1)}%`
    : "0.0%";

  const trendSeries = [
    {
      name: "Servicios",
      data: weekData.map((point) => point.total),
    },
    {
      name: "PAX",
      data: weekData.map((point) => point.pax),
    },
  ];

  const trendOptions = {
    chart: { toolbar: { show: false }, type: "line" },
    stroke: { curve: "smooth", width: 3 },
    dataLabels: { enabled: false },
    colors: ["var(--color-accent-500)", "#22C55E"],
    xaxis: {
      categories: weekData.map((point) => point.label),
      labels: { style: { colors: "#A3AED0", fontSize: "12px" } },
    },
    yaxis: { labels: { style: { colors: "#A3AED0", fontSize: "12px" } } },
    grid: { borderColor: "rgba(163, 174, 208, 0.2)" },
    legend: { position: "top" },
    tooltip: { theme: "dark" },
  };

  const companySeries = [
    { name: "AT", data: weekData.map((point) => point.byCompany.AT), color: "#39B8FF" },
    { name: "ST", data: weekData.map((point) => point.byCompany.ST), color: "#22C55E" },
    { name: "MBT", data: weekData.map((point) => point.byCompany.MBT), color: "var(--color-accent-500)" },
  ];

  const companyOptions = {
    chart: { stacked: true, toolbar: { show: false } },
    plotOptions: { bar: { borderRadius: 8, columnWidth: "34px" } },
    dataLabels: { enabled: false },
    xaxis: {
      categories: weekData.map((point) => point.label),
      labels: { style: { colors: "#A3AED0", fontSize: "12px" } },
    },
    yaxis: { labels: { style: { colors: "#A3AED0", fontSize: "12px" } } },
    grid: { borderColor: "rgba(163, 174, 208, 0.2)" },
    legend: { position: "top" },
    tooltip: { theme: "dark" },
  };

  const serviceMixData = [
    stats.byKind.ARRIVAL,
    stats.byKind.DEPARTURE,
    stats.byKind.TRANSFER,
  ];

  const serviceMixOptions = {
    labels: ["Llegadas", "Salidas", "Transferencias"],
    colors: ["#39B8FF", "#F59E0B", "var(--color-accent-500)"],
    legend: { position: "bottom", labels: { colors: "#A3AED0" } },
    dataLabels: { enabled: true },
    tooltip: { theme: "dark" },
  };

  return (
    <div className="h-full w-full overflow-y-auto pb-24">
      <Card extra="mb-5 overflow-hidden bg-gradient-to-r from-accent-500 via-accent-600 to-blue-600">
        <div className="p-6 text-white">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Centro de Estadisticas Operativas</h1>
              <p className="mt-1 text-sm text-white/90">
                Datos reales basados en servicios del {new Date(`${selectedDate}T12:00:00`).toLocaleDateString("es-ES", {
                  weekday: "long",
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <div className="rounded-xl bg-white/15 px-4 py-2 text-right">
              <p className="text-xs uppercase tracking-wide text-white/80">Actualizacion diaria</p>
              <p className="text-lg font-bold">{formatNumber(stats.totalServices)} servicios</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-4">
        <Card extra="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Servicios del Dia</p>
              <p className="text-3xl font-bold text-navy-700 dark:text-white">{formatNumber(stats.totalServices)}</p>
              <p className={`mt-1 text-xs font-semibold ${dailyDelta.startsWith("-") ? "text-red-500" : "text-green-500"}`}>
                {dailyDelta} vs ayer
              </p>
            </div>
            <div className="rounded-full bg-accent-100 p-3 text-accent-600 dark:bg-accent-900/40 dark:text-accent-300">
              <MdOutlineBarChart className="text-3xl" />
            </div>
          </div>
        </Card>

        <Card extra="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">PAX Total</p>
              <p className="text-3xl font-bold text-navy-700 dark:text-white">{formatNumber(stats.totalPax)}</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-300">Pasajeros programados</p>
            </div>
            <div className="rounded-full bg-blue-100 p-3 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">
              <MdPeople className="text-3xl" />
            </div>
          </div>
        </Card>

        <Card extra="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Servicios Completados</p>
              <p className="text-3xl font-bold text-navy-700 dark:text-white">{formatNumber(stats.completedServices)}</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-300">
                {stats.totalServices > 0 ? `${((stats.completedServices / stats.totalServices) * 100).toFixed(1)}% de cumplimiento` : "Sin servicios"}
              </p>
            </div>
            <div className="rounded-full bg-green-100 p-3 text-green-600 dark:bg-green-900/40 dark:text-green-300">
              <MdTrendingUp className="text-3xl" />
            </div>
          </div>
        </Card>

        <Card extra="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Zonas Activas</p>
              <p className="text-3xl font-bold text-navy-700 dark:text-white">{formatNumber(stats.activeZones)}</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-300">Basado en origen y destino</p>
            </div>
            <div className="rounded-full bg-purple-100 p-3 text-purple-600 dark:bg-purple-900/40 dark:text-purple-300">
              <MdRoute className="text-3xl" />
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 3xl:grid-cols-6">
        <Card extra="3xl:col-span-4 p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-navy-700 dark:text-white">Tendencia de 7 Dias</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Servicios y pasajeros por dia
              </p>
            </div>
            {(isLoading || isWeekLoading) && (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600 dark:bg-white/10 dark:text-gray-300">
                Cargando...
              </span>
            )}
          </div>
          <div className="h-[300px]">
            <LineChart
              key={`trend-${weekData.map((d) => d.total).join("-")}-${weekData.map((d) => d.pax).join("-")}`}
              chartData={trendSeries}
              chartOptions={trendOptions}
            />
          </div>
        </Card>

        <Card extra="3xl:col-span-2 p-5">
          <h3 className="text-lg font-bold text-navy-700 dark:text-white">Mezcla por Tipo</h3>
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">Distribucion del dia seleccionado</p>
          <div className="h-[250px]">
            <PieChart
              key={`mix-${serviceMixData.join("-")}`}
              chartData={serviceMixData}
              chartOptions={serviceMixOptions}
            />
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-lg bg-blue-50 p-2 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
              <FaPlaneArrival className="mx-auto mb-1" />
              {formatNumber(stats.byKind.ARRIVAL)}
            </div>
            <div className="rounded-lg bg-amber-50 p-2 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
              <FaPlaneDeparture className="mx-auto mb-1" />
              {formatNumber(stats.byKind.DEPARTURE)}
            </div>
            <div className="rounded-lg bg-accent-50 p-2 text-accent-700 dark:bg-accent-900/20 dark:text-accent-300">
              <FaExchangeAlt className="mx-auto mb-1" />
              {formatNumber(stats.byKind.TRANSFER)}
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 3xl:grid-cols-6">
        <Card extra="3xl:col-span-3 p-5">
          <h3 className="text-lg font-bold text-navy-700 dark:text-white">Servicios por Empresa (7 dias)</h3>
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">AT, ST y MBT</p>
          <div className="h-[280px]">
            <BarChart
              key={`company-${weekData.map((d) => `${d.byCompany.AT}-${d.byCompany.ST}-${d.byCompany.MBT}`).join("|")}`}
              chartData={companySeries}
              chartOptions={companyOptions}
            />
          </div>
        </Card>

        <Card extra="3xl:col-span-3 p-5">
          <h3 className="text-lg font-bold text-navy-700 dark:text-white">Top Rutas del Dia</h3>
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">Mayor volumen de operaciones</p>
          <div className="space-y-2">
            {stats.topRoutes.length > 0 ? (
              stats.topRoutes.map((route, idx) => (
                <div
                  key={route.name}
                  className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 dark:border-white/10 dark:bg-navy-800"
                >
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-accent-100 text-xs font-bold text-accent-700 dark:bg-accent-900/30 dark:text-accent-300">
                      {idx + 1}
                    </span>
                    <p className="text-sm font-semibold text-navy-700 dark:text-white">{route.name}</p>
                  </div>
                  <p className="text-sm font-bold text-accent-600 dark:text-accent-300">{route.count}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">No hay rutas registradas para esta fecha.</p>
            )}
          </div>
        </Card>
      </div>

      <div className="mt-5">
        <Card extra="p-5">
          <h3 className="text-lg font-bold text-navy-700 dark:text-white">Vehiculos con Mayor Uso (Dia)</h3>
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            Conteo de servicios por tipo o unidad registrada
          </p>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {stats.topVehicles.length > 0 ? (
              stats.topVehicles.map((vehicle) => (
                <div
                  key={vehicle.name}
                  className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-navy-800"
                >
                  <div className="flex items-center gap-2">
                    <MdDirectionsCar className="text-xl text-accent-500" />
                    <span className="text-sm font-medium text-navy-700 dark:text-white">{vehicle.name}</span>
                  </div>
                  <span className="rounded-full bg-accent-100 px-2 py-0.5 text-xs font-bold text-accent-700 dark:bg-accent-900/30 dark:text-accent-300">
                    {vehicle.count}
                  </span>
                </div>
              ))
            ) : (
              <div className="md:col-span-2 rounded-xl border border-dashed border-gray-300 p-5 text-center text-sm text-gray-500 dark:border-white/15 dark:text-gray-400">
                <MdLocationOn className="mx-auto mb-2 text-xl" />
                No hay vehiculos asociados a los servicios de esta fecha.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default StatisticsView;

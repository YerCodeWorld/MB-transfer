"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

import { useServiceData } from "@/contexts/ServiceDataContext";
import { useBottomBar } from "@/contexts/BottomBarContext";
import { useIsClient } from "@/hooks/useIsClient";
import { apiClient } from "@/utils/api";

import { ServiceHoursRow } from "@/components/shared/HoursVisualizationModal";

import { ServiceInput } from "@/types/services";
import { toast } from "sonner";
import { BsClock, BsClockHistory, BsDownload, BsFilePdf } from "react-icons/bs";
import { FaPlus } from "react-icons/fa";
import { time12ToMinutes, convertIsoStringTo12h, convertTo24Hour } from "@/utils/services";

import ServiceManagementFilters from "./components/ServiceManagementFilters";
import ServiceManagementTable from "./components/ServiceManagementTable";
import ServiceEditModal from "./components/ServiceEditModal";
import ServiceManagementDialogs from "./components/ServiceManagementDialogs";
import {
  ExtendedService,
  getCompanyName,
  getOffsetDisplayTime,
  isIsoLikeDateTime,
  mapAllyToServiceType,
  normalizeNotesForEditor,
  normalizeNotesForUpdate,
  normalizeOptionalNumber,
  normalizeOptionalString,
  ServiceStatus,
  SortDirection,
  SortField,
  VehicleOption,
  displayTimeFromService,
} from "./utils/serviceManagement";

export default function ServiceManagementView() {
  const isClient = useIsClient();
  const { services: dbServices, selectedDate, createService, updateService, deleteService, refetchServices } = useServiceData();
  const { setActions, clearActions } = useBottomBar();
  const [vehicleOptions, setVehicleOptions] = useState<VehicleOption[]>([]);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("time");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [editingService, setEditingService] = useState<ExtendedService | null>(null);
  const [detailService, setDetailService] = useState<ExtendedService | null>(null);
  const [showFlightComparison, setShowFlightComparison] = useState(false);
  const [showAddService, setShowAddService] = useState(false);
  const [showPDFGenerator, setShowPDFGenerator] = useState(false);
  const [showHoursVisualization, setShowHoursVisualization] = useState(false);

  useEffect(() => {
    if (editingService) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [editingService]);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await apiClient.get<VehicleOption[]>("/api/v1/vehicules?limit=200");
        if (response.success && response.data) {
          setVehicleOptions(response.data);
        }
      } catch (err) {
        console.error("Error loading vehicles:", err);
      }
    };

    fetchVehicles();
  }, []);

  const allServices = useMemo<ExtendedService[]>(
    () =>
      dbServices.map((service) => ({
        id: service.id,
        code: service.code,
        kindOf: service.kindOf,
        clientName: service.clientName,
        pickupTime: service.pickupTime,
        flightCode: service.flightCode,
        pax: service.pax,
        luggage: service.luggage,
        pickupLocation: service.pickup?.name || service.pickupLocationName || "",
        dropoffLocation: service.dropoff?.name || service.dropoffLocationName || "",
        notes: service.notes,
        vehicleType: service.vehicleTypeName || service.vehicleType,
        pdfData: service.pdfProfile
          ? {
              clientName: service.pdfProfile.clientName || undefined,
              hotel: service.pdfProfile.hotelName || undefined,
              pax: service.pdfProfile.pax || undefined,
              time: service.pdfProfile.time || undefined,
              flightCode: service.pdfProfile.flightCode || undefined,
            }
          : undefined,
        ally: service.ally?.name,
        serviceType: mapAllyToServiceType(service.ally?.name, service.code),
        status: (service.state?.toLowerCase() as ServiceStatus) || "pending",
        assignedDriver: service.driver?.name,
        assignedVehicle: service.vehicle?.name,
        createdAt: service.createdAt,
        updatedAt: service.updatedAt,
      })),
    [dbServices]
  );

  const originalPickupTimesByServiceId = useMemo(
    () =>
      Object.fromEntries(
        dbServices
          .filter((service) => Boolean(service.id))
          .map((service) => [service.id, service.pickupTime])
      ) as Record<string, string>,
    [dbServices]
  );

  const filteredServices = useMemo(() => {
    const filtered = [...allServices];

    const typeFiltered = filtered.filter((service) => {
      if (filterType === "all") return true;
      if (filterType === "airport") return service.serviceType === "at";
      if (filterType === "sacbe") return service.serviceType === "st";
      if (filterType === "mbtransfer") return service.serviceType === "mbt";
      return service.kindOf === filterType;
    });

    const statusFiltered =
      filterStatus === "all"
        ? typeFiltered
        : typeFiltered.filter((service) => service.status === filterStatus);

    const searched = searchTerm
      ? statusFiltered.filter(
          (service) =>
            service.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            service.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            service.pickupLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
            service.dropoffLocation.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : statusFiltered;

    searched.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case "time": {
          const aTime = isIsoLikeDateTime(a.pickupTime) ? convertIsoStringTo12h(a.pickupTime) : a.pickupTime;
          const bTime = isIsoLikeDateTime(b.pickupTime) ? convertIsoStringTo12h(b.pickupTime) : b.pickupTime;
          aValue = time12ToMinutes(aTime);
          bValue = time12ToMinutes(bTime);
          break;
        }
        case "client":
          aValue = a.clientName.toLowerCase();
          bValue = b.clientName.toLowerCase();
          break;
        case "type":
          aValue = a.kindOf;
          bValue = b.kindOf;
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        case "code":
          aValue = a.code.toLowerCase();
          bValue = b.code.toLowerCase();
          break;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return searched;
  }, [allServices, filterType, filterStatus, searchTerm, sortField, sortDirection]);

  const checkTimeData = useCallback(() => {
    setShowFlightComparison(true);
  }, []);

  const getPDFs = useCallback(() => {
    setShowPDFGenerator(true);
  }, []);

  const handleAddService = async (newService: ServiceInput & { serviceType?: "at" | "st" | "mbt" }) => {
    const cacheType = newService.serviceType || "mbt";
    const companyName = getCompanyName(cacheType);
    const cleanService = { ...newService };
    delete cleanService.serviceType;

    const normalizePickupTimeToIso = (raw: string): string => {
      const input = String(raw || "").trim();
      if (!input) return `${selectedDate}T00:00:00.000Z`;
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(input)) return input;
      if (/^\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}(?::\d{2})?$/.test(input)) {
        const normalized = input.replace(" ", "T");
        const withSeconds = normalized.length === 16 ? `${normalized}:00` : normalized;
        return `${withSeconds}.000Z`;
      }
      if (/^\d{1,2}:\d{2}\s*(AM|PM)$/i.test(input)) {
        const hhmm = convertTo24Hour(input);
        return `${selectedDate}T${hhmm}:00.000Z`;
      }
      if (/^\d{1,2}:\d{2}$/.test(input)) {
        const [h, m] = input.split(":");
        return `${selectedDate}T${h.padStart(2, "0")}:${m}:00.000Z`;
      }
      return `${selectedDate}T00:00:00.000Z`;
    };

    const result = await createService({
      ...cleanService,
      pickupTime: normalizePickupTimeToIso(cleanService.pickupTime),
      ally: companyName,
    });

    if (result.success) {
      setShowAddService(false);
      toast.success("Servicio Agregado", {
        className: "bg-card text-card-foreground border-border",
        description: `Servicio añadido a ${companyName}`,
      });
    } else {
      toast.error("Error al agregar servicio", {
        description: result.error,
      });
    }

    return result.success;
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleEditService = (service: ExtendedService) => {
    setEditingService({
      ...service,
      notes: normalizeNotesForEditor(service.notes),
    });
  };

  const handleViewService = (service: ExtendedService) => {
    setDetailService(service);
  };

  const handleSaveEdit = async (updatedService: ExtendedService) => {
    const updateData = {
      code: normalizeOptionalString(updatedService.code),
      kindOf: updatedService.kindOf,
      clientName: updatedService.clientName,
      pickupTime: updatedService.pickupTime,
      flightCode: normalizeOptionalString(updatedService.flightCode),
      pax: updatedService.pax,
      luggage: normalizeOptionalNumber(updatedService.luggage),
      pickupLocation: updatedService.pickupLocation,
      dropoffLocation: updatedService.dropoffLocation,
      notes: normalizeNotesForUpdate(updatedService.notes),
      vehicleType: normalizeOptionalString(updatedService.vehicleType),
      ally: getCompanyName(updatedService.serviceType),
      state: updatedService.status.toUpperCase(),
    };

    const result = await updateService(updatedService.id, updateData);

    if (result.success) {
      const originalService = allServices.find((service) => service.id === updatedService.id);
      if (originalService?.serviceType !== updatedService.serviceType) {
        toast.success("Servicio Movido", {
          className: "bg-card text-card-foreground border-border",
          description: `Servicio movido a ${getCompanyName(updatedService.serviceType)}`,
        });
      } else {
        toast.success("Servicio Actualizado");
      }
      await refetchServices();
      setEditingService(null);
    } else {
      toast.error("Error al actualizar servicio", {
        description: result.error,
      });
    }
  };

  const handlePDFServiceUpdate = async (_serviceCode: string, updatedService: ExtendedService) => {
    const result = await apiClient.updateServicePdfProfile(updatedService.id, {
      clientName: updatedService.pdfData?.clientName ?? null,
      hotelName: updatedService.pdfData?.hotel ?? null,
      pax: updatedService.pdfData?.pax ?? null,
      time: updatedService.pdfData?.time ?? null,
      flightCode: updatedService.pdfData?.flightCode ?? null,
    });

    if (!result.success) {
      throw new Error(result.message || "Failed to update PDF profile");
    }

    await refetchServices();
  };

  const handleFlightTimeUpdate = async (serviceId: string, formattedTime: string) => {
    const targetService = allServices.find((service) => service.id === serviceId);

    if (!targetService) {
      toast.error("Servicio no encontrado");
      return;
    }

    const result = await updateService(serviceId, {
      pickupTime: formattedTime,
    });

    if (result.success) {
      toast.success("Hora de servicio actualizada", {
        className: "bg-card text-card-foreground border-border",
        description: `Servicio ${targetService.code} actualizado`,
      });
    } else {
      toast.error("Error al actualizar hora", {
        description: result.error,
      });
    }
  };

  const exportToCSV = useCallback(() => {
    const headers = [
      "Empresa",
      "Código",
      "Cliente",
      "Tipo",
      "Hora",
      "PAX",
      "Origen",
      "Destino",
      "Vuelo",
      "Vehículo",
      "Conductor",
      "Estado",
      "Notas",
    ].map((header) => `"${header}"`);

    const csvRows = filteredServices.map((service) => {
      const company = getCompanyName(service.serviceType);
      const time = isIsoLikeDateTime(service.pickupTime)
        ? convertIsoStringTo12h(service.pickupTime)
        : service.pickupTime;

      return [
        company,
        service.code || "",
        service.clientName || "",
        service.kindOf || "",
        time || "",
        service.pax?.toString() || "0",
        service.pickupLocation || "",
        service.dropoffLocation || "",
        service.flightCode || "",
        service.assignedVehicle || "",
        service.assignedDriver || "",
        service.status || "pending",
        normalizeNotesForEditor(service.notes),
      ].map((field) => `"${String(field).replace(/"/g, '""')}"`);
    });

    const csvContent = [headers.join(","), ...csvRows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", `itinerario-${selectedDate}.csv`);
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("CSV Exportado", {
      className: "bg-card text-card-foreground border-border",
      description: `Se exportaron ${filteredServices.length} servicios`,
    });
  }, [filteredServices, selectedDate]);

  const handleRemoveService = async (service: ExtendedService) => {
    if (confirm(`Are you sure you want to remove service ${service.code}?`)) {
      const result = await deleteService(service.id);

      if (result.success) {
        toast.success("Servicio eliminado", {
          description: `${service.code} ha sido eliminado`,
        });
      } else {
        toast.error("Error al eliminar servicio", {
          description: result.error,
        });
      }
    }
  };

  useEffect(() => {
    setActions([
      {
        key: "hours-tab",
        label: "Visualización de Horas",
        Icon: BsClockHistory,
        onClick: () => setShowHoursVisualization(true),
      },
      {
        key: "check-time",
        label: "Confirmar Vuelos",
        Icon: BsClock,
        onClick: checkTimeData,
      },
      {
        key: "get-pdfs",
        label: "Generar Diseños",
        Icon: BsFilePdf,
        onClick: getPDFs,
      },
      {
        key: "add-service",
        label: "Añadir Servicio",
        Icon: FaPlus,
        onClick: () => setShowAddService(true),
      },
      {
        key: "export-csv",
        label: "Exportar CSV",
        Icon: BsDownload,
        onClick: exportToCSV,
      },
    ]);

    return () => {
      clearActions();
    };
  }, [checkTimeData, clearActions, exportToCSV, getPDFs, setActions]);

  const hoursRows: ServiceHoursRow[] = filteredServices.map((service) => {
    const originalRawTime = originalPickupTimesByServiceId[service.id] || service.pickupTime;
    const modifiedTime = displayTimeFromService(service.pickupTime, selectedDate);
    const originalTime = displayTimeFromService(originalRawTime, selectedDate);
    const updatedFromDb =
      Boolean(service.createdAt) &&
      Boolean(service.updatedAt) &&
      String(service.createdAt) !== String(service.updatedAt);
    const isModified = updatedFromDb || modifiedTime !== originalTime;

    return {
      id: service.id || service.code || `${service.clientName}-${service.pickupTime}`,
      code: service.code,
      clientName: service.clientName,
      kindOf: service.kindOf,
      modifiedTime: isModified ? modifiedTime || "N/A" : null,
      originalTime: originalTime || "N/A",
      offset15Time:
        service.kindOf === "DEPARTURE" ? getOffsetDisplayTime(modifiedTime, -15) : undefined,
      isModified,
    };
  });

  return (
    <div className="m-10">
      <ServiceManagementFilters
        filterType={filterType}
        setFilterType={setFilterType}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        sortField={sortField}
        sortDirection={sortDirection}
        setSortField={setSortField}
        setSortDirection={setSortDirection}
      />

      <ServiceManagementTable
        allServicesCount={allServices.length}
        filteredServices={filteredServices}
        selectedDate={selectedDate}
        handleSort={handleSort}
        handleViewService={handleViewService}
      />

      <ServiceEditModal
        editingService={editingService}
        isClient={isClient}
        selectedDate={selectedDate}
        vehicleOptions={vehicleOptions}
        setEditingService={setEditingService}
        handleSaveEdit={handleSaveEdit}
      />

      <ServiceManagementDialogs
        detailService={detailService}
        setDetailService={setDetailService}
        showFlightComparison={showFlightComparison}
        setShowFlightComparison={setShowFlightComparison}
        showAddService={showAddService}
        setShowAddService={setShowAddService}
        showPDFGenerator={showPDFGenerator}
        setShowPDFGenerator={setShowPDFGenerator}
        showHoursVisualization={showHoursVisualization}
        setShowHoursVisualization={setShowHoursVisualization}
        filteredServices={filteredServices}
        selectedDate={selectedDate}
        hoursRows={hoursRows}
        handleViewEditFromDetail={handleEditService}
        handleRemoveFromDetail={handleRemoveService}
        handleFlightTimeUpdate={handleFlightTimeUpdate}
        handleAddService={handleAddService}
        handlePDFServiceUpdate={handlePDFServiceUpdate}
      />
    </div>
  );
}

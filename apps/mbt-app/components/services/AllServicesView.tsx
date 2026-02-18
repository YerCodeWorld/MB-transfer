"use client";

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigation } from '../../contexts/NavigationContext';
import { useServiceData } from '../../contexts/ServiceDataContext';
import { useBottomBar } from '../../contexts/BottomBarContext';
import { apiClient } from '../../utils/api';
import { ServiceInput } from '../../types/services';
import { convertIsoStringTo12h, convertTo24Hour, time12ToMinutes } from '../../utils/services';

import { 
  SERVICE_TYPE_OPTIONS, 
  STATUS_OPTIONS, 
  SORT_OPTIONS, 
  SERVICE_KIND_OPTIONS, 
  SERVICE_TYPE_THEMES, 
  STATUS_COLORS, 
  SERVICE_TYPE_LABELS 
} from '../../constants/allServicesOptions';

import FlightComparisonModal from '../shared/FlightComparisonModal';
import AddServiceModal from '../shared/AddServiceModal';
import PDFGeneratorModal from '../shared/PDFGeneratorModal';

import Card from '../single/card';

import {  BsArrowLeft, BsSearch, BsFilter, BsEye, BsPlay, BsPencil, BsTrash, BsCheckCircle, BsExclamationTriangle, BsClock, BsFilePdf, BsDownload } from 'react-icons/bs';
import { FaHashtag, FaUser, FaClock, FaUsers, FaRoute, FaMapSigns, FaTags, FaCar, FaUserTie, FaPlus } from 'react-icons/fa';
import { HiOutlineViewList } from 'react-icons/hi';

import { toast } from "sonner";

// ===========================
type ServiceStatus = 'pending' | 'assigned' | 'in-progress' | 'completed' | 'cancelled';
type SortField = 'time' | 'client' | 'type' | 'status' | 'code';
type SortDirection = 'asc' | 'desc';

interface ExtendedService extends ServiceInput {
  serviceType: 'at' | 'st' | 'mbt';
  status: ServiceStatus;
  assignedDriver?: string;
  assignedVehicle?: string;
}

type ServiceNoteLike = {
  title?: string;
  content?: string;
  caption?: string;
};

type VehicleOption = {
  id: string;
  name: string;
  paxCapacity?: number;
};

const AllServicesView = () => {
  const { popView } = useNavigation();
  const { services: dbServices, selectedDate, createService, updateService, deleteService, refetchServices } = useServiceData();
  const { setActions, clearActions } = useBottomBar();
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'overview' | 'live'>('overview');
  
  // Services data
  const [allServices, setAllServices] = useState<ExtendedService[]>([]);
  const [filteredServices, setFilteredServices] = useState<ExtendedService[]>([]);
  const [vehicleOptions, setVehicleOptions] = useState<VehicleOption[]>([]);
  
  // Filters and sorting
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('time');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  
  // Edit modal state
  const [editingService, setEditingService] = useState<ExtendedService | null>(null);
  const [mounted, setMounted] = useState(false);
  
  // Flight comparison modal state
  const [showFlightComparison, setShowFlightComparison] = useState(false);
  
  // Add service modal state
  const [showAddService, setShowAddService] = useState(false);
  
  // PDF generator modal state
  const [showPDFGenerator, setShowPDFGenerator] = useState(false);

  // Handle mounting for portal
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Handle body scroll when modal is open
  useEffect(() => {
    if (editingService) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [editingService]);

  // Load available vehicles for edit modal selects
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await apiClient.get<VehicleOption[]>('/api/v1/vehicules?limit=200');
        if (response.success && response.data) {
          setVehicleOptions(response.data);
        }
      } catch (err) {
        console.error('Error loading vehicles:', err);
      }
    };

    fetchVehicles();
  }, []);
  
  // Map ally name to service type code
  const mapAllyToServiceType = (allyName?: string, code?: string): 'at' | 'st' | 'mbt' => {
    const normalizedAlly = (allyName || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '');
    const normalizedCode = (code || '').trim().toUpperCase();

    if (normalizedAlly.includes('airporttransfer') || normalizedAlly.includes('airport')) return 'at';
    if (normalizedAlly.includes('sacbe')) return 'st';
    if (normalizedAlly.includes('mbtransfer') || normalizedAlly === 'mbt') return 'mbt';

    if (normalizedCode.startsWith('AT')) return 'at';
    if (normalizedCode.startsWith('ST')) return 'st';
    if (normalizedCode.startsWith('MBT')) return 'mbt';

    return 'mbt';
  };

  const isIsoLikeDateTime = (value?: string) =>
    typeof value === 'string' && (/^\d{4}-\d{2}-\d{2}[T\s]/.test(value) || value.endsWith('Z'));

  const toTimeInputValue = (value?: string): string => {
    const input = String(value || '').trim();
    if (!input) return '';

    if (isIsoLikeDateTime(input)) {
      const isoMatch = input.match(/[T\s](\d{2}):(\d{2})/);
      if (isoMatch) return `${isoMatch[1]}:${isoMatch[2]}`;
    }

    if (/^\d{1,2}:\d{2}\s*(AM|PM)$/i.test(input)) {
      return convertTo24Hour(input);
    }

    if (/^\d{1,2}:\d{2}$/.test(input)) {
      const [h, m] = input.split(':');
      return `${h.padStart(2, '0')}:${m}`;
    }

    return '';
  };

  // Map database services to ExtendedService format
  useEffect(() => {
    const extended: ExtendedService[] = dbServices.map(service => ({
      id: service.id,
      code: service.code,
      kindOf: service.kindOf,
      clientName: service.clientName,
      pickupTime: service.pickupTime,
      flightCode: service.flightCode,
      pax: service.pax,
      luggage: service.luggage,
      pickupLocation: service.pickup?.name || service.pickupLocationName || '',
      dropoffLocation: service.dropoff?.name || service.dropoffLocationName || '',
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
      status: (service.state?.toLowerCase() as ServiceStatus) || 'pending',
      assignedDriver: service.driver?.name,
      assignedVehicle: service.vehicle?.name
    }));

    setAllServices(extended);
  }, [dbServices]);
  
  // Apply filters and sorting
  useEffect(() => {
    console.log('🔍 FILTER DEBUG - Starting with', allServices.length, 'services');
    console.log('🔍 filterType:', filterType);
    console.log('🔍 filterStatus:', filterStatus);
    console.log('🔍 searchTerm:', searchTerm);

    let filtered = [...allServices];
    console.log('🔍 After copy:', filtered.length);

    // Apply type filter
    if (filterType !== 'all') {
      if (filterType === 'airport') {
        filtered = filtered.filter(s => s.serviceType === 'at');
      } else if (filterType === 'sacbe') {
        filtered = filtered.filter(s => s.serviceType === 'st');
      } else if (filterType === 'mbtransfer') {
        filtered = filtered.filter(s => s.serviceType === 'mbt');
      } else {
        filtered = filtered.filter(s => s.kindOf === filterType);
      }
      console.log('🔍 After type filter:', filtered.length);
    }
    
    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(s => s.status === filterStatus);
      console.log('🔍 After status filter:', filtered.length);
    }
    
    // Apply search term
    if (searchTerm) {
      filtered = filtered.filter(s =>
        s.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.pickupLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.dropoffLocation.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'time': {
          const aTime = isIsoLikeDateTime(a.pickupTime)
            ? convertIsoStringTo12h(a.pickupTime)
            : a.pickupTime;
          const bTime = isIsoLikeDateTime(b.pickupTime)
            ? convertIsoStringTo12h(b.pickupTime)
            : b.pickupTime;
          aValue = time12ToMinutes(aTime);
          bValue = time12ToMinutes(bTime);
          break;
        }
        case 'client':
          aValue = a.clientName.toLowerCase();
          bValue = b.clientName.toLowerCase();
          break;
        case 'type':
          aValue = a.kindOf;
          bValue = b.kindOf;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'code':
          aValue = a.code.toLowerCase();
          bValue = b.code.toLowerCase();
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    console.log('🔍 FINAL filtered count:', filtered.length);
    setFilteredServices(filtered);
  }, [allServices, filterType, filterStatus, searchTerm, sortField, sortDirection]);
  
  // Update bottom bar actions based on active tab
  useEffect(() => {
    if (activeTab === 'overview') {
      setActions([
        {
          key: "check-time",
          label: "Confirmar Vuelos",
          Icon: BsClock,
          onClick: checkTimeData
        },
        {
          key: "get-pdfs",
          label: "Generar Diseños",
          Icon: BsFilePdf,
          onClick: getPDFs
        },
        {
          key: "add-service",
          label: "Añadir Servicio",
          Icon: FaPlus,
          onClick: () => setShowAddService(true)
        },
        {
          key: "export-csv",
          label: "Exportar CSV",
          Icon: BsDownload,
          onClick: exportToCSV
        }
      ]);
    } else {
      setActions([
        {
          key: "overview-tab",
          label: "Overview",
          Icon: BsEye,
          onClick: () => setActiveTab('overview')
        },
        {
          key: "live-tab",
          label: "Live Mode",
          Icon: BsPlay,
          variant: "primary",
          onClick: () => setActiveTab('live')
        }
      ]);
    }

    return () => {
      clearActions();
    };
  }, [activeTab, clearActions, setActions]);

  const checkTimeData = () => {
    setShowFlightComparison(true);
  };
  
  const getPDFs = () => {
    setShowPDFGenerator(true);
  };
  
  const handleAddService = async (newService: ServiceInput & { serviceType?: 'at' | 'st' | 'mbt' }) => {
    // Determine ally based on serviceType
    const cacheType = newService.serviceType || 'mbt';
    const companyName = getCompanyName(cacheType);

    // Clean the service to remove serviceType before saving
    const { serviceType: _, ...cleanService } = newService;

    const normalizePickupTimeToIso = (raw: string): string => {
      const input = String(raw || '').trim();
      if (!input) return `${selectedDate}T00:00:00.000Z`;

      // Already strict ISO UTC
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(input)) return input;

      // ISO-ish without timezone
      if (/^\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}(?::\d{2})?$/.test(input)) {
        const normalized = input.replace(' ', 'T');
        const withSeconds = normalized.length === 16 ? `${normalized}:00` : normalized;
        return `${withSeconds}.000Z`;
      }

      // 12h clock
      if (/^\d{1,2}:\d{2}\s*(AM|PM)$/i.test(input)) {
        const hhmm = convertTo24Hour(input);
        return `${selectedDate}T${hhmm}:00.000Z`;
      }

      // 24h clock
      if (/^\d{1,2}:\d{2}$/.test(input)) {
        const [h, m] = input.split(':');
        return `${selectedDate}T${h.padStart(2, '0')}:${m}:00.000Z`;
      }

      return `${selectedDate}T00:00:00.000Z`;
    };

    // Create service via API
    const result = await createService({
      ...cleanService,
      pickupTime: normalizePickupTimeToIso(cleanService.pickupTime),
      ally: companyName
    });

    if (result.success) {
      setShowAddService(false);
      toast.success('Servicio Agregado', {
        className: "bg-card text-card-foreground border-border",
        description: `Servicio añadido a ${companyName}`
      });
    } else {
      toast.error('Error al agregar servicio', {
        description: result.error
      });
    }
    return result.success;
  };
  
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const handleEditService = (service: ExtendedService) => {
    setEditingService(service);
  };

  const normalizeOptionalString = (value: unknown): string | undefined => {
    if (typeof value !== 'string') return undefined;
    const trimmed = value.trim();
    return trimmed.length ? trimmed : undefined;
  };

  const normalizeOptionalNumber = (value: unknown): number | undefined => {
    if (typeof value !== 'number' || Number.isNaN(value)) return undefined;
    return value;
  };

  const normalizeNotesForUpdate = (value: unknown): string | undefined => {
    if (typeof value === 'string') return normalizeOptionalString(value);
    if (!Array.isArray(value)) return undefined;

    const notesText = value
      .map((note) => {
        if (!note || typeof note !== 'object') return '';
        const item = note as ServiceNoteLike;
        return [item.title, item.content, item.caption]
          .filter((part): part is string => typeof part === 'string' && part.trim().length > 0)
          .join(' - ')
          .trim();
      })
      .filter(Boolean)
      .join(' | ');

    return normalizeOptionalString(notesText);
  };
  
  const handleSaveEdit = async (updatedService: ExtendedService) => {
    // Prepare data for API update
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
      // TODO: Map assignedDriver and assignedVehicle to driver/vehicle IDs
    };

    const result = await updateService(updatedService.id, updateData);

    if (result.success) {
      const originalService = allServices.find(s => s.id === updatedService.id);
      if (originalService?.serviceType !== updatedService.serviceType) {
        toast.success('Servicio Movido', {
          className: "bg-card text-card-foreground border-border",
          description: `Servicio movido a ${getCompanyName(updatedService.serviceType)}`
        });
      } else {
        toast.success('Servicio Actualizado');
      }
      await refetchServices();
      setEditingService(null);
    } else {
      toast.error('Error al actualizar servicio', {
        description: result.error
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
      throw new Error(result.message || 'Failed to update PDF profile');
    }

    await refetchServices();
  };

  const handleFlightTimeUpdate = async (serviceId: string, formattedTime: string) => {
    const targetService = allServices.find((service) => service.id === serviceId);

    if (!targetService) {
      toast.error('Servicio no encontrado');
      return;
    }

    const result = await updateService(serviceId, {
      pickupTime: formattedTime,
    });

    if (result.success) {
      toast.success('Hora de servicio actualizada', {
        className: 'bg-card text-card-foreground border-border',
        description: `Servicio ${targetService.code} actualizado`,
      });
    } else {
      toast.error('Error al actualizar hora', {
        description: result.error
      });
    }
  };

  const exportToCSV = useCallback(() => {
    console.log('🔍🔍🔍 DEBUG: AllServices exportToCSV called 🔍🔍🔍');
    console.log('🔍 activeTab:', activeTab);
    console.log('🔍 allServices length:', allServices.length);
    console.log('🔍 filteredServices length:', filteredServices.length);
    console.log('🔍 First filtered service:', filteredServices[0]);

    alert(`DEBUG: About to export ${filteredServices.length} services`);

    // CSV Headers
    const headers = [
      'Empresa',
      'Código',
      'Cliente',
      'Tipo',
      'Hora',
      'PAX',
      'Origen',
      'Destino',
      'Vuelo',
      'Vehículo',
      'Conductor',
      'Estado',
      'Notas'
    ].map(h => `"${h}"`); // Wrap headers in quotes

    // Convert services to CSV rows
    const csvRows = filteredServices.map(service => {
      const company = getCompanyName(service.serviceType);
      const time = isIsoLikeDateTime(service.pickupTime)
        ? convertIsoStringTo12h(service.pickupTime)
        : service.pickupTime;

      const row = [
        company,
        service.code || '',
        service.clientName || '',
        service.kindOf || '',
        time || '',
        service.pax?.toString() || '0',
        service.pickupLocation || '',
        service.dropoffLocation || '',
        service.flightCode || '',
        service.assignedVehicle || '',
        service.assignedDriver || '',
        service.status || 'pending',
        service.notes || ''
      ].map(field => `"${String(field).replace(/"/g, '""')}"`); // Escape quotes, ensure string

      return row;
    });

    console.log('🔍 CSV rows count:', csvRows.length);
    console.log('🔍 First CSV row:', csvRows[0]);

    // Combine headers and rows
    const csvContent = [headers.join(','), ...csvRows.map(row => row.join(','))]
      .join('\n');

    console.log('🔍 CSV content length:', csvContent.length);
    console.log('🔍 CSV preview:', csvContent.substring(0, 200));

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `itinerario-${selectedDate}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('CSV Exportado', {
      className: "bg-card text-card-foreground border-border",
      description: `Se exportaron ${filteredServices.length} servicios`
    });
  }, [filteredServices, selectedDate]);

  const getCompanyName = (serviceType: string) => {
    switch (serviceType) {
      case 'at': return 'Airport Transfer';
      case 'st': return 'Sacbé Transfer';
      case 'mbt': return 'MB Transfer';
      default: return serviceType.toUpperCase();
    }
  };
  
  const handleRemoveService = async (service: ExtendedService) => {
    if (confirm(`Are you sure you want to remove service ${service.code}?`)) {
      const result = await deleteService(service.id);

      if (result.success) {
        toast.success('Servicio eliminado', {
          description: `${service.code} ha sido eliminado`
        });
      } else {
        toast.error('Error al eliminar servicio', {
          description: result.error
        });
      }
    }
  };
  
  const getServiceTypeLabel = (serviceType: string) => {
    return SERVICE_TYPE_LABELS[serviceType] || serviceType;
  };

  const getServiceTypeColors = (serviceType: string) => {
    return SERVICE_TYPE_THEMES[serviceType] || SERVICE_TYPE_THEMES.default;
  };
  
  const getStatusColor = (status: ServiceStatus) => {
    return STATUS_COLORS[status] || STATUS_COLORS.default;
  };
  
  const kindOfElement = (kind: 'ARRIVAL' | 'DEPARTURE' | 'TRANSFER') => {
    const base = 'px-2 py-1 rounded-full text-xs font-semibold text-white inline-block';
    
    switch (kind) {
      case 'ARRIVAL':
        return <span className={`${base} bg-green-500`}>LLEGADA</span>;
      case 'DEPARTURE':
        return <span className={`${base} bg-blue-500`}>SALIDA</span>;
      case 'TRANSFER':
        return <span className={`${base} bg-yellow-500 text-black`}>TRANSFERENCIA</span>;
      default:
        return <span className={`${base} bg-gray-400`}>DESCONOCIDO</span>;
    }
  };

  const renderFilters = () => (
    <Card extra="w-full mb-6">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <BsFilter className="text-accent" />
          <h3 className="text-lg font-semibold text-navy-700 dark:text-white">Filtros y Búsquedas</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Buscar
            </label>
            <div className="relative">
              <BsSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cliente, código, ubicación..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-navy-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
          
          {/* Service Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tipo del Servicio
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-navy-700 dark:border-gray-600 dark:text-white"
            >
              {SERVICE_TYPE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Estado
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-navy-700 dark:border-gray-600 dark:text-white"
            >
              {STATUS_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Organizar Por
            </label>
            <select
              value={`${sortField}-${sortDirection}`}
              onChange={(e) => {
                const [field, direction] = e.target.value.split('-');
                setSortField(field as SortField);
                setSortDirection(direction as SortDirection);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-navy-700 dark:border-gray-600 dark:text-white"
            >
              {SORT_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </Card>
  );

  const renderServicesTable = () => (
    <Card extra="w-full">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-navy-700 dark:text-white">
              Todos los Servicios ({filteredServices.length})
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Maneja los servicios de todas las fuentes: Airport Transfer, Sacbé Transfer, y MB Transfer
            </p>
          </div>
        </div>
        
        {filteredServices.length === 0 ? (
          <div className="text-center py-12">
            <HiOutlineViewList className="text-6xl text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-navy-700 dark:text-white mb-2">
              No se encontraron servicios 
            </h4>
            <p className="text-gray-600 dark:text-gray-300">
              {allServices.length === 0 
                ? 'No services have been cached yet. Use the individual service sections to add services.'
                : 'No services match your current filters. Try adjusting the search criteria.'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="px-4 py-3 text-center w-16">
                    <span className="text-xs font-semibold uppercase text-gray-500">
                      No.
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('code')}
                      className="flex items-center gap-1 text-xs font-semibold uppercase text-gray-500 hover:text-blue-600"
                    >
                      <FaHashtag /> Código 
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('client')}
                      className="flex items-center gap-1 text-xs font-semibold uppercase text-gray-500 hover:text-blue-600"
                    >
                      <FaUser /> Cliente
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('time')}
                      className="flex items-center gap-1 text-xs font-semibold uppercase text-gray-500 hover:text-blue-600"
                    >
                      <FaClock /> Hora 
                    </button>
                  </th>
                  <th className="px-4 py-3 text-center">
                    <span className="flex items-center justify-center gap-1 text-xs font-semibold uppercase text-gray-500">
                      <FaUsers /> PAX
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <span className="flex items-center gap-1 text-xs font-semibold uppercase text-gray-500">
                      <FaRoute /> Ruta
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('type')}
                      className="flex items-center gap-1 text-xs font-semibold uppercase text-gray-500 hover:text-blue-600"
                    >
                      <FaTags /> Tipo 
                    </button>
                  </th>
                  <th className="px-4 py-3 text-center">
                    <span className="text-xs font-semibold uppercase text-gray-500">
                      Acciones 
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredServices.map((service, index) => {
                  const colors = getServiceTypeColors(service.serviceType);
                  return (
                    <tr key={service.code} className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 ${colors.bg} ${colors.border}`}>
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${colors.badge}`}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col">
                          <span className={`font-medium ${colors.text}`}>
                            {service.code}
                          </span>
                          <span className="text-xs text-gray-500">
                            {getServiceTypeLabel(service.serviceType)}
                          </span>
                        </div>
                      </td>
                    <td className="px-4 py-4">
                      <span className="font-medium text-navy-700 dark:text-white">
                        {service.clientName}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-900 dark:text-gray-100">
                        {isIsoLikeDateTime(service.pickupTime)
                          ? convertIsoStringTo12h(service.pickupTime)
                          : service.pickupTime}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-full text-sm font-medium">
                        {service.pax}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="relative group">
                        <button className="text-gray-500 hover:text-blue-600">
                          <FaMapSigns />
                        </button>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-sm text-white bg-gray-800 rounded-md whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-300 z-10">
                          <div className="space-y-1">
                            <div><strong>DESDE:</strong> {service.pickupLocation}</div>
                            <div><strong>HASTA:</strong> {service.dropoffLocation}</div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {kindOfElement(service.kindOf)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditService(service)}
                          className="p-2 text-blue-300 dark:text-blue-100 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Edit Service"
                        >
                          <BsPencil />
                        </button>
                        <button
                          onClick={() => handleRemoveService(service)}
                          className="p-2 bg-red-100 text-red-400 hover:bg-red-50 dark:text-red-900 dark:bg-red-200 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Remove Service"
                        >
                          <BsTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Card>
  );

  const renderEditModal = () => {
    if (!editingService || !mounted) return null;
    
    const modalContent = (
      <div 
        className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setEditingService(null);
          }
        }}
      >
        <div className="w-full max-w-4xl rounded-xl bg-white dark:bg-navy-800 shadow-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-navy-700 dark:text-white">
              Edición de Servicio: {editingService.clientName}
            </h2>
            <button
              onClick={() => setEditingService(null)}
              className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
            >
              ×
            </button>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Service Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Código
                </label>
                <input
                  type="text"
                  value={editingService.code}
                  onChange={(e) => setEditingService({ ...editingService, code: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-navy-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              {/* Company */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Compañía
                </label>
                <select
                  value={editingService.serviceType}
                  onChange={(e) => setEditingService({ ...editingService, serviceType: e.target.value as 'at' | 'st' | 'mbt' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-navy-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="mbt">MB Transfer</option>
                  <option value="st">Sacbé Transfer</option>
                  <option value="at">Airport Transfer</option>
                </select>
              </div>
              
              {/* Client Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nombre del Cliente
                </label>
                <input
                  type="text"
                  value={editingService.clientName}
                  onChange={(e) => setEditingService({ ...editingService, clientName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-navy-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              {/* Service Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tipo del Servicio 
                </label>
                <select
                  value={editingService.kindOf}
                  onChange={(e) => setEditingService({ ...editingService, kindOf: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-navy-700 dark:border-gray-600 dark:text-white"
                >
                  {SERVICE_KIND_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Estado 
                </label>
                <select
                  value={editingService.status}
                  onChange={(e) => setEditingService({ ...editingService, status: e.target.value as ServiceStatus })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-navy-700 dark:border-gray-600 dark:text-white"
                >
                  {STATUS_OPTIONS.slice(1).map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Pickup Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Hora de Recogida 
                </label>
                <input 
                  type="time"
                  value={toTimeInputValue(editingService.pickupTime)}
                  onChange={(e) => {{                                        
                    setEditingService({
                      ...editingService,
                      pickupTime: `${selectedDate}T${e.target.value}:00.000Z`
                    });
                  }}}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-navy-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              {/* PAX */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  PAX
                </label>
                <input
                  type="number"
                  min="1"
                  value={editingService.pax}
                  onChange={(e) => setEditingService({ ...editingService, pax: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-navy-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              {/* Flight Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Código de Vuelo 
                </label>
                <input
                  type="text"
                  value={editingService.flightCode || ''}
                  onChange={(e) => setEditingService({ ...editingService, flightCode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-navy-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              {/* Assigned Vehicle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Vehículo Asignado 
                </label>
                <select
                  value={editingService.vehicleType || editingService.assignedVehicle || ''}
                  onChange={(e) => setEditingService({ ...editingService, vehicleType: e.target.value, assignedVehicle: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-navy-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Sin asignar</option>
                  {vehicleOptions.map(vehicle => (
                    <option key={vehicle.id} value={vehicle.name}>
                      {vehicle.name}{typeof vehicle.paxCapacity === 'number' ? ` (Cap: ${vehicle.paxCapacity})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Pickup Location */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Lugar de Recogida 
                </label>
                <input
                  type="text"
                  value={editingService.pickupLocation}
                  onChange={(e) => setEditingService({ ...editingService, pickupLocation: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-navy-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              {/* Destination */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Destino 
                </label>
                <input
                  type="text"
                  value={editingService.dropoffLocation}
                  onChange={(e) => setEditingService({ ...editingService, dropoffLocation: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-navy-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              {/* Notes */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notas
                </label>
                <textarea
                  value={editingService.notes || ''}
                  onChange={(e) => setEditingService({ ...editingService, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-navy-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setEditingService(null)}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancelar
            </button>
            <button
              onClick={() => handleSaveEdit(editingService)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    );

    return createPortal(modalContent, document.body);
  };

  const renderLiveMode = () => (
    <Card extra="w-full">
      <div className="p-8 text-center">
        <BsPlay className="text-6xl text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-2">
          Live Mode
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Live tracking functionality will be implemented here. This will provide real-time monitoring of all active services.
        </p>
        <div className="flex items-center justify-center gap-2 text-yellow-600">
          <BsExclamationTriangle />
          <span className="text-sm font-medium">Coming Soon</span>
        </div>
      </div>
    </Card>
  );
	
  return (
    <div className="m-10">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={popView}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          <BsArrowLeft className="text-xl text-black dark:text-white" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-navy-700 dark:text-white">
            Itinerario General De Operaciones
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {activeTab === 'overview' 
              ? 'Maneja todos los servicios de Airport Transfer, Sacbé Transfer, y MB Transfer de la fecha elegida.' 
              : 'Monitorea y maneja los servicios en tiempo real.'
            }
          </p>
          <p className="text-sm text-accent-600 dark:text-accent-400 mt-1">
            Servicios del: <i>{new Date(selectedDate).toLocaleDateString('es-ES', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              timeZone: 'UTC'
            }).toUpperCase()}</i>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <HiOutlineViewList className="text-3xl text-accent-500" />
        </div>
      </div>
      
      {activeTab === 'overview' ? (
        <>
          {renderFilters()}
          {renderServicesTable()}
          {renderEditModal()}
          <FlightComparisonModal
            isOpen={showFlightComparison}
            onClose={() => setShowFlightComparison(false)}
            services={allServices}
            selectedDate={selectedDate}
            onUpdateServiceTime={handleFlightTimeUpdate}
          />
          <AddServiceModal
            isOpen={showAddService}
            onClose={() => setShowAddService(false)}
            onSave={handleAddService}
            selectedDate={selectedDate}
          />
          <PDFGeneratorModal
            isOpen={showPDFGenerator}
            onClose={() => setShowPDFGenerator(false)}
            services={filteredServices}
            selectedDate={selectedDate}
            onServiceUpdate={handlePDFServiceUpdate}
          />
        </>
      ) : (
        renderLiveMode()
      )}
    </div>
  );
};

export default AllServicesView;

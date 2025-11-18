"use client";

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigation } from '../../contexts/NavigationContext';
import { useServiceData } from '../../contexts/ServiceDataContext';
import { useBottomBar } from '../../contexts/BottomBarContext';
import { ServiceInput } from '../../types/services';
import { convertIsoStringTo12h, convertTo12Hour, mockDrivers, mockVehicles } from '../../utils/services';
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
import { toast } from "sonner";

import Card from '../single/card';
import { 
  BsArrowLeft, BsSearch, BsFilter, BsEye, BsPlay, BsPencil, BsTrash, BsCheckCircle, BsExclamationTriangle, BsClock, BsFilePdf, BsDownload
} from 'react-icons/bs';
import { 
  FaHashtag, FaUser, FaClock, FaUsers, FaRoute, FaMapSigns, FaTags, FaCar, FaUserTie, FaPlus
} from 'react-icons/fa';
import { HiOutlineViewList } from 'react-icons/hi';

type ServiceStatus = 'pending' | 'assigned' | 'in-progress' | 'completed' | 'cancelled';
type SortField = 'time' | 'client' | 'type' | 'status' | 'code';
type SortDirection = 'asc' | 'desc';

interface ExtendedService extends ServiceInput {
  serviceType: 'at' | 'st' | 'mbt';
  status: ServiceStatus;
  assignedDriver?: string;
  assignedVehicle?: string;
}

const AllServicesView = () => {
  const { popView } = useNavigation();
  const { getCache, setCache, selectedDate } = useServiceData();
  const { setActions, clearActions } = useBottomBar();
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'overview' | 'live'>('overview');
  
  // Services data
  const [allServices, setAllServices] = useState<ExtendedService[]>([]);
  const [filteredServices, setFilteredServices] = useState<ExtendedService[]>([]);
  
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
  
  // Load all services from cache for the selected date
  const loadServicesFromCache = () => {
    const atCache = getCache('at', selectedDate);
    const stCache = getCache('st', selectedDate);
    const mbtCache = getCache('mbt', selectedDate);
    
    const services: ExtendedService[] = [];
    
    // Add AT services with deep cloning
    if (atCache && atCache.data) {
      services.push(...atCache.data.map(service => ({
        ...JSON.parse(JSON.stringify(service)), // Deep clone to prevent reference issues
        serviceType: 'at' as const,
        status: (service as any).status || 'pending' as ServiceStatus,
        assignedDriver: (service as any).assignedDriver,
        assignedVehicle: (service as any).assignedVehicle
      })));
    }
    
    // Add ST services with deep cloning
    if (stCache && stCache.data) {
      services.push(...stCache.data.map(service => ({
        ...JSON.parse(JSON.stringify(service)), // Deep clone to prevent reference issues
        serviceType: 'st' as const,
        status: (service as any).status || 'pending' as ServiceStatus,
        assignedDriver: (service as any).assignedDriver,
        assignedVehicle: (service as any).assignedVehicle
      })));
    }
    
    // Add MBT services with deep cloning
    if (mbtCache && mbtCache.data) {
      services.push(...mbtCache.data.map(service => ({
        ...JSON.parse(JSON.stringify(service)), // Deep clone to prevent reference issues
        serviceType: 'mbt' as const,
        status: (service as any).status || 'pending' as ServiceStatus,
        assignedDriver: (service as any).assignedDriver,
        assignedVehicle: (service as any).assignedVehicle
      })));
    }
    
    setAllServices(services);
  };

  // Load services from cache when selectedDate changes
  useEffect(() => {
    loadServicesFromCache();
  }, [selectedDate, loadServicesFromCache]);
  
  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...allServices];
    
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
    }
    
    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(s => s.status === filterStatus);
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
        case 'time':
          aValue = new Date(a.pickupTime);
          bValue = new Date(b.pickupTime);
          break;
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
    
    setFilteredServices(filtered);
  }, [allServices, filterType, filterStatus, searchTerm, sortField, sortDirection]);
  
  // Update bottom bar actions based on active tab
  useEffect(() => {
    if (activeTab === 'overview') {
      setActions([
        {
          key: "overview-tab",
          label: "Vista General",
          Icon: BsEye,
          variant: "primary",
          onClick: () => setActiveTab('overview')
        },
        {
          key: "live-tab",
          label: "En Vivo",
          Icon: BsPlay,
          onClick: () => setActiveTab('live')
        },
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
  }, [activeTab, filteredServices, clearActions, exportToCSV, setActions]);
  
  const checkTimeData = () => {
    setShowFlightComparison(true);
  };
  
  const getPDFs = () => {
    setShowPDFGenerator(true);
  };
  
  const handleAddService = (newService: ServiceInput & { serviceType?: 'at' | 'st' | 'mbt' }) => {
    // Determine which cache to use based on serviceType
    const cacheType = newService.serviceType || 'mbt';
    const cache = getCache(cacheType, selectedDate);
    const existingData = cache?.data || [];
    
    // Clean the service to remove serviceType before saving
    const { serviceType: _, ...cleanService } = newService;
    
    // Add the new service to the existing data
    const updatedData = [...existingData, cleanService];
    
    // Save to the appropriate cache
    setCache(cacheType, updatedData, selectedDate);
    
    // Reload all services to reflect the new addition
    loadServicesFromCache();
    
    setShowAddService(false);
    
    const companyName = getCompanyName(cacheType);
    toast.success('Servicio Agregado', {
      className: "bg-card text-card-foreground border-border",
      description: `Servicio añadido a ${companyName}`
    });
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
  
  const handleSaveEdit = (updatedService: ExtendedService) => {
    // Check if company has changed
    const originalService = allServices.find(s => s.code === updatedService.code);
    const oldCacheKey = originalService?.serviceType;
    const newCacheKey = updatedService.serviceType;
    
    // Create a clean ServiceInput object for cache storage
    const cleanServiceForCache = {
      id: updatedService.id,
      code: updatedService.code,
      kindOf: updatedService.kindOf,
      clientName: updatedService.clientName,
      pickupTime: updatedService.pickupTime,
      flightCode: updatedService.flightCode,
      pax: updatedService.pax,
      luggage: updatedService.luggage,
      pickupLocation: updatedService.pickupLocation,
      dropoffLocation: updatedService.dropoffLocation,
      notes: updatedService.notes,
      vehicleType: updatedService.vehicleType,
      ally: updatedService.ally,
      assignedDriver: updatedService.assignedDriver,
      assignedVehicle: updatedService.assignedVehicle,
      pdfData: updatedService.pdfData,
      // Include status for persistence (extends ServiceInput)
      status: updatedService.status
    } as ServiceInput & { status: ServiceStatus };

    if (oldCacheKey && oldCacheKey !== newCacheKey) {
      // Company has changed - move service to new cache
      
      // Remove from old cache
      const oldCache = getCache(oldCacheKey, selectedDate);
      if (oldCache) {
        const oldUpdatedData = oldCache.data.filter(s => s.code !== updatedService.code);
        setCache(oldCacheKey, oldUpdatedData, selectedDate);
      }
      
      // Add to new cache
      const newCache = getCache(newCacheKey, selectedDate);
      const newCacheData = newCache?.data || [];
      const newUpdatedData = [...newCacheData, cleanServiceForCache];
      setCache(newCacheKey, newUpdatedData, selectedDate);
      
      toast.success('Servicio Movido', {
        className: "bg-card text-card-foreground border-border",
        description: `Servicio movido a ${getCompanyName(newCacheKey)}`
      });
    } else {
      // Company hasn't changed - update in same cache
      const cache = getCache(newCacheKey, selectedDate);
      
      if (cache) {
        // Update only the specific service in the cache with deep cloning to prevent reference issues
        const updatedData = cache.data.map(s => 
          s.code === updatedService.code ? cleanServiceForCache : JSON.parse(JSON.stringify(s))
        );
        
        setCache(newCacheKey, updatedData, selectedDate);
        
        toast.success('Servicio Actualizado');
      }
    }
    
    // Reload all services from cache to ensure consistency
    loadServicesFromCache();
    setEditingService(null);
  };

  const handlePDFServiceUpdate = (serviceCode: string, updatedService: ExtendedService) => {
    // Update service in the appropriate cache including pdfData
    const cacheKey = updatedService.serviceType;
    const cache = getCache(cacheKey, selectedDate);
    
    if (cache) {
      // Create a clean ServiceInput object for cache storage with pdfData included
      const cleanServiceForCache = {
        id: updatedService.id,
        code: updatedService.code,
        kindOf: updatedService.kindOf,
        clientName: updatedService.clientName,
        pickupTime: updatedService.pickupTime,
        flightCode: updatedService.flightCode,
        pax: updatedService.pax,
        luggage: updatedService.luggage,
        pickupLocation: updatedService.pickupLocation,
        dropoffLocation: updatedService.dropoffLocation,
        notes: updatedService.notes,
        vehicleType: updatedService.vehicleType,
        ally: updatedService.ally,
        assignedDriver: updatedService.assignedDriver,
        assignedVehicle: updatedService.assignedVehicle,
        pdfData: updatedService.pdfData, // Include pdfData for PDF customization
        // Include status for persistence (extends ServiceInput)
        status: updatedService.status
      } as ServiceInput & { status: ServiceStatus };
      
      // Update only the specific service in the cache with deep cloning to prevent reference issues
      const updatedData = cache.data.map(s => 
        s.code === serviceCode ? cleanServiceForCache : JSON.parse(JSON.stringify(s))
      );
      
      setCache(cacheKey, updatedData, selectedDate);
      
      // Reload all services from cache to ensure consistency
      loadServicesFromCache();
    }
  };

  const exportToCSV = () => {
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
    ];

    // Convert services to CSV rows
    const csvRows = filteredServices.map(service => {
      const company = getCompanyName(service.serviceType);
      const time = service.serviceType === 'at' 
        ? convertIsoStringTo12h(service.pickupTime)  
        : service.pickupTime;
      
      return [
        company,
        service.code || '',
        service.clientName,
        service.kindOf,
        time,
        service.pax.toString(),
        service.pickupLocation,
        service.dropoffLocation,
        service.flightCode || '',
        service.assignedVehicle || '',
        service.assignedDriver || '',
        service.status || 'pending',
        service.notes || ''
      ].map(field => `"${field.replace(/"/g, '""')}"`) // Escape quotes
    });

    // Combine headers and rows
    const csvContent = [headers, ...csvRows]
      .map(row => row.join(','))
      .join('\n');

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
  };

  const getCompanyName = (serviceType: string) => {
    switch (serviceType) {
      case 'at': return 'Airport Transfer';
      case 'st': return 'Sacbé Transfer';
      case 'mbt': return 'MB Transfer';
      default: return serviceType.toUpperCase();
    }
  };
  
  const handleRemoveService = (service: ExtendedService) => {
    if (confirm(`Are you sure you want to remove service ${service.code}?`)) {
      // Remove from appropriate cache
      const cacheKey = service.serviceType;
      const cache = getCache(cacheKey, selectedDate);
      
      if (cache) {
        // Filter out the specific service and ensure deep cloning for remaining services
        const updatedData = cache.data
          .filter(s => s.code !== service.code)
          .map(s => JSON.parse(JSON.stringify(s)));
        
        setCache(cacheKey, updatedData, selectedDate);
        
        // Reload all services from cache to ensure consistency
        loadServicesFromCache();
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
        return <span className={`${base} bg-green-500`}>ARRIVAL</span>;
      case 'DEPARTURE':
        return <span className={`${base} bg-blue-500`}>DEPARTURE</span>;
      case 'TRANSFER':
        return <span className={`${base} bg-yellow-500 text-black`}>TRANSFER</span>;
      default:
        return <span className={`${base} bg-gray-400`}>UNKNOWN</span>;
    }
  };

  const renderFilters = () => (
    <Card extra="w-full mb-6">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <BsFilter className="text-accent" />
          <h3 className="text-lg font-semibold text-navy-700 dark:text-white">Filters & Search</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search
            </label>
            <div className="relative">
              <BsSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Client, code, location..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-navy-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
          
          {/* Service Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Service Type
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
              Status
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
              Sort By
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
              All Services ({filteredServices.length})
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Manage services from all sources: Airport Transfer, Sacbé Transfer, and MB Transfer
            </p>
          </div>
        </div>
        
        {filteredServices.length === 0 ? (
          <div className="text-center py-12">
            <HiOutlineViewList className="text-6xl text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-navy-700 dark:text-white mb-2">
              No Services Found
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
                      #
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('code')}
                      className="flex items-center gap-1 text-xs font-semibold uppercase text-gray-500 hover:text-blue-600"
                    >
                      <FaHashtag /> Code
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('client')}
                      className="flex items-center gap-1 text-xs font-semibold uppercase text-gray-500 hover:text-blue-600"
                    >
                      <FaUser /> Client
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('time')}
                      className="flex items-center gap-1 text-xs font-semibold uppercase text-gray-500 hover:text-blue-600"
                    >
                      <FaClock /> Time
                    </button>
                  </th>
                  <th className="px-4 py-3 text-center">
                    <span className="flex items-center justify-center gap-1 text-xs font-semibold uppercase text-gray-500">
                      <FaUsers /> PAX
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <span className="flex items-center gap-1 text-xs font-semibold uppercase text-gray-500">
                      <FaRoute /> Route
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('type')}
                      className="flex items-center gap-1 text-xs font-semibold uppercase text-gray-500 hover:text-blue-600"
                    >
                      <FaTags /> Type
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('status')}
                      className="flex items-center gap-1 text-xs font-semibold uppercase text-gray-500 hover:text-blue-600"
                    >
                      <BsCheckCircle /> Status
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <span className="flex items-center gap-1 text-xs font-semibold uppercase text-gray-500">
                      <FaCar /> Vehicle
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <span className="flex items-center gap-1 text-xs font-semibold uppercase text-gray-500">
                      <FaUserTie /> Driver
                    </span>
                  </th>
                  <th className="px-4 py-3 text-center">
                    <span className="text-xs font-semibold uppercase text-gray-500">
                      Actions
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredServices.map((service, index) => {
                  const colors = getServiceTypeColors(service.serviceType);
                  return (
                    <tr key={service.id} className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 ${colors.bg} ${colors.border}`}>
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
                        {service.serviceType === 'at' ? convertIsoStringTo12h(service.pickupTime) : service.pickupTime}
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
                            <div><strong>FROM:</strong> {service.pickupLocation}</div>
                            <div><strong>TO:</strong> {service.dropoffLocation}</div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {kindOfElement(service.kindOf)}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                        {service.status.replace('-', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {service.assignedVehicle || 'Unassigned'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {service.assignedDriver || 'Unassigned'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditService(service)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Edit Service"
                        >
                          <BsPencil />
                        </button>
                        <button
                          onClick={() => handleRemoveService(service)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
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
              Edit Service - {editingService.code}
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
                  Service Code
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
                  Company
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
                  Client Name
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
                  Service Type
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
                  Status
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
                  Pickup Time
                </label>
                <input 
                  type="time"
                  value={editingService.pickupTime}
                  onChange={(e) => {{
                    setEditingService({ ...editingService, pickupTime: convertTo12Hour(e.target.value) })
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
                  Flight Code
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
                  Assigned Vehicle
                </label>
                <select
                  value={editingService.assignedVehicle || ''}
                  onChange={(e) => setEditingService({ ...editingService, assignedVehicle: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-navy-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Unassigned</option>
                  {mockVehicles.map(vehicle => (
                    <option key={vehicle.id} value={vehicle.name}>
                      {vehicle.name} (Cap: {vehicle.capacity})
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Assigned Driver */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Assigned Driver
                </label>
                <select
                  value={editingService.assignedDriver || ''}
                  onChange={(e) => setEditingService({ ...editingService, assignedDriver: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-navy-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Unassigned</option>
                  {mockDrivers.map(driver => (
                    <option key={driver.id} value={driver.name}>
                      {driver.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Pickup Location */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Pickup Location
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
                  Destination
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
                  Notes
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
              Cancel
            </button>
            <button
              onClick={() => handleSaveEdit(editingService)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    );

    return createPortal(modalContent, document.body);
  };

  const renderTabButtons = () => (
    <div className="flex rounded-lg bg-gray-100 dark:bg-gray-700 p-1 mb-6">
      <button
        onClick={() => setActiveTab('overview')}
        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
          activeTab === 'overview'
            ? 'bg-white dark:bg-navy-800 text-accent-600 dark:text-accent-400 shadow-sm'
            : 'text-gray-600 dark:text-gray-300 hover:text-accent-600 dark:hover:text-accent-400'
        }`}
      >
        <BsEye />
        Overview
      </button>
      <button
        onClick={() => setActiveTab('live')}
        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
          activeTab === 'live'
            ? 'bg-white dark:bg-navy-800 text-accent-600 dark:text-accent-400 shadow-sm'
            : 'text-gray-600 dark:text-gray-300 hover:text-accent-600 dark:hover:text-accent-400'
        }`}
      >
        <BsPlay />
        Live Mode
      </button>
    </div>
  );

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
          <BsArrowLeft className="text-xl" />
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

      {renderTabButtons()}

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

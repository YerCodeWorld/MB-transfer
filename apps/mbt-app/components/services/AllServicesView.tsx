"use client";

import { useState, useEffect } from 'react';
import { useNavigation } from '../../contexts/NavigationContext';
import { useServiceData } from '../../contexts/ServiceDataContext';
import { useBottomBar } from '../../contexts/BottomBarContext';
import { ServiceInput } from '../../types/services';
import { convertIsoStringTo12h, mockDrivers, mockVehicles } from '../../utils/services';

import Card from '../single/card';
import { 
  BsArrowLeft, 
  BsSearch, 
  BsFilter, 
  BsEye, 
  BsPlay, 
  BsPencil, 
  BsTrash,
  BsCheckCircle,
  BsExclamationTriangle,
  BsClock,
  BsFilePdf
} from 'react-icons/bs';
import { 
  FaHashtag,
  FaUser,
  FaClock,
  FaUsers,
  FaRoute,
  FaMapSigns,
  FaTags,
  FaCar,
  FaUserTie,
  FaPlus
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
  
  // Load all services from cache for the selected date
  const loadServicesFromCache = () => {
    const atCache = getCache('at', selectedDate);
    const stCache = getCache('st', selectedDate);
    const mbtCache = getCache('mbt', selectedDate);
    
    const services: ExtendedService[] = [];
    
    // Add AT services
    if (atCache && atCache.data) {
      services.push(...atCache.data.map(service => ({
        ...service,
        serviceType: 'at' as const,
        status: (service as any).status || 'pending' as ServiceStatus,
        assignedDriver: (service as any).assignedDriver,
        assignedVehicle: (service as any).assignedVehicle
      })));
    }
    
    // Add ST services
    if (stCache && stCache.data) {
      services.push(...stCache.data.map(service => ({
        ...service,
        serviceType: 'st' as const,
        status: (service as any).status || 'pending' as ServiceStatus,
        assignedDriver: (service as any).assignedDriver,
        assignedVehicle: (service as any).assignedVehicle
      })));
    }
    
    // Add MBT services
    if (mbtCache && mbtCache.data) {
      services.push(...mbtCache.data.map(service => ({
        ...service,
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
  }, [selectedDate]);
  
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
          onClick: getPDFs
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
  }, [activeTab, filteredServices]);
  
  const checkTimeData = () => {
    alert('Check Time Data feature will use AeroAPI to verify flight times. This will be implemented in a future update.');
  };
  
  const getPDFs = () => {
    alert('Get PDFs feature will generate service PDFs. This will be implemented in a future update.');
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
    // Update service in the appropriate cache
    const cacheKey = updatedService.serviceType;
    const cache = getCache(cacheKey, selectedDate);
    
    if (cache) {
      // Create a clean ServiceInput object for cache storage (including assignments and status)
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
        status: updatedService.status
      };
      
      // Update only the specific service in the cache
      const updatedData = cache.data.map(s => 
        s.id === updatedService.id ? cleanServiceForCache : s
      );
      
      setCache(cacheKey, updatedData, selectedDate);
      
      // Reload all services from cache to ensure consistency
      loadServicesFromCache();
    }
    
    setEditingService(null);
  };
  
  const handleRemoveService = (service: ExtendedService) => {
    if (confirm(`Are you sure you want to remove service ${service.code}?`)) {
      // Remove from appropriate cache
      const cacheKey = service.serviceType;
      const cache = getCache(cacheKey, selectedDate);
      
      if (cache) {
        const updatedData = cache.data.filter(s => s.id !== service.id);
        setCache(cacheKey, updatedData, selectedDate);
        
        // Reload all services from cache to ensure consistency
        loadServicesFromCache();
      }
    }
  };
  
  const getServiceTypeLabel = (serviceType: string) => {
    switch (serviceType) {
      case 'at': return 'Airport Transfer';
      case 'st': return 'Sacbé Transfer';
      case 'mbt': return 'MB Transfer';
      default: return serviceType;
    }
  };

  const getServiceTypeColors = (serviceType: string) => {
    switch (serviceType) {
      case 'at': return {
        bg: 'bg-blue-50 dark:bg-blue-900/10',
        border: 'border-l-4 border-l-blue-500',
        text: 'text-blue-700 dark:text-blue-300',
        badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
      };
      case 'st': return {
        bg: 'bg-green-50 dark:bg-green-900/10',
        border: 'border-l-4 border-l-green-500',
        text: 'text-green-700 dark:text-green-300',
        badge: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      };
      case 'mbt': return {
        bg: 'bg-purple-50 dark:bg-purple-900/10',
        border: 'border-l-4 border-l-purple-500',
        text: 'text-purple-700 dark:text-purple-300',
        badge: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'
      };
      default: return {
        bg: 'bg-gray-50 dark:bg-gray-900/10',
        border: 'border-l-4 border-l-gray-500',
        text: 'text-gray-700 dark:text-gray-300',
        badge: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
      };
    }
  };
  
  const getStatusColor = (status: ServiceStatus) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'assigned': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'in-progress': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
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
              <option value="all">All Types</option>
              <option value="airport">Airport Transfer</option>
              <option value="sacbe">Sacbé Transfer</option>
              <option value="mbtransfer">MB Transfer</option>
              <option value="ARRIVAL">Arrivals Only</option>
              <option value="DEPARTURE">Departures Only</option>
              <option value="TRANSFER">Transfers Only</option>
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
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="assigned">Assigned</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
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
              <option value="time-asc">Time (Earliest)</option>
              <option value="time-desc">Time (Latest)</option>
              <option value="client-asc">Client (A-Z)</option>
              <option value="client-desc">Client (Z-A)</option>
              <option value="type-asc">Type (A-Z)</option>
              <option value="type-desc">Type (Z-A)</option>
              <option value="status-asc">Status (A-Z)</option>
              <option value="status-desc">Status (Z-A)</option>
              <option value="code-asc">Code (A-Z)</option>
              <option value="code-desc">Code (Z-A)</option>
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
    if (!editingService) return null;
    
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4">
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
                  <option value="ARRIVAL">Arrival</option>
                  <option value="DEPARTURE">Departure</option>
                  <option value="TRANSFER">Transfer</option>
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
                  <option value="pending">Pending</option>
                  <option value="assigned">Assigned</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              
              {/* Pickup Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Pickup Time
                </label>
                <input
                  type="datetime-local"
                  value={editingService.pickupTime}
                  onChange={(e) => setEditingService({ ...editingService, pickupTime: e.target.value })}
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
              day: 'numeric' 
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
        </>
      ) : (
        renderLiveMode()
      )}
    </div>
  );
};

export default AllServicesView;

"use client";

import { useState, useEffect } from 'react';
import { useNavigation } from '../../contexts/NavigationContext';
import { Service } from '../../types/services';
import { mockServices, mockDrivers, mockVehicles, detectEdgeCases } from '../../utils/services';

import Card from '../single/card';
import { 
  BsArrowLeft, BsEye, BsEyeSlash, BsPencil, BsTrash, BsCheckCircle, 
  BsXCircle, BsClock, BsPlayCircle, BsExclamationTriangle, BsFilter,
  BsTruck, BsPerson, BsGeoAlt, BsCalendar
} from 'react-icons/bs';
import { PiAirplaneBold } from 'react-icons/pi';

interface ServiceWithEdges extends Service {
  edgeCases: Array<{type: string, message: string}>;
}

const AllServicesView = () => {
  const { popView } = useNavigation();
  const [services, setServices] = useState<ServiceWithEdges[]>([]);
  const [viewMode, setViewMode] = useState<'overview' | 'live'>('overview');
  const [editingService, setEditingService] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    ally: 'all',
    showEdgeCases: false
  });
  const [sortBy, setSortBy] = useState<'time' | 'client' | 'status'>('time');

  useEffect(() => {
    // Load services with edge case detection
    const edgeCases = detectEdgeCases(mockServices);
    const servicesWithEdges: ServiceWithEdges[] = mockServices.map(service => ({
      ...service,
      edgeCases: edgeCases.filter(edge => edge.serviceId === service.id)
    }));
    setServices(servicesWithEdges);
  }, []);

  const filteredServices = services.filter(service => {
    if (filters.type !== 'all' && service.kindOf !== filters.type) return false;
    if (filters.status !== 'all' && service.state !== filters.status) return false;
    if (filters.ally !== 'all' && service.ally?.name !== filters.ally) return false;
    if (filters.showEdgeCases && service.edgeCases.length === 0) return false;
    return true;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'time':
        return new Date(a.pickupTime).getTime() - new Date(b.pickupTime).getTime();
      case 'client':
        return a.clientName.localeCompare(b.clientName);
      case 'status':
        return a.state.localeCompare(b.state);
      default:
        return 0;
    }
  });

  const updateServiceStatus = (serviceId: string, newStatus: Service['state']) => {
    setServices(prev => prev.map(service => 
      service.id === serviceId 
        ? { ...service, state: newStatus, updatedAt: new Date().toISOString() }
        : service
    ));
  };

  const assignDriver = (serviceId: string, driverId: string) => {
    const driver = mockDrivers.find(d => d.id === driverId);
    if (driver) {
      setServices(prev => prev.map(service => 
        service.id === serviceId 
          ? { ...service, driver, updatedAt: new Date().toISOString() }
          : service
      ));
    }
  };

  const assignVehicle = (serviceId: string, vehicleId: string) => {
    const vehicle = mockVehicles.find(v => v.id === vehicleId);
    if (vehicle) {
      setServices(prev => prev.map(service => 
        service.id === serviceId 
          ? { ...service, vehicle, updatedAt: new Date().toISOString() }
          : service
      ));
    }
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getStatusColor = (status: Service['state']) => {
    switch (status) {
      case 'UPCOMING': return 'bg-blue-100 text-blue-800';
      case 'ONGOING': return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELED': return 'bg-red-100 text-red-800';
      case 'REFUNDED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: Service['kindOf']) => {
    switch (type) {
      case 'ARRIVAL': return 'bg-green-100 text-green-800';
      case 'DEPARTURE': return 'bg-red-100 text-red-800';
      case 'TRANSFER': return 'bg-blue-100 text-blue-800';
    }
  };

  const upcomingServices = filteredServices.filter(s => s.state === 'UPCOMING');
  const ongoingServices = filteredServices.filter(s => s.state === 'ONGOING');
  const servicesWithEdges = filteredServices.filter(s => s.edgeCases.length > 0);

  const renderServiceCard = (service: ServiceWithEdges, isLiveMode = false) => (
    <Card key={service.id} extra="mb-4">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-bold text-navy-700 dark:text-white">
                {service.clientName}
              </h4>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getTypeColor(service.kindOf)}`}>
                {service.kindOf}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(service.state)}`}>
                {service.state}
              </span>
              {service.edgeCases.length > 0 && (
                <div className="text-yellow-500" title="Has edge cases">
                  <BsExclamationTriangle size={16} />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-300 mb-3">
              <div>
                <span className="font-medium">Code:</span> {service.code}
              </div>
              <div>
                <span className="font-medium">Time:</span> {formatTime(service.pickupTime)}
              </div>
              <div>
                <span className="font-medium">PAX:</span> {service.pax}
              </div>
              <div>
                <span className="font-medium">Flight:</span> {service.flightCode || 'N/A'}
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300 mb-3">
              <div className="flex items-center gap-1">
                <BsGeoAlt />
                {service.pickup.name} → {service.dropoff.name}
              </div>
              {service.ally && (
                <div className="flex items-center gap-1">
                  <BsTruck />
                  {service.ally.name}
                </div>
              )}
            </div>

            {service.edgeCases.length > 0 && (
              <div className="mb-3">
                {service.edgeCases.map((edge, i) => (
                  <div key={i} className="flex items-center gap-2 text-yellow-600 text-xs">
                    <BsExclamationTriangle />
                    {edge.message}
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500">Driver</label>
                <select
                  value={service.driver?.id || ''}
                  onChange={(e) => assignDriver(service.id, e.target.value)}
                  disabled={isLiveMode}
                  className="w-full text-sm border border-gray-300 rounded px-2 py-1 dark:bg-navy-700 dark:border-gray-600"
                >
                  <option value="">Assign driver</option>
                  {mockDrivers.map(driver => (
                    <option key={driver.id} value={driver.id}>
                      {driver.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500">Vehicle</label>
                <select
                  value={service.vehicle?.id || ''}
                  onChange={(e) => assignVehicle(service.id, e.target.value)}
                  disabled={isLiveMode}
                  className="w-full text-sm border border-gray-300 rounded px-2 py-1 dark:bg-navy-700 dark:border-gray-600"
                >
                  <option value="">Assign vehicle</option>
                  {mockVehicles.map(vehicle => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.name} (Cap: {vehicle.capacity})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="ml-4 flex flex-col gap-2">
            {!isLiveMode && (
              <>
                <button
                  onClick={() => setEditingService(editingService === service.id ? null : service.id)}
                  className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                >
                  <BsPencil />
                </button>
                <button className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
                  <BsTrash />
                </button>
              </>
            )}

            {isLiveMode && service.state === 'UPCOMING' && (
              <button
                onClick={() => updateServiceStatus(service.id, 'ONGOING')}
                className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
              >
                Start
              </button>
            )}

            {isLiveMode && service.state === 'ONGOING' && (
              <button
                onClick={() => updateServiceStatus(service.id, 'COMPLETED')}
                className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
              >
                Complete
              </button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );

  const renderOverviewMode = () => (
    <div>
      {/* Filters */}
      <Card extra="mb-6">
        <div className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-2 py-1 border border-gray-300 rounded dark:bg-navy-700 dark:border-gray-600"
              >
                <option value="all">All Types</option>
                <option value="ARRIVAL">Arrivals</option>
                <option value="DEPARTURE">Departures</option>
                <option value="TRANSFER">Transfers</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-2 py-1 border border-gray-300 rounded dark:bg-navy-700 dark:border-gray-600"
              >
                <option value="all">All Status</option>
                <option value="UPCOMING">Upcoming</option>
                <option value="ONGOING">Ongoing</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELED">Canceled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-2 py-1 border border-gray-300 rounded dark:bg-navy-700 dark:border-gray-600"
              >
                <option value="time">Pickup Time</option>
                <option value="client">Client Name</option>
                <option value="status">Status</option>
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={filters.showEdgeCases}
                  onChange={(e) => setFilters(prev => ({ ...prev, showEdgeCases: e.target.checked }))}
                />
                Show only edge cases
              </label>
            </div>
          </div>
        </div>
      </Card>

      {/* Services List */}
      <div>
        <h3 className="text-lg font-semibold text-navy-700 dark:text-white mb-4">
          Services ({filteredServices.length})
        </h3>
        {filteredServices.map(service => renderServiceCard(service, false))}
      </div>
    </div>
  );

  const renderLiveMode = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Upcoming Services */}
      <Card>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-navy-700 dark:text-white mb-4 flex items-center gap-2">
            <BsClock className="text-blue-500" />
            Upcoming ({upcomingServices.length})
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {upcomingServices.map(service => renderServiceCard(service, true))}
          </div>
        </div>
      </Card>

      {/* Ongoing Services */}
      <Card>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-navy-700 dark:text-white mb-4 flex items-center gap-2">
            <BsPlayCircle className="text-yellow-500" />
            Ongoing ({ongoingServices.length})
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {ongoingServices.map(service => renderServiceCard(service, true))}
          </div>
        </div>
      </Card>

      {/* Alerts & Edge Cases */}
      <Card>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-navy-700 dark:text-white mb-4 flex items-center gap-2">
            <BsExclamationTriangle className="text-red-500" />
            Alerts ({servicesWithEdges.length})
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {servicesWithEdges.map(service => (
              <div key={service.id} className="border border-yellow-200 rounded-lg p-3">
                <div className="font-medium text-navy-700 dark:text-white">
                  {service.clientName}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {formatTime(service.pickupTime)}
                </div>
                {service.edgeCases.map((edge, i) => (
                  <div key={i} className="text-xs text-yellow-600 mt-1">
                    {edge.message}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="w-full">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={popView}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          <BsArrowLeft className="text-xl" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-navy-700 dark:text-white">
            All Services
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            View, edit, and manage all services
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('overview')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              viewMode === 'overview' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            <BsEye />
            Overview
          </button>
          <button
            onClick={() => setViewMode('live')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              viewMode === 'live' 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            <BsPlayCircle />
            Live Mode
          </button>
        </div>
      </div>

      {viewMode === 'overview' ? renderOverviewMode() : renderLiveMode()}
    </div>
  );
};

export default AllServicesView;
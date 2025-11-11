"use client";

import { useState, useEffect } from 'react';
import { useNavigation } from '../../contexts/NavigationContext';
import { useServiceData } from '../../contexts/ServiceDataContext';
import { useBottomBar } from '../../contexts/BottomBarContext';
import { ServiceInput } from '../../types/services';
import { mockDrivers, mockVehicles } from '../../utils/services';
import ServiceTable from '../shared/ServiceTable';

import Card from '../single/card';
import { BsArrowLeft, BsPlus, BsTrash, BsCheckCircle, BsList, BsSave } from 'react-icons/bs';
import { PiAddressBookThin } from 'react-icons/pi';
import { HiOutlineDownload, HiOutlineSave, HiClipboardList } from 'react-icons/hi';

interface FormService extends ServiceInput {
  id: string;
  errors: { [key: string]: string };
}

const MBTransferService = () => {
  const { popView } = useNavigation();
  const { 
    currentServices, 
    setCurrentServices, 
    getCache, 
    setCache, 
    exportServices,
    setActiveServiceType,
    selectedDate 
  } = useServiceData();
  const { setActions, clearActions } = useBottomBar();
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'form' | 'services'>('form');
  
  // Form services state (current form entries)
  const [services, setServices] = useState<FormService[]>([
    {
      id: '1',
      code: '',
      kindOf: 'TRANSFER',
      clientName: '',
      pickupTime: '',
      flightCode: '',
      pax: 1,
      luggage: 0,
      pickupLocation: '',
      dropoffLocation: '',
      notes: '',
      vehicleType: '',
      ally: 'MB Transfer',
      errors: {}
    }
  ]);
  
  // Cached services state (all previously submitted services)
  const [cachedServices, setCachedServices] = useState<ServiceInput[]>([]);

  // Load cached data on component mount and set up service type
  useEffect(() => {
    setActiveServiceType('mbt');
    
    // Check specifically for 'mbt' service type cache for the selected date
    const cache = getCache('mbt', selectedDate);
    if (cache && cache.data.length > 0) {
      setCachedServices(cache.data);
      setActiveTab('services'); // Show services if data exists
    } else {
      // Reset to form tab if no cache for this date
      setCachedServices([]);
      setActiveTab('form');
    }
  }, [selectedDate]);

  const addNewService = () => {
    const newService: FormService = {
      id: Date.now().toString(),
      code: '',
      kindOf: 'TRANSFER',
      clientName: '',
      pickupTime: '',
      flightCode: '',
      pax: 1,
      luggage: 0,
      pickupLocation: '',
      dropoffLocation: '',
      notes: '',
      vehicleType: '',
      ally: 'MB Transfer',
      errors: {}
    };
    setServices(prev => [...prev, newService]);
  };

  const removeService = (id: string) => {
    if (services.length > 1) {
      setServices(prev => prev.filter(s => s.id !== id));
    }
  };

  const updateService = (id: string, field: keyof ServiceInput, value: any) => {
    setServices(prev => prev.map(service => {
      if (service.id === id) {
        const updated = { ...service, [field]: value };
        
        // Clear related error when field is updated
        if (updated.errors[field]) {
          const newErrors = { ...updated.errors };
          delete newErrors[field];
          updated.errors = newErrors;
        }

        return updated;
      }
      return service;
    }));
  };

  const validateService = (service: FormService): { [key: string]: string } => {
    const errors: { [key: string]: string } = {};

    if (!service.clientName.trim()) {
      errors.clientName = 'Passenger name is required';
    }

    if (!service.code?.trim()) {
      errors.code = 'Service code is required';
    }

    if (!service.pickupTime) {
      errors.pickupTime = 'Pickup time is required';
    }

    if (!service.pickupLocation.trim()) {
      errors.pickupLocation = 'Pickup location is required';
    }

    if (!service.dropoffLocation.trim()) {
      errors.dropoffLocation = 'Destination is required';
    }

    if (service.pax <= 0) {
      errors.pax = 'PAX must be greater than 0';
    }

    if (service.kindOf === 'ARRIVAL' && !service.flightCode?.trim()) {
      errors.flightCode = 'Flight code is required for arrivals';
    }

    return errors;
  };

  const validateAllServices = () => {
    const updatedServices = services.map(service => ({
      ...service,
      errors: validateService(service)
    }));
    setServices(updatedServices);
    return updatedServices.every(service => Object.keys(service.errors).length === 0);
  };

  const submitServices = () => {
    if (validateAllServices()) {
      const validServices = services.filter(s => Object.keys(s.errors).length === 0);
      
      // Convert FormService to ServiceInput and add to cached list
      const serviceInputs: ServiceInput[] = validServices.map(service => ({
        id: `mbt_${Date.now()}_${service.id}`,
        code: service.code,
        kindOf: service.kindOf,
        clientName: service.clientName,
        pickupTime: `${selectedDate}T${service.pickupTime}:00`, // Combine date + time
        flightCode: service.flightCode,
        pax: service.pax,
        luggage: service.luggage,
        pickupLocation: service.pickupLocation,
        dropoffLocation: service.dropoffLocation,
        notes: service.notes,
        vehicleType: service.vehicleType,
        ally: service.ally
      }));
      
      // Add to existing cached services
      const updatedCachedServices = [...cachedServices, ...serviceInputs];
      setCachedServices(updatedCachedServices);
      
      // Update global cache
      setCache('mbt', updatedCachedServices, selectedDate);
      setCurrentServices(updatedCachedServices);
      
      // Reset form to initial state
      setServices([{
        id: '1',
        code: '',
        kindOf: 'TRANSFER',
        clientName: '',
        pickupTime: '',
        flightCode: '',
        pax: 1,
        luggage: 0,
        pickupLocation: '',
        dropoffLocation: '',
        notes: '',
        vehicleType: '',
        ally: 'MB Transfer',
        errors: {}
      }]);
      
      alert(`${serviceInputs.length} services added to cache successfully!`);
      setActiveTab('services'); // Switch to services view to show the added services
    }
  };


  // Update bottom bar actions based on active tab
  useEffect(() => {
    if (activeTab === 'form') {
      setActions([
        {
          key: "form-tab",
          label: "Form",
          Icon: HiClipboardList,
          variant: "primary",
          onClick: () => setActiveTab('form')
        },
        {
          key: "services-tab",
          label: "View Services",
          Icon: BsList,
          onClick: () => setActiveTab('services')
        },
        {
          key: "add",
          label: "Add Service",
          Icon: BsPlus,
          onClick: addNewService
        },
        {
          key: "submit",
          label: "Submit",
          Icon: BsCheckCircle,
          variant: "primary",
          onClick: submitServices
        }
      ]);
    } else {
      setActions([
        {
          key: "form-tab",
          label: "Form",
          Icon: HiClipboardList,
          onClick: () => setActiveTab('form')
        },
        {
          key: "services-tab",
          label: "View Services",
          Icon: BsList,
          variant: "primary",
          onClick: () => setActiveTab('services')
        },
        {
          key: "export",
          label: "Export",
          Icon: HiOutlineDownload,
          onClick: () => {
            if (cachedServices.length > 0) {
              exportServices(cachedServices, 'csv');
            } else {
              alert('No services to export');
            }
          }
        },
        {
          key: "save",
          label: "Save",
          Icon: HiOutlineSave,
          variant: "primary",
          onClick: () => {
            setCache('mbt', cachedServices, selectedDate);
            alert('Services saved successfully!');
          }
        }
      ]);
    }

    return () => {
      clearActions();
    };
  }, [activeTab, services, cachedServices]);

  const renderServiceForm = (service: FormService, index: number) => (
    <Card key={service.id} extra="w-full mb-6">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-purple-700 dark:text-purple-300">
            Service #{index + 1}
          </h4>
          {services.length > 1 && (
            <button
              onClick={() => removeService(service.id)}
              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
            >
              <BsTrash />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Service Code */}
          <div>
            <label className="block text-sm font-medium text-purple-700 dark:text-purple-300 mb-1">
              Service Code *
            </label>
            <input
              type="text"
              value={service.code}
              onChange={(e) => updateService(service.id, 'code', e.target.value)}
              placeholder="Enter service code"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-navy-700 dark:text-white ${
                service.errors.code ? 'border-red-500' : 'border-purple-300 dark:border-purple-600'
              }`}
            />
            {service.errors.code && (
              <p className="text-red-500 text-xs mt-1">{service.errors.code}</p>
            )}
          </div>

          {/* Service Type */}
          <div>
            <label className="block text-sm font-medium text-purple-700 dark:text-purple-300 mb-1">
              Service Type *
            </label>
            <select
              value={service.kindOf}
              onChange={(e) => updateService(service.id, 'kindOf', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-navy-700 dark:border-gray-600 dark:text-white"
            >
              <option value="ARRIVAL">Arrival</option>
              <option value="DEPARTURE">Departure</option>
              <option value="TRANSFER">Transfer</option>
            </select>
          </div>

          {/* Passenger Name */}
          <div>
            <label className="block text-sm font-medium text-purple-700 dark:text-purple-300 mb-1">
              Passenger Name *
            </label>
            <input
              type="text"
              value={service.clientName}
              onChange={(e) => updateService(service.id, 'clientName', e.target.value)}
              placeholder="Enter passenger name"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-navy-700 dark:text-white ${
                service.errors.clientName ? 'border-red-500' : 'border-purple-300 dark:border-purple-600'
              }`}
            />
            {service.errors.clientName && (
              <p className="text-red-500 text-xs mt-1">{service.errors.clientName}</p>
            )}
          </div>

          {/* Flight Code */}
          <div>
            <label className="block text-sm font-medium text-purple-700 dark:text-purple-300 mb-1">
              Flight Code {service.kindOf === 'ARRIVAL' && '*'}
            </label>
            <input
              type="text"
              value={service.flightCode || ''}
              onChange={(e) => updateService(service.id, 'flightCode', e.target.value)}
              placeholder="Enter flight code"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-navy-700 dark:text-white ${
                service.errors.flightCode ? 'border-red-500' : 'border-purple-300 dark:border-purple-600'
              }`}
            />
            {service.errors.flightCode && (
              <p className="text-red-500 text-xs mt-1">{service.errors.flightCode}</p>
            )}
          </div>

          {/* Pickup Time */}
          <div>
            <label className="block text-sm font-medium text-purple-700 dark:text-purple-300 mb-1">
              Pickup Time *
            </label>
            <div className="mb-2">
              <div className="text-sm text-purple-600 dark:text-purple-400">
                Date: {new Date(selectedDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
            <input
              type="time"
              value={service.pickupTime}
              onChange={(e) => updateService(service.id, 'pickupTime', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-navy-700 dark:text-white ${
                service.errors.pickupTime ? 'border-red-500' : 'border-purple-300 dark:border-purple-600'
              }`}
            />
            {service.errors.pickupTime && (
              <p className="text-red-500 text-xs mt-1">{service.errors.pickupTime}</p>
            )}
          </div>

          {/* PAX */}
          <div>
            <label className="block text-sm font-medium text-purple-700 dark:text-purple-300 mb-1">
              PAX *
            </label>
            <input
              type="number"
              min="1"
              value={service.pax}
              onChange={(e) => updateService(service.id, 'pax', parseInt(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-navy-700 dark:text-white ${
                service.errors.pax ? 'border-red-500' : 'border-purple-300 dark:border-purple-600'
              }`}
            />
            {service.errors.pax && (
              <p className="text-red-500 text-xs mt-1">{service.errors.pax}</p>
            )}
          </div>

          {/* Luggage */}
          <div>
            <label className="block text-sm font-medium text-purple-700 dark:text-purple-300 mb-1">
              Luggage
            </label>
            <input
              type="number"
              min="0"
              value={service.luggage || 0}
              onChange={(e) => updateService(service.id, 'luggage', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-navy-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          {/* Vehicle Type */}
          <div>
            <label className="block text-sm font-medium text-purple-700 dark:text-purple-300 mb-1">
              Vehicle Type
            </label>
            <select
              value={service.vehicleType || ''}
              onChange={(e) => updateService(service.id, 'vehicleType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-navy-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Select vehicle type</option>
              {mockVehicles.map(vehicle => (
                <option key={vehicle.id} value={vehicle.name}>
                  {vehicle.name} (Cap: {vehicle.capacity})
                </option>
              ))}
            </select>
          </div>

          {/* Pickup Location */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-purple-700 dark:text-purple-300 mb-1">
              Pickup Location *
            </label>
            <input
              type="text"
              value={service.pickupLocation}
              onChange={(e) => updateService(service.id, 'pickupLocation', e.target.value)}
              placeholder="Enter pickup location (hotel/airport)"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-navy-700 dark:text-white ${
                service.errors.pickupLocation ? 'border-red-500' : 'border-purple-300 dark:border-purple-600'
              }`}
            />
            {service.errors.pickupLocation && (
              <p className="text-red-500 text-xs mt-1">{service.errors.pickupLocation}</p>
            )}
          </div>

          {/* Destination */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-purple-700 dark:text-purple-300 mb-1">
              Destination *
            </label>
            <input
              type="text"
              value={service.dropoffLocation}
              onChange={(e) => updateService(service.id, 'dropoffLocation', e.target.value)}
              placeholder="Enter destination (hotel/airport)"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-navy-700 dark:text-white ${
                service.errors.dropoffLocation ? 'border-red-500' : 'border-purple-300 dark:border-purple-600'
              }`}
            />
            {service.errors.dropoffLocation && (
              <p className="text-red-500 text-xs mt-1">{service.errors.dropoffLocation}</p>
            )}
          </div>

          {/* Notes */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-purple-700 dark:text-purple-300 mb-1">
              Notes
            </label>
            <textarea
              value={service.notes || ''}
              onChange={(e) => updateService(service.id, 'notes', e.target.value)}
              placeholder="Enter any additional notes..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-navy-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>
      </div>
    </Card>
  );

  const renderServicesView = () => (
    <div className="w-full space-y-6">
      {cachedServices.length > 0 ? (
        <ServiceTable 
          services={cachedServices}
          title={`MBT Services for ${new Date(selectedDate).toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric' 
          })}`}
          subtitle={
            <span>
              MBTransfer services that have been manually entered for the selected date.
            </span>
          }
          company="MBT"
        />
      ) : (
        <Card extra="w-full">
          <div className="p-8 text-center">
            <PiAddressBookThin className="text-6xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-2">
              No Services Cached Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Use the form to manually enter MBTransfer services. Once submitted, they will appear here.
            </p>
            <button
              onClick={() => setActiveTab('form')}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2 mx-auto"
            >
              <HiClipboardList />
              Go to Form
            </button>
          </div>
        </Card>
      )}
    </div>
  );

  const renderTabButtons = () => (
    <div className="flex rounded-lg bg-gray-100 dark:bg-gray-700 p-1 mb-6">
      <button
        onClick={() => setActiveTab('form')}
        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
          activeTab === 'form'
            ? 'bg-white dark:bg-navy-800 text-blue-600 dark:text-blue-400 shadow-sm'
            : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
        }`}
      >
        <HiClipboardList />
        Service Form
      </button>
      <button
        onClick={() => setActiveTab('services')}
        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
          activeTab === 'services'
            ? 'bg-white dark:bg-navy-800 text-blue-600 dark:text-blue-400 shadow-sm'
            : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
        }`}
      >
        <BsList />
        View Services ({cachedServices.length})
      </button>
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
            MB Transfer Service Management
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {activeTab === 'form' ? 'Manually enter service details using the form' : 'View and manage cached MBTransfer services'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <PiAddressBookThin className="text-3xl text-purple-500" />
        </div>
      </div>

      {renderTabButtons()}

      {activeTab === 'form' ? (
        <>
          <div className="space-y-6">
            {services.map((service, index) => renderServiceForm(service, index))}
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={addNewService}
              className="px-4 py-2 border border-purple-500 text-purple-500 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 flex items-center gap-2"
            >
              <BsPlus />
              Add Another Service
            </button>

            <button
              onClick={submitServices}
              className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 flex items-center justify-center gap-2"
            >
              <BsCheckCircle />
              Submit {services.length} Service{services.length !== 1 ? 's' : ''} to Cache
            </button>
          </div>

          <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <h5 className="font-semibold text-purple-700 dark:text-purple-300 mb-2">Form Guidelines:</h5>
            <div className="text-sm text-purple-600 dark:text-purple-400 space-y-1">
              <p>• Service code should be unique and follow company format</p>
              <p>• Flight codes are required for arrival services</p>
              <p>• Use 24-hour format for pickup times (will be converted automatically)</p>
              <p>• Specify clear pickup and destination locations</p>
              <p>• Add notes for special requirements or instructions</p>
            </div>
          </div>
        </>
      ) : (
        renderServicesView()
      )}
    </div>
  );
};

export default MBTransferService;

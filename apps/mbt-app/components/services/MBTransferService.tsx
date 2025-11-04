"use client";

import { useState } from 'react';
import { useNavigation } from '../../contexts/NavigationContext';
import { ServiceInput } from '../../types/services';
import { mockDrivers, mockVehicles } from '../../utils/services';

import Card from '../single/card';
import { BsArrowLeft, BsPlus, BsTrash, BsCheckCircle } from 'react-icons/bs';
import { PiAddressBookThin } from 'react-icons/pi';

interface FormService extends ServiceInput {
  id: string;
  errors: { [key: string]: string };
}

const MBTransferService = () => {
  const { popView } = useNavigation();
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
      errors: {}
    }
  ]);

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
      console.log('Services submitted for approval:', validServices);
      alert(`${validServices.length} services submitted for approval`);
      popView();
    }
  };

  const renderServiceForm = (service: FormService, index: number) => (
    <Card key={service.id} extra="w-full mb-6">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-navy-700 dark:text-white">
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Service Code *
            </label>
            <input
              type="text"
              value={service.code}
              onChange={(e) => updateService(service.id, 'code', e.target.value)}
              placeholder="Enter service code"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-navy-700 dark:text-white ${
                service.errors.code ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {service.errors.code && (
              <p className="text-red-500 text-xs mt-1">{service.errors.code}</p>
            )}
          </div>

          {/* Service Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Service Type *
            </label>
            <select
              value={service.kindOf}
              onChange={(e) => updateService(service.id, 'kindOf', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-navy-700 dark:border-gray-600 dark:text-white"
            >
              <option value="ARRIVAL">Arrival</option>
              <option value="DEPARTURE">Departure</option>
              <option value="TRANSFER">Transfer</option>
            </select>
          </div>

          {/* Passenger Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Passenger Name *
            </label>
            <input
              type="text"
              value={service.clientName}
              onChange={(e) => updateService(service.id, 'clientName', e.target.value)}
              placeholder="Enter passenger name"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-navy-700 dark:text-white ${
                service.errors.clientName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {service.errors.clientName && (
              <p className="text-red-500 text-xs mt-1">{service.errors.clientName}</p>
            )}
          </div>

          {/* Flight Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Flight Code {service.kindOf === 'ARRIVAL' && '*'}
            </label>
            <input
              type="text"
              value={service.flightCode || ''}
              onChange={(e) => updateService(service.id, 'flightCode', e.target.value)}
              placeholder="Enter flight code"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-navy-700 dark:text-white ${
                service.errors.flightCode ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {service.errors.flightCode && (
              <p className="text-red-500 text-xs mt-1">{service.errors.flightCode}</p>
            )}
          </div>

          {/* Pickup Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Pickup Time *
            </label>
            <input
              type="datetime-local"
              value={service.pickupTime}
              onChange={(e) => updateService(service.id, 'pickupTime', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-navy-700 dark:text-white ${
                service.errors.pickupTime ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {service.errors.pickupTime && (
              <p className="text-red-500 text-xs mt-1">{service.errors.pickupTime}</p>
            )}
          </div>

          {/* PAX */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              PAX *
            </label>
            <input
              type="number"
              min="1"
              value={service.pax}
              onChange={(e) => updateService(service.id, 'pax', parseInt(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-navy-700 dark:text-white ${
                service.errors.pax ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {service.errors.pax && (
              <p className="text-red-500 text-xs mt-1">{service.errors.pax}</p>
            )}
          </div>

          {/* Luggage */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Luggage
            </label>
            <input
              type="number"
              min="0"
              value={service.luggage || 0}
              onChange={(e) => updateService(service.id, 'luggage', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-navy-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          {/* Vehicle Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Vehicle Type
            </label>
            <select
              value={service.vehicleType || ''}
              onChange={(e) => updateService(service.id, 'vehicleType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-navy-700 dark:border-gray-600 dark:text-white"
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Pickup Location *
            </label>
            <input
              type="text"
              value={service.pickupLocation}
              onChange={(e) => updateService(service.id, 'pickupLocation', e.target.value)}
              placeholder="Enter pickup location (hotel/airport)"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-navy-700 dark:text-white ${
                service.errors.pickupLocation ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {service.errors.pickupLocation && (
              <p className="text-red-500 text-xs mt-1">{service.errors.pickupLocation}</p>
            )}
          </div>

          {/* Destination */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Destination *
            </label>
            <input
              type="text"
              value={service.dropoffLocation}
              onChange={(e) => updateService(service.id, 'dropoffLocation', e.target.value)}
              placeholder="Enter destination (hotel/airport)"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-navy-700 dark:text-white ${
                service.errors.dropoffLocation ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {service.errors.dropoffLocation && (
              <p className="text-red-500 text-xs mt-1">{service.errors.dropoffLocation}</p>
            )}
          </div>

          {/* Notes */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes
            </label>
            <textarea
              value={service.notes || ''}
              onChange={(e) => updateService(service.id, 'notes', e.target.value)}
              placeholder="Enter any additional notes..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-navy-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>
      </div>
    </Card>
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
            MB Transfer Service Entry
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manually enter service details using the form
          </p>
        </div>
        <div className="flex items-center gap-3">
          <PiAddressBookThin className="text-3xl text-blue-500" />
        </div>
      </div>

      <div className="space-y-6">
        {services.map((service, index) => renderServiceForm(service, index))}
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={addNewService}
          className="px-4 py-2 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center gap-2"
        >
          <BsPlus />
          Add Another Service
        </button>

        <button
          onClick={submitServices}
          className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2"
        >
          <BsCheckCircle />
          Submit {services.length} Service{services.length !== 1 ? 's' : ''} for Approval
        </button>
      </div>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h5 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">Form Guidelines:</h5>
        <div className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
          <p>• Service code should be unique and follow company format</p>
          <p>• Flight codes are required for arrival services</p>
          <p>• Use 24-hour format for pickup times (will be converted automatically)</p>
          <p>• Specify clear pickup and destination locations</p>
          <p>• Add notes for special requirements or instructions</p>
        </div>
      </div>
    </div>
  );
};

export default MBTransferService;
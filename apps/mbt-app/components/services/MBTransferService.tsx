"use client";

import { useState, useEffect, useMemo } from 'react';
import { useNavigation } from '../../contexts/NavigationContext';
import { useServiceData } from '../../contexts/ServiceDataContext';
import { useBottomBar } from '../../contexts/BottomBarContext';
import { ServiceInput } from '../../types/services';
import { apiClient } from '../../utils/api';
import ServiceTable from '../shared/ServiceTable';

import Card from "../single/card";
import { toast } from 'sonner';

import { BsArrowLeft, BsCheckCircle, BsPlus, BsTrash, BsList } from 'react-icons/bs';
import { PiAddressBookThin } from 'react-icons/pi';
import { HiOutlineDownload, HiOutlineSave, HiClipboardList, HiChevronLeft } from 'react-icons/hi';


interface FormService extends ServiceInput {
  id: string;
  errors: { [key: string]: string };
}

interface VehicleOption {
  id: string;
  name: string;
  paxCapacity?: number;
}

const MBTransferService = () => {
  const { popView } = useNavigation();
  const {
    createManyServices,
    exportServices,
    selectedDate,
    getServicesByAlly
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
  const [vehicleOptions, setVehicleOptions] = useState<VehicleOption[]>([]);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await apiClient.get<VehicleOption[]>('/api/v1/vehicules?limit=100');
        if (response.success && response.data) {
          setVehicleOptions(response.data);
        }
      } catch (err) {
        console.error('Error al cargar vehículos:', err);
      }
    };

    fetchVehicles();
  }, []);
  
  const persistedServices = useMemo(() => {
    const mbtServices = getServicesByAlly('MB Transfer');
    return mbtServices.map((service) => {
      const notesText = Array.isArray(service.notes)
        ? service.notes
            .map((note) => [note.title, note.content, note.caption].filter(Boolean).join(' - ').trim())
            .filter(Boolean)
            .join(' | ')
        : '';

      return {
        id: service.id,
        code: service.code,
        kindOf: service.kindOf,
        clientName: service.clientName,
        pickupTime: service.pickupTime,
        flightCode: service.flightCode,
        pax: service.pax,
        luggage: service.luggage,
        pickupLocation: service.pickup?.name || (service as any).pickupLocationName || '',
        dropoffLocation: service.dropoff?.name || (service as any).dropoffLocationName || '',
        notes: notesText,
        vehicleType: (service as any).vehicleTypeName || service.vehicle?.name || (service as any).vehicleType || '',
        ally: service.ally?.name || 'MB Transfer',
      } as ServiceInput;
    });
  }, [getServicesByAlly, selectedDate]);

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
      errors.clientName = 'El nombre del pasajero es obligatorio';
    }

    if (!service.code?.trim()) {
      errors.code = 'El código del servicio es obligatorio';
    }

    if (!service.pickupTime) {
      errors.pickupTime = 'La hora de recogida es obligatoria';
    }

    if (!service.pickupLocation.trim()) {
      errors.pickupLocation = 'El origen es obligatorio';
    }

    if (!service.dropoffLocation.trim()) {
      errors.dropoffLocation = 'El destino es obligatorio';
    }

    if (service.pax <= 0) {
      errors.pax = 'El PAX debe ser mayor que 0';
    }

    if (service.kindOf === 'ARRIVAL' && !service.flightCode?.trim()) {
      errors.flightCode = 'El código de vuelo es obligatorio para llegadas';
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

  const submitServices = async () => {
    if (validateAllServices()) {
      const validServices = services.filter(s => Object.keys(s.errors).length === 0);

      // Convert FormService to API format
      const toOptionalString = (value?: string) => {
        const trimmed = (value || '').trim();
        return trimmed.length ? trimmed : undefined;
      };

      const servicesToCreate = validServices.map(service => ({
        code: service.code,
        kindOf: service.kindOf,
        clientName: service.clientName,
        pickupTime: `${selectedDate}T${service.pickupTime}:00.000Z`,
        flightCode: toOptionalString(service.flightCode),
        pax: service.pax,
        luggage: typeof service.luggage === 'number' ? service.luggage : 0,
        pickupLocation: service.pickupLocation,
        dropoffLocation: service.dropoffLocation,
        notes: toOptionalString(service.notes),
        vehicleType: toOptionalString(service.vehicleType),
        ally: 'MB Transfer'
      }));

      // Call API to create services
      const result = await createManyServices(servicesToCreate);

      if (result.created > 0) {
        toast.success(`${result.created} servicio(s) guardado(s) correctamente`);

        // Reset form
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

        setActiveTab('services');
      }

      if (result.errors.length > 0) {
        toast.error(`No se pudieron crear ${result.errors.length} servicio(s)`, {
          description: result.errors[0]
        });
        console.error('Service creation errors:', result.errors);
      }
    } else {
      toast.error('Corrige los errores de validación antes de guardar');
    }
  };
  
  useEffect(() => {
    if (activeTab === 'form') {
      setActions([
	{
		key: "back",
		label: "Atrás",
		Icon: HiChevronLeft,
		variant: "secondary",
		onClick: () => popView() // Go back to main itinerary
	},
        {
          key: "form-tab",
          label: "Formulario",
          Icon: HiClipboardList,
          variant: "primary",
          onClick: () => setActiveTab('form')
        },
        {
          key: "services-tab",
          label: "Ver Servicios",
          Icon: BsList,
          onClick: () => setActiveTab('services')
        },
        {
          key: "add",
          label: "Añadir Servicio",
          Icon: BsPlus,
          onClick: addNewService
        },
        {
          key: "submit",
          label: "Guardar",
          Icon: BsCheckCircle,
          variant: "primary",
          onClick: submitServices
        }
      ]);
    } else {
      setActions([
	{
		key: "back",
		label: "Atrás",
		Icon: HiChevronLeft,
		variant: "secondary",
		onClick: () => popView() // Go back to main itinerary
	},
        {
          key: "form-tab",
          label: "Formulario",
          Icon: HiClipboardList,
          onClick: () => setActiveTab('form')
        },
        {
          key: "services-tab",
          label: "Ver Servicios",
          Icon: BsList,
          variant: "primary",
          onClick: () => setActiveTab('services')
        },
        {
          key: "export",
          label: "Exportar",
          Icon: HiOutlineDownload,
          onClick: () => {
            if (persistedServices.length > 0) {
              exportServices(persistedServices, 'csv');
            } else {
              toast.warning('No hay servicios para exportar');
            }
          }
        },
        {
          key: "save",
          label: "Finalizar",
          Icon: HiOutlineSave,
          variant: "primary",
          onClick: () => {
            if (persistedServices.length > 0) {
              toast.success('Servicios finalizados');
              popView();
            } else {
              toast.warning('No hay servicios para guardar');
            }
          }
        }
      ]);
    }

    return () => {
      clearActions();
    };
  }, [
    activeTab,
    persistedServices,
    clearActions,
    selectedDate,
    setActions,
    popView,
    exportServices,
    services
  ]);

  const renderServiceForm = (service: FormService, index: number) => (
    <Card key={service.id} extra="w-full mb-6">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-accent-700 dark:text-accent-300">
            Servicio #{index + 1}
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
          {/* Codigo de servicio */}
          <div>
            <label className="block text-sm font-medium text-accent-700 dark:text-accent-300 mb-1">
              Codigo de Servicio *
            </label>
            <input
              type="text"
              value={service.code}
              onChange={(e) => updateService(service.id, 'code', e.target.value)}
              placeholder="Ingresa el codigo del servicio"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-accent-500 focus:border-accent-500 dark:bg-navy-700 dark:text-white ${
                service.errors.code ? 'border-red-500' : 'border-accent-300 dark:border-accent-600'
              }`}
            />
            {service.errors.code && (
              <p className="text-red-500 text-xs mt-1">{service.errors.code}</p>
            )}
          </div>

          {/* Tipo de servicio */}
          <div>
            <label className="block text-sm font-medium text-accent-700 dark:text-accent-300 mb-1">
              Tipo de Servicio *
            </label>
            <select
              value={service.kindOf}
              onChange={(e) => updateService(service.id, 'kindOf', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-accent-500 focus:border-accent-500 dark:bg-navy-700 dark:border-gray-600 dark:text-white"
            >
              <option value="ARRIVAL">Llegada</option>
              <option value="DEPARTURE">Salida</option>
              <option value="TRANSFER">Transferencia</option>
            </select>
          </div>

          {/* Nombre del pasajero */}
          <div>
            <label className="block text-sm font-medium text-accent-700 dark:text-accent-300 mb-1">
              Nombre del Pasajero *
            </label>
            <input
              type="text"
              value={service.clientName}
              onChange={(e) => updateService(service.id, 'clientName', e.target.value)}
              placeholder="Ingresa el nombre del pasajero"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-accent-500 focus:border-accent-500 dark:bg-navy-700 dark:text-white ${
                service.errors.clientName ? 'border-red-500' : 'border-accent-300 dark:border-accent-600'
              }`}
            />
            {service.errors.clientName && (
              <p className="text-red-500 text-xs mt-1">{service.errors.clientName}</p>
            )}
          </div>

          {/* Codigo de vuelo */}
          <div>
            <label className="block text-sm font-medium text-accent-700 dark:text-accent-300 mb-1">
              Codigo de Vuelo {service.kindOf === 'ARRIVAL' && '*'}
            </label>
            <input
              type="text"
              value={service.flightCode || ''}
              onChange={(e) => updateService(service.id, 'flightCode', e.target.value)}
              placeholder="Ingresa el codigo de vuelo"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-accent-500 focus:border-accent-500 dark:bg-navy-700 dark:text-white ${
                service.errors.flightCode ? 'border-red-500' : 'border-accent-300 dark:border-accent-600'
              }`}
            />
            {service.errors.flightCode && (
              <p className="text-red-500 text-xs mt-1">{service.errors.flightCode}</p>
            )}
          </div>

          {/* Hora de recogida */}
          <div>
            <label className="block text-sm font-medium text-accent-700 dark:text-accent-300 mb-1">
              Hora de Recogida *
            </label>
            <div className="mb-2">
              <div className="text-sm text-accent-600 dark:text-accent-400">
                Fecha: {new Date(selectedDate).toLocaleDateString('es-ES', {
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' ,
                  timeZone: 'UTC'
                })}
              </div>
            </div>
            <input
              type="time"
              value={service.pickupTime}
              onChange={(e) => updateService(service.id, 'pickupTime', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-accent-500 focus:border-accent-500 dark:bg-navy-700 dark:text-white ${
                service.errors.pickupTime ? 'border-red-500' : 'border-accent-300 dark:border-accent-600'
              }`}
            />
            {service.errors.pickupTime && (
              <p className="text-red-500 text-xs mt-1">{service.errors.pickupTime}</p>
            )}
          </div>

          {/* PAX */}
          <div>
            <label className="block text-sm font-medium text-accent-700 dark:text-accent-300 mb-1">
              PAX *
            </label>
            <input
              type="number"
              min="1"
              value={service.pax}
              onChange={(e) => updateService(service.id, 'pax', parseInt(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-accent-500 focus:border-accent-500 dark:bg-navy-700 dark:text-white ${
                service.errors.pax ? 'border-red-500' : 'border-accent-300 dark:border-accent-600'
              }`}
            />
            {service.errors.pax && (
              <p className="text-red-500 text-xs mt-1">{service.errors.pax}</p>
            )}
          </div>

          {/* Equipaje */}
          <div>
            <label className="block text-sm font-medium text-accent-700 dark:text-accent-300 mb-1">
              Equipaje
            </label>
            <input
              type="number"
              min="0"
              value={service.luggage || 0}
              onChange={(e) => updateService(service.id, 'luggage', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-accent-500 focus:border-accent-500 dark:bg-navy-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          {/* Tipo de vehiculo */}
          <div>
            <label className="block text-sm font-medium text-accent-700 dark:text-accent-300 mb-1">
              Tipo de Vehiculo
            </label>
            <select
              value={service.vehicleType || ''}
              onChange={(e) => updateService(service.id, 'vehicleType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-accent-500 focus:border-accent-500 dark:bg-navy-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Selecciona un vehiculo</option>
              {vehicleOptions.map(vehicle => (
                <option key={vehicle.id} value={vehicle.name}>
                  {vehicle.name}{typeof vehicle.paxCapacity === 'number' ? ` (Cap: ${vehicle.paxCapacity})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Origen */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-accent-700 dark:text-accent-300 mb-1">
              Origen *
            </label>
            <input
              type="text"
              value={service.pickupLocation}
              onChange={(e) => updateService(service.id, 'pickupLocation', e.target.value)}
              placeholder="Ingresa el origen (hotel/aeropuerto)"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-accent-500 focus:border-accent-500 dark:bg-navy-700 dark:text-white ${
                service.errors.pickupLocation ? 'border-red-500' : 'border-accent-300 dark:border-accent-600'
              }`}
            />
            {service.errors.pickupLocation && (
              <p className="text-red-500 text-xs mt-1">{service.errors.pickupLocation}</p>
            )}
          </div>

          {/* Destino */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-accent-700 dark:text-accent-300 mb-1">
              Destino *
            </label>
            <input
              type="text"
              value={service.dropoffLocation}
              onChange={(e) => updateService(service.id, 'dropoffLocation', e.target.value)}
              placeholder="Ingresa el destino (hotel/aeropuerto)"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-accent-500 focus:border-accent-500 dark:bg-navy-700 dark:text-white ${
                service.errors.dropoffLocation ? 'border-red-500' : 'border-accent-300 dark:border-accent-600'
              }`}
            />
            {service.errors.dropoffLocation && (
              <p className="text-red-500 text-xs mt-1">{service.errors.dropoffLocation}</p>
            )}
          </div>

          {/* Notas */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-accent-700 dark:text-accent-300 mb-1">
              Notas
            </label>
            <textarea
              value={service.notes || ''}
              onChange={(e) => updateService(service.id, 'notes', e.target.value)}
              placeholder="Ingresa notas adicionales..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-accent-500 focus:border-accent-500 dark:bg-navy-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>
      </div>
    </Card>
  );

  const renderServicesView = () => (
      <div className="w-full space-y-6">
      {persistedServices.length > 0 ? (
        <ServiceTable 
          services={persistedServices}
          title={`Servicios MBT para ${new Date(selectedDate).toLocaleDateString('es-ES', {
            month: 'long', 
            day: 'numeric', 
            year: 'numeric' 
          })}`}
          subtitle={
            <span>
              Servicios MBTransfer ingresados manualmente para la fecha seleccionada.
            </span>
          }
          company="MBT"
        />
      ) : (
        <Card extra="w-full">
          <div className="p-8 text-center">
            <PiAddressBookThin className="text-6xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-2">
              Aun no hay servicios
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Usa el formulario para ingresar servicios de MBTransfer. Al guardarlos, apareceran aqui desde la base de datos.
            </p>
            <button
              onClick={() => setActiveTab('form')}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2 mx-auto"
            >
              <HiClipboardList />
              Ir al Formulario
            </button>
          </div>
        </Card>
      )}
    </div>
  );

  return (
    <div className="w-full">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={popView}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          <BsArrowLeft className="text-xl text-brand dark:text-white" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-navy-700 dark:text-white">
		Manejo de los Servicios de MBT
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {activeTab === 'form' ? 'Completa manualmente el formulario para anadir servicios' : 'Ver y manejar los servicios guardados de MBT'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <PiAddressBookThin className="text-3xl text-purple-500" />
        </div>
      </div>

      {activeTab === 'form' ? (
        <>
          <div className="space-y-6">
            {services.map((service, index) => renderServiceForm(service, index))}
          </div>

          <div className="mt-6 p-4 bg-purple-50 dark:bg-accent-900/20 rounded-lg">
            <h5 className="font-semibold text-accent-700 dark:text-accent-300 mb-2">Form Guidelines:</h5>
            <div className="text-sm text-purple-600 dark:text-accent-400 space-y-1">
              <p>• El codigo del servicio debe ser unico y seguir el formato de la empresa</p>
              <p>• El codigo de vuelo es obligatorio para servicios de llegada</p>
              <p>• Usa formato de 24 horas para la hora de recogida</p>
              <p>• Especifica claramente origen y destino</p>
              <p>• Agrega notas para requisitos o instrucciones especiales</p>
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

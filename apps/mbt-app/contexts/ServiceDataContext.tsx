"use client";

import { createContext, useCallback, useContext, useState, useEffect, ReactNode } from 'react';
import { Service } from '../types/services';
import { apiClient } from '../utils/api';
import { getTodayLocal } from '../utils/dateUtils';

interface ServiceDataContextType {
  // Current services for selected date
  services: Service[];
  isLoading: boolean;
  error: string | null;

  // Date management
  selectedDate: string;
  setSelectedDate: (date: string) => void;

  // CRUD operations
  createService: (data: any) => Promise<{ success: boolean; data?: Service; error?: string }>;
  createManyServices: (services: any[]) => Promise<{ success: boolean; created: number; errors: string[] }>;
  updateService: (id: string, data: any) => Promise<{ success: boolean; data?: Service; error?: string }>;
  deleteService: (id: string) => Promise<{ success: boolean; error?: string }>;

  // Refetch services
  refetchServices: () => Promise<void>;

  // Filter services by ally
  getServicesByAlly: (allyName: string) => Service[];

  // Export functionality (kept for compatibility)
  exportServices: (services: any[], format: 'json' | 'csv') => void;
}

const ServiceDataContext = createContext<ServiceDataContextType | undefined>(undefined);

interface ServiceDataProviderProps {
  children: ReactNode;
}

export const ServiceDataProvider = ({ children }: ServiceDataProviderProps) => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDateState] = useState<string>(() => {
    return getTodayLocal();
  });

  // Fetch services when date changes
  const fetchServices = useCallback(async (date: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.getServices({ date });

      if (response.success && response.data) {
        setServices(response.data);
      } else {
        setServices([]);
      }
    } catch (err: any) {
      console.error('Error fetching services:', err);
      setError(err.message || 'Failed to fetch services');
      setServices([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch services when selectedDate changes
  useEffect(() => {
    fetchServices(selectedDate);
  }, [selectedDate, fetchServices]);

  const setSelectedDate = useCallback((date: string) => {
    setSelectedDateState(date);
  }, []);

  const refetchServices = useCallback(async () => {
    await fetchServices(selectedDate);
  }, [selectedDate, fetchServices]);

  const createService = useCallback(async (data: any): Promise<{ success: boolean; data?: Service; error?: string }> => {
    try {
      const response = await apiClient.createService(data);

      if (response.success && response.data) {
        // Refetch services to get updated list
        await refetchServices();
        return { success: true, data: response.data };
      }

      return { success: false, error: response.message || 'Failed to create service' };
    } catch (err: any) {
      console.error('Error creating service:', err);

      // Handle specific warning cases (missing places/vehicles)
      if (err.message && (err.message.includes('does not exist') || err.message.includes('Please add it'))) {
        return { success: false, error: err.message };
      }

      return { success: false, error: err.message || 'Failed to create service' };
    }
  }, [refetchServices]);

  const createManyServices = useCallback(async (servicesToCreate: any[]): Promise<{ success: boolean; created: number; errors: string[] }> => {
    const errors: string[] = [];
    let created = 0;

    for (const service of servicesToCreate) {
      try {
        const response = await apiClient.createService(service);

        if (response.success) {
          created++;
        } else {
          errors.push(`${service.clientName || 'Unknown'}: ${response.message || 'Failed'}`);
        }
      } catch (err: any) {
        errors.push(`${service.clientName || 'Unknown'}: ${err.message || 'Failed'}`);
      }
    }

    // Refetch services after bulk creation
    await refetchServices();

    return {
      success: created > 0,
      created,
      errors
    };
  }, [refetchServices]);

  const updateService = useCallback(async (id: string, data: any): Promise<{ success: boolean; data?: Service; error?: string }> => {
    try {
      const response = await apiClient.updateService(id, data);

      if (response.success && response.data) {
        // Refetch services to get updated list
        await refetchServices();
        return { success: true, data: response.data };
      }

      return { success: false, error: response.message || 'Failed to update service' };
    } catch (err: any) {
      console.error('Error updating service:', err);
      return { success: false, error: err.message || 'Failed to update service' };
    }
  }, [refetchServices]);

  const deleteService = useCallback(async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await apiClient.deleteService(id);

      if (response.success) {
        // Refetch services to get updated list
        await refetchServices();
        return { success: true };
      }

      return { success: false, error: response.message || 'Failed to delete service' };
    } catch (err: any) {
      console.error('Error deleting service:', err);
      return { success: false, error: err.message || 'Failed to delete service' };
    }
  }, [refetchServices]);

  const normalize = (value: string) =>
    value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '');

  const getBucketFromAlly = (allyName?: string, code?: string): 'airport' | 'sacbe' | 'mbt' => {
    const normalizedAlly = normalize(allyName || '');
    const normalizedCode = (code || '').trim().toUpperCase();

    if (normalizedAlly.includes('airporttransfer') || normalizedAlly.includes('airport')) return 'airport';
    if (normalizedAlly.includes('sacbe')) return 'sacbe';
    if (normalizedAlly.includes('mbtransfer') || normalizedAlly === 'mbt') return 'mbt';

    if (normalizedCode.startsWith('AT')) return 'airport';
    if (normalizedCode.startsWith('ST')) return 'sacbe';
    if (normalizedCode.startsWith('MBT')) return 'mbt';

    return 'mbt';
  };

  const getServicesByAlly = useCallback((allyName: string): Service[] => {
    if (allyName === 'All') {
      return services;
    }

    const targetBucket = getBucketFromAlly(allyName);
    return services.filter((service) => {
      const serviceBucket = getBucketFromAlly(service.ally?.name, service.code);
      return serviceBucket === targetBucket;
    });
  }, [services]);

  const exportServices = useCallback((servicesToExport: Service[], format: 'json' | 'csv') => {
    console.log('🔍 DEBUG: exportServices called');
    console.log('🔍 Services to export:', servicesToExport.length);
    console.log('🔍 First service:', servicesToExport[0]);
    console.log('🔍 Format:', format);

    if (servicesToExport.length === 0) {
      alert('No services to export');
      return;
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    if (format === 'json') {
      const dataStr = JSON.stringify(servicesToExport, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

      const exportFileDefaultName = `services_export_${timestamp}.json`;
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } else if (format === 'csv') {
      // Convert to CSV
      const headers = ['Code', 'Client Name', 'Service Type', 'Pickup Time', 'Flight Code', 'PAX', 'Pickup Location', 'Dropoff Location', 'Ally', 'Driver', 'Vehicle', 'State'];

      const csvContent = [
        headers.join(','),
        ...servicesToExport.map((service, index) => {
          // Handle both flat fields (from mapped services) and nested fields (from DB)
          const pickupLoc = service.pickupLocation || service.pickup?.name || service.pickupLocationName || '';
          const dropoffLoc = service.dropoffLocation || service.dropoff?.name || service.dropoffLocationName || '';
          const vehicleName = service.vehicleType || service.vehicle?.name || service.vehicleTypeName || '';
          const allyName = service.ally || service.ally?.name || '';

          if (index === 0) {
            console.log('🔍 First CSV row data:');
            console.log('  pickupLoc:', pickupLoc);
            console.log('  dropoffLoc:', dropoffLoc);
            console.log('  vehicleName:', vehicleName);
          }

          return [
            `"${service.code || ''}"`,
            `"${service.clientName || ''}"`,
            `"${service.kindOf || ''}"`,
            `"${service.pickupTime || ''}"`,
            `"${service.flightCode || ''}"`,
            service.pax || 0,
            `"${pickupLoc}"`,
            `"${dropoffLoc}"`,
            `"${allyName}"`,
            `"${service.driver?.name || ''}"`,
            `"${vehicleName}"`,
            `"${service.state || service.status || ''}"`,
          ].join(',');
        })
      ].join('\n');

      console.log('🔍 CSV content preview:', csvContent.substring(0, 300));

      const dataUri = 'data:text/csv;charset=utf-8,'+ encodeURIComponent(csvContent);
      const exportFileDefaultName = `services_export_${timestamp}.csv`;

      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    }
  }, []);

  const contextValue: ServiceDataContextType = {
    services,
    isLoading,
    error,
    selectedDate,
    setSelectedDate,
    createService,
    createManyServices,
    updateService,
    deleteService,
    refetchServices,
    getServicesByAlly,
    exportServices,
  };

  return (
    <ServiceDataContext.Provider value={contextValue}>
      {children}
    </ServiceDataContext.Provider>
  );
};

export const useServiceData = () => {
  const context = useContext(ServiceDataContext);
  if (context === undefined) {
    throw new Error('useServiceData must be used within a ServiceDataProvider');
  }
  return context;
};

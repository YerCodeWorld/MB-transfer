"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ServiceInput } from '../types/services';
import { toYMDLocal, getTodayLocal } from '../utils/dateUtils';

export interface ServiceCache {
  data: ServiceInput[];
  timestamp: number;
  date: string;
  serviceType: 'at' | 'mbt' | 'st';
}

interface ServiceDataContextType {
  // Current active services
  currentServices: ServiceInput[];
  setCurrentServices: (services: ServiceInput[]) => void;
  
  // Date management
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  getServicesByDate: (date: string, serviceType?: 'at' | 'mbt' | 'st') => ServiceInput[];
  
  // Cache management
  getCache: (serviceType: 'at' | 'mbt' | 'st', date?: string) => ServiceCache | null;
  setCache: (serviceType: 'at' | 'mbt' | 'st', data: ServiceInput[], date?: string) => void;
  clearCache: (serviceType?: 'at' | 'mbt' | 'st') => void;
  
  // Export functionality
  exportServices: (services: ServiceInput[], format: 'json' | 'csv') => void;
  
  // Global state utilities
  hasActiveData: () => boolean;
  getActiveServiceType: () => 'at' | 'mbt' | 'st' | null;
  setActiveServiceType: (type: 'at' | 'mbt' | 'st' | null) => void;
}

const ServiceDataContext = createContext<ServiceDataContextType | undefined>(undefined);

interface ServiceDataProviderProps {
  children: ReactNode;
}

export const ServiceDataProvider = ({ children }: ServiceDataProviderProps) => {
  const [currentServices, setCurrentServicesState] = useState<ServiceInput[]>([]);
  const [activeServiceType, setActiveServiceTypeState] = useState<'at' | 'mbt' | 'st' | null>(null);
  const [selectedDate, setSelectedDateState] = useState<string>(() => {
    return getTodayLocal();
  });

  // Load initial data from localStorage
  useEffect(() => {
    const savedServices = localStorage.getItem('mbt_current_services');
    const savedType = localStorage.getItem('mbt_active_service_type');
    const savedDate = localStorage.getItem('mbt_selected_date');
    
    if (savedServices) {
      try {
        setCurrentServicesState(JSON.parse(savedServices));
      } catch (error) {
        console.error('Error loading services from localStorage:', error);
      }
    }
    
    if (savedType) {
      setActiveServiceTypeState(savedType as 'at' | 'mbt' | 'st');
    }
    
    if (savedDate) {
      setSelectedDateState(savedDate);
    }
  }, []);

  const setCurrentServices = (services: ServiceInput[]) => {
    setCurrentServicesState(services);
    localStorage.setItem('mbt_current_services', JSON.stringify(services));
  };

  const setActiveServiceType = (type: 'at' | 'mbt' | 'st' | null) => {
    setActiveServiceTypeState(type);
    if (type) {
      localStorage.setItem('mbt_active_service_type', type);
    } else {
      localStorage.removeItem('mbt_active_service_type');
    }
  };

  const setSelectedDate = (date: string) => {
    setSelectedDateState(date);
    localStorage.setItem('mbt_selected_date', date);
  };

  const getServicesByDate = (date: string, serviceType?: 'at' | 'mbt' | 'st'): ServiceInput[] => {
    const serviceTypes = serviceType ? [serviceType] : ['at', 'st', 'mbt'] as const;
    const services: ServiceInput[] = [];
    
    serviceTypes.forEach(type => {
      const cache = getCache(type, date);
      if (cache && cache.data) {
        services.push(...cache.data);
      }
    });
    
    return services;
  };

  const getCache = (serviceType: 'at' | 'mbt' | 'st', date?: string): ServiceCache | null => {
    const key = date ? 
      `mbt_cache_${serviceType}_${date}` : 
      `mbt_cache_${serviceType}_latest`;
    
    const cached = localStorage.getItem(key);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (error) {
        console.error('Error parsing cached data:', error);
      }
    }
    return null;
  };

  const setCache = (serviceType: 'at' | 'mbt' | 'st', data: ServiceInput[], date?: string) => {
    const today = getTodayLocal();
    const cacheDate = date || today;
    
    // Deep clone the data to prevent reference issues
    const clonedData = JSON.parse(JSON.stringify(data));
    
    const cache: ServiceCache = {
      data: clonedData,
      timestamp: Date.now(),
      date: cacheDate,
      serviceType
    };

    // Save with date-specific key
    const dateKey = `mbt_cache_${serviceType}_${cacheDate}`;
    localStorage.setItem(dateKey, JSON.stringify(cache));
    
    // Also save as latest
    const latestKey = `mbt_cache_${serviceType}_latest`;
    localStorage.setItem(latestKey, JSON.stringify(cache));
  };

  const clearCache = (serviceType?: 'at' | 'mbt' | 'st') => {
    if (serviceType) {
      // Clear specific service type cache
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith(`mbt_cache_${serviceType}`)
      );
      keys.forEach(key => localStorage.removeItem(key));
    } else {
      // Clear all service cache
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith('mbt_cache_')
      );
      keys.forEach(key => localStorage.removeItem(key));
    }
  };

  const exportServices = (services: ServiceInput[], format: 'json' | 'csv') => {
    if (services.length === 0) {
      alert('No services to export');
      return;
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    if (format === 'json') {
      const dataStr = JSON.stringify(services, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `services_export_${timestamp}.json`;
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } else if (format === 'csv') {
      // Convert to CSV
      const headers = ['Code', 'Client Name', 'Service Type', 'Pickup Time', 'Flight Code', 'PAX', 'Pickup Location', 'Dropoff Location', 'Notes'];
      
      const csvContent = [
        headers.join(','),
        ...services.map(service => [
          `"${service.code || ''}"`,
          `"${service.clientName || ''}"`,
          `"${service.kindOf || ''}"`,
          `"${service.pickupTime || ''}"`,
          `"${service.flightCode || ''}"`,
          service.pax || 0,
          `"${service.pickupLocation || ''}"`,
          `"${service.dropoffLocation || ''}"`,
          `"${service.notes || ''}"`,
        ].join(','))
      ].join('\n');

      const dataUri = 'data:text/csv;charset=utf-8,'+ encodeURIComponent(csvContent);
      const exportFileDefaultName = `services_export_${timestamp}.csv`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    }
  };

  const hasActiveData = () => {
    return currentServices.length > 0;
  };

  const getActiveServiceType = () => {
    return activeServiceType;
  };

  const contextValue: ServiceDataContextType = {
    currentServices,
    setCurrentServices,
    selectedDate,
    setSelectedDate,
    getServicesByDate,
    getCache,
    setCache,
    clearCache,
    exportServices,
    hasActiveData,
    getActiveServiceType,
    setActiveServiceType,
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
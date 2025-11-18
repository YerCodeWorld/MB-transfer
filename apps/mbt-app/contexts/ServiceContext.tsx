"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Service } from '../types/services';
import { mockServices, detectEdgeCases } from '../utils/services';
import { getTodayLocal } from '../utils/dateUtils';

interface ServiceContextType {
  services: Service[];
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  getServicesByDate: (date: string) => Service[];
  getServicesByAlly: (allyName: string, date?: string) => Service[];
  getServiceStatistics: (date?: string) => {
    total: number;
    byAlly: { [key: string]: number };
    byType: { [key: string]: number };
    byStatus: { [key: string]: number };
    edgeCases: number;
  };
  addService: (service: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateService: (id: string, updates: Partial<Service>) => void;
  deleteService: (id: string) => void;
  refreshServices: () => void;
}

const ServiceContext = createContext<ServiceContextType | undefined>(undefined);

export function ServiceProvider({ children }: { children: ReactNode }) {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedDate, setSelectedDate] = useState(() => {
    return getTodayLocal();
  });

  useEffect(() => {
    // Initialize with mock services
    setServices(mockServices);
  }, []);

  const getServicesByDate = (date: string): Service[] => {
    const targetDate = new Date(date);
    return services.filter(service => {
      const serviceDate = new Date(service.pickupTime);
      return serviceDate.toDateString() === targetDate.toDateString();
    });
  };

  const getServicesByAlly = (allyName: string, date?: string): Service[] => {
    let filteredServices = services.filter(service => 
      service.ally?.name === allyName
    );

    if (date) {
      filteredServices = filteredServices.filter(service => {
        const serviceDate = new Date(service.pickupTime);
        const targetDate = new Date(date);
        return serviceDate.toDateString() === targetDate.toDateString();
      });
    }

    return filteredServices;
  };

  const getServiceStatistics = (date?: string) => {
    const targetServices = date ? getServicesByDate(date) : services;
    const edgeCases = detectEdgeCases(targetServices);
    
    const byAlly: { [key: string]: number } = {};
    const byType: { [key: string]: number } = {};
    const byStatus: { [key: string]: number } = {};

    targetServices.forEach(service => {
      // By ally
      const allyName = service.ally?.name || 'Unassigned';
      byAlly[allyName] = (byAlly[allyName] || 0) + 1;

      // By type
      byType[service.kindOf] = (byType[service.kindOf] || 0) + 1;

      // By status
      byStatus[service.state] = (byStatus[service.state] || 0) + 1;
    });

    return {
      total: targetServices.length,
      byAlly,
      byType,
      byStatus,
      edgeCases: edgeCases.length
    };
  };

  const addService = (serviceData: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newService: Service = {
      ...serviceData,
      id: `srv_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setServices(prev => [...prev, newService]);
  };

  const updateService = (id: string, updates: Partial<Service>) => {
    setServices(prev => prev.map(service => 
      service.id === id 
        ? { ...service, ...updates, updatedAt: new Date().toISOString() }
        : service
    ));
  };

  const deleteService = (id: string) => {
    setServices(prev => prev.filter(service => service.id !== id));
  };

  const refreshServices = () => {
    // In a real app, this would fetch from the API
    setServices(mockServices);
  };

  return (
    <ServiceContext.Provider value={{
      services,
      selectedDate,
      setSelectedDate,
      getServicesByDate,
      getServicesByAlly,
      getServiceStatistics,
      addService,
      updateService,
      deleteService,
      refreshServices
    }}>
      {children}
    </ServiceContext.Provider>
  );
}

export function useServices() {
  const context = useContext(ServiceContext);
  if (context === undefined) {
    throw new Error('useServices must be used within a ServiceProvider');
  }
  return context;
}
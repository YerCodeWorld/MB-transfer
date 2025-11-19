"use client";

import React, { useState, useEffect } from 'react';
import { useNavigation } from '../../contexts/NavigationContext';
import { useServiceData } from '../../contexts/ServiceDataContext';
import { useBottomBar } from '../../contexts/BottomBarContext';

import MiniCalendar from '../single/minicalendar';
import Notes from '../shared/Notes';
import Card from '../single/card';

import { BsArrowLeft, BsCalendarCheck, BsListCheck, BsFileText, BsBarChart } from 'react-icons/bs';
import { FaClock, FaMapMarkerAlt, FaUsers, FaPlane } from 'react-icons/fa';
import { convertIsoStringTo12h } from '../../utils/services';

// Extended service interface to include serviceType
interface ExtendedService {
  serviceType?: 'at' | 'st' | 'mbt';
  id: string;
  code?: string;
  kindOf: 'ARRIVAL' | 'DEPARTURE' | 'TRANSFER';
  clientName: string;
  pickupTime: string;
  flightCode?: string;
  pax: number;
  luggage?: number;
  pickupLocation: string;
  dropoffLocation: string;
  notes?: string;
  vehicleType?: string;
  ally?: string;
}

const DetailedCalendarView = () => {
  const { popView } = useNavigation();
  const { selectedDate, getServicesByDate } = useServiceData();
  const { setActions, clearActions } = useBottomBar();
  
  const [activeSection, setActiveSection] = useState<'calendar' | 'notes' | 'services'>('calendar');

  // Get services for selected date and add serviceType information
  const allServicesRaw = getServicesByDate(selectedDate);
  const atServices = getServicesByDate(selectedDate, 'at');
  const stServices = getServicesByDate(selectedDate, 'st');
  const mbtServices = getServicesByDate(selectedDate, 'mbt');

  // Combine all services with proper serviceType marking
  const allServices: ExtendedService[] = [
    ...atServices.map(service => ({ ...service, serviceType: 'at' as const })),
    ...stServices.map(service => ({ ...service, serviceType: 'st' as const })),
    ...mbtServices.map(service => ({ ...service, serviceType: 'mbt' as const }))
  ];

  const stats = {
    total: allServices.length,
    byServiceType: {
      'at': atServices.length,
      'st': stServices.length,
      'mbt': mbtServices.length
    }
  };

  // Set up bottom bar actions
  useEffect(() => {
    setActions([
      {
        key: "calendar-section",
        label: "Calendar",
        Icon: BsCalendarCheck,
        variant: activeSection === 'calendar' ? "primary" : "secondary",
        onClick: () => setActiveSection('calendar')
      },
      {
        key: "services-section", 
        label: "Services",
        Icon: BsListCheck,
        variant: activeSection === 'services' ? "primary" : "secondary", 
        onClick: () => setActiveSection('services')
      },
      {
        key: "notes-section",
        label: "Notes",
        Icon: BsFileText,
        variant: activeSection === 'notes' ? "primary" : "secondary",
        onClick: () => setActiveSection('notes')
      }
    ]);

    return () => {
      clearActions();
    };
  }, [activeSection, setActions, clearActions]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric', 
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC'
    });
  };

  const getServiceTypeColor = (serviceType: string) => {
    switch (serviceType) {
      case 'at':
        return 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300';
      case 'st':
        return 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300';
      case 'mbt':
        return 'bg-purple-50 border-purple-200 text-purple-800 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-300';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800 dark:bg-gray-900/20 dark:border-gray-800 dark:text-gray-300';
    }
  };

  const getServiceTypeName = (serviceType: string) => {
    switch (serviceType) {
      case 'at': return 'Airport Transfer';
      case 'st': return 'Sacbé Transfer'; 
      case 'mbt': return 'MB Transfer';
      default: return serviceType.toUpperCase();
    }
  };

  const renderCalendarSection = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar */}
      <div className="lg:col-span-2">
        <Card extra="h-full">
          <div className="p-6">
            <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-6">
              Calendar View
            </h3>
            <div className="flex justify-center">
              <MiniCalendar />
            </div>
          </div>
        </Card>
      </div>

      {/* Daily Summary */}
      <div className="space-y-6">
        {/* Date Info */}
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <BsCalendarCheck className="text-2xl text-accent-500" />
              <div>
                <h4 className="text-lg font-semibold text-navy-700 dark:text-white">
                  Selected Date
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {formatDate(selectedDate)}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Stats */}
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <BsBarChart className="text-2xl text-accent-500" />
              <h4 className="text-lg font-semibold text-navy-700 dark:text-white">
                Service Summary
              </h4>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="font-medium text-navy-700 dark:text-white">Total Services</span>
                <span className="text-2xl font-bold text-accent-600">{stats.total}</span>
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                <div className="flex justify-between items-center p-2 rounded border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20">
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Airport Transfer</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">{stats.byServiceType.at}</span>
                </div>
                
                <div className="flex justify-between items-center p-2 rounded border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20">
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">Sacbé Transfer</span>
                  <span className="font-bold text-green-600 dark:text-green-400">{stats.byServiceType.st}</span>
                </div>
                
                <div className="flex justify-between items-center p-2 rounded border-l-4 border-purple-500 bg-purple-50 dark:bg-purple-900/20">
                  <span className="text-sm font-medium text-purple-700 dark:text-purple-300">MB Transfer</span>
                  <span className="font-bold text-purple-600 dark:text-purple-400">{stats.byServiceType.mbt}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderServicesSection = () => (
    <div className="space-y-6">
      <Card>
        <div className="p-6">
          <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-6">
            Services for {formatDate(selectedDate)}
          </h3>
          
          {allServices.length === 0 ? (
            <div className="text-center py-12">
              <BsListCheck className="text-6xl text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-navy-700 dark:text-white mb-2">
                No Services Scheduled
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                No services are currently scheduled for this date.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {allServices.map((service, index) => (
                <div 
                  key={service.code || index}
                  className={`border rounded-lg p-4 ${getServiceTypeColor(service.serviceType || 'default')}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h5 className="font-semibold text-lg">{service.clientName}</h5>
                      <span className="text-sm font-medium">
                        {getServiceTypeName(service.serviceType || '')} - {service.code}
                      </span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      service.kindOf === 'ARRIVAL' ? 'bg-green-500 text-white' :
                      service.kindOf === 'DEPARTURE' ? 'bg-blue-500 text-white' :
                      'bg-yellow-500 text-black'
                    }`}>
                      {service.kindOf}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <FaClock className="text-accent-500" />
                      <span>
                        {service.serviceType === 'at' 
                          ? convertIsoStringTo12h(service.pickupTime)
                          : service.pickupTime
                        }
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <FaUsers className="text-accent-500" />
                      <span>{service.pax} PAX</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <FaMapMarkerAlt className="text-accent-500" />
                      <span className="truncate">{service.pickupLocation}</span>
                    </div>
                    
                    {service.flightCode && (
                      <div className="flex items-center gap-2">
                        <FaPlane className="text-accent-500" />
                        <span>{service.flightCode}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-current opacity-20">
                    <div className="flex items-center gap-2 text-sm">
                      <FaMapMarkerAlt className="text-accent-500 transform rotate-180" />
                      <span className="truncate">{service.dropoffLocation}</span>
                    </div>
                    
                    {service.notes && (
                      <div className="mt-2 text-sm">
                        <strong>Notes:</strong> {service.notes}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );

  const renderNotesSection = () => (
    <Card>
      <div className="p-6">
        <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-6">
          Notes for {formatDate(selectedDate)}
        </h3>
        <Notes selectedDate={selectedDate} />
      </div>
    </Card>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'calendar':
        return renderCalendarSection();
      case 'services':
        return renderServicesSection();
      case 'notes':
        return renderNotesSection();
      default:
        return renderCalendarSection();
    }
  };

  return (
    <div className="m-5">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={popView}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          <BsArrowLeft className="text-xl text-navy-700 dark:text-white" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-navy-700 dark:text-white">
            Detailed Calendar View
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            View calendar, services, and notes in detail for {formatDate(selectedDate)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <BsCalendarCheck className="text-3xl text-accent-500" />
        </div>
      </div>

      {/* Section Navigation (Desktop) */}
      <div className="hidden md:flex rounded-lg bg-gray-100 dark:bg-gray-700 p-1 mb-6">
        <button
          onClick={() => setActiveSection('calendar')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
            activeSection === 'calendar'
              ? 'bg-white dark:bg-navy-800 text-accent-600 dark:text-accent-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:text-accent-600 dark:hover:text-accent-400'
          }`}
        >
          <BsCalendarCheck />
          Calendar
        </button>
        <button
          onClick={() => setActiveSection('services')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
            activeSection === 'services'
              ? 'bg-white dark:bg-navy-800 text-accent-600 dark:text-accent-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:text-accent-600 dark:hover:text-accent-400'
          }`}
        >
          <BsListCheck />
          Services ({stats.total})
        </button>
        <button
          onClick={() => setActiveSection('notes')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
            activeSection === 'notes'
              ? 'bg-white dark:bg-navy-800 text-accent-600 dark:text-accent-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:text-accent-600 dark:hover:text-accent-400'
          }`}
        >
          <BsFileText />
          Notes
        </button>
      </div>

      {/* Content */}
      <div className="min-h-[60vh]">
        {renderContent()}
      </div>
    </div>
  );
};

export default DetailedCalendarView;
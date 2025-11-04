"use client";

import { useState, useEffect } from 'react';
import { useNavigation } from '../../contexts/NavigationContext';
import { fetchAtData, extractAtServices, fetchFlightTimes } from '../../utils/services';
import { ServiceInput, FlightInfo } from '../../types/services';

import Card from '../single/card';
import { BsArrowLeft, BsCheckCircle, BsExclamationTriangle, BsInfoCircle } from 'react-icons/bs';
import { PiAirplaneBold } from 'react-icons/pi';

interface ServicePreview extends ServiceInput {
  flightInfo?: FlightInfo;
  status: 'pending' | 'checking' | 'validated' | 'error';
}

const AirportTransferService = () => {
  const { popView } = useNavigation();
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<ServicePreview[]>([]);
  const [step, setStep] = useState<'fetch' | 'review' | 'confirm'>('fetch');
  const [selectedDate, setSelectedDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });

  const fetchServices = async () => {
    setLoading(true);
    try {
      // In a real implementation, we would call fetchAtData()
      // For now, we'll use mock data
      const mockAtData = [
        {
          reservation_no: "AT001",
          passenger: { name: "John", surname: "Smith" },
          travel: { 
            flight_number: "AA2641",
            flight_arrival: "10:30"
          },
          travelers: { adult: 2, children: 0, infant: 0 },
          pickup_location: { name: "Punta Cana Airport" },
          drop_of_location: { name: "Hard Rock Hotel" }
        },
        {
          reservation_no: "AT002", 
          passenger: { name: "Sarah", surname: "Johnson" },
          travel: { 
            flight_number: "BA2205",
            flight_arrival: "14:15"
          },
          travelers: { adult: 3, children: 1, infant: 0 },
          pickup_location: { name: "Punta Cana Airport" },
          drop_of_location: { name: "Dreams Resort" }
        }
      ];

      const extractedServices = extractAtServices(mockAtData, selectedDate);
      const servicesWithStatus: ServicePreview[] = extractedServices.map(service => ({
        ...service,
        status: 'pending' as const
      }));

      setServices(servicesWithStatus);
      setStep('review');
    } catch (error) {
      console.error('Error fetching AT services:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateFlights = async () => {
    const flightCodes = services
      .filter(s => s.flightCode)
      .map(s => s.flightCode!);

    if (flightCodes.length === 0) return;

    // Update status to checking
    setServices(prev => prev.map(service => ({
      ...service,
      status: service.flightCode ? 'checking' : service.status
    })));

    try {
      // In production, we would call the real API
      // For now, we'll simulate flight validation
      const mockFlightData: FlightInfo[] = [
        {
          code: "AA2641",
          departure_airport: "JFK",
          arrival_airport: "PUJ", 
          scheduled_in: "10:30 AM",
          status: "On Time"
        },
        {
          code: "BA2205",
          departure_airport: "LHR",
          arrival_airport: "PUJ",
          scheduled_in: "2:15 PM", 
          status: "Delayed"
        }
      ];

      setServices(prev => prev.map(service => {
        const flightInfo = mockFlightData.find(f => f.code === service.flightCode);
        return {
          ...service,
          flightInfo,
          status: flightInfo ? 'validated' : 'error'
        };
      }));
    } catch (error) {
      console.error('Error validating flights:', error);
      setServices(prev => prev.map(service => ({
        ...service,
        status: service.flightCode ? 'error' : service.status
      })));
    }
  };

  const confirmServices = () => {
    // Here we would send the services to the backend for approval
    console.log('Services confirmed for review:', services);
    alert(`${services.length} services submitted for approval`);
    popView();
  };

  const renderFetchStep = () => (
    <Card extra="w-full">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <PiAirplaneBold className="text-3xl text-blue-500" />
          <div>
            <h3 className="text-xl font-bold text-navy-700 dark:text-white">
              AirportTransfer Services
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Fetch services automatically from AT API
            </p>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-navy-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <button
          onClick={fetchServices}
          disabled={loading}
          className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Fetching Services...
            </>
          ) : (
            <>
              <PiAirplaneBold />
              Fetch AT Services
            </>
          )}
        </button>
      </div>
    </Card>
  );

  const renderReviewStep = () => (
    <Card extra="w-full">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-navy-700 dark:text-white">
            Review Services ({services.length})
          </h3>
          <button
            onClick={validateFlights}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
          >
            <BsCheckCircle />
            Validate Flights
          </button>
        </div>

        <div className="space-y-4">
          {services.map((service, index) => (
            <div
              key={index}
              className="border border-gray-200 dark:border-gray-600 rounded-lg p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-navy-700 dark:text-white">
                      {service.clientName}
                    </h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      service.kindOf === 'ARRIVAL' ? 'bg-green-100 text-green-800' :
                      service.kindOf === 'DEPARTURE' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {service.kindOf}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-300">
                    <div>
                      <span className="font-medium">Code:</span> {service.code}
                    </div>
                    <div>
                      <span className="font-medium">PAX:</span> {service.pax}
                    </div>
                    <div>
                      <span className="font-medium">Flight:</span> {service.flightCode || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">Time:</span> {service.pickupTime}
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium">Route:</span> {service.pickupLocation} → {service.dropoffLocation}
                    </div>
                  </div>

                  {service.flightInfo && (
                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <BsInfoCircle className="text-blue-500" />
                        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                          Flight Information
                        </span>
                      </div>
                      <div className="text-sm text-blue-600 dark:text-blue-400">
                        {service.flightInfo.departure_airport} → {service.flightInfo.arrival_airport} |
                        Arrival: {service.flightInfo.scheduled_in} |
                        Status: {service.flightInfo.status}
                      </div>
                    </div>
                  )}
                </div>

                <div className="ml-4">
                  {service.status === 'pending' && (
                    <div className="text-gray-400">
                      <BsInfoCircle size={20} />
                    </div>
                  )}
                  {service.status === 'checking' && (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                  )}
                  {service.status === 'validated' && (
                    <div className="text-green-500">
                      <BsCheckCircle size={20} />
                    </div>
                  )}
                  {service.status === 'error' && (
                    <div className="text-red-500">
                      <BsExclamationTriangle size={20} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => setStep('fetch')}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            Back
          </button>
          <button
            onClick={confirmServices}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Submit for Approval ({services.length} services)
          </button>
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
        <div>
          <h1 className="text-2xl font-bold text-navy-700 dark:text-white">
            AirportTransfer Service Integration
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Automatically import services from AirportTransfer API
          </p>
        </div>
      </div>

      {step === 'fetch' && renderFetchStep()}
      {step === 'review' && renderReviewStep()}
    </div>
  );
};

export default AirportTransferService;
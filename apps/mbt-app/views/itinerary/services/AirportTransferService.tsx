"use client";

import { useState, useEffect } from 'react';
import { useNavigation } from '../../../contexts/NavigationContext';
import { useServiceData } from '../../../contexts/ServiceDataContext';
import { useBottomBar } from '../../../contexts/BottomBarContext';

import { fetchAtData, extractAtServices, convertIsoStringTo12h } from '../../../utils/services';

import { ServiceInput, FlightInfo } from '../../../types/services';
import ServiceTable from '../../../components/shared/ServiceTable';

import { BsArrowLeft } from 'react-icons/bs';
import { FaUser, FaClock, FaUsers, FaRoute, FaInfoCircle, FaTimes, FaCopy, FaMapSigns } from "react-icons/fa";
import { PiAirplaneBold } from 'react-icons/pi';
import { HiOutlineRefresh, HiOutlineDownload, HiOutlineSave, HiChevronLeft } from "react-icons/hi";
import { toast } from 'sonner';

interface ServicePreview extends ServiceInput {
  flightInfo?: FlightInfo;
  status: 'pending' | 'checking' | 'validated' | 'error';
}

const AirportTransferService = () => {
	const { popView } = useNavigation();

	const { 
		setCurrentServices, 
		getCache, 
		setCache, 
		exportServices,
		activeServiceType,
		setActiveServiceType,
		selectedDate
	} = useServiceData();
	const { setActions, clearActions } = useBottomBar();

	const [loading, setLoading] = useState(false);
	const [selected, setSelected] = useState<any | null>(null);
	const [services, setServices] = useState<ServicePreview[]>([]);
	const [step, setStep] = useState<'fetch' | 'review' | 'confirm'>('review');

	useEffect(() => {
		if (activeServiceType !== 'at') {
			setActiveServiceType('at');
		}
	}, [activeServiceType, setActiveServiceType]);
	
	// will use DB 
	useEffect(() => {    
		const cache = getCache('at', selectedDate);
		if (cache && cache.data.length > 0) {
			const cachedServicesWithStatus: ServicePreview[] = cache.data.map(service => ({
				...service,
				status: 'validated' as const
			}));

			setServices(cachedServicesWithStatus);
			setCurrentServices(cache.data);
			setStep('review');
		} else {
			// Reset to fetch step if no cache for this date
			setServices([]);
			// setStep('fetch');
		}
	}, [selectedDate, getCache]);

	// Update bottom bar actions based on current step
	useEffect(() => {
		if (step === 'fetch') {
			setActions([
			{
				key: "fetch",
				label: "Actualizar Servicios",
				Icon: HiOutlineRefresh,
				variant: "primary",
				onClick: fetchServices,
				disabled: loading
			}
			]);
		} else if (step === 'review') {
			setActions([
				{
					key: "back",
					label: "Atrás",
					Icon: HiChevronLeft,
					variant: "secondary",
					onClick: () => popView() // This goes back to main itinerary, not fetch step
				},
				{
					key: "fetch",
					label: "Actualizar Servicios",
					Icon: HiOutlineRefresh,
					onClick: fetchServices
				},
				{
					key: "export",
					label: "Exportar",
					Icon: HiOutlineDownload,
					onClick: () => {
						const serviceInputs: ServiceInput[] = services.map(s => ({
						id: s.id,
						code: s.code,
						kindOf: s.kindOf,
						clientName: s.clientName,
						pickupTime: s.pickupTime,
						flightCode: s.flightCode,
						pax: s.pax,
						luggage: s.luggage,
						pickupLocation: s.pickupLocation,
						dropoffLocation: s.dropoffLocation,
						notes: s.notes,
						vehicleType: s.vehicleType,
						ally: s.ally
						}));
						exportServices(serviceInputs, 'csv');
					}
				},
				{
					key: "cache",
					label: "Guardar",
					Icon: HiOutlineSave,
					variant: "primary",
					onClick: () => {
						const serviceInputs: ServiceInput[] = services.map(s => ({
							id: s.id,
							code: s.code,
							kindOf: s.kindOf,
							clientName: s.clientName,
							pickupTime: s.pickupTime,
							flightCode: s.flightCode,
							pax: s.pax,
							luggage: s.luggage,
							pickupLocation: s.pickupLocation,
							dropoffLocation: s.dropoffLocation,
							notes: s.notes,
							vehicleType: s.vehicleType,
							ally: s.ally
						}));
						setCurrentServices(serviceInputs);
						setCache('at', serviceInputs, selectedDate);
						toast.success(`${serviceInputs.length} Servicios guardados exitosamente.`);
					}
				}
			]);
		}

		return () => {
			clearActions();
		};
	}, [step, loading, services, selectedDate, exportServices, setCache, setCurrentServices, setStep, popView, clearActions, setActions]);

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
	}

	const fetchServices = async () => {
		setLoading(true);
		try {

			toast.info('Buscando los servicios de AT para el:', selectedDate);
			const atResponse = await fetchAtData(selectedDate);      
			const atData = atResponse.bookings; 

			// Just in case, but rather show an error message instead of rendering false data 
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

			const extractedServices = extractAtServices(atData ?? mockAtData, selectedDate);
			const servicesWithStatus: ServicePreview[] = extractedServices.map(service => ({
				...service,
				status: 'pending' as const
			}));      

			// Update global state with fetched services
			const serviceInputs: ServiceInput[] = servicesWithStatus.map(s => {

				return {
					id: s.id,
					code: s.code,
					kindOf: s.kindOf,
					clientName: s.clientName,
					pickupTime: convertIsoStringTo12h(s.pickupTime),
					flightCode: s.flightCode,
					pax: s.pax,
					luggage: s.luggage,
					pickupLocation: s.pickupLocation,
					dropoffLocation: s.dropoffLocation,
					notes: s.notes,
					vehicleType: s.vehicleType,
					ally: s.ally        
				};

			});      

			setCurrentServices(serviceInputs);
			setServices(serviceInputs);
			// setStep('review');

		} catch (error) {
			console.error('Error fetching AT services:', error);
		} finally {
			setLoading(false);
		}
	};

	const confirmServices = () => {
		// Here we would send the services to the backend for approval
		console.log('Services confirmed for review:', services);
		alert(`${services.length} services submitted for approval`);
		clearActions(); // Clear bottom bar actions before leaving
		popView();
	};

  
  const renderFetchStep = () => {    
    
    const formattedDate = new Date(selectedDate).toLocaleDateString("es-ES", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC"
    });

    return (
      <div className="h-full w-full">
        <div className="w-full h-full rounded-2xl bg-white/95 dark:bg-slate-900/95 shadow-2xl border border-slate-200/70 dark:border-slate-800 px-8 py-7 space-y-6">
        
          {/* Header */}
          <header className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-blue-500/10 border border-blue-500/40 flex items-center justify-center">
                <PiAirplaneBold className="text-2xl text-blue-500" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
                  AirportTransfer 
                </h2>                
              </div>
            </div>

            <div className="hidden sm:flex flex-col items-end gap-1">
              <span className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide rounded-full bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800/70">
                Paso 1 · Interceptar Servicios
              </span>
              <span className="text-[9px] text-slate-500 dark:text-slate-500">
                Seguro de utilizar en consecutividad
              </span>
            </div>
          </header>

          {/* Date + Meta */}
          <section className="min-h-[30%] grid gap-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,1.6fr)] items-stretch">
            <div className="bg-slate-50 dark:bg-slate-900/40 rounded-xl px-4 py-3 border border-slate-200 dark:border-slate-800">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Fecha
              </p>
              <p className="text-lg font-semibold text-slate-900 dark:text-slate-50 leading-tight">
                {formattedDate}
              </p>
              <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                Cambia la fecha en el calendario principal. Esta prevista se actualiza automáticamente.
              </p>
            </div>

            <div className="flex flex-col justify-between gap-2 text-[10px] text-slate-500 dark:text-slate-400">
              <div className="flex items-center justify-between gap-2">
                <span>Fuente</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-900 text-[9px] text-slate-100 dark:bg-slate-100 dark:text-slate-900">
                  https://api.airporttransfer.com/api/bookings
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span>Modo</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-[9px] text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                  Intercepción de URL
                </span>
              </div>              
            </div>
          </section>

          {/* Action */}
          <div className="pt-1">
            <button
              onClick={fetchServices}
              disabled={loading}
              className="group w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold
                bg-blue-600 text-white hover:bg-blue-700
                disabled:opacity-60 disabled:cursor-not-allowed
                transition-transform duration-150 active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <span className="inline-flex h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Buscando servicios para el {formattedDate}</span>
                </>
              ) : (
                <>
                  <PiAirplaneBold className="text-base group-hover:translate-y-[-1px] transition-transform" />
                  <span>Busca los servicios para el {formattedDate}</span>
                </>
              )}
            </button>
            <p className="mt-2 text-[9px] text-slate-400">
              Los servicios existentes para esta fecha será reemplazados si se guarda una nueva respuesta.
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Bottom bar actions are now dynamically managed through useEffect hooks above 
  const renderReviewStep = () => (

    <div className="flex-col w-full"> 
      
      <ServiceTable 
        services={services}
        title="Total de Servicios"
        subtitle={
          <span>
            Siempre verifique que los servicios aquí sean los mismos que en el sitio oficial de <strong>Airport Transfer</strong>.
          </span>
        }
        company="AT"
      />    

    {/* DETAIL MODAL  */}
    {selected && (
      <div className="fixed inset-0 flex items-center justify-center bg-black/40 p-4">
        <div className="w-full max-w-2xl rounded-xl bg-white dark:bg-navy-800 shadow-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <PiAirplaneBold className="text-2xl text-blue-500" />
              <div>
                <h2 className="text-xl font-bold text-navy-700 dark:text-white">
                  Service Details
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {selected.code}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <FaTimes className="text-lg" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Service Type Badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {kindOfElement(selected.kindOf)}
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  selected.status === 'validated' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
                  selected.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {selected.status.toUpperCase()}
                </span>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(selected.code);
                  alert(`Service code ${selected.code} copied to clipboard!`);
                }}
                className="flex items-center gap-2 px-3 py-1 text-sm text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
              >
                <FaCopy />
                Copy Code
              </button>
            </div>

            {/* Client Information */}
            <div className="bg-gray-50 dark:bg-navy-700 rounded-lg p-4">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-navy-700 dark:text-white mb-3">
                <FaUser className="text-blue-500" />
                Client Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Name
                  </label>
                  <p className="text-sm font-medium text-navy-700 dark:text-white">
                    {selected.clientName}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    PAX
                  </label>
                  <div className="flex items-center gap-1">
                    <FaUsers className="text-blue-500 text-xs" />
                    <p className="text-sm font-medium text-navy-700 dark:text-white">
                      {selected.pax} passenger{selected.pax !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                {selected.luggage && (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                      Luggage
                    </label>
                    <p className="text-sm font-medium text-navy-700 dark:text-white">
                      {selected.luggage} piece{selected.luggage !== 1 ? 's' : ''}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Service Details */}
            <div className="bg-gray-50 dark:bg-navy-700 rounded-lg p-4">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-navy-700 dark:text-white mb-3">
                <FaClock className="text-green-500" />
                Service Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Pickup Time
                  </label>
                  <p className="text-sm font-medium text-navy-700 dark:text-white">
                    {convertIsoStringTo12h(selected.pickupTime)}
                  </p>
                </div>
                {selected.flightCode && (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                      Flight Code
                    </label>
                    <div className="flex items-center gap-1">
                      <PiAirplaneBold className="text-blue-500 text-xs" />
                      <p className="text-sm font-medium text-navy-700 dark:text-white">
                        {selected.flightCode}
                      </p>
                    </div>
                  </div>
                )}
                {selected.vehicleType && (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                      Vehicle Type
                    </label>
                    <p className="text-sm font-medium text-navy-700 dark:text-white">
                      {selected.vehicleType}
                    </p>
                  </div>
                )}
                {selected.ally && (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                      Partner
                    </label>
                    <p className="text-sm font-medium text-navy-700 dark:text-white">
                      {selected.ally}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Route Information */}
            <div className="bg-gray-50 dark:bg-navy-700 rounded-lg p-4">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-navy-700 dark:text-white mb-3">
                <FaRoute className="text-orange-500" />
                Route Information
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                      Pickup Location
                    </label>
                    <div className="flex items-start gap-2 mt-1">
                      <div className="w-3 h-3 rounded-full bg-green-500 mt-1 flex-shrink-0"></div>
                      <p className="text-sm font-medium text-navy-700 dark:text-white">
                        {selected.pickupLocation}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <FaMapSigns className="text-gray-400 text-lg" />
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                      Destination
                    </label>
                    <div className="flex items-start gap-2 mt-1">
                      <div className="w-3 h-3 rounded-full bg-red-500 mt-1 flex-shrink-0"></div>
                      <p className="text-sm font-medium text-navy-700 dark:text-white">
                        {selected.dropoffLocation}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            {selected.notes && (
              <div className="bg-gray-50 dark:bg-navy-700 rounded-lg p-4">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-navy-700 dark:text-white mb-3">
                  <FaInfoCircle className="text-purple-500" />
                  Additional Notes
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {selected.notes}
                </p>
              </div>
            )}

            {/* Flight Information (if available) */}
            {selected.flightInfo && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-navy-700 dark:text-white mb-3">
                  <PiAirplaneBold className="text-blue-500" />
                  Flight Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selected.flightInfo.airline && (
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                        Airline
                      </label>
                      <p className="text-sm font-medium text-navy-700 dark:text-white">
                        {selected.flightInfo.airline}
                      </p>
                    </div>
                  )}
                  {selected.flightInfo.terminal && (
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                        Terminal
                      </label>
                      <p className="text-sm font-medium text-navy-700 dark:text-white">
                        {selected.flightInfo.terminal}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setSelected(null)}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(selected, null, 2));
                alert('Full service data copied to clipboard!');
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
            >
              <FaCopy />
              Copy Data
            </button>
          </div>
        </div>
      </div>
    )}

    </div>
  );

  return (
    <div className="m-5 flex flex-col h-[68vh]">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={popView}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          <BsArrowLeft className="text-xl dark:text-white" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-navy-700 dark:text-white">
            Airport Transfer Intercepción de Servicios
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Intercepta los servicios de AT
          </p>
        </div>
      </div>

      <div className="flex-1 flex">
        {step === "fetch" && renderFetchStep()}
        {step === "review" && renderReviewStep()}
      </div>
    </div>
  );

};


export default AirportTransferService;


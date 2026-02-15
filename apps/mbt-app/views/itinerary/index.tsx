import { useEffect, useState, useCallback } from "react";

import { useNavigation } from "../../contexts/NavigationContext";
import { useServiceData } from "../../contexts/ServiceDataContext";
import { useBottomBar } from '../../contexts/BottomBarContext';

import Course from "../../components/single/card/Course";
import MiniCalendar from "../../components/single/minicalendar";
import Card from "../../components/single/card";
import Notes from "../../components/shared/Notes";
import NotesWidget from "../../components/shared/NotesWidget";

import Schedule from "./components/Schedule";

// Constants
import { serviceCompanies } from "../../constants/serviceCompanies";
import { itineraryTabs } from "../../constants/itineraryTabs";

// Service components
import AirportTransferService from "./services/AirportTransferService";
import SacbeTransferService from "../../components/services/SacbeTransferService";
import MBTransferService from "../../components/services/MBTransferService";
import AllServicesView from "../../components/services/AllServicesView";

// BottomBarTabs
import { ItinerarySettingsTab } from "./views/Settings";

//... more & more & more icons
import { GoCodescan, GoFileDiff } from "react-icons/go";
import { PiAddressBookThin, PiAirplaneBold } from "react-icons/pi";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import { FaGlobe, FaCog } from "react-icons/fa";

// Change the default name 
const Courses = () => {

  const { pushView } = useNavigation();
  const { selectedDate } = useServiceData();
  const { setActions, clearActions } = useBottomBar();
  const [activeTab, setActiveTab] = useState<'itinerary' | 'webhooks' | 'settings' | 'notes'>('itinerary');
  const [carouselIndex, setCarouselIndex] = useState(0);

  const updateActions = useCallback(() => {
    const actions = itineraryTabs.map(tab => ({
      key: tab.key,
      label: tab.label,
      Icon: tab.Icon,
      variant: activeTab === tab.key ? "primary" : "secondary",
      onClick: () => setActiveTab(tab.key)
    }));

    setActions(actions);
  }, [activeTab, setActions]);

  useEffect(() => {
    updateActions();
    return () => { clearActions(); };
  }, [updateActions, clearActions]);

  const handleServiceClick = (serviceType: string, title: string) => {
    let component;
    
    switch (serviceType) {
      case 'at':
        component = AirportTransferService;
        break;
      case 'st':
        component = SacbeTransferService;
        break;
      case 'mbt':
        component = MBTransferService;
        break;
      case 'all':
        component = AllServicesView;
        break;
      default:
        component = undefined;
    }

    pushView({
      id: `service-${serviceType}`,
      label: title,
      data: { serviceType, title },
      component
    });
  };

  const companies: string[] = ['All', 'AirportTransfer', 'Sacbé Transfer', 'MB Transfer'];

  const serviceIcon = (compName: string): React.ReactElement => {
    switch (compName) {
      case 'MB Transfer':
        return <PiAddressBookThin/>;
        
      case 'AirportTransfer':
        return <GoCodescan/>;
        
      case 'Sacbé Transfer':
        return <GoFileDiff/>;

      default:
        return <PiAirplaneBold />;
    }
  }

  const renderItineraryTab = () => {
    const currentService = serviceCompanies[carouselIndex];
    
    return (
      <div className="relative p-10 flex-col justify-between">
      
        {/* Carousel Navigation Header */}
        <div className="mb-6 flex items-center justify-between rounded-lg bg-white p-4 shadow-md dark:bg-navy-800">
          <button
            onClick={prevCarouselItem}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            disabled={serviceCompanies.length <= 1}
          >
            <BsChevronLeft className="h-5 w-5" />
          </button>
          
          <div className="flex-1 text-center">
            <h3 className="text-lg font-bold text-navy-700 dark:text-white">
              {currentService.title}
            </h3>
            <div className="mt-1 flex justify-center gap-1">
              {serviceCompanies.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCarouselIndex(index)}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    index === carouselIndex 
                      ? 'bg-accent-500' 
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>            
          </div>
          
          <button
            onClick={nextCarouselItem}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            disabled={serviceCompanies.length <= 1}
          >
            <BsChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Current Service Card */}
        <div className="transition-all duration-300 ease-in-out">
          <Course
            key={currentService.id}
            bgBox={currentService.bgBox}
            icon={currentService.icon}
            title={currentService.title}
            desc={currentService.desc}
            day={currentService.day}
            date={currentService.date}
            topics={currentService.topics}
            time={currentService.time}
            onClick={() => handleServiceClick(currentService.id, currentService.title)}
          />
        </div>

        {/* Quick Navigation Grid */}
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {serviceCompanies.map((service, index) => (
            <button
              key={service.id}
              onClick={() => setCarouselIndex(index)}
              className={`rounded-lg border-2 p-3 text-center text-xs transition-all ${
                index === carouselIndex
                  ? 'border-accent-500 bg-accent-50 text-blue-700 dark:bg-accent-900/20 dark:text-accent-300'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-navy-800 dark:text-gray-300 dark:hover:bg-navy-700'
              }`}
            >
              <div className="mb-1 flex justify-center">
                <span className="text-lg">{serviceIcon(companies[index])}</span>
              </div>
              <div className="font-medium">{service.day}</div>
              <div className="text-xs opacity-75">{service.date}</div>
            </button>
          ))}
        </div>

        {/* Service Counter */}
        <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          Mostrando servicios {carouselIndex + 1} de {serviceCompanies.length}
        </div>
        
        {/* Notes Widget */}
        <div className="w-full mt-4">
          <NotesWidget 
            selectedDate={selectedDate}
            onViewAll={() => setActiveTab('notes')}
          />
        </div>   
      </div>
    );
  };

  const renderWebhooksTab = () => (
    <div className="rounded-[20px] bg-white p-8 shadow-xl dark:bg-navy-800">
      <div className="text-center">
        <FaGlobe className="mx-auto mb-4 h-16 w-16 text-accent-500" />
        <h2 className="mb-4 text-2xl font-bold text-navy-700 dark:text-white">
          Integracíon de Webhooks
        </h2>
        <p className="mb-8 text-gray-600 dark:text-gray-300">
          Configurar las conexiones de mbt platform con plataformas web externas 
        </p>
      </div>
      
      <div className="space-y-6">
        <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-700">
          <h3 className="mb-3 text-lg font-semibold text-navy-700 dark:text-white">
            Integración Whatsapp 
          </h3>
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
            Enviar notificaciones automáticas a clientes, PDFs a grupos y notificaciones a números establecidos 
          </p>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</span>
            <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
              En Desarrollo 
            </span>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-700">
          <h3 className="mb-3 text-lg font-semibold text-navy-700 dark:text-white">
            Integración Email 
          </h3>
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
            Automáticamente envia correos y notificaciones a los aliados establecidos 
          </p>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</span>
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
              En Planificación 
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotesTab = () => (
    <div className="p-10">
      <Notes selectedDate={selectedDate} />
    </div>
  );
  const nextCarouselItem = () => {
    setCarouselIndex((prev) => (prev + 1) % serviceCompanies.length);
  };

  const prevCarouselItem = () => {
    setCarouselIndex((prev) => (prev - 1 + serviceCompanies.length) % serviceCompanies.length);
  };

  return (
    <main className="flex w-full flex-col font-dm md:gap-7 lg:flex-row">
      
      {/* RIGHT SECTION */}
      <div className="m-5 flex h-full w-full min-w-[50vh] flex-col items-center rounded-[20px] bg-white px-4 py-4 shadow-2xl shadow-gray-100 dark:!bg-navy-800 dark:shadow-none lg:w-[275px] 3xl:w-[470px] relative z-0">      
        {/* Calendar */}
        <Card extra={`max-w-full`}>          
          <MiniCalendar />
        </Card>
        
        {/* Schedule with enhanced design */}
        <Card extra={"w-full mt-4"}>
          <Schedule />
        </Card>
                
      </div>
        
      {/* separator */}
      <div className="h-0 w-0 bg-gray-300 dark:!bg-navy-700 lg:h-[1050px] lg:w-px" />

      {/* LEFT SECTION: Tab-based content with overflow support */}
      <div className="h-full w-full">                 
        {activeTab === 'itinerary' && renderItineraryTab()}
        {activeTab === 'webhooks' && renderWebhooksTab()}
        {activeTab === 'notes' && renderNotesTab()}
        {activeTab === 'settings' && <ItinerarySettingsTab/>}     
      </div>
    
    </main>        
  );
};

export default Courses;

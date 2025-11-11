import Course from "../../single/card/Course";
import MiniCalendar from "../../single/minicalendar";

import { useEffect, useState } from "react";

import { GoCodescan, GoFileDiff } from "react-icons/go";
import { PiAddressBookThin, PiAirplaneBold } from "react-icons/pi";
import { BsEye, BsChevronLeft, BsChevronRight } from "react-icons/bs";
import { FaCog, FaWhatsapp, FaRegStickyNote } from "react-icons/fa";

import Schedule from "./components/Schedule";
import Hours from "./components/Hours";
import Card from "../../single/card";
import { useNavigation } from "../../../contexts/NavigationContext";
import { useServiceData } from "../../../contexts/ServiceDataContext";
import { useBottomBar } from '../../../contexts/BottomBarContext';

// Service components
import AirportTransferService from "../../services/AirportTransferService";
import SacbeTransferService from "../../services/SacbeTransferService";
import MBTransferService from "../../services/MBTransferService";
import AllServicesView from "../../services/AllServicesView";

// Change the default name 
const Courses = () => {

  const { pushView } = useNavigation();
  const { selectedDate } = useServiceData();
  const { setActions, clearActions } = useBottomBar();
  const [activeTab, setActiveTab] = useState<'itinerary' | 'webhooks' | 'settings' | 'notes'>('itinerary');
  const [carouselIndex, setCarouselIndex] = useState(0);

  useEffect(() => {

    setActions([
        {
          key: "overview-tab",
          label: "Itinerario",
          Icon: BsEye,
          variant: activeTab === 'itinerary' ? "primary" : "secondary",
          onClick: () => setActiveTab('itinerary')
        },
        {
          key: "webhooks",
          label: "Webhooks",
          Icon: FaWhatsapp,
          variant: activeTab === 'webhooks' ? "primary" : "secondary",
          onClick: () => setActiveTab('webhooks')
        },
        {
          key: "notes",
          label: "Notes",
          Icon: FaRegStickyNote,
          variant: activeTab === 'notes' ? "primary" : "secondary",
          onClick: () => setActiveTab('notes')
        },
        {
          key: "check-time",
          label: "Configuración",
          Icon: FaCog,
          variant: activeTab === 'settings' ? "primary" : "secondary",
          onClick: () => setActiveTab('settings')
        }        
      ]);

      return () => { clearActions(); };
  
  }, [activeTab]);

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
                <span className="text-lg">{service.icon}</span>
              </div>
              <div className="font-medium">{service.day}</div>
              <div className="text-xs opacity-75">{service.date}</div>
            </button>
          ))}
        </div>

        {/* Service Counter */}
        <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          Showing service {carouselIndex + 1} of {serviceCompanies.length}
        </div>
      </div>
    );
  };

  const renderWebhooksTab = () => (
    <div className="rounded-[20px] bg-white p-8 shadow-xl dark:bg-navy-800">
      <div className="text-center">
        <FaWhatsapp className="mx-auto mb-4 h-16 w-16 text-green-500" />
        <h2 className="mb-4 text-2xl font-bold text-navy-700 dark:text-white">
          Webhook Integrations
        </h2>
        <p className="mb-8 text-gray-600 dark:text-gray-300">
          Configure external webhook integrations for real-time notifications and data synchronization.
        </p>
      </div>
      
      <div className="space-y-6">
        <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-700">
          <h3 className="mb-3 text-lg font-semibold text-navy-700 dark:text-white">
            WhatsApp Integration
          </h3>
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
            Send automated notifications to clients and drivers via WhatsApp.
          </p>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</span>
            <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
              Coming Soon
            </span>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-700">
          <h3 className="mb-3 text-lg font-semibold text-navy-700 dark:text-white">
            SMS Notifications
          </h3>
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
            Send SMS updates for pickup confirmations and service status changes.
          </p>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</span>
            <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
              Planned
            </span>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-700">
          <h3 className="mb-3 text-lg font-semibold text-navy-700 dark:text-white">
            Email Integration
          </h3>
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
            Automatically send confirmation emails and itinerary updates.
          </p>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</span>
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
              In Development
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotesTab = null;

  const renderSettingsTab = () => (
    <div className="rounded-[20px] bg-white p-8 shadow-xl dark:bg-navy-800">
      <div className="mb-8">
        <FaCog className="mx-auto mb-4 h-16 w-16 text-gray-500" />
        <h2 className="mb-4 text-center text-2xl font-bold text-navy-700 dark:text-white">
          Platform Settings
        </h2>
        <p className="text-center text-gray-600 dark:text-gray-300">
          Customize your MBT platform experience and preferences.
        </p>
      </div>
      
      <div className="space-y-8">
        {/* Display Settings */}
        <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-700">
          <h3 className="mb-4 text-lg font-semibold text-navy-700 dark:text-white">
            Display Preferences
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Dark Mode
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Toggle dark theme for better visibility
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Compact View
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Show more information in less space
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-700">
          <h3 className="mb-4 text-lg font-semibold text-navy-700 dark:text-white">
            Notifications
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Service Alerts
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Get notified about new services and updates
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Auto-refresh Data
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Automatically refresh service data every 5 minutes
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Service Settings */}
        <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-700">
          <h3 className="mb-4 text-lg font-semibold text-navy-700 dark:text-white">
            Service Management
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Auto-assign Vehicles
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Automatically suggest vehicles based on passenger count
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Validation Warnings
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Show warnings for incomplete service data
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Export Settings */}
        <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-700">
          <h3 className="mb-4 text-lg font-semibold text-navy-700 dark:text-white">
            Exporte De Servicios
          </h3>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Exporte de Archivos Defácto
              </label>
              <select className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-navy-700 dark:text-white">
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
                <option value="xlsx">Excel (XLSX)</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Incluir Metadata
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Add creation/modification timestamps to exports
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-6">
          <button className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-navy-800">
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );

  // Carousel items for service companies
  const serviceCompanies = [
    {
      id: 'all',
      bgBox: "bg-[url('/all.jpg')]",
      icon: <PiAirplaneBold />,
      title: "All Services",
      desc: "Visualize, create, edit, remove and manipulate all the services updated beforehand using the other tools.",
      day: "ALL",
      date: "Platform",
      topics: ["Semi-Automatic", "ALL"],
      time: "~25 minutos de trabajo"
    },
    {
      id: 'at',
      bgBox: "bg-[url('/at-website.png')]",
      icon: <GoCodescan />,
      title: "AirportTransfer",
      desc: "Get AT's services by simply intercepting a GET request to their open API endpoint, services are automatically added to the itinerary",
      day: "AT",
      date: "HTTPS",
      topics: ["Automatic", "AT"],
      time: "~10 minutos de trabajo"
    },
    {
      id: 'st',
      bgBox: "bg-[url('/st-website.png')]",
      icon: <GoFileDiff />,
      title: "Sacbé Transfer",
      desc: "Get ST's services by simply uploading their provided XLSX file, the tools implemented automatically read and manipulate the data to add it into the itinerary.",
      day: "ST",
      date: "XLSX",
      topics: ["Semi-Automatic", "ST"],
      time: "~15 minutos de trabajo"
    },
    {
      id: 'mbt',
      bgBox: "bg-[url('/mbt-website.png')]",
      icon: <PiAddressBookThin />,
      title: "MB Transfer",
      desc: "Create MBT's services by using a built-in form to introduce the data and submit to add to the itinerary",
      day: "MBT",
      date: "FORM",
      topics: ["Manual", "MBT", "Individual"],
      time: "~8 minutos de trabajo"
    }
  ];

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
      <div className="h-full w-full m-3">                 
        {activeTab === 'itinerary' && renderItineraryTab()}
        {activeTab === 'webhooks' && renderWebhooksTab()}
        {activeTab === 'settings' && renderSettingsTab()}
      </div>
    
    </main>        
  );
};

export default Courses;

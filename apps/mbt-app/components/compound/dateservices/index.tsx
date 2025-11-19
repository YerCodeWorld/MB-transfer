import Course from "../../single/card/Course";
import MiniCalendar from "../../single/minicalendar";

import { useEffect, useState, useCallback } from "react";

import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import { FaGlobe, FaCog } from "react-icons/fa";

import Schedule from "./components/Schedule";
import Card from "../../single/card";
import Notes from "../../shared/Notes";
import NotesWidget from "../../shared/NotesWidget";
import { useNavigation } from "../../../contexts/NavigationContext";
import { useServiceData } from "../../../contexts/ServiceDataContext";
import { useBottomBar } from '../../../contexts/BottomBarContext';

// Constants
import { serviceCompanies } from "../../../constants/serviceCompanies";
import { itineraryTabs } from "../../../constants/itineraryTabs";

// Service components
import AirportTransferService from "../../services/AirportTransferService";
import SacbeTransferService from "../../services/SacbeTransferService";
import MBTransferService from "../../services/MBTransferService";
import AllServicesView from "../../services/AllServicesView";

import { GoCodescan, GoFileDiff } from "react-icons/go";
import { PiAddressBookThin, PiAirplaneBold } from "react-icons/pi";

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
            Integración Whatapp 
          </h3>
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
            Enviar notificaciones automáticas a clientes, PDFs a grupos y notficaciones a números establecidos 
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

  // TODO
  // Can be highly simplified if we just create each row/category based off an object 
  const renderSettingsTab = () => (
    <div className="rounded-[20px] bg-white p-8 shadow-xl dark:bg-navy-800">
      <div className="mb-8">
        <FaCog className="mx-auto mb-4 h-16 w-16 text-accent-500" />
        <h2 className="mb-4 text-center text-2xl font-bold text-navy-700 dark:text-white">
          Configuración del Itinerario 
        </h2>        
      </div>
      
      <div className="space-y-8">
        {/* Display Settings */}
        <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-700">
          <h3 className="mb-4 text-lg font-semibold text-navy-700 dark:text-white">
            Configuaración de Interfáz 
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Posición de calendario 
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  ON: Posición izquierda | OFF: Posición derecha 
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
                  Temas de Compañías
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  ON: Cada compañía tiene su tema único | OFF: Las tablas de cada compañía tienen colores neutrales 
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
            Notificaciones 
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Alerta de Servicios 
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Recibir notificaciones por cualquier mutación de algún servicio 
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
                  Autorecargar Información 
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Activar un webhook que chequee por mutuaciones en las APIs
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
                  Edición Sincronizada 
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Recibir notificaciones cuando otro usuario está viendo/modificando el itinerario 
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
            Manejo de Servicios 
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Asignación Vehículos
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Asignar vehículos automáticamente basado en la cantidad de pasajeros y equipaje
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
                  Chequear Vuelos 
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Automáticamente chequear los códigos de vuelos de las llegadas 
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* PDFs Settings */}
        <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-700">
          <h3 className="mb-4 text-lg font-semibold text-navy-700 dark:text-white">
            Configuración de Diseños
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Generar diseños automáticamente 
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Una vez el diseño sea creado en la plataforma, generar PDF y guardar en la base de datos automáticamente (consume recursos sin confirmar errores)
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
                  Conexión a Whatsapp 
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Automáticamente enviar hacia el número de whatsapp assignado 
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
                  Incluir metadata (invisíble en documento) sobre la fecha y la edición del itinerario exportado
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
            Guardar Configuración 
          </button>
        </div>
      </div>
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
        {activeTab === 'settings' && renderSettingsTab()}     
      </div>
    
    </main>        
  );
};

export default Courses;

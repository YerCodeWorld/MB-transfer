"use client";

import { useState, useRef, useEffect } from 'react';
import { useNavigation } from '../../contexts/NavigationContext';
import { useServiceData } from '../../contexts/ServiceDataContext';
import { useBottomBar } from '../../contexts/BottomBarContext';
import { ServiceInput } from '../../types/services';
import { convertTo12Hour } from '../../utils/services';
import * as XLSX from 'xlsx';
import ServiceTable from '../shared/ServiceTable';

import { BsArrowLeft, BsFileEarmarkExcel, BsUpload } from 'react-icons/bs';
import { HiOutlineDownload, HiOutlineSave, HiChevronLeft } from 'react-icons/hi';
import { GoFileDiff } from 'react-icons/go';

interface ExtractedService extends ServiceInput {
  rowIndex: number;
  timeConverted?: boolean;
  validation: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  };
}

// Header mapping for Sacbé Transfer XLSX files
const HEADER_MAPPING = {
  'no': 'rowNumber',
  'no.': 'rowNumber',
  'tipo': 'kindOf', 
  'código': 'code',
  'codigo': 'code', // Alternative spelling
  'cliente': 'clientName',
  'pickup': 'pickupTime',  
  'pu': 'pickupTime',
  'vuelo': 'flightCode', 
  'vehículo': 'vehicleType',
  'vehiculo': 'vehicleType', // Alternative spelling  
  'pax': 'pax',
  'desde': 'pickupLocation',
  'hacia': 'dropoffLocation',
  'pago': 'payment', // Not used
  'notas': 'notes',
  'estatus': 'status' // Not used
};

const SacbeTransferService = () => {
  const { popView } = useNavigation();
  const { 
    setCurrentServices, 
    getCache, 
    setCache, 
    exportServices,
    setActiveServiceType,
    selectedDate 
  } = useServiceData();
  
  const { setActions, clearActions } = useBottomBar();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<ExtractedService[]>([]);
  const [step, setStep] = useState<'upload' | 'review'>('upload');

  // Load cached data on component mount and set up service type
  useEffect(() => {
    setActiveServiceType('st');
    
    // Check specifically for 'st' service type cache for the selected date
    const cache = getCache('st', selectedDate);
    if (cache && cache.data.length > 0) {
      const cachedServicesWithValidation: ExtractedService[] = cache.data.map((service, index) => ({
        ...service,
        rowIndex: index + 2, // Assuming header is row 1
        validation: {
          isValid: true,
          errors: [],
          warnings: []
        }
      }));
      setServices(cachedServicesWithValidation);
      setCurrentServices(cache.data);
      setStep('review');
    } else {
      // Reset to upload step if no cache for this date
      setServices([]);
      setFile(null);
      setStep('upload');
    }
  }, [selectedDate, getCache, setActiveServiceType, setCurrentServices]);

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.name.match(/\.(xlsx|xls)$/)) {
      alert('Please select an Excel file (.xlsx or .xls)');
      return;
    }
    setFile(selectedFile);
    processFile(selectedFile);
  };

  const processFile = async (file: File) => {
    setLoading(true);
    
    try {
      // Read the Excel file using XLSX
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      // Get the last sheet (as requested by the workflow of the company)
      const sheetNames = workbook.SheetNames;
      const lastSheetName = sheetNames[sheetNames.length - 1];
      const worksheet = workbook.Sheets[lastSheetName];
      
      // Convert to JSON with headers
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false });
      
      if (jsonData.length < 2) {
        throw new Error('Excel file must have at least a header row and one data row');
      }
      
      // Get headers (first row) and normalize them
      const headers = (jsonData[0] as string[]).map(h => 
        h.toString().toLowerCase().trim()
      );      
      
      // Map headers to our field names
      const fieldMapping: { [key: number]: string } = {};
      headers.forEach((header, index) => {        
        const mappedField = HEADER_MAPPING[header as keyof typeof HEADER_MAPPING];        
        if (mappedField) {
          fieldMapping[index] = mappedField;
        }
      });            
      
      // Process data rows
      const extractedServices: ExtractedService[] = [];
      
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i] as any[];        
        if (!row || row.length === 0) continue;               
        
        // Create service object
        const service: Partial<ServiceInput> = {
          id: `st_${i}`,
          ally: "Sacbé Transfer"
        };
        
        // Map row data to service fields
        row.forEach((cell, cellIndex) => {
          const field = fieldMapping[cellIndex];
          if (field && cell !== null && cell !== undefined) {
            const cellValue = cell.toString().trim();            
            
            switch (field) {
              case 'kindOf':
                // Map Spanish service types to our enum
                if (cellValue.toLowerCase().includes('llegada') || cellValue.toLowerCase().includes('arrival')) {
                  service.kindOf = 'ARRIVAL';
                } else if (cellValue.toLowerCase().includes('salida') || cellValue.toLowerCase().includes('departure')) {
                  service.kindOf = 'DEPARTURE';
                } else {
                  service.kindOf = 'TRANSFER';
                }
                break;
              case 'pax':
                service.pax = parseInt(cellValue) || 0;                
                break;
              case 'pickupTime':                                
                service.pickupTime = convertTo12Hour(cellValue);                
                break;
              default:
                (service as any)[field] = cellValue;
            }
          }
        });
        
        // Validation
        const errors: string[] = [];
        const warnings: string[] = [];
        
        if (!service.clientName?.trim()) {
          errors.push('Missing passenger name');
        }
        if (!service.code?.trim()) {
          errors.push('Missing service code');
        }
        if (!service.pax || service.pax <= 0) {
          errors.push('Invalid PAX number');
        }
        if (!service.pickupLocation?.trim()) {
          errors.push('Missing pickup location');
        }
        if (!service.dropoffLocation?.trim()) {
          errors.push('Missing destination');
        }
        if (service.kindOf === 'ARRIVAL' && !service.flightCode) {
          warnings.push('Arrival service missing flight code');
        }
        
        // Check if time was in 12-hour format and got converted
        const originalTime = row[headers.indexOf('pickup')] || '';        
        const wasTime12h = originalTime.toString().match(/\d{1,2}:\d{2}(?::\d{2})?\s*(AM|PM)/i);
        let timeConverted = false;
        if (wasTime12h) {
          warnings.push('Time converted from 12h to 24h format');
          timeConverted = true;
        }
        
        const extractedService: ExtractedService = {
          ...(service as ServiceInput),
          rowIndex: i + 1,
          timeConverted,
          validation: {
            isValid: errors.length === 0,
            errors,
            warnings
          }
        };
        
        extractedServices.push(extractedService);
      }
      
      console.log('Extracted services:', extractedServices);
      setServices(extractedServices);
      setStep('review');
      
      // Update global state
      const serviceInputs: ServiceInput[] = extractedServices.map(s => ({
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
    } catch (error) {      
      alert(`Error processing Excel file: ${error instanceof Error ? error.message : 'Please check the format.'}`);
    } finally {
      setLoading(false);
    }
  };

  const confirmServices = () => {
    const validServices = services.filter(s => s.validation.isValid);    
    alert(`${validServices.length} services submitted for approval`);
    clearActions();
    popView();
  };


  // Update bottom bar actions based on current step
  useEffect(() => {
    if (step === 'upload') {
      setActions([
        {
          key: "upload",
          label: "Upload File",
          Icon: BsUpload,
          variant: "primary",
          onClick: () => fileInputRef.current?.click(),
          disabled: loading
        }
      ]);
    } else if (step === 'review') {
      setActions([
        {
          key: "back",
          label: "Back",
          Icon: HiChevronLeft,
          variant: "secondary",
          onClick: () => popView() // Go back to main itinerary
        },
        {
          key: "upload",
          label: "Upload New",
          Icon: BsUpload,
          onClick: () => setStep('upload')
        },
        {
          key: "export",
          label: "Export",
          Icon: HiOutlineDownload,
          onClick: () => {
            const validServices = services.filter(s => s.validation.isValid);
            if (validServices.length > 0) {
              exportServices(validServices, 'csv');
            } else {
              alert('No valid services to export');
            }
          }
        },
        {
          key: "save",
          label: "Save",
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
            setCache('st', serviceInputs, selectedDate);
            alert('Services saved successfully!');
          }
        }
      ]);
    }

    return () => {
      // Cleanup function
    };
  }, [step, services, loading, exportServices, setCache, setCurrentServices, popView, clearActions, setActions, selectedDate]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const renderUploadStep = () => (
    <Card extra="w-full">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <GoFileDiff className="text-3xl text-green-500" />
          <div>
            <h3 className="text-xl font-bold text-green-700 dark:text-green-300">
              Servicios de Sacbé Transfer
            </h3>
            <p className="text-green-600 dark:text-green-400">
              Suba un archivo de Excel para extraer los servicios
            </p>
          </div>
        </div>

        <div className="mb-6">
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <label className="block text-sm font-medium text-green-700 dark:text-green-300 mb-2">
              Fecha Seleccionada desde el calendario
            </label>
            <p className="text-lg font-semibold text-green-800 dark:text-green-200">
              {new Date(selectedDate).toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                timeZone: 'UTC'
              }).toUpperCase()}
            </p>
            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
              Los servicios serán guardados para esta fecha
            </p>
          </div>
        </div>

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragOver 
              ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
              : 'border-gray-300 dark:border-gray-600'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <BsFileEarmarkExcel className="text-6xl text-green-400 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-green-700 dark:text-green-300 mb-2">
            Subir Archivo de Excel
          </h4>
          <p className="text-green-600 dark:text-green-400 mb-4">
            Puede soltar su archivo aquí o navegar desde su dispositivo
          </p>
          
          {file && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-green-700 dark:text-green-300 font-medium">
                Selected: {file.name}
              </p>
            </div>
          )}

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center gap-2 mx-auto"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Procesando...
              </>
            ) : (
              <>
                <BsUpload />
                Elija un Archivo
              </>
            )}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => {
              const selectedFile = e.target.files?.[0];
              if (selectedFile) handleFileSelect(selectedFile);
            }}
            className="hidden"
          />
        </div>

        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <h5 className="font-semibold text-green-700 dark:text-green-300 mb-2">Expected Excel Format:</h5>
          <div className="text-sm text-green-600 dark:text-green-400 space-y-1">
            <p>• <strong>No:</strong> Service code</p>
            <p>• <strong>Cliente:</strong> Passenger name</p>
            <p>• <strong>Vuelo:</strong> Flight number (if applicable)</p>
            <p>• <strong>PU:</strong> Pickup time (24h format will be converted)</p>
            <p>• <strong>PAX:</strong> Number of passengers</p>
            <p>• <strong>Desde:</strong> Pickup location</p>
            <p>• <strong>Hasta:</strong> Destination</p>
            <p>• <strong>Tipo:</strong> Llegada/Salida/Traslado</p>
          </div>
        </div>
      </div>
    </Card>
  );

  const renderReviewStep = () => {
    // Convert ExtractedService to ServiceInput for the reusable table
    const serviceInputs: ServiceInput[] = services.map(service => ({
      id: service.id,
      code: service.code,
      kindOf: service.kindOf,
      clientName: service.clientName,
      pickupTime: service.pickupTime,
      flightCode: service.flightCode,
      pax: service.pax,
      luggage: service.luggage,
      pickupLocation: service.pickupLocation,
      dropoffLocation: service.dropoffLocation,
      notes: service.notes,
      vehicleType: service.vehicleType,
      ally: service.ally
    }));

    return (
      <div className="w-full space-y-6">
        {/* Validation Summary */}
        {services.some(s => s.validation.errors.length > 0 || s.validation.warnings.length > 0) && (
          <Card extra="w-full">
            <div className="p-4">
              <h4 className="font-semibold text-green-700 dark:text-green-300 mb-3">Resumen de validación</h4>
              <div className="space-y-2 text-sm">
                {services.map((service, index) => (
                  (service.validation.errors.length > 0 || service.validation.warnings.length > 0) && (
                    <div key={index} className="flex items-start gap-2">
                      <span className="font-medium">Row {service.rowIndex}:</span>
                      <div className="flex-1">
                        {service.validation.errors.map((error, i) => (
                          <div key={i} className="flex items-center gap-1 text-red-600">
                            <BsExclamationTriangle className="text-xs" />
                            {error}
                          </div>
                        ))}
                        {service.validation.warnings.map((warning, i) => (
                          <div key={i} className="flex items-center gap-1 text-yellow-600">
                            <BsExclamationTriangle className="text-xs" />
                            {warning}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                ))}
              </div>

            </div>
          </Card>
        )}

        {/* Service Table */}
        <ServiceTable 
          services={serviceInputs}
          title="Total de Servicios"
          subtitle={
            <span>
              Siempre verifique que los servicios aquí sean los mismos que en el documento oficial de <strong>Sacbé Transfer</strong> XLSX file.
            </span>
          }
          company="ST"
        />

        {/* Submit Button */}
        <Card extra="w-full">
          <div className="p-4">
            <button
              onClick={confirmServices}
              className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
              disabled={services.filter(s => s.validation.isValid).length === 0}
            >
              Subir para aprobación ({services.filter(s => s.validation.isValid).length} servicios validos)
            </button>
          </div>
        </Card>
      </div>
    );
  };

  return (
    <div className="w-full p-5">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={popView}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          <BsArrowLeft className="text-xl text-white" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-navy-700 dark:text-white">
            Sacbé Transfer Importación de Servicios
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Suba y procese los archivos de excel con los servicios 
          </p>
        </div>
      </div>

      {step === 'upload' && renderUploadStep()}
      {step === 'review' && renderReviewStep()}
    </div>
  );
};

export default SacbeTransferService;

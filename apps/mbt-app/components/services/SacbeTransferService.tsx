"use client";

import { useState, useRef } from 'react';
import { useNavigation } from '../../contexts/NavigationContext';
import { ServiceInput } from '../../types/services';
import { convertTo12Hour } from '../../utils/services';

import Card from '../single/card';
import { BsArrowLeft, BsFileEarmarkExcel, BsUpload, BsCheckCircle, BsExclamationTriangle } from 'react-icons/bs';
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

const SacbeTransferService = () => {
  const { popView } = useNavigation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<ExtractedService[]>([]);
  const [step, setStep] = useState<'upload' | 'review'>('upload');

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
      // In a real implementation, we would use a library like SheetJS
      // For now, we'll simulate the Excel processing with mock data
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate processing

      const mockExcelData = [
        {
          Codigo: "ST001",
          Pasajero: "Maria Garcia",
          Vuelo: "F906",
          Hora: "14:15", // 24h format
          PAX: "4",
          Recogida: "Dreams Resort",
          Destino: "Punta Cana Airport",
          Tipo: "Salida"
        },
        {
          Codigo: "ST002", 
          Pasajero: "Roberto Silva",
          Vuelo: "", // No flight for transfer
          Hora: "16:30",
          PAX: "2",
          Recogida: "Barceló Resort",
          Destino: "Hard Rock Hotel", 
          Tipo: "Traslado"
        },
        {
          Codigo: "ST003",
          Pasajero: "Ana Martinez",
          Vuelo: "AA1965",
          Hora: "09:45",
          PAX: "3",
          Recogida: "Punta Cana Airport",
          Destino: "Iberostar Resort",
          Tipo: "Llegada"
        }
      ];

      const extractedServices: ExtractedService[] = mockExcelData.map((row, index) => {
        const service: ExtractedService = {
          code: row.Codigo,
          kindOf: row.Tipo === 'Llegada' ? 'ARRIVAL' : 
                  row.Tipo === 'Salida' ? 'DEPARTURE' : 'TRANSFER',
          clientName: row.Pasajero,
          pickupTime: row.Hora,
          flightCode: row.Vuelo || undefined,
          pax: parseInt(row.PAX),
          pickupLocation: row.Recogida,
          dropoffLocation: row.Destino,
          ally: "Sacbé Transfer",
          rowIndex: index + 2, // Assuming header is row 1
          validation: { isValid: true, errors: [], warnings: [] }
        };

        // Validation
        const errors: string[] = [];
        const warnings: string[] = [];

        if (!service.clientName.trim()) {
          errors.push('Missing passenger name');
        }
        if (!service.code?.trim()) {
          errors.push('Missing service code');
        }
        if (service.pax <= 0) {
          errors.push('Invalid PAX number');
        }
        if (service.kindOf === 'ARRIVAL' && !service.flightCode) {
          warnings.push('Arrival service missing flight code');
        }

        // Check if time needs conversion (24h to 12h)
        const timeNeedsConversion = service.pickupTime.match(/^\d{2}:\d{2}$/);
        if (timeNeedsConversion) {
          warnings.push('Time will be converted from 24h to 12h format');
          service.timeConverted = true;
        }

        service.validation = {
          isValid: errors.length === 0,
          errors,
          warnings
        };

        return service;
      });

      setServices(extractedServices);
      setStep('review');
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Error processing Excel file. Please check the format.');
    } finally {
      setLoading(false);
    }
  };

  const convertTimes = () => {
    setServices(prev => prev.map(service => {
      if (service.timeConverted && service.pickupTime.match(/^\d{2}:\d{2}$/)) {
        return {
          ...service,
          pickupTime: convertTo12Hour(service.pickupTime),
          timeConverted: false,
          validation: {
            ...service.validation,
            warnings: service.validation.warnings.filter(w => !w.includes('converted'))
          }
        };
      }
      return service;
    }));
  };

  const confirmServices = () => {
    const validServices = services.filter(s => s.validation.isValid);
    console.log('Services confirmed for review:', validServices);
    alert(`${validServices.length} services submitted for approval`);
    popView();
  };

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
            <h3 className="text-xl font-bold text-navy-700 dark:text-white">
              Sacbé Transfer Services
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Upload XLSX file with service data
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
          <BsFileEarmarkExcel className="text-6xl text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-navy-700 dark:text-white mb-2">
            Upload Excel File
          </h4>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Drop your XLSX file here or click to browse
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
                Processing...
              </>
            ) : (
              <>
                <BsUpload />
                Choose File
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

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h5 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">Expected Excel Format:</h5>
          <div className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
            <p>• <strong>Codigo:</strong> Service code</p>
            <p>• <strong>Pasajero:</strong> Passenger name</p>
            <p>• <strong>Vuelo:</strong> Flight number (if applicable)</p>
            <p>• <strong>Hora:</strong> Pickup time (24h format will be converted)</p>
            <p>• <strong>PAX:</strong> Number of passengers</p>
            <p>• <strong>Recogida:</strong> Pickup location</p>
            <p>• <strong>Destino:</strong> Destination</p>
            <p>• <strong>Tipo:</strong> Llegada/Salida/Traslado</p>
          </div>
        </div>
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
          <div className="flex gap-2">
            <button
              onClick={convertTimes}
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 flex items-center gap-2"
            >
              Convert Times
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {services.map((service, index) => (
            <div
              key={index}
              className={`border rounded-lg p-4 ${
                service.validation.isValid 
                  ? 'border-green-200 dark:border-green-600' 
                  : 'border-red-200 dark:border-red-600'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-navy-700 dark:text-white">
                      {service.clientName || 'No Name'}
                    </h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      service.kindOf === 'ARRIVAL' ? 'bg-green-100 text-green-800' :
                      service.kindOf === 'DEPARTURE' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {service.kindOf}
                    </span>
                    <span className="text-xs text-gray-500">
                      Row {service.rowIndex}
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
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Time:</span> 
                      <span className={service.timeConverted ? 'text-yellow-600' : ''}>
                        {service.pickupTime}
                      </span>
                      {service.timeConverted && (
                        <span className="text-xs text-yellow-600">(24h)</span>
                      )}
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium">Route:</span> {service.pickupLocation} → {service.dropoffLocation}
                    </div>
                  </div>

                  {(service.validation.errors.length > 0 || service.validation.warnings.length > 0) && (
                    <div className="mt-3 space-y-2">
                      {service.validation.errors.map((error, i) => (
                        <div key={i} className="flex items-center gap-2 text-red-600 text-sm">
                          <BsExclamationTriangle />
                          {error}
                        </div>
                      ))}
                      {service.validation.warnings.map((warning, i) => (
                        <div key={i} className="flex items-center gap-2 text-yellow-600 text-sm">
                          <BsExclamationTriangle />
                          {warning}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="ml-4">
                  {service.validation.isValid ? (
                    <div className="text-green-500">
                      <BsCheckCircle size={20} />
                    </div>
                  ) : (
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
            onClick={() => setStep('upload')}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            Back
          </button>
          <button
            onClick={confirmServices}
            className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            disabled={services.filter(s => s.validation.isValid).length === 0}
          >
            Submit for Approval ({services.filter(s => s.validation.isValid).length} valid services)
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
            Sacbé Transfer Service Import
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Upload and process XLSX files with service data
          </p>
        </div>
      </div>

      {step === 'upload' && renderUploadStep()}
      {step === 'review' && renderReviewStep()}
    </div>
  );
};

export default SacbeTransferService;
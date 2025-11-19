"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { BsFilePdf, BsDownload, BsEye, BsX, BsCheckCircle, BsExclamationTriangle, BsPencil } from 'react-icons/bs';
import { FaSpinner } from 'react-icons/fa';
import VoucherTemplate from './VoucherTemplate';
import { generateServicePDF, serviceToVoucherData, VoucherData } from '../../utils/pdfGenerator';
import { ServiceInput } from '../../types/services';
import { toast } from "sonner";

interface ExtendedService extends ServiceInput {
  serviceType: 'at' | 'st' | 'mbt';
}

interface PDFGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  services: ExtendedService[];
  selectedDate: string;
  onServiceUpdate?: (serviceId: string, updatedService: ExtendedService) => void;
}

const PDFGeneratorModal: React.FC<PDFGeneratorModalProps> = ({
  isOpen,
  onClose,
  services,
  selectedDate,
  onServiceUpdate
}) => {
  const [mounted, setMounted] = useState(false);
  const [previewService, setPreviewService] = useState<ExtendedService | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [generationStatus, setGenerationStatus] = useState<'idle' | 'generating' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [editingService, setEditingService] = useState<ExtendedService | null>(null);
  const [editFormData, setEditFormData] = useState({
    clientName: '',
    hotel: '',
    pax: 1,
    time: '',
    flightCode: ''
  });
  const [filterCompany, setFilterCompany] = useState<'all' | 'at' | 'st' | 'mbt'>('all');
  const [filterType, setFilterType] = useState<'all' | 'ARRIVAL' | 'DEPARTURE' | 'TRANSFER'>('all');

  // Filter services based on company and type
  const filteredServices = services.filter(service => {
    const companyMatch = filterCompany === 'all' || service.serviceType === filterCompany;
    const typeMatch = filterType === 'all' || service.kindOf === filterType;
    return companyMatch && typeMatch;
  });

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleClose = () => {
    if (!isGenerating) {
      setPreviewService(null);
      setProgress({ current: 0, total: 0 });
      setGenerationStatus('idle');
      setErrorMessage('');
      setEditingService(null);
      onClose();
    }
  };

  const handleEditService = (service: ExtendedService) => {
    setEditingService(service);
    
    // Populate form with existing data or defaults
    const voucherData = serviceToVoucherData(service, selectedDate);
    
    // Smart hotel/location logic
    let hotelLocation = 'Hotel';
    if (service.pdfData?.hotel) {
      hotelLocation = service.pdfData.hotel;
    } else {
      // For arrival services, use dropoff location (hotel)
      // For departure services, use pickup location (hotel)  
      // For transfers, prefer the non-airport location
      if (service.kindOf === 'ARRIVAL') {
        hotelLocation = service.dropoffLocation || service.pickupLocation || 'Hotel';
      } else if (service.kindOf === 'DEPARTURE') {
        hotelLocation = service.pickupLocation || service.dropoffLocation || 'Hotel';
      } else {
        // For transfers, try to pick the non-airport location
        const pickup = service.pickupLocation?.toLowerCase() || '';
        const dropoff = service.dropoffLocation?.toLowerCase() || '';
        
        if (pickup.includes('airport') || pickup.includes('aeropuerto')) {
          hotelLocation = service.dropoffLocation || service.pickupLocation || 'Hotel';
        } else if (dropoff.includes('airport') || dropoff.includes('aeropuerto')) {
          hotelLocation = service.pickupLocation || service.dropoffLocation || 'Hotel';
        } else {
          // Neither is clearly an airport, use pickup
          hotelLocation = service.pickupLocation || service.dropoffLocation || 'Hotel';
        }
      }
    }
    
    setEditFormData({
      clientName: service.pdfData?.clientName || service.clientName,
      hotel: hotelLocation,
      pax: service.pdfData?.pax || service.pax,
      time: voucherData.time,
      flightCode: service.pdfData?.flightCode || service.flightCode || ''
    });
  };

  const handleSaveEditedData = () => {
    if (!editingService || !onServiceUpdate) return;

    const updatedService = {
      ...editingService,
      pdfData: {
        clientName: editFormData.clientName,
        hotel: editFormData.hotel,
        pax: editFormData.pax,        
        flightCode: editFormData.flightCode
      }
    };

    onServiceUpdate(editingService.code || '', updatedService);
    setEditingService(null);
    
    // Update preview if this service is being previewed
    if (previewService?.code === editingService.code) {
      setPreviewService(updatedService);
    }

    toast.success("Información Actualizada", {
      className: "bg-card text-card-foreground border-border",
      description: 'La información del PDF del servicio ha sido actualizada'
    });
  };

  const handleCancelEdit = () => {
    setEditingService(null);
    toast.warning("El servicio no fue actualizado", {
      className: "bg-card text-card-foreground border-border"
    });     
  };

  const handlePreview = (service: ExtendedService) => {
    setPreviewService(service);
  };

  const handleGenerateSingle = async (service: ExtendedService) => {
    setIsGenerating(true);
    setGenerationStatus('generating');
    
    try {
      // Set preview to show the voucher
      setPreviewService(service);
      
      // Wait a bit for the element to render
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await generateServicePDF(service, selectedDate, 'voucher-preview');
      setGenerationStatus('success');
      
      setTimeout(() => {
        setGenerationStatus('idle');
        setPreviewService(null);
      }, 2000);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      setGenerationStatus('error');
      if (error.message.includes('popup')) {
        setErrorMessage('Por favor permite ventanas emergentes para generar PDFs');
      } else {
        setErrorMessage(error.message || 'Error desconocido al generar PDF');
      }
      setTimeout(() => {
        setGenerationStatus('idle');
        setErrorMessage('');
      }, 5000);
    } finally {
      setIsGenerating(false);
    }
  };

  const getCompanyColor = (serviceType: string) => {
    switch (serviceType) {
      case 'at': return 'text-blue-600 bg-blue-50';
      case 'st': return 'text-green-600 bg-green-50';
      case 'mbt': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getCompanyName = (serviceType: string) => {
    switch (serviceType) {
      case 'at': return 'Airport Transfer';
      case 'st': return 'Sacbé Transfer';
      case 'mbt': return 'MB Transfer';
      default: return serviceType.toUpperCase();
    }
  };

  if (!mounted || !isOpen) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 z-[50000] backdrop-blur-sm flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isGenerating) {
          handleClose();
        }
      }}
    >
      <div className="w-full  max-w-7xl max-h-[90vh] rounded-xl bg-white dark:bg-navy-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <BsFilePdf className="text-2xl text-red-500" />
            <div>
              <h2 className="text-xl font-bold text-navy-700 dark:text-white">
                Generador de PDFs de Servicios
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {filteredServices.length} de {services.length} servicios para {new Date(selectedDate).toLocaleDateString('es-ES')}
              </p>
            </div>
          </div>
          
          {!isGenerating && (
            <button
              onClick={handleClose}
              className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <BsX className="h-6 w-6" />
            </button>
          )}
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Services List */}
          <div className="w-1/2 border-r border-gray-200 dark:border-gray-700 overflow-y-auto p-6">
            <div className="space-y-4">
              {/* Filters */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-3">Filtros</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                      Empresa
                    </label>
                    <select
                      value={filterCompany}
                      onChange={(e) => setFilterCompany(e.target.value as any)}
                      className="w-full text-sm px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-navy-700 text-navy-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">Todas</option>
                      <option value="at">Airport Transfer</option>
                      <option value="st">Sacbé Transfer</option>
                      <option value="mbt">MB Transfer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                      Tipo de Servicio
                    </label>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value as any)}
                      className="w-full text-sm px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-navy-700 text-navy-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">Todos</option>
                      <option value="ARRIVAL">Llegadas</option>
                      <option value="DEPARTURE">Salidas</option>
                      <option value="TRANSFER">Transfers</option>
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Individual Services */}
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-white mb-3">Servicios Individuales</h3>
                <div className="space-y-2">
                  {filteredServices.map((service) => (
                    <div
                      key={service.code}
                      className="flex items-center justify-between p-3 bg-white dark:bg-navy-700 rounded-lg border border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-navy-700 dark:text-white">
                            {service.clientName}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getCompanyColor(service.serviceType)}`}>
                            {getCompanyName(service.serviceType)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {service.code} • {service.kindOf} • {service.pax} PAX 
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditService(service)}
                          disabled={isGenerating}
                          className="p-2 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="Editar datos PDF"
                        >
                          <BsPencil />
                        </button>
                        <button
                          onClick={() => handlePreview(service)}
                          disabled={isGenerating}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Vista Previa"
                        >
                          <BsEye />
                        </button>
                        <button
                          onClick={() => handleGenerateSingle(service)}
                          disabled={isGenerating}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Imprimir PDF"
                        >
                          <BsDownload />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="w-1/2 overflow-y-auto bg-gray-50 dark:bg-gray-900">
            <div className="p-6">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Vista Previa del Voucher</h3>
              
              {previewService ? (
                <div className="">
                  <div 
                    id="voucher-preview"                    
                  >
                    <VoucherTemplate
                      {...serviceToVoucherData(previewService, selectedDate)}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                  <div className="text-center">
                    <BsEye className="text-4xl mx-auto mb-2 opacity-50" />
                    <p>Selecciona un servicio para ver la vista previa</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Edit Form Modal
  const editModalContent = editingService && (
    <div 
      className="fixed inset-0 z-[60000] flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleCancelEdit();
        }
      }}
    >
      <div className="w-full max-w-md rounded-xl bg-white dark:bg-navy-800 shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-navy-700 dark:text-white">
            Editar Datos del PDF
          </h3>
          <button
            onClick={handleCancelEdit}
            className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
          >
            <BsX className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nombre del Cliente
            </label>
            <input
              type="text"
              value={editFormData.clientName}
              onChange={(e) => setEditFormData(prev => ({ ...prev, clientName: e.target.value }))}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-navy-700 text-navy-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nombre del cliente"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Hotel
            </label>
            <input
              type="text"
              value={editFormData.hotel}
              onChange={(e) => setEditFormData(prev => ({ ...prev, hotel: e.target.value }))}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-navy-700 text-navy-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Hotel o ubicación"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              PAX
            </label>
            <input
              type="number"
              min="1"
              value={editFormData.pax}
              onChange={(e) => setEditFormData(prev => ({ ...prev, pax: parseInt(e.target.value) || 1 }))}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-navy-700 text-navy-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Hora
            </label>
            <input
              type="text"
              value={editFormData.time}
              onChange={(e) => setEditFormData(prev => ({ ...prev, time: e.target.value }))}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-navy-700 text-navy-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ej: 2:30 PM"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Código de Vuelo (opcional)
            </label>
            <input
              type="text"
              value={editFormData.flightCode}
              onChange={(e) => setEditFormData(prev => ({ ...prev, flightCode: e.target.value }))}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-navy-700 text-navy-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ej: AA123"
            />
          </div>
        </div>
        
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleCancelEdit}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancelar
          </button>
          <button
            onClick={handleSaveEditedData}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <React.Fragment>
      {createPortal(<div key="main-modal">{modalContent}</div>, document.body)}
      {editModalContent && createPortal(<div key="edit-modal">{editModalContent}</div>, document.body)}
    </React.Fragment>
  );
};

export default PDFGeneratorModal;

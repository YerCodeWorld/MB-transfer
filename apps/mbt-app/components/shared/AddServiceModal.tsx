"use client";

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ServiceInput } from '../../types/services';
import { parseServiceMessage, convertParsedToServiceInput, getExampleMessage, ParsedServiceMessage } from '../../utils/messageParser';
import { 
  BsCheckCircle, 
  BsExclamationTriangle, 
  BsClipboard,
  BsPencil,
  BsPlus
} from 'react-icons/bs';
import { 
  FaUser,
  FaClock,
  FaUsers,
  FaMapSigns,
  FaCar,
  FaTags,
  FaHashtag
} from 'react-icons/fa';

interface AddServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (service: ServiceInput & { serviceType?: 'at' | 'st' | 'mbt' }) => void;
  selectedDate: string;
}

const AddServiceModal = ({ isOpen, onClose, onSave, selectedDate }: AddServiceModalProps) => {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'message' | 'manual'>('message');
  
  // Message parser state
  const [messageText, setMessageText] = useState('');
  const [parsedData, setParsedData] = useState<ParsedServiceMessage | null>(null);
  const [parseError, setParsedError] = useState<string | null>(null);
  
  // Manual form state
  const [manualService, setManualService] = useState<Partial<ServiceInput>>({
    code: '',
    kindOf: 'DEPARTURE',
    clientName: '',
    pax: 1,
    pickupLocation: '',
    dropoffLocation: '',
    vehicleType: '',
    pickupTime: '',
    ally: 'Manual'
  });
  const [selectedCompany, setSelectedCompany] = useState<'at' | 'st' | 'mbt'>('mbt');

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

  // Parse message when messageText changes
  useEffect(() => {
    if (messageText.trim()) {
      const parsed = parseServiceMessage(messageText);
      if (parsed) {
        setParsedData(parsed);
        setParsedError(null);
      } else {
        setParsedData(null);
        setParsedError('Unable to parse message. Please check the format.');
      }
    } else {
      setParsedData(null);
      setParsedError(null);
    }
  }, [messageText]);

  const handlePasteExample = () => {
    setMessageText(getExampleMessage());
  };

  const handleSaveFromMessage = () => {
    if (parsedData) {
      const service = convertParsedToServiceInput(parsedData, selectedDate);
      onSave(service);
      handleClose();
    }
  };

  const handleSaveFromManual = () => {
    if (manualService.clientName && manualService.code && manualService.pickupTime) {
      const service = {
        id: `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        code: manualService.code!,
        kindOf: manualService.kindOf!,
        clientName: manualService.clientName!,
        pickupTime: manualService.pickupTime!,
        pax: manualService.pax || 1,
        pickupLocation: manualService.pickupLocation || '',
        dropoffLocation: manualService.dropoffLocation || '',
        vehicleType: manualService.vehicleType,
        ally: 'Manual',
        notes: `Manually created on ${new Date().toISOString()}`,
        serviceType: selectedCompany
      };
      onSave(service);
      handleClose();
    }
  };

  const handleClose = () => {
    setMessageText('');
    setParsedData(null);
    setParsedError(null);
    setManualService({
      code: '',
      kindOf: 'DEPARTURE',
      clientName: '',
      pax: 1,
      pickupLocation: '',
      dropoffLocation: '',
      vehicleType: '',
      pickupTime: '',
      ally: 'Manual'
    });
    setSelectedCompany('mbt');
    onClose();
  };

  if (!mounted || !isOpen) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 z-[10000] flex items-center backdrop-blur-sm justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div className="w-full max-w-4xl rounded-xl bg-white dark:bg-navy-800  shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-navy-700 dark:text-white">
            Añadir Nuevo Servicio
          </h2>
          <button
            onClick={handleClose}
            className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
          >
            ×
          </button>
        </div>
        
        {/* Tab Buttons */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('message')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'message'
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
            }`}
          >
            <BsClipboard />
            Parsear Mensaje
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'manual'
                ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-b-2 border-purple-600'
                : 'text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400'
            }`}
          >
            <BsPencil />
            Formulario Manual
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'message' ? (
            <div className="space-y-6">
              {/* Message Input */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Pegar Mensaje del Servicio
                  </label>
                  <button
                    onClick={handlePasteExample}
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <BsClipboard />
                    Pegar Ejemplo
                  </button>
                </div>
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  rows={10}
                  placeholder="Pega aquí el mensaje con el formato:
SALIDA
PUJ-PCAT-11692
Pedro Scala
Kia K5
2 Pax
Desde: Hotel Name
Fecha: 2025-11-10
Hora: 18:30
Hacia: Punta Cana Airport"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-navy-700 dark:border-gray-600 dark:text-white font-mono text-sm"
                />
              </div>

              {/* Parse Results */}
              {parseError && (
                <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <BsExclamationTriangle className="text-red-500 flex-shrink-0" />
                  <div>
                    <p className="text-red-700 dark:text-red-300 font-medium">Error al Parsear</p>
                    <p className="text-red-600 dark:text-red-400 text-sm">{parseError}</p>
                  </div>
                </div>
              )}

              {parsedData && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <BsCheckCircle className="text-green-500 flex-shrink-0" />
                    <div>
                      <p className="text-green-700 dark:text-green-300 font-medium">Mensaje Parseado Correctamente</p>
                      <p className="text-green-600 dark:text-green-400 text-sm">Los datos han sido extraídos del mensaje</p>
                    </div>
                  </div>

                  {/* Parsed Data Preview */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">Datos Extraídos:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <FaTags className="text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">Tipo:</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          parsedData.type === 'ARRIVAL' ? 'bg-green-100 text-green-800' :
                          parsedData.type === 'DEPARTURE' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {parsedData.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaHashtag className="text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">Código:</span>
                        <span className="font-mono">{parsedData.code}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaUser className="text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">Cliente:</span>
                        <span>{parsedData.client}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaCar className="text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">Vehículo:</span>
                        <span>{parsedData.vehicle || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaUsers className="text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">PAX:</span>
                        <span>{parsedData.pax}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaClock className="text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">Hora:</span>
                        <span>{parsedData.time}</span>
                      </div>
                      <div className="flex items-center gap-2 md:col-span-2">
                        <FaMapSigns className="text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">Desde:</span>
                        <span className="truncate">{parsedData.from}</span>
                      </div>
                      <div className="flex items-center gap-2 md:col-span-2">
                        <FaMapSigns className="text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">Hacia:</span>
                        <span className="truncate">{parsedData.to}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-4">Formulario Manual</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Service Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Código del Servicio 
                  </label>
                  <input
                    type="text"
                    value={manualService.code}
                    onChange={(e) => setManualService({ ...manualService, code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-navy-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>

                {/* Company Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Empresa 
                  </label>
                  <select
                    value={selectedCompany}
                    onChange={(e) => setSelectedCompany(e.target.value as 'at' | 'st' | 'mbt')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-navy-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="mbt">MB Transfer</option>
                    <option value="st">Sacbé Transfer</option>
                    <option value="at">Airport Transfer</option>
                  </select>
                </div>

                {/* Client Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nombre del Cliente 
                  </label>
                  <input
                    type="text"
                    value={manualService.clientName}
                    onChange={(e) => setManualService({ ...manualService, clientName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-navy-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>

                {/* Service Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tipo de Servicio
                  </label>
                  <select
                    value={manualService.kindOf}
                    onChange={(e) => setManualService({ ...manualService, kindOf: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-navy-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="ARRIVAL">LLEGADA</option>
                    <option value="DEPARTURE">SALIDA</option>
                    <option value="TRANSFER">TRASLADO</option>
                  </select>
                </div>

                {/* PAX */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    PAX
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={manualService.pax}
                    onChange={(e) => setManualService({ ...manualService, pax: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-navy-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                {/* Pickup Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Hora de Recogida 
                  </label>
                  <input
                    type="time"
                    value={manualService.pickupTime}
                    onChange={(e) => setManualService({ ...manualService, pickupTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-navy-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>

                {/* Pickup Location */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Ubicación de Recogida
                  </label>
                  <input
                    type="text"
                    value={manualService.pickupLocation}
                    onChange={(e) => setManualService({ ...manualService, pickupLocation: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-navy-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                {/* Dropoff Location */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Destino
                  </label>
                  <input
                    type="text"
                    value={manualService.dropoffLocation}
                    onChange={(e) => setManualService({ ...manualService, dropoffLocation: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:bg-navy-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancelar
          </button>
          <button
            onClick={activeTab === 'message' ? handleSaveFromMessage : handleSaveFromManual}
            disabled={
              activeTab === 'message' 
                ? !parsedData 
                : !manualService.clientName || !manualService.code || !manualService.pickupTime
            }
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg flex items-center gap-2 ${
              activeTab === 'message'
                ? 'bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400'
                : 'bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400'
            }`}
          >
            <BsPlus />
            Añadir Servicio
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default AddServiceModal;

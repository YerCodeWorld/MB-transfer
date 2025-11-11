"use client";

import { useState } from 'react';
import { ServiceInput } from '../../types/services';
import { convertIsoStringTo12h } from '../../utils/services';
import {
  FaHashtag,
  FaUser,
  FaClock,
  FaUsers,
  FaRoute,
  FaPlus,
  FaCopy,
  FaMapSigns,
  FaTags
} from "react-icons/fa";
import ServiceDetailModal from './ServiceDetailModal';

interface ServiceTableProps {
  services: ServiceInput[];
  selectedDate?: string;
  title?: string;
  subtitle?: string;
  onServiceSelect?: (service: ServiceInput) => void;
  company: 'AT' | 'MBT' | 'ST';
}

const ServiceTable = ({ 
  services, 
  selectedDate, 
  title = "Services Found",
  subtitle,
  onServiceSelect,
  company = 'AT'
}: ServiceTableProps) => {
  const [selected, setSelected] = useState<ServiceInput | null>(null);

  const kindOfElement = (kind: 'ARRIVAL' | 'DEPARTURE' | 'TRANSFER') => {
    const base =
      'px-2 py-1 rounded-full text-xs font-semibold text-white inline-block';

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
  };

  const handleServiceClick = (service: ServiceInput) => {
    setSelected(service);
    onServiceSelect?.(service);
  };

  return (
    <>
      <div className="flex-col w-full">
        {/* TOP */}
        <div className="rounded bg-white dark:bg-navy-700">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex-col">
                <div className="flex justify-between">
                  <h3 className="text-xl font-bold text-navy-700 dark:text-white">
                    {title}: {services.length}
                  </h3>
                  {selectedDate && <h2>{selectedDate}</h2>}
                </div>
                {subtitle && (
                  <small className="text-red-600 hover:text-red-200">
                    {subtitle}
                  </small>
                )}
              </div>
            </div>
          </div>
        </div>    

        {/* TABLE OF SERVICES */}
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500">
            <tr>
              <th className="px-3 py-3 text-left">
                <span className="inline-flex items-center gap-1">
                  <FaHashtag/> Código
                </span>
              </th>
              <th className="px-3 py-3 text-left">
                <span className="inline-flex items-center gap-1">
                  <FaUser/> Cliente 
                </span>
              </th>
              <th className="px-3 py-3 text-left">
                <span className="inline-flex items-center gap-1">
                  <FaClock/> Hora
                </span>
              </th>
              <th className="px-3 py-3 text-center">
                <span className="inline-flex items-center gap-1">
                  <FaUsers/> PAX
                </span>
              </th>
              <th className="px-3 py-3 text-left">
                <span className="inline-flex items-center gap-1">
                  <FaRoute/> Ruta 
                </span>
              </th>
              <th className="px-3 py-3 text-left">
                <span className="inline-flex items-center gap-1">
                  <FaTags/> Tipo
                </span>
              </th>
              <th className="px-3 py-3 text-center">Detalles</th>
            </tr>
          </thead>

          <tbody className="bg-white dark:bg-navy-700">
            {services.map((s) => (
              <tr key={s.id}>           
                <td className="px-3 py-3 font-semibold text-purple-700">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(s.code || '');
                      alert(`Copied ${s.code} to clipboard!`);
                    }}
                    className="p-1 cursor-pointer mr-2"
                  >
                    <FaCopy />
                  </button>
                  {s.code}                
                </td>
                
                <td className="px-3 py-3">{s.clientName}</td>
                
                <td className="px-3 py-3">{company === 'AT' ? convertIsoStringTo12h(s.pickupTime) : s.pickupTime}</td>
                
                <td className="px-3 py-3 text-center">{s.pax}</td>
                <td className="px-3 py-3">
                  <div className="relative group inline-block">
                    <button className="flex text-center cursor-pointer">
                        <FaMapSigns /> 
                    </button>
                    <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 
                                  mb-2 px-3 py-1 text-sm text-white bg-gray-800 
                                  rounded-md whitespace-nowrap 
                                  opacity-0 invisible group-hover:opacity-100 group-hover:visible 
                                  transition-opacity duration-300">
                      <div className="flex-col">
                        <label><strong>DESDE</strong> {s.pickupLocation}</label>
                        <hr/>
                        <label><strong>HASTA</strong> {s.dropoffLocation}</label>
                      </div>
                    </span>
                  </div>  
                </td>
                <td className="px-3 py-3">
                  {kindOfElement(s.kindOf)}
                </td>
                <td className="px-3 py-3 text-center">
                  <button
                    onClick={() => handleServiceClick(s)}
                    className="inline-flex items-center justify-center rounded-full border border-purple-500 px-2 py-1 text-xd text-purple-600 hover:bg-purple-500 hover:text-white transition "
                  >
                    <FaPlus />
                  </button>
                </td>          
              </tr>
            ))}
          </tbody>
        </table>    
      </div>

      {/* SERVICE DETAIL MODAL */}
      <ServiceDetailModal 
        service={selected} 
        onClose={() => setSelected(null)} 
      />
    </>
  );
};

export default ServiceTable;

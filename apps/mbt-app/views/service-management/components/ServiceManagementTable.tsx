import { BsEye } from "react-icons/bs";
import { FaClock, FaHashtag, FaMapSigns, FaRoute, FaTags, FaUser, FaUsers } from "react-icons/fa";
import { HiOutlineViewList } from "react-icons/hi";
import Card from "@/components/single/card";
import {
  displayTimeFromService,
  ExtendedService,
  getOffsetDisplayTime,
  getServiceTypeColors,
  getServiceTypeLabel,
  SortField,
} from "../utils/serviceManagement";

interface ServiceManagementTableProps {
  allServicesCount: number;
  filteredServices: ExtendedService[];
  selectedDate: string;
  handleSort: (field: SortField) => void;
  handleViewService: (service: ExtendedService) => void;
}

const kindOfElement = (kind: "ARRIVAL" | "DEPARTURE" | "TRANSFER") => {
  const base = "inline-block rounded-full px-2 py-1 text-xs font-semibold text-white";

  switch (kind) {
    case "ARRIVAL":
      return <span className={`${base} bg-green-500`}>LLEGADA</span>;
    case "DEPARTURE":
      return <span className={`${base} bg-blue-500`}>SALIDA</span>;
    case "TRANSFER":
      return <span className={`${base} bg-yellow-500 text-black`}>TRANSFERENCIA</span>;
    default:
      return <span className={`${base} bg-gray-400`}>DESCONOCIDO</span>;
  }
};

export default function ServiceManagementTable({
  allServicesCount,
  filteredServices,
  selectedDate,
  handleSort,
  handleViewService,
}: ServiceManagementTableProps) {
  return (
    <Card extra="w-full">
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-bold text-navy-700 dark:text-white">
            Todos los Servicios ({filteredServices.length})
          </h3>
        </div>

        {filteredServices.length === 0 ? (
          <div className="py-12 text-center">
            <HiOutlineViewList className="mx-auto mb-4 text-6xl text-gray-400" />
            <h4 className="mb-2 text-lg font-semibold text-navy-700 dark:text-white">
              No se encontraron servicios
            </h4>
            <p className="text-gray-600 dark:text-gray-300">
              {allServicesCount === 0
                ? "No services have been cached yet. Use the individual service sections to add services."
                : "No services match your current filters. Try adjusting the search criteria."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="w-16 px-4 py-3 text-center">
                    <span className="text-xs font-semibold uppercase text-gray-500">No.</span>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort("code")}
                      className="flex items-center gap-1 text-xs font-semibold uppercase text-gray-500 hover:text-blue-600"
                    >
                      <FaHashtag /> Código
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort("client")}
                      className="flex items-center gap-1 text-xs font-semibold uppercase text-gray-500 hover:text-blue-600"
                    >
                      <FaUser /> Cliente
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort("time")}
                      className="flex items-center gap-1 text-xs font-semibold uppercase text-gray-500 hover:text-blue-600"
                    >
                      <FaClock /> Hora
                    </button>
                  </th>
                  <th className="px-4 py-3 text-center">
                    <span className="flex items-center justify-center gap-1 text-xs font-semibold uppercase text-gray-500">
                      <FaUsers /> PAX
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <span className="flex items-center gap-1 text-xs font-semibold uppercase text-gray-500">
                      <FaRoute /> Ruta
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort("type")}
                      className="flex items-center gap-1 text-xs font-semibold uppercase text-gray-500 hover:text-blue-600"
                    >
                      <FaTags /> Tipo
                    </button>
                  </th>
                  <th className="px-4 py-3 text-center">
                    <span className="text-xs font-semibold uppercase text-gray-500">Detalle</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredServices.map((service, index) => {
                  const colors = getServiceTypeColors(service.serviceType);
                  const baseTime = displayTimeFromService(service.pickupTime, selectedDate);
                  const visibleTime =
                    service.kindOf === "DEPARTURE"
                      ? getOffsetDisplayTime(baseTime, -15)
                      : baseTime;

                  return (
                    <tr
                      key={service.code}
                      className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 ${colors.bg} ${colors.border}`}
                    >
                      <td className="px-4 py-4 text-center">
                        <span
                          className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${colors.badge}`}
                        >
                          {index + 1}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col">
                          <span className={`font-medium ${colors.text}`}>{service.code}</span>
                          <span className="text-xs text-gray-500">
                            {getServiceTypeLabel(service.serviceType)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-medium text-navy-700 dark:text-white">
                          {service.clientName}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-gray-900 dark:text-gray-100">
                          {visibleTime}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                          {service.pax}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="group relative">
                          <button className="text-gray-500 hover:text-blue-600">
                            <FaMapSigns />
                          </button>
                          <div className="invisible absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 transform whitespace-nowrap rounded-md bg-gray-800 px-3 py-2 text-sm text-white opacity-0 transition-opacity duration-300 group-hover:visible group-hover:opacity-100">
                            <div className="space-y-1">
                              <div><strong>DESDE:</strong> {service.pickupLocation}</div>
                              <div><strong>HASTA:</strong> {service.dropoffLocation}</div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">{kindOfElement(service.kindOf)}</td>
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => handleViewService(service)}
                          className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100 dark:border-blue-800/50 dark:bg-blue-900/20 dark:text-blue-200 dark:hover:bg-blue-900/30"
                          title="Ver detalle de servicio"
                        >
                          <BsEye />
                          Detalle
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Card>
  );
}

import AddServiceModal from "../modals/AddServiceModal";
import FlightComparisonModal from "../modals/FlightComparisonModal";
import HoursVisualizationModal, { ServiceHoursRow } from "../modals/HoursVisualizationModal";
import PDFGeneratorModal from "../modals/PDFGeneratorModal";
import ServiceDetailModal from "@/components/shared/ServiceDetailModal";
import { ServiceInput } from "@/types/services";
import { ExtendedService } from "../utils/serviceManagement";

interface ServiceManagementDialogsProps {
  detailService: ExtendedService | null;
  setDetailService: (service: ExtendedService | null) => void;
  showFlightComparison: boolean;
  setShowFlightComparison: (value: boolean) => void;
  showAddService: boolean;
  setShowAddService: (value: boolean) => void;
  showPDFGenerator: boolean;
  setShowPDFGenerator: (value: boolean) => void;
  showHoursVisualization: boolean;
  setShowHoursVisualization: (value: boolean) => void;
  filteredServices: ExtendedService[];
  selectedDate: string;
  hoursRows: ServiceHoursRow[];
  handleViewEditFromDetail: (service: ExtendedService) => void;
  handleRemoveFromDetail: (service: ExtendedService) => void;
  handleFlightTimeUpdate: (serviceId: string, formattedTime: string) => Promise<void>;
  handleAddService: (service: ServiceInput & { serviceType?: "at" | "st" | "mbt" }) => Promise<boolean>;
  handlePDFServiceUpdate: (serviceCode: string, updatedService: ExtendedService) => Promise<void>;
  markAsChecked: (serviceId: string, checked: boolean) => Promise<void>;
}

export default function ServiceManagementDialogs({
  detailService,
  setDetailService,
  showFlightComparison,
  setShowFlightComparison,
  showAddService,
  setShowAddService,
  showPDFGenerator,
  setShowPDFGenerator,
  showHoursVisualization,
  setShowHoursVisualization,
  filteredServices,
  selectedDate,
  hoursRows,
  handleViewEditFromDetail,
  handleRemoveFromDetail,
  handleFlightTimeUpdate,
  handleAddService,
  handlePDFServiceUpdate,
  markAsChecked,
}: ServiceManagementDialogsProps) {
  return (
    <>
      <ServiceDetailModal
        service={detailService}
        onClose={() => setDetailService(null)}
        onEdit={() => {
          if (!detailService) return;
          handleViewEditFromDetail(detailService);
          setDetailService(null);
        }}
        onRemove={() => {
          if (!detailService) return;
          handleRemoveFromDetail(detailService);
          setDetailService(null);
        }}
      />

      <FlightComparisonModal
        isOpen={showFlightComparison}
        onClose={() => setShowFlightComparison(false)}
        services={filteredServices}
        selectedDate={selectedDate}
        onUpdateServiceTime={handleFlightTimeUpdate}
      />

      <AddServiceModal
        isOpen={showAddService}
        onClose={() => setShowAddService(false)}
        onSave={handleAddService}
        selectedDate={selectedDate}
      />

      <PDFGeneratorModal
        isOpen={showPDFGenerator}
        onClose={() => setShowPDFGenerator(false)}
        services={filteredServices}
        selectedDate={selectedDate}
        onServiceUpdate={handlePDFServiceUpdate}
	markServicePDFAsChecked={markAsChecked}
      />

      <HoursVisualizationModal
        isOpen={showHoursVisualization}
        onClose={() => setShowHoursVisualization(false)}
        rows={hoursRows}
      />
    </>
  );
}

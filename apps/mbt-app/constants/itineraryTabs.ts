import { BsEye } from "react-icons/bs";
import { FaCog, FaWhatsapp, FaRegStickyNote } from "react-icons/fa";

export interface ItineraryTab {
  key: 'itinerary' | 'webhooks' | 'notes' | 'settings';
  label: string;
  Icon: any;
}

export const itineraryTabs: ItineraryTab[] = [
  {
    key: "itinerary",
    label: "Itinerario",
    Icon: BsEye,
  },
  {
    key: "webhooks",
    label: "Webhooks", 
    Icon: FaWhatsapp,
  },
  {
    key: "notes",
    label: "Notes",
    Icon: FaRegStickyNote,
  },
  {
    key: "settings",
    label: "Configuración",
    Icon: FaCog,
  }
];

export const getTabActions = (activeTab: string) => {
  return itineraryTabs.map(tab => ({
    key: tab.key,
    label: tab.label,
    Icon: tab.Icon,
    variant: activeTab === tab.key ? "primary" : "secondary",
    onClick: () => {} // This will be overridden in the component
  }));
};
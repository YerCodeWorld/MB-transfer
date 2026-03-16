import { ServiceInput } from "@/types/services";
import { convertIsoStringTo12h, convertTo24Hour } from "@/utils/services";
import { SERVICE_TYPE_LABELS, SERVICE_TYPE_THEMES } from "@/constants/allServicesOptions";

export type ServiceStatus = "pending" | "assigned" | "in-progress" | "completed" | "cancelled";
export type SortField = "time" | "client" | "type" | "status" | "code";
export type SortDirection = "asc" | "desc";

export interface ExtendedService extends ServiceInput {
  serviceType: "at" | "st" | "mbt";
  status: ServiceStatus;
  assignedDriver?: string;
  assignedVehicle?: string;
  originalPickupTime?: string | null;
  pickupTimeModifiedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export type ServiceNoteLike = {
  title?: string;
  content?: string;
  caption?: string;
};

export type VehicleOption = {
  id: string;
  name: string;
  paxCapacity?: number;
};

export const mapAllyToServiceType = (
  allyName?: string,
  code?: string
): "at" | "st" | "mbt" => {
  const normalizedAlly = (allyName || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "");
  const normalizedCode = (code || "").trim().toUpperCase();

  if (normalizedAlly.includes("airporttransfer") || normalizedAlly.includes("airport")) return "at";
  if (normalizedAlly.includes("sacbe")) return "st";
  if (normalizedAlly.includes("mbtransfer") || normalizedAlly === "mbt") return "mbt";

  if (normalizedCode.startsWith("AT")) return "at";
  if (normalizedCode.startsWith("ST")) return "st";
  if (normalizedCode.startsWith("MBT")) return "mbt";

  return "mbt";
};

export const isIsoLikeDateTime = (value?: string) =>
  typeof value === "string" && (/^\d{4}-\d{2}-\d{2}[T\s]/.test(value) || value.endsWith("Z"));

export const toTimeInputValue = (value?: string): string => {
  const input = String(value || "").trim();
  if (!input) return "";

  if (isIsoLikeDateTime(input)) {
    const isoMatch = input.match(/[T\s](\d{2}):(\d{2})/);
    if (isoMatch) return `${isoMatch[1]}:${isoMatch[2]}`;
  }

  if (/^\d{1,2}:\d{2}\s*(AM|PM)$/i.test(input)) {
    return convertTo24Hour(input);
  }

  if (/^\d{1,2}:\d{2}$/.test(input)) {
    const [h, m] = input.split(":");
    return `${h.padStart(2, "0")}:${m}`;
  }

  return "";
};

export const displayTimeFromService = (value: string | undefined, selectedDate: string): string => {
  if (!value) return "";
  const input = String(value).trim();
  if (!input) return "";

  if (isIsoLikeDateTime(input)) {
    return convertIsoStringTo12h(input);
  }

  if (/^\d{1,2}:\d{2}\s*(AM|PM)$/i.test(input)) {
    return input.toUpperCase().replace(/\s+/g, " ");
  }

  if (/^\d{1,2}:\d{2}$/.test(input)) {
    return convertIsoStringTo12h(`${selectedDate}T${input.padStart(5, "0")}:00.000Z`);
  }

  return input;
};

export const displayTimeToMinutes = (displayTime: string): number | null => {
  const value = String(displayTime || "").trim();
  if (!value) return null;

  const ampm = value.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (ampm) {
    let hours = Number(ampm[1]);
    const minutes = Number(ampm[2]);
    const period = ampm[3].toUpperCase();
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    return hours * 60 + minutes;
  }

  const hhmm = value.match(/^(\d{1,2}):(\d{2})$/);
  if (hhmm) {
    return Number(hhmm[1]) * 60 + Number(hhmm[2]);
  }

  return null;
};

export const minutesTo12h = (minutes: number): string => {
  const normalized = ((minutes % 1440) + 1440) % 1440;
  const hours24 = Math.floor(normalized / 60);
  const mins = normalized % 60;
  const period = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 || 12;
  return `${hours12}:${String(mins).padStart(2, "0")} ${period}`;
};

export const getOffsetDisplayTime = (displayTime: string, offsetMinutes: number): string => {
  const baseMinutes = displayTimeToMinutes(displayTime);
  if (baseMinutes === null) return displayTime;
  return minutesTo12h(baseMinutes + offsetMinutes);
};

export const getCompanyName = (serviceType: string) => {
  switch (serviceType) {
    case "at":
      return "Airport Transfer";
    case "st":
      return "Sacbé Transfer";
    case "mbt":
      return "MB Transfer";
    default:
      return serviceType.toUpperCase();
  }
};

export const normalizeOptionalString = (value: unknown): string | undefined => {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
};

export const normalizeOptionalNumber = (value: unknown): number | undefined => {
  if (typeof value !== "number" || Number.isNaN(value)) return undefined;
  return value;
};

export const normalizeNotesForUpdate = (value: unknown): string | undefined => {
  if (typeof value === "string") return normalizeOptionalString(value);
  if (!Array.isArray(value)) return undefined;

  const notesText = value
    .map((note) => {
      if (!note || typeof note !== "object") return "";
      const item = note as ServiceNoteLike;
      return [item.title, item.content, item.caption]
        .filter((part): part is string => typeof part === "string" && part.trim().length > 0)
        .join(" - ")
        .trim();
    })
    .filter(Boolean)
    .join(" | ");

  return normalizeOptionalString(notesText);
};

export const normalizeNotesForEditor = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (!Array.isArray(value)) return "";

  return value
    .map((note) => {
      if (!note || typeof note !== "object") return "";
      const item = note as ServiceNoteLike;
      if (typeof item.content === "string" && item.content.trim().length > 0) {
        return item.content.trim();
      }
      return [item.title, item.caption]
        .filter((part): part is string => typeof part === "string" && part.trim().length > 0)
        .join(" - ")
        .trim();
    })
    .filter(Boolean)
    .join("\n");
};

export const getServiceTypeLabel = (serviceType: string) =>
  SERVICE_TYPE_LABELS[serviceType] || serviceType;

export const getServiceTypeColors = (serviceType: string) =>
  SERVICE_TYPE_THEMES[serviceType] || SERVICE_TYPE_THEMES.default;

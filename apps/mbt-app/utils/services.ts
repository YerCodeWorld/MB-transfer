import { Service, FlightInfo, ServiceInput } from '../types/services';
import { toYMDLocal } from './dateUtils';

// get 17:00 | return 05:00 pm
export function convertTo12Hour(time24: string): string {
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

// I believe we are not using this 
// get 05:00 pm | return 17:00
export function convertTo24Hour(time12: string): string {
  if (!time12) return "";

  // Normalize input like "3:45pm", "3:45 pm", "03:45 PM"
  const normalized = time12.trim().toUpperCase().replace(/\s+/g, " ");

  const [time, period] = normalized.split(" ");
  if (!time || !period) return "";

  const [hStr, mStr] = time.split(":");
  if (!hStr || !mStr) return "";

  let hours = Number(hStr);
  const minutes = Number(mStr);

  if (period === "PM" && hours !== 12) {
    hours += 12;
  } else if (period === "AM" && hours === 12) {
    hours = 0;
  }

  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}


// Needed for AT API response, where this is how the time is displayed 
export function convertIsoStringTo12h(isoString) {
  const [datePart, timePart] = isoString.replace("Z", "").split("T");
  const [year, month, day] = datePart.split("-").map(Number);

	if (!timePart) return;

  // Take only hours/minutes and ignore timezone shifting
  const [h, m] = timePart.split(":").map(Number);

  const date = new Date(year, month - 1, day, h, m);

  return date.toLocaleString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });
}

export function time12ToMinutes(time12: string): number {
  console.log(time12);
  const [time, rawPeriod] = time12.trim().split(/\s+/); // "9:12", "AM"
  const [hStr, mStr] = time.split(":");

  if (!rawPeriod) return 0;
  
  let hours = Number(hStr);
  const minutes = Number(mStr);
  const period = rawPeriod.toUpperCase();

  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;

  return hours * 60 + minutes;
}


// Fetch flight times via API route (server-side to avoid CORS)
export async function fetchFlightTimes(flightCodes: string[], date: string): Promise<FlightInfo[]> {
  try {
    const response = await fetch('/api/flight-times', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        flightCodes,
        date
      })
    });

    if (!response.ok) {
      console.error(`API request failed: ${response.status}`);
      return;
    }

    const results = await response.json();
    return results;
  } catch (error) {
    console.error('Error fetching flight times:', error);
    return flightCodes.map(code => ({ code, error: 'Failed to fetch flight data' }));
  }
}

// TODO
// USE ENV VARIABLES FOR BOTH headers and URL 
// Fetch AirportTransfer data
export async function fetchAtData(date?: string): Promise<{ bookings: any[], date: string } | null> {

  // default 
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const yyyyMmDd = toYMDLocal(tomorrow);  

  const url = `https://api.airporttransfer.com/api/bookings?filters%5Bselected_date%5D=${date ?? yyyyMmDd}&pag`;

  const headers = {
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*",
    "Origin": "https://airporttransfer.com",
    "Referer": "https://airporttransfer.com/",
    "Authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiMjNiOWZjNmI4MzhhNTVkYjJlY2YyZWVhNDFmNzE0NTQ0ZGYzYzViMjdkZjRkMGIwMzZiNDA0ZTVhOGUwZGViM2E1ODk4ODM1YTg5YTQ0NWUiLCJpYXQiOjE3NDQwNzk3MTQuNDk3MzAyLCJuYmYiOjE3NDQwNzk3MTQuNDk3MzA0LCJleHAiOjE3NzU2MTU3MTQuNDg3OTk5LCJzdWIiOiIyODk0Iiwic2NvcGVzIjpbXX0.JEvYlv7aYr19Nv2XBgsXyKYINAFQs1RJ3VRUL0c2tKgkAv78Ld4DB6wbzqGrUEiZKVYaPmNebLCkOnzSiFSZ_Gml5IFZe8mQYBLzO5B90r6d3bdd1Emo9XV_31xrvzqBokmG3aznCc3dsnhHNiyz6l_1SW8vqmMddP1nstPD2Vvz-4YGlLs4qKKqhWHimY1tvcxtWLaQ4yo0uBRy5N9dE9RbZMI2MG1RGtG1XYbL3Galex4H1mdrr2jGSWuvVzfEsJ-8OC9ElziD_abW7QnceRkZhqsp0SN9G-iQTV7sri4XWCpVp0LbamNTvtvN16buflphtWSpxeSH6HDPh6ZTdI8rRsMpD8evH_fLoh6zSeZXrGNLXUsHRdITVTeufYFVtf0sLcsRDuzVOALon-UrCLrSEpAcEBE4PL1BsisRlH5ZSDlG_L_RLJEQ1COT1ACWLClgVjWldk7SrKbtHbjExsyJs5eNYRz2_TyW0vGfzSp4nUJUaI96cDVtnJPLpzv5jDRDZdYPtzKgczbO8Ag3zKAkO127I4qqWOwCxepqhQ-wW1jCjtNzlXyzimiM3ulVAlgKOrOKqp7DZ3Odqo3wqJsBrLmDODWm1SBrN1WW-MBm9SitDEzTtj7C6ZYrpHBYAwgVZJFha0iblwDfEn9h56qYaOINlhplVmAMdeVRV3I"
  };

  try {
    const res = await fetch(url, { headers });    
    if (!res.ok) throw new Error("Request failed");
    const data = await res.json();        
    return { bookings: data, date: yyyyMmDd };
  } catch (err) {
    console.error("❌ Error:", err);
    return null;
  }
}

// Extract services from AirportTransfer data
export function extractAtServices(bookings: any[], targetDateStr: string): ServiceInput[] {
  const targetDate = new Date(targetDateStr);

  function determineType(reservation: any): 'ARRIVAL' | 'DEPARTURE' | 'TRANSFER' {
    const pickup = reservation.pickup_location?.name || "";
    const dropoff = reservation.drop_of_location?.name || "";
    const returnDateStr = reservation.travel?.return;

    if (returnDateStr) {
      const returnDate = new Date(returnDateStr.split("T")[0]);
      if (returnDate.toDateString() === targetDate.toDateString()) {
        return "DEPARTURE";
      }
    }

    if (pickup.includes("Airport")) return "ARRIVAL";
    if (dropoff.includes("Airport")) return "DEPARTURE";
    return "TRANSFER";
  }

  return bookings.map(res => {
    const pax = (res.travelers?.adult || 0) + (res.travelers?.children || 0) + (res.travelers?.infant || 0);
    return {
      code: res.reservation_no,
      kindOf: determineType(res),
      clientName: `${res.passenger?.name || ""} ${res.passenger?.surname || ""}`.trim(),
      flightCode: res.travel?.flight_number || undefined,
      pickupTime: res.travel?.flight_arrival || new Date().toISOString(),
      pax,
      pickupLocation: res.pickup_location?.name || "",
      dropoffLocation: res.drop_of_location?.name || "",
      ally: "AirportTransfer"
    };
  });
}

// Detect edge cases in services
export function detectEdgeCases(services: Service[]): Array<{type: string, message: string, serviceId: string}> {
  const edgeCases: Array<{type: string, message: string, serviceId: string}> = [];

  services.forEach(service => {
    // Check if arrival service missing flight code
    if (service.kindOf === 'ARRIVAL' && !service.flightCode) {
      edgeCases.push({
        type: 'MISSING_FLIGHT_CODE',
        message: `Arrival service "${service.clientName}" is missing flight code`,
        serviceId: service.id
      });
    }

    // Check for duplicate booking codes
    const duplicates = services.filter(s => s.code === service.code && s.id !== service.id);
    if (duplicates.length > 0) {
      edgeCases.push({
        type: 'DUPLICATE_BOOKING',
        message: `Duplicate booking code "${service.code}" found`,
        serviceId: service.id
      });
    }

    // Check for missing driver assignment
    if (!service.driver) {
      edgeCases.push({
        type: 'MISSING_DRIVER',
        message: `Service "${service.clientName}" has no driver assigned`,
        serviceId: service.id
      });
    }

    // Check if time needs conversion (contains 24h format patterns)
    if (service.pickupTime.includes(':') && !service.pickupTime.includes('AM') && !service.pickupTime.includes('PM')) {
      edgeCases.push({
        type: 'TIME_CONVERSION_NEEDED',
        message: `Service "${service.clientName}" time needs 12h conversion`,
        serviceId: service.id
      });
    }
  });

  return edgeCases;
}

// Mock data for development
export const mockServices: Service[] = [
  {
    id: "srv_1",
    code: "AT001",
    kindOf: "ARRIVAL",
    state: "UPCOMING",
    clientName: "John Smith",
    pickupTime: "2024-11-05T10:30:00Z",
    flightCode: "AA2641",
    pax: 2,
    luggage: 3,
    ally: { id: "ally_at", name: "AirportTransfer" },
    pickup: { id: "place_puj", name: "Punta Cana Airport", kind: "AIRPORT" },
    dropoff: { id: "place_hotel1", name: "Hard Rock Hotel", kind: "HOTEL" },
    route: { id: "route_1", name: "PUJ → Hard Rock", price: 45, currency: "USD" },
    price: 45,
    currency: "USD",
    createdAt: "2024-11-04T08:00:00Z",
    updatedAt: "2024-11-04T08:00:00Z"
  },
  {
    id: "srv_2",
    code: "ST001",
    kindOf: "DEPARTURE",
    state: "UPCOMING",
    clientName: "Maria Garcia",
    pickupTime: "2024-11-05T14:15:00Z",
    flightCode: "F906",
    pax: 4,
    luggage: 6,
    ally: { id: "ally_st", name: "Sacbé Transfer" },
    pickup: { id: "place_hotel2", name: "Dreams Resort", kind: "HOTEL" },
    dropoff: { id: "place_puj", name: "Punta Cana Airport", kind: "AIRPORT" },
    route: { id: "route_2", name: "Dreams → PUJ", price: 40, currency: "USD" },
    price: 40,
    currency: "USD",
    driver: { id: "driver_1", name: "Carlos Mendez" },
    vehicle: { id: "vehicle_1", name: "Toyota Hiace", capacity: 12 },
    createdAt: "2024-11-04T09:00:00Z",
    updatedAt: "2024-11-04T09:00:00Z"
  },
  {
    id: "srv_3",
    code: "MBT001",
    kindOf: "TRANSFER",
    state: "ONGOING",
    clientName: "David Wilson",
    pickupTime: "2024-11-05T16:00:00Z",
    pax: 2,
    luggage: 2,
    pickup: { id: "place_hotel3", name: "Barceló Resort", kind: "HOTEL" },
    dropoff: { id: "place_hotel4", name: "Iberostar Resort", kind: "HOTEL" },
    route: { id: "route_3", name: "Barceló → Iberostar", price: 35, currency: "USD" },
    price: 35,
    currency: "USD",
    driver: { id: "driver_2", name: "Luis Rodriguez" },
    vehicle: { id: "vehicle_2", name: "Mercedes Sprinter", capacity: 16 },
    createdAt: "2024-11-04T10:00:00Z",
    updatedAt: "2024-11-04T12:00:00Z"
  }
];

export const mockDrivers = [
  { id: "driver_1", name: "Carlos Mendez" },
  { id: "driver_2", name: "Luis Rodriguez" },
  { id: "driver_3", name: "Miguel Torres" },
  { id: "driver_4", name: "Jose Martinez" }
];

export const mockVehicles = [
  { id: "vehicle_1", name: "Toyota Hiace", capacity: 12 },
  { id: "vehicle_2", name: "Mercedes Sprinter", capacity: 16 },
  { id: "vehicle_3", name: "Hyundai H1", capacity: 8 },
  { id: "vehicle_4", name: "Ford Transit", capacity: 14 }
];

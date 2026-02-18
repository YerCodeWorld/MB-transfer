export interface Service {
  id: string;
  code?: string;
  kindOf: 'ARRIVAL' | 'DEPARTURE' | 'TRANSFER';
  state: 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELED' | 'REFUNDED';
  clientName: string;
  pickupTime: string;
  flightCode?: string;
  pax: number;
  luggage?: number;
  driverId?: string;
  vehicleId?: string;
  allyId?: string;
  pickupId: string;
  dropoffId: string;
  routeId?: string;
  driver?: {
    id: string;
    name: string;
    photo?: string;
  };
  vehicle?: {
    id: string;
    name: string;
    paxCapacity: number;
    luggageCapacity: number;
    state?: string;
  };
  ally?: {
    id: string;
    name: string;
    website?: string;
    logo?: string;
  };
  pickup: {
    id: string;
    name: string;
    kind: 'AIRPORT' | 'HOTEL' | 'OTHER';
    latitude?: number;
    longitude?: number;
    zone?: {
      id: string;
      name: string;
    };
  };
  dropoff: {
    id: string;
    name: string;
    kind: 'AIRPORT' | 'HOTEL' | 'OTHER';
    latitude?: number;
    longitude?: number;
    zone?: {
      id: string;
      name: string;
    };
  };
  route?: {
    id: string;
    name: string;
    fromId: string;
    toId: string;
  };
  price?: number;
  currency?: 'DOP' | 'USD' | 'EUR';
  flierUrl?: string;
  itineraryId?: string;
  itinerary?: {
    id: string;
    date: string;
  };
  notes?: Array<{
    id: string;
    title: string;
    content: string;
    caption?: string;
    tag?: 'EMERGENCY' | 'IMPORTANT' | 'REMINDER' | 'MINOR' | 'IDEA' | 'SUGGESTION';
  }>;
  pdfProfile?: {
    id: string;
    clientName?: string | null;
    hotelName?: string | null;
    pax?: number | null;
    time?: string | null;
    flightCode?: string | null;
    serviceId: string;
    createdAt?: string;
    updatedAt?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Itinerary {
  id: string;
  date: string;
  sorted: boolean;
  flightsChecked: boolean;
  timesConverted: boolean;
  edgeCases: boolean;
  services?: Service[];
  notes?: Note[];
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  title: string;
  caption?: string;
  content: string;
  tag?: 'EMERGENCY' | 'IMPORTANT' | 'REMINDER' | 'MINOR' | 'IDEA' | 'SUGGESTION';
  serviceId?: string;
  itineraryId?: string;
  vehicleId?: string;
  placeId?: string;
  routeId?: string;
  allyId?: string;
  budgetId?: string;
  employeeId?: string;
  transactionId?: string;
  spendingId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FlightInfo {
  code: string;
  departure_airport?: string;
  arrival_airport?: string;
  scheduled_out?: string;
  scheduled_in?: string;
  status?: string;
  error?: string;
  message?: string;
}

export interface ServiceInput {
  id?: string;
  code?: string;
  kindOf: 'ARRIVAL' | 'DEPARTURE' | 'TRANSFER';
  clientName: string;
  pickupTime: string;
  flightCode?: string;
  pax: number;
  luggage?: number;
  pickupLocation: string;
  dropoffLocation: string;
  notes?: string;
  ally?: string;
  vehicleType?: string;
  assignedDriver?: string;
  assignedVehicle?: string;
  pdfData?: {
    clientName?: string;
    hotel?: string;
    pax?: number;
    time?: string;
    flightCode?: string;
  };
}

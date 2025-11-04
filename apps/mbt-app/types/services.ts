export interface Service {
  id: string;
  code: string;
  kindOf: 'ARRIVAL' | 'DEPARTURE' | 'TRANSFER';
  state: 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELED' | 'REFUNDED';
  clientName: string;
  pickupTime: string;
  flightCode?: string;
  pax: number;
  luggage?: number;
  driver?: {
    id: string;
    name: string;
  };
  vehicle?: {
    id: string;
    name: string;
    capacity: number;
  };
  ally?: {
    id: string;
    name: string;
  };
  pickup: {
    id: string;
    name: string;
    kind: 'AIRPORT' | 'HOTEL' | 'OTHER';
  };
  dropoff: {
    id: string;
    name: string;
    kind: 'AIRPORT' | 'HOTEL' | 'OTHER';
  };
  route?: {
    id: string;
    name: string;
    price: number;
    currency: 'DOP' | 'USD' | 'EUR';
  };
  price?: number;
  currency?: 'DOP' | 'USD' | 'EUR';
  flierUrl?: string;
  notes?: Array<{
    id: string;
    title: string;
    content: string;
    tag?: 'EMERGENCY' | 'IMPORTANT' | 'REMINDER' | 'MINOR' | 'IDEA' | 'SUGGESTION';
  }>;
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
}
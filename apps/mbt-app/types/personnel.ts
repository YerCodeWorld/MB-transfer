// Types for Personnel management section

export type AllyType = 'INDIVIDUAL' | 'COMPANY';
export type AllyStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface Ally {
  id: string;
  name: string;
  type: AllyType;
  email: string | null;
  phone: string | null;
  identification: string | null; // RNC for companies, ID for individuals
  address: string | null;
  status: AllyStatus;
  vehiclesCount: number;
  contactPerson?: string; // For companies
  notes?: string;
  createdAt: string;
}

export type VehicleType = 'CAR' | 'TRUCK' | 'VAN' | 'MOTORCYCLE';
export type VehicleStatus = 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE' | 'RETIRED';

export interface Vehicle {
  id: string;
  type: VehicleType;
  plate: string;
  brand: string;
  model: string;
  year: number;
  color: string | null;
  status: VehicleStatus;
  assignedDriverId: string | null;
  assignedDriverName: string | null;
  allyId: string | null;
  allyName: string | null;
  mileage: number | null;
  lastMaintenance: string | null;
  notes?: string;
  photo: string | null;
}

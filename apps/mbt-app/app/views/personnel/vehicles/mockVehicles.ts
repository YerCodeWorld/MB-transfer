import { Vehicle } from '@/types/personnel';

export const mockVehicles: Vehicle[] = [
  {
    id: '1',
    type: 'TRUCK',
    plate: 'A123456',
    brand: 'Isuzu',
    model: 'NPR',
    year: 2022,
    color: 'Blanco',
    status: 'ACTIVE',
    assignedDriverId: '5',
    assignedDriverName: 'Juan Pérez',
    allyId: null,
    allyName: null,
    mileage: 45000,
    lastMaintenance: '2026-01-15T09:00:00Z',
    notes: 'Camión de carga mediana',
    photo: null,
  },
  {
    id: '2',
    type: 'VAN',
    plate: 'B234567',
    brand: 'Toyota',
    model: 'Hiace',
    year: 2021,
    color: 'Gris',
    status: 'ACTIVE',
    assignedDriverId: null,
    assignedDriverName: null,
    allyId: '1',
    allyName: 'Transportes Del Caribe',
    mileage: 78000,
    lastMaintenance: '2025-12-20T10:30:00Z',
    notes: 'Van de pasajeros - 14 asientos',
    photo: null,
  },
  {
    id: '3',
    type: 'CAR',
    plate: 'C345678',
    brand: 'Honda',
    model: 'Civic',
    year: 2023,
    color: 'Negro',
    status: 'ACTIVE',
    assignedDriverId: '3',
    assignedDriverName: 'Carlos Rodríguez',
    allyId: null,
    allyName: null,
    mileage: 12000,
    lastMaintenance: '2026-01-10T14:00:00Z',
    notes: 'Vehículo ejecutivo',
    photo: null,
  },
  {
    id: '4',
    type: 'TRUCK',
    plate: 'D456789',
    brand: 'Mitsubishi',
    model: 'Canter',
    year: 2020,
    color: 'Azul',
    status: 'MAINTENANCE',
    assignedDriverId: null,
    assignedDriverName: null,
    allyId: '2',
    allyName: 'Logística Express RD',
    mileage: 125000,
    lastMaintenance: '2026-01-25T08:00:00Z',
    notes: 'En mantenimiento preventivo - Cambio de motor',
    photo: null,
  },
  {
    id: '5',
    type: 'MOTORCYCLE',
    plate: 'M567890',
    brand: 'Yamaha',
    model: 'FZ150',
    year: 2022,
    color: 'Rojo',
    status: 'ACTIVE',
    assignedDriverId: null,
    assignedDriverName: null,
    allyId: '3',
    allyName: 'Pedro Antonio García',
    mileage: 18000,
    lastMaintenance: '2026-01-05T11:00:00Z',
    notes: 'Mensajería rápida',
    photo: null,
  },
  {
    id: '6',
    type: 'VAN',
    plate: 'E678901',
    brand: 'Nissan',
    model: 'Urvan',
    year: 2019,
    color: 'Blanco',
    status: 'ACTIVE',
    assignedDriverId: null,
    assignedDriverName: null,
    allyId: '6',
    allyName: 'FleetPro Dominicana',
    mileage: 145000,
    lastMaintenance: '2025-11-30T09:30:00Z',
    notes: 'Transporte turístico',
    photo: null,
  },
  {
    id: '7',
    type: 'TRUCK',
    plate: 'F789012',
    brand: 'Hino',
    model: '300 Series',
    year: 2018,
    color: 'Blanco',
    status: 'INACTIVE',
    assignedDriverId: null,
    assignedDriverName: null,
    allyId: null,
    allyName: null,
    mileage: 210000,
    lastMaintenance: '2025-08-15T10:00:00Z',
    notes: 'Fuera de servicio - Evaluar si reparar o dar de baja',
    photo: null,
  },
  {
    id: '8',
    type: 'CAR',
    plate: 'G890123',
    brand: 'Kia',
    model: 'Rio',
    year: 2021,
    color: 'Plateado',
    status: 'ACTIVE',
    assignedDriverId: '4',
    assignedDriverName: 'Ana Martínez',
    allyId: null,
    allyName: null,
    mileage: 55000,
    lastMaintenance: '2026-01-12T13:00:00Z',
    notes: 'Vehículo de coordinación',
    photo: null,
  },
  {
    id: '9',
    type: 'VAN',
    plate: 'H901234',
    brand: 'Ford',
    model: 'Transit',
    year: 2023,
    color: 'Azul oscuro',
    status: 'ACTIVE',
    assignedDriverId: null,
    assignedDriverName: null,
    allyId: '1',
    allyName: 'Transportes Del Caribe',
    mileage: 8000,
    lastMaintenance: '2026-01-20T08:30:00Z',
    notes: 'Vehículo nuevo - Carga y pasajeros',
    photo: null,
  },
  {
    id: '10',
    type: 'TRUCK',
    plate: 'I012345',
    brand: 'Isuzu',
    model: 'FTR',
    year: 2017,
    color: 'Blanco',
    status: 'RETIRED',
    assignedDriverId: null,
    assignedDriverName: null,
    allyId: null,
    allyName: null,
    mileage: 285000,
    lastMaintenance: '2024-12-10T09:00:00Z',
    notes: 'Dado de baja - Vendido',
    photo: null,
  },
];

// In-memory storage for mock CRUD operations
let vehiclesData = [...mockVehicles];

export function getAllVehicles(): Vehicle[] {
  return [...vehiclesData];
}

export function getVehicleById(id: string): Vehicle | undefined {
  return vehiclesData.find(vehicle => vehicle.id === id);
}

export function createVehicle(vehicle: Omit<Vehicle, 'id'>): Vehicle {
  const newVehicle: Vehicle = {
    ...vehicle,
    id: String(Date.now()),
  };
  vehiclesData.push(newVehicle);
  return newVehicle;
}

export function updateVehicle(id: string, updates: Partial<Vehicle>): Vehicle | undefined {
  const index = vehiclesData.findIndex(vehicle => vehicle.id === id);
  if (index === -1) return undefined;

  vehiclesData[index] = { ...vehiclesData[index], ...updates };
  return vehiclesData[index];
}

export function deleteVehicle(id: string): boolean {
  const index = vehiclesData.findIndex(vehicle => vehicle.id === id);
  if (index === -1) return false;

  vehiclesData.splice(index, 1);
  return true;
}

export function resetVehiclesData(): void {
  vehiclesData = [...mockVehicles];
}

import { Ally } from '@/types/personnel';

export const mockAllies: Ally[] = [
  {
    id: '1',
    name: 'Transportes Del Caribe',
    type: 'COMPANY',
    email: 'contacto@transcaribe.com',
    phone: '809-555-1234',
    identification: '130-12345-6', // RNC
    address: 'Av. Winston Churchill, Santo Domingo',
    status: 'ACTIVE',
    vehiclesCount: 12,
    contactPerson: 'Roberto Martínez',
    notes: 'Socio estratégico desde 2020',
    createdAt: '2020-03-15T10:00:00Z',
  },
  {
    id: '2',
    name: 'Logística Express RD',
    type: 'COMPANY',
    email: 'info@logisticaexpress.do',
    phone: '829-555-5678',
    identification: '130-23456-7',
    address: 'Zona Industrial Herrera, Santiago',
    status: 'ACTIVE',
    vehiclesCount: 8,
    contactPerson: 'Ana Patricia Reyes',
    notes: 'Especializado en carga pesada',
    createdAt: '2021-01-20T09:30:00Z',
  },
  {
    id: '3',
    name: 'Pedro Antonio García',
    type: 'INDIVIDUAL',
    email: 'pedrog@gmail.com',
    phone: '849-555-9012',
    identification: '001-9012345-6',
    address: 'Los Mina, Santo Domingo Este',
    status: 'ACTIVE',
    vehiclesCount: 2,
    notes: 'Transportista independiente confiable',
    createdAt: '2021-06-10T14:00:00Z',
  },
  {
    id: '4',
    name: 'Ramón Pérez Transport',
    type: 'INDIVIDUAL',
    email: null,
    phone: '809-555-3456',
    identification: '001-0123456-7',
    address: 'La Vega',
    status: 'ACTIVE',
    vehiclesCount: 1,
    notes: 'Rutas norte del país',
    createdAt: '2022-02-05T11:00:00Z',
  },
  {
    id: '5',
    name: 'Servicios de Carga Quisqueya',
    type: 'COMPANY',
    email: 'admin@cargaquisqueya.com',
    phone: '809-555-7890',
    identification: '130-34567-8',
    address: 'Av. 27 de Febrero, Santo Domingo',
    status: 'SUSPENDED',
    vehiclesCount: 5,
    contactPerson: 'Miguel Ángel Torres',
    notes: 'Suspendido por incumplimiento - Revisar en marzo 2026',
    createdAt: '2019-11-12T08:00:00Z',
  },
  {
    id: '6',
    name: 'FleetPro Dominicana',
    type: 'COMPANY',
    email: 'contact@fleetpro.do',
    phone: '829-555-2468',
    identification: '130-45678-9',
    address: 'Punta Cana',
    status: 'ACTIVE',
    vehiclesCount: 15,
    contactPerson: 'Laura Jiménez',
    notes: 'Especializado en turismo y logística hotelera',
    createdAt: '2020-08-25T13:30:00Z',
  },
  {
    id: '7',
    name: 'María Elena Santos',
    type: 'INDIVIDUAL',
    email: 'mesantos@outlook.com',
    phone: '849-555-1357',
    identification: '001-1357924-6',
    address: 'San Pedro de Macorís',
    status: 'INACTIVE',
    vehiclesCount: 0,
    notes: 'Inactivo desde diciembre 2025',
    createdAt: '2023-04-18T10:15:00Z',
  },
];

// In-memory storage for mock CRUD operations
let alliesData = [...mockAllies];

export function getAllAllies(): Ally[] {
  return [...alliesData];
}

export function getAllyById(id: string): Ally | undefined {
  return alliesData.find(ally => ally.id === id);
}

export function createAlly(ally: Omit<Ally, 'id' | 'createdAt'>): Ally {
  const newAlly: Ally = {
    ...ally,
    id: String(Date.now()),
    createdAt: new Date().toISOString(),
  };
  alliesData.push(newAlly);
  return newAlly;
}

export function updateAlly(id: string, updates: Partial<Ally>): Ally | undefined {
  const index = alliesData.findIndex(ally => ally.id === id);
  if (index === -1) return undefined;

  alliesData[index] = { ...alliesData[index], ...updates };
  return alliesData[index];
}

export function deleteAlly(id: string): boolean {
  const index = alliesData.findIndex(ally => ally.id === id);
  if (index === -1) return false;

  alliesData.splice(index, 1);
  return true;
}

export function resetAlliesData(): void {
  alliesData = [...mockAllies];
}

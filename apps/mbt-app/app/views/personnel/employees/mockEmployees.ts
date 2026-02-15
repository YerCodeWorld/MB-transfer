import { Employee } from '@/types/auth';

export const mockEmployees: Employee[] = [
  {
    id: '1',
    name: 'Maicol Berroa',
    email: 'maicol@mbtransport.com',
    identification: '001-1234567-8',
    role: 'ADMINISTRATOR',
    state: 'WORKING',
    photo: '/profile/MAICOL.jpeg',
    darkMode: false,
    appAccent: '#3b82f6',
    minimized: false,
  },
  {
    id: '2',
    name: 'Yahir Encarnación',
    email: 'yahir@mbtransport.com',
    identification: '001-2345678-9',
    role: 'DEVELOPER',
    state: 'WORKING',
    photo: 'https://ui-avatars.com/api/?name=Yahir+Encarnacion&background=8b5cf6&color=fff&size=128',
    darkMode: true,
    appAccent: '#8b5cf6',
    minimized: false,
  },
  {
    id: '3',
    name: 'Carlos Rodríguez',
    email: 'carlos.r@mbtransport.com',
    identification: '001-3456789-0',
    role: 'MANAGER',
    state: 'WORKING',
    photo: null,
    darkMode: false,
    appAccent: '#10b981',
    minimized: false,
  },
  {
    id: '4',
    name: 'Ana Martínez',
    email: 'ana.m@mbtransport.com',
    identification: '001-4567890-1',
    role: 'COORDINATOR',
    state: 'WORKING',
    photo: null,
    darkMode: true,
    appAccent: '#f59e0b',
    minimized: false,
  },
  {
    id: '5',
    name: 'Juan Pérez',
    email: null,
    identification: '001-5678901-2',
    role: 'DRIVER',
    state: 'WORKING',
    photo: null,
    darkMode: false,
    appAccent: null,
    minimized: false,
  },
  {
    id: '6',
    name: 'María González',
    email: 'maria.g@mbtransport.com',
    identification: '001-6789012-3',
    role: 'STAFF',
    state: 'WORKING',
    photo: null,
    darkMode: false,
    appAccent: '#ec4899',
    minimized: false,
  },
  {
    id: '7',
    name: 'Luis Sánchez',
    email: null,
    identification: '001-7890123-4',
    role: 'DRIVER',
    state: 'SUSPENDED',
    photo: null,
    darkMode: false,
    appAccent: null,
    minimized: false,
  },
  {
    id: '8',
    name: 'Carmen Díaz',
    email: 'carmen.d@mbtransport.com',
    identification: '001-8901234-5',
    role: 'STAFF',
    state: 'FIRED',
    photo: null,
    darkMode: false,
    appAccent: null,
    minimized: false,
  },
  {
    id: '9',
    name: 'Pedro Martínez',
    email: null,
    identification: '001-9012345-6',
    role: 'DRIVER',
    state: 'WORKING',
    photo: 'https://ui-avatars.com/api/?name=Pedro+Martinez&background=f59e0b&color=fff&size=128',
    darkMode: false,
    appAccent: null,
    minimized: false,
  },
];

// In-memory storage for mock CRUD operations
let employeesData = [...mockEmployees];

export function getAllEmployees(): Employee[] {
  return [...employeesData];
}

export function getEmployeeById(id: string): Employee | undefined {
  return employeesData.find(emp => emp.id === id);
}

export function createEmployee(employee: Omit<Employee, 'id'>): Employee {
  const newEmployee: Employee = {
    ...employee,
    id: String(Date.now()), // Simple ID generation
  };
  employeesData.push(newEmployee);
  return newEmployee;
}

export function updateEmployee(id: string, updates: Partial<Employee>): Employee | undefined {
  const index = employeesData.findIndex(emp => emp.id === id);
  if (index === -1) return undefined;

  employeesData[index] = { ...employeesData[index], ...updates };
  return employeesData[index];
}

export function deleteEmployee(id: string): boolean {
  const index = employeesData.findIndex(emp => emp.id === id);
  if (index === -1) return false;

  employeesData.splice(index, 1);
  return true;
}

export function resetEmployeesData(): void {
  employeesData = [...mockEmployees];
}

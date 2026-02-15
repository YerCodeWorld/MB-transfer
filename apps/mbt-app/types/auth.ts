export type EmployeeRole =
  | 'ADMINISTRATOR'
  | 'DEVELOPER'      // Fixed typo from DEVELOPPER
  | 'COORDINATOR'
  | 'MANAGER'
  | 'DRIVER'
  | 'STAFF';

export type EmployeeState = 'WORKING' | 'SUSPENDED' | 'FIRED';

export type PayFrequency = 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export interface AccessKey {
  id: string;
  key: string;
  ips: string[];
  employeeId: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string | null;
  identification: string | null;
  accessKey?: AccessKey | null;
  role: EmployeeRole;
  state: EmployeeState;
  photo: string | null;
  age: number | null;
  birthdate: string | null;
  phone: string | null;
  emergencyPhone: string | null;
  startedOn: string | null;
  avrgWorkingHours: number | null;
  payAmount: number | null;
  payFrequency: PayFrequency | null;
  darkMode: boolean;
  appAccent: string | null;
  minimized: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Mock Data Helpers - Centralized exports for all personnel CRUD operations
 *
 * Note: CRUD functions are defined in each entity's mock file for better organization.
 * This file re-exports them for convenience.
 */

// Employee operations
export {
  mockEmployees,
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  resetEmployeesData,
} from '../employees/mockEmployees';

// Ally operations
export {
  mockAllies,
  getAllAllies,
  getAllyById,
  createAlly,
  updateAlly,
  deleteAlly,
  resetAlliesData,
} from '../allies/mockAllies';

// Vehicle operations
export {
  mockVehicles,
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  resetVehiclesData,
} from '../vehicles/mockVehicles';

// Utility function to reset all data to initial state
export function resetAllData() {
  const { resetEmployeesData } = require('../employees/mockEmployees');
  const { resetAlliesData } = require('../allies/mockAllies');
  const { resetVehiclesData } = require('../vehicles/mockVehicles');

  resetEmployeesData();
  resetAlliesData();
  resetVehiclesData();
}

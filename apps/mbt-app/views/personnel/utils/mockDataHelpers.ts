/**
 * Mock Data Helpers - Centralized exports for local mock CRUD operations.
 *
 * Note: allies now use API-backed CRUD.
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
  const { resetVehiclesData } = require('../vehicles/mockVehicles');

  resetEmployeesData();
  resetVehiclesData();
}

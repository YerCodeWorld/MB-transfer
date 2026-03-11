import { resetEmployeesData } from '../employees/mockEmployees';
import { resetVehiclesData } from '../vehicles/mockVehicles';

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
  resetEmployeesData();
  resetVehiclesData();
}

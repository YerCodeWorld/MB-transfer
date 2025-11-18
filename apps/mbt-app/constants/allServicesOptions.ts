export interface SelectOption {
  value: string;
  label: string;
}

export interface SortOption extends SelectOption {
  field: string;
  direction: string;
}

// Service Type Filter Options
export const SERVICE_TYPE_OPTIONS: SelectOption[] = [
  { value: "all", label: "All Types" },
  { value: "airport", label: "Airport Transfer" },
  { value: "sacbe", label: "Sacbé Transfer" },
  { value: "mbtransfer", label: "MB Transfer" },
  { value: "ARRIVAL", label: "Arrivals Only" },
  { value: "DEPARTURE", label: "Departures Only" },
  { value: "TRANSFER", label: "Transfers Only" }
];

// Status Filter Options
export const STATUS_OPTIONS: SelectOption[] = [
  { value: "all", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "assigned", label: "Assigned" },
  { value: "in-progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" }
];

// Sort Options
export const SORT_OPTIONS: SortOption[] = [
  { value: "time-asc", label: "Time (Earliest)", field: "time", direction: "asc" },
  { value: "time-desc", label: "Time (Latest)", field: "time", direction: "desc" },
  { value: "client-asc", label: "Client (A-Z)", field: "client", direction: "asc" },
  { value: "client-desc", label: "Client (Z-A)", field: "client", direction: "desc" },
  { value: "type-asc", label: "Type (A-Z)", field: "type", direction: "asc" },
  { value: "type-desc", label: "Type (Z-A)", field: "type", direction: "desc" },
  { value: "status-asc", label: "Status (A-Z)", field: "status", direction: "asc" },
  { value: "status-desc", label: "Status (Z-A)", field: "status", direction: "desc" },
  { value: "code-asc", label: "Code (A-Z)", field: "code", direction: "asc" },
  { value: "code-desc", label: "Code (Z-A)", field: "code", direction: "desc" }
];

// Service Kind Options (for editing modal)
export const SERVICE_KIND_OPTIONS: SelectOption[] = [
  { value: "ARRIVAL", label: "Arrival" },
  { value: "DEPARTURE", label: "Departure" },
  { value: "TRANSFER", label: "Transfer" }
];

// Service Company Colors and Theming
export interface ServiceTypeTheme {
  bg: string;
  border: string;
  text: string;
  badge: string;
}

export const SERVICE_TYPE_THEMES: Record<string, ServiceTypeTheme> = {
  at: {
    bg: 'bg-blue-50 dark:bg-blue-900/10',
    border: 'border-l-4 border-l-blue-500',
    text: 'text-blue-700 dark:text-blue-300',
    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
  },
  st: {
    bg: 'bg-green-50 dark:bg-green-900/10',
    border: 'border-l-4 border-l-green-500',
    text: 'text-green-700 dark:text-green-300',
    badge: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
  },
  mbt: {
    bg: 'bg-purple-50 dark:bg-purple-900/10',
    border: 'border-l-4 border-l-purple-500',
    text: 'text-purple-700 dark:text-purple-300',
    badge: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'
  },
  default: {
    bg: 'bg-gray-50 dark:bg-gray-900/10',
    border: 'border-l-4 border-l-gray-500',
    text: 'text-gray-700 dark:text-gray-300',
    badge: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
  }
};

// Status Colors
export const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
  assigned: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
  'in-progress': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
  default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
};

// Service Type Labels
export const SERVICE_TYPE_LABELS: Record<string, string> = {
  at: 'Airport Transfer',
  st: 'Sacbé Transfer',
  mbt: 'MB Transfer'
};
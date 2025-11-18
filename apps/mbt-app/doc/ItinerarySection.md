# Itinerary Management System Documentation

## Overview

The MBT Platform's Itinerary Management System is a comprehensive service management platform designed for 
transportation companies in the Dominican Republic. It provides unified management for three distinct service 
companies: Airport Transfer (AT), Sacbé Transfer (ST), and MB Transfer (MBT).

## System Architecture

### Service Types

The platform manages three primary service companies:

1. **Airport Transfer (AT)** - API-based service integration
2. **Sacbé Transfer (ST)** - Excel file processing system  
3. **MB Transfer (MBT)** - Manual form entry system

### Core Components

- **Service Management** - Individual service-specific interfaces
- **Unified View** - All Services management interface
- **Notes Management** - Date-specific annotations and task tracking
- **Context Management** - Global state and cache management
- **Dynamic UI** - Context-aware bottom bar and navigation
- **Modal System** - Portal-based modal rendering with proper layering

## Service Management Components

### 1. Airport Transfer Service (`AirportTransferService.tsx`)

**Purpose**: Fetch and manage services from the Airport Transfer API

**Features**:
- API integration with Airport Transfer booking system
- Automatic service data extraction and validation
- Global date-based service fetching (uses selected calendar date)
- Date-specific cache storage and retrieval

**Data Flow**:
```
AT API  Service Extraction  Validation  Cache Storage  Table Display
```

**Key Functions**:
- `fetchServices()` - Retrieve services from API for globally selected date
- `extractAtServices()` - Process and normalize API response
- Service validation and status management
- Time conversion (ISO to 12-hour format)
- Date-specific cache loading and validation

**Cache Key**: `'at'`

---

### 2. Sacbé Transfer Service (`SacbeTransferService.tsx`)

**Purpose**: Process Excel files containing Sacbé Transfer service data

**Features**:
- XLSX file upload and processing
- Spanish header mapping for Excel columns
- 12-hour to 24-hour time format conversion
- Data validation with error/warning reporting
- Global date integration for service storage
- Date-specific cache management
- Reusable table and modal components integration

**Data Flow**:
```
XLSX Upload  Header Mapping  Data Extraction  Validation  Cache Storage  Table Display
```

**Header Mapping**:
```javascript
const HEADER_MAPPING = {
  'no': 'rowNumber',
  'tipo': 'kindOf',
  'código': 'code',
  'cliente': 'clientName',
  'pickup': 'pickupTime',  // Handles 12H format (12:30:00 PM)
  'vuelo (código)': 'flightCode',
  'vehículo': 'vehicleType',
  'pax': 'pax',
  'desde': 'pickupLocation',
  'hacia': 'dropoffLocation',
  'notas': 'notes'
}
```

**Time Processing**:
- Detects 12-hour format (`12:30:00 PM`)
- Converts to 24-hour format for internal storage
- Maintains original display format in table

**Cache Key**: `'st'`

---

### 3. MB Transfer Service (`MBTransferService.tsx`)

**Purpose**: Manual service entry through dynamic form interface

**Features**:
- Tab-based interface (Form / View Services)
- Dynamic form with validation
- Multi-service entry support
- Real-time validation with error feedback
- Cumulative cache storage (services append, don't replace)

**Data Flow**:
```
Form Entry  Validation  Service Creation  Cache Storage  Services View
```

**Form Features**:
- Service code generation
- Client information capture
- Service type selection (ARRIVAL/DEPARTURE/TRANSFER)
- Time-only picker (date comes from global calendar selection)
- Location specification
- Notes and special requirements
- Vehicle type selection from mock data
- Global date integration with time input

**Tab System**:
- **Form Tab**: Service entry interface
- **Services Tab**: View cached MBT services for selected date only

**Cache Key**: `'mbt'`

---

## All Services View (`AllServicesView.tsx`)

**Purpose**: Unified management interface for all service types

### Overview Tab Features

**Advanced Filtering System**:
- **Search**: Full-text search across client names, codes, locations
- **Service Type**: Filter by company (AT/ST/MBT) or service kind
- **Status**: Filter by service status (Pending, Assigned, In Progress, etc.)
- **Sorting**: Multi-field sorting with direction control

**Enhanced Service Table**:
- **Visual Distinction**: Company-specific color themes
  - Airport Transfer: Blue theme
  - Sacbé Transfer: Green theme  
  - MB Transfer: Purple theme
- **Service Numbering**: Sequential numbering with themed badges
- **Comprehensive Columns**: #, Code, Client, Time, PAX, Route, Type, Status, Vehicle, Driver, Actions

**Service Management**:
- **Edit Services**: Full-featured edit modal with all properties
- **Remove Services**: Confirmation-based removal
- **Vehicle Assignment**: Dropdown selection from vehicle pool
- **Driver Assignment**: Dropdown selection from driver pool
- **Status Management**: Multi-state status tracking

**Time Display Logic**:
```javascript
// Conditional time formatting based on service type
service.serviceType === 'at' 
  ? convertIsoStringTo12h(service.pickupTime)  // AT: Convert to 12H
  : service.pickupTime                          // ST/MBT: Display as-is
```

### Live Mode Tab

**Purpose**: Real-time service tracking (placeholder for future implementation)

**Planned Features**:
- Live service status monitoring
- Real-time location tracking
- Driver communication interface
- Service progress visualization

## Context Management

### Service Data Context (`ServiceDataContext.tsx`)

**Purpose**: Global state management for service data across all components

**Features**:
- **Multi-Service Cache Management**: Separate caches for AT, ST, MBT with date-specific storage
- **Global Date Management**: Centralized selected date state from MiniCalendar
- **localStorage Integration**: Persistent data storage with date keys
- **Export Functionality**: JSON/CSV export capabilities
- **Service Type Tracking**: Active service type management
- **Data Synchronization**: Real-time cache updates
- **Date-Specific Service Retrieval**: Get services filtered by date and service type

**Cache Structure**:
```javascript
interface ServiceCache {
  data: ServiceInput[];
  timestamp: number;
  date: string;
  serviceType: 'at' | 'mbt' | 'st';
}
```

**Key Functions**:
- `getCache(type, date?)` - Retrieve service-specific cache for date
- `setCache(type, data, date?)` - Store service data with timestamps and date
- `selectedDate` - Current selected date from calendar
- `setSelectedDate(date)` - Update global selected date
- `getServicesByDate(date, serviceType?)` - Get services filtered by date
- `setActiveServiceType(type)` - Track current service context
- `exportServices(data, format)` - Export data in multiple formats

### Bottom Bar Context (`BottomBarContext.tsx`)

**Purpose**: Dynamic action management for context-aware bottom bar

**Features**:
- **Dynamic Actions**: Context-specific button sets
- **Icon Integration**: FontAwesome and React Icons
- **Variant Support**: Primary, secondary, danger styling
- **State Management**: Action enabling/disabling

**Action Interface**:
```javascript
interface BottomBarAction {
  key: string;
  label: string;
  Icon: any;
  variant?: "primary" | "secondary" | "danger";
  onClick?: () => void;
  disabled?: boolean;
}
```

### Navigation Context (`NavigationContext.tsx`)

**Purpose**: Stack-based navigation management for service components

**Features**:
- **Stack Navigation**: Push/pop navigation model
- **Component Mounting**: Dynamic component rendering
- **Data Passing**: Context data for navigation targets
- **Breadcrumb Integration**: Navigation path display

## Data Models

### Service Input Interface

```javascript
interface ServiceInput {
  id?: string;
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
  assignedDriver?: string;    // Added for assignment tracking
  assignedVehicle?: string;   // Added for assignment tracking
}
```

### Extended Service Interface

```javascript
interface ExtendedService extends ServiceInput {
  serviceType: 'at' | 'st' | 'mbt';
  status: 'pending' | 'assigned' | 'in-progress' | 'completed' | 'cancelled';
  assignedDriver?: string;
  assignedVehicle?: string;
}
```

## UI/UX Features

### Company-Specific Theming

Consistent theming applied across all service components (individual sections and AllServices view):

**Airport Transfer (AT)**:
```css
bg-blue-50 dark:bg-blue-900/10
border-l-4 border-l-blue-500
text-blue-700 dark:text-blue-300
focus:ring-blue-500 focus:border-blue-500
```

**Sacbé Transfer (ST)**:
```css
bg-green-50 dark:bg-green-900/10
border-l-4 border-l-green-500
text-green-700 dark:text-green-300
focus:ring-green-500 focus:border-green-500
```

**MB Transfer (MBT)**:
```css
bg-purple-50 dark:bg-purple-900/10
border-l-4 border-l-purple-500
text-purple-700 dark:text-purple-300
focus:ring-purple-500 focus:border-purple-500
```

**Theme Consistency**:
- Applied to individual service section interfaces
- Consistent across AllServices unified view
- Applied to Schedule component service counts
- Includes form inputs, buttons, and informational displays

### Responsive Design

- **Mobile-First**: Optimized for mobile and tablet views
- **Horizontal Scroll**: Table overflow handling
- **Touch-Friendly**: Large touch targets and spacing
- **Dark Mode**: Complete dark theme support

### Service Numbering System

- **Visual Badges**: Circular numbered badges with company colors
- **Dynamic Updates**: Numbers update with filtering and sorting
- **Accessibility**: Screen reader friendly numbering

## State Management

### Cache Isolation & Date Management

Each service type maintains completely separate data stores with date-specific isolation:

```javascript
// Independent cache keys with date isolation prevent data mixing
const atServices = getCache('at', selectedDate);    // Airport Transfer services for date
const stServices = getCache('st', selectedDate);    // Sacbé Transfer services for date
const mbtServices = getCache('mbt', selectedDate);   // MB Transfer services for date
```

**Date-Specific Storage**:
- Cache keys include date: `mbt_cache_at_2024-11-11`
- Services are isolated by both service type AND date
- Global calendar date drives all service operations
- Automatic date-based loading/saving across all components

### Edit Operations

Service editing follows a strict isolation pattern with date awareness:

1. **Target Identification**: Service identified by unique ID, type, and date
2. **Cache Update**: Only the specific service cache for the selected date is modified
3. **Local State Sync**: UI state updated to reflect changes
4. **Assignment Persistence**: Driver/vehicle assignments saved to date-specific cache
5. **Date Consistency**: All edit operations maintain date isolation

### Assignment Storage

Driver and vehicle assignments are now persisted:

```javascript
// Assignments stored as part of service data
const serviceWithAssignments = {
  ...serviceData,
  assignedDriver: "Juan Pérez",
  assignedVehicle: "Toyota Hiace"
};
```

## Integration Points

### Airport Transfer API

- **Endpoint**: Airport Transfer booking system API
- **Authentication**: API key based authentication
- **Rate Limiting**: Respects API rate limits
- **Error Handling**: Graceful fallback to mock data

### Excel Processing

- **Library**: SheetJS (XLSX)
- **Format Support**: .xlsx, .xls files
- **Header Detection**: Automatic Spanish header mapping
- **Validation**: Comprehensive data validation with warnings

### Mock Data Integration

- **Vehicles**: `mockVehicles` array with capacity info
- **Drivers**: `mockDrivers` array for assignment dropdowns
- **Fallback Data**: Mock services for development/testing

## Future Enhancements

### Planned Features

1. **AeroAPI Integration**: Real-time flight data verification
2. **PDF Generation**: Service itinerary and booking confirmations
3. **Live Tracking**: GPS integration for real-time service monitoring
4. **Driver Mobile App**: Companion app for driver interactions
5. **Customer Portal**: Client-facing booking and tracking interface

### Technical Roadmap

1. **Database Integration**: Replace localStorage with proper database
2. **Real-time Sync**: WebSocket integration for live updates
3. **Offline Support**: Service worker for offline functionality
4. **Analytics Dashboard**: Service performance and metrics tracking
5. **Multi-tenant Support**: Support for multiple transportation companies

## Development Guidelines

### Code Organization

- **Component Structure**: Feature-based organization
- **Context Separation**: Logical separation of concerns
- **Type Safety**: Comprehensive TypeScript coverage
- **Error Handling**: Graceful error states and recovery

### Testing Strategy

- **Unit Tests**: Individual component testing
- **Integration Tests**: Service integration verification
- **E2E Tests**: Complete user workflow testing
- **Performance Tests**: Cache and rendering performance

### Deployment

- **Environment Config**: Staging and production environments
- **Cache Management**: Production cache strategies
- **Error Monitoring**: Production error tracking
- **Performance Monitoring**: Real-time performance metrics

## Notes Management System

### Notes Component (`Notes.tsx`)

**Purpose**: Complete notes management system for date-specific annotations and reminders

**Features**:
- **Full CRUD Operations**: Create, read, update, and delete notes
- **Date-Specific Storage**: Notes are isolated by date using localStorage keys
- **Priority System**: Three-level priority system (Low, Medium, High) with visual indicators
- **Tag System**: Categorical organization (General, Important, Reminder, Meeting, To Do)
- **Modal-Based Editing**: Full-featured modal with form validation
- **Portal Rendering**: Modals use React Portal for proper z-index layering

**Data Structure**:
```javascript
interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
  createdAt: string;
  updatedAt: string;
  priority?: 'low' | 'medium' | 'high';
  tag?: 'general' | 'important' | 'reminder' | 'meeting' | 'todo';
}
```

**Storage Pattern**:
- Cache key: `mbt_notes_${selectedDate}`
- Date-isolated storage ensures notes don't cross-contaminate between dates
- Real-time localStorage synchronization

### Notes Widget (`NotesWidget.tsx`)

**Purpose**: Compact sidebar widget for notes preview and quick access

**Features**:
- **Notes Counter**: Shows count of notes for current date
- **Preview Mode**: Displays first 3 notes with truncated content
- **Quick Navigation**: Direct link to full notes management
- **Responsive Display**: Adapts to available sidebar space
- **Tag Color Coding**: Visual distinction for different note types

### Tab-Based Interface Architecture

The itinerary section now uses a modular tab system with external configuration:

**Tab Configuration** (`constants/itineraryTabs.ts`):
```javascript
export const itineraryTabs: ItineraryTab[] = [
  { key: "itinerary", label: "Itinerario", Icon: BsEye },
  { key: "webhooks", label: "Webhooks", Icon: FaWhatsapp },
  { key: "notes", label: "Notes", Icon: FaRegStickyNote },
  { key: "settings", label: "Configuración", Icon: FaCog }
];
```

**Service Companies Configuration** (`constants/serviceCompanies.ts`):
- Extracted large configuration objects to separate files
- Improved maintainability and reusability
- Type-safe interfaces for service company definitions

## Enhanced Schedule Component

### New Features

**Detail Button**: 
- Added interactive detail button with accent color theming
- Navigates to detailed calendar view (placeholder for future enhancement)
- Provides comprehensive service statistics and information

**Improved Theming**:
- Consistent use of accent colors throughout the component
- Proper company color theming (AT=blue, ST=green, MBT=purple)
- Enhanced visual hierarchy and accessibility

## Modal System Improvements

### React Portal Implementation

All modals now use React Portal for proper rendering:

**Benefits**:
- **Z-Index Resolution**: Modals render at document.body level, eliminating header/footer overlap
- **Event Handling**: Proper click-outside-to-close functionality
- **Body Scroll Management**: Automatic overflow control when modals are open
- **Performance**: Reduced stacking context conflicts

**Implementation Pattern**:
```javascript
const modalContent = (
  <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 p-4">
    {/* Modal content */}
  </div>
);

return createPortal(modalContent, document.body);
```

## Context Optimization

### Bottom Bar Context Enhancements

**Stabilized Functions**:
- All context functions now use `useCallback` for performance optimization
- Eliminated infinite re-render loops
- Improved dependency array management in useEffect hooks

**Action Management**:
- Dynamic action configuration based on active tab
- Modular action definitions from external constants
- Type-safe action interfaces

## Bug Fixes (v2.3.0)

### Critical Issues Resolved

1. **AllServices Cache Isolation**:
   - Fixed service editing affecting multiple services
   - Implemented proper service type and date isolation
   - Enhanced cache key consistency

2. **Modal Z-Index Issues**:
   - Implemented React Portal for all modals
   - Eliminated header/footer overlap problems
   - Proper stacking context management

3. **React Hooks Violations**:
   - Fixed conditional hook calls in Notes component
   - Stabilized function references with useCallback
   - Corrected useEffect dependency arrays

4. **TypeScript Compilation Errors**:
   - Fixed icon reference issues in service companies configuration
   - Resolved component prop type mismatches
   - Enhanced type safety across components

### Performance Improvements

- **Reduced Re-renders**: Optimized context providers and hook dependencies
- **Memory Management**: Proper cleanup in useEffect hooks
- **Bundle Optimization**: Removed unused imports and variables

## Recent Updates (v2.3.0)

### Notes Management Implementation
- **Complete Notes System**: Full CRUD operations with date-specific storage
- **Priority & Tag System**: Categorization and visual organization
- **Modal Integration**: Portal-based modals for proper layering
- **Sidebar Widget**: Compact preview in main calendar view

### Architecture Improvements
- **External Constants**: Extracted configuration objects to separate files
- **Portal Modals**: All modals now use React Portal for z-index resolution
- **Context Optimization**: Stabilized context functions with useCallback
- **Type Safety**: Enhanced TypeScript coverage and interfaces

### Enhanced Calendar Integration
- **Improved UX**: Better calendar usage and navigation
- **Schedule Enhancements**: Detail button and improved theming
- **Date Management**: Robust date-specific operations across all components

### Code Quality Improvements
- **Hook Compliance**: Fixed all React hooks rule violations
- **Performance**: Eliminated infinite render loops and optimized re-renders
- **Error Handling**: Comprehensive error states and graceful fallbacks
- **Maintainability**: Modular architecture with clear separation of concerns

---

*Last Updated: November 2025*
*Version: 2.3.0*
*Platform: MBT Transportation Management System*

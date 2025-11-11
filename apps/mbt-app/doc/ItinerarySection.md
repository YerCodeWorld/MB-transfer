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
- **Context Management** - Global state and cache management
- **Dynamic UI** - Context-aware bottom bar and navigation

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

## Troubleshooting

### Common Issues

**Service Data Not Persisting**:
- Check localStorage quota
- Verify date-specific cache key consistency (`mbt_cache_[type]_[date]`)
- Ensure proper service type and date tracking
- Confirm selectedDate context is properly passed

**Edit Operations Affecting Multiple Services**:
- Verify service ID uniqueness
- Check date-specific cache isolation implementation
- Confirm service type and date mapping
- Ensure getCache calls include selectedDate parameter

**Date-Specific Loading Issues**:
- Verify all getCache calls include selectedDate
- Check for duplicate useEffect hooks loading from generic cache
- Ensure consistent date format (YYYY-MM-DD)
- Confirm MiniCalendar date changes trigger component updates

**Time Display Issues**:
- Verify service type conditional rendering
- Check time format conversion logic for MBT (time-only input + date combination)
- Ensure timezone consistency

### Debug Tools

**Cache Inspection**:
```javascript
// Browser console debugging - date-specific caches
const selectedDate = '2024-11-11'; // Example date
console.log('AT Cache:', localStorage.getItem(`mbt_cache_at_${selectedDate}`));
console.log('ST Cache:', localStorage.getItem(`mbt_cache_st_${selectedDate}`));
console.log('MBT Cache:', localStorage.getItem(`mbt_cache_mbt_${selectedDate}`));

// Check all dates with services
Object.keys(localStorage)
  .filter(key => key.startsWith('mbt_cache_'))
  .forEach(key => console.log(key, localStorage.getItem(key)));
```

**State Debugging**:
- React DevTools for component state inspection
- Context value monitoring
- Action flow tracing

## Performance Considerations

### Optimization Strategies

- **Lazy Loading**: Component-based code splitting
- **Memoization**: React.memo for expensive renders
- **Virtual Scrolling**: Large dataset handling
- **Cache Optimization**: Efficient localStorage usage

### Memory Management

- **State Cleanup**: Proper useEffect cleanup
- **Event Listener Removal**: Memory leak prevention
- **Cache Size Limits**: Prevent unlimited cache growth

## Security Considerations

### Data Protection

- **Input Validation**: Comprehensive data sanitization
- **XSS Prevention**: Proper content escaping
- **Cache Security**: Sensitive data encryption
- **API Security**: Secure token management

### Access Control

- **Authentication**: User session management
- **Authorization**: Role-based access control
- **Audit Logging**: Action tracking and logging
- **Data Privacy**: GDPR/privacy compliance

## Recent Updates (v2.2.0)

### Global Date Management Implementation
- **Calendar Integration**: MiniCalendar now drives all service operations through global selectedDate
- **Date-Specific Caching**: All service types now use date-specific cache keys for proper isolation
- **Component Synchronization**: All service components automatically load/save based on selected calendar date
- **UI Consistency**: Date displays added to all service interfaces for clarity

### Company Theming Standardization  
- **Individual Sections**: Applied consistent company colors to AT (blue), ST (green), MBT (purple) service interfaces
- **Form Elements**: Updated all input fields, buttons, and containers with appropriate themed styling
- **Schedule Component**: Real service count logic with themed display matching company colors

### Bug Fixes
- **AllServices Edit/Remove**: Fixed service isolation issues where editing AT services affected all services
- **Date Loading Consistency**: Removed duplicate cache loading that caused services from wrong dates to appear
- **MBT Time Input**: Changed from datetime-local to time-only input, with date from global calendar

---

*Last Updated: November 2025*
*Version: 2.2.0*
*Platform: MBT Transportation Management System*

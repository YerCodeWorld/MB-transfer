import { ServiceInput } from '../types/services';

export interface ParsedServiceMessage {
  type: 'ARRIVAL' | 'DEPARTURE' | 'TRANSFER';
  code: string;
  client: string;
  vehicle?: string;
  pax: number;
  from: string;
  date: string;
  time: string;
  to: string;
}

export function parseServiceMessage(message: string): ParsedServiceMessage | null {
  try {
    const lines = message.trim().split('\n').map(line => line.trim()).filter(line => line);
    
    if (lines.length < 6) {
      throw new Error('Message must contain at least 6 lines');
    }

    // Parse type (SALIDA -> DEPARTURE, LLEGADA -> ARRIVAL, TRASLADO -> TRANSFER)
    const typeMap: Record<string, 'ARRIVAL' | 'DEPARTURE' | 'TRANSFER'> = {
      'SALIDA': 'DEPARTURE',
      'LLEGADA': 'ARRIVAL', 
      'TRASLADO': 'TRANSFER',
      'DEPARTURE': 'DEPARTURE',
      'ARRIVAL': 'ARRIVAL',
      'TRANSFER': 'TRANSFER'
    };

    const type = typeMap[lines[0].toUpperCase()];
    if (!type) {
      throw new Error(`Invalid service type: ${lines[0]}`);
    }

    // Detect format based on structure
    const isArrivalFormat = type === 'ARRIVAL' && lines.some(line => line.includes('Vuelo:'));
    
    if (isArrivalFormat) {
      return parseArrivalFormat(lines, type);
    } else {
      return parseDepartureFormat(lines, type);
    }

  } catch (error) {
    console.error('Error parsing service message:', error);
    return null;
  }
}

function parseDepartureFormat(lines: string[], type: 'ARRIVAL' | 'DEPARTURE' | 'TRANSFER'): ParsedServiceMessage {
  if (lines.length < 8) {
    throw new Error('Departure format must contain at least 8 lines');
  }

  // Parse code
  const code = lines[1];

  // Parse client name
  const client = lines[2];

  // Parse vehicle (optional)
  const vehicle = lines[3] || '';

  // Parse PAX - look for number in the line
  const paxMatch = lines[4].match(/(\d+)\s*pax/i);
  const pax = paxMatch ? parseInt(paxMatch[1]) : 1;

  // Parse FROM location - remove "Desde:" prefix
  const fromMatch = lines[5].match(/^(?:Desde:?\s*)?(.+)$/i);
  const from = fromMatch ? fromMatch[1].trim() : lines[5];

  // Parse DATE - remove "Fecha:" prefix and format
  const dateMatch = lines[6].match(/^(?:Fecha:?\s*)?(.+)$/i);
  const date = dateMatch ? dateMatch[1].trim() : lines[6];

  // Parse TIME - remove "Hora:" prefix
  const timeMatch = lines[7].match(/^(?:Hora:?\s*)?(.+)$/i);
  const time = timeMatch ? timeMatch[1].trim() : lines[7];

  // Parse TO location - remove "Hacia:" prefix
  const toMatch = lines[8] ? lines[8].match(/^(?:Hacia:?\s*)?(.+)$/i) : null;
  const to = toMatch ? toMatch[1].trim() : (lines[8] || '');

  return {
    type,
    code,
    client,
    vehicle,
    pax,
    from,
    date,
    time,
    to
  };
}

function parseArrivalFormat(lines: string[], type: 'ARRIVAL' | 'DEPARTURE' | 'TRANSFER'): ParsedServiceMessage {
  // Arrival format:
  // LLEGADA
  // Client Name
  // Vehicle Type
  // PAX
  // Desde: Location (with airport code)
  // Fecha: Date Time
  // Vuelo: Flight Code
  // Hacia: Destination

  if (lines.length < 7) {
    throw new Error('Arrival format must contain at least 7 lines');
  }

  // Parse client name (line 1, after LLEGADA)
  const client = lines[1];

  // Parse vehicle (line 2)
  const vehicle = lines[2] || '';

  // Parse PAX - look for number in the line (line 3)
  const paxMatch = lines[3].match(/(\d+)\s*pax/i);
  const pax = paxMatch ? parseInt(paxMatch[1]) : 1;

  // Parse FROM location - remove "Desde:" prefix (line 4)
  const fromMatch = lines[4].match(/^(?:Desde:?\s*)?(.+)$/i);
  const from = fromMatch ? fromMatch[1].trim() : lines[4];

  // Parse DATE and TIME - combined in one line "Fecha: 2025-11-18 15:30:00" (line 5)
  const dateTimeMatch = lines[5].match(/^(?:Fecha:?\s*)?(.+)$/i);
  const dateTimeStr = dateTimeMatch ? dateTimeMatch[1].trim() : lines[5];
  
  // Split date and time
  const [date, time] = dateTimeStr.split(' ');

  // Parse flight code - remove "Vuelo:" prefix (line 6)
  const flightMatch = lines[6].match(/^(?:Vuelo:?\s*)?(.+)$/i);
  const flightCode = flightMatch ? flightMatch[1].trim() : lines[6];

  // Parse TO location - remove "Hacia:" prefix (line 7)
  const toMatch = lines[7] ? lines[7].match(/^(?:Hacia:?\s*)?(.+)$/i) : null;
  const to = toMatch ? toMatch[1].trim() : (lines[7] || '');

  // For arrivals, generate a code from flight info if not provided explicitly
  const code = flightCode || `ARR_${Date.now()}`;

  return {
    type,
    code,
    client,
    vehicle,
    pax,
    from,
    date: date || dateTimeStr,
    time: time || dateTimeStr,
    to
  };
}

export function convertParsedToServiceInput(parsed: ParsedServiceMessage, selectedDate: string): ServiceInput {
  // Convert time format if needed (from HH:MM to full datetime)
  let pickupTime: string;
  
  // Check if time is just HH:MM format
  if (/^\d{1,2}:\d{2}$/.test(parsed.time)) {
    // Combine with the selected date
    pickupTime = `${selectedDate}T${parsed.time}:00`;
  } else {
    // Try to use the parsed time as-is or default to selected date
    pickupTime = `${selectedDate}T${parsed.time}`;
  }

  return {
    id: `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    code: parsed.code,
    kindOf: parsed.type,
    clientName: parsed.client,
    pickupTime,
    pax: parsed.pax,
    pickupLocation: parsed.from,
    dropoffLocation: parsed.to,
    vehicleType: parsed.vehicle,
    ally: 'Manual',
    notes: `Parsed from message on ${new Date().toISOString()}`
  };
}

export function getExampleMessage(type: 'departure' | 'arrival' = 'departure'): string {
  if (type === 'arrival') {
    return `LLEGADA
Takahiro Ohki
Hyundai H-1
6 Pax
Desde: Punta Cana Airport (PUJ) (Airport (PUJ))
Fecha: 2025-11-18 15:30:00
Vuelo: JETBLUE B6 173
Hacia: Meliá Caribe Beach Resort (Bavaro)`;
  } else {
    return `SALIDA
PUJ-PCAT-11692
Pedro Scala
Kia K5
2 Pax
Desde: Serenade All Suites, Adults Only Resort
Fecha: 2025-11-10
Hora: 18:30
Hacia: Punta Cana Airport`;
  }
}
import { ServiceInput } from '../types/services';

export interface ParsedServiceMessage {
  type: 'ARRIVAL' | 'DEPARTURE' | 'TRANSFER';
  code: string;
  client: string;
  flightCode?: string;
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
  if (lines.length < 7) {
    throw new Error('Arrival format must contain at least 7 lines');
  }

  const fromLine = lines.find((line) => /^Desde:?\s*/i.test(line)) || '';
  const dateLine = lines.find((line) => /^Fecha:?\s*/i.test(line)) || '';
  const timeLine = lines.find((line) => /^Hora:?\s*/i.test(line)) || '';
  const flightLine = lines.find((line) => /^Vuelo:?\s*/i.test(line)) || '';
  const toLine = lines.find((line) => /^Hacia:?\s*/i.test(line)) || '';
  const paxLine = lines.find((line) => /(\d+)\s*pax/i.test(line)) || '';
  const firstStructuredIndex = lines.findIndex(
    (line) =>
      /^Desde:?\s*/i.test(line) ||
      /^Fecha:?\s*/i.test(line) ||
      /^Hora:?\s*/i.test(line) ||
      /^Vuelo:?\s*/i.test(line) ||
      /^Hacia:?\s*/i.test(line) ||
      /(\d+)\s*pax/i.test(line)
  );
  const identityLines = lines.slice(1, firstStructuredIndex === -1 ? lines.length : firstStructuredIndex);

  const looksLikeCode = (value: string) => /^[A-Z0-9]+(?:[-/][A-Z0-9]+)+$/i.test(value.trim());

  const codeCandidate = identityLines[0] || '';
  const hasExplicitCode = looksLikeCode(codeCandidate) && identityLines.length >= 2;
  const code = hasExplicitCode ? codeCandidate : flightLine.replace(/^Vuelo:?\s*/i, '').trim() || `ARR_${Date.now()}`;
  const client = hasExplicitCode ? identityLines[1] || '' : identityLines[0] || '';
  const vehicle = hasExplicitCode ? identityLines[2] || '' : identityLines[1] || '';

  const paxMatch = paxLine.match(/(\d+)\s*pax/i);
  const pax = paxMatch ? parseInt(paxMatch[1]) : 1;

  const fromMatch = fromLine.match(/^(?:Desde:?\s*)?(.+)$/i);
  const from = fromMatch ? fromMatch[1].trim() : fromLine;

  const rawDate = dateLine.replace(/^Fecha:?\s*/i, '').trim();
  const rawTime = timeLine.replace(/^Hora:?\s*/i, '').trim();
  const [splitDate, splitTime] = rawDate.split(/\s+/);
  const date = splitDate || rawDate;
  const time = rawTime || splitTime || rawDate;

  const flightMatch = flightLine.match(/^(?:Vuelo:?\s*)?(.+)$/i);
  const flightCode = flightMatch ? flightMatch[1].trim() : '';

  const toMatch = toLine.match(/^(?:Hacia:?\s*)?(.+)$/i);
  const to = toMatch ? toMatch[1].trim() : toLine;

  return {
    type,
    code,
    client,
    flightCode,
    vehicle,
    pax,
    from,
    date,
    time,
    to
  };
}

export function convertParsedToServiceInput(parsed: ParsedServiceMessage, selectedDate: string): ServiceInput {
  // Normalize to strict ISO UTC expected by API: YYYY-MM-DDTHH:mm:ss.sssZ
  let pickupTime = `${selectedDate}T00:00:00.000Z`;
  const raw = String(parsed.time || '').trim();

  if (/^\d{1,2}:\d{2}$/.test(raw)) {
    const [h, m] = raw.split(':');
    pickupTime = `${selectedDate}T${h.padStart(2, '0')}:${m}:00.000Z`;
  } else if (/^\d{1,2}:\d{2}:\d{2}$/.test(raw)) {
    const [h, m, s] = raw.split(':');
    pickupTime = `${selectedDate}T${h.padStart(2, '0')}:${m}:${s}.000Z`;
  } else if (/^\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}(?::\d{2})?$/.test(raw)) {
    const normalized = raw.replace(' ', 'T');
    const withSeconds = normalized.length === 16 ? `${normalized}:00` : normalized;
    pickupTime = `${withSeconds}.000Z`;
  } else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(raw)) {
    pickupTime = raw;
  }

  return {
    id: `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    code: parsed.code,
    kindOf: parsed.type,
    clientName: parsed.client,
    pickupTime,
    flightCode: parsed.flightCode,
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

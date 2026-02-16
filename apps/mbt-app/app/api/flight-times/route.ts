import { NextRequest, NextResponse } from 'next/server';

const REQUEST_SPACING_MS = 0;
const MAX_RETRIES = 1;
const ROUTE_CACHE_TTL_MS = 5 * 60 * 1000;

type FlightResult = {
  code: string;
  departure_airport?: string;
  arrival_airport?: string;
  scheduled_out?: string;
  scheduled_in?: string;
  status?: string;
  error?: string;
  message?: string;
};

const flightLookupCache = new Map<string, { expiresAt: number; data: FlightResult }>();

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithRetry(url: string, apiKey: string): Promise<Response> {
  let attempt = 0;

  while (attempt <= MAX_RETRIES) {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'x-apikey': apiKey,
      },
    });

    if (response.status !== 429) {
      return response;
    }

    if (attempt === MAX_RETRIES) {
      return response;
    }

    const retryAfter = response.headers.get('retry-after');
    const retryDelayMs = retryAfter ? Number.parseInt(retryAfter, 10) * 1000 : (attempt + 1) * 1200;
    await sleep(Number.isFinite(retryDelayMs) ? retryDelayMs : 1200);
    attempt += 1;
  }

  throw new Error('Unexpected retry flow');
}

// Convert global airline codes to FlightAware internal codes
function convertFlightCode(globalCode: string): string {
  const globalToInternal: Record<string, string> = {
    AA: "AAL", DL: "DAL", UA: "UAL", WN: "SWA", B6: "JBU",
    AS: "ASA", NK: "NKS", F8: "FLE", F9: "FFT", AC: "ACA",
    WS: "WJA", LA: "LAN", AV: "AVA", CM: "CMP", AF: "AFR",
    KL: "KLM", BA: "BAW", LH: "DLH", IB: "IBE", EK: "UAE",
    QR: "QTR", TK: "THY", ET: "ETH", AZ: "ITY", AR: "ARG",
    AM: "AMX", Y4: "VOI", VB: "VIV", XP: "VXP", LX: "SWR",
    H2: "SKU", P5: "RPB", "4Y": "OCN",
    American: "AA",
    United: "UA",
  };

  const trimmed = globalCode.trim();

  // If it already looks like "ICAO + number" (e.g. RPB7436), keep it
  if (/^[A-Z0-9]{3}\d{1,4}$/i.test(trimmed)) {
    return trimmed;
  }

  // Match "prefix [spaces] number", e.g. "P5 7436" or "P5    7436"
  const match = trimmed.match(/^([A-Z0-9]{2,}|[A-Za-z]+)\s*(\d{1,4})$/);
  if (!match) {
    // Fallback: just strip all spaces
    return trimmed.replace(/\s+/g, "");
  }

  let prefix = match[1].toUpperCase();
  const number = match[2];
  const normalizedNumber = String(Number.parseInt(number, 10));

  if (prefix in globalToInternal) {
    prefix = globalToInternal[prefix];
  }

  return `${prefix}${Number.isNaN(Number.parseInt(number, 10)) ? number : normalizedNumber}`;
}

export async function POST(request: NextRequest) {
  try {

    const { flightCodes, date } = await request.json();

    if (!Array.isArray(flightCodes)) {
      return NextResponse.json({ error: 'flightCodes must be an array' }, { status: 400 });
    }

	const apiKey = process.env.FLIGHTAWARE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'FlightAware API key is missing' }, { status: 500 });
    }

    const baseUrl = "https://aeroapi.flightaware.com/aeroapi/flights/";
    const TZ = "America/Santo_Domingo";

    const normalizedCodes = flightCodes
      .map((code: unknown) => (typeof code === 'string' ? code.trim() : ''))
      .filter(Boolean);

    const uniqueCodes = Array.from(new Set(normalizedCodes));
    const resultMap = new Map<string, FlightResult>();

    // Parse the date (format: YYYY-MM-DD) and create start/end timestamps for the day
    let startTime: string | undefined;
    let endTime: string | undefined;

    if (date) {
      const [year, month, day] = date.split('-').map(Number);
      const startDate = new Date(year, month - 1, day, 0, 0, 0);
      const endDate = new Date(year, month - 1, day, 23, 59, 59);

      // FlightAware expects ISO timestamps
      startTime = startDate.toISOString();
      endTime = endDate.toISOString();
    }

    for (let index = 0; index < uniqueCodes.length; index += 1) {
      const code = uniqueCodes[index];
      const cacheKey = `${code}|${date || ''}`;
      const cached = flightLookupCache.get(cacheKey);

      if (cached && cached.expiresAt > Date.now()) {
        resultMap.set(code, cached.data);
        continue;
      }

      try {
        const convertedCode = convertFlightCode(code);

        // Build URL with date range query parameters if date is provided
        let url = `${baseUrl}${convertedCode}`;
        if (startTime && endTime) {
          url += `?start=${encodeURIComponent(startTime)}&end=${encodeURIComponent(endTime)}`;
        }

        const response = await fetchWithRetry(url, apiKey);

        if (!response.ok) {
          const result: FlightResult = { code, error: `HTTP ${response.status}: ${response.statusText}` };
          resultMap.set(code, result);
          continue;
        }

        const data = await response.json();

        if (!data.flights || data.flights.length === 0) {
          const result: FlightResult = { code, message: "No data found" };
          resultMap.set(code, result);
          flightLookupCache.set(cacheKey, {
            expiresAt: Date.now() + ROUTE_CACHE_TTL_MS,
            data: result,
          });
          continue;
        }

        // Find flight where PUJ is the destination
        const pujFlight = data.flights.find((flight: any) => 
          flight.destination?.code_iata === "PUJ"
        );

        if (!pujFlight) {
          const result: FlightResult = { code, message: "No flight to PUJ found" };
          resultMap.set(code, result);
          flightLookupCache.set(cacheKey, {
            expiresAt: Date.now() + ROUTE_CACHE_TTL_MS,
            data: result,
          });
          continue;
        }

        // 12h formatter pinned to Santo Domingo time
        const to12Hour = (iso: string) => {
          if (!iso) return null;
          return new Intl.DateTimeFormat("en-US", {
            timeZone: TZ, hour: "numeric", minute: "2-digit", hour12: true
          }).format(new Date(iso));
        };

        const arrivalIso =
          pujFlight.scheduled_in ||
          pujFlight.estimated_in ||
          pujFlight.actual_in ||
          undefined;

        const result: FlightResult = {
          code,
          departure_airport: pujFlight.origin?.code_iata || undefined,
          arrival_airport: pujFlight.destination?.code_iata || undefined,
          scheduled_out: to12Hour(pujFlight.scheduled_out) || undefined,
          scheduled_in: to12Hour(arrivalIso) || undefined,
          status: pujFlight.status
        };

        resultMap.set(code, result);
        flightLookupCache.set(cacheKey, {
          expiresAt: Date.now() + ROUTE_CACHE_TTL_MS,
          data: result,
        });
      } catch (err) {
        const result: FlightResult = { code, error: (err as Error).message };
        resultMap.set(code, result);
      }

      // Space calls to reduce burst pressure on rate-limited provider.
      if (REQUEST_SPACING_MS > 0 && index < uniqueCodes.length - 1) {
        await sleep(REQUEST_SPACING_MS);
      }
    }

    const results = normalizedCodes.map((code) => resultMap.get(code) || ({ code, message: "No data found" } as FlightResult));

    return NextResponse.json(results);
  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

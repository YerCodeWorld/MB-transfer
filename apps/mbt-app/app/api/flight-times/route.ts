import { NextRequest, NextResponse } from 'next/server';

// Convert global airline codes to FlightAware internal codes
function convertFlightCode(globalCode: string): string {
  const globalToInternal: Record<string, string> = {
    AA: "AAL", DL: "DAL", UA: "UAL", WN: "SWA", B6: "JBU",
    AS: "ASA", NK: "NKS", F8: "FLE", F9: "FFT", AC: "ACA",
    WS: "WJA", LA: "LAN", AV: "AVA", CM: "CMP", AF: "AFR",
    KL: "KLM", BA: "BAW", LH: "DLH", IB: "IBE", EK: "UAE",
    QR: "QTR", TK: "THY", ET: "ETH", AZ: "ITY", AR: "ARG",
    AM: "AMX", Y4: "VOI", VB: "VIV", XP: "VXP", LX: "SWR",
    H2: "SKU", P5: "RPB",
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

  if (prefix in globalToInternal) {
    prefix = globalToInternal[prefix];
  }

  return `${prefix}${number}`;
}

export async function POST(request: NextRequest) {  
  try {
    
    const { flightCodes } = await request.json();

    const apiKey = "FTRH5ucRFrmAxSRV4FExcClLLoM0oGKY";
    const baseUrl = "https://aeroapi.flightaware.com/aeroapi/flights/";
    const TZ = "America/Santo_Domingo";
   
    const results = [];

    for (const code of flightCodes) {
      try {
        const convertedCode = convertFlightCode(code);          
        const response = await fetch(`${baseUrl}${convertedCode}`, {
          headers: {
            "Accept": "application/json",
            "x-apikey": apiKey
          }
        });

        if (!response.ok) {
          results.push({ code, error: `HTTP ${response.status}: ${response.statusText}` });
          continue;
        }

        const data = await response.json();

        if (!data.flights || data.flights.length === 0) {
          results.push({ code, message: "No data found" });
          continue;
        }

        // Find flight where PUJ is the destination
        const pujFlight = data.flights.find((flight: any) => 
          flight.destination?.code_iata === "PUJ"
        );

        if (!pujFlight) {
          results.push({ code, message: "No flight to PUJ found" });
          continue;
        }

        // 12h formatter pinned to Santo Domingo time
        const to12Hour = (iso: string) => {
          if (!iso) return null;
          return new Intl.DateTimeFormat("en-US", {
            timeZone: TZ, hour: "numeric", minute: "2-digit", hour12: true
          }).format(new Date(iso));
        };

        results.push({
          code,
          departure_airport: pujFlight.origin?.code_iata || undefined,
          arrival_airport: pujFlight.destination?.code_iata || undefined,
          scheduled_out: to12Hour(pujFlight.scheduled_out) || undefined,
          scheduled_in: to12Hour(pujFlight.scheduled_in) || undefined,
          status: pujFlight.status
        });
      } catch (err) {
        results.push({ code, error: (err as Error).message });
      }
    }
    
    return NextResponse.json(results);
  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

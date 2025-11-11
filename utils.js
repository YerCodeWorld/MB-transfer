function downloadPDF() {
    // Method 1: Using window.print() with CSS
    const element = document.querySelector('.voucher-container');

    // Create a new window for printing
    const printWindow = window.open('', '_blank');

    // Get all stylesheets
    let styles = '';
    for (let i = 0; i < document.styleSheets.length; i++) {
        styles += `<link rel="stylesheet" href="${document.styleSheets[i].href}">`;
    }

    // Build the HTML content
    printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
    <meta charset="UTF-8">
    <title>Voucher</title>
    ${styles}
    <style>
    @page {
        size: landscape;
        margin: 0;
    }
    @media print {
        body {
            margin: 0;
            padding: 0;
        }
        .voucher-container {
            width: 100vw;
            height: 100vh;
            page-break-inside: avoid;
        }
    }
    body {
        margin: 0;
        padding: 0;
    }
    </style>
    </head>
    <body>
    ${element.outerHTML}
    </body>
    </html>
    `);

    // Wait for content to load then print
    printWindow.document.close();
    printWindow.onload = function() {
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    };
}

async function fetchFlightTimes(flightCodes, forTomorrow = true) {
    const apiKey = "FTRH5ucRFrmAxSRV4FExcClLLoM0oGKY";
    const baseUrl = "https://aeroapi.flightaware.com/aeroapi/flights/";

    // Calculate the correct date
    const date = new Date();
    if (forTomorrow) date.setDate(date.getDate() + 1);
    const yyyyMmDd = date.toISOString().split("T")[0];

    const start = new Date(date.setHours(0, 0, 0, 0)).toISOString();
    const end = new Date(date.setHours(23, 59, 0, 0)).toISOString();

    // Helper to convert ISO to 12h time
    const to12Hour = iso => {
        if (!iso) return null;
        const date = new Date(iso);
        let h = date.getHours(), m = date.getMinutes();
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12;
        return `${h}:${m.toString().padStart(2, "0")} ${ampm}`;
    };

    const results = [];

    for (const code of flightCodes) {
        try {
            const response = await fetch(`${baseUrl}${code}?start=${start}&end=${end}`, {
                headers: {
                    "Accept": "application/json",
                    "x-apikey": apiKey
                }
            });

            const data = await response.json();

            // console.log(data);

            if (!data.flights || data.flights.length === 0) {
                results.push({ code, message: "No data found" });
                continue;
            }

            // Grab the first flight result for simplicity
            const flight = data.flights[0];

            results.push({
                code,
                departure_airport: flight.origin?.code_iata || null,
                arrival_airport: flight.destination?.code_iata || null,
                scheduled_out: to12Hour(flight.scheduled_out),
                scheduled_in: to12Hour(flight.scheduled_in),
                status: flight.status
            });
        } catch (err) {
            results.push({ code, error: err.message });
        }
    }

    return results;
}


function validateForm() {
    const form = document.querySelector("form");
    const formData = new FormData(form);
    const data = {};

    for (const [key, value] of formData.entries()) {
        if (!value.trim()) {
            alert(`Please fill out the "${key}" field.`);
            form.querySelector(`[name="${key}"]`).focus();
            return false;
        }
        data[key] = value.trim();
    }

    // Optional extra validation
    if (isNaN(data.pax) || data.pax <= 0) {
        alert("Please enter a valid PAX number greater than 0.");
        form.querySelector('[name="pax"]').focus();
        return false;
    }

    console.log("✅ Form Data:", data);
    return false; // prevent actual form submission (for now)
}

async function fetchAtData() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyyMmDd = tomorrow.toISOString().split("T")[0];

    const url = `https://api.airporttransfer.com/api/bookings?filters%5Bselected_date%5D=${yyyyMmDd}&pag`;

    const headers = {
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36",
        "Accept": "application/json, text/plain, */*",
        "Origin": "https://airporttransfer.com",
        "Referer": "https://airporttransfer.com/",
        "Authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiMjNiOWZjNmI4MzhhNTVkYjJlY2YyZWVhNDFmNzE0NTQ0ZGYzYzViMjdkZjRkMGIwMzZiNDA0ZTVhOGUwZGViM2E1ODk4ODM1YTg5YTQ0NWUiLCJpYXQiOjE3NDQwNzk3MTQuNDk3MzAyLCJuYmYiOjE3NDQwNzk3MTQuNDk3MzA0LCJleHAiOjE3NzU2MTU3MTQuNDg3OTk5LCJzdWIiOiIyODk0Iiwic2NvcGVzIjpbXX0.JEvYlv7aYr19Nv2XBgsXyKYINAFQs1RJ3VRUL0c2tKgkAv78Ld4DB6wbzqGrUEiZKVYaPmNebLCkOnzSiFSZ_Gml5IFZe8mQYBLzO5B90r6d3bdd1Emo9XV_31xrvzqBokmG3aznCc3dsnhHNiyz6l_1SW8vqmMddP1nstPD2Vvz-4YGlLs4qKKqhWHimY1tvcxtWLaQ4yo0uBRy5N9dE9RbZMI2MG1RGtG1XYbL3Galex4H1mdrr2jGSWuvVzfEsJ-8OC9ElziD_abW7QnceRkZhqsp0SN9G-iQTV7sri4XWCpVp0LbamNTvtvN16buflphtWSpxeSH6HDPh6ZTdI8rRsMpD8evH_fLoh6zSeZXrGNLXUsHRdITVTeufYFVtf0sLcsRDuzVOALon-UrCLrSEpAcEBE4PL1BsisRlH5ZSDlG_L_RLJEQ1COT1ACWLClgVjWldk7SrKbtHbjExsyJs5eNYRz2_TyW0vGfzSp4nUJUaI96cDVtnJPLpzv5jDRDZdYPtzKgczbO8Ag3zKAkO127I4qqWOwCxepqhQ-wW1jCjtNzlXyzimiM3ulVAlgKOrOKqp7DZ3Odqo3wqJsBrLmDODWm1SBrN1WW-MBm9SitDEzTtj7C6ZYrpHBYAwgVZJFha0iblwDfEn9h56qYaOINlhplVmAMdeVRV3I"
    };

    try {
        const res = await fetch(url, { headers });
        if (!res.ok) throw new Error("Request failed");
        const data = await res.json();
        console.log(data);
        return { bookings: data, date: yyyyMmDd }; // <-- ✅ Return data
    } catch (err) {
        console.error("❌ Error:", err);
        return null;
    }
}

function extractServices(bookings, targetDateStr) {
    const targetDate = new Date(targetDateStr);

    function determineType(reservation) {
        const pickup = reservation.pickup_location?.name || "";
        const dropoff = reservation.drop_of_location?.name || "";
        const returnDateStr = reservation.travel?.return;

        if (returnDateStr) {
            const returnDate = new Date(returnDateStr.split("T")[0]);
            if (returnDate.toDateString() === targetDate.toDateString()) {
                return "Departure";
            }
        }

        if (pickup.includes("Airport")) return "Arrival";
        if (dropoff.includes("Airport")) return "Departure";
        return "Unknown";
    }

    return bookings.map(res => {
        const pax = res.travelers?.adult + res.travelers?.children + res.travelers?.infant;
        return {
            code: res.reservation_no,
            type: determineType(res),
            passenger: `${res.passenger?.name || ""} ${res.passenger?.surname || ""}`.trim(),
            flight: res.travel?.flight_number || "",
            time: res.travel?.flight_arrival || "", // reference only
            vehicule: res.segment,
            pax,
            from: res.pickup_location?.name || "",
            to: res.drop_of_location?.name || "",
        };
    });
}

// =================================

function getFlightsData(codes) {
    // just examples, need to get these from params
    const flightCodes = codes === undefined ? ["AA2641", "AA1965", "F906", "BA2205", "BA2205"] : codes

    // this, i suspect, logs undefined
    fetchFlightTimes(flightCodes, true)
    .then(results => console.log("RESULTS: ", results))
    .catch(err => console.error("Error fetching flights:", err));
}


function createAtServices() {
    fetchAtData().then(result => {
        if (result) {
            const services = extractServices(result.bookings, result.date);
            console.log(services);
        }
    }).catch(err => console.error("Fetch error:", err));
}

// fetchAtData();
createAtServices();

// getFlightsData();

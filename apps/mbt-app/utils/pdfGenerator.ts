import { ServiceInput } from '../types/services';

interface ExtendedService extends ServiceInput {
  serviceType: 'at' | 'st' | 'mbt';
}

export interface VoucherData {
  clientName: string;
  hotel: string;
  pax: number;
  time: string;
  date: string;
  company: 'at' | 'st' | 'mbt';
  serviceType: 'ARRIVAL' | 'DEPARTURE' | 'TRANSFER';
  flightCode?: string;
}

// Convert service data to voucher data
export function serviceToVoucherData(service: ExtendedService, selectedDate: string): VoucherData {
  // Format date from YYYY-MM-DD to DD/MM/YYYY
  const formatDate = (dateStr: string): string => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  // Format time for display
  const formatTime = (isoTime: string): string => {
    if (service.serviceType === 'at') {
      // For AT services, convert from ISO time
      const date = new Date(isoTime);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'America/Santo_Domingo'
      });
    } else {
      // For ST/MBT services, time might already be formatted
      if (isoTime.includes('T')) {
        const date = new Date(isoTime);
        return date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
          timeZone: 'America/Santo_Domingo'
        });
      }
      return isoTime; // Already formatted
    }
  };

  // Smart hotel/location logic
  let hotelLocation = 'Hotel';
  if (service.pdfData?.hotel) {
    hotelLocation = service.pdfData.hotel;
  } else {
    // For arrival services, use dropoff location (hotel)
    // For departure services, use pickup location (hotel)  
    // For transfers, prefer the non-airport location
    if (service.kindOf === 'ARRIVAL') {
      hotelLocation = service.dropoffLocation || service.pickupLocation || 'Hotel';
    } else if (service.kindOf === 'DEPARTURE') {
      hotelLocation = service.pickupLocation || service.dropoffLocation || 'Hotel';
    } else {
      // For transfers, try to pick the non-airport location
      const pickup = service.pickupLocation?.toLowerCase() || '';
      const dropoff = service.dropoffLocation?.toLowerCase() || '';
      
      if (pickup.includes('airport') || pickup.includes('aeropuerto')) {
        hotelLocation = service.dropoffLocation || service.pickupLocation || 'Hotel';
      } else if (dropoff.includes('airport') || dropoff.includes('aeropuerto')) {
        hotelLocation = service.pickupLocation || service.dropoffLocation || 'Hotel';
      } else {
        // Neither is clearly an airport, use pickup
        hotelLocation = service.pickupLocation || service.dropoffLocation || 'Hotel';
      }
    }
  }

  return {
    clientName: service.pdfData?.clientName || service.clientName,
    hotel: hotelLocation,
    pax: service.pdfData?.pax || service.pax,
    time: service.pdfData?.time || formatTime(service.pickupTime),
    date: formatDate(selectedDate),
    company: service.serviceType || 'mbt',
    serviceType: service.kindOf,
    flightCode: service.pdfData?.flightCode || service.flightCode
  };
}

// Generate PDF using browser's Print API (much more reliable than html2canvas)
export async function generatePDFFromElement(
  element: HTMLElement,
  filename: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      
      if (!printWindow) {
        throw new Error('Unable to open print window. Please allow popups for this site.');
      }

      // Get current styles - we need to embed them directly
      const styles = Array.from(document.styleSheets)
        .map(stylesheet => {
          try {
            // Try to get external stylesheet content
            if (stylesheet.href) {
              return `<link rel="stylesheet" href="${stylesheet.href}">`;
            } else {
              // For inline styles, get the rules
              const rules = Array.from(stylesheet.cssRules || [])
                .map(rule => rule.cssText)
                .join('\n');
              return `<style>${rules}</style>`;
            }
          } catch (e) {
            // Fallback for external stylesheets
            return stylesheet.href ? `<link rel="stylesheet" href="${stylesheet.href}">` : '';
          }
        })
        .join('\n');

      // Build the print-ready HTML
      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>${filename}</title>
            ${styles}
            <style>
                @page {
                    size: landscape;
                    margin: 0;
                }
                
                body, html {
                    margin: 0;
                    padding: 0;
                    background-color: #FFFFFE;
                    font-family: Arial, sans-serif;
                    height: 100%;
                    width: 100%;
                }
                
                .voucher-container {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    max-height: 775px;
                    background-color: #FFFFFE;
                    overflow: hidden;
                    padding: 0;
                    box-sizing: border-box;
                    max-width: 1000px;
                    margin: 0 auto;
                }
                
                @media print {
                    * {
                        -webkit-print-color-adjust: exact !important;
                        color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    
                    body, html {
                        margin: 0 !important;
                        padding: 0 !important;
                        width: 100% !important;
                        height: 100% !important;
                        overflow: hidden !important;
                        background-color: #1a1a1a;
                    }
                    
                    .voucher-container {
                        width: 100% !important;
                        height: 100vh !important;
                        max-width: none !important;
                        max-height: none !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        page-break-inside: avoid !important;
                        position: relative !important;
                        background-color: #FFFFFE !important;
                    }
                    
                    /* Hide any elements that might interfere */
                    .modal-overlay,
                    .modal-content,
                    button,
                    .preview-controls {
                        display: none !important;
                    }
                }
            </style>
        </head>
        <body>            
            ${element.outerHTML}
        </body>
        </html>
      `;

      // Write content to the new window
      printWindow.document.write(printContent);
      printWindow.document.close();

      // Wait for content to load, then trigger print
      printWindow.onload = function() {
        setTimeout(() => {
          printWindow.print();
          
          // Close the window after a short delay
          setTimeout(() => {
            printWindow.close();
            resolve();
          }, 1000);
          
        }, 500); // Give time for styles to load
      };

      // Handle print dialog cancel/close
      printWindow.onbeforeunload = function() {
        setTimeout(() => {
          resolve(); // Resolve anyway, user might have saved or cancelled
        }, 100);
      };

      // Timeout fallback
      setTimeout(() => {
        if (!printWindow.closed) {
          printWindow.close();
        }
        resolve();
      }, 30000); // 30 second timeout

    } catch (error) {
      console.error('Error generating PDF:', error);
      reject(new Error('Error al abrir la ventana de impresión. Verifica que los popups estén permitidos.'));
    }
  });
}

// Generate single PDF for a service
export async function generateServicePDF(
  service: ExtendedService,
  selectedDate: string,
  elementId: string
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Voucher element not found');
  }

  const companyMap = {
    'at': 'AT',
    'st': 'ST', 
    'mbt': 'MBT'
  };

  const filename = `${service.clientName} - ${companyMap[service.serviceType]}.pdf`;
  
  await generatePDFFromElement(element, filename);
}

// Generate multiple PDFs (Note: Print API shows one dialog per PDF)
export async function generateBulkPDFs(
  services: ExtendedService[],
  selectedDate: string,
  onProgress?: (current: number, total: number) => void
): Promise<void> {
  const companyMap = {
    'at': 'AT',
    'st': 'ST',
    'mbt': 'MBT'
  };

  // Note: With Print API, each PDF will open a separate print dialog
  // The user will need to save each one individually
  for (let i = 0; i < services.length; i++) {
    const service = services[i];
    
    // Report progress
    if (onProgress) {
      onProgress(i + 1, services.length);
    }

    try {
      // This will be handled in the modal component where the voucher is rendered
      const filename = `${service.clientName} - ${companyMap[service.serviceType]}.pdf`;
      console.log(`Preparing PDF: ${filename}`);
      
      // Delay between PDFs to give user time to handle print dialogs
      if (i < services.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
    } catch (error) {
      console.error(`Error generating PDF for ${service.clientName}:`, error);
    }
  }
}

// Preview voucher data (for testing)
export function previewVoucherData(service: ExtendedService, selectedDate: string): VoucherData {
  return serviceToVoucherData(service, selectedDate);
}

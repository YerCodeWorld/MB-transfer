/**
 * Utility functions for consistent date handling across the application
 */

/**
 * Converts a Date object to YYYY-MM-DD format in local timezone
 * This ensures consistent date formatting regardless of timezone
 */
export const toYMDLocal = (date: Date): string => {  
  
  const tz = "America/Santo_Domingo";

  // this was causing headaches 
  // const year = date.getFullYear();
  // const month = String(date.getMonth() + 1).padStart(2, "0");
  // const day = String(date.getDate()).padStart(2, "0");

  const y = date.toLocaleString("es-Es", {
    year: "numeric", timeZone: tz
  });
  
  const m = date.toLocaleString("es-Es", 
    { month: "2-digit", timeZone: tz }
  );
  
  const d = date.toLocaleString("es-Es", 
    { day: "2-digit", timeZone: tz }
  ).padStart(2, "0");

  return `${y}-${m}-${d}`;
};

/**
 * Gets today's date in YYYY-MM-DD format in local timezone
 */
export const getTodayLocal = (): string => {
  return toYMDLocal(new Date());
};

/**
 * Parses a YYYY-MM-DD string into a Date object in local timezone
 */
export const parseYMDLocal = (ymdString: string): Date => {
  const [year, month, day] = ymdString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

/**
 * Checks if two dates are the same day (ignores time)
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
};

/**
 * Gets the start of the calendar grid (6x7 weeks) for a given date
 */
export const startOfGrid = (date: Date): Date => {
  const firstOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const dayOfWeek = firstOfMonth.getDay();
  const start = new Date(firstOfMonth);
  start.setDate(firstOfMonth.getDate() - dayOfWeek);
  return start;
};

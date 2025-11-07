// lib/timezone.ts
// All date/time operations use America/Toronto timezone since game times in the database are stored in this timezone

const TORONTO_TIMEZONE = "America/Toronto";

/**
 * Get today's date string (YYYY-MM-DD) in America/Toronto timezone
 */
export function getTodayInToronto(): string {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: TORONTO_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(now);
}

/**
 * Get the current year in America/Toronto timezone
 */
export function getCurrentYearInToronto(): number {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: TORONTO_TIMEZONE,
    year: "numeric",
  });
  return parseInt(formatter.format(now), 10);
}

/**
 * Get current time components in America/Toronto timezone
 * Returns an object with year, month, day, hours, minutes, seconds
 */
export function getNowComponentsInToronto() {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: TORONTO_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  
  const parts = formatter.formatToParts(now);
  return {
    year: parseInt(parts.find(p => p.type === "year")?.value || "0", 10),
    month: parseInt(parts.find(p => p.type === "month")?.value || "0", 10),
    day: parseInt(parts.find(p => p.type === "day")?.value || "0", 10),
    hours: parseInt(parts.find(p => p.type === "hour")?.value || "0", 10),
    minutes: parseInt(parts.find(p => p.type === "minute")?.value || "0", 10),
    seconds: parseInt(parts.find(p => p.type === "second")?.value || "0", 10),
  };
}

/**
 * Compare if a date string (YYYY-MM-DD) represents today in America/Toronto
 */
export function isTodayInToronto(dateStr: string): boolean {
  const today = getTodayInToronto();
  return dateStr === today;
}

/**
 * Compare if a date string (YYYY-MM-DD) is before today in America/Toronto
 */
export function isBeforeTodayInToronto(dateStr: string): boolean {
  const today = getTodayInToronto();
  return dateStr < today;
}

/**
 * Compare if a date string (YYYY-MM-DD) is after today in America/Toronto
 */
export function isAfterTodayInToronto(dateStr: string): boolean {
  const today = getTodayInToronto();
  return dateStr > today;
}

/**
 * Add days to a date string (YYYY-MM-DD) and return new date string
 */
export function addDaysToDate(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  
  const newYear = date.getFullYear();
  const newMonth = String(date.getMonth() + 1).padStart(2, "0");
  const newDay = String(date.getDate()).padStart(2, "0");
  return `${newYear}-${newMonth}-${newDay}`;
}

/**
 * Compare a game datetime (date + time) with current time in Toronto
 * Returns: -1 if game is in the past, 0 if game is now, 1 if game is in the future
 * This comparison is done in America/Toronto timezone context
 */
export function compareGameTimeWithNow(dateStr: string, timeStr: string): number {
  const now = getNowComponentsInToronto();
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hours = 0, minutes = 0, seconds = 0] = timeStr.split(":").map(Number);
  
  // Compare date first
  if (year < now.year) return -1;
  if (year > now.year) return 1;
  if (month < now.month) return -1;
  if (month > now.month) return 1;
  if (day < now.day) return -1;
  if (day > now.day) return 1;
  
  // Same date, compare time
  if (hours < now.hours) return -1;
  if (hours > now.hours) return 1;
  if (minutes < now.minutes) return -1;
  if (minutes > now.minutes) return 1;
  if (seconds < now.seconds) return -1;
  if (seconds > now.seconds) return 1;
  
  return 0;
}

/**
 * Check if a datetime is in the past relative to now in Toronto
 */
export function isPastInToronto(dateStr: string, timeStr: string): boolean {
  return compareGameTimeWithNow(dateStr, timeStr) < 0;
}

/**
 * Check if a datetime is in the future relative to now in Toronto
 */
export function isFutureInToronto(dateStr: string, timeStr: string): boolean {
  return compareGameTimeWithNow(dateStr, timeStr) > 0;
}

/**
 * Get timestamp for a datetime in Toronto (for sorting/comparison purposes)
 * This creates a comparable number where larger = later in time
 */
export function getTorontoTimestamp(dateStr: string, timeStr: string): number {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hours = 0, minutes = 0, seconds = 0] = timeStr.split(":").map(Number);
  
  // Create a timestamp by converting to total seconds since a reference point
  // This gives us a comparable number where both sides are in Toronto context
  // We'll use a simple approach: convert to seconds since epoch, but adjusted
  
  // For accurate comparison with "now in Toronto", we need both in same timezone
  // Since we're comparing relative times (both in Toronto), we can use a simpler method
  
  // Create date components and convert to a sortable number
  // We'll use year*10000000000 + month*100000000 + day*1000000 + hours*10000 + minutes*100 + seconds
  // This gives us a number where larger = later, and it works for our comparison needs
  return year * 10000000000 + month * 100000000 + day * 1000000 + hours * 10000 + minutes * 100 + seconds;
}

/**
 * Get current timestamp in Toronto (for comparison with game timestamps)
 */
export function getNowTimestampInToronto(): number {
  const now = getNowComponentsInToronto();
  return getTorontoTimestamp(
    `${now.year}-${String(now.month).padStart(2, "0")}-${String(now.day).padStart(2, "0")}`,
    `${String(now.hours).padStart(2, "0")}:${String(now.minutes).padStart(2, "0")}:${String(now.seconds).padStart(2, "0")}`
  );
}

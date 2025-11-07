// lib/weather.ts
import { isBeforeTodayInToronto, addDaysToDate } from "./timezone";

export type WeatherHour = {
  time: string;
  temperature_c: number;
  apparent_temperature_c: number;
  precipitation_mm: number;
  precipitation_probability: number;
  snowfall_cm: number;
  wind_kmh: number;
};

const OPEN_METEO_FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const OPEN_METEO_HISTORICAL_URL = "https://archive-api.open-meteo.com/v1/archive";

/**
 * Round down game time to the nearest hour
 * e.g., "13:00:00" -> 13, "16:25:00" -> 16
 */
function roundDownToHour(timeStr: string | null): number {
  if (!timeStr) return 0;
  const [hours] = timeStr.split(":");
  return parseInt(hours, 10);
}

/**
 * Format date and hour into ISO string for OpenMeteo
 */
function formatDateTimeForWeather(dateStr: string | null, hour: number): string {
  if (!dateStr) {
    throw new Error("Date is required");
  }
  // Format: "2025-11-09T13:00"
  return `${dateStr}T${hour.toString().padStart(2, "0")}:00`;
}

/**
 * Fetch 4 hours of weather data from OpenMeteo
 */
export async function getFourHoursWeather(
  latitude: number,
  longitude: number,
  gameDate: string | null,
  gameTime: string | null,
  timezone: string
): Promise<WeatherHour[]> {
  if (!gameDate || !gameTime) {
    return [];
  }

  const startHour = roundDownToHour(gameTime);
  const startDateTime = formatDateTimeForWeather(gameDate, startHour);

  // Calculate end date (might be same day or next day)
  // Since we're adding 4 hours, we might cross midnight
  // Use timezone-aware date arithmetic
  const endHour = startHour + 4;
  let endDateStr = gameDate;
  
  // If adding 4 hours crosses midnight (24:00), we need the next day
  if (endHour >= 24) {
    endDateStr = addDaysToDate(gameDate, 1);
  }
  
  const startDateStr = gameDate;

  // Determine if we need historical data (past dates) or forecast (future dates)
  // Compare dates in America/Toronto timezone context
  const isHistorical = isBeforeTodayInToronto(gameDate);

  const baseUrl = isHistorical ? OPEN_METEO_HISTORICAL_URL : OPEN_METEO_FORECAST_URL;

  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    hourly: "temperature_2m,apparent_temperature,precipitation,precipitation_probability,wind_speed_10m,snowfall",
    timezone: timezone,
    windspeed_unit: "kmh",
    precipitation_unit: "mm",
    snowfall_unit: "cm",
    start_date: startDateStr,
    end_date: endDateStr,
  });

  try {
    const response = await fetch(`${baseUrl}?${params.toString()}`);
    if (!response.ok) {
      console.error(`OpenMeteo API error: ${response.status} for ${gameDate}`);
      return [];
    }

    const data = await response.json();
    const hourly = data.hourly;

    if (!hourly || !hourly.time) {
      return [];
    }

    // Find the index of the start hour
    // The API returns times in the timezone we specified, format: "2025-11-09T13:00" or "2025-11-09T13:00:00"
    const startHourStr = startHour.toString().padStart(2, "0");
    const times = hourly.time as string[];
    
    // Look for the time that matches our start hour
    // We match by checking if the time string contains the date and hour
    // The API returns times in the specified timezone, so we need to match exactly
    let startIndex = -1;
    
    // First try exact match with the game date
    startIndex = times.findIndex((t) => {
      // Extract date and hour from the time string
      const match = t.match(/^(\d{4}-\d{2}-\d{2})T(\d{2})/);
      if (!match) return false;
      const [, date, hour] = match;
      return date === gameDate && hour === startHourStr;
    });

    // If exact match not found, try to find the first hour >= start hour on the same date
    if (startIndex === -1) {
      startIndex = times.findIndex((t) => {
        const match = t.match(/^(\d{4}-\d{2}-\d{2})T(\d{2})/);
        if (!match) return false;
        const [, date, hour] = match;
        if (date !== gameDate) return false;
        return parseInt(hour, 10) >= startHour;
      });
    }

    // If still not found, the date might have shifted due to timezone
    // Try searching in the previous day (in case date shifted backward)
    if (startIndex === -1) {
      const prevDateStr = addDaysToDate(gameDate, -1);
      
      startIndex = times.findIndex((t) => {
        const match = t.match(/^(\d{4}-\d{2}-\d{2})T(\d{2})/);
        if (!match) return false;
        const [, date, hour] = match;
        return date === prevDateStr && parseInt(hour, 10) >= startHour;
      });
    }

    // If still not found, try next day (in case date shifted forward)
    if (startIndex === -1) {
      const nextDateStr = addDaysToDate(gameDate, 1);
      
      startIndex = times.findIndex((t) => {
        const match = t.match(/^(\d{4}-\d{2}-\d{2})T(\d{2})/);
        if (!match) return false;
        const [, date, hour] = match;
        return date === nextDateStr && parseInt(hour, 10) >= startHour;
      });
    }

    // Last resort: find any time that matches the hour (ignore date)
    if (startIndex === -1) {
      startIndex = times.findIndex((t) => {
        const match = t.match(/T(\d{2})/);
        if (!match) return false;
        const hour = parseInt(match[1], 10);
        return hour === startHour || hour === startHour + 1;
      });
    }

    if (startIndex === -1) {
      console.error(`Could not find weather data for ${gameDate} at hour ${startHour}. Available times:`, times.slice(0, 10));
      return [];
    }

    // Get 4 hours of data
    const weatherHours: WeatherHour[] = [];
    const temperatures = hourly.temperature_2m || [];
    const apparentTemperatures = hourly.apparent_temperature || [];
    const precipitations = hourly.precipitation || [];
    const precipitationProbabilities = hourly.precipitation_probability || [];
    const winds = hourly.wind_speed_10m || [];
    const snowfalls = hourly.snowfall || [];

    for (let i = 0; i < 4 && startIndex + i < times.length; i++) {
      const idx = startIndex + i;
      weatherHours.push({
        time: times[idx],
        temperature_c: temperatures[idx] ?? 0,
        apparent_temperature_c: apparentTemperatures[idx] ?? temperatures[idx] ?? 0,
        precipitation_mm: precipitations[idx] ?? 0,
        precipitation_probability: precipitationProbabilities[idx] ?? 0,
        snowfall_cm: snowfalls[idx] ?? 0,
        wind_kmh: winds[idx] ?? 0,
      });
    }

    return weatherHours;
  } catch (error) {
    console.error("Error fetching weather:", error);
    return [];
  }
}

/**
 * Get weather for a game using stadium coordinates and game time
 * Note: Game times in the database are stored in America/Toronto timezone
 */
export async function getGameWeather(
  latitude: number | null,
  longitude: number | null,
  gameDate: string | null,
  gameTime: string | null,
  homeTeam: string
): Promise<WeatherHour[]> {
  if (!latitude || !longitude || !gameDate || !gameTime) {
    return [];
  }

  // Always use America/Toronto timezone since game times in the database are stored in this timezone
  const timezone = "America/Toronto";
  return getFourHoursWeather(latitude, longitude, gameDate, gameTime, timezone);
}


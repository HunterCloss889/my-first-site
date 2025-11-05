import requests
import pandas as pd
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo  # Python 3.9+

OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"

def four_hours_weather(lat: float,
                       lon: float,
                       start_dt_str: str,
                       tz: str = "America/Toronto") -> pd.DataFrame:
    """
    Get 4 hours of hourly weather (temp, precipitation, wind, snowfall)
    starting at the given local datetime.

    Args:
        lat, lon: Coordinates (e.g., Oshawa: 43.90012, -78.84957)
        start_dt_str: Local start datetime in ISO-8601, e.g. "2025-11-05T13:00"
        tz: IANA timezone (e.g., "America/Toronto")

    Returns:
        pandas.DataFrame with 4 hourly rows.
    """
    # Parse start time in local tz and compute end time (+4h)
    start_local = datetime.fromisoformat(start_dt_str).replace(tzinfo=ZoneInfo(tz))
    end_local = start_local + timedelta(hours=4)

    # Open-Meteo slices by DATE, so request the day (and next day if crossing midnight)
    start_date = start_local.date().isoformat()
    end_date = max(start_local.date(), end_local.date()).isoformat()

    params = {
        "latitude": lat,
        "longitude": lon,
        # hourly variables
        "hourly": "temperature_2m,precipitation,wind_speed_10m,snowfall",
        # make timestamps match the local timezone you provided
        "timezone": tz,
        # ensure intuitive units
        "windspeed_unit": "kmh",
        "precipitation_unit": "mm",
        "snowfall_unit": "cm",
        # limit to just the dates we need
        "start_date": start_date,
        "end_date": end_date,
    }

    r = requests.get(OPEN_METEO_URL, params=params, timeout=20)
    r.raise_for_status()
    data = r.json()

    hourly = data.get("hourly", {})
    if not hourly or "time" not in hourly:
        raise RuntimeError("No hourly data returned. Check coordinates/time window.")

    df = pd.DataFrame({
        "time": hourly["time"],
        "temperature_c": hourly.get("temperature_2m", []),
        "precip_mm": hourly.get("precipitation", []),
        "wind_kmh": hourly.get("wind_speed_10m", []),
        "snowfall_cm": hourly.get("snowfall", []),
    })

    # Parse times as timezone-aware datetimes in the same tz we requested
    df["time"] = pd.to_datetime(df["time"]).dt.tz_localize(ZoneInfo(tz), nonexistent="shift_forward")

    # Filter to [start_local, start_local + 4h)
    mask = (df["time"] >= start_local) & (df["time"] < end_local)
    out = df.loc[mask].copy()

    # Ensure exactly 4 rows (if the start time aligns with the top of the hour)
    # If fewer are available (e.g., start near the forecast horizon), you'll get fewer.
    return out.reset_index(drop=True)


if __name__ == "__main__":
    # ---- Example usage ----
    # Oshawa, ON: 43.90012, -78.84957
    lat = 43.90012
    lon = -78.84957
    tz = "America/Toronto"

    # Start at a local time (24h). Adjust as needed.
    # Example: 1 PM on Nov 5, 2025
    start_local_iso = "2025-11-06T13:00"

    df = four_hours_weather(lat, lon, start_local_iso, tz)
    if df.empty:
        print("No data found for the requested 4-hour window (maybe out of forecast range?).")
    else:
        # Pretty print
        print(df.to_string(index=False))

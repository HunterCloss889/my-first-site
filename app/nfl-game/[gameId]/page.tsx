import { getGameById, getStatsByTeamAndSeason, getDefensiveRankings, getStadiumName, getStadiumRoof, getStadiumCoordinates, type PlayerGameRow } from "@/lib/db";
import { getGameWeather } from "@/lib/weather";
import StatsClient from "./StatsClient";
import Link from "next/link";
import TeamLogo from "./TeamLogo";
import Image from "next/image";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ gameId: string }>;
  searchParams: Promise<{ week?: string }>;
};

export default async function GamePage({ params, searchParams }: PageProps) {
  const { gameId } = await params;
  const { week } = await searchParams;
  const game = await getGameById(gameId);

  if (!game) {
    return (
      <>
        {/* HEADER WITH LOGO */}
        <header className="navbar" style={{ marginBottom: "1rem" }}>
          <div className="wrapper nav-inner">
            <Link href="/" style={{ display: "flex", alignItems: "center", position: "relative", zIndex: 101 }}>
              <Image 
                src="/logo_no_words.png" 
                alt="Props Tracker" 
                width={40} 
                height={40}
                style={{ height: "40px", width: "auto", display: "block", opacity: 1 }}
                priority
              />
            </Link>
          </div>
        </header>
        <main className="wrapper">
          <div style={{ marginBottom: "1rem" }}>
            <Link href={week ? `/nfl?week=${week}` : "/nfl"} className="back-button">
              ← Back to Schedule
            </Link>
          </div>
          <section className="hero-card">
            <div className="hero-eyebrow">Game</div>
            <h1 className="hero-title">Game not found</h1>
          </section>
        </main>
      </>
    );
  }

  const season = game.season;
  const away = game.away_team;
  const home = game.home_team;

  const isNeutral = game.location?.toLowerCase() === "neutral";
  
  const [awayRows, homeRows, rankings, stadiumName, fetchedStadiumRoof, stadiumCoords] = await Promise.all([
    getStatsByTeamAndSeason(away, season),
    getStatsByTeamAndSeason(home, season),
    getDefensiveRankings(season),
    isNeutral ? Promise.resolve(null) : getStadiumName(game.stadium_id),
    isNeutral ? Promise.resolve(null) : getStadiumRoof(game.stadium_id),
    isNeutral ? Promise.resolve(null) : getStadiumCoordinates(game.stadium_id),
  ]);
  
  // Use roof from game data if available, otherwise use fetched roof
  const stadiumRoof = game.roof || fetchedStadiumRoof;
  const rows: PlayerGameRow[] = [...awayRows, ...homeRows];
  
  const awayDef = rankings.find(r => r.team.toLowerCase() === away.toLowerCase());
  const homeDef = rankings.find(r => r.team.toLowerCase() === home.toLowerCase());

  // Fetch weather data only for non-neutral games
  const weatherHours = !isNeutral && stadiumCoords 
    ? await getGameWeather(
        stadiumCoords.latitude,
        stadiumCoords.longitude,
        game.gameday,
        game.gametime,
        home
      )
    : [];

  const formatTime12h = (time: string | null) => {
    if (!time) return "";
    const [hhStr, mmStr] = time.split(":");
    let hh = Number(hhStr);
    const mm = mmStr ?? "00";
    const ampm = hh >= 12 ? "PM" : "AM";
    hh = hh % 12;
    if (hh === 0) hh = 12;
    return `${hh}:${mm} ${ampm}`;
  };

  const formatWeatherTime = (timeStr: string) => {
    // Format: "2025-11-09T13:00" or "2025-11-09T13:00:00"
    const date = new Date(timeStr);
    let hours = date.getHours();
    const ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12;
    if (hours === 0) hours = 12;
    return `${hours}${ampm}`;
  };

  const getWeatherIcon = (precip: number, snow: number) => {
    if (snow > 0.1) return "❄️"; // Snow
    if (precip > 0.1) return "🌧️"; // Rain
    return "☁️"; // Cloudy
  };

  const formatRoofType = (roof: string | null): string | null => {
    if (!roof) return null;
    const roofLower = roof.toLowerCase();
    if (roofLower === "outdoors") return "open roof";
    if (roofLower === "closed") return "closed roof";
    return roof; // dome and others stay the same
  };

  return (
    <>
      {/* HEADER WITH LOGO */}
      <header className="navbar" style={{ marginBottom: "1rem" }}>
        <div className="wrapper nav-inner">
          <Link href="/" style={{ display: "flex", alignItems: "center", position: "relative", zIndex: 101 }}>
            <Image 
              src="/logo_no_words.png" 
              alt="Props Tracker" 
              width={40} 
              height={40}
              style={{ height: "40px", width: "auto", display: "block", opacity: 1 }}
              priority
            />
          </Link>
        </div>
      </header>
      <main className="wrapper" style={{ position: "relative", overflow: "hidden" }}>
      {/* Blurred background logos */}
      <div style={{
        position: "fixed",
        left: "-50px",
        top: "50%",
        transform: "translateY(-50%)",
        width: "600px",
        height: "600px",
        opacity: 0.3,
        filter: "blur(12px)",
        zIndex: 0,
        pointerEvents: "none",
      }}>
        <img
          src={`/team-logos/${away.toLowerCase()}.png`}
          alt=""
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
        />
      </div>
      <div style={{
        position: "fixed",
        right: "-50px",
        top: "50%",
        transform: "translateY(-50%)",
        width: "600px",
        height: "600px",
        opacity: 0.3,
        filter: "blur(12px)",
        zIndex: 0,
        pointerEvents: "none",
      }}>
        <img
          src={`/team-logos/${home.toLowerCase()}.png`}
          alt=""
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
        />
      </div>
      
      <div style={{ position: "relative", zIndex: 1 }}>
      <div style={{ marginBottom: "1rem" }}>
        <Link href={week ? `/nfl?week=${week}` : "/nfl"} className="back-button">
          ← Back to Schedule
        </Link>
      </div>
      <section className="hero-card">
        <div className="hero-eyebrow">Game</div>
        <h1 className="hero-title" style={{ marginBottom: "0.25rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <TeamLogo teamAbbr={away} size={32} />
            <span>{away}</span>
          </div>
          <span>@</span>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>{home}</span>
            <TeamLogo teamAbbr={home} size={32} />
          </div>
        </h1>
        <div style={{ color: "var(--text-dim)", fontWeight: 600, marginBottom: "1rem" }}>
          {game.weekday || ""} {formatTime12h(game.gametime)} • Week {game.week}, {season}
          <div style={{ marginTop: "0.5rem", fontSize: "0.9rem" }}>
            {isNeutral ? "International" : (
              <>
                {stadiumName || ""}
                {stadiumRoof && stadiumName && (
                  <span> • {formatRoofType(stadiumRoof)}</span>
                )}
              </>
            )}
          </div>
        </div>
        
        {/* Weather Forecast */}
        {weatherHours.length > 0 && (
          <div style={{ 
            marginBottom: "1.5rem" 
          }}>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              {weatherHours.map((hour, idx) => {
                const hasPrecip = hour.precipitation_mm > 0.05 || hour.snowfall_cm > 0.05;
                return (
                  <div key={idx} style={{ 
                    backgroundColor: "#1a1a1a",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: 12,
                    padding: "1rem",
                    minWidth: "100px",
                    flex: "1 1 0",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                    color: "#ffffff"
                  }}>
                    {/* Time */}
                    <div style={{ 
                      fontSize: "0.9rem", 
                      fontWeight: 500,
                      color: "#ffffff",
                      marginBottom: "0.25rem"
                    }}>
                      {formatWeatherTime(hour.time)}
                    </div>
                    
                    {/* Weather Icon */}
                    <div style={{ 
                      fontSize: "2rem",
                      marginBottom: "0.25rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "40px"
                    }}>
                      {getWeatherIcon(hour.precipitation_mm, hour.snowfall_cm)}
                    </div>
                    
                    {/* Temperature */}
                    <div style={{ 
                      fontSize: "2rem", 
                      fontWeight: 700,
                      color: "#ffffff",
                      lineHeight: "1.2"
                    }}>
                      {Math.round(hour.temperature_c)}°
                    </div>
                    
                    {/* Feels Like */}
                    <div style={{ 
                      fontSize: "0.75rem",
                      color: "#ffffff",
                      opacity: 0.9,
                      marginTop: "-0.25rem"
                    }}>
                      Feels {Math.round(hour.apparent_temperature_c)}°
                    </div>
                    
                    {/* Bottom row: Precipitation Chance (left) and Wind (right) */}
                    <div style={{ 
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: "0.75rem",
                      marginTop: "0.25rem",
                      gap: "0.5rem"
                    }}>
                      {/* Precipitation Chance */}
                      <div style={{ 
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem",
                        color: "#a0a0a0"
                      }}>
                        <span>🌧️</span>
                        <span>{Math.round(hour.precipitation_probability)}%</span>
                      </div>
                      
                      {/* Wind */}
                      <div style={{ 
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem",
                        color: "#a0a0a0"
                      }}>
                        <span>💨</span>
                        <span>{Math.round(hour.wind_kmh)} km/h</span>
                      </div>
                    </div>
                    
                    {/* Precipitation Amount */}
                    {hasPrecip && (
                      <div style={{ 
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem",
                        fontSize: "0.75rem",
                        color: "#6ba3d8",
                        marginTop: "0.25rem"
                      }}>
                        <span>💧</span>
                        <span>
                          {hour.precipitation_mm > 0.05 
                            ? `${hour.precipitation_mm.toFixed(1)}mm`
                            : hour.snowfall_cm > 0.05
                            ? `${hour.snowfall_cm.toFixed(1)}cm`
                            : ""
                          }
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div style={{ 
          backgroundColor: "rgba(148,163,184,0.08)", 
          border: "1px solid rgba(148,163,184,0.15)", 
          borderRadius: 8, 
          padding: "1rem", 
          marginBottom: "1.5rem" 
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            <div>
              <div style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: "0.5rem", color: "var(--text-dim)" }}>
                {away} Defense
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.85rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-dim)" }}>Pass: Rank {awayDef?.passRank ?? "-"}</span>
                  <span>{awayDef?.passYpg ?? "-"} yds/g</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-dim)" }}>Rush: Rank {awayDef?.rushRank ?? "-"}</span>
                  <span>{awayDef?.rushYpg ?? "-"} yds/g</span>
                </div>
              </div>
            </div>
            <div>
              <div style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: "0.5rem", color: "var(--text-dim)" }}>
                {home} Defense
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.85rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-dim)" }}>Pass: Rank {homeDef?.passRank ?? "-"}</span>
                  <span>{homeDef?.passYpg ?? "-"} yds/g</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-dim)" }}>Rush: Rank {homeDef?.rushRank ?? "-"}</span>
                  <span>{homeDef?.rushYpg ?? "-"} yds/g</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <StatsClient season={season} awayTeam={away} homeTeam={home} rows={rows} />
      </section>
      </div>
    </main>
    </>
  );
}



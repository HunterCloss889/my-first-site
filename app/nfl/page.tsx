"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { getCurrentYearInToronto, getTodayInToronto, getNowTimestampInToronto, getTorontoTimestamp, isTodayInToronto } from "@/lib/timezone";

// Removed player stats types; this page now focuses on schedule only

type GameRow = {
  game_id: string;
  season: number;
  game_type: string | null;
  week: number;
  gameday: string | null;
  weekday: string | null;
  gametime: string | null;
  away_team: string;
  away_score: number | null;
  home_team: string;
  home_score: number | null;
  location: string | null;
  result: string | null;
  total: number | null;
  overtime: number | null;
  old_game_id: string | null;
  gsis: string | null;
  nfl_detail_id: string | null;
  pfr: string | null;
  pff: string | null;
  espn: string | null;
  ftn: string | null;
  away_rest: number | null;
  home_rest: number | null;
  div_game: number | null;
  roof: string | null;
  surface: string | null;
  stadium_id: string | null;
  stadium: string | null;
};

function NFLScheduleContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [games, setGames] = useState<GameRow[]>([]);
  const [gamesError, setGamesError] = useState("");
  const [seasonYear] = useState<number>(getCurrentYearInToronto());
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [availableWeeks, setAvailableWeeks] = useState<number[]>([]);
  const isInitializing = useRef(true);
  const isSettingFromUrl = useRef(false);

  // Stats search removed

  // Helper function to get logo path from team abbreviation
  const getTeamLogoPath = (teamAbbr: string): string => {
    return `/team-logos/${teamAbbr.toLowerCase()}.png`;
  };

  // Update URL when week changes manually (but not during initialization)
  useEffect(() => {
    // Skip URL update during initial load or when setting from URL
    if (isInitializing.current || isSettingFromUrl.current) {
      return;
    }
    
    if (selectedWeek !== null) {
      const urlWeek = searchParams.get("week");
      const urlWeekNum = urlWeek ? Number(urlWeek) : null;
      // Only update URL if it's different from current URL param
      if (urlWeekNum !== selectedWeek) {
        const params = new URLSearchParams();
        params.set("week", String(selectedWeek));
        router.replace(`/nfl?${params.toString()}`, { scroll: false });
      }
    } else if (searchParams.get("week")) {
      // If selectedWeek is null but URL has week param, clear it
      router.replace("/nfl", { scroll: false });
    }
  }, [selectedWeek, router, searchParams]);

  // Determine current week and populate available weeks for current season
  useEffect(() => {
    (async () => {
      try {
        setGamesError("");
        const res = await fetch(`/api/games?season=${seasonYear}`);
      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data.message || `Request failed with ${res.status}`);
      }
        const all: GameRow[] = data.rows || [];

        // weeks present in data
        const wkSet = new Set<number>();
        for (const g of all) if (typeof g.week === "number") wkSet.add(g.week);
        const weeks = Array.from(wkSet).sort((a, b) => a - b);
        setAvailableWeeks(weeks);

        // Check URL parameter first (for back navigation from game page)
        const urlWeek = searchParams.get("week");
        if (urlWeek) {
          const urlWeekNum = Number(urlWeek);
          if (!Number.isNaN(urlWeekNum) && weeks.includes(urlWeekNum)) {
            isSettingFromUrl.current = true;
            setSelectedWeek(urlWeekNum);
            isSettingFromUrl.current = false;
            isInitializing.current = false;
            return;
          }
        }

        // find current week: if any game on today => that week, else next earliest day with a game
        // All dates/times are in America/Toronto timezone
        const todayInToronto = getTodayInToronto();
        const nowTimestamp = getNowTimestampInToronto();

        // Helper to get timestamp for a game (for comparison)
        const getGameTimestamp = (g: GameRow): number => {
          if (!g.gameday) return Number.POSITIVE_INFINITY;
          const timeStr = g.gametime || "12:00:00";
          return getTorontoTimestamp(g.gameday, timeStr);
        };

        let currentWeek: number | null = null;
        // 1) Any game today?
        for (const g of all) {
          if (g.gameday && isTodayInToronto(g.gameday)) {
            currentWeek = g.week;
            break;
          }
        }
        // 2) Otherwise, next earliest game >= now (in Toronto timezone)
        if (currentWeek === null) {
          let bestTimestamp = Number.POSITIVE_INFINITY;
          let bestWeek: number | null = null;
          for (const g of all) {
            const gameTimestamp = getGameTimestamp(g);
            if (gameTimestamp >= nowTimestamp && gameTimestamp < bestTimestamp) {
              bestTimestamp = gameTimestamp;
              bestWeek = g.week;
            }
          }
          // 3) If no future games, fallback to last available week
          currentWeek = bestWeek ?? (weeks.length ? weeks[weeks.length - 1] : null);
        }

        isSettingFromUrl.current = false;
        setSelectedWeek(currentWeek);
        isInitializing.current = false;
      } catch (err: any) {
        console.error("deriveCurrentWeek error", err);
        setGamesError(err?.message ?? "Failed to load games");
      }
    })();
  }, [seasonYear, searchParams]);

  // Load games for the selected week in the current season
  useEffect(() => {
    (async () => {
      if (selectedWeek == null) {
        setGames([]);
        return;
      }
      try {
        setGamesError("");
        const res = await fetch(`/api/games?season=${seasonYear}&week=${selectedWeek}`);
        const data = await res.json();
        if (!res.ok || data.success === false) {
          throw new Error(data.message || `Request failed with ${res.status}`);
        }
        setGames(data.rows || []);
      } catch (err: any) {
        console.error("loadGamesForWeek error", err);
        setGames([]);
        setGamesError(err?.message ?? "Failed to load games");
      }
    })();
  }, [seasonYear, selectedWeek]);

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
          <Link href="/" className="back-button">
            ← Back to Home
          </Link>
        </div>
        <section className="hero-card" style={{ textAlign: "left" }}>
          <div className="hero-eyebrow">Schedule</div>
          <h1 className="hero-title">NFL Schedule</h1>
          <p className="hero-desc" style={{ marginLeft: 0 }}>
            Browse current season games by week and click a game for details.
          </p>
        </section>

        {/* Week 9, 2025 Games */}
        <section style={{ marginTop: "var(--gap-section)" }}>
          <div className="hero-eyebrow">Schedule</div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            <h2 className="hero-title" style={{ fontSize: "1.25rem", margin: 0 }}>
              {seasonYear} • Week {selectedWeek ?? "-"}
            </h2>
            <div>
              <label style={{ marginRight: 8, color: "var(--text-dim)" }}>Week</label>
              <select
                className="week-select"
                value={selectedWeek ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedWeek(val ? Number(val) : null);
                }}
              style={{
                  padding: "0.45rem 0.6rem",
                background: "rgba(148,163,184,0.08)",
                color: "var(--text-primary)",
                  border: "1px solid rgba(148,163,184,0.25)",
                borderRadius: 8,
                }}
              >
                <option value="" disabled>
                  Select week
                </option>
                {availableWeeks.map((w) => (
                  <option key={w} value={w}>
                    Week {w}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {gamesError ? (
            <p style={{ color: "#fca5a5", marginTop: "0.25rem" }}>{gamesError}</p>
          ) : games.length === 0 ? (
            <p style={{ marginTop: "0.5rem", color: "var(--text-dim)" }}>No games found.</p>
          ) : (
            (() => {
              const formatTime12h = (time: string | null) => {
                if (!time) return "";
                // Expecting HH:MM[:SS]
                const [hhStr, mmStr] = time.split(":");
                let hh = Number(hhStr);
                const mm = mmStr ?? "00";
                const ampm = hh >= 12 ? "PM" : "AM";
                hh = hh % 12;
                if (hh === 0) hh = 12;
                return `${hh}:${mm} ${ampm}`;
              };

              const weekdayFromDate = (dateStr: string | null) => {
                if (!dateStr) return "";
                // Parse date and get weekday - dates are in America/Toronto timezone
                const [year, month, day] = dateStr.split("-").map(Number);
                const d = new Date(year, month - 1, day);
                if (isNaN(d.getTime())) return "";
                return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][d.getDay()];
              };

              // Convert time string to seconds for proper numerical comparison
              const timeToSeconds = (time: string | null): number => {
                if (!time) return Number.POSITIVE_INFINITY;
                const parts = time.split(":");
                const hours = parseInt(parts[0] || "0", 10);
                const minutes = parseInt(parts[1] || "0", 10);
                const seconds = parseInt(parts[2] || "0", 10);
                return hours * 3600 + minutes * 60 + seconds;
              };

              type Group = { key: string; label: string; items: GameRow[] };
              const groups: Group[] = [];
              let currentKey = "__start";
              let current: Group | null = null;
              for (const g of games) {
                const key = (g.weekday && g.weekday.trim()) || weekdayFromDate(g.gameday) || "";
                const label = key;
                if (!current || key !== currentKey) {
                  current = { key, label, items: [] };
                  groups.push(current);
                  currentKey = key;
                }
                current.items.push(g);
              }
              
              // Sort games within each group by gameday and gametime
              for (const grp of groups) {
                grp.items.sort((a, b) => {
                  // First sort by gameday
                  if (a.gameday !== b.gameday) {
                    if (!a.gameday) return 1;
                    if (!b.gameday) return -1;
                    return a.gameday.localeCompare(b.gameday);
                  }
                  // Then sort by gametime - convert to seconds for proper numerical comparison
                  const timeA = timeToSeconds(a.gametime);
                  const timeB = timeToSeconds(b.gametime);
                  if (timeA !== timeB) {
                    return timeA - timeB;
                  }
                  // Finally by away_team for consistency
                  return a.away_team.localeCompare(b.away_team);
                });
              }

              return (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", marginTop: "0.75rem" }}>
                  {groups.map((grp) => (
                    <div key={grp.key}>
                      <div style={{ color: "var(--text-dim)", fontWeight: 600, marginBottom: "0.5rem" }}>{grp.label}</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {grp.items.map((g) => (
                          <Link
                            key={g.game_id}
                            href={`/nfl-game/${encodeURIComponent(g.game_id)}${selectedWeek !== null ? `?week=${selectedWeek}` : ""}`}
          style={{
                            border: "1px solid rgba(148, 163, 184, 0.25)",
                            borderRadius: 8,
                            padding: "0.75rem 1rem",
                            background: "var(--bg-card)",
                            textDecoration: "none",
                            color: "inherit",
                            display: "block",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "center", color: "var(--text-dim)", fontSize: "0.9rem", fontWeight: 600, marginBottom: "0.25rem" }}>
                            <span>{formatTime12h(g.gametime)}</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem", fontSize: "1rem", fontWeight: 600 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                              <img 
                                src={getTeamLogoPath(g.away_team)} 
                                alt={g.away_team}
                                style={{ width: "24px", height: "24px", objectFit: "contain" }}
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                              <span>{g.away_team}</span>
                            </div>
                            <div style={{ flexShrink: 0, width: 28, textAlign: "center" }}>@</div>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                              <span>{g.home_team}</span>
                              <img 
                                src={getTeamLogoPath(g.home_team)} 
                                alt={g.home_team}
                                style={{ width: "24px", height: "24px", objectFit: "contain" }}
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
          </div>
            );
          })()
        )}
        </section>

      {/* Player stats table removed */}
    </main>
    </>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <main className="wrapper">
        <div style={{ marginBottom: "1rem" }}>
          <Link href="/" className="back-button">
            ← Back to Home
          </Link>
        </div>
        <section className="hero-card" style={{ textAlign: "left" }}>
          <div className="hero-eyebrow">Schedule</div>
          <h1 className="hero-title">NFL Schedule</h1>
          <p className="hero-desc" style={{ marginLeft: 0 }}>
            Loading...
          </p>
        </section>
      </main>
    }>
      <NFLScheduleContent />
    </Suspense>
  );
}

// Removed table styles no longer used

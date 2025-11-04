"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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

export default function HomePage() {
  const [games, setGames] = useState<GameRow[]>([]);
  const [gamesError, setGamesError] = useState("");
  const [seasonYear] = useState<number>(new Date().getFullYear());
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [availableWeeks, setAvailableWeeks] = useState<number[]>([]);

  // Stats search removed

  // Helper function to get logo path from team abbreviation
  const getTeamLogoPath = (teamAbbr: string): string => {
    return `/team-logos/${teamAbbr.toLowerCase()}.png`;
  };

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

        // find current week: if any game on today => that week, else next earliest day with a game
        const now = new Date();
        const todayY = now.getUTCFullYear();
        const todayM = now.getUTCMonth();
        const todayD = now.getUTCDate();
        const todayStart = Date.UTC(todayY, todayM, todayD, 0, 0, 0);
        const todayEnd = Date.UTC(todayY, todayM, todayD, 23, 59, 59);

        const toEpoch = (g: GameRow) => {
          if (!g.gameday) return Number.POSITIVE_INFINITY;
          // Combine gameday + gametime; if no gametime, assume noon UTC
          const [yy, mm, dd] = g.gameday.split("-").map(Number);
          const [h, m, s] = (g.gametime || "12:00:00").split(":").map((x) => Number(x));
          return Date.UTC(yy, (mm || 1) - 1, dd || 1, h || 0, m || 0, s || 0);
        };

        let currentWeek: number | null = null;
        // 1) Any game today?
        for (const g of all) {
          const t = toEpoch(g);
          if (t >= todayStart && t <= todayEnd) {
            currentWeek = g.week;
            break;
          }
        }
        // 2) Otherwise, next earliest game >= now
        if (currentWeek === null) {
          let bestT = Number.POSITIVE_INFINITY;
          let bestWeek: number | null = null;
          for (const g of all) {
            const t = toEpoch(g);
            if (t >= now.getTime() && t < bestT) {
              bestT = t;
              bestWeek = g.week;
            }
          }
          // 3) If no future games, fallback to last available week
          currentWeek = bestWeek ?? (weeks.length ? weeks[weeks.length - 1] : null);
        }

        setSelectedWeek(currentWeek);
      } catch (err: any) {
        console.error("deriveCurrentWeek error", err);
        setGamesError(err?.message ?? "Failed to load games");
      }
    })();
  }, [seasonYear]);

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
              const d = new Date(dateStr);
              if (isNaN(d.getTime())) return "";
              return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][d.getUTCDay()];
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

            return (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", marginTop: "0.75rem" }}>
                {groups.map((grp) => (
                  <div key={grp.key}>
                    <div style={{ color: "var(--text-dim)", fontWeight: 600, marginBottom: "0.5rem" }}>{grp.label}</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                      {grp.items.map((g) => (
                        <Link
                          key={g.game_id}
                          href={`/games/${encodeURIComponent(g.game_id)}`}
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
  );
}

// Removed table styles no longer used

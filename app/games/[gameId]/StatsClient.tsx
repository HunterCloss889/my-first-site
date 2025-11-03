"use client";

import { useMemo, useState } from "react";
import type { PlayerGameRow } from "@/lib/db";

type Props = {
  season: number;
  awayTeam: string;
  homeTeam: string;
  rows: PlayerGameRow[];
};

type Section = "passing" | "receiving" | "rushing";

const SECTION_TABS: Record<Section, { key: string; label: string; accessor: (r: PlayerGameRow) => number | null }[]> = {
  passing: [
    { key: "passing_yards", label: "Passing Yards", accessor: (r) => r.passing_yards },
    { key: "passing_tds", label: "Passing TDs", accessor: (r) => r.passing_tds },
  ],
  receiving: [
    { key: "receiving_yards", label: "Receiving Yards", accessor: (r) => r.receiving_yards },
    { key: "receptions", label: "Receptions", accessor: (r) => r.receptions },
    { key: "receiving_tds", label: "Receiving TDs", accessor: (r) => r.receiving_tds },
  ],
  rushing: [
    { key: "rushing_yards", label: "Rushing Yards", accessor: (r) => r.rushing_yards },
    { key: "carries", label: "Carries", accessor: (r) => r.carries },
    { key: "rushing_tds", label: "Rushing TDs", accessor: (r) => r.rushing_tds },
  ],
};

export default function StatsClient({ season, awayTeam, homeTeam, rows }: Props) {
  const [passingTab, setPassingTab] = useState<string>(SECTION_TABS.passing[0].key);
  const [receivingTab, setReceivingTab] = useState<string>(SECTION_TABS.receiving[0].key);
  const [rushingTab, setRushingTab] = useState<string>(SECTION_TABS.rushing[0].key);

  const weeksSorted = useMemo(() => {
    const set = new Set<number>();
    for (const r of rows) if (r.season === season && typeof r.week === "number") set.add(r.week);
    return Array.from(set).sort((a, b) => a - b);
  }, [rows, season]);

  return (
    <div>
      <SectionBlock
        title="Passing"
        season={season}
        awayTeam={awayTeam}
        homeTeam={homeTeam}
        rows={rows}
        weeksSorted={weeksSorted}
        section="passing"
        tabKey={passingTab}
        onChangeTab={setPassingTab}
      />
      <SectionBlock
        title="Receiving"
        season={season}
        awayTeam={awayTeam}
        homeTeam={homeTeam}
        rows={rows}
        weeksSorted={weeksSorted}
        section="receiving"
        tabKey={receivingTab}
        onChangeTab={setReceivingTab}
      />
      <SectionBlock
        title="Rushing"
        season={season}
        awayTeam={awayTeam}
        homeTeam={homeTeam}
        rows={rows}
        weeksSorted={weeksSorted}
        section="rushing"
        tabKey={rushingTab}
        onChangeTab={setRushingTab}
      />
      <PlayerOpponentSearch
        season={season}
        awayTeam={awayTeam}
        homeTeam={homeTeam}
        rows={rows}
      />
    </div>
  );
}

type SectionBlockProps = {
  title: string;
  season: number;
  awayTeam: string;
  homeTeam: string;
  rows: PlayerGameRow[];
  weeksSorted: number[];
  section: Section;
  tabKey: string;
  onChangeTab: (key: string) => void;
};

function SectionBlock({ title, season, awayTeam, homeTeam, rows, weeksSorted, section, tabKey, onChangeTab }: SectionBlockProps) {
  const tabsForSection = SECTION_TABS[section];
  const activeAccessor = useMemo(() => {
    const t = tabsForSection.find((t) => t.key === tabKey) ?? tabsForSection[0];
    return t.accessor;
  }, [tabsForSection, tabKey]);

  const filteredPlayers = useMemo(() => {
    const perPlayerByWeek = new Map<string, Map<number, PlayerGameRow>>();
    for (const r of rows) {
      if (r.season !== season) continue;
      if (r.recent_team !== awayTeam && r.recent_team !== homeTeam) continue;
      if (!perPlayerByWeek.has(r.player_id)) perPlayerByWeek.set(r.player_id, new Map());
      perPlayerByWeek.get(r.player_id)!.set(r.week, r);
    }

    const players: { playerId: string; name: string; team: string }[] = [];
    perPlayerByWeek.forEach((weeks, playerId) => {
      let hasAny = false;
      for (const r of weeks.values()) {
        const val = activeAccessor(r);
        if (val != null && !Number.isNaN(val) && val !== 0) {
          hasAny = true;
          break;
        }
      }
      if (hasAny) {
        const sample = weeks.values().next().value as PlayerGameRow;
        const name = sample.player_display_name || "Unknown Player";
        const team = sample.recent_team || "";
        players.push({ playerId, name, team });
      }
    });

    players.sort((a, b) => {
      const teamCmp = (a.team || "").localeCompare(b.team || "");
      if (teamCmp !== 0) return teamCmp;
      return (a.name || "").localeCompare(b.name || "");
    });
    return { players, perPlayerByWeek };
  }, [rows, season, awayTeam, homeTeam, activeAccessor]);

  return (
    <section style={{
      marginTop: "1rem",
      backgroundColor: "var(--bg-card)",
      border: "1px solid rgba(148, 163, 184, 0.15)",
      borderRadius: "var(--radius-lg)",
      boxShadow: "0 30px 80px rgba(0,0,0,0.7)",
      padding: "1rem 1rem 1.25rem",
    }}>
      <div className="hero-eyebrow" style={{ marginBottom: 8 }}>{title}</div>
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
        {tabsForSection.map((t) => (
          <button
            key={t.key}
            className={t.key === tabKey ? "btn-primary" : "btn-ghost"}
            onClick={() => onChangeTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ 
        overflowX: "auto",
        overflowY: filteredPlayers.players.length > 6 ? "auto" : "visible",
        maxHeight: filteredPlayers.players.length > 6 ? "280px" : "none",
      }}>
        <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 900, fontSize: "0.85rem" }}>
          <thead>
            <tr>
              <th style={th}>Player</th>
              <th style={th}>Team</th>
              <th style={th}>Avg</th>
              {weeksSorted.map((w) => (
                <th key={w} style={th}>W{w}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(() => {
              const rowsData = filteredPlayers.players.map((p) => {
                const weeksMap = filteredPlayers.perPlayerByWeek.get(p.playerId)!;
                let sum = 0;
                let count = 0;
                const valuesByWeek = weeksSorted.map((w) => {
                  const r = weeksMap.get(w);
                  const v = r ? activeAccessor(r) : null;
                  if (v != null) {
                    sum += v;
                    count += 1;
                  }
                  return v;
                });
                const avg = count ? sum / count : 0;
                return { p, valuesByWeek, avg };
              });
              rowsData.sort((a, b) => {
                const cmp = b.avg - a.avg;
                if (cmp !== 0) return cmp;
                const teamCmp = (a.p.team || "").localeCompare(b.p.team || "");
                if (teamCmp !== 0) return teamCmp;
                return (a.p.name || "").localeCompare(b.p.name || "");
              });
              return rowsData.map(({ p, valuesByWeek, avg }) => (
                <tr key={p.playerId}>
                  <td style={td}>{p.name}</td>
                  <td style={td}>{p.team}</td>
                  <td style={td}>{formatNumber(avg)}</td>
                  {valuesByWeek.map((v, i) => (
                    <td key={i} style={td}>{v == null ? "-" : formatNumber(v)}</td>
                  ))}
                </tr>
              ));
            })()}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function formatNumber(n: number) {
  // integers show as 0, 1, 2; non-integers to 1 decimal place
  if (Number.isInteger(n)) return String(n);
  return n.toFixed(1);
}

const th: React.CSSProperties = {
  textAlign: "left",
  position: "sticky",
  top: 0,
  zIndex: 1,
  borderBottom: "1px solid rgba(148, 163, 184, 0.25)",
  padding: "0.6rem 0.5rem",
  whiteSpace: "nowrap",
  background: "rgba(148,163,184,0.08)",
  color: "var(--text-primary)",
  backdropFilter: "blur(6px)",
};

const td: React.CSSProperties = {
  borderBottom: "1px solid rgba(148, 163, 184, 0.15)",
  padding: "0.5rem 0.5rem",
  color: "var(--text-primary)",
};

type PlayerOpponentSearchProps = {
  season: number;
  awayTeam: string;
  homeTeam: string;
  rows: PlayerGameRow[];
};

function PlayerOpponentSearch({ season, awayTeam, homeTeam, rows }: PlayerOpponentSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<{ playerId: string; name: string; team: string; opponent: string } | null>(null);
  const [playerStats, setPlayerStats] = useState<PlayerGameRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Get unique players from both teams
  const availablePlayers = useMemo(() => {
    const playerMap = new Map<string, { playerId: string; name: string; team: string }>();
    for (const r of rows) {
      if (r.season !== season) continue;
      if (r.recent_team !== awayTeam && r.recent_team !== homeTeam) continue;
      if (!playerMap.has(r.player_id)) {
        const name = r.player_display_name || "Unknown Player";
        playerMap.set(r.player_id, {
          playerId: r.player_id,
          name,
          team: r.recent_team || "",
        });
      }
    }
    return Array.from(playerMap.values()).sort((a, b) => {
      const teamCmp = a.team.localeCompare(b.team);
      if (teamCmp !== 0) return teamCmp;
      return a.name.localeCompare(b.name);
    });
  }, [rows, season, awayTeam, homeTeam]);

  // Filter players based on search query
  const filteredPlayers = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase().trim();
    return availablePlayers.filter(
      (p) => p.name.toLowerCase().includes(query) || p.team.toLowerCase().includes(query)
    );
  }, [availablePlayers, searchQuery]);

  const handlePlayerSelect = async (player: { playerId: string; name: string; team: string }) => {
    const opponent = player.team === awayTeam ? homeTeam : awayTeam;
    setSelectedPlayer({ ...player, opponent });
    setSearchQuery("");
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/player-opponent-stats?playerId=${encodeURIComponent(player.playerId)}&opponentTeam=${encodeURIComponent(opponent)}&season=${season}`
      );
      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data.message || `Request failed with ${res.status}`);
      }
      setPlayerStats(data.rows || []);
    } catch (err: any) {
      console.error("Error fetching player stats:", err);
      setError(err?.message ?? "Failed to load stats");
      setPlayerStats([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section style={{
      marginTop: "1rem",
      backgroundColor: "var(--bg-card)",
      border: "1px solid rgba(148, 163, 184, 0.15)",
      borderRadius: "var(--radius-lg)",
      boxShadow: "0 30px 80px rgba(0,0,0,0.7)",
      padding: "1rem 1rem 1.25rem",
    }}>
      <div className="hero-eyebrow" style={{ marginBottom: 8 }}>Player vs Opponent History</div>
      
      <div style={{ position: "relative", marginBottom: "1rem" }}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for a player..."
          style={{
            width: "100%",
            padding: "0.6rem 0.75rem",
            border: "1px solid rgba(148, 163, 184, 0.25)",
            borderRadius: 8,
            background: "rgba(148,163,184,0.08)",
            color: "var(--text-primary)",
            fontSize: "0.9rem",
          }}
        />
        {filteredPlayers.length > 0 && (
          <div style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            marginTop: "0.25rem",
            backgroundColor: "var(--bg-card)",
            border: "1px solid rgba(148, 163, 184, 0.25)",
            borderRadius: 8,
            maxHeight: "200px",
            overflowY: "auto",
            zIndex: 10,
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          }}>
            {filteredPlayers.map((p) => (
              <button
                key={p.playerId}
                onClick={() => handlePlayerSelect(p)}
                style={{
                  width: "100%",
                  padding: "0.5rem 0.75rem",
                  textAlign: "left",
                  background: "transparent",
                  border: "none",
                  color: "var(--text-primary)",
                  cursor: "pointer",
                  borderBottom: "1px solid rgba(148, 163, 184, 0.1)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(148,163,184,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <div style={{ fontWeight: 600 }}>{p.name}</div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>{p.team}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedPlayer && (
        <div>
          <div style={{ marginBottom: "0.75rem", fontSize: "0.9rem", color: "var(--text-dim)" }}>
            <strong>{selectedPlayer.name}</strong> ({selectedPlayer.team}) vs <strong>{selectedPlayer.opponent}</strong> (All Games)
          </div>
          {loading ? (
            <div style={{ color: "var(--text-dim)" }}>Loading stats...</div>
          ) : error ? (
            <div style={{ color: "#fca5a5" }}>{error}</div>
          ) : playerStats.length === 0 ? (
            <div style={{ color: "var(--text-dim)" }}>No stats found against this opponent.</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 900, fontSize: "0.85rem" }}>
                <thead>
                  <tr>
                    <th style={th}>Season</th>
                    <th style={th}>Week</th>
                    <th style={th}>Team</th>
                    <th style={th}>Pass Yds</th>
                    <th style={th}>Pass TD</th>
                    <th style={th}>Rush Yds</th>
                    <th style={th}>Rush TD</th>
                    <th style={th}>Carries</th>
                    <th style={th}>Rec</th>
                    <th style={th}>Rec Yds</th>
                    <th style={th}>Rec TD</th>
                  </tr>
                </thead>
                <tbody>
                  {playerStats.map((stat, idx) => (
                    <tr key={`${stat.player_id}-${stat.season}-${stat.week}-${idx}`}>
                      <td style={td}>{stat.season}</td>
                      <td style={td}>{stat.week}</td>
                      <td style={td}>{stat.recent_team ?? "-"}</td>
                      <td style={td}>{stat.passing_yards ?? "-"}</td>
                      <td style={td}>{stat.passing_tds ?? "-"}</td>
                      <td style={td}>{stat.rushing_yards ?? "-"}</td>
                      <td style={td}>{stat.rushing_tds ?? "-"}</td>
                      <td style={td}>{stat.carries ?? "-"}</td>
                      <td style={td}>{stat.receptions ?? "-"}</td>
                      <td style={td}>{stat.receiving_yards ?? "-"}</td>
                      <td style={td}>{stat.receiving_tds ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  );
}



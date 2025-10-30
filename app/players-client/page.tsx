"use client";

import { useEffect, useState } from "react";

type PlayerGameRow = {
  player_id: string;
  player_display_name: string;
  position: string;
  recent_team: string;
  season: number;
  week: number;
  opponent_team: string | null;
  completions: number | null;
  attempts: number | null;
  passing_yards: number | null;
  passing_tds: number | null;
  interceptions: number | null;
  carries: number | null;
  rushing_yards: number | null;
  rushing_tds: number | null;
  receptions: number | null;
  targets: number | null;
  receiving_yards: number | null;
  receiving_tds: number | null;
};

export default function HomePage() {
  const [team, setTeam] = useState("");
  const [season, setSeason] = useState("");
  const [rows, setRows] = useState<PlayerGameRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadData(opts?: { team?: string; season?: string }) {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (opts?.team) params.set("team", opts.team);
      if (opts?.season) params.set("season", opts.season);

      const query = params.toString();
      const url = query ? `/api/players?${query}` : "/api/players";

      const res = await fetch(url);
      const data = await res.json();
      console.log("API response", data);

      if (!res.ok || data.success === false) {
        throw new Error(data.message || `Request failed with ${res.status}`);
      }

      setRows(data.rows || []);
    } catch (err: any) {
      console.error("loadData error", err);
      setError(err.message ?? "Something went wrong");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  // initial load: get latest 100
  useEffect(() => {
    loadData();
  }, []);

  return (
    <main className="wrapper">
      <section className="hero-card" style={{ textAlign: "left" }}>
        <div className="hero-eyebrow">Data</div>
        <h1 className="hero-title">NFL Player Game Stats</h1>
        <p className="hero-desc" style={{ marginLeft: 0 }}>
          Enter a team code (e.g. <code>BUF</code>, <code>CIN</code>, <code>SF</code>) and optionally a season.
        </p>

        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            marginBottom: "0.5rem",
            flexWrap: "wrap",
          }}
        >
          <input
            value={team}
            onChange={(e) => setTeam(e.target.value)}
            placeholder="Team (e.g. BUF)"
            style={{
              padding: "0.6rem 0.75rem",
              border: "1px solid rgba(148, 163, 184, 0.25)",
              borderRadius: 8,
              minWidth: "12rem",
              background: "rgba(148,163,184,0.08)",
              color: "var(--text-primary)",
            }}
          />
          <input
            value={season}
            onChange={(e) => setSeason(e.target.value)}
            placeholder="Season (e.g. 2024)"
            style={{
              padding: "0.6rem 0.75rem",
              border: "1px solid rgba(148, 163, 184, 0.25)",
              borderRadius: 8,
              width: "8rem",
              background: "rgba(148,163,184,0.08)",
              color: "var(--text-primary)",
            }}
          />
          <button
            onClick={() =>
              loadData({
                team: team.trim(),
                season: season.trim(),
              })
            }
            className="btn-primary"
            style={{ border: "none" }}
          >
            Search
          </button>
          <button
            onClick={() => {
              setTeam("");
              setSeason("");
              loadData();
            }}
            className="btn-ghost"
          >
            Reset
          </button>
        </div>

        {error ? (
          <p style={{ color: "#fca5a5", marginTop: "0.25rem" }}>{error}</p>
        ) : null}
      </section>

      {loading ? (
        <p style={{ marginTop: "1rem", color: "var(--text-dim)" }}>Loading…</p>
      ) : rows.length === 0 ? (
        <p style={{ marginTop: "1rem", color: "var(--text-dim)" }}>No rows found.</p>
      ) : (
        <section
          style={{
            marginTop: "var(--gap-section)",
            backgroundColor: "var(--bg-card)",
            border: "1px solid rgba(148, 163, 184, 0.15)",
            borderRadius: "var(--radius-lg)",
            boxShadow: "0 30px 80px rgba(0,0,0,0.7)",
            overflow: "hidden",
          }}
        >
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                borderCollapse: "collapse",
                width: "100%",
                minWidth: "1200px",
                fontSize: "0.85rem",
                color: "var(--text-primary)",
              }}
            >
              <thead>
                <tr>
                  <th style={th}>Player</th>
                  <th style={th}>Pos</th>
                  <th style={th}>Team</th>
                  <th style={th}>Season</th>
                  <th style={th}>Week</th>
                  <th style={th}>Opp</th>
                  <th style={th}>Rec</th>
                  <th style={th}>Targets</th>
                  <th style={th}>Rec Yds</th>
                  <th style={th}>Rec TD</th>
                  <th style={th}>Rush</th>
                  <th style={th}>Rush Yds</th>
                  <th style={th}>Rush TD</th>
                  <th style={th}>Comp</th>
                  <th style={th}>Att</th>
                  <th style={th}>Pass Yds</th>
                  <th style={th}>Pass TD</th>
                  <th style={th}>INT</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={`${r.player_id}-${r.season}-${r.week}`}>
                    <td style={td}>{r.player_display_name}</td>
                    <td style={td}>{r.position}</td>
                    <td style={td}>{r.recent_team}</td>
                    <td style={td}>{r.season}</td>
                    <td style={td}>{r.week}</td>
                    <td style={td}>{r.opponent_team ?? "-"}</td>
                    <td style={td}>{r.receptions ?? "-"}</td>
                    <td style={td}>{r.targets ?? "-"}</td>
                    <td style={td}>{r.receiving_yards ?? "-"}</td>
                    <td style={td}>{r.receiving_tds ?? "-"}</td>
                    <td style={td}>{r.carries ?? "-"}</td>
                    <td style={td}>{r.rushing_yards ?? "-"}</td>
                    <td style={td}>{r.rushing_tds ?? "-"}</td>
                    <td style={td}>{r.completions ?? "-"}</td>
                    <td style={td}>{r.attempts ?? "-"}</td>
                    <td style={td}>{r.passing_yards ?? "-"}</td>
                    <td style={td}>{r.passing_tds ?? "-"}</td>
                    <td style={td}>{r.interceptions ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </main>
  );
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

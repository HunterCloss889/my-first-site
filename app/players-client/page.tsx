"use client";

import { useEffect, useState } from "react";
import type { Player } from "@/lib/db";

export default function PlayersClientPage() {
  const [team, setTeam] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadPlayers(chosenTeam?: string) {
    setLoading(true);
    try {
      const url = chosenTeam
        ? `/api/players?team=${encodeURIComponent(chosenTeam)}`
        : "/api/players";

      const res = await fetch(url);
      const data = await res.json();
      setPlayers(data.players);
    } finally {
      setLoading(false);
    }
  }

  // load all players once on mount
  useEffect(() => {
    loadPlayers();
  }, []);

  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem" }}>
        Player Lookup (Client Side)
      </h1>

      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <input
          value={team}
          onChange={(e) => setTeam(e.target.value)}
          placeholder="e.g. BUF"
          style={{
            border: "1px solid #ccc",
            borderRadius: "4px",
            padding: "0.5rem",
            fontSize: "1rem",
          }}
        />
        <button
          onClick={() => loadPlayers(team)}
          style={{
            border: "1px solid #000",
            borderRadius: "4px",
            padding: "0.5rem 0.75rem",
            fontSize: "0.9rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Search
        </button>
      </div>

      {loading ? (
        <p>Loading…</p>
      ) : (
        <table
          style={{
            borderCollapse: "collapse",
            width: "100%",
            maxWidth: 700,
            fontSize: "0.9rem",
          }}
        >
          <thead>
            <tr>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Team</th>
              <th style={thStyle}>Rec Yds</th>
              <th style={thStyle}>Rush Yds</th>
              <th style={thStyle}>Pass Yds</th>
            </tr>
          </thead>
          <tbody>
            {players.map((p) => (
              <tr key={p.id}>
                <td style={tdStyle}>{p.name}</td>
                <td style={tdStyle}>{p.team}</td>
                <td style={tdStyle}>{p.recYards}</td>
                <td style={tdStyle}>{p.rushYards}</td>
                <td style={tdStyle}>{p.passYards}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: "left",
  borderBottom: "1px solid #ccc",
  padding: "0.5rem",
  fontWeight: 600,
};

const tdStyle: React.CSSProperties = {
  borderBottom: "1px solid #eee",
  padding: "0.5rem",
};

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Player = {
  player_id: string;
  player_display_name: string;
  position: string;
  recent_team: string;
};

export default function PlayerSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (searchQuery.length < 2) {
      setPlayers([]);
      setShowDropdown(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/players/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        if (res.ok && data.success) {
          setPlayers(data.players || []);
          setShowDropdown(true);
        } else {
          setPlayers([]);
        }
      } catch (err) {
        console.error("Search error:", err);
        setPlayers([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handlePlayerClick = (playerId: string) => {
    setSearchQuery("");
    setShowDropdown(false);
    router.push(`/player-stats/${encodeURIComponent(playerId)}`);
  };

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: "500px", margin: "0 auto" }}>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={() => {
          if (players.length > 0) setShowDropdown(true);
        }}
        onBlur={() => {
          // Delay to allow click to register
          setTimeout(() => setShowDropdown(false), 200);
        }}
        placeholder="Search for a player..."
        style={{
          width: "100%",
          padding: "0.75rem 1rem",
          border: "1px solid rgba(148, 163, 184, 0.25)",
          borderRadius: 8,
          background: "rgba(148,163,184,0.08)",
          color: "var(--text-primary)",
          fontSize: "1rem",
        }}
      />
      {showDropdown && (players.length > 0 || loading) && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            marginTop: "0.5rem",
            backgroundColor: "var(--bg-card)",
            border: "1px solid rgba(148, 163, 184, 0.25)",
            borderRadius: 8,
            maxHeight: "300px",
            overflowY: "auto",
            zIndex: 100,
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          }}
        >
          {loading ? (
            <div style={{ padding: "1rem", color: "var(--text-dim)", textAlign: "center" }}>
              Searching...
            </div>
          ) : players.length === 0 ? (
            <div style={{ padding: "1rem", color: "var(--text-dim)", textAlign: "center" }}>
              No players found
            </div>
          ) : (
            players.map((p) => (
              <button
                key={p.player_id}
                onClick={() => handlePlayerClick(p.player_id)}
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  textAlign: "left",
                  background: "transparent",
                  border: "none",
                  borderBottom: "1px solid rgba(148, 163, 184, 0.1)",
                  color: "var(--text-primary)",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(148,163,184,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>{p.player_display_name}</div>
                <div style={{ fontSize: "0.85rem", color: "var(--text-dim)" }}>
                  {p.position} • {p.recent_team}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}


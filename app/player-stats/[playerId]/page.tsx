import { getPlayerGameLog } from "@/lib/db";
import Link from "next/link";
import PlayerSearch from "@/app/PlayerSearch";
import Image from "next/image";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ playerId: string }>;
};

export default async function PlayerPage({ params }: PageProps) {
  const { playerId } = await params;
  const stats = await getPlayerGameLog(playerId);

  if (stats.length === 0) {
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
          <section className="hero-card">
            <div className="hero-eyebrow">Player</div>
            <h1 className="hero-title">Player not found</h1>
          </section>
        </main>
      </>
    );
  }

  const playerName = stats[0].player_display_name || "Unknown Player";
  const position = stats[0].position || "";
  const recentTeam = stats[0].recent_team || "";

  // Group stats by season
  const statsBySeason = new Map<number, typeof stats>();
  for (const stat of stats) {
    if (!statsBySeason.has(stat.season)) {
      statsBySeason.set(stat.season, []);
    }
    statsBySeason.get(stat.season)!.push(stat);
  }

  const seasons = Array.from(statsBySeason.keys()).sort((a, b) => b - a);

  function formatNumber(n: number | null) {
    if (n == null) return "-";
    if (Number.isInteger(n)) return String(n);
    return n.toFixed(1);
  }

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
          <div style={{ marginBottom: "1.5rem" }}>
            <PlayerSearch />
          </div>
          
          <div className="hero-eyebrow">Player</div>
          <h1 className="hero-title" style={{ marginBottom: "0.25rem" }}>
            {playerName}
          </h1>
          <div style={{ color: "var(--text-dim)", fontWeight: 600, marginBottom: "1.5rem" }}>
            {position} • {recentTeam}
          </div>

          {seasons.map((season) => {
            const seasonStats = statsBySeason.get(season)!;
            
            // Calculate averages for the season
            const sums = {
              passing_yards: 0,
              passing_tds: 0,
              interceptions: 0,
              rushing_yards: 0,
              rushing_tds: 0,
              carries: 0,
              receptions: 0,
              receiving_yards: 0,
              receiving_tds: 0,
              targets: 0,
            };
            
            const counts = {
              passing_yards: 0,
              passing_tds: 0,
              interceptions: 0,
              rushing_yards: 0,
              rushing_tds: 0,
              carries: 0,
              receptions: 0,
              receiving_yards: 0,
              receiving_tds: 0,
              targets: 0,
            };
            
            for (const stat of seasonStats) {
              if (stat.passing_yards != null) { sums.passing_yards += stat.passing_yards; counts.passing_yards++; }
              if (stat.passing_tds != null) { sums.passing_tds += stat.passing_tds; counts.passing_tds++; }
              if (stat.interceptions != null) { sums.interceptions += stat.interceptions; counts.interceptions++; }
              if (stat.rushing_yards != null) { sums.rushing_yards += stat.rushing_yards; counts.rushing_yards++; }
              if (stat.rushing_tds != null) { sums.rushing_tds += stat.rushing_tds; counts.rushing_tds++; }
              if (stat.carries != null) { sums.carries += stat.carries; counts.carries++; }
              if (stat.receptions != null) { sums.receptions += stat.receptions; counts.receptions++; }
              if (stat.receiving_yards != null) { sums.receiving_yards += stat.receiving_yards; counts.receiving_yards++; }
              if (stat.receiving_tds != null) { sums.receiving_tds += stat.receiving_tds; counts.receiving_tds++; }
              if (stat.targets != null) { sums.targets += stat.targets; counts.targets++; }
            }
            
            const totals = {
              passing_yards: sums.passing_yards,
              passing_tds: sums.passing_tds,
              interceptions: sums.interceptions,
              rushing_yards: sums.rushing_yards,
              rushing_tds: sums.rushing_tds,
              carries: sums.carries,
              receptions: sums.receptions,
              receiving_yards: sums.receiving_yards,
              receiving_tds: sums.receiving_tds,
              targets: sums.targets,
            };
            
            const averages = {
              passing_yards: counts.passing_yards > 0 ? sums.passing_yards / counts.passing_yards : 0,
              passing_tds: counts.passing_tds > 0 ? sums.passing_tds / counts.passing_tds : 0,
              interceptions: counts.interceptions > 0 ? sums.interceptions / counts.interceptions : 0,
              rushing_yards: counts.rushing_yards > 0 ? sums.rushing_yards / counts.rushing_yards : 0,
              rushing_tds: counts.rushing_tds > 0 ? sums.rushing_tds / counts.rushing_tds : 0,
              carries: counts.carries > 0 ? sums.carries / counts.carries : 0,
              receptions: counts.receptions > 0 ? sums.receptions / counts.receptions : 0,
              receiving_yards: counts.receiving_yards > 0 ? sums.receiving_yards / counts.receiving_yards : 0,
              receiving_tds: counts.receiving_tds > 0 ? sums.receiving_tds / counts.receiving_tds : 0,
              targets: counts.targets > 0 ? sums.targets / counts.targets : 0,
            };
            
            return (
              <div key={season} style={{ marginBottom: "2rem" }}>
                <div style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "1rem", color: "var(--text-primary)" }}>
                  {season} Season
                </div>
                <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
                  <table style={{ borderCollapse: "collapse", width: "100%", minWidth: "max-content", fontSize: "0.85rem" }} className="stats-table">
                    <thead>
                      <tr>
                        <th style={th}>Week</th>
                        <th style={th}>Team</th>
                        <th style={th}>Opp</th>
                        <th style={th}>Pass Yds</th>
                        <th style={th}>Pass TD</th>
                        <th style={th}>INT</th>
                        <th style={th}>Rush Yds</th>
                        <th style={th}>Rush TD</th>
                        <th style={th}>Carries</th>
                        <th style={th}>Rec</th>
                        <th style={th}>Rec Yds</th>
                        <th style={th}>Rec TD</th>
                        <th style={th}>Targets</th>
                      </tr>
                    </thead>
                    <tbody>
                      {seasonStats.map((stat, idx) => (
                        <tr key={`${stat.season}-${stat.week}-${idx}`}>
                          <td style={td}>{stat.week}</td>
                          <td style={td}>{stat.recent_team}</td>
                          <td style={td}>{stat.opponent_team ?? "-"}</td>
                          <td style={td}>{formatNumber(stat.passing_yards)}</td>
                          <td style={td}>{formatNumber(stat.passing_tds)}</td>
                          <td style={td}>{formatNumber(stat.interceptions)}</td>
                          <td style={td}>{formatNumber(stat.rushing_yards)}</td>
                          <td style={td}>{formatNumber(stat.rushing_tds)}</td>
                          <td style={td}>{formatNumber(stat.carries)}</td>
                          <td style={td}>{formatNumber(stat.receptions)}</td>
                          <td style={td}>{formatNumber(stat.receiving_yards)}</td>
                          <td style={td}>{formatNumber(stat.receiving_tds)}</td>
                          <td style={td}>{formatNumber(stat.targets)}</td>
                        </tr>
                      ))}
                      <tr style={{ 
                        backgroundColor: "rgba(148,163,184,0.08)", 
                        fontWeight: 600,
                        borderTop: "2px solid rgba(148, 163, 184, 0.3)"
                      }}>
                        <td style={td}>Total</td>
                        <td style={td}>-</td>
                        <td style={td}>-</td>
                        <td style={td}>{formatNumber(totals.passing_yards)}</td>
                        <td style={td}>{formatNumber(totals.passing_tds)}</td>
                        <td style={td}>{formatNumber(totals.interceptions)}</td>
                        <td style={td}>{formatNumber(totals.rushing_yards)}</td>
                        <td style={td}>{formatNumber(totals.rushing_tds)}</td>
                        <td style={td}>{formatNumber(totals.carries)}</td>
                        <td style={td}>{formatNumber(totals.receptions)}</td>
                        <td style={td}>{formatNumber(totals.receiving_yards)}</td>
                        <td style={td}>{formatNumber(totals.receiving_tds)}</td>
                        <td style={td}>{formatNumber(totals.targets)}</td>
                      </tr>
                      <tr style={{ 
                        backgroundColor: "rgba(148,163,184,0.08)", 
                        fontWeight: 600,
                      }}>
                        <td style={td}>Avg</td>
                        <td style={td}>-</td>
                        <td style={td}>-</td>
                        <td style={td}>{formatNumber(averages.passing_yards)}</td>
                        <td style={td}>{formatNumber(averages.passing_tds)}</td>
                        <td style={td}>{formatNumber(averages.interceptions)}</td>
                        <td style={td}>{formatNumber(averages.rushing_yards)}</td>
                        <td style={td}>{formatNumber(averages.rushing_tds)}</td>
                        <td style={td}>{formatNumber(averages.carries)}</td>
                        <td style={td}>{formatNumber(averages.receptions)}</td>
                        <td style={td}>{formatNumber(averages.receiving_yards)}</td>
                        <td style={td}>{formatNumber(averages.receiving_tds)}</td>
                        <td style={td}>{formatNumber(averages.targets)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </section>
      </main>
    </>
  );
}

const th: React.CSSProperties = {
  textAlign: "left",
  borderBottom: "1px solid rgba(148, 163, 184, 0.25)",
  color: "var(--text-primary)",
};

const td: React.CSSProperties = {
  borderBottom: "1px solid rgba(148, 163, 184, 0.15)",
  padding: "0.5rem 0.5rem",
  color: "var(--text-primary)",
};


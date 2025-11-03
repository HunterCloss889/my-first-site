import { getGameById, getStatsByTeamAndSeason, getDefensiveRankings, type PlayerGameRow } from "@/lib/db";
import StatsClient from "./StatsClient";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ gameId: string }>;
};

export default async function GamePage({ params }: PageProps) {
  const { gameId } = await params;
  const game = await getGameById(gameId);

  if (!game) {
    return (
      <main className="wrapper">
        <section className="hero-card">
          <div className="hero-eyebrow">Game</div>
          <h1 className="hero-title">Game not found</h1>
        </section>
      </main>
    );
  }

  const season = game.season;
  const away = game.away_team;
  const home = game.home_team;

  const [awayRows, homeRows, rankings] = await Promise.all([
    getStatsByTeamAndSeason(away, season),
    getStatsByTeamAndSeason(home, season),
    getDefensiveRankings(season),
  ]);
  const rows: PlayerGameRow[] = [...awayRows, ...homeRows];
  
  const awayDef = rankings.find(r => r.team.toLowerCase() === away.toLowerCase());
  const homeDef = rankings.find(r => r.team.toLowerCase() === home.toLowerCase());

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

  return (
    <main className="wrapper">
      <section className="hero-card">
        <div className="hero-eyebrow">Game</div>
        <h1 className="hero-title" style={{ marginBottom: "0.25rem" }}>
          {away} @ {home}
        </h1>
        <div style={{ color: "var(--text-dim)", fontWeight: 600, marginBottom: "1rem" }}>
          {game.weekday || ""} {formatTime12h(game.gametime)} • Week {game.week}, {season}
        </div>
        
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
    </main>
  );
}



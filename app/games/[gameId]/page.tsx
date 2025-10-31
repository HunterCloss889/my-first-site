import { getGameById, getStatsByTeamAndSeason, type PlayerGameRow } from "@/lib/db";
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

  const [awayRows, homeRows] = await Promise.all([
    getStatsByTeamAndSeason(away, season),
    getStatsByTeamAndSeason(home, season),
  ]);
  const rows: PlayerGameRow[] = [...awayRows, ...homeRows];

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
        <StatsClient season={season} awayTeam={away} homeTeam={home} rows={rows} />
      </section>
    </main>
  );
}



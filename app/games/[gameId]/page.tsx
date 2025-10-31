import { getGameById } from "@/lib/db";

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

  return (
    <main className="wrapper">
      <section className="hero-card">
        <div className="hero-eyebrow">Game</div>
        <h1 className="hero-title" style={{ marginBottom: "1rem" }}>
          {game.away_team} @ {game.home_team}
        </h1>
        <p className="hero-desc" style={{ marginBottom: 0 }}>
          Proof of concept page for {game.season} week {game.week}.
        </p>
      </section>
    </main>
  );
}



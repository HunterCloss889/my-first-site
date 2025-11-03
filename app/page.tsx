import Link from "next/link";
import PlayerSearch from "./PlayerSearch";

export default function Home() {
  return (
    <>
      {/* NAVBAR */}
      <header className="navbar">
        <div className="wrapper nav-inner">
          <div className="brand">
            <span>props-tracker</span>
            <span className="brand-badge">beta</span>
          </div>

          <nav className="nav-links">
            <a href="#">Home</a>
            <a href="#">About</a>
            <a href="#">Contact</a>
          </nav>
        </div>
      </header>

      {/* PAGE CONTENT */}
      <main className="wrapper">
        {/* HERO */}
        <section className="hero-card">
          <div className="hero-eyebrow">Sports</div>
          <h1 className="hero-title">Sports Bets Prop Tracker</h1>
          <p className="hero-desc">
            Track player props across major North American leagues with a clean, fast interface.
          </p>

          <div style={{ marginTop: "1.5rem", marginBottom: "1rem" }}>
            <PlayerSearch />
          </div>
        </section>

        {/* LEAGUE GRID */}
        <section id="leagues" className="features-section">
          <article className="feature-card">
            <div className="feature-title">
              <span>NFL</span>
              <span className="feature-pill">live</span>
            </div>
            <p className="feature-desc" style={{ marginBottom: "0.8rem" }}>
              Player game stats and trends to help evaluate props.
            </p>
            <Link className="btn-primary" href="/players-client">Open NFL</Link>
          </article>

          <article className="feature-card">
            <div className="feature-title">
              <span>NBA</span>
              <span className="feature-pill">coming soon</span>
            </div>
            <p className="feature-desc">
              Points, rebounds, assists, and advanced splits.
            </p>
          </article>

          <article className="feature-card">
            <div className="feature-title">
              <span>MLB</span>
              <span className="feature-pill">coming soon</span>
            </div>
            <p className="feature-desc">
              Hitting and pitching props with recent form.
            </p>
          </article>

          <article className="feature-card">
            <div className="feature-title">
              <span>NHL</span>
              <span className="feature-pill">coming soon</span>
            </div>
            <p className="feature-desc">
              Shots, points, and on-ice rates for prop context.
            </p>
          </article>

          <article className="feature-card">
            <div className="feature-title">
              <span>CFL</span>
              <span className="feature-pill">coming soon</span>
            </div>
            <p className="feature-desc">
              Canadian football player prop stats and trends.
            </p>
          </article>

          <article className="feature-card">
            <div className="feature-title">
              <span>NCAA</span>
              <span className="feature-pill">coming soon</span>
            </div>
            <p className="feature-desc">
              College player props across divisions.
            </p>
          </article>
        </section>
      </main>
    </>
  );
}

import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* NAVBAR */}
      <header className="navbar">
        <div className="wrapper nav-inner">
          <div className="brand">
            <span>my-first-site</span>
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
        {/* HERO CARD */}
        <section className="hero-card">
          <div className="hero-eyebrow">Welcome</div>
          <h1 className="hero-title">
            Hi, I&apos;m building my first Next.js site.
          </h1>
          <p className="hero-desc">
          <Link href="/players-client">Go to Player Lookup</Link>
          </p>

          <div className="hero-cta-row">
            <a className="btn-primary" href="#">
              View Project
            </a>
            <a className="btn-ghost" href="#">
              GitHub Repo
            </a>
          </div>
        </section>

        {/* FEATURE GRID */}
        <section className="features-section">
          <article className="feature-card">
            <div className="feature-title">
              <span>Fast Iteration</span>
              <span className="feature-pill">local dev</span>
            </div>
            <p className="feature-desc">
              Run <code>npm run dev</code> and see changes instantly on
              localhost:3000. No reload drama, no rebuilds. You change code,
              your browser updates.
            </p>
          </article>

          <article className="feature-card">
            <div className="feature-title">
              <span>Zero-Config Deploy</span>
              <span className="feature-pill">vercel</span>
            </div>
            <p className="feature-desc">
              Push to GitHub, and Vercel ships it live automatically. You don&apos;t
              manage servers — you just write code and commit.
            </p>
          </article>

          <article className="feature-card">
            <div className="feature-title">
              <span>Real Codebase</span>
              <span className="feature-pill">next.js app router</span>
            </div>
            <p className="feature-desc">
              You&apos;re already using the same tech stack used by production teams:
              Next.js routing, React components, and API routes you can add later.
            </p>
          </article>

          <article className="feature-card">
            <div className="feature-title">
              <span>Upgradeable</span>
              <span className="feature-pill">future</span>
            </div>
            <p className="feature-desc">
              You can layer in Tailwind, shadcn/ui, auth, databases, file uploads,
              forms — without throwing this away. This is a real foundation.
            </p>
          </article>
        </section>

        {/* HERO CARD */}
        <section className="hero-card">
          <div className="hero-eyebrow">Welcome</div>
          <h1 className="hero-title">
            Hi, I&apos;m building my first Next.js site.
          </h1>
          <p className="hero-desc">
            Deployed on Vercel. Edited in Cursor. This layout is fully custom —
            no UI library, no Tailwind. Just React components and CSS.
          </p>

          <div className="hero-cta-row">
            <a className="btn-primary" href="#">
              View Project
            </a>
            <a className="btn-ghost" href="#">
              GitHub Repo
            </a>
          </div>
        </section>
      </main>
    </>
  );
}

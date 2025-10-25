export default function Home() {
  return (
    <main style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      fontFamily: "sans-serif"
    }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
        Hi, this is my first Next.js site.
      </h1>
      <p style={{ fontSize: "1.1rem", color: "#555", textAlign: "center", maxWidth: "400px", lineHeight: "1.4" }}>
        I built this with Next.js and I'm about to deploy it with Vercel.
      </p>
    </main>
  );
}

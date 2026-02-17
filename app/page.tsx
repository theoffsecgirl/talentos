import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ maxWidth: 720, margin: "60px auto", padding: 16 }}>
      <h1 style={{ fontSize: 34, fontWeight: 800 }}>Encuentra tu talento</h1>
      <p style={{ marginTop: 12, opacity: 0.8, lineHeight: 1.6 }}>
        Un flujo breve para empezar a entender tus fortalezas. Sin ruido. Sin postureo.
      </p>

      <Link
        href="/start"
        style={{
          display: "inline-block",
          marginTop: 18,
          padding: "10px 14px",
          borderRadius: 10,
          background: "#111",
          color: "white",
          textDecoration: "none",
        }}
      >
        Empezar
      </Link>
    </main>
  );
}

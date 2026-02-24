import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ maxWidth: 720, margin: "60px auto", padding: 16 }}>
      <h1 style={{ fontSize: 34, fontWeight: 800 }}>Descubre tu futuro profesional</h1>
      <p style={{ marginTop: 12, opacity: 0.8, lineHeight: 1.6 }}>
        Cuestionario basado en neurociencia aplicada para conocer tus talentos, cómo aprendes mejor y obtener orientación personalizada sobre tu carrera.
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
        Comenzar
      </Link>
    </main>
  );
}

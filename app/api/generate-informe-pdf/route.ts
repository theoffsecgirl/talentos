import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer, Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import { TALENTS } from "@/lib/talents";

const TALENT_CONFIG: Record<number, { symbol: string; color: string; axis: string }> = {
  2: { symbol: "Π", color: "#8B5CF6", axis: "ACCIÓN Y RESULTADOS ---- SABER Y CONOCIMIENTO" },
  3: { symbol: "Ψ", color: "#7C3AED", axis: "CREATIVIDAD Y VÍNCULO ---- SABER Y CONOCIMIENTO" },
  5: { symbol: "Ω", color: "#F59E0B", axis: "PROFUNDIDAD Y SENSIBILIDAD -- DESEMPEÑO Y PROYECCIÓN" },
  7: { symbol: "Θ", color: "#10B981", axis: "PROFUNDIDAD Y SENSIBILIDAD -- IMAGINACIÓN Y ARTE" },
  4: { symbol: "Α", color: "#EF4444", axis: "ACCIÓN Y RESULTADOS ---- ACCIÓN Y RESULTADOS" },
  1: { symbol: "Δ", color: "#DC2626", axis: "CREATIVIDAD Y VÍNCULO ---- ACCIÓN Y RESULTADOS" },
  6: { symbol: "Φ", color: "#06B6D4", axis: "CREATIVIDAD Y VÍNCULO ---- IMAGINACIÓN Y ARTE" },
  8: { symbol: "▭", color: "#D97706", axis: "ACCIÓN Y RESULTADOS ---- DESEMPEÑO Y PROYECCIÓN" },
};

const TALENT_ORDER = [2, 3, 5, 7, 6, 8, 1, 4];

function pct(score: number, max: number) {
  if (!max) return 0;
  return Math.max(0, Math.min(100, Math.round((score / max) * 100)));
}

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", backgroundColor: "#ffffff" },
  coverPage: { padding: 60, fontFamily: "Helvetica", backgroundColor: "#ffffff", alignItems: "center", justifyContent: "center" },
  subtitle: { fontSize: 10, color: "#6b7280", letterSpacing: 2, textTransform: "uppercase", marginBottom: 20, textAlign: "center" },
  title: { fontSize: 36, fontWeight: "bold", marginBottom: 12, textAlign: "center" },
  coverSub: { fontSize: 14, color: "#6b7280", marginBottom: 40, textAlign: "center" },
  userName: { fontSize: 20, fontWeight: "bold", marginBottom: 8, textAlign: "center" },
  date: { fontSize: 12, color: "#6b7280", textAlign: "center" },
  talentHeader: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  symbol: { fontSize: 36, marginRight: 12 },
  talentTitle: { fontSize: 20, fontWeight: "bold" },
  axis: { fontSize: 10, color: "#6b7280", marginTop: 4 },
  scoreRow: { flexDirection: "row", alignItems: "center", marginTop: 12, marginBottom: 20 },
  scoreLabel: { fontSize: 12, fontWeight: "bold", marginRight: 8 },
  scoreValue: { fontSize: 28, fontWeight: "bold" },
  scoreMax: { fontSize: 16, color: "#6b7280", marginLeft: 4 },
  sectionTitle: { fontSize: 14, fontWeight: "bold", marginBottom: 8 },
  bodyText: { fontSize: 12, lineHeight: 1.6, color: "#374151", marginBottom: 12 },
  barBg: { height: 10, backgroundColor: "#e5e7eb", borderRadius: 5, marginBottom: 16 },
  barFill: { height: 10, borderRadius: 5 },
  fieldItem: { fontSize: 12, color: "#374151", marginBottom: 4 },
});

function InformePDF({ userName, date, scores }: {
  userName: string;
  date: string;
  scores: Array<{ talentId: number; score: number; max: number }>;
}) {
  const byId = new Map(scores.map((s) => [s.talentId, s]));

  return (
    <Document>
      {/* Portada */}
      <Page size="A4" style={styles.coverPage}>
        <Text style={styles.subtitle}>NEUROCIENCIA APLICADA · DESCUBRE TU FUTURO PROFESIONAL</Text>
        <Text style={styles.title}>TU INFORME DE TALENTOS</Text>
        <Text style={styles.coverSub}>Mapa visual basado en neurociencia aplicada</Text>
        <Text style={styles.userName}>{userName}</Text>
        <Text style={styles.date}>{date}</Text>
      </Page>

      {/* Páginas de talentos */}
      {TALENT_ORDER.map((tid) => {
        const s = byId.get(tid);
        const config = TALENT_CONFIG[tid];
        const t = TALENTS.find((x: any) => x.id === tid);
        const percentage = pct(s?.score ?? 0, s?.max ?? 0);

        return (
          <Page key={tid} size="A4" style={styles.page}>
            <View style={styles.talentHeader}>
              <Text style={[styles.symbol, { color: config.color }]}>{config.symbol}</Text>
              <View>
                <Text style={styles.talentTitle}>{t?.reportTitle || t?.quizTitle}</Text>
                <Text style={styles.axis}>{config.axis}</Text>
              </View>
            </View>

            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>Puntuación</Text>
              <Text style={[styles.scoreValue, { color: config.color }]}>{s?.score ?? 0}</Text>
              <Text style={styles.scoreMax}>/ {s?.max ?? 15}</Text>
            </View>

            <View style={[styles.barBg, { width: "100%" }]}>
              <View style={[styles.barFill, { width: `${percentage}%`, backgroundColor: config.color }]} />
            </View>

            <Text style={styles.sectionTitle}>Resumen neurocognitivo</Text>
            <Text style={styles.bodyText}>{t?.reportSummary || ""}</Text>

            <Text style={styles.sectionTitle}>Ámbitos profesionales</Text>
            {(t?.fields || []).map((field: string, i: number) => (
              <Text key={i} style={styles.fieldItem}>• {field}</Text>
            ))}
          </Page>
        );
      })}
    </Document>
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userName, date, scores } = body;

    if (!userName || !scores) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const pdfBuffer = await renderToBuffer(
      <InformePDF
        userName={userName}
        date={date || new Date().toLocaleDateString("es-ES")}
        scores={scores}
      />
    );

    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${userName}-Informe-Talentos.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}

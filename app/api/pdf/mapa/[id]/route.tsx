import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Document, Page, Text, View, StyleSheet, pdf } from "@react-pdf/renderer";
import { TALENTS } from "@/lib/talents";

const TALENT_CONFIG = TALENTS.reduce((acc, t) => {
  acc[t.id] = {
    symbol: t.titleSymbolic.match(/\((.+?)\)/)?.[1] || t.code,
    color: getTalentColor(t.id),
    reportTitle: t.reportTitle || t.quizTitle,
    axis: getAxisForTalent(t.id),
  };
  return acc;
}, {} as Record<number, { symbol: string; color: string; reportTitle: string; axis: string }>);

function getTalentColor(id: number): string {
  const colorMap: Record<number, string> = {
    1: "#DC2626", 2: "#8B5CF6", 3: "#7C3AED", 4: "#EF4444",
    5: "#F59E0B", 6: "#06B6D4", 7: "#10B981", 8: "#D97706",
  };
  return colorMap[id] || "#64748b";
}

function getAxisForTalent(id: number): string {
  const axisMap: Record<number, string> = {
    1: "Acción", 2: "Conocimiento", 3: "Conocimiento", 4: "Acción",
    5: "Entrega", 6: "Imaginación", 7: "Imaginación", 8: "Desempeño",
  };
  return axisMap[id] || "";
}

const TALENT_ORDER = [2, 3, 5, 7, 6, 8, 1, 4];

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", fontSize: 10, color: "#0f172a" },
  pill: { border: "1px solid #e5e7eb", borderRadius: 999, padding: "6px 10px", fontSize: 9, color: "#64748b", alignSelf: "center", marginBottom: 12 },
  title: { fontSize: 24, fontFamily: "Helvetica-Bold", marginBottom: 4, textAlign: "center" },
  muted: { color: "#64748b", fontSize: 10, marginBottom: 20, textAlign: "center" },
  h3: { fontSize: 12, fontFamily: "Helvetica-Bold", marginBottom: 8, marginTop: 20 },
  talentDetailCard: { border: "1px solid #e5e7eb", borderRadius: 8, padding: 10, marginBottom: 6, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  visualGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginVertical: 20, justifyContent: "center" },
  talentBox: { width: 120, alignItems: "center", padding: 12, border: "2px solid", borderRadius: 8 },
  talentSymbol: { fontSize: 32, fontFamily: "Helvetica-Bold", marginBottom: 6 },
  talentName: { fontSize: 9, textAlign: "center", marginBottom: 6 },
  percentageBar: { width: 100, height: 12, backgroundColor: "#e5e7eb", borderRadius: 6, marginTop: 4, overflow: "hidden" },
  percentageFill: { height: 12, borderRadius: 6 },
  percentageText: { fontSize: 14, fontFamily: "Helvetica-Bold", marginTop: 4 },
});

function TalentVisualGrid({ scores }: { scores: Array<{ talentId: number; score: number; max: number }> }) {
  const talents = TALENT_ORDER.map((talentId) => {
    const scoreData = scores.find((s) => s.talentId === talentId);
    const config = TALENT_CONFIG[talentId];
    const score = scoreData?.score ?? 0;
    const maxScore = scoreData?.max ?? 15;
    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    return { id: talentId, symbol: config.symbol, color: config.color, reportTitle: config.reportTitle, percentage };
  });

  return (
    <View style={styles.visualGrid}>
      {talents.map((talent) => (
        <View key={talent.id} style={{ ...styles.talentBox, borderColor: talent.color }}>
          <Text style={{ ...styles.talentSymbol, color: talent.color }}>{talent.symbol}</Text>
          <Text style={styles.talentName}>{talent.reportTitle}</Text>
          <View style={styles.percentageBar}>
            <View style={{ ...styles.percentageFill, width: `${talent.percentage}%`, backgroundColor: talent.color }} />
          </View>
          <Text style={{ ...styles.percentageText, color: talent.color }}>{talent.percentage}%</Text>
        </View>
      ))}
    </View>
  );
}

function MapPDFDocument({ nombre, apellido, fecha, scores }: any) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.pill}>MAPA DE TALENTOS</Text>
        <Text style={styles.title}>{nombre} {apellido}</Text>
        <Text style={styles.muted}>{fecha}</Text>
        <TalentVisualGrid scores={scores} />
        <View style={{ marginTop: 20 }}>
          <Text style={styles.h3}>Detalle por talento</Text>
          {TALENT_ORDER.map((tid) => {
            const s = scores.find((x: any) => x.talentId === tid);
            const config = TALENT_CONFIG[tid];
            const percentage = s && s.max > 0 ? Math.round((s.score / s.max) * 100) : 0;
            return (
              <View key={tid} style={styles.talentDetailCard}>
                <View style={{ flexDirection: "row", gap: 8, alignItems: "center", flex: 1 }}>
                  <Text style={{ fontSize: 18, color: config.color }}>{config.symbol}</Text>
                  <View>
                    <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold" }}>{config.reportTitle}</Text>
                    <Text style={{ fontSize: 8, color: "#64748b" }}>{config.axis}</Text>
                  </View>
                </View>
                <Text style={{ fontSize: 14, fontFamily: "Helvetica-Bold", color: config.color }}>{percentage}%</Text>
              </View>
            );
          })}
        </View>
      </Page>
    </Document>
  );
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const person = await prisma.submission.findUnique({ where: { id }, include: { assessments: { orderBy: { createdAt: "desc" }, take: 1 } } });
    if (!person || !person.assessments[0]) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    const assessment = person.assessments[0];
    const scores: Array<{ talentId: number; score: number; max: number }> = Array.isArray(assessment.scoresJson)
      ? assessment.scoresJson.map((x: any) => ({ talentId: Number(x?.talentId), score: Number(x?.score ?? 0), max: Number(x?.max ?? 0) })).filter((x: any) => Number.isFinite(x.talentId))
      : [];
    const doc = MapPDFDocument({ nombre: person.nombre, apellido: person.apellido, fecha: new Date(person.createdAt).toLocaleDateString('es-ES'), scores });
    const pdfBlob = await pdf(doc).toBlob();
    const buffer = await pdfBlob.arrayBuffer();
    return new NextResponse(buffer, { headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="${person.nombre}-${person.apellido}-Mapa-Talentos.pdf"` } });
  } catch (error) {
    console.error('Error generando mapa PDF:', error);
    return NextResponse.json({ error: 'Error generando mapa PDF', details: String(error) }, { status: 500 });
  }
}

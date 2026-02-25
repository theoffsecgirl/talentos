import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Document, Page, Text, View, StyleSheet, pdf, Svg, Path, Circle, Line, G } from "@react-pdf/renderer";
import { TALENTS } from "@/src/lib/talents";

// Construir TALENT_CONFIG desde los datos reales
const TALENT_CONFIG = TALENTS.reduce((acc, t) => {
  acc[t.id] = {
    symbol: t.titleSymbolic.match(/\((.+?)\)/)?.[1] || t.code,
    color: getTalentColor(t.id),
    code: t.code,
    quizTitle: t.quizTitle,
    reportTitle: t.reportTitle || t.quizTitle,
    reportSummary: t.reportSummary || "",
    fields: t.fields || [],
    competencies: t.competencies || [],
    exampleRoles: t.exampleRoles || [],
    axis: t.axis || "",
    group: t.group || "",
  };
  return acc;
}, {} as Record<number, { symbol: string; color: string; code: string; quizTitle: string; reportTitle: string; reportSummary: string; fields: string[]; competencies: string[]; exampleRoles: string[]; axis: string; group: string }>);

function getTalentColor(id: number): string {
  const colorMap: Record<number, string> = {
    1: "#DC2626", // T1 - Δ - Rojo oscuro
    2: "#8B5CF6", // T2 - Π - Violeta
    3: "#7C3AED", // T3 - Ψ - Violeta oscuro
    4: "#EF4444", // T4 - Α - Rojo
    5: "#F59E0B", // T5 - Ω - Naranja
    6: "#06B6D4", // T6 - Φ - Cian
    7: "#10B981", // T7 - Θ - Verde
    8: "#D97706", // T8 - ▭ - Naranja oscuro
  };
  return colorMap[id] || "#64748b";
}

const TALENT_ORDER = [2, 3, 5, 7, 6, 8, 1, 4];

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#0f172a',
  },
  pill: {
    border: '1px solid #e5e7eb',
    borderRadius: 999,
    padding: '6px 10px',
    fontSize: 9,
    color: '#64748b',
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  h1: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 10,
  },
  muted: {
    color: '#64748b',
    fontSize: 9,
  },
  card: {
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  flexRow: {
    flexDirection: 'row',
    gap: 10,
  },
  grid2: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  legendBox: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  top3Card: {
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    flexDirection: 'row',
    gap: 10,
  },
});

function TalentWheelSVG({ scores }: { scores: Array<{ talentId: number; score: number; max: number }> }) {
  const size = 400;
  const center = size / 2;
  const radius = 160;
  const innerRadius = 40;

  const talents = TALENT_ORDER.map((talentId) => {
    const scoreData = scores.find((s) => s.talentId === talentId);
    const config = TALENT_CONFIG[talentId];
    const score = scoreData?.score ?? 0;
    const maxScore = scoreData?.max ?? 15;
    const fillPercentage = maxScore > 0 ? score / maxScore : 0;
    const fillRadius = innerRadius + (radius - innerRadius) * fillPercentage;
    return { id: talentId, symbol: config.symbol, color: config.color, fillRadius, fillPercentage };
  });

  const polarToCartesian = (angle: number, r: number) => ({
    x: center + r * Math.cos(angle),
    y: center + r * Math.sin(angle),
  });

  const createArcPath = (startAngle: number, endAngle: number, outerR: number, innerR: number) => {
    const start = polarToCartesian(startAngle, outerR);
    const end = polarToCartesian(endAngle, outerR);
    const innerStart = polarToCartesian(startAngle, innerR);
    const innerEnd = polarToCartesian(endAngle, innerR);
    const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;
    return `M ${start.x} ${start.y} A ${outerR} ${outerR} 0 ${largeArcFlag} 1 ${end.x} ${end.y} L ${innerEnd.x} ${innerEnd.y} A ${innerR} ${innerR} 0 ${largeArcFlag} 0 ${innerStart.x} ${innerStart.y} Z`;
  };

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ alignSelf: 'center', marginVertical: 20 }}>
      <Line x1={center} y1={center - radius} x2={center} y2={center + radius} stroke="#000" strokeWidth="2" />
      <Line x1={center - radius} y1={center} x2={center + radius} y2={center} stroke="#000" strokeWidth="2" />
      {talents.map((talent, index) => {
        const anglePerSection = (Math.PI * 2) / 8;
        const startAngle = index * anglePerSection - Math.PI / 2;
        const endAngle = startAngle + anglePerSection;
        return (
          <G key={talent.id}>
            <Path d={createArcPath(startAngle, endAngle, talent.fillRadius, innerRadius)} fill={talent.color} fillOpacity={0.6} stroke={talent.color} strokeWidth="1" />
          </G>
        );
      })}
      <Circle cx={center} cy={center} r={innerRadius} fill="white" stroke="#000" strokeWidth="2" />
    </Svg>
  );
}

function PDFDocument({
  nombre,
  apellido,
  fecha,
  scores,
  top3,
}: any) {
  return (
    <Document>
      {/* Portada con mapa */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.pill}>NEUROCIENCIA APLICADA · DESCUBRE TU FUTURO PROFESIONAL</Text>
        <Text style={styles.h1}>TU INFORME DE TALENTOS</Text>
        <Text style={styles.muted}>Mapa visual basado en neurociencia aplicada</Text>
        <Text style={{ fontSize: 14, fontWeight: 'bold', marginTop: 12 }}>{nombre} {apellido}</Text>
        <Text style={styles.muted}>{fecha}</Text>

        <TalentWheelSVG scores={scores} />

        {/* Leyenda de categorías */}
        <View style={styles.grid2}>
          <View style={{ ...styles.card, flex: 1 }}>
            <View style={styles.flexRow}>
              <View style={{ ...styles.legendBox, backgroundColor: '#EF4444' }} />
              <Text style={{ fontWeight: 'bold', fontSize: 10 }}>Acción</Text>
            </View>
            <Text style={styles.muted}>Resultados</Text>
          </View>
          <View style={{ ...styles.card, flex: 1 }}>
            <View style={styles.flexRow}>
              <View style={{ ...styles.legendBox, backgroundColor: '#8B5CF6' }} />
              <Text style={{ fontWeight: 'bold', fontSize: 10 }}>Conocimiento</Text>
            </View>
            <Text style={styles.muted}>Ciencia aplicada</Text>
          </View>
        </View>
        <View style={styles.grid2}>
          <View style={{ ...styles.card, flex: 1 }}>
            <View style={styles.flexRow}>
              <View style={{ ...styles.legendBox, backgroundColor: '#06B6D4' }} />
              <Text style={{ fontWeight: 'bold', fontSize: 10 }}>Imaginación</Text>
            </View>
            <Text style={styles.muted}>Arte</Text>
          </View>
          <View style={{ ...styles.card, flex: 1 }}>
            <View style={styles.flexRow}>
              <View style={{ ...styles.legendBox, backgroundColor: '#F59E0B' }} />
              <Text style={{ fontWeight: 'bold', fontSize: 10 }}>Desempeño</Text>
            </View>
            <Text style={styles.muted}>Energía</Text>
          </View>
        </View>
      </Page>

      {/* Top 3 talentos */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.h2}>Tus 3 talentos más destacados</Text>
        {top3.map((t: any, idx: number) => {
          const config = TALENT_CONFIG[t.talentId];
          return (
            <View key={t.talentId} style={styles.top3Card}>
              <Text style={{ fontSize: 24, color: config?.color || '#000' }}>{config?.symbol}</Text>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', gap: 6, marginBottom: 4 }}>
                  <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#64748b' }}>#{idx + 1}</Text>
                  <Text style={{ fontWeight: 'bold', fontSize: 12 }}>{t.reportTitle || t.quizTitle}</Text>
                </View>
                <Text style={{ ...styles.muted, lineHeight: 1.4 }}>{t.reportSummary}</Text>
                <Text style={{ fontSize: 14, fontWeight: 'bold', textAlign: 'right', marginTop: 6 }}>
                  {t.score} <Text style={{ ...styles.muted, fontSize: 9 }}>/ {t.max}</Text>
                </Text>
              </View>
            </View>
          );
        })}

        {/* Tabla completa de talentos */}
        <View style={{ ...styles.card, marginTop: 10 }}>
          <Text style={{ fontWeight: 'bold', marginBottom: 8, fontSize: 11 }}>Todos los talentos</Text>
          {TALENT_ORDER.map((tid) => {
            const s = scores.find((x: any) => x.talentId === tid);
            const config = TALENT_CONFIG[tid];
            return (
              <View key={tid} style={{ flexDirection: 'row', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb', paddingVertical: 4 }}>
                <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                  <Text style={{ fontSize: 14, color: config.color }}>{config.symbol}</Text>
                  <Text style={{ fontSize: 9, fontWeight: 'bold' }}>{config.reportTitle}</Text>
                </View>
                <Text style={{ fontSize: 9, fontWeight: 'bold' }}>{s?.score ?? 0} / {s?.max ?? 15}</Text>
              </View>
            );
          })}
        </View>
      </Page>

      {/* Profesiones y roles sugeridos */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.h2}>Profesiones y roles sugeridos</Text>
        <Text style={styles.muted}>Basado en tus talentos principales:</Text>
        <View style={{ ...styles.card, marginTop: 8 }}>
          {top3.flatMap((t: any) => t.exampleRoles).map((role: string, idx: number) => (
            <View key={idx} style={{ flexDirection: 'row', gap: 8, paddingVertical: 4, borderBottom: idx < top3.flatMap((t: any) => t.exampleRoles).length - 1 ? '1px solid #e5e7eb' : 'none' }}>
              <Text style={{ fontSize: 12 }}>•</Text>
              <Text style={{ fontSize: 9, flex: 1 }}>{role}</Text>
            </View>
          ))}
        </View>
      </Page>

      {/* Páginas individuales por talento */}
      {TALENTS.sort((a, b) => a.id - b.id).map((talent) => {
        const s = scores.find((x: any) => x.talentId === talent.id);
        const config = TALENT_CONFIG[talent.id];
        
        return (
          <Page key={talent.id} size="A4" style={styles.page}>
            <Text style={styles.pill}>{talent.code} · {config.symbol} · {talent.titleGenotype}</Text>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.h2}>{talent.reportTitle || talent.quizTitle}</Text>
                <Text style={styles.muted}>{talent.group || talent.quizTitle}</Text>
              </View>
              <View style={{ textAlign: 'right' }}>
                <Text style={{ ...styles.muted, fontWeight: 'bold' }}>Puntuación</Text>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: config.color }}>{s?.score ?? 0}</Text>
                <Text style={styles.muted}>/ {s?.max ?? 15}</Text>
              </View>
            </View>

            {/* Resumen neurocognitivo */}
            <View style={{ ...styles.card, marginTop: 10 }}>
              <Text style={{ fontWeight: 'bold', marginBottom: 6 }}>Resumen neurocognitivo</Text>
              <Text style={{ fontSize: 9, lineHeight: 1.4 }}>{talent.reportSummary}</Text>
            </View>

            {/* Ámbitos profesionales y Competencias personales */}
            <View style={styles.grid2}>
              <View style={{ ...styles.card, flex: 1 }}>
                <Text style={{ fontWeight: 'bold', marginBottom: 6, fontSize: 9 }}>Ámbitos profesionales</Text>
                {(talent.fields || []).map((field, idx) => (
                  <Text key={idx} style={{ fontSize: 8, marginBottom: 3 }}>• {field}</Text>
                ))}
              </View>
              <View style={{ ...styles.card, flex: 1 }}>
                <Text style={{ fontWeight: 'bold', marginBottom: 6, fontSize: 9 }}>Competencias personales</Text>
                {(talent.competencies || []).map((comp, idx) => (
                  <Text key={idx} style={{ fontSize: 8, marginBottom: 3 }}>• {comp}</Text>
                ))}
              </View>
            </View>

            {/* Roles y profesiones de ejemplo */}
            <View style={{ ...styles.card, marginTop: 10 }}>
              <Text style={{ fontWeight: 'bold', marginBottom: 6 }}>Roles y profesiones de ejemplo</Text>
              {(talent.exampleRoles || []).map((role, idx) => (
                <Text key={idx} style={{ fontSize: 9, marginBottom: 3 }}>• {role}</Text>
              ))}
            </View>
          </Page>
        );
      })}
    </Document>
  );
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const person = await prisma.submission.findUnique({
      where: { id },
      include: {
        user: true,
        assessments: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!person || !person.assessments[0]) {
      return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    }

    const assessment = person.assessments[0];

    const scores: Array<{ talentId: number; score: number; max: number }> = Array.isArray(assessment.scoresJson)
      ? assessment.scoresJson
          .map((x: any) => ({ talentId: Number(x?.talentId), score: Number(x?.score ?? 0), max: Number(x?.max ?? 0) }))
          .filter((x: any) => Number.isFinite(x.talentId))
      : [];

    const top3 = scores
      .slice()
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((s) => {
        const t = TALENT_CONFIG[s.talentId];
        return {
          talentId: s.talentId,
          code: t?.code ?? `T${s.talentId}`,
          quizTitle: t?.quizTitle ?? '',
          reportTitle: t?.reportTitle ?? '',
          reportSummary: t?.reportSummary ?? '',
          fields: t?.fields ?? [],
          competencies: t?.competencies ?? [],
          exampleRoles: t?.exampleRoles ?? [],
          score: s.score,
          max: s.max,
        };
      });

    const doc = PDFDocument({
      nombre: person.nombre,
      apellido: person.apellido,
      fecha: new Date(person.createdAt).toLocaleDateString('es-ES'),
      scores,
      top3,
    });

    const pdfBlob = await pdf(doc).toBlob();
    const buffer = await pdfBlob.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${person.nombre}-${person.apellido}-Informe-Talentos.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generando PDF:', error);
    return NextResponse.json({ error: 'Error generando PDF', details: String(error) }, { status: 500 });
  }
}

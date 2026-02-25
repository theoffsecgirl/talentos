import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Document, Page, Text, View, StyleSheet, pdf, Svg, Path, Circle, Line, G, Defs, RadialGradient, Stop } from "@react-pdf/renderer";
import React from "react";

const TALENT_CONFIG: Record<number, { symbol: string; color: string }> = {
  2: { symbol: "Π", color: "#8B5CF6" },
  3: { symbol: "Ψ", color: "#7C3AED" },
  5: { symbol: "Ω", color: "#F59E0B" },
  7: { symbol: "Θ", color: "#10B981" },
  4: { symbol: "Α", color: "#EF4444" },
  1: { symbol: "Δ", color: "#DC2626" },
  6: { symbol: "Φ", color: "#06B6D4" },
  8: { symbol: "▭", color: "#D97706" },
};

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
  fieldItem: {
    padding: 8,
    border: '1px solid #e2e8f0',
    borderRadius: 6,
    marginBottom: 6,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
  },
  identifyBox: {
    border: '2px solid #10B981',
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  careerBox: {
    border: '2px solid #0ea5e9',
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  dataGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dataItem: {
    width: '48%',
    fontSize: 9,
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
        const midAngle = (startAngle + endAngle) / 2;
        const labelPos = polarToCartesian(midAngle, radius + 20);
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
  identificaCampos,
  campoIdentificado,
  ideaCarrera,
  ideaCarreraTexto,
  fechaNacimiento,
  genero,
  curso,
  modalidad,
  centro,
}: any) {
  const allFields = Array.from(new Set(top3.flatMap((t: any) => t.fields || [])));

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.pill}>NEUROCIENCIA APLICADA · DESCUBRE TU FUTURO PROFESIONAL</Text>
        <Text style={styles.h1}>TU INFORME DE TALENTOS</Text>
        <Text style={styles.muted}>Mapa visual basado en neurociencia aplicada</Text>
        <Text style={{ fontSize: 14, fontWeight: 'bold', marginTop: 12 }}>{nombre} {apellido}</Text>
        <Text style={styles.muted}>{fecha}</Text>

        <TalentWheelSVG scores={scores} />

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
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.h2}>De tus resultados, encajas en estos campos profesionales</Text>
        <View style={styles.card}>
          {allFields.map((field: string, idx: number) => (
            <View key={idx} style={styles.fieldItem}>
              <View style={styles.dot} />
              <Text style={{ fontSize: 10, fontWeight: 'bold' }}>{field}</Text>
            </View>
          ))}
        </View>
        {identificaCampos === 'Sí' && campoIdentificado && (
          <View style={styles.identifyBox}>
            <Text style={{ fontWeight: 'bold', marginBottom: 4, color: '#10B981' }}>Te identificas con:</Text>
            <Text style={{ fontSize: 10, color: '#047857' }}>{campoIdentificado}</Text>
          </View>
        )}
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.h2}>Tu orientación profesional</Text>
        {ideaCarrera && (
          <View style={styles.careerBox}>
            <Text style={{ fontWeight: 'bold', marginBottom: 4, color: '#0ea5e9' }}>Idea de carrera</Text>
            <Text style={{ fontSize: 11, color: '#0369a1', fontWeight: 'bold' }}>{ideaCarrera}</Text>
            {ideaCarreraTexto && <Text style={{ fontSize: 9, color: '#475569', marginTop: 4 }}>{ideaCarreraTexto}</Text>}
          </View>
        )}
        <View style={{ ...styles.card, marginTop: 12 }}>
          <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Datos personales</Text>
          <View style={styles.dataGrid}>
            <View style={styles.dataItem}>
              <Text style={styles.muted}>Fecha nacimiento:</Text>
              <Text style={{ fontWeight: 'bold' }}>{fechaNacimiento}</Text>
            </View>
            <View style={styles.dataItem}>
              <Text style={styles.muted}>Sexo:</Text>
              <Text style={{ fontWeight: 'bold' }}>{genero}</Text>
            </View>
            <View style={styles.dataItem}>
              <Text style={styles.muted}>Curso:</Text>
              <Text style={{ fontWeight: 'bold' }}>{curso}</Text>
            </View>
            <View style={styles.dataItem}>
              <Text style={styles.muted}>Modalidad:</Text>
              <Text style={{ fontWeight: 'bold' }}>{modalidad}</Text>
            </View>
            <View style={{ width: '100%', fontSize: 9, marginTop: 4 }}>
              <Text style={styles.muted}>Centro educativo:</Text>
              <Text style={{ fontWeight: 'bold' }}>{centro || '—'}</Text>
            </View>
          </View>
        </View>
      </Page>
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
    const talents = await prisma.talent.findMany({ orderBy: { id: 'asc' } });

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
        const t = talents.find((x: any) => x.id === s.talentId);
        return {
          talentId: s.talentId,
          code: t?.code ?? `T${s.talentId}`,
          quizTitle: t?.quizTitle ?? '',
          reportTitle: t?.reportTitle ?? '',
          reportSummary: t?.reportSummary ?? '',
          fields: t?.fields ?? [],
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
      identificaCampos: person.identificaCampos || 'No',
      campoIdentificado: person.campoIdentificado || '',
      ideaCarrera: person.ideaCarreraFinal || person.ideaCarrera || '',
      ideaCarreraTexto: person.ideaCarreraTextoFinal || '',
      fechaNacimiento: new Date(person.fechaNacimiento).toLocaleDateString('es-ES'),
      genero: person.genero,
      curso: person.curso,
      modalidad: person.modalidad,
      centro: person.centroEducativo || '',
    });

    const pdfBuffer = await pdf(doc).toBuffer();

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${person.nombre}-${person.apellido}-Informe-Talentos.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generando PDF:', error);
    return NextResponse.json({ error: 'Error generando PDF' }, { status: 500 });
  }
}

import React from "react";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Document, Page, Text, View, StyleSheet, pdf, Svg, Circle, Line } from "@react-pdf/renderer";
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

function splitTalentTitle(title: string): [string, string] {
  if (title.includes(' y ')) {
    const parts = title.split(' y ');
    if (parts.length === 2) return [parts[0] + ' y', parts[1]];
  }
  if (title.includes(' e ')) {
    const parts = title.split(' e ');
    if (parts.length === 2) return [parts[0] + ' e', parts[1]];
  }
  const words = title.split(' ');
  if (words.length <= 2) return [title, ''];
  const midPoint = Math.ceil(words.length / 2);
  return [words.slice(0, midPoint).join(' '), words.slice(midPoint).join(' ')];
}

const TALENT_ORDER = [2, 3, 5, 7, 6, 8, 1, 4];

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", fontSize: 10, color: "#0f172a" },
  pill: { border: "1px solid #e5e7eb", borderRadius: 999, padding: "6px 10px", fontSize: 9, color: "#64748b", alignSelf: "center", marginBottom: 12 },
  title: { fontSize: 24, fontFamily: "Helvetica-Bold", marginBottom: 4, textAlign: "center" },
  muted: { color: "#64748b", fontSize: 10, marginBottom: 20, textAlign: "center" },
  h3: { fontSize: 12, fontFamily: "Helvetica-Bold", marginBottom: 8, marginTop: 20 },
  talentDetailCard: { border: "1px solid #e5e7eb", borderRadius: 8, padding: 10, marginBottom: 6, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  svgContainer: { position: "relative", width: 500, height: 500, alignSelf: "center", marginVertical: 20 },
  labelContainer: { position: "absolute", width: 90, textAlign: "center" },
  labelSymbol: { fontSize: 18, fontFamily: "Helvetica-Bold", marginBottom: 2 },
  labelTitle: { fontSize: 9, fontFamily: "Helvetica-Bold" },
});

function TalentWheelSVG({ scores }: { scores: Array<{ talentId: number; score: number; max: number }> }) {
  const size = 500;
  const center = size / 2;
  const radius = 150;
  const innerRadius = 50;

  const talents = TALENT_ORDER.map((talentId) => {
    const scoreData = scores.find((s) => s.talentId === talentId);
    const config = TALENT_CONFIG[talentId];
    const score = scoreData?.score ?? 0;
    const maxScore = scoreData?.max ?? 15;
    const fillPercentage = maxScore > 0 ? score / maxScore : 0;
    const percentage = Math.round(fillPercentage * 100);
    const fillRadius = innerRadius + (radius - innerRadius) * fillPercentage;
    const [line1, line2] = splitTalentTitle(config.reportTitle);
    return { id: talentId, symbol: config.symbol, color: config.color, fillRadius, fillPercentage, percentage, titleLine1: line1, titleLine2: line2 };
  });

  const polarToCartesian = (angle: number, r: number) => ({
    x: center + r * Math.cos(angle),
    y: center + r * Math.sin(angle),
  });

  // Calculamos la circunferencia y el tamaño de cada sección (1/8)
  const circumference = 2 * Math.PI * radius;
  const sectionLength = circumference / 8;
  const gapLength = 2; // Espacio entre secciones

  return (
    <View style={styles.svgContainer}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Líneas separadoras principales */}
        <Line x1={center} y1={center - radius} x2={center} y2={center + radius} stroke="#000" strokeWidth="2" />
        <Line x1={center - radius} y1={center} x2={center + radius} y2={center} stroke="#000" strokeWidth="2" />

        {/* Líneas diagonales */}
        {[1, 3, 5, 7].map((index) => {
          const angle = (index * Math.PI * 2) / 8 - Math.PI / 2;
          const outer = polarToCartesian(angle, radius);
          return <Line key={`divider-${index}`} x1={center} y1={center} x2={outer.x} y2={outer.y} stroke="#666" strokeWidth="1" strokeDasharray="4 4" />;
        })}

        {/* Círculos coloreados para cada talento usando strokeDasharray */}
        {talents.map((talent, index) => {
          const angleOffset = (index * circumference) / 8;
          // Usamos múltiples círculos para crear el efecto de relleno
          const steps = Math.max(1, Math.floor((talent.fillRadius - innerRadius) / 3));
          return (
            <React.Fragment key={talent.id}>
              {Array.from({ length: steps }).map((_, step) => {
                const currentRadius = innerRadius + ((talent.fillRadius - innerRadius) * (step + 1)) / steps;
                const currentCircumference = 2 * Math.PI * currentRadius;
                const currentSectionLength = currentCircumference / 8;
                return (
                  <Circle
                    key={`${talent.id}-${step}`}
                    cx={center}
                    cy={center}
                    r={currentRadius}
                    fill="none"
                    stroke={talent.color}
                    strokeWidth="3"
                    strokeDasharray={`${currentSectionLength - gapLength} ${currentCircumference - currentSectionLength + gapLength}`}
                    strokeDashoffset={-angleOffset * (currentRadius / radius)}
                    opacity={0.6}
                  />
                );
              })}
            </React.Fragment>
          );
        })}

        {/* Bordes exteriores completos para cada sección */}
        {talents.map((talent, index) => {
          const angleOffset = (index * circumference) / 8;
          return (
            <Circle
              key={`border-${talent.id}`}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={talent.color}
              strokeWidth="2"
              strokeDasharray={`${sectionLength - gapLength} ${circumference - sectionLength + gapLength}`}
              strokeDashoffset={-angleOffset}
              opacity="0.3"
            />
          );
        })}

        {/* Círculo central */}
        <Circle cx={center} cy={center} r={innerRadius} fill="white" stroke="#000" strokeWidth="2" />
      </Svg>

      {/* Texto central */}
      <Text style={{ position: 'absolute', left: center - 30, top: center - 8, fontSize: 14, fontFamily: 'Helvetica-Bold', color: '#666', width: 60, textAlign: 'center' }}>
        Talentos
      </Text>

      {/* Etiquetas y porcentajes */}
      {talents.map((talent, index) => {
        const anglePerSection = (Math.PI * 2) / 8;
        const startAngle = index * anglePerSection - Math.PI / 2;
        const endAngle = startAngle + anglePerSection;
        const midAngle = (startAngle + endAngle) / 2;
        const labelDistance = radius + 70;
        const percentPos = polarToCartesian(midAngle, (talent.fillRadius + innerRadius) / 2);
        const labelPos = polarToCartesian(midAngle, labelDistance);
        
        return (
          <View key={`label-${talent.id}`}>
            {talent.percentage > 15 && (
              <Text style={{ position: 'absolute', left: percentPos.x - 18, top: percentPos.y - 9, width: 36, fontSize: 16, fontFamily: 'Helvetica-Bold', textAlign: 'center', color: 'white' }}>
                {talent.percentage}%
              </Text>
            )}
            <View style={{ ...styles.labelContainer, left: labelPos.x - 45, top: labelPos.y - 25 }}>
              <Text style={{ ...styles.labelSymbol, color: talent.color }}>{talent.symbol}</Text>
              <Text style={styles.labelTitle}>{talent.titleLine1}</Text>
              {talent.titleLine2 && <Text style={styles.labelTitle}>{talent.titleLine2}</Text>}
            </View>
          </View>
        );
      })}
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
        <TalentWheelSVG scores={scores} />
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

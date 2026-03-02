import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Document, Page, Text, View, StyleSheet, pdf, Image } from "@react-pdf/renderer";
import { TALENTS } from "@/lib/talents";
import { createCanvas } from "canvas";

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
  if (title.includes(' y ')) { const parts = title.split(' y '); if (parts.length === 2) return [parts[0] + ' y', parts[1]]; }
  if (title.includes(' e ')) { const parts = title.split(' e '); if (parts.length === 2) return [parts[0] + ' e', parts[1]]; }
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
  wheelImage: { width: 400, height: 400, alignSelf: "center", marginVertical: 20 },
});

function generateTalentWheelImage(scores: Array<{ talentId: number; score: number; max: number }>): string {
  const size = 800;
  const center = size / 2;
  const radius = 280;
  const innerRadius = 100;
  
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Fondo blanco
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, size, size);
  
  const talents = TALENT_ORDER.map((talentId) => {
    const scoreData = scores.find((s) => s.talentId === talentId);
    const config = TALENT_CONFIG[talentId];
    const score = scoreData?.score ?? 0;
    const maxScore = scoreData?.max ?? 15;
    const fillPercentage = maxScore > 0 ? score / maxScore : 0;
    const percentage = Math.round(fillPercentage * 100);
    const fillRadius = innerRadius + (radius - innerRadius) * fillPercentage;
    const [line1, line2] = splitTalentTitle(config.reportTitle);
    return { id: talentId, symbol: config.symbol, color: config.color, fillRadius, percentage, titleLine1: line1, titleLine2: line2 };
  });
  
  // Dibujar secciones de talentos
  talents.forEach((talent, index) => {
    const anglePerSection = (Math.PI * 2) / 8;
    const startAngle = index * anglePerSection - Math.PI / 2;
    const endAngle = startAngle + anglePerSection;
    
    // Área rellena
    ctx.beginPath();
    ctx.arc(center, center, talent.fillRadius, startAngle, endAngle);
    ctx.lineTo(center, center);
    ctx.closePath();
    ctx.fillStyle = talent.color;
    ctx.globalAlpha = 0.7;
    ctx.fill();
    ctx.globalAlpha = 1.0;
    
    // Borde exterior completo
    ctx.beginPath();
    ctx.arc(center, center, radius, startAngle, endAngle);
    ctx.lineWidth = 3;
    ctx.strokeStyle = talent.color;
    ctx.globalAlpha = 0.3;
    ctx.stroke();
    ctx.globalAlpha = 1.0;
  });
  
  // Líneas separadoras principales
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(center, center - radius);
  ctx.lineTo(center, center + radius);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(center - radius, center);
  ctx.lineTo(center + radius, center);
  ctx.stroke();
  
  // Líneas diagonales
  ctx.strokeStyle = '#666';
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 8]);
  [1, 3, 5, 7].forEach((index) => {
    const angle = (index * Math.PI * 2) / 8 - Math.PI / 2;
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.lineTo(x, y);
    ctx.stroke();
  });
  ctx.setLineDash([]);
  
  // Círculo central
  ctx.beginPath();
  ctx.arc(center, center, innerRadius, 0, Math.PI * 2);
  ctx.fillStyle = 'white';
  ctx.fill();
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 3;
  ctx.stroke();
  
  // Texto central
  ctx.fillStyle = '#666';
  ctx.font = 'bold 28px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Talentos', center, center);
  
  // Etiquetas y porcentajes
  talents.forEach((talent, index) => {
    const anglePerSection = (Math.PI * 2) / 8;
    const startAngle = index * anglePerSection - Math.PI / 2;
    const midAngle = startAngle + anglePerSection / 2;
    
    // Porcentaje
    if (talent.percentage > 15) {
      const percentDist = (talent.fillRadius + innerRadius) / 2;
      const px = center + percentDist * Math.cos(midAngle);
      const py = center + percentDist * Math.sin(midAngle);
      ctx.fillStyle = '#333';
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${talent.percentage}%`, px, py);
    }
    
    // Símbolo y nombre
    const labelDist = radius + 120;
    const lx = center + labelDist * Math.cos(midAngle);
    const ly = center + labelDist * Math.sin(midAngle);
    
    ctx.fillStyle = talent.color;
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(talent.symbol, lx, ly - 30);
    
    ctx.fillStyle = '#000';
    ctx.font = 'bold 18px Arial';
    ctx.fillText(talent.titleLine1, lx, ly);
    if (talent.titleLine2) {
      ctx.fillText(talent.titleLine2, lx, ly + 20);
    }
  });
  
  return canvas.toDataURL();
}

function MapPDFDocument({ nombre, apellido, fecha, scores, wheelImageData }: any) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.pill}>MAPA DE TALENTOS</Text>
        <Text style={styles.title}>{nombre} {apellido}</Text>
        <Text style={styles.muted}>{fecha}</Text>
        <Image src={wheelImageData} style={styles.wheelImage} />
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
    
    const wheelImageData = generateTalentWheelImage(scores);
    const doc = MapPDFDocument({ nombre: person.nombre, apellido: person.apellido, fecha: new Date(person.createdAt).toLocaleDateString('es-ES'), scores, wheelImageData });
    const pdfBlob = await pdf(doc).toBlob();
    const buffer = await pdfBlob.arrayBuffer();
    return new NextResponse(buffer, { headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="${person.nombre}-${person.apellido}-Mapa-Talentos.pdf"` } });
  } catch (error) {
    console.error('Error generando mapa PDF:', error);
    return NextResponse.json({ error: 'Error generando mapa PDF', details: String(error) }, { status: 500 });
  }
}

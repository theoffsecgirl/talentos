import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Document, Page, Text, View, StyleSheet, pdf, Svg, Path, Circle, Line, G } from "@react-pdf/renderer";

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
    justifyContent: 'center',
    alignItems: 'center',
  },
  pill: {
    border: '1px solid #e5e7eb',
    borderRadius: 999,
    padding: '6px 10px',
    fontSize: 9,
    color: '#64748b',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  muted: {
    color: '#64748b',
    fontSize: 10,
    marginBottom: 20,
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
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
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

function MapPDFDocument({ nombre, apellido, fecha, scores }: any) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.pill}>MAPA DE TALENTOS</Text>
        <Text style={styles.title}>{nombre} {apellido}</Text>
        <Text style={styles.muted}>{fecha}</Text>
        <TalentWheelSVG scores={scores} />
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

    const doc = MapPDFDocument({
      nombre: person.nombre,
      apellido: person.apellido,
      fecha: new Date(person.createdAt).toLocaleDateString('es-ES'),
      scores,
    });

    const pdfBuffer = await pdf(doc).toBuffer();

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${person.nombre}-${person.apellido}-Mapa-Talentos.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generando mapa PDF:', error);
    return NextResponse.json({ error: 'Error generando mapa PDF', details: String(error) }, { status: 500 });
  }
}

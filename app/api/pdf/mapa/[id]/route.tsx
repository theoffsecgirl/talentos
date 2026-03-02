import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Document, Page, Text, View, StyleSheet, pdf, Svg, Path, Circle, Line, G, Defs, RadialGradient, Stop } from "@react-pdf/renderer";
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
    1: "#DC2626",
    2: "#8B5CF6",
    3: "#7C3AED",
    4: "#EF4444",
    5: "#F59E0B",
    6: "#06B6D4",
    7: "#10B981",
    8: "#D97706",
  };
  return colorMap[id] || "#64748b";
}

function getAxisForTalent(id: number): string {
  const axisMap: Record<number, string> = {
    1: "Acción",
    2: "Conocimiento",
    3: "Conocimiento",
    4: "Acción",
    5: "Entrega",
    6: "Imaginación",
    7: "Imaginación",
    8: "Desempeño",
  };
  return axisMap[id] || "";
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
    alignSelf: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  muted: {
    color: '#64748b',
    fontSize: 10,
    marginBottom: 20,
    textAlign: 'center',
  },
  h3: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 20,
  },
  talentDetailCard: {
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    padding: 10,
    marginBottom: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    const percentage = Math.round(fillPercentage * 100);
    const fillRadius = innerRadius + (radius - innerRadius) * fillPercentage;
    return { id: talentId, symbol: config.symbol, color: config.color, fillRadius, fillPercentage, percentage };
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
      <Defs>
        {talents.map((talent) => (
          <RadialGradient key={`grad-${talent.id}`} id={`gradient-${talent.id}`}>
            <Stop offset="0%" stopColor={talent.color} stopOpacity={Math.min(talent.fillPercentage * 1.2, 1)} />
            <Stop offset={`${talent.fillPercentage * 100}%`} stopColor={talent.color} stopOpacity={0.6} />
            <Stop offset="100%" stopColor={talent.color} stopOpacity={0.1} />
          </RadialGradient>
        ))}
      </Defs>

      {/* Líneas separadoras principales */}
      <Line x1={center} y1={center - radius} x2={center} y2={center + radius} stroke="#000" strokeWidth="2" />
      <Line x1={center - radius} y1={center} x2={center + radius} y2={center} stroke="#000" strokeWidth="2" />

      {/* Líneas diagonales */}
      {[1, 3, 5, 7].map((index) => {
        const angle = (index * Math.PI * 2) / 8 - Math.PI / 2;
        const outer = polarToCartesian(angle, radius);
        return (
          <Line
            key={`divider-${index}`}
            x1={center}
            y1={center}
            x2={outer.x}
            y2={outer.y}
            stroke="#666"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
        );
      })}

      {/* Secciones de talentos */}
      {talents.map((talent, index) => {
        const anglePerSection = (Math.PI * 2) / 8;
        const startAngle = index * anglePerSection - Math.PI / 2;
        const endAngle = startAngle + anglePerSection;
        const midAngle = (startAngle + endAngle) / 2;
        const percentPos = polarToCartesian(midAngle, (talent.fillRadius + innerRadius) / 2);
        
        return (
          <G key={talent.id}>
            {/* Área sombreada con gradiente */}
            <Path 
              d={createArcPath(startAngle, endAngle, talent.fillRadius, innerRadius)} 
              fill={`url(#gradient-${talent.id})`}
              stroke={talent.color} 
              strokeWidth="1" 
            />
            
            {/* Borde exterior completo */}
            <Path 
              d={createArcPath(startAngle, endAngle, radius, innerRadius)} 
              fill="none" 
              stroke={talent.color} 
              strokeWidth="2" 
              opacity="0.3" 
            />

            {/* Porcentaje dentro de la sección (solo si es mayor a 15%) */}
            {talent.percentage > 15 && (
              <Text
                x={percentPos.x}
                y={percentPos.y}
                textAnchor="middle"
                fontSize="14"
                fontWeight="bold"
                fill="white"
              >
                {talent.percentage}%
              </Text>
            )}
          </G>
        );
      })}

      <Circle cx={center} cy={center} r={innerRadius} fill="white" stroke="#000" strokeWidth="2" />
      <Text
        x={center}
        y={center}
        textAnchor="middle"
        fontSize="12"
        fontWeight="bold"
        fill="#666"
      >
        Talentos
      </Text>
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

        {/* Detalle por talento */}
        <View style={{ marginTop: 20 }}>
          <Text style={styles.h3}>Detalle por talento</Text>
          {TALENT_ORDER.map((tid) => {
            const s = scores.find((x: any) => x.talentId === tid);
            const config = TALENT_CONFIG[tid];
            const percentage = s && s.max > 0 ? Math.round((s.score / s.max) * 100) : 0;
            
            return (
              <View key={tid} style={styles.talentDetailCard}>
                <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', flex: 1 }}>
                  <Text style={{ fontSize: 18, color: config.color }}>{config.symbol}</Text>
                  <View>
                    <Text style={{ fontSize: 10, fontWeight: 'bold' }}>{config.reportTitle}</Text>
                    <Text style={{ fontSize: 8, color: '#64748b' }}>{config.axis}</Text>
                  </View>
                </View>
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: config.color }}>
                  {percentage}%
                </Text>
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

    const pdfBlob = await pdf(doc).toBlob();
    const buffer = await pdfBlob.arrayBuffer();

    return new NextResponse(buffer, {
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

import { NextRequest, NextResponse } from "next/server";
import { createCanvas, CanvasRenderingContext2D } from "canvas";
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

function splitTalentTitle(title: string): [string, string] {
  if (title.includes(' y ')) {
    const parts = title.split(' y ');
    if (parts.length === 2) {
      return [parts[0] + ' y', parts[1]];
    }
  }
  
  if (title.includes(' e ')) {
    const parts = title.split(' e ');
    if (parts.length === 2) {
      return [parts[0] + ' e', parts[1]];
    }
  }
  
  const words = title.split(' ');
  if (words.length <= 2) {
    return [title, ''];
  }
  
  const midPoint = Math.ceil(words.length / 2);
  return [
    words.slice(0, midPoint).join(' '),
    words.slice(midPoint).join(' '),
  ];
}

const TALENT_ORDER = [2, 3, 5, 7, 6, 8, 1, 4];

function drawTalentWheel(
  ctx: CanvasRenderingContext2D,
  scores: Array<{ talentId: number; score: number; max: number }>,
  size: number
) {
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
    return { 
      id: talentId, 
      symbol: config.symbol, 
      color: config.color, 
      fillRadius, 
      fillPercentage, 
      percentage,
      titleLine1: line1,
      titleLine2: line2,
    };
  });

  const polarToCartesian = (angle: number, r: number) => ({
    x: center + r * Math.cos(angle),
    y: center + r * Math.sin(angle),
  });

  // Fondo blanco
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);

  // Dibujar líneas principales (cruz)
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(center, center - radius);
  ctx.lineTo(center, center + radius);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(center - radius, center);
  ctx.lineTo(center + radius, center);
  ctx.stroke();

  // Líneas diagonales
  ctx.strokeStyle = '#666666';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  [1, 3, 5, 7].forEach((index) => {
    const angle = (index * Math.PI * 2) / 8 - Math.PI / 2;
    const outer = polarToCartesian(angle, radius);
    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.lineTo(outer.x, outer.y);
    ctx.stroke();
  });
  ctx.setLineDash([]);

  // Secciones de talentos
  talents.forEach((talent, index) => {
    const anglePerSection = (Math.PI * 2) / 8;
    const startAngle = index * anglePerSection - Math.PI / 2;
    const endAngle = startAngle + anglePerSection;
    const midAngle = (startAngle + endAngle) / 2;

    // Área rellena
    ctx.fillStyle = talent.color;
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.arc(center, center, talent.fillRadius, startAngle, endAngle);
    ctx.arc(center, center, innerRadius, endAngle, startAngle, true);
    ctx.closePath();
    ctx.fill();
    
    ctx.strokeStyle = talent.color;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.globalAlpha = 1.0;

    // Borde exterior completo (transparente)
    ctx.strokeStyle = talent.color;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.arc(center, center, radius, startAngle, endAngle);
    ctx.stroke();
    ctx.globalAlpha = 1.0;

    // Porcentaje dentro de la sección
    if (talent.percentage > 15) {
      const percentPos = polarToCartesian(midAngle, (talent.fillRadius + innerRadius) / 2);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${talent.percentage}%`, percentPos.x, percentPos.y);
    }

    // Etiquetas exteriores
    const labelDistance = radius + 60;
    const labelPos = polarToCartesian(midAngle, labelDistance);

    // Símbolo
    ctx.fillStyle = talent.color;
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(talent.symbol, labelPos.x, labelPos.y - 14);

    // Nombre del talento - Línea 1
    ctx.fillStyle = '#333333';
    ctx.font = '600 8px Arial';
    ctx.fillText(talent.titleLine1, labelPos.x, labelPos.y);

    // Nombre del talento - Línea 2
    if (talent.titleLine2) {
      ctx.fillText(talent.titleLine2, labelPos.x, labelPos.y + 10);
    }
  });

  // Círculo central
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(center, center, innerRadius, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Texto "Talentos"
  ctx.fillStyle = '#666666';
  ctx.font = 'bold 12px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Talentos', center, center);
}

export async function POST(req: NextRequest) {
  try {
    const { scores } = await req.json();

    if (!Array.isArray(scores)) {
      return NextResponse.json({ error: 'scores debe ser un array' }, { status: 400 });
    }

    const size = 400;
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    drawTalentWheel(ctx, scores, size);

    const buffer = canvas.toBuffer('image/png');

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error generando imagen del diagrama:', error);
    return NextResponse.json(
      { error: 'Error generando imagen', details: String(error) },
      { status: 500 }
    );
  }
}

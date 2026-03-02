import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TALENTS } from '@/lib/talents';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

const TALENT_CONFIG = TALENTS.reduce((acc, t) => {
  acc[t.id] = {
    symbol: t.titleSymbolic.match(/\((.+?)\)/)?.[1] || t.code,
    color: getTalentColor(t.id),
    reportTitle: t.reportTitle || t.quizTitle,
  };
  return acc;
}, {} as Record<number, { symbol: string; color: string; reportTitle: string }>);

function getTalentColor(id: number): string {
  const colorMap: Record<number, string> = {
    1: '#DC2626', 2: '#8B5CF6', 3: '#7C3AED', 4: '#EF4444',
    5: '#F59E0B', 6: '#06B6D4', 7: '#10B981', 8: '#D97706',
  };
  return colorMap[id] || '#64748b';
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

function generateSVGDiagram(scores: Array<{ talentId: number; score: number; max: number }>) {
  const size = 800;
  const center = size / 2;
  const radius = 280;
  const innerRadius = 100;

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

  const polarToCartesian = (angle: number, r: number) => ({
    x: center + r * Math.cos(angle),
    y: center + r * Math.sin(angle),
  });

  // SVG sections
  const sections = talents.map((talent, index) => {
    const anglePerSection = (Math.PI * 2) / 8;
    const startAngle = index * anglePerSection - Math.PI / 2;
    const endAngle = startAngle + anglePerSection;
    
    const start = polarToCartesian(startAngle, talent.fillRadius);
    const end = polarToCartesian(endAngle, talent.fillRadius);
    const largeArc = 0;
    
    const d = [
      `M ${center} ${center}`,
      `L ${start.x} ${start.y}`,
      `A ${talent.fillRadius} ${talent.fillRadius} 0 ${largeArc} 1 ${end.x} ${end.y}`,
      'Z'
    ].join(' ');

    return `<path d="${d}" fill="${talent.color}" opacity="0.7"/>`;
  });

  // Outer circles
  const outerCircles = talents.map((talent, index) => {
    const anglePerSection = (Math.PI * 2) / 8;
    const startAngle = index * anglePerSection - Math.PI / 2;
    const endAngle = startAngle + anglePerSection;
    
    const start = polarToCartesian(startAngle, radius);
    const end = polarToCartesian(endAngle, radius);
    const largeArc = 0;
    
    const d = [
      `M ${start.x} ${start.y}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`,
    ].join(' ');

    return `<path d="${d}" fill="none" stroke="${talent.color}" stroke-width="3" opacity="0.3"/>`;
  });

  // Labels
  const labels = talents.map((talent, index) => {
    const anglePerSection = (Math.PI * 2) / 8;
    const midAngle = (index * anglePerSection - Math.PI / 2) + anglePerSection / 2;
    
    const percentDist = (talent.fillRadius + innerRadius) / 2;
    const percentPos = polarToCartesian(midAngle, percentDist);
    
    const labelDist = radius + 120;
    const labelPos = polarToCartesian(midAngle, labelDist);

    return `
      ${talent.percentage > 15 ? `<text x="${percentPos.x}" y="${percentPos.y}" text-anchor="middle" dominant-baseline="middle" font-size="32" font-weight="bold" fill="#333">${talent.percentage}%</text>` : ''}
      <text x="${labelPos.x}" y="${labelPos.y - 30}" text-anchor="middle" font-size="36" font-weight="bold" fill="${talent.color}">${talent.symbol}</text>
      <text x="${labelPos.x}" y="${labelPos.y}" text-anchor="middle" font-size="18" font-weight="bold" fill="#000">${talent.titleLine1}</text>
      ${talent.titleLine2 ? `<text x="${labelPos.x}" y="${labelPos.y + 20}" text-anchor="middle" font-size="18" font-weight="bold" fill="#000">${talent.titleLine2}</text>` : ''}
    `;
  });

  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="white"/>
      ${sections.join('')}
      ${outerCircles.join('')}
      <line x1="${center}" y1="${center - radius}" x2="${center}" y2="${center + radius}" stroke="#000" stroke-width="3"/>
      <line x1="${center - radius}" y1="${center}" x2="${center + radius}" y2="${center}" stroke="#000" stroke-width="3"/>
      ${[1, 3, 5, 7].map((index) => {
        const angle = (index * Math.PI * 2) / 8 - Math.PI / 2;
        const outer = polarToCartesian(angle, radius);
        return `<line x1="${center}" y1="${center}" x2="${outer.x}" y2="${outer.y}" stroke="#666" stroke-width="2" stroke-dasharray="8,8"/>`;
      }).join('')}
      <circle cx="${center}" cy="${center}" r="${innerRadius}" fill="white" stroke="#000" stroke-width="3"/>
      <text x="${center}" y="${center}" text-anchor="middle" dominant-baseline="middle" font-size="28" font-weight="bold" fill="#666">Talentos</text>
      ${labels.join('')}
    </svg>
  `;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const person = await prisma.submission.findUnique({
      where: { id },
      include: { assessments: { orderBy: { createdAt: 'desc' }, take: 1 } },
    });

    if (!person || !person.assessments[0]) {
      return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    }

    const assessment = person.assessments[0];
    const scores: Array<{ talentId: number; score: number; max: number }> = Array.isArray(assessment.scoresJson)
      ? assessment.scoresJson
          .map((x: any) => ({
            talentId: Number(x?.talentId),
            score: Number(x?.score ?? 0),
            max: Number(x?.max ?? 0),
          }))
          .filter((x: any) => Number.isFinite(x.talentId))
      : [];

    const svgString = generateSVGDiagram(scores);
    const resvg = new Resvg(svgString, {
      fitTo: { mode: 'width', value: 800 },
    });
    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();

    return new NextResponse(pngBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error generando diagrama:', error);
    return NextResponse.json({ error: 'Error generando diagrama', details: String(error) }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TALENTS } from '@/lib/talents';

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
    1: '#DC2626', 2: '#8B5CF6', 3: '#7C3AED', 4: '#EF4444',
    5: '#F59E0B', 6: '#06B6D4', 7: '#10B981', 8: '#D97706',
  };
  return colorMap[id] || '#64748b';
}

function getAxisForTalent(id: number): string {
  const axisMap: Record<number, string> = {
    1: 'Acción', 2: 'Conocimiento', 3: 'Conocimiento', 4: 'Acción',
    5: 'Entrega', 6: 'Imaginación', 7: 'Imaginación', 8: 'Desempeño',
  };
  return axisMap[id] || '';
}

const TALENT_ORDER = [2, 3, 5, 7, 6, 8, 1, 4];

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
          .map((x: any) => ({
            talentId: Number(x?.talentId),
            score: Number(x?.score ?? 0),
            max: Number(x?.max ?? 0),
          }))
          .filter((x: any) => Number.isFinite(x.talentId))
      : [];

    const talents = TALENT_ORDER.map((talentId) => {
      const scoreData = scores.find((s) => s.talentId === talentId);
      const config = TALENT_CONFIG[talentId];
      const score = scoreData?.score ?? 0;
      const maxScore = scoreData?.max ?? 15;
      const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
      return {
        id: talentId,
        symbol: config.symbol,
        color: config.color,
        percentage,
        title: config.reportTitle,
        axis: config.axis,
      };
    });

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mapa de Talentos - ${person.nombre} ${person.apellido}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: white;
      padding: 40px;
      color: #0f172a;
    }
    
    .container {
      max-width: 900px;
      margin: 0 auto;
    }
    
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #e5e7eb;
    }
    
    .pill {
      display: inline-block;
      background: #f1f5f9;
      color: #64748b;
      padding: 6px 16px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.5px;
      margin-bottom: 12px;
    }
    
    h1 {
      font-size: 28px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 8px;
    }
    
    .date {
      color: #64748b;
      font-size: 14px;
    }
    
    .diagram {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin: 40px 0;
    }
    
    .talent-card {
      border: 2px solid;
      border-radius: 12px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      background: white;
      min-height: 180px;
    }
    
    .talent-symbol {
      font-size: 48px;
      font-weight: bold;
      margin-bottom: 10px;
    }
    
    .talent-title {
      font-size: 13px;
      text-align: center;
      color: #334155;
      margin-bottom: 8px;
      font-weight: 500;
      min-height: 36px;
      display: flex;
      align-items: center;
    }
    
    .talent-axis {
      font-size: 11px;
      color: #64748b;
      margin-bottom: 12px;
    }
    
    .progress-bar {
      width: 100%;
      height: 12px;
      background: #e5e7eb;
      border-radius: 6px;
      overflow: hidden;
      margin-bottom: 8px;
    }
    
    .progress-fill {
      height: 100%;
      border-radius: 6px;
      transition: width 0.3s ease;
    }
    
    .percentage {
      font-size: 20px;
      font-weight: bold;
    }
    
    .details {
      margin-top: 30px;
    }
    
    .details h2 {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 16px;
      color: #0f172a;
    }
    
    .detail-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      margin-bottom: 8px;
    }
    
    .detail-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .detail-symbol {
      font-size: 24px;
      font-weight: bold;
    }
    
    .detail-info h3 {
      font-size: 13px;
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 2px;
    }
    
    .detail-info p {
      font-size: 11px;
      color: #64748b;
    }
    
    .detail-percentage {
      font-size: 18px;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="pill">MAPA DE TALENTOS</div>
      <h1>${person.nombre} ${person.apellido}</h1>
      <div class="date">${new Date(person.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
    </div>
    
    <div class="diagram">
      ${talents.map(talent => `
        <div class="talent-card" style="border-color: ${talent.color};">
          <div class="talent-symbol" style="color: ${talent.color};">${talent.symbol}</div>
          <div class="talent-title">${talent.title}</div>
          <div class="talent-axis">${talent.axis}</div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${talent.percentage}%; background: ${talent.color};"></div>
          </div>
          <div class="percentage" style="color: ${talent.color};">${talent.percentage}%</div>
        </div>
      `).join('')}
    </div>
    
    <div class="details">
      <h2>Detalle por talento</h2>
      ${talents.map(talent => `
        <div class="detail-card">
          <div class="detail-left">
            <div class="detail-symbol" style="color: ${talent.color};">${talent.symbol}</div>
            <div class="detail-info">
              <h3>${talent.title}</h3>
              <p>${talent.axis}</p>
            </div>
          </div>
          <div class="detail-percentage" style="color: ${talent.color};">${talent.percentage}%</div>
        </div>
      `).join('')}
    </div>
  </div>
</body>
</html>
`;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Error generando HTML del mapa:', error);
    return NextResponse.json(
      { error: 'Error generando HTML', details: String(error) },
      { status: 500 }
    );
  }
}

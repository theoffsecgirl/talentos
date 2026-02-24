import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import puppeteer from 'puppeteer';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const submissionId = parseInt(id);

    if (isNaN(submissionId)) {
      return NextResponse.json(
        { error: 'ID de evaluación inválido' },
        { status: 400 }
      );
    }

    // Obtener evaluación con persona
    const assessment = await prisma.assessment.findUnique({
      where: { id: submissionId },
      include: {
        person: true,
      },
    });

    if (!assessment || !assessment.person) {
      return NextResponse.json(
        { error: 'Evaluación no encontrada' },
        { status: 404 }
      );
    }

    // Obtener todos los talentos
    const talents = await prisma.talent.findMany({
      orderBy: { id: 'asc' },
    });

    const answers: Record<string, number> =
      typeof assessment.answersJson === 'object' && assessment.answersJson
        ? (assessment.answersJson as any)
        : {};

    const scores: Array<{ talentId: number; score: number; max: number }> =
      Array.isArray(assessment.scoresJson)
        ? (assessment.scoresJson as any[]).map((s: any) => ({
            talentId: Number(s.talentId),
            score: Number(s.score ?? 0),
            max: Number(s.max ?? 0),
          }))
        : [];

    // Calcular porcentajes
    const talentPercentages = scores.map((s) => {
      const t = talents.find((x) => x.id === s.talentId);
      const pct = s.max > 0 ? Math.round((s.score / s.max) * 100) : 0;
      return {
        id: s.talentId,
        code: t?.code || `T${s.talentId}`,
        symbol: t?.symbol || '?',
        title: t?.quizTitle || 'Talento',
        color: t?.color || '#64748b',
        percentage: pct,
      };
    });

    // HTML del mapa con nombre
    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mapa de Talentos - ${assessment.person.nombre} ${assessment.person.apellido}</title>
  <style>
    @page {
      size: A4 landscape;
      margin: 0;
    }

    body {
      margin: 0;
      padding: 40px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, rgba(14,165,233,0.05) 0%, rgba(239,68,68,0.03) 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }

    .header {
      text-align: center;
      margin-bottom: 40px;
    }

    .header h1 {
      font-size: 48px;
      font-weight: 700;
      color: #0ea5e9;
      margin: 0 0 12px 0;
    }

    .header h2 {
      font-size: 32px;
      font-weight: 600;
      color: #0f172a;
      margin: 0;
    }

    .map-container {
      width: 600px;
      height: 600px;
      position: relative;
      margin: 0 auto;
    }

    .wheel {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      border: 3px solid #0ea5e9;
      position: relative;
      background: #ffffff;
    }

    .talent-segment {
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      transform-origin: center;
    }

    .talent-label {
      position: absolute;
      font-size: 18px;
      font-weight: 600;
      text-align: center;
    }

    .talent-symbol {
      font-size: 48px;
    }

    .legend {
      margin-top: 40px;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      max-width: 900px;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: #ffffff;
      border-radius: 12px;
      border: 2px solid #e2e8f0;
    }

    .legend-symbol {
      font-size: 32px;
    }

    .legend-text {
      flex: 1;
    }

    .legend-title {
      font-size: 14px;
      font-weight: 600;
      color: #0f172a;
    }

    .legend-code {
      font-size: 11px;
      color: #64748b;
    }

    .legend-score {
      font-size: 18px;
      font-weight: 700;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Mapa de Talentos</h1>
    <h2>${assessment.person.nombre} ${assessment.person.apellido}</h2>
  </div>

  <div class="map-container">
    <div class="wheel">
      ${talentPercentages
        .map((t, i) => {
          const angle = (360 / talentPercentages.length) * i;
          const radius = 220;
          const x = Math.cos((angle - 90) * (Math.PI / 180)) * radius;
          const y = Math.sin((angle - 90) * (Math.PI / 180)) * radius;
          return `
        <div class="talent-segment" style="transform: rotate(${angle}deg);">
          <div class="talent-label" style="transform: rotate(-${angle}deg) translate(${x}px, ${y}px); color: ${t.color};">
            <div class="talent-symbol">${t.symbol}</div>
            <div style="font-size: 14px; margin-top: 4px;">${t.code}</div>
          </div>
        </div>
      `;
        })
        .join('')}
    </div>
  </div>

  <div class="legend">
    ${talentPercentages
      .map(
        (t) => `
      <div class="legend-item">
        <div class="legend-symbol" style="color: ${t.color};">${t.symbol}</div>
        <div class="legend-text">
          <div class="legend-title">${t.title}</div>
          <div class="legend-code">${t.code}</div>
        </div>
        <div class="legend-score" style="color: ${t.color};">${t.percentage}%</div>
      </div>
    `
      )
      .join('')}
  </div>

  <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #94a3b8;">
    encuentra-tu-talento.online
  </div>
</body>
</html>
    `.trim();

    // Generar PDF con Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setContent(html, {
      waitUntil: 'networkidle0',
    });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      landscape: true,
      printBackground: true,
      margin: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
    });

    await browser.close();

    // Devolver PDF
    const fileName = `${assessment.person.nombre}-${assessment.person.apellido}-Mapa-Talentos.pdf`
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9-]/g, '-');

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error('Error generando PDF del mapa:', error);
    return NextResponse.json(
      { error: 'Error al generar el PDF del mapa' },
      { status: 500 }
    );
  }
}

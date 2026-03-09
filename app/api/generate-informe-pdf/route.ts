import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";
import { TALENTS } from "@/lib/talents";

const TALENT_CONFIG: Record<number, { symbol: string; color: string; category: string; axis: string }> = {
  2: { symbol: "Π", color: "#8B5CF6", category: "Conocimiento", axis: "ACCIÓN Y RESULTADOS ---- SABER Y CONOCIMIENTO" },
  3: { symbol: "Ψ", color: "#7C3AED", category: "Conocimiento", axis: "CREATIVIDAD Y VÍNCULO ---- SABER Y CONOCIMIENTO" },
  5: { symbol: "Ω", color: "#F59E0B", category: "Desempeño", axis: "PROFUNDIDAD Y SENSIBILIDAD -- DESEMPEÑO Y PROYECCIÓN" },
  7: { symbol: "Θ", color: "#10B981", category: "Imaginación", axis: "PROFUNDIDAD Y SENSIBILIDAD -- IMAGINACIÓN Y ARTE" },
  4: { symbol: "Α", color: "#EF4444", category: "Acción", axis: "ACCIÓN Y RESULTADOS ---- ACCIÓN Y RESULTADOS" },
  1: { symbol: "Δ", color: "#DC2626", category: "Acción", axis: "CREATIVIDAD Y VÍNCULO ---- ACCIÓN Y RESULTADOS" },
  6: { symbol: "Φ", color: "#06B6D4", category: "Imaginación", axis: "CREATIVIDAD Y VÍNCULO ---- IMAGINACIÓN Y ARTE" },
  8: { symbol: "▭", color: "#D97706", category: "Desempeño", axis: "ACCIÓN Y RESULTADOS ---- DESEMPEÑO Y PROYECCIÓN" },
};

const TALENT_ORDER = [2, 3, 5, 7, 6, 8, 1, 4];

function pct(score: number, max: number) {
  if (!max) return 0;
  return Math.max(0, Math.min(100, Math.round((score / max) * 100)));
}

function buildInformeHtml(data: {
  userName: string;
  date: string;
  scores: Array<{ talentId: number; score: number; max: number }>;
  mapSvg: string;
}) {
  const { userName, date, scores, mapSvg } = data;
  const byId = new Map(scores.map((s) => [s.talentId, s]));

  const talentSections = TALENT_ORDER.map((tid) => {
    const s = byId.get(tid);
    const config = TALENT_CONFIG[tid];
    const t = TALENTS.find((x: any) => x.id === tid);
    const percentage = pct(s?.score ?? 0, s?.max ?? 0);
    
    return `
      <section class="page">
        <div style="margin-bottom: 24px;">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
            <span style="font-size: 48px; color: ${config.color};">${config.symbol}</span>
            <div>
              <h2 style="margin: 0; font-size: 24px; font-weight: 900;">${t?.reportTitle || t?.quizTitle}</h2>
              <div style="font-size: 14px; color: #6b7280; margin-top: 4px;">${config.axis}</div>
            </div>
          </div>
          
          <div style="display: flex; align-items: center; gap: 12px; margin-top: 16px;">
            <div style="font-weight: 700; font-size: 14px;">Puntuación</div>
            <div style="font-size: 32px; font-weight: 900; color: ${config.color};">${s?.score ?? 0}</div>
            <div style="font-size: 18px; color: #6b7280;">/ ${s?.max ?? 15}</div>
          </div>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 16px; font-weight: 800; margin-bottom: 8px;">Resumen neurocognitivo</h3>
          <p style="font-size: 14px; line-height: 1.6; color: #374151; margin-bottom: 12px;">
            ${t?.reportSummary || ''}
          </p>
        </div>

        <div>
          <h3 style="font-size: 16px; font-weight: 800; margin-bottom: 8px;">Ámbitos profesionales</h3>
          <ul style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.6; color: #374151;">
            ${(t?.fields || []).map((field: string) => `<li>${field}</li>`).join('')}
          </ul>
        </div>
      </section>
    `;
  }).join('\n');

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Informe de Talentos - ${userName}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif;
      color: #0b1220;
      background: #ffffff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .page {
      width: 210mm;
      min-height: 297mm;
      padding: 20mm;
      margin: 0 auto;
      page-break-after: always;
      background: white;
    }
    .page:last-child { page-break-after: auto; }
    @media print {
      body { margin: 0; }
      .page { margin: 0; box-shadow: none; }
    }
  </style>
</head>
<body>
  <!-- Portada -->
  <section class="page">
    <div style="text-align: center; padding-top: 60px;">
      <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: #6b7280; margin-bottom: 24px;">
        NEUROCIENCIA APLICADA · DESCUBRE TU FUTURO PROFESIONAL
      </div>
      <h1 style="font-size: 48px; font-weight: 900; margin-bottom: 16px;">TU INFORME DE TALENTOS</h1>
      <div style="font-size: 18px; color: #6b7280; margin-bottom: 40px;">Mapa visual basado en neurociencia aplicada</div>
      
      <div style="margin-top: 60px;">
        <div style="font-size: 24px; font-weight: 800; margin-bottom: 8px;">${userName}</div>
        <div style="font-size: 14px; color: #6b7280;">${date}</div>
      </div>

      <div style="margin-top: 60px; display: flex; justify-content: center;">
        ${mapSvg}
      </div>
    </div>
  </section>

  ${talentSections}
</body>
</html>
  `.trim();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userName, date, scores, mapSvg } = body;

    if (!userName || !scores || !mapSvg) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const html = buildInformeHtml({ userName, date: date || new Date().toLocaleDateString('es-ES'), scores, mapSvg });

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });

    await browser.close();

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${userName}-Informe-Talentos.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}

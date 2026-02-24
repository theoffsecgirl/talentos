import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import puppeteer from "puppeteer";

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

function generateTalentWheelSVG(scores: Array<{ talentId: number; score: number; max: number }>): string {
  const size = 600;
  const center = size / 2;
  const radius = 240;
  const innerRadius = 60;

  const talents = TALENT_ORDER.map((talentId) => {
    const scoreData = scores.find((s) => s.talentId === talentId);
    const config = TALENT_CONFIG[talentId];
    const score = scoreData?.score ?? 0;
    const maxScore = scoreData?.max ?? 15;
    const fillPercentage = maxScore > 0 ? score / maxScore : 0;
    const fillRadius = innerRadius + (radius - innerRadius) * fillPercentage;

    return { id: talentId, code: `T${talentId}`, symbol: config.symbol, score, maxScore, color: config.color, fillRadius, fillPercentage };
  });

  const sections = talents.map((talent, index) => {
    const anglePerSection = (Math.PI * 2) / 8;
    const startAngle = index * anglePerSection - Math.PI / 2;
    const endAngle = startAngle + anglePerSection;
    return { talent, startAngle, endAngle };
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

    return [
      `M ${start.x} ${start.y}`,
      `A ${outerR} ${outerR} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`,
      `L ${innerEnd.x} ${innerEnd.y}`,
      `A ${innerR} ${innerR} 0 ${largeArcFlag} 0 ${innerStart.x} ${innerStart.y}`,
      `Z`,
    ].join(" ");
  };

  const gradients = sections
    .map(
      ({ talent }) => `
    <radialGradient id="gradient-${talent.id}" cx="50%" cy="50%">
      <stop offset="0%" stop-color="${talent.color}" stop-opacity="${Math.min(talent.fillPercentage * 1.2, 1)}" />
      <stop offset="${talent.fillPercentage * 100}%" stop-color="${talent.color}" stop-opacity="0.6" />
      <stop offset="100%" stop-color="${talent.color}" stop-opacity="0.1" />
    </radialGradient>`
    )
    .join("\n");

  const paths = sections
    .map(
      ({ talent, startAngle, endAngle }) => `
    <path
      d="${createArcPath(startAngle, endAngle, talent.fillRadius, innerRadius)}"
      fill="url(#gradient-${talent.id})"
      stroke="${talent.color}"
      stroke-width="1"
    />
    <path
      d="${createArcPath(startAngle, endAngle, radius, talent.fillRadius > innerRadius ? talent.fillRadius : innerRadius)}"
      fill="none"
      stroke="${talent.color}"
      stroke-width="2"
      opacity="0.3"
    />`
    )
    .join("\n");

  const labels = sections
    .map(({ talent, startAngle, endAngle }) => {
      const midAngle = (startAngle + endAngle) / 2;
      const labelPos = polarToCartesian(midAngle, radius + 30);
      return `
      <text x="${labelPos.x}" y="${labelPos.y}" text-anchor="middle" dominant-baseline="middle" font-size="18" font-weight="bold" fill="${talent.color}">
        ${talent.symbol}
      </text>
      <text x="${labelPos.x}" y="${labelPos.y + 16}" text-anchor="middle" dominant-baseline="middle" font-size="12" fill="#666">
        ${talent.code}
      </text>`;
    })
    .join("\n");

  return `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>${gradients}</defs>
  <line x1="${center}" y1="${center - radius}" x2="${center}" y2="${center + radius}" stroke="#000" stroke-width="2" />
  <line x1="${center - radius}" y1="${center}" x2="${center + radius}" y2="${center}" stroke="#000" stroke-width="2" />
  ${[1, 3, 5, 7]
    .map((index) => {
      const angle = (index * Math.PI * 2) / 8 - Math.PI / 2;
      const outer = polarToCartesian(angle, radius);
      return `<line x1="${center}" y1="${center}" x2="${outer.x}" y2="${outer.y}" stroke="#666" stroke-width="1" stroke-dasharray="4 4" />`;
    })
    .join("\n")}
  ${paths}
  ${labels}
  <circle cx="${center}" cy="${center}" r="${innerRadius}" fill="white" stroke="#000" stroke-width="2" />
</svg>`;
}

function buildMapHTML(nombre: string, apellido: string, fecha: string, mapSvg: string): string {
  const css = `
    :root{--bg:#ffffff;--fg:#0f172a;--muted:#64748b;--border:#e5e7eb;}
    *{box-sizing:border-box} 
    body{margin:0;padding:40px;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial; color:var(--fg); background:var(--bg);display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh}
    .container{max-width:700px;width:100%;text-align:center}
    .pill{display:inline-flex;align-items:center;border:1px solid var(--border);border-radius:999px;padding:8px 14px;font-size:13px;color:var(--muted);margin-bottom:16px}
    h1{font-size:32px;margin:0 0 6px;font-weight:900;letter-spacing:-0.02em;color:var(--fg)}
    .muted{color:var(--muted);font-size:14px;margin-bottom:32px}
    .map-wrapper{display:flex;justify-content:center;margin-bottom:24px}
  `;

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${nombre} ${apellido} - Mapa de Talentos</title>
  <style>${css}</style>
</head>
<body>
  <div class="container">
    <div class="pill">MAPA DE TALENTOS</div>
    <h1>${nombre} ${apellido}</h1>
    <div class="muted">${fecha}</div>
    <div class="map-wrapper">
      ${mapSvg}
    </div>
  </div>
</body>
</html>`;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // FIX: StudentSubmission en PascalCase
    const person = await prisma.StudentSubmission.findUnique({
      where: { id },
      include: {
        assessments: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!person || !person.assessments[0]) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }

    const assessment = person.assessments[0];

    const scores: Array<{ talentId: number; score: number; max: number }> = Array.isArray(assessment.scoresJson)
      ? assessment.scoresJson
          .map((x: any) => ({ talentId: Number(x?.talentId), score: Number(x?.score ?? 0), max: Number(x?.max ?? 0) }))
          .filter((x: any) => Number.isFinite(x.talentId))
      : [];

    const mapSvg = generateTalentWheelSVG(scores);
    const html = buildMapHTML(person.nombre, person.apellido, new Date(person.createdAt).toLocaleDateString("es-ES"), mapSvg);

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20mm", right: "20mm", bottom: "20mm", left: "20mm" },
    });

    await browser.close();

    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${person.nombre}-${person.apellido}-Mapa-Talentos.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generando mapa PDF:", error);
    return NextResponse.json({ error: "Error generando mapa PDF" }, { status: 500 });
  }
}

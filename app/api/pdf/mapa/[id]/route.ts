import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import puppeteer from "puppeteer";

const prisma = new PrismaClient();

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

function toISODate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function generateWheelSVG(scores: Array<{ talentId: number; score: number; max: number }>) {
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

    return {
      id: talentId,
      code: `T${talentId}`,
      symbol: config.symbol,
      score,
      maxScore,
      color: config.color,
      fillRadius,
      fillPercentage,
    };
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

  const defs = sections
    .map(
      ({ talent }) => `
      <radialGradient id="gradient-${talent.id}" cx="50%" cy="50%">
        <stop offset="0%" stop-color="${talent.color}" stop-opacity="${Math.min(talent.fillPercentage * 1.2, 1)}" />
        <stop offset="${talent.fillPercentage * 100}%" stop-color="${talent.color}" stop-opacity="0.6" />
        <stop offset="100%" stop-color="${talent.color}" stop-opacity="0.1" />
      </radialGradient>`
    )
    .join("");

  const paths = sections
    .map(
      ({ talent, startAngle, endAngle }) => {
        const midAngle = (startAngle + endAngle) / 2;
        const labelPos = polarToCartesian(midAngle, radius + 30);

        return `
        <g>
          <path d="${createArcPath(startAngle, endAngle, talent.fillRadius, innerRadius)}" fill="url(#gradient-${talent.id})" stroke="${talent.color}" stroke-width="1" />
          <path d="${createArcPath(startAngle, endAngle, radius, talent.fillRadius > innerRadius ? talent.fillRadius : innerRadius)}" fill="none" stroke="${talent.color}" stroke-width="2" opacity="0.3" />
          <text x="${labelPos.x}" y="${labelPos.y}" text-anchor="middle" dominant-baseline="middle" font-size="18" font-weight="bold" fill="${talent.color}">${talent.symbol}</text>
          <text x="${labelPos.x}" y="${labelPos.y + 16}" text-anchor="middle" dominant-baseline="middle" font-size="12" fill="#666">${talent.code}</text>
        </g>`;
      }
    )
    .join("");

  const dividers = [1, 3, 5, 7]
    .map((index) => {
      const angle = (index * Math.PI * 2) / 8 - Math.PI / 2;
      const outer = polarToCartesian(angle, radius);
      return `<line x1="${center}" y1="${center}" x2="${outer.x}" y2="${outer.y}" stroke="#666" stroke-width="1" stroke-dasharray="4 4" />`;
    })
    .join("");

  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <defs>${defs}</defs>
      <line x1="${center}" y1="${center - radius}" x2="${center}" y2="${center + radius}" stroke="#000" stroke-width="2" />
      <line x1="${center - radius}" y1="${center}" x2="${center + radius}" y2="${center}" stroke="#000" stroke-width="2" />
      ${dividers}
      ${paths}
      <circle cx="${center}" cy="${center}" r="${innerRadius}" fill="white" stroke="#000" stroke-width="2" />
    </svg>`;
}

function buildMapHTML(person: any, scores: Array<{ talentId: number; score: number; max: number }>) {
  const mapSVG = generateWheelSVG(scores);

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Mapa de Talentos - ${person.nombre} ${person.apellido}</title>
  <style>
    :root{--bg:#ffffff;--fg:#0b1220;--muted:#6b7280;--border:#e5e7eb}
    *{box-sizing:border-box}
    body{margin:0;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial;color:var(--fg);background:var(--bg);padding:40px;text-align:center}
    .pill{display:inline-flex;align-items:center;border:1px solid var(--border);border-radius:999px;padding:6px 10px;font-size:12px;color:var(--muted);margin-bottom:20px}
    .h1{font-size:34px;line-height:1.05;margin:20px 0 10px;font-weight:900;letter-spacing:-0.02em}
    .muted{color:var(--muted);font-size:14px;margin-bottom:30px}
    .map-container{display:flex;justify-content:center;margin-top:30px}
  </style>
</head>
<body>
  <div class="pill">NEUROCIENCIA APLICADA · MAPA DE TALENTOS</div>
  <h1 class="h1">${person.nombre} ${person.apellido}</h1>
  <div class="muted">${toISODate(new Date(person.createdAt))}</div>
  <div class="map-container">
    ${mapSVG}
  </div>
</body>
</html>`;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const person = await prisma.person.findUnique({
      where: { id },
      include: {
        assessments: true,
      },
    });

    if (!person || !person.assessments[0]) {
      return NextResponse.json({ error: "Person or assessment not found" }, { status: 404 });
    }

    const scores = Array.isArray(person.assessments[0]?.scoresJson)
      ? person.assessments[0].scoresJson.map((s: any) => ({
          talentId: Number(s.talentId),
          score: Number(s.score ?? 0),
          max: Number(s.max ?? 0),
        }))
      : [];

    const html = buildMapHTML(person, scores);

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    await page.setViewport({ width: 800, height: 900 });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20mm", right: "20mm", bottom: "20mm", left: "20mm" },
    });

    await browser.close();

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Mapa-${person.nombre}-${person.apellido}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating map PDF:", error);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}

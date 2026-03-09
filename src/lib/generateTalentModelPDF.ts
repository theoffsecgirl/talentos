import { TALENTS } from "@/lib/talents";

type Html2PdfInstance = {
  set(options: Record<string, unknown>): Html2PdfInstance;
  from(element: HTMLElement): Html2PdfInstance;
  save(): Promise<void>;
};

type Html2PdfFn = () => Html2PdfInstance;

export type RankedTalent = {
  id: number;
  code: string;
  quizTitle: string;
  titleSymbolic: string;
  titleGenotype: string;
  reportTitle?: string;
  reportSummary?: string;
  exampleRoles: string[];
  score: number;
  max: number;
};

const GENOTIPO_SYMBOLS: Record<number, string> = {
  1: "△",
  2: "⬠",
  3: "∞",
  4: "◇",
  5: "○",
  6: "⬭",
  7: "□",
  8: "▭",
};

const NEUROTALENTO_SYMBOLS: Record<number, string> = {
  1: "Σ",
  2: "Π",
  3: "Ψ",
  4: "α",
  5: "Ω",
  6: "Φ",
  7: "Θ",
  8: "Μ",
};

const TALENT_COLORS: Record<number, string> = {
  1: "#DC2626",
  2: "#8B5CF6",
  3: "#7C3AED",
  4: "#EF4444",
  5: "#F59E0B",
  6: "#06B6D4",
  7: "#10B981",
  8: "#D97706",
};

const TALENT_ORDER = [2, 3, 5, 7, 6, 8, 1, 4];

const AXIS_GROUPS = [
  { name: "ACCIÓN Y RESULTADOS", talents: [4, 1] },
  { name: "SABER Y CONOCIMIENTO", talents: [2, 3] },
  { name: "IMAGINACIÓN Y ARTE", talents: [6, 7] },
  { name: "DESTREZA Y PROYECCIÓN", talents: [8, 5] },
];

// Axis label positions (at cardinal directions between sectors)
const AXIS_LABELS: Array<{ name: string; x: number; y: number; rotate: number }> = [
  { name: "SABER Y CONOCIMIENTO",  x: 350, y: 28,  rotate: 0   },
  { name: "IMAGINACIÓN Y ARTE",    x: 672, y: 350, rotate: 90  },
  { name: "DESTREZA Y PROYECCIÓN", x: 350, y: 672, rotate: 0   },
  { name: "ACCIÓN Y RESULTADOS",   x: 28,  y: 350, rotate: -90 },
];

function toSafeNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && !isNaN(value)) return value;
  return fallback;
}

function polarToCartesian(cx: number, cy: number, angle: number, r: number) {
  return {
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle),
  };
}

function createArcPath(
  cx: number, cy: number,
  startAngle: number, endAngle: number,
  outerR: number, innerR: number
): string {
  const start = polarToCartesian(cx, cy, startAngle, outerR);
  const end   = polarToCartesian(cx, cy, endAngle,   outerR);
  const innerStart = polarToCartesian(cx, cy, startAngle, innerR);
  const innerEnd   = polarToCartesian(cx, cy, endAngle,   innerR);
  const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;
  return [
    `M ${start.x} ${start.y}`,
    `A ${outerR} ${outerR} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerR} ${innerR} 0 ${largeArcFlag} 0 ${innerStart.x} ${innerStart.y}`,
    `Z`,
  ].join(" ");
}

function generateWheelSVG(
  ranked: RankedTalent[],
  modelType: "genotipo" | "neurotalento"
): string {
  const size        = 700;
  const center      = size / 2;
  const radius      = 230;
  const innerRadius = 75;
  const symbolMap   = modelType === "genotipo" ? GENOTIPO_SYMBOLS : NEUROTALENTO_SYMBOLS;

  const sections = TALENT_ORDER.map((talentId, index) => {
    const rd          = ranked.find(r => r.id === talentId);
    const color       = TALENT_COLORS[talentId] ?? "#999";
    const score       = toSafeNumber(rd?.score, 0);
    const max         = toSafeNumber(rd?.max, 15);
    const percentage  = max > 0 ? Math.round((score / max) * 100) : 0;
    const fillPct     = percentage / 100;
    const fillRadius  = innerRadius + (radius - innerRadius) * fillPct;
    const anglePerSec = (Math.PI * 2) / 8;
    const startAngle  = index * anglePerSec - Math.PI / 2;
    const endAngle    = startAngle + anglePerSec;
    const midAngle    = (startAngle + endAngle) / 2;
    const labelDist   = radius + 95;
    const labelPos    = polarToCartesian(center, center, midAngle, labelDist);
    const percentPos  = polarToCartesian(center, center, midAngle, (fillRadius + innerRadius) / 2);

    const talent    = TALENTS.find(t => t.id === talentId);
    const fullTitle = talent?.reportTitle ?? "";
    const symbol    = symbolMap[talentId] ?? "?";

    // Split title for two lines
    let line1 = fullTitle;
    let line2 = "";
    if (fullTitle.includes(" y ")) {
      const parts = fullTitle.split(" y ");
      if (parts.length === 2) { line1 = parts[0] + " y"; line2 = parts[1]; }
    } else if (fullTitle.includes(" e ")) {
      const parts = fullTitle.split(" e ");
      if (parts.length === 2) { line1 = parts[0] + " e"; line2 = parts[1]; }
    } else {
      const words    = fullTitle.split(" ");
      const midPoint = Math.ceil(words.length / 2);
      line1 = words.slice(0, midPoint).join(" ");
      line2 = words.slice(midPoint).join(" ");
    }

    return { talentId, color, percentage, fillRadius, fillPct, startAngle, endAngle, midAngle, labelPos, percentPos, symbol, line1, line2 };
  });

  // Gradient defs
  const defs = sections.map(s => `
    <radialGradient id="pdf-g-${s.talentId}" cx="50%" cy="50%">
      <stop offset="0%" stop-color="${s.color}" stop-opacity="${Math.min(s.fillPct * 1.2, 1)}"/>
      <stop offset="${s.fillPct * 100}%" stop-color="${s.color}" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="${s.color}" stop-opacity="0.1"/>
    </radialGradient>`).join("");

  // Diagonal dividers
  const diagonals = [1, 3, 5, 7].map(idx => {
    const angle = (idx * Math.PI * 2) / 8 - Math.PI / 2;
    const outer = polarToCartesian(center, center, angle, radius);
    return `<line x1="${center}" y1="${center}" x2="${outer.x.toFixed(2)}" y2="${outer.y.toFixed(2)}" stroke="#666" stroke-width="1" stroke-dasharray="4 4"/>`;
  }).join("");

  // Sector paths and labels
  const sectorSVG = sections.map(s => {
    const fillPath  = createArcPath(center, center, s.startAngle, s.endAngle, s.fillRadius, innerRadius);
    const outerPath = createArcPath(center, center, s.startAngle, s.endAngle, radius, innerRadius);
    const pctText   = s.percentage > 15
      ? `<text x="${s.percentPos.x.toFixed(2)}" y="${s.percentPos.y.toFixed(2)}" text-anchor="middle" dominant-baseline="middle" font-size="16" font-weight="bold" fill="white">${s.percentage}%</text>`
      : "";
    return `
      <path d="${fillPath}"  fill="url(#pdf-g-${s.talentId})" stroke="${s.color}" stroke-width="1"/>
      <path d="${outerPath}" fill="none" stroke="${s.color}" stroke-width="2" opacity="0.3"/>
      ${pctText}
      <text x="${s.labelPos.x.toFixed(2)}" y="${(s.labelPos.y - 18).toFixed(2)}" text-anchor="middle" dominant-baseline="middle" font-size="22" font-weight="bold" fill="${s.color}">${s.symbol}</text>
      <text x="${s.labelPos.x.toFixed(2)}" y="${(s.labelPos.y + 4).toFixed(2)}" text-anchor="middle" dominant-baseline="middle" font-size="9.5" font-weight="600" fill="#333">${s.line1}</text>
      ${s.line2 ? `<text x="${s.labelPos.x.toFixed(2)}" y="${(s.labelPos.y + 16).toFixed(2)}" text-anchor="middle" dominant-baseline="middle" font-size="9.5" font-weight="600" fill="#333">${s.line2}</text>` : ""}
    `;
  }).join("");

  // Axis labels
  const axisLabelsSVG = AXIS_LABELS.map(al => {
    const transform = al.rotate !== 0
      ? `transform="rotate(${al.rotate}, ${al.x}, ${al.y})"`
      : "";
    return `<text x="${al.x}" y="${al.y}" text-anchor="middle" dominant-baseline="middle" font-size="8" font-weight="700" fill="#444" letter-spacing="0.5" ${transform}>${al.name}</text>`;
  }).join("");

  // Center text — always rendered as two lines "NEURO" / "TALENTOS"
  const centerLineFontSize = "9";

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>${defs}</defs>
  <line x1="${center}" y1="${center - radius}" x2="${center}" y2="${center + radius}" stroke="#000" stroke-width="2"/>
  <line x1="${center - radius}" y1="${center}" x2="${center + radius}" y2="${center}" stroke="#000" stroke-width="2"/>
  ${diagonals}
  ${sectorSVG}
  <circle cx="${center}" cy="${center}" r="${innerRadius}" fill="white" stroke="#000" stroke-width="2"/>
  <text x="${center}" y="${center - 6}" text-anchor="middle" dominant-baseline="middle" font-size="${centerLineFontSize}" font-weight="700" fill="#444">NEURO</text>
  <text x="${center}" y="${center + 8}" text-anchor="middle" dominant-baseline="middle" font-size="${centerLineFontSize}" font-weight="700" fill="#444">TALENTOS</text>
  ${axisLabelsSVG}
</svg>`;
}

function generateBatteryBar(percentage: number): string {
  const color  = percentage >= 67 ? "#CC0000" : "#111111";
  const pct    = Math.min(Math.max(percentage, 0), 100);
  return `<div style="width:100%;height:10px;background:#e0e0e0;border-radius:3px;overflow:hidden;border:1px solid #ccc;">
    <div style="width:${pct}%;height:100%;background:${color};border-radius:3px;"></div>
  </div>`;
}

function generatePDFHTML(
  ranked: RankedTalent[],
  modelType: "genotipo" | "neurotalento",
  userName: string
): string {
  const symbolMap  = modelType === "genotipo" ? GENOTIPO_SYMBOLS : NEUROTALENTO_SYMBOLS;
  const modelLabel = modelType === "genotipo" ? "Modelo Genotipo" : "Modelo Neurotalento";
  const winner     = ranked[0];
  const winnerFull = TALENTS.find(t => t.id === winner?.id);

  const svgContent = generateWheelSVG(ranked, modelType);

  // Right panel top: winner profile
  const competencies = winnerFull?.competencies ?? [];
  const topRole      = winnerFull?.exampleRoles?.[0] ?? "";
  const profileTitle = winner?.reportTitle ?? winner?.quizTitle ?? "—";

  const bulletItems = competencies.map(c => `
    <div style="display:flex;align-items:flex-start;gap:6px;margin-bottom:5px;">
      <span style="color:#CC0000;font-weight:bold;flex-shrink:0;">•</span>
      <span style="font-size:11px;color:#333;">${c}</span>
    </div>`).join("");

  const profileSection = `
    <div style="background:#f9f9f9;border:1px solid #ddd;border-radius:8px;padding:14px;margin-bottom:14px;">
      <div style="font-size:9px;font-weight:700;color:#888;letter-spacing:1px;margin-bottom:6px;">PERFIL PROFESIONAL</div>
      <div style="font-size:14px;font-weight:700;color:#111;margin-bottom:10px;text-transform:uppercase;">${profileTitle}</div>
      ${bulletItems}
      ${topRole ? `<div style="margin-top:10px;border:2px solid #CC0000;border-radius:6px;padding:8px;background:#fff3f3;">
        <div style="font-size:9px;font-weight:700;color:#CC0000;letter-spacing:0.5px;margin-bottom:3px;">ROL SUGERIDO</div>
        <div style="font-size:11px;color:#333;">${topRole}</div>
      </div>` : ""}
    </div>`;

  // Right panel bottom: talent list by axis
  const talentListRows = AXIS_GROUPS.map(group => {
    const rows = group.talents.map(talentId => {
      const rd  = ranked.find(r => r.id === talentId);
      const pct = rd && rd.max > 0 ? Math.round((rd.score / rd.max) * 100) : 0;
      const sym = symbolMap[talentId] ?? "?";
      const nam = rd?.reportTitle ?? "";
      const bar = generateBatteryBar(pct);
      return `<div style="display:flex;align-items:center;gap:6px;margin-bottom:5px;">
        <div style="font-size:13px;font-weight:700;color:${TALENT_COLORS[talentId] ?? '#666'};width:18px;text-align:center;flex-shrink:0;">${sym}</div>
        <div style="font-size:10px;font-weight:600;color:#333;width:110px;flex-shrink:0;">${pct} - ${nam}</div>
        <div style="flex:1;">${bar}</div>
      </div>`;
    }).join("");
    return `<div style="margin-bottom:10px;">
      <div style="font-size:9px;font-weight:700;color:#555;letter-spacing:0.5px;border-bottom:1px solid #ddd;padding-bottom:3px;margin-bottom:5px;">${group.name}</div>
      ${rows}
    </div>`;
  }).join("");

  const talentListSection = `
    <div style="background:#f9f9f9;border:1px solid #ddd;border-radius:8px;padding:14px;">
      <div style="font-size:9px;font-weight:700;color:#888;letter-spacing:1px;margin-bottom:8px;">TALENTOS POR EJE</div>
      ${talentListRows}
    </div>`;

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, Helvetica, sans-serif; background: #fff; color: #111; }
  </style>
</head>
<body>
  <div style="width:794px;padding:20px;">
    <!-- Header -->
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;border-bottom:2px solid #111;padding-bottom:8px;">
      <div>
        <div style="font-size:18px;font-weight:700;color:#111;">MAPA DE NEUROTALENTOS</div>
        <div style="font-size:11px;color:#555;">${userName ? userName + " — " : ""}${modelLabel}</div>
      </div>
      <div style="font-size:10px;color:#888;">Basado en neurociencia aplicada</div>
    </div>
    <!-- Main layout -->
    <div style="display:flex;gap:16px;">
      <!-- Left: wheel -->
      <div style="width:390px;flex-shrink:0;">
        ${svgContent}
      </div>
      <!-- Right: profile + list -->
      <div style="flex:1;display:flex;flex-direction:column;gap:10px;">
        ${profileSection}
        ${talentListSection}
      </div>
    </div>
  </div>
</body>
</html>`;
}

export function exportTalentModelPDF(
  ranked: RankedTalent[],
  modelType: "genotipo" | "neurotalento",
  userName: string
): void {
  if (typeof window === "undefined") return;

  const html2pdf = (window as unknown as { html2pdf?: Html2PdfFn }).html2pdf;
  if (!html2pdf) {
    window.print();
    return;
  }

  const htmlContent = generatePDFHTML(ranked, modelType, userName);

  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.top = "-9999px";
  container.style.left = "-9999px";
  container.style.width = "794px";
  document.body.appendChild(container);

  const iframe = document.createElement("iframe");
  iframe.style.width = "794px";
  iframe.style.height = "600px";
  iframe.style.border = "none";
  container.appendChild(iframe);

  const fileName = `${userName ? userName.toLowerCase().replace(/\s+/g, "-") + "-" : ""}neurotalentos-${modelType}.pdf`;

  iframe.onload = () => {
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) { document.body.removeChild(container); return; }

    iframeDoc.open();
    iframeDoc.write(htmlContent);
    iframeDoc.close();

    const target = iframeDoc.body.firstElementChild as HTMLElement ?? iframeDoc.body;

    html2pdf()
      .set({
        margin: 0,
        filename: fileName,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, allowTaint: true },
        jsPDF: { unit: "px", format: [794, 600], orientation: "landscape" },
      })
      .from(target)
      .save()
      .then(() => {
        document.body.removeChild(container);
      })
      .catch(() => {
        document.body.removeChild(container);
      });
  };
}

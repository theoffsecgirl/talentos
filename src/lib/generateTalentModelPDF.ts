import { TALENTS } from "@/lib/talents";
import type JSZip from "jszip";

type Html2PdfInstance = {
  set(options: Record<string, unknown>): Html2PdfInstance;
  from(element: HTMLElement): Html2PdfInstance;
  save(): Promise<void>;
  output(type: string): Promise<Blob>;
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
  { name: "SABER Y CONOCIMIENTO",  x: 280, y: 22,  rotate: 0   },
  { name: "IMAGINACIÓN Y ARTE",    x: 538, y: 280, rotate: 90  },
  { name: "DESTREZA Y PROYECCIÓN", x: 280, y: 538, rotate: 0   },
  { name: "ACCIÓN Y RESULTADOS",   x: 22,  y: 280, rotate: -90 },
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
  const size        = 560;
  const center      = size / 2;
  const radius      = 184;
  const innerRadius = 60;
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
    const labelDist   = radius + 76;
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
      ? `<text x="${s.percentPos.x.toFixed(2)}" y="${s.percentPos.y.toFixed(2)}" text-anchor="middle" dominant-baseline="middle" font-size="13" font-weight="bold" fill="white">${s.percentage}%</text>`
      : "";
    return `
      <path d="${fillPath}"  fill="url(#pdf-g-${s.talentId})" stroke="${s.color}" stroke-width="1"/>
      <path d="${outerPath}" fill="none" stroke="${s.color}" stroke-width="2" opacity="0.3"/>
      ${pctText}
      <text x="${s.labelPos.x.toFixed(2)}" y="${(s.labelPos.y - 14).toFixed(2)}" text-anchor="middle" dominant-baseline="middle" font-size="18" font-weight="bold" fill="${s.color}">${s.symbol}</text>
      <text x="${s.labelPos.x.toFixed(2)}" y="${(s.labelPos.y + 3).toFixed(2)}" text-anchor="middle" dominant-baseline="middle" font-size="7.5" font-weight="600" fill="#333">${s.line1}</text>
      ${s.line2 ? `<text x="${s.labelPos.x.toFixed(2)}" y="${(s.labelPos.y + 13).toFixed(2)}" text-anchor="middle" dominant-baseline="middle" font-size="7.5" font-weight="600" fill="#333">${s.line2}</text>` : ""}
    `;
  }).join("");

  // Axis labels
  const axisLabelsSVG = AXIS_LABELS.map(al => {
    const transform = al.rotate !== 0
      ? `transform="rotate(${al.rotate}, ${al.x}, ${al.y})"`
      : "";
    return `<text x="${al.x}" y="${al.y}" text-anchor="middle" dominant-baseline="middle" font-size="6.5" font-weight="700" fill="#444" letter-spacing="0.5" ${transform}>${al.name}</text>`;
  }).join("");

  // Center text based on model type
  const centerLineFontSize = "8";
  const centerLine1 = modelType === "genotipo" ? "GENO" : "NEURO";
  const centerLine2 = modelType === "genotipo" ? "TIPOS" : "TALENTOS";

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>${defs}</defs>
  <line x1="${center}" y1="${center - radius}" x2="${center}" y2="${center + radius}" stroke="#000" stroke-width="2"/>
  <line x1="${center - radius}" y1="${center}" x2="${center + radius}" y2="${center}" stroke="#000" stroke-width="2"/>
  ${diagonals}
  ${sectorSVG}
  <circle cx="${center}" cy="${center}" r="${innerRadius}" fill="white" stroke="#000" stroke-width="2"/>
  <text x="${center}" y="${center - 5}" text-anchor="middle" dominant-baseline="middle" font-size="${centerLineFontSize}" font-weight="700" fill="#444">${centerLine1}</text>
  <text x="${center}" y="${center + 6}" text-anchor="middle" dominant-baseline="middle" font-size="${centerLineFontSize}" font-weight="700" fill="#444">${centerLine2}</text>
  ${axisLabelsSVG}
</svg>`;
}

function generateBatteryBar(percentage: number): string {
  const color  = percentage >= 67 ? "#CC0000" : "#111111";
  const pct    = Math.min(Math.max(percentage, 0), 100);
  return `<div style="width:100%;height:8px;background:#e0e0e0;border-radius:2px;overflow:hidden;border:1px solid #ccc;">
    <div style="width:${pct}%;height:100%;background:${color};border-radius:2px;"></div>
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
    <div style="display:flex;align-items:flex-start;gap:5px;margin-bottom:4px;">
      <span style="color:#CC0000;font-weight:bold;flex-shrink:0;font-size:9px;">•</span>
      <span style="font-size:9px;color:#333;line-height:1.3;">${c}</span>
    </div>`).join("");

  const profileSection = `
    <div style="background:#f9f9f9;border:1px solid #ddd;border-radius:6px;padding:12px;margin-bottom:12px;">
      <div style="font-size:7px;font-weight:700;color:#888;letter-spacing:1px;margin-bottom:5px;">PERFIL PROFESIONAL</div>
      <div style="font-size:12px;font-weight:700;color:#111;margin-bottom:8px;text-transform:uppercase;">${profileTitle}</div>
      ${bulletItems}
      ${topRole ? `<div style="margin-top:8px;border:2px solid #CC0000;border-radius:5px;padding:6px;background:#fff3f3;">
        <div style="font-size:7px;font-weight:700;color:#CC0000;letter-spacing:0.5px;margin-bottom:2px;">ROL SUGERIDO</div>
        <div style="font-size:9px;color:#333;">${topRole}</div>
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
      return `<div style="display:flex;align-items:center;gap:5px;margin-bottom:4px;">
        <div style="font-size:11px;font-weight:700;color:${TALENT_COLORS[talentId] ?? '#666'};width:15px;text-align:center;flex-shrink:0;">${sym}</div>
        <div style="font-size:8px;font-weight:600;color:#333;width:90px;flex-shrink:0;">${pct} - ${nam}</div>
        <div style="flex:1;">${bar}</div>
      </div>`;
    }).join("");
    return `<div style="margin-bottom:8px;">
      <div style="font-size:7px;font-weight:700;color:#555;letter-spacing:0.5px;border-bottom:1px solid #ddd;padding-bottom:2px;margin-bottom:4px;">${group.name}</div>
      ${rows}
    </div>`;
  }).join("");

  const talentListSection = `
    <div style="background:#f9f9f9;border:1px solid #ddd;border-radius:6px;padding:12px;">
      <div style="font-size:7px;font-weight:700;color:#888;letter-spacing:1px;margin-bottom:6px;">TALENTOS POR EJE</div>
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
  <div style="width:1000px;padding:25px;">
    <!-- Header -->
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;border-bottom:2px solid #111;padding-bottom:8px;">
      <div>
        <div style="font-size:16px;font-weight:700;color:#111;">MAPA DE ${modelType === "genotipo" ? "GENOTIPOS" : "NEUROTALENTOS"}</div>
        <div style="font-size:10px;color:#555;">${userName ? userName + " — " : ""}${modelLabel}</div>
      </div>
      <div style="font-size:9px;color:#888;">Basado en neurociencia aplicada</div>
    </div>
    <!-- Main layout -->
    <div style="display:flex;gap:24px;align-items:flex-start;">
      <!-- Left: wheel -->
      <div style="flex-shrink:0;">
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
  userName: string,
  zip?: JSZip
): Promise<void> {
  console.log('🎯 exportTalentModelPDF called', { modelType, userName, hasZip: !!zip });
  
  return new Promise((resolve) => {
    if (typeof window === "undefined") { 
      console.log('❌ Not in browser');
      resolve(); 
      return; 
    }

    const html2pdf = (window as unknown as { html2pdf?: Html2PdfFn }).html2pdf;
    if (!html2pdf) {
      console.log('❌ html2pdf not found');
      if (!zip) window.print();
      resolve();
      return;
    }

    console.log('✅ html2pdf found, generating HTML...');
    const htmlContent = generatePDFHTML(ranked, modelType, userName);
    console.log('✅ HTML generated, creating container...');

    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.top = "-9999px";
    container.style.left = "-9999px";
    container.style.width = "1000px";
    document.body.appendChild(container);

    const iframe = document.createElement("iframe");
    iframe.style.width = "1000px";
    iframe.style.height = "707px";
    iframe.style.border = "none";
    container.appendChild(iframe);

    const fileName = `${userName ? userName.toLowerCase().replace(/\s+/g, "-") + "-" : ""}${modelType === "genotipo" ? "genotipos" : "neurotalentos"}.pdf`;
    console.log('📄 Filename:', fileName);

    // Write HTML to iframe
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) { 
      console.log('❌ iframe doc not found');
      document.body.removeChild(container); 
      resolve(); 
      return; 
    }

    iframeDoc.open();
    iframeDoc.write(htmlContent);
    iframeDoc.close();
    console.log('✅ HTML written to iframe');

    // Wait for iframe content to render
    setTimeout(() => {
      console.log('✅ iframe content rendered');
      const target = iframeDoc.body.firstElementChild as HTMLElement ?? iframeDoc.body;

      console.log('🔧 Creating html2pdf instance...');
      const instance = html2pdf()
        .set({
          margin: 0,
          filename: fileName,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, allowTaint: true },
          jsPDF: { unit: "px", format: [1000, 707], orientation: "landscape" },
        })
        .from(target);

      if (zip) {
        console.log('📦 Generating blob for ZIP...');
        instance
          .output("blob")
          .then((blob: Blob) => {
            console.log('✅ Blob generated, adding to ZIP');
            zip.file(fileName, blob);
            document.body.removeChild(container);
            resolve();
          })
          .catch((err) => {
            console.error('❌ Error generating blob:', err);
            document.body.removeChild(container);
            resolve();
          });
      } else {
        console.log('💾 Saving PDF directly...');
        instance
          .save()
          .then(() => {
            console.log('✅ PDF saved successfully');
            document.body.removeChild(container);
            resolve();
          })
          .catch((err) => {
            console.error('❌ Error saving PDF:', err);
            document.body.removeChild(container);
            resolve();
          });
      }
    }, 300); // Wait 300ms for rendering
  });
}

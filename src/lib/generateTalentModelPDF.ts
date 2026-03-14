import { TALENTS } from "@/lib/talents";
import {
  TALENT_COLORS as INFORME_COLORS,
  SYMBOLS_GENOTIPO, SYMBOLS_NEUROTALENTO,
  SOFT_SKILLS_GENOTIPO, SOFT_SKILLS_NEUROTALENTO,
  TALENT_NAMES, NEUROCOGNITIVE_DATA, EJES,
} from "@/lib/pdf-data";
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

export type ExportProfileMeta = {
  rolEscogido?: string;
  rolPensado?: string;
};

// talentId (1-8) -> key de pdf-data
const ID_TO_KEY: Record<number, string> = {
  1: "estrategia",
  2: "analitico",
  3: "acompanamiento",
  4: "gestion",
  5: "empatico",
  6: "imaginacion",
  7: "profundo",
  8: "aplicado",
};

const GENOTIPO_SYMBOLS: Record<number, string> = {
  4: "\u25a1",
  1: "\u25b3",
  6: "\u2B2F",
  7: "\u25c7",
  8: "\u25ad",
  5: "\u25cb",
  2: "\u2B20",
  3: "\u221e",
};

const NEUROTALENTO_SYMBOLS: Record<number, string> = {
  4: "\u0391",
  1: "\u0394",
  6: "\u03a6",
  7: "\u0398",
  8: "\u039c",
  5: "\u03a9",
  2: "\u03a0",
  3: "\u03a8",
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

const TALENT_ORDER = [4, 1, 6, 7, 8, 5, 2, 3];

const AXIS_GROUPS = [
  { name: "ACCI\u00d3N Y RESULTADOS", talents: [4, 1] },
  { name: "IMAGINACI\u00d3N Y ARTE", talents: [6, 7] },
  { name: "DESTREZA Y PROYECCI\u00d3N", talents: [8, 5] },
  { name: "SABER Y CONOCIMIENTO", talents: [2, 3] },
];

const AXIS_LABELS: Array<{ name: string; x: number; y: number; rotate: number }> = [
  { name: "ACCI\u00d3N Y RESULTADOS", x: 280, y: 22, rotate: 0 },
  { name: "IMAGINACI\u00d3N Y ARTE", x: 538, y: 280, rotate: 0 },
  { name: "DESTREZA Y PROYECCI\u00d3N", x: 280, y: 538, rotate: 0 },
  { name: "SABER Y CONOCIMIENTO", x: 22, y: 280, rotate: 0 },
];

function toSafeNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && !isNaN(value)) return value;
  return fallback;
}

function polarToCartesian(cx: number, cy: number, angle: number, r: number) {
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
}

function createArcPath(
  cx: number, cy: number,
  startAngle: number, endAngle: number,
  outerR: number, innerR: number
): string {
  const start      = polarToCartesian(cx, cy, startAngle, outerR);
  const end        = polarToCartesian(cx, cy, endAngle,   outerR);
  const innerStart = polarToCartesian(cx, cy, startAngle, innerR);
  const innerEnd   = polarToCartesian(cx, cy, endAngle,   innerR);
  const laf        = endAngle - startAngle > Math.PI ? 1 : 0;
  return [
    `M ${start.x} ${start.y}`,
    `A ${outerR} ${outerR} 0 ${laf} 1 ${end.x} ${end.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerR} ${innerR} 0 ${laf} 0 ${innerStart.x} ${innerStart.y}`,
    `Z`,
  ].join(" ");
}

function generateWheelSVG(
  ranked: RankedTalent[],
  modelType: "genotipo" | "neurotalento"
): string {
  const size = 560, center = size / 2, radius = 184, innerRadius = 60;
  const symbolMap = modelType === "genotipo" ? GENOTIPO_SYMBOLS : NEUROTALENTO_SYMBOLS;

  const sections = TALENT_ORDER.map((talentId, index) => {
    const rd         = ranked.find(r => r.id === talentId);
    const color      = TALENT_COLORS[talentId] ?? "#999";
    const score      = toSafeNumber(rd?.score, 0);
    const max        = toSafeNumber(rd?.max, 15);
    const percentage = max > 0 ? Math.round((score / max) * 100) : 0;
    const fillPct    = percentage / 100;
    const fillRadius = innerRadius + (radius - innerRadius) * fillPct;
    const aps        = (Math.PI * 2) / 8;
    const startAngle = index * aps - Math.PI / 2;
    const endAngle   = startAngle + aps;
    const midAngle   = (startAngle + endAngle) / 2;
    const percentPos = polarToCartesian(center, center, midAngle, (fillRadius + innerRadius) / 2);
    const talent     = TALENTS.find(t => t.id === talentId);
    const fullTitle  = talent?.reportTitle ?? "";
    const symbol     = symbolMap[talentId] ?? "?";
    let line1 = fullTitle, line2 = "";
    if (fullTitle.includes(" y ")) {
      const p = fullTitle.split(" y "); if (p.length === 2) { line1 = p[0] + " y"; line2 = p[1]; }
    } else if (fullTitle.includes(" e ")) {
      const p = fullTitle.split(" e "); if (p.length === 2) { line1 = p[0] + " e"; line2 = p[1]; }
    } else {
      const w = fullTitle.split(" "), m = Math.ceil(w.length / 2);
      line1 = w.slice(0, m).join(" "); line2 = w.slice(m).join(" ");
    }
    return { talentId, color, percentage, fillRadius, fillPct, startAngle, endAngle, percentPos, symbol, line1, line2 };
  });

  const defs = sections.map(s => `
    <radialGradient id="pdf-g-${s.talentId}" cx="50%" cy="50%">
      <stop offset="0%" stop-color="${s.color}" stop-opacity="${Math.min(s.fillPct * 1.2, 1)}"/>
      <stop offset="${s.fillPct * 100}%" stop-color="${s.color}" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="${s.color}" stop-opacity="0.1"/>
    </radialGradient>`).join("");

  const diagonals = [1, 3, 5, 7].map(idx => {
    const angle = (idx * Math.PI * 2) / 8 - Math.PI / 2;
    const outer = polarToCartesian(center, center, angle, radius);
    return `<line x1="${center}" y1="${center}" x2="${outer.x.toFixed(2)}" y2="${outer.y.toFixed(2)}" stroke="#666" stroke-width="1" stroke-dasharray="4 4"/>`;
  }).join("");

  const sectorSVG = sections.map(s => {
    const fillPath  = createArcPath(center, center, s.startAngle, s.endAngle, s.fillRadius, innerRadius);
    const outerPath = createArcPath(center, center, s.startAngle, s.endAngle, radius, innerRadius);
    const pctText   = s.percentage > 15
      ? `<text x="${s.percentPos.x.toFixed(2)}" y="${s.percentPos.y.toFixed(2)}" text-anchor="middle" dominant-baseline="middle" font-size="13" font-weight="bold" fill="white">${s.percentage}</text>`
      : "";
    return `
      <path d="${fillPath}"  fill="url(#pdf-g-${s.talentId})" stroke="${s.color}" stroke-width="1"/>
      <path d="${outerPath}" fill="none" stroke="${s.color}" stroke-width="2" opacity="0.3"/>
      ${pctText}
    `;
  }).join("");

  const axisLabelMasksSVG = `
    <rect x="214" y="10" width="132" height="22" fill="#FFFFFF"/>
    <rect x="0" y="268" width="118" height="24" fill="#FFFFFF"/>
    <rect x="442" y="268" width="118" height="24" fill="#FFFFFF"/>
    <rect x="198" y="520" width="164" height="24" fill="#FFFFFF"/>
  `;

  const cl1 = "MAPA";
  const cl2 = "TALENTOS";

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>${defs}</defs>
  <line x1="${center}" y1="${center - radius}" x2="${center}" y2="${center + radius}" stroke="#000" stroke-width="2"/>
  <line x1="${center - radius}" y1="${center}" x2="${center + radius}" y2="${center}" stroke="#000" stroke-width="2"/>
  ${diagonals}
  ${sectorSVG}
  <circle cx="${center}" cy="${center}" r="${innerRadius}" fill="white" stroke="#000" stroke-width="2"/>
  <text x="${center}" y="${center - 5}" text-anchor="middle" dominant-baseline="middle" font-size="8" font-weight="700" fill="#444">${cl1}</text>
  <text x="${center}" y="${center + 6}" text-anchor="middle" dominant-baseline="middle" font-size="8" font-weight="700" fill="#444">${cl2}</text>
  ${axisLabelMasksSVG}
</svg>`;
}

function generateBatteryBar(percentage: number): string {
  const pct = Math.min(Math.max(percentage, 0), 100);
  const fill = pct > 67 ? "#DC2626" : "#111111";
  return `<div>
    <div style="display:flex;justify-content:space-between;font-size:6px;color:#777;margin-bottom:2px;line-height:1;">
      <span>0</span><span>60</span><span>100</span>
    </div>
    <div style="width:100%;height:8px;background:#d1d5db;border-radius:999px;overflow:hidden;">
      <div style="width:${pct}%;height:100%;background:${fill};border-radius:999px;"></div>
    </div>
  </div>`;
}

function generatePDFHTML(
  ranked: RankedTalent[],
  modelType: "genotipo" | "neurotalento",
  userName: string,
  summaryText?: string,
  meta?: ExportProfileMeta
): string {
  const symbolMap  = modelType === "genotipo" ? GENOTIPO_SYMBOLS : NEUROTALENTO_SYMBOLS;
  const modelLabel = modelType === "genotipo" ? "Modelo Talentos" : "Modelo Neurotalento";
  const winner     = ranked[0];
  const winnerFull = TALENTS.find(t => t.id === winner?.id);

  const svgContent = generateWheelSVG(ranked, modelType);

  const competencies = winnerFull?.competencies ?? [];
  const topRole      = winnerFull?.exampleRoles?.[0] ?? "";
  const profileTitle = winner?.reportTitle ?? winner?.quizTitle ?? "\u2014";

  const bulletItems = competencies.map(c => `
    <div style="display:flex;align-items:flex-start;gap:5px;margin-bottom:4px;">
      <span style="color:#CC0000;font-weight:bold;flex-shrink:0;font-size:9px;">&bull;</span>
      <span style="font-size:9px;color:#333;line-height:1.3;">${c}</span>
    </div>`).join("");

  const roleCards = [
    `<div style="margin-top:8px;border:2px solid #CC0000;border-radius:5px;padding:6px;background:#fff3f3;">
        <div style="font-size:7px;font-weight:700;color:#CC0000;letter-spacing:0.5px;margin-bottom:2px;">ROL SUGERIDO</div>
        <div style="font-size:9px;color:#333;line-height:1.35;">${topRole || "No indicado"}</div>
      </div>`,
  ].join("");

  const profileSection = `
    <div style="background:#f9f9f9;border:1px solid #ddd;border-radius:6px;padding:12px;margin-bottom:12px;">
      <div style="font-size:7px;font-weight:700;color:#888;letter-spacing:1px;margin-bottom:5px;">PERFIL PROFESIONAL</div>
      <div style="font-size:12px;font-weight:700;color:#111;margin-bottom:8px;text-transform:uppercase;">${profileTitle}</div>
      ${bulletItems}
      ${roleCards}
    </div>`;

  const talentListRows = AXIS_GROUPS.map(group => {
    const rows = group.talents.map(talentId => {
      const rd  = ranked.find(r => r.id === talentId);
      const pct = rd && rd.max > 0 ? Math.round((rd.score / rd.max) * 100) : 0;
      const sym = symbolMap[talentId] ?? "?";
      const nam = rd?.reportTitle ?? "";
      const bar = generateBatteryBar(pct);
      return `<div style="display:flex;align-items:flex-start;gap:6px;margin-bottom:6px;">
        <div style="font-size:10px;font-weight:700;color:#222;width:14px;text-align:center;flex-shrink:0;line-height:1.2;">${sym}</div>
        <div style="font-size:7px;font-weight:600;color:#333;width:110px;flex-shrink:0;line-height:1.25;word-break:break-word;">${pct} - ${nam}</div>
        <div style="flex:1;min-width:0;">${bar}</div>
      </div>`;
    }).join("");
    return `<div style="margin-bottom:8px;">
      <div style="font-size:7px;font-weight:700;color:#555;letter-spacing:0.5px;border-bottom:1px solid #ddd;padding-bottom:2px;margin-bottom:4px;">${group.name}</div>
      ${rows}
    </div>`;
  }).join("");

  const summaryBanner = summaryText?.trim()
    ? `<div style="width:100%;max-width:560px;margin:8px auto 0;padding:8px 16px;background:#000;color:#fff;border-radius:40px;font-size:7px;line-height:1.4;text-align:center;">${summaryText}</div>`
    : "";

  return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/>
  <style>* { box-sizing:border-box; margin:0; padding:0; } body { font-family:Arial,sans-serif; background:#fff; color:#111; }</style>
</head><body>
  <div style="width:1000px;padding:25px;">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;border-bottom:2px solid #111;padding-bottom:8px;">
      <div>
        <div style="font-size:16px;font-weight:700;">MAPA DE ${modelType === "genotipo" ? "TALENTOS" : "NEUROTALENTOS"}</div>
        <div style="font-size:10px;color:#555;">${userName ? userName + " \u2014 " : ""}${modelLabel}</div>
      </div>
      <div style="font-size:9px;color:#888;">Basado en neurociencia aplicada</div>
    </div>
    <div style="display:flex;gap:24px;align-items:flex-start;">
      <div style="flex-shrink:0;display:flex;flex-direction:column;align-items:center;">
        ${svgContent}
        ${summaryBanner}
      </div>
      <div style="flex:1;display:flex;flex-direction:column;gap:10px;">
        ${profileSection}
        <div style="background:#fff;border:1px solid #ddd;border-radius:6px;padding:10px;">
          ${talentListRows}
        </div>
      </div>
    </div>
  </div>
</body></html>`;
}

// ─── Informe multi-página (portada + 8 páginas de talento) ───────────────────

function hex2rgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function generateInformeHTML(
  ranked: RankedTalent[],
  modelType: "genotipo" | "neurotalento",
  userName: string,
  summaryText?: string
): string {
  const symMap    = modelType === "genotipo" ? SYMBOLS_GENOTIPO : SYMBOLS_NEUROTALENTO;
  const softMap   = modelType === "genotipo" ? SOFT_SKILLS_GENOTIPO : SOFT_SKILLS_NEUROTALENTO;
  const titulo    = modelType === "genotipo" ? "INFORME DE TALENTOS" : "INFORME DE NEUROTALENTOS";
  const BG        = "#0B0B1A";
  const fecha     = new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" });

  // Mini wheel SVG para portada (220px)
  const miniWheel = generateWheelSVG(ranked, modelType)
    .replace('width="560" height="560"', 'width="220" height="220"');

  // Portada
  const portadaResumen = summaryText?.trim()
    ? `<div style="margin-top:28px;border:1px solid #1E1E36;border-radius:8px;padding:16px;width:60%;text-align:left;">
        <div style="color:#6B7280;font-size:7px;letter-spacing:2px;margin-bottom:6px;">RESUMEN DEL EVALUADOR</div>
        <div style="color:#D1D5DB;font-size:9px;line-height:1.6;">${summaryText}</div>
      </div>`
    : "";

  const portada = `
  <div class="pagina" style="background:${BG};display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px;">
    <div style="color:#6B7280;font-size:8px;letter-spacing:4px;margin-bottom:18px;">${titulo}</div>
    <div style="color:#fff;font-size:38px;font-weight:bold;letter-spacing:3px;">${userName.toUpperCase()}</div>
    <div style="width:60px;height:2px;background:#1E1E36;margin:20px 0;"></div>
    <div style="color:#374151;font-size:9px;letter-spacing:2px;">${fecha}</div>
    <div style="color:#374151;font-size:7px;letter-spacing:3px;text-transform:uppercase;margin-top:6px;">Modelo ${modelType}</div>
    ${portadaResumen}
    <div style="margin-top:32px;opacity:0.6;">${miniWheel}</div>
  </div>`;

  // Ordenar por score desc
  const ordenado = [...EJES.flatMap(e => e.keys)].sort((a, b) => {
    const rdA = ranked.find(r => ID_TO_KEY[r.id] === a);
    const rdB = ranked.find(r => ID_TO_KEY[r.id] === b);
    const pA = rdA && rdA.max > 0 ? rdA.score / rdA.max : 0;
    const pB = rdB && rdB.max > 0 ? rdB.score / rdB.max : 0;
    return pB - pA;
  });

  // Páginas de talento
  const talentPages = ordenado.map((key, i) => {
    const rd      = ranked.find(r => ID_TO_KEY[r.id] === key);
    const color   = INFORME_COLORS[key] ?? "#888";
    const symbol  = symMap[key] ?? "?";
    const name    = TALENT_NAMES[key] ?? key;
    const data    = NEUROCOGNITIVE_DATA[key];
    const soft    = softMap[key] ?? [];
    const score   = rd && rd.max > 0 ? rd.score : 0;
    const max     = rd?.max ?? 15;
    const pts15   = Math.round(score * 15 / (max || 15));
    const pct     = max > 0 ? Math.round((score / max) * 100) : 0;

    const ambitoTags = data.ambitos.map(a =>
      `<span style="background:${hex2rgba(color, 0.15)};color:${color};border-radius:4px;padding:3px 8px;font-size:7px;font-weight:bold;margin:0 4px 4px 0;display:inline-block;">${a}</span>`
    ).join("");

    const softTags = soft.map(s =>
      `<span style="border:1px solid ${hex2rgba(color, 0.4)};color:${color};border-radius:4px;padding:3px 7px;font-size:7px;margin:0 4px 4px 0;display:inline-block;">${s}</span>`
    ).join("");

    const perfilPuntos = (data.perfilPuntos ?? []).map(p =>
      `<div style="display:flex;align-items:flex-start;gap:6px;margin-bottom:5px;">
        <span style="color:${color};font-size:10px;flex-shrink:0;line-height:1.2;">&#9658;</span>
        <span style="color:#D1D5DB;font-size:8.5px;line-height:1.5;">${p}</span>
      </div>`
    ).join("");

    return `
  <div class="pagina" style="background:${BG};display:flex;flex-direction:row;">
    <!-- Columna izquierda -->
    <div style="width:36%;padding:38px;display:flex;flex-direction:column;justify-content:space-between;background:${hex2rgba(color, 0.07)};">
      <div>
        <div style="font-size:72px;font-weight:bold;color:${color};line-height:1;">${symbol}</div>
        <div style="color:#fff;font-size:18px;font-weight:bold;margin-top:6px;">${name}</div>
        <div style="color:#6B7280;font-size:6.5px;letter-spacing:1.5px;margin-top:5px;line-height:1.4;">${data.eje}</div>
      </div>
      <div>
        <div style="color:#6B7280;font-size:6.5px;letter-spacing:2px;text-transform:uppercase;margin-top:18px;">Puntuación</div>
        <div style="display:flex;align-items:baseline;margin-top:2px;">
          <span style="font-size:44px;font-weight:bold;color:${color};line-height:1;">${pts15}</span>
          <span style="color:#374151;font-size:18px;margin-left:4px;">/15</span>
        </div>
        <div style="height:5px;border-radius:3px;margin-top:6px;background:#1E1E36;overflow:hidden;">
          <div style="width:${pct}%;height:100%;background:${color};border-radius:3px;"></div>
        </div>
      </div>
      ${soft.length > 0 ? `<div>
        <div style="color:#6B7280;font-size:6.5px;letter-spacing:2px;text-transform:uppercase;margin-top:14px;margin-bottom:5px;">Soft Skills</div>
        <div style="display:flex;flex-wrap:wrap;">${softTags}</div>
      </div>` : ""}
    </div>
    <!-- Columna derecha -->
    <div style="width:64%;padding:38px;background:#0F0F20;display:flex;flex-direction:column;">
      <div style="color:#6B7280;font-size:6.5px;letter-spacing:2px;text-transform:uppercase;margin-bottom:5px;">Resumen Neurocognitivo</div>
      <div style="color:#D1D5DB;font-size:8.5px;line-height:1.6;">${data.resumen}</div>
      <div style="color:#9CA3AF;font-size:7.5px;line-height:1.5;margin-top:8px;">${data.detalle}</div>
      <div style="color:#6B7280;font-size:6.5px;letter-spacing:2px;text-transform:uppercase;margin-top:14px;margin-bottom:5px;">Perfil</div>
      ${perfilPuntos}
      <div style="color:#6B7280;font-size:6.5px;letter-spacing:2px;text-transform:uppercase;margin-top:12px;margin-bottom:5px;">Ámbitos Profesionales</div>
      <div style="display:flex;flex-wrap:wrap;">${ambitoTags}</div>
      <div style="color:#6B7280;font-size:6.5px;letter-spacing:2px;text-transform:uppercase;margin-top:12px;margin-bottom:4px;">Rol sugerido</div>
      <div style="color:${color};font-size:8px;font-weight:600;">${data.rol}</div>
    </div>
    <div style="position:absolute;bottom:16px;right:24px;color:#1F2937;font-size:7px;">${i + 2} / ${ordenado.length + 1}</div>
  </div>`;
  }).join("");

  return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/>
<style>
  * { box-sizing:border-box; margin:0; padding:0; }
  body { font-family:Arial,Helvetica,sans-serif; background:#0B0B1A; }
  .pagina { width:841px; height:595px; position:relative; page-break-after:always; overflow:hidden; }
  .pagina:last-child { page-break-after:auto; }
</style>
</head><body>
  ${portada}
  ${talentPages}
</body></html>`;
}

function runHtml2Pdf(
  htmlContent: string,
  fileName: string,
  pageFormat: [number, number],
  zip?: JSZip
): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") { resolve(); return; }
    const html2pdf = (window as unknown as { html2pdf?: Html2PdfFn }).html2pdf;
    if (!html2pdf) { if (!zip) window.print(); resolve(); return; }

    const container = document.createElement("div");
    container.style.cssText = "position:fixed;top:-9999px;left:-9999px;width:" + pageFormat[0] + "px;";
    document.body.appendChild(container);

    const iframe = document.createElement("iframe");
    iframe.style.cssText = `width:${pageFormat[0]}px;height:${pageFormat[1]}px;border:none;`;
    container.appendChild(iframe);

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) { document.body.removeChild(container); resolve(); return; }

    iframeDoc.open(); iframeDoc.write(htmlContent); iframeDoc.close();

    setTimeout(() => {
      const target = (iframeDoc.body.firstElementChild as HTMLElement) ?? iframeDoc.body;
      const instance = html2pdf()
        .set({
          margin: 0,
          filename: fileName,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, allowTaint: true },
          jsPDF: { unit: "px", format: pageFormat, orientation: "landscape" },
        })
        .from(target);

      if (zip) {
        instance.output("blob")
          .then((blob: Blob) => { zip.file(fileName, blob); document.body.removeChild(container); resolve(); })
          .catch(() => { document.body.removeChild(container); resolve(); });
      } else {
        instance.save()
          .then(() => { document.body.removeChild(container); resolve(); })
          .catch(() => { document.body.removeChild(container); resolve(); });
      }
    }, 400);
  });
}

export function exportTalentModelPDF(
  ranked: RankedTalent[],
  modelType: "genotipo" | "neurotalento",
  userName: string,
  zip?: JSZip,
  summaryText?: string,
  meta?: ExportProfileMeta
): Promise<void> {
  const html     = generatePDFHTML(ranked, modelType, userName, summaryText, meta);
  const fileName = `${userName ? userName.toLowerCase().replace(/\s+/g, "-") + "-" : ""}${modelType === "genotipo" ? "talentos" : "neurotalentos"}.pdf`;
  return runHtml2Pdf(html, fileName, [1000, 707], zip);
}

export function exportInformePDF(
  ranked: RankedTalent[],
  modelType: "genotipo" | "neurotalento",
  userName: string,
  summaryText?: string
): Promise<void> {
  const html     = generateInformeHTML(ranked, modelType, userName, summaryText);
  const fileName = `${userName ? userName.toLowerCase().replace(/\s+/g, "-") + "-" : ""}informe-${modelType}.pdf`;
  return runHtml2Pdf(html, fileName, [841, 595], undefined);
}

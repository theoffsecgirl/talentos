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
    const labelPos   = polarToCartesian(center, center, midAngle, radius + 46);
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
    return { talentId, color, percentage, fillRadius, fillPct, startAngle, endAngle, labelPos, percentPos, symbol, line1, line2 };
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
      <text x="${s.labelPos.x.toFixed(2)}" y="${(s.labelPos.y - 12).toFixed(2)}" text-anchor="middle" dominant-baseline="middle" font-size="14" font-weight="700" fill="#222">${s.symbol}</text>
      <text x="${s.labelPos.x.toFixed(2)}" y="${(s.labelPos.y + 4).toFixed(2)}" text-anchor="middle" dominant-baseline="middle" font-size="5.3" font-weight="600" fill="#333">${s.line1}</text>
      ${s.line2 ? `<text x="${s.labelPos.x.toFixed(2)}" y="${(s.labelPos.y + 13).toFixed(2)}" text-anchor="middle" dominant-baseline="middle" font-size="5.3" font-weight="600" fill="#333">${s.line2}</text>` : ""}
    `;
  }).join("");

  const axisLabelMasksSVG = ``;

  const cl1 = "MAPA";
  const cl2 = modelType === "genotipo" ? "TALENTOS" : "NEUROTALENTOS";

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
    <div style="width:100%;height:6px;background:#d1d5db;border-radius:999px;overflow:hidden;">
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
        <div style="font-size:8px;color:#333;line-height:1.3;">${topRole || "No indicado"}</div>
      </div>`,
  ].join("");

  const profileSection = `
    <div style="background:#f9f9f9;border:1px solid #ddd;border-radius:6px;padding:12px;margin-bottom:10px;">
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


function scoreToPercentage(rd?: RankedTalent): number {
  if (!rd || !rd.max) return 0;
  return Math.round((rd.score / rd.max) * 100);
}

function scoreToDisplay(rd?: RankedTalent): number {
  return rd ? Math.round(rd.score) : 0;
}

function generateBatteryRowForKey(
  key: string,
  rd: RankedTalent | undefined,
  modelType: "genotipo" | "neurotalento",
  options?: { compact?: boolean; highlight?: boolean }
): string {
  const compact = options?.compact ?? false;
  const highlight = options?.highlight ?? false;
  const symbolMap = modelType === "genotipo" ? SYMBOLS_GENOTIPO : SYMBOLS_NEUROTALENTO;
  const symbol = symbolMap[key] ?? "?";
  const percentage = scoreToPercentage(rd);
  const title = TALENT_NAMES[key] ?? rd?.reportTitle ?? rd?.quizTitle ?? key;
  const bar = generateBatteryBar(percentage);

  return `
    <div style="display:flex;align-items:flex-start;gap:${compact ? 8 : 10}px;${highlight ? 'padding:6px 8px;border:1px solid #e5e7eb;border-radius:8px;background:#fafafa;' : ''}">
      <div style="font-size:${compact ? 13 : 14}px;font-weight:700;color:#111;width:${compact ? 14 : 16}px;text-align:center;line-height:1.1;flex-shrink:0;">${symbol}</div>
      <div style="font-size:${compact ? 9 : 10}px;font-weight:700;color:#222;width:${compact ? 150 : 180}px;line-height:1.25;flex-shrink:0;">${percentage} - ${title}</div>
      <div style="flex:1;min-width:0;">${bar}</div>
    </div>`;
}

function generateMapPageHTML(
  ranked: RankedTalent[],
  modelType: "genotipo" | "neurotalento",
  userName: string,
  summaryText?: string
): string {
  const symbolMap = modelType === "genotipo" ? GENOTIPO_SYMBOLS : NEUROTALENTO_SYMBOLS;
  const winner = [...ranked].sort((a, b) => (b.score / (b.max || 1)) - (a.score / (a.max || 1)))[0];
  const winnerFull = TALENTS.find(t => t.id === winner?.id);
  const competencies = winnerFull?.competencies ?? [];
  const topRole = winnerFull?.exampleRoles?.[0] ?? "";
  const profileTitle = winner?.reportTitle ?? winner?.quizTitle ?? "—";
  const svgContent = generateWheelSVG(ranked, modelType);
  const modelLabel = modelType === "genotipo" ? "Modelo Talentos" : "Modelo Neurotalentos";

  const bulletItems = competencies.map(c => `
    <div style="display:flex;align-items:flex-start;gap:6px;margin-bottom:7px;">
      <span style="color:#CC0000;font-weight:bold;flex-shrink:0;font-size:10px;line-height:1.1;">•</span>
      <span style="font-size:8px;color:#333;line-height:1.3;">${c}</span>
    </div>`).join("");

  const profileSection = `
    <div style="background:#fafafa;border:1px solid #d9d9d9;border-radius:12px;padding:10px 12px;margin-bottom:10px;">
      <div style="font-size:9px;font-weight:700;color:#888;letter-spacing:1.6px;margin-bottom:8px;">PERFIL PROFESIONAL</div>
      <div style="font-size:14px;font-weight:800;color:#111;margin-bottom:10px;text-transform:uppercase;line-height:1.2;">${profileTitle}</div>
      ${bulletItems}
      <div style="margin-top:12px;border:2px solid #CC0000;border-radius:8px;padding:6px 8px;background:#fff7f7;">
        <div style="font-size:9px;font-weight:800;color:#CC0000;letter-spacing:1.2px;margin-bottom:4px;">ROL SUGERIDO</div>
        <div style="font-size:8px;color:#333;line-height:1.3;">${topRole || "No indicado"}</div>
      </div>
    </div>`;

  const talentListRows = AXIS_GROUPS.map(group => {
    const rows = group.talents.map(talentId => {
      const rd = ranked.find(r => r.id === talentId);
      const key = ID_TO_KEY[talentId];
      return generateBatteryRowForKey(key, rd, modelType, { compact: true });
    }).join('<div style="height:6px"></div>');

    return `<div style="margin-bottom:10px;">
      <div style="font-size:9px;font-weight:800;color:#555;letter-spacing:.8px;border-bottom:1px solid #ddd;padding-bottom:4px;margin-bottom:6px;">${group.name}</div>
      ${rows}
    </div>`;
  }).join("");

  const summaryBanner = summaryText?.trim()
    ? `<div style="width:100%;margin-top:12px;padding:10px 14px;background:#111;color:#fff;border-radius:999px;font-size:10px;line-height:1.45;text-align:center;">${summaryText}</div>`
    : "";

  return `
  <section class="report-page landscape-page map-page">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px;padding-bottom:12px;border-bottom:3px solid #111;">
      <div>
        <div style="font-size:18px;font-weight:900;color:#111;line-height:1;">MAPA DE ${modelType === "genotipo" ? "TALENTOS" : "NEUROTALENTOS"}</div>
        <div style="font-size:11px;color:#666;margin-top:5px;">${userName ? `${userName} — ` : ""}${modelLabel}</div>
      </div>
      <div style="font-size:10px;color:#888;font-weight:700;">Basado en neurociencia aplicada</div>
    </div>

    <div style="display:grid;grid-template-columns: 1.08fr 0.92fr;gap:18px;align-items:start;">
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:flex-start;">
        <div style="width:100%;display:flex;justify-content:center;transform:scale(0.78);transform-origin:top center;">${svgContent}</div>
        ${summaryBanner}
      </div>
      <div>
        ${profileSection}
        <div style="background:#fff;border:1px solid #ddd;border-radius:12px;padding:10px 12px;">
          ${talentListRows}
        </div>
      </div>
    </div>
  </section>`;
}

function generateTalentSectionHTML(
  key: string,
  rd: RankedTalent | undefined,
  modelType: "genotipo" | "neurotalento"
): string {
  const symMap = modelType === "genotipo" ? SYMBOLS_GENOTIPO : SYMBOLS_NEUROTALENTO;
  const color = INFORME_COLORS[key] ?? "#888";
  const symbol = symMap[key] ?? "?";
  const name = TALENT_NAMES[key] ?? rd?.reportTitle ?? rd?.quizTitle ?? key;
  const data = NEUROCOGNITIVE_DATA[key];
  const scoreValue = scoreToDisplay(rd);
  const batteryRow = generateBatteryRowForKey(key, rd, modelType, { compact: false, highlight: true });
  const ambitos = data.ambitos.map(a => `<li>${a}</li>`).join("");
  const bullets = (data.perfilPuntos ?? []).map(p => `<li>${p}</li>`).join("");

  return `
    <section style="border:1px solid #e5e7eb;border-radius:14px;padding:14px 16px;background:#fff;box-shadow:0 2px 10px rgba(0,0,0,.03);break-inside:avoid;">
      <div style="display:grid;grid-template-columns: 84px 1fr 198px;gap:12px;align-items:start;">
        <div>
          <div style="font-size:24px;font-weight:800;color:${color};line-height:1;">${symbol}</div>
          <div style="font-size:9px;font-weight:700;color:#777;letter-spacing:1.1px;margin-top:8px;text-transform:uppercase;">Puntuación</div>
          <div style="font-size:34px;font-weight:900;color:${color};line-height:1;margin-top:2px;">${scoreValue}</div>
                  </div>

        <div>
          <div style="font-size:20px;font-weight:900;color:#111;line-height:1.15;">${name}</div>
          <div style="font-size:11px;font-weight:800;color:${color};letter-spacing:.8px;text-transform:uppercase;margin-top:8px;">${data.eje}</div>
          <div style="font-size:11px;font-weight:800;color:#111;margin-top:14px;">Resumen neurocognitivo</div>
          <div style="font-size:10px;color:#5f6b7a;line-height:1.4;margin-top:5px;">${data.resumen}</div>
          <ul style="margin:10px 0 0 16px;font-size:10px;color:#222;line-height:1.42;">${bullets}</ul>
          <div style="font-size:11px;font-weight:800;color:#111;margin-top:18px;">Ámbitos profesionales</div>
          <ul style="margin:7px 0 0 16px;font-size:10px;color:#5f6b7a;line-height:1.42;">${ambitos}</ul>
          <div style="font-size:11px;font-weight:800;color:#111;margin-top:18px;">Rol sugerido</div>
          <div style="font-size:10px;color:#222;line-height:1.38;margin-top:5px;">${data.rol}</div>
        </div>

        <div>
          <div style="font-size:10px;font-weight:800;color:#777;letter-spacing:1.1px;text-transform:uppercase;margin-bottom:6px;">Batería correspondiente</div>
          ${batteryRow}
          <div style="font-size:10px;font-weight:800;color:#777;letter-spacing:1.1px;text-transform:uppercase;margin-top:14px;">Orientación</div>
          <div style="margin-top:8px;border-left:3px solid ${color};padding-left:8px;font-size:10px;color:#4b5563;line-height:1.38;">${data.detalle}</div>
        </div>
      </div>
    </section>`;
}

function generateSoftSkillsPageHTML(
  ranked: RankedTalent[],
  modelType: "genotipo" | "neurotalento"
): string {
  const genericSoftMap = SOFT_SKILLS_GENOTIPO;
  const symMap = modelType === "genotipo" ? SYMBOLS_GENOTIPO : SYMBOLS_NEUROTALENTO;
  const columns = ["Creatividad", "Comunicación", "Inteligencia emocional", "Liderazgo"];

  const activeRows = Object.entries(ID_TO_KEY)
    .map(([id, key]) => {
      const rd = ranked.find(r => r.id === Number(id));
      const percentage = scoreToPercentage(rd);
      return { key, rd, percentage };
    })
    .filter(item => item.percentage > 67)
    .sort((a, b) => b.percentage - a.percentage);

  const rowsHtml = activeRows.length > 0
    ? activeRows.map(({ key, rd }) => {
        const title = TALENT_NAMES[key] ?? rd?.reportTitle ?? rd?.quizTitle ?? key;
        const symbol = symMap[key] ?? "?";
        const skills = genericSoftMap[key] ?? [];
        const checks = columns.map(col => `<td style="text-align:center;padding:8px 8px;font-size:13px;font-weight:800;color:${skills.includes(col) ? '#111' : '#cbd5e1'};">${skills.includes(col) ? 'X' : '—'}</td>`).join("");
        return `<tr>
          <td style="padding:8px 10px;font-size:13px;font-weight:800;color:#111;width:40px;text-align:center;">${symbol}</td>
          <td style="padding:8px 12px;font-size:11px;font-weight:700;color:#222;">${title}</td>
          ${checks}
        </tr>`;
      }).join("")
    : `<tr><td colspan="6" style="padding:20px;font-size:14px;color:#666;text-align:center;">No hay baterías destacadas para mostrar soft skills.</td></tr>`;

  return `
    <section class="report-page interior-page softskills-page">
      <div class="page-shell">
      <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:18px;">
        <div>
          <div style="font-size:20px;font-weight:900;color:#111;line-height:1;">SOFT SKILLS DESTACADAS</div>
          <div style="font-size:11px;color:#666;margin-top:5px;">Solo se muestran las baterías destacadas.</div>
        </div>
        <div style="font-size:10px;font-weight:700;color:#888;">Matriz final del informe</div>
      </div>

      <div style="border:1px solid #d1d5db;border-radius:16px;overflow:hidden;background:#fff;">
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="background:#f8fafc;">
              <th style="padding:10px 8px;border-bottom:1px solid #e5e7eb;width:40px;"></th>
              <th style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:left;font-size:11px;letter-spacing:.8px;color:#6b7280;text-transform:uppercase;">Batería</th>
              ${columns.map(col => `<th style="padding:10px 8px;border-bottom:1px solid #e5e7eb;text-align:center;font-size:11px;letter-spacing:.8px;color:#6b7280;text-transform:uppercase;">${col}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>
      </div>
    </section>`;
}

function generateInformeHTML(
  ranked: RankedTalent[],
  modelType: "genotipo" | "neurotalento",
  userName: string,
  summaryText?: string
): string {
  const orderedKeys = ranked
    .map(rd => ({ rd, key: ID_TO_KEY[rd.id], percentage: scoreToPercentage(rd) }))
    .filter(item => !!item.key)
    .sort((a, b) => b.percentage - a.percentage);

  const sectionPages = orderedKeys.map((item, index) => `
    <section class="report-page interior-page">
      <div class="page-shell">
        <div class="page-header">
          <div>
            <div class="page-title">INFORME DE ${modelType === "genotipo" ? "TALENTOS" : "NEUROTALENTOS"}</div>
            <div class="page-subtitle">${userName}</div>
          </div>
          <div class="page-meta">Batería ${index + 1} de ${orderedKeys.length}</div>
        </div>
        <div class="section-wrap">
          ${generateTalentSectionHTML(item.key, item.rd, modelType)}
        </div>
      </div>
    </section>`).join("");

  return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/>
<style>
  * { box-sizing:border-box; margin:0; padding:0; }
  body { font-family:Arial,Helvetica,sans-serif; background:#fff; color:#111; }
  .report-page { width:980px; min-height:694px; padding:18px 22px; page-break-after:always; background:#fff; overflow:hidden; }
  .report-page:last-child { page-break-after:auto; }
  .interior-page { padding:20px 24px; }
  .page-shell { width:100%; min-height:554px; border:1px solid #e5e7eb; border-radius:18px; padding:18px 20px; display:flex; flex-direction:column; justify-content:flex-start; }
  .page-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:14px; }
  .page-title { font-size:18px; font-weight:900; color:#111; line-height:1; }
  .page-subtitle { font-size:11px; color:#666; margin-top:5px; }
  .page-meta { font-size:9px; color:#888; font-weight:700; }
  .section-wrap { flex:1; display:flex; align-items:center; }
  .section-wrap > section { width:100%; }
  ul li { margin-bottom:4px; }
  table tbody tr:nth-child(even) { background:#fcfcfd; }
  table tbody tr td { border-top:1px solid #eef2f7; }
</style>
</head><body>
  ${generateMapPageHTML(ranked, modelType, userName, summaryText)}
  ${sectionPages}
  ${generateSoftSkillsPageHTML(ranked, modelType)}
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
      const target = iframeDoc.body as HTMLElement;
      const instance = html2pdf()
        .set({
          margin: 0,
          filename: fileName,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, allowTaint: true },
          pagebreak: { mode: ['css', 'legacy'] },
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

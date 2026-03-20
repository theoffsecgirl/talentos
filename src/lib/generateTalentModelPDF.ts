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


function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function nl2br(value: string): string {
  return escapeHtml(value).replace(/\n/g, "<br/>");
}

function chunkArray<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size));
  return chunks;
}

function percentageFromRanked(talent?: RankedTalent): number {
  if (!talent || talent.max <= 0) return 0;
  return Math.round((talent.score / talent.max) * 100);
}

function scoreToBatteryValue(score: number, max: number): number {
  if (!max) return 0;
  return Math.round((score * 15) / max);
}

const GENERIC_SOFT_SKILLS = [
  "Creatividad",
  "Comunicación",
  "Inteligencia emocional",
  "Liderazgo",
] as const;

function generateInformeHTML(
  ranked: RankedTalent[],
  modelType: "genotipo" | "neurotalento",
  userName: string,
  summaryText?: string
): string {
  const mapSymbolMap = modelType === "genotipo" ? GENOTIPO_SYMBOLS : NEUROTALENTO_SYMBOLS;
  const sectionSymbolMap = modelType === "genotipo" ? SYMBOLS_GENOTIPO : SYMBOLS_NEUROTALENTO;
  const modelLabel = modelType === "genotipo" ? "Talentos" : "Neurotalentos";
  const winner = ranked[0];
  const winnerKey = winner ? ID_TO_KEY[winner.id] : undefined;
  const winnerData = winnerKey ? NEUROCOGNITIVE_DATA[winnerKey] : undefined;
  const winnerColor = winnerKey ? INFORME_COLORS[winnerKey] ?? "#CC0000" : "#CC0000";
  const winnerTitle = winner?.reportTitle ?? winner?.quizTitle ?? "Perfil profesional";
  const winnerRole = winnerData?.rol ?? (winner?.exampleRoles?.[0] ?? "No disponible");

  const svgContent = generateWheelSVG(ranked, modelType).replace('width="560" height="560"', 'width="430" height="430"');
  const safeUserName = escapeHtml((userName || "Perfil sin nombre").trim());
  const safeSummary = summaryText?.trim() ? nl2br(summaryText.trim()) : "";

  const orderedTalentIds = ranked.map((talent) => talent.id);
  const mapSidebar = AXIS_GROUPS.map((group) => {
    const rows = group.talents.map((talentId) => {
      const talent = ranked.find((item) => item.id === talentId);
      const percentage = percentageFromRanked(talent);
      const color = percentage > 67 ? "#DC2626" : "#111111";
      const symbol = mapSymbolMap[talentId] ?? "?";
      const name = talent?.reportTitle ?? talent?.quizTitle ?? "Batería";
      return `
        <div class="map-row">
          <div class="map-row-label">
            <span class="map-row-symbol">${escapeHtml(symbol)}</span>
            <span>${percentage} - ${escapeHtml(name)}</span>
          </div>
          <div class="map-row-bar-scale"><span>0</span><span>60</span><span>100</span></div>
          <div class="map-row-bar-track"><div class="map-row-bar-fill" style="width:${percentage}%;background:${color};"></div></div>
        </div>`;
    }).join("");
    return `
      <div class="side-card compact">
        <div class="side-card-section-title">${escapeHtml(group.name)}</div>
        ${rows}
      </div>`;
  }).join("");

  const profileBullets = (winnerData?.perfilPuntos ?? []).slice(0, 4).map((item) => `
    <div class="profile-bullet"><span class="profile-bullet-dot">•</span><span>${escapeHtml(item)}</span></div>`
  ).join("");

  const summaryBanner = safeSummary
    ? `<div class="summary-banner">${safeSummary}</div>`
    : "";

  const portada = `
    <section class="report-page report-page-cover">
      <div class="page-header">
        <div>
          <div class="page-title">MAPA DE ${modelType === "genotipo" ? "TALENTOS" : "NEUROTALENTOS"}</div>
          <div class="page-subtitle">${safeUserName} - Modelo ${modelLabel}</div>
        </div>
        <div class="page-kicker">Basado en neurociencia aplicada</div>
      </div>
      <div class="cover-layout">
        <div class="cover-map-column">
          <div class="cover-map-wrap">${svgContent}</div>
          ${summaryBanner}
        </div>
        <div class="cover-side-column">
          <div class="side-card profile-card">
            <div class="eyebrow">Perfil profesional</div>
            <div class="profile-title">${escapeHtml(winnerTitle)}</div>
            ${profileBullets}
            <div class="role-card" style="border-color:${winnerColor};">
              <div class="role-card-label">Rol sugerido</div>
              <div class="role-card-value">${escapeHtml(winnerRole)}</div>
            </div>
          </div>
          ${mapSidebar}
        </div>
      </div>
      <div class="page-number">1</div>
    </section>`;

  const orderedKeys = orderedTalentIds
    .map((talentId) => ID_TO_KEY[talentId])
    .filter((key): key is string => Boolean(key));

  const sectionMarkup = orderedKeys.map((key) => {
    const rankedTalent = ranked.find((item) => ID_TO_KEY[item.id] === key);
    const data = NEUROCOGNITIVE_DATA[key];
    const color = INFORME_COLORS[key] ?? "#444444";
    const symbol = sectionSymbolMap[key] ?? "?";
    const points = rankedTalent ? scoreToBatteryValue(rankedTalent.score, rankedTalent.max) : 0;
    const percentage = percentageFromRanked(rankedTalent);
    const ambitos = data.ambitos.map((ambito) => `<li>${escapeHtml(ambito)}</li>`).join("");
    return `
      <article class="talent-section">
        <div class="talent-main">
          <div class="talent-heading-row">
            <div>
              <h2 class="talent-title">${escapeHtml(TALENT_NAMES[key])}</h2>
              <div class="talent-axis" style="color:${color};">${escapeHtml(EJES.find((eje) => eje.keys.includes(key))?.label ?? data.eje)}</div>
            </div>
            <div class="talent-symbol" style="color:${color};">${escapeHtml(symbol)}</div>
          </div>

          <div class="talent-block-title">Resumen neurocognitivo</div>
          <p class="talent-summary">${escapeHtml(data.resumen)}</p>
          <ul class="detail-list"><li>${escapeHtml(data.detalle)}</li></ul>

          <div class="talent-block-title">Ámbitos profesionales</div>
          <ul class="ambits-list">${ambitos}</ul>

          <div class="role-strip" style="border-left-color:${color};">
            <div class="role-strip-label">Rol sugerido</div>
            <div class="role-strip-value">${escapeHtml(data.rol)}</div>
          </div>
        </div>

        <aside class="talent-score-column">
          <div class="score-panel">
            <div class="score-label">Puntuación</div>
            <div class="score-value" style="color:${color};">${points}</div>
            <div class="score-battery">Batería ${escapeHtml(TALENT_NAMES[key])}</div>
            <div class="score-bar-track"><div class="score-bar-fill" style="width:${percentage}%;background:${color};"></div></div>
            <div class="score-percentage">${percentage}%</div>
          </div>
        </aside>
      </article>`;
  });

  const contentPages = chunkArray(sectionMarkup, 2).map((sections, index) => `
    <section class="report-page report-page-content">
      ${sections.join("\n")}
      <div class="page-number">${index + 2}</div>
    </section>`).join("");

  const qualifiedTalents = ranked
    .map((talent) => {
      const key = ID_TO_KEY[talent.id];
      if (!key) return null;
      const percentage = percentageFromRanked(talent);
      if (percentage <= 67) return null;
      return {
        key,
        percentage,
        symbol: sectionSymbolMap[key] ?? "?",
        name: TALENT_NAMES[key] ?? talent.reportTitle ?? talent.quizTitle,
        color: INFORME_COLORS[key] ?? "#444444",
        skills: SOFT_SKILLS_GENOTIPO[key] ?? [],
      };
    })
    .filter((item): item is { key: string; percentage: number; symbol: string; name: string; color: string; skills: string[] } => Boolean(item));

  const softSkillColumns = GENERIC_SOFT_SKILLS.map((skill) => {
    const matches = qualifiedTalents.filter((talent) => talent.skills.includes(skill));
    if (!matches.length) return "";
    const items = matches.map((talent) => `
      <div class="soft-item" style="border-color:${hex2rgba(talent.color, 0.25)}; background:${hex2rgba(talent.color, 0.08)};">
        <span class="soft-item-symbol" style="color:${talent.color};">${escapeHtml(talent.symbol)}</span>
        <div>
          <div class="soft-item-name">${escapeHtml(talent.name)}</div>
          <div class="soft-item-score">${talent.percentage}%</div>
        </div>
      </div>`).join("");
    return `
      <div class="soft-column">
        <div class="soft-column-title">${skill}</div>
        <div class="soft-column-items">${items}</div>
      </div>`;
  }).filter(Boolean).join("");

  const softSkillsPage = `
    <section class="report-page report-page-softskills">
      <div class="soft-header">
        <div>
          <div class="page-title">SOFT SKILLS</div>
          <div class="page-subtitle">Solo se muestran las baterías con puntuación superior al 67%</div>
        </div>
      </div>
      <div class="soft-matrix ${softSkillColumns ? "" : "soft-matrix-empty"}">
        ${softSkillColumns || `<div class="soft-empty">No hay soft skills activas por encima del umbral establecido.</div>`}
      </div>
      <div class="page-number">${chunkArray(sectionMarkup, 2).length + 2}</div>
    </section>`;

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, Helvetica, sans-serif; background: #f4f4f4; color: #111827; }
    .report-root { width: 794px; }
    .report-page {
      width: 794px;
      height: 1123px;
      background: #ffffff;
      position: relative;
      overflow: hidden;
      page-break-after: always;
      padding: 44px 44px 58px;
    }
    .report-page:last-child { page-break-after: auto; }
    .page-header, .soft-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; padding-bottom: 16px; border-bottom: 3px solid #111827; }
    .page-title { font-size: 24px; font-weight: 800; letter-spacing: -0.02em; }
    .page-subtitle { margin-top: 4px; color: #666; font-size: 11px; }
    .page-kicker { color: #8a8a8a; font-size: 10px; font-weight: 700; margin-top: 6px; }
    .cover-layout { display: flex; gap: 28px; margin-top: 24px; }
    .cover-map-column { width: 52%; display: flex; flex-direction: column; align-items: center; }
    .cover-map-wrap { width: 100%; display: flex; justify-content: center; }
    .cover-side-column { width: 48%; display: flex; flex-direction: column; gap: 16px; }
    .side-card { border: 1px solid #d5d5d5; border-radius: 14px; padding: 16px 18px; background: #fafafa; }
    .side-card.compact { padding: 14px 16px; }
    .eyebrow { color: #8b8b8b; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 10px; }
    .profile-title { font-size: 19px; line-height: 1.18; font-weight: 800; text-transform: uppercase; margin-bottom: 10px; }
    .profile-bullet { display: flex; gap: 8px; margin-bottom: 7px; color: #3d3d3d; font-size: 11px; line-height: 1.45; }
    .profile-bullet-dot { color: #cc0000; font-weight: 700; }
    .role-card { margin-top: 12px; border: 2px solid #cc0000; border-radius: 10px; padding: 10px 12px; background: #fff5f5; }
    .role-card-label, .role-strip-label { color: #cc0000; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.1px; margin-bottom: 4px; }
    .role-card-value, .role-strip-value { font-size: 12px; color: #333; line-height: 1.35; }
    .side-card-section-title { font-size: 11px; font-weight: 800; color: #5c5c5c; letter-spacing: 1px; border-bottom: 1px solid #dddddd; padding-bottom: 6px; margin-bottom: 10px; text-transform: uppercase; }
    .map-row { margin-bottom: 9px; }
    .map-row:last-child { margin-bottom: 0; }
    .map-row-label { display: flex; align-items: flex-start; gap: 7px; font-size: 11px; font-weight: 700; color: #222; line-height: 1.3; }
    .map-row-symbol { width: 12px; text-align: center; flex-shrink: 0; font-size: 13px; }
    .map-row-bar-scale { display: flex; justify-content: space-between; font-size: 8px; color: #888; margin: 4px 0 3px 19px; }
    .map-row-bar-track { margin-left: 19px; height: 9px; background: #d1d5db; border-radius: 999px; overflow: hidden; }
    .map-row-bar-fill { height: 100%; border-radius: 999px; }
    .summary-banner { margin-top: 18px; padding: 10px 16px; border-radius: 999px; background: #111827; color: #ffffff; font-size: 10px; line-height: 1.45; text-align: center; width: 100%; }
    .report-page-content { display: flex; flex-direction: column; gap: 36px; }
    .talent-section { display: grid; grid-template-columns: 1fr 132px; gap: 22px; min-height: 470px; padding-bottom: 18px; border-bottom: 1px solid #e5e7eb; }
    .talent-section:last-of-type { border-bottom: none; }
    .talent-heading-row { display: flex; justify-content: space-between; gap: 16px; align-items: flex-start; }
    .talent-title { font-size: 22px; line-height: 1.18; font-weight: 800; color: #111827; max-width: 480px; }
    .talent-axis { margin-top: 8px; font-size: 11px; font-weight: 700; letter-spacing: 0.7px; text-transform: uppercase; }
    .talent-symbol { font-size: 42px; line-height: 1; font-weight: 700; }
    .talent-block-title { margin-top: 28px; margin-bottom: 8px; font-size: 15px; font-weight: 800; color: #111827; }
    .talent-summary { font-size: 13px; line-height: 1.48; color: #6b7280; }
    .detail-list, .ambits-list { margin-top: 10px; margin-left: 20px; }
    .detail-list li { font-size: 13px; line-height: 1.72; color: #111111; margin-bottom: 6px; }
    .ambits-list li { font-size: 13px; line-height: 1.6; color: #6b7280; margin-bottom: 2px; }
    .role-strip { margin-top: 18px; padding: 12px 0 0 14px; border-left: 4px solid #cc0000; }
    .talent-score-column { display: flex; justify-content: flex-end; }
    .score-panel { text-align: center; padding-top: 38px; }
    .score-label { font-size: 13px; font-weight: 700; color: #6b7280; margin-bottom: 10px; }
    .score-value { font-size: 48px; line-height: 1; font-weight: 800; }
    .score-battery { margin-top: 6px; font-size: 11px; line-height: 1.35; color: #6b7280; }
    .score-bar-track { width: 100%; height: 8px; background: #e5e7eb; border-radius: 999px; margin-top: 14px; overflow: hidden; }
    .score-bar-fill { height: 100%; border-radius: 999px; }
    .score-percentage { margin-top: 7px; font-size: 11px; font-weight: 700; color: #6b7280; }
    .report-page-softskills { display: flex; flex-direction: column; }
    .soft-matrix { margin-top: 28px; border: 1px solid #d5d5d5; border-radius: 18px; overflow: hidden; display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); }
    .soft-column { min-height: 760px; border-right: 1px solid #e5e7eb; background: #fbfbfb; }
    .soft-column:last-child { border-right: none; }
    .soft-column-title { padding: 18px 16px; background: #111827; color: #ffffff; font-size: 14px; font-weight: 800; text-align: center; }
    .soft-column-items { padding: 16px; display: flex; flex-direction: column; gap: 12px; }
    .soft-item { border: 1px solid #e5e7eb; border-radius: 14px; padding: 12px; display: flex; gap: 10px; align-items: flex-start; }
    .soft-item-symbol { font-size: 22px; font-weight: 700; line-height: 1; width: 24px; text-align: center; }
    .soft-item-name { font-size: 12px; font-weight: 700; color: #111827; line-height: 1.35; }
    .soft-item-score { margin-top: 4px; font-size: 11px; color: #6b7280; }
    .soft-empty { padding: 24px; font-size: 13px; color: #6b7280; }
    .soft-matrix-empty { display: block; }
    .page-number { position: absolute; right: 44px; bottom: 26px; font-size: 11px; color: #9ca3af; }
  </style>
</head>
<body>
  <div class="report-root">
    ${portada}
    ${contentPages}
    ${softSkillsPage}
  </div>
</body>
</html>`;
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
          jsPDF: { unit: "px", format: pageFormat, orientation: pageFormat[0] >= pageFormat[1] ? "landscape" : "portrait" },
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
  return runHtml2Pdf(html, fileName, [794, 1123], undefined);
}

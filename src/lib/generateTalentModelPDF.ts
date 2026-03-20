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


function generateInformeHTML(
  ranked: RankedTalent[],
  modelType: "genotipo" | "neurotalento",
  userName: string,
  summaryText?: string
): string {
  const symMap = modelType === "genotipo" ? SYMBOLS_GENOTIPO : SYMBOLS_NEUROTALENTO;
  const titulo = modelType === "genotipo" ? "INFORME DE TALENTOS" : "INFORME DE NEUROTALENTOS";
  const modelLabel = modelType === "genotipo" ? "MAPA DE TALENTOS" : "MAPA DE NEUROTALENTOS";
  const winner = [...ranked].sort((a, b) => (b.score / (b.max || 1)) - (a.score / (a.max || 1)))[0];
  const winnerFull = TALENTS.find(t => t.id === winner?.id);
  const profileTitle = winner?.reportTitle ?? winner?.quizTitle ?? "—";
  const competencies = winnerFull?.competencies ?? [];
  const topRole = winnerFull?.exampleRoles?.[0] ?? "No indicado";
  const svgContent = generateWheelSVG(ranked, modelType);

  const sorted = [...EJES.flatMap(e => e.keys)].sort((a, b) => {
    const ra = ranked.find(r => ID_TO_KEY[r.id] === a);
    const rb = ranked.find(r => ID_TO_KEY[r.id] === b);
    const pa = ra && ra.max > 0 ? ra.score / ra.max : 0;
    const pb = rb && rb.max > 0 ? rb.score / rb.max : 0;
    return pb - pa;
  });

  const profileBullets = competencies.map(item => `
    <div class="bullet-row"><span class="bullet-dot">•</span><span>${item}</span></div>
  `).join("");

  const batteryList = AXIS_GROUPS.map(group => {
    const rows = group.talents.map(talentId => {
      const rd = ranked.find(r => r.id === talentId);
      const pct = rd && rd.max > 0 ? Math.round((rd.score / rd.max) * 100) : 0;
      const sym = (modelType === "genotipo" ? GENOTIPO_SYMBOLS : NEUROTALENTO_SYMBOLS)[talentId] ?? "?";
      const name = rd?.reportTitle ?? TALENTS.find(t => t.id === talentId)?.reportTitle ?? "";
      return `
        <div class="battery-row">
          <div class="battery-symbol">${sym}</div>
          <div class="battery-name">${pct} - ${name}</div>
          <div class="battery-bar-wrap">${generateBatteryBar(pct)}</div>
        </div>`;
    }).join("");
    return `
      <div class="axis-group">
        <div class="axis-title">${group.name}</div>
        ${rows}
      </div>`;
  }).join("");

  const coverPage = `
    <section class="page cover-page">
      <div class="cover-header">
        <div>
          <div class="report-kicker">${titulo}</div>
          <h1 class="report-name">${userName}</h1>
          <div class="report-sub">${modelLabel}</div>
        </div>
        <div class="report-note">Basado en neurociencia aplicada</div>
      </div>
      ${summaryText?.trim() ? `<div class="summary-pill">${summaryText}</div>` : ""}
      <div class="cover-card">
        <div class="cover-map-col">
          <div class="cover-map">${svgContent}</div>
        </div>
        <div class="cover-side-col">
          <div class="profile-box">
            <div class="eyebrow">PERFIL PROFESIONAL</div>
            <div class="profile-title">${profileTitle}</div>
            <div class="profile-bullets">${profileBullets}</div>
            <div class="role-box">
              <div class="role-eyebrow">ROL SUGERIDO</div>
              <div class="role-text">${topRole}</div>
            </div>
          </div>
          <div class="batteries-box">${batteryList}</div>
        </div>
      </div>
    </section>`;

  const talentPages = sorted.map((key, index) => {
    const rd = ranked.find(r => ID_TO_KEY[r.id] === key);
    const data = NEUROCOGNITIVE_DATA[key];
    const color = INFORME_COLORS[key] ?? "#666";
    const symbol = symMap[key] ?? "?";
    const name = TALENT_NAMES[key] ?? key;
    const max = rd?.max ?? 15;
    const score = rd?.score ?? 0;
    const pts15 = Math.round(score * 15 / (max || 15));
    const pct = max > 0 ? Math.round((score / max) * 100) : 0;
    const batteryPill = `${symbol}  ${pct} - ${name}`;
    const perfilPuntos = (data.perfilPuntos ?? []).map(item => `
      <li>${item}</li>
    `).join("");
    const ambitos = (data.ambitos ?? []).map(item => `<li>${item}</li>`).join("");

    return `
      <section class="page detail-page">
        <div class="detail-head">
          <div class="report-kicker">${titulo}</div>
          <div class="detail-person">${userName}</div>
          <div class="detail-index">Batería ${index + 1} de ${sorted.length}</div>
        </div>
        <div class="detail-card">
          <div class="score-col" style="--accent:${color}">
            <div class="score-symbol">${symbol}</div>
            <div class="score-label">PUNTUACIÓN</div>
            <div class="score-value">${pts15}</div>
          </div>
          <div class="content-col">
            <h2 class="talent-title">${name}</h2>
            <div class="talent-axis" style="color:${color}">${data.eje}</div>

            <div class="section-title">Resumen neurocognitivo</div>
            <p class="lead-text">${data.resumen}</p>
            <ul class="bullet-list">${perfilPuntos}</ul>

            <div class="section-title">Ámbitos profesionales</div>
            <ul class="scope-list">${ambitos}</ul>

            <div class="section-title">Rol sugerido</div>
            <p class="role-inline">${data.rol}</p>
          </div>
          <aside class="aside-col">
            <div class="aside-box">
              <div class="aside-eyebrow">BATERÍA CORRESPONDIENTE</div>
              <div class="battery-pill">${batteryPill}</div>
            </div>
            <div class="aside-box orientation-box" style="--accent:${color}">
              <div class="aside-eyebrow">ORIENTACIÓN</div>
              <div class="orientation-text">${data.detalle}</div>
            </div>
          </aside>
        </div>
      </section>`;
  }).join("");

  const softMatrix: Record<string, Record<string, boolean>> = {
    estrategia: { creatividad: true, comunicacion: false, inteligencia: false, liderazgo: true },
    acompanamiento: { creatividad: true, comunicacion: true, inteligencia: true, liderazgo: true },
    aplicado: { creatividad: false, comunicacion: false, inteligencia: false, liderazgo: false },
    empatico: { creatividad: false, comunicacion: true, inteligencia: true, liderazgo: true },
    analitico: { creatividad: true, comunicacion: false, inteligencia: false, liderazgo: false },
    profundo: { creatividad: true, comunicacion: false, inteligencia: false, liderazgo: false },
    imaginacion: { creatividad: true, comunicacion: true, inteligencia: true, liderazgo: true },
    gestion: { creatividad: true, comunicacion: false, inteligencia: false, liderazgo: true },
  };

  const softRows = sorted
    .map((key) => {
      const rd = ranked.find(r => ID_TO_KEY[r.id] === key);
      const pct = rd && rd.max > 0 ? Math.round((rd.score / rd.max) * 100) : 0;
      const row = softMatrix[key];
      if (pct <= 67 || !row || (!row.creatividad && !row.comunicacion && !row.inteligencia && !row.liderazgo)) {
        return "";
      }
      return `
        <tr>
          <td class="soft-battery"><span class="soft-symbol">${symMap[key] ?? "?"}</span><span>${TALENT_NAMES[key] ?? key}</span></td>
          <td>${row.creatividad ? "X" : "—"}</td>
          <td>${row.comunicacion ? "X" : "—"}</td>
          <td>${row.inteligencia ? "X" : "—"}</td>
          <td>${row.liderazgo ? "X" : "—"}</td>
        </tr>`;
    })
    .filter(Boolean)
    .join("");

  const softPage = `
    <section class="page soft-page">
      <div class="soft-head">
        <div class="report-kicker">${titulo}</div>
        <div class="detail-person">${userName}</div>
      </div>
      <h2 class="soft-title-main">SOFT SKILLS DESTACADAS</h2>
      <div class="soft-sub">Solo se muestran las baterías destacadas.</div>
      <div class="soft-card">
        <table class="soft-table">
          <thead>
            <tr>
              <th>BATERÍA</th>
              <th>CREATIVIDAD</th>
              <th>COMUNICACIÓN</th>
              <th>INTELIGENCIA EMOCIONAL</th>
              <th>LIDERAZGO</th>
            </tr>
          </thead>
          <tbody>
            ${softRows || `<tr><td colspan="5" class="empty-soft">No hay soft skills destacadas para mostrar.</td></tr>`}
          </tbody>
        </table>
      </div>
    </section>`;

  return `<!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8" />
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: Arial, Helvetica, sans-serif; background: #fff; color: #111827; }
      #pdf-root { width: 992px; }
      .page {
        width: 992px;
        height: 1404px;
        padding: 52px 48px;
        page-break-after: always;
        break-after: page;
        overflow: hidden;
        background: #fff;
        position: relative;
      }
      .page:last-child { page-break-after: auto; break-after: auto; }
      .report-kicker { font-size: 15px; font-weight: 800; letter-spacing: 0.2px; color: #111827; }
      .detail-person, .report-name { font-size: 22px; font-weight: 500; margin-top: 8px; color: #1f2937; }
      .detail-index, .report-sub, .report-note, .soft-sub { font-size: 13px; color: #6b7280; margin-top: 8px; }
      .cover-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-bottom: 18px; }
      .summary-pill { margin: 0 auto 20px; padding: 10px 20px; border: 1px solid #dbeafe; border-radius: 999px; font-size: 12px; color: #4b5563; text-align: center; max-width: 760px; }
      .cover-card { display: grid; grid-template-columns: 60% 40%; gap: 18px; border: 1px solid #d1d5db; border-radius: 28px; padding: 26px; min-height: 1200px; }
      .cover-map-col { display: flex; align-items: center; justify-content: center; }
      .cover-map { transform: scale(0.92); transform-origin: center center; }
      .cover-side-col { display: flex; flex-direction: column; gap: 16px; }
      .profile-box, .batteries-box { border: 1px solid #d1d5db; border-radius: 22px; padding: 18px; }
      .eyebrow, .aside-eyebrow, .axis-title { font-size: 11px; letter-spacing: 2px; font-weight: 700; color: #6b7280; }
      .profile-title { font-size: 27px; line-height: 1.1; font-weight: 800; margin: 10px 0 14px; text-transform: uppercase; }
      .bullet-row { display: flex; gap: 8px; align-items: flex-start; margin-bottom: 8px; font-size: 13px; line-height: 1.4; color: #374151; }
      .bullet-dot { color: #dc2626; font-weight: 800; }
      .role-box { margin-top: 14px; border: 2px solid #dc2626; background: #fff7f7; border-radius: 14px; padding: 12px 14px; }
      .role-eyebrow { font-size: 11px; letter-spacing: 2px; font-weight: 800; color: #dc2626; }
      .role-text { font-size: 14px; line-height: 1.45; color: #374151; margin-top: 6px; }
      .axis-group + .axis-group { margin-top: 14px; }
      .axis-title { border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; margin-bottom: 8px; }
      .battery-row { display: grid; grid-template-columns: 20px 150px 1fr; gap: 8px; align-items: start; margin-bottom: 10px; }
      .battery-symbol { font-size: 16px; font-weight: 800; color: #111827; text-align: center; line-height: 1.1; }
      .battery-name { font-size: 12px; font-weight: 700; color: #374151; line-height: 1.25; }
      .battery-bar-wrap { padding-top: 2px; }
      .detail-head { margin-bottom: 18px; }
      .detail-card { border: 1px solid #d1d5db; border-radius: 26px; padding: 28px; min-height: 1220px; display: grid; grid-template-columns: 130px 1fr 240px; gap: 24px; }
      .score-col { padding-top: 6px; }
      .score-symbol { font-size: 52px; font-weight: 800; line-height: 1; color: var(--accent); }
      .score-label { margin-top: 14px; font-size: 14px; letter-spacing: 2px; font-weight: 800; color: #6b7280; }
      .score-value { margin-top: 8px; font-size: 72px; line-height: 1; font-weight: 800; color: var(--accent); }
      .talent-title { font-size: 48px; line-height: 1.05; font-weight: 800; color: #111827; }
      .talent-axis { margin-top: 14px; font-size: 20px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; }
      .section-title { margin-top: 28px; font-size: 18px; font-weight: 800; color: #111827; }
      .lead-text, .orientation-text { margin-top: 12px; font-size: 16px; line-height: 1.6; color: #4b5563; }
      .bullet-list, .scope-list { margin-top: 16px; margin-left: 18px; }
      .bullet-list li, .scope-list li { font-size: 16px; line-height: 1.55; color: #374151; margin-bottom: 6px; }
      .role-inline { margin-top: 10px; font-size: 18px; line-height: 1.55; color: #374151; font-weight: 600; }
      .aside-col { display: flex; flex-direction: column; gap: 18px; }
      .aside-box { border-radius: 18px; }
      .battery-pill { margin-top: 10px; padding: 12px 14px; border: 1px solid #d1d5db; border-radius: 16px; font-size: 14px; font-weight: 700; color: #374151; line-height: 1.35; }
      .orientation-box { padding-left: 14px; border-left: 5px solid var(--accent); }
      .soft-head { margin-bottom: 20px; }
      .soft-title-main { font-size: 48px; line-height: 1.05; font-weight: 800; color: #111827; margin-top: 14px; }
      .soft-card { margin-top: 22px; border: 1px solid #d1d5db; border-radius: 24px; overflow: hidden; }
      .soft-table { width: 100%; border-collapse: collapse; }
      .soft-table th { background: #f9fafb; color: #6b7280; font-size: 14px; letter-spacing: 2px; font-weight: 800; padding: 18px 16px; text-align: center; }
      .soft-table th:first-child, .soft-table td:first-child { text-align: left; }
      .soft-table td { border-top: 1px solid #e5e7eb; padding: 18px 16px; font-size: 18px; font-weight: 700; color: #111827; text-align: center; }
      .soft-battery { display: flex; gap: 14px; align-items: center; }
      .soft-symbol { display: inline-block; min-width: 24px; font-size: 24px; font-weight: 800; }
      .empty-soft { text-align: center !important; color: #6b7280 !important; font-weight: 500 !important; }
    </style>
  </head>
  <body>
    <div id="pdf-root">
      ${coverPage}
      ${talentPages}
      ${softPage}
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
  return runHtml2Pdf(html, fileName, [992, 1404], undefined);
}

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


// ─── Informe multipágina A4 vertical (sin cortes y con maquetación fija) ─────

function hex2rgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function escapeHtml(value?: string): string {
  return (value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatText(value?: string): string {
  return escapeHtml(value).replace(/\n/g, "<br/>");
}

function buildBatteryScale(percentage: number, color: string): string {
  const pct = Math.min(Math.max(percentage, 0), 100);
  return `
    <div class="scale">
      <div class="scale-labels"><span>0</span><span>60</span><span>100</span></div>
      <div class="scale-track"><div class="scale-fill" style="width:${pct}%;background:${color};"></div></div>
    </div>`;
}

function generateInformeHTML(
  ranked: RankedTalent[],
  modelType: "genotipo" | "neurotalento",
  userName: string,
  summaryText?: string
): string {
  const symbolMap = modelType === "genotipo" ? GENOTIPO_SYMBOLS : NEUROTALENTO_SYMBOLS;
  const titulo = modelType === "genotipo" ? "INFORME DE TALENTOS" : "INFORME DE NEUROTALENTOS";
  const subtitulo = modelType === "genotipo" ? "Mapa de talentos" : "Mapa de neurotalentos";
  const modelLabel = modelType === "genotipo" ? "Modelo Talentos" : "Modelo Neurotalento";
  const winner = ranked[0];
  const winnerFull = TALENTS.find(t => t.id === winner?.id);
  const wheel = generateWheelSVG(ranked, modelType).replace('width="560" height="560"', 'width="360" height="360"');

  const byKey = new Map<string, RankedTalent>();
  ranked.forEach((item) => byKey.set(ID_TO_KEY[item.id], item));

  const sortedKeys = [...EJES.flatMap((e) => e.keys)].sort((a, b) => {
    const pa = (() => {
      const rd = byKey.get(a);
      return rd && rd.max > 0 ? rd.score / rd.max : 0;
    })();
    const pb = (() => {
      const rd = byKey.get(b);
      return rd && rd.max > 0 ? rd.score / rd.max : 0;
    })();
    return pb - pa;
  });

  const winnerColor = winner ? TALENT_COLORS[winner.id] ?? "#111827" : "#111827";
  const winnerSymbol = winner ? symbolMap[winner.id] ?? "?" : "?";
  const winnerTitle = winner?.reportTitle ?? winner?.quizTitle ?? "—";
  const winnerEje = winner ? (NEUROCOGNITIVE_DATA[ID_TO_KEY[winner.id]]?.eje ?? "") : "";
  const winnerRole = winnerFull?.exampleRoles?.[0] ?? "No indicado";
  const winnerCompetencies = (winnerFull?.competencies ?? []).slice(0, 4);

  const axisBlocks = AXIS_GROUPS.map((axis) => {
    const rows = axis.talents.map((talentId) => {
      const row = ranked.find((r) => r.id === talentId);
      const pct = row && row.max > 0 ? Math.round((row.score / row.max) * 100) : 0;
      const color = TALENT_COLORS[talentId] ?? "#111827";
      const symbol = symbolMap[talentId] ?? "?";
      const title = escapeHtml(row?.reportTitle ?? "");
      return `
        <div class="battery-row">
          <div class="battery-symbol" style="color:${color};">${symbol}</div>
          <div>
            <div class="battery-name">${pct} · ${title}</div>
          </div>
          ${buildBatteryScale(pct, pct > 67 ? "#DC2626" : color)}
        </div>`;
    }).join("");
    return `
      <div class="axis-card">
        <div class="axis-title">${axis.name}</div>
        ${rows}
      </div>`;
  }).join("");

  const summaryCard = summaryText?.trim()
    ? `<div class="summary-card"><div class="summary-label">Resumen complementario</div><p>${formatText(summaryText)}</p></div>`
    : "";

  const cover = `
    <section class="page cover-page">
      <div class="header-line">
        <div>
          <div class="eyebrow">${titulo}</div>
          <h1 class="cover-title">${escapeHtml(userName || "Informe individual")}</h1>
          <div class="subline">${subtitulo} · ${modelLabel}</div>
        </div>
        <div class="header-note">Basado en neurociencia aplicada</div>
      </div>

      <div class="cover-grid">
        <div class="card map-card">
          <div class="section-kicker">${subtitulo}</div>
          <div class="map-wrap">${wheel}</div>
          <div class="map-footnote">Mapa completo del modelo exportado</div>
        </div>

        <div>
          <div class="card profile-card">
            <div class="section-kicker">Perfil profesional</div>
            <div class="profile-title-row">
              <div class="profile-symbol" style="background:${hex2rgba(winnerColor, 0.12)};color:${winnerColor};">${winnerSymbol}</div>
              <div>
                <h2 class="profile-title">${escapeHtml(winnerTitle)}</h2>
                <div class="profile-eje" style="color:${winnerColor};">${escapeHtml(winnerEje)}</div>
              </div>
            </div>
            <ul class="bullet-list compact-list">
              ${winnerCompetencies.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
            </ul>
            <div class="role-box" style="border-color:${winnerColor};background:${hex2rgba(winnerColor, 0.08)};">
              <div class="role-label">Rol sugerido</div>
              <div class="role-value">${escapeHtml(winnerRole)}</div>
            </div>
          </div>
          ${summaryCard}
        </div>
      </div>

      <div class="card batteries-card">
        <div class="section-kicker">Baterías del perfil</div>
        <div class="axis-grid">${axisBlocks}</div>
      </div>
    </section>`;

  const detailPages = sortedKeys.map((key, index) => {
    const talent = byKey.get(key);
    if (!talent) return "";
    const data = NEUROCOGNITIVE_DATA[key];
    const color = INFORME_COLORS[key] ?? TALENT_COLORS[talent.id] ?? "#111827";
    const symbol = symbolMap[talent.id] ?? "?";
    const percentage = talent.max > 0 ? Math.round((talent.score / talent.max) * 100) : 0;
    const title = TALENT_NAMES[key] ?? talent.reportTitle ?? talent.quizTitle;
    const genericSoft = SOFT_SKILLS_GENOTIPO[key] ?? [];

    return `
      <section class="page detail-page">
        <div class="page-topline">
          <div>
            <div class="eyebrow small-eyebrow">${titulo}</div>
            <div class="page-name">${escapeHtml(userName)}</div>
          </div>
          <div class="page-counter">Batería ${index + 1} de ${sortedKeys.length}</div>
        </div>

        <div class="talent-card-shell">
          <div class="talent-hero" style="background:linear-gradient(135deg, ${hex2rgba(color, 0.16)} 0%, #ffffff 70%);">
            <div class="talent-hero-grid">
              <div class="hero-badge" style="background:${hex2rgba(color, 0.14)}; color:${color};">${symbol}</div>
              <div>
                <h2 class="talent-title">${escapeHtml(title)}</h2>
                <div class="talent-eje" style="color:${color};">${escapeHtml(data.eje)}</div>
              </div>
              <div class="score-box" style="border-color:${hex2rgba(color, 0.25)};">
                <div class="score-label">Puntuación</div>
                <div class="score-number" style="color:${color};">${Math.round((talent.score * 15) / (talent.max || 15))}</div>
              </div>
            </div>

            <div class="battery-strip">
              <div class="battery-strip-meta">
                <span class="battery-strip-symbol" style="color:${color};">${symbol}</span>
                <span class="battery-strip-text">${percentage} · ${escapeHtml(title)}</span>
              </div>
              ${buildBatteryScale(percentage, color)}
            </div>
          </div>

          <div class="detail-grid">
            <div>
              <div class="content-card">
                <div class="section-kicker">Resumen neurocognitivo</div>
                <p class="body-text">${escapeHtml(data.resumen)}</p>
              </div>
              <div class="content-card">
                <div class="section-kicker">Orientación</div>
                <p class="body-text">${escapeHtml(data.detalle)}</p>
              </div>
            </div>

            <div>
              <div class="content-card">
                <div class="section-kicker">Perfil destacado</div>
                <ul class="bullet-list">
                  ${data.perfilPuntos.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
                </ul>
              </div>
              <div class="content-card">
                <div class="section-kicker">Ámbitos profesionales</div>
                <ul class="bullet-list compact-list">
                  ${data.ambitos.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
                </ul>
              </div>
              <div class="content-card role-card-side" style="border-left-color:${color}; background:${hex2rgba(color, 0.08)};">
                <div class="section-kicker">Rol sugerido</div>
                <div class="role-side-title">${escapeHtml(data.rol)}</div>
                ${genericSoft.length ? `<div class="soft-inline"><strong>Soft skills:</strong> ${genericSoft.map(escapeHtml).join(" · ")}</div>` : ""}
              </div>
            </div>
          </div>
        </div>
      </section>`;
  }).join("");

  const activeRows = sortedKeys.filter((key) => {
    const rd = byKey.get(key);
    if (!rd || rd.max <= 0) return false;
    return Math.round((rd.score / rd.max) * 100) > 67;
  });

  const softColumns = ["Creatividad", "Comunicación", "Inteligencia emocional", "Liderazgo"];
  const softRows = activeRows.map((key) => {
    const rd = byKey.get(key)!;
    const rowSkills = SOFT_SKILLS_GENOTIPO[key] ?? [];
    const title = TALENT_NAMES[key] ?? rd.reportTitle ?? rd.quizTitle;
    const symbol = symbolMap[rd.id] ?? "?";
    const color = TALENT_COLORS[rd.id] ?? "#111827";
    return `
      <tr>
        <td>
          <div class="table-battery">
            <span class="table-symbol" style="color:${color};">${symbol}</span>
            <span>${escapeHtml(title)}</span>
          </div>
        </td>
        ${softColumns.map((col) => `<td class="center-cell">${rowSkills.includes(col) ? `<span class="x-mark" style="color:${color};">X</span>` : "—"}</td>`).join("")}
      </tr>`;
  }).join("");

  const finalPage = `
    <section class="page final-page">
      <div class="page-topline">
        <div>
          <div class="eyebrow small-eyebrow">${titulo}</div>
          <div class="page-name">${escapeHtml(userName)}</div>
        </div>
        <div class="page-counter">Soft skills destacadas</div>
      </div>

      <div class="card final-card">
        <div class="section-kicker">Cuadro final de soft skills</div>
        <h2 class="final-title">Solo se muestran las baterías destacadas</h2>
        <p class="final-text">Se incluyen únicamente las baterías que superan el umbral definido y las competencias asociadas a cada una.</p>
        <table class="soft-table">
          <thead>
            <tr>
              <th>Batería</th>
              ${softColumns.map((col) => `<th>${col}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${softRows || `<tr><td colspan="5" class="empty-soft">No hay baterías por encima del umbral configurado.</td></tr>`}
          </tbody>
        </table>
      </div>
    </section>`;

  return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/>
    <style>
      * { box-sizing:border-box; margin:0; padding:0; }
      body { font-family: Arial, Helvetica, sans-serif; background:#eef2f7; color:#111827; }
      .report-root { width:794px; margin:0 auto; }
      .page {
        width:794px;
        height:1123px;
        background:#ffffff;
        position:relative;
        overflow:hidden;
        padding:52px 56px;
        page-break-after:always;
        break-after:page;
      }
      .page:last-child { page-break-after:auto; break-after:auto; }
      .cover-page { background:linear-gradient(180deg, #ffffff 0%, #fbfcff 100%); }
      .header-line {
        display:flex;
        justify-content:space-between;
        align-items:flex-start;
        gap:20px;
        border-bottom:2px solid #111827;
        padding-bottom:18px;
        margin-bottom:26px;
      }
      .eyebrow {
        font-size:12px;
        line-height:1.2;
        font-weight:800;
        letter-spacing:1.9px;
        text-transform:uppercase;
        color:#6b7280;
      }
      .small-eyebrow { font-size:10px; }
      .cover-title {
        margin-top:10px;
        font-size:33px;
        line-height:1.08;
        font-weight:800;
        color:#111827;
      }
      .subline, .header-note, .page-name, .page-counter, .final-text {
        font-size:14px;
        line-height:1.5;
        color:#6b7280;
      }
      .header-note { max-width:200px; text-align:right; }
      .cover-grid {
        display:grid;
        grid-template-columns: 1.02fr 0.98fr;
        gap:24px;
        align-items:start;
      }
      .card {
        background:#ffffff;
        border:1px solid #e5e7eb;
        border-radius:24px;
        box-shadow:0 10px 30px rgba(15, 23, 42, 0.06);
      }
      .map-card { padding:22px 18px 16px; }
      .map-wrap {
        display:flex;
        justify-content:center;
        align-items:center;
        min-height:390px;
      }
      .map-footnote { margin-top:8px; font-size:12px; color:#94a3b8; text-align:center; }
      .section-kicker {
        font-size:11px;
        line-height:1.2;
        font-weight:800;
        letter-spacing:1.8px;
        text-transform:uppercase;
        color:#6b7280;
      }
      .profile-card { padding:22px; }
      .profile-title-row {
        display:grid;
        grid-template-columns: 60px 1fr;
        gap:14px;
        align-items:center;
        margin-top:14px;
      }
      .profile-symbol {
        width:60px;
        height:60px;
        border-radius:18px;
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:28px;
        font-weight:800;
      }
      .profile-title {
        font-size:26px;
        line-height:1.1;
        font-weight:800;
        color:#111827;
      }
      .profile-eje {
        margin-top:8px;
        font-size:11px;
        line-height:1.4;
        font-weight:700;
        letter-spacing:1.2px;
        text-transform:uppercase;
      }
      .bullet-list {
        margin-top:16px;
        padding-left:18px;
      }
      .bullet-list li {
        margin-bottom:8px;
        font-size:14px;
        line-height:1.58;
        color:#374151;
      }
      .compact-list li { margin-bottom:7px; }
      .role-box {
        margin-top:14px;
        padding:14px 16px;
        border:2px solid #d1d5db;
        border-radius:18px;
      }
      .role-label, .score-label {
        font-size:11px;
        line-height:1.2;
        font-weight:800;
        letter-spacing:1.6px;
        text-transform:uppercase;
        color:#6b7280;
      }
      .role-value {
        margin-top:8px;
        font-size:16px;
        line-height:1.45;
        font-weight:700;
        color:#111827;
      }
      .summary-card {
        margin-top:16px;
        padding:18px 20px;
        border-radius:22px;
        background:#111827;
        color:#ffffff;
      }
      .summary-label {
        font-size:11px;
        font-weight:800;
        letter-spacing:1.6px;
        text-transform:uppercase;
        color:#cbd5e1;
        margin-bottom:8px;
      }
      .summary-card p {
        font-size:13px;
        line-height:1.65;
        color:#e5e7eb;
      }
      .batteries-card { margin-top:24px; padding:22px 22px 10px; }
      .axis-grid {
        display:grid;
        grid-template-columns: 1fr 1fr;
        gap:16px 18px;
        margin-top:14px;
      }
      .axis-card {
        border:1px solid #eef2f7;
        border-radius:18px;
        background:#fbfcfe;
        padding:14px 14px 8px;
      }
      .axis-title {
        font-size:11px;
        line-height:1.2;
        font-weight:800;
        letter-spacing:1.7px;
        text-transform:uppercase;
        color:#6b7280;
        margin-bottom:10px;
      }
      .battery-row {
        display:grid;
        grid-template-columns: 22px 1fr 176px;
        gap:10px;
        align-items:center;
        margin-bottom:12px;
      }
      .battery-symbol {
        font-size:18px;
        line-height:1;
        text-align:center;
        font-weight:800;
      }
      .battery-name {
        font-size:13px;
        line-height:1.35;
        font-weight:700;
        color:#1f2937;
      }
      .scale { width:100%; }
      .scale-labels {
        display:flex;
        justify-content:space-between;
        margin-bottom:4px;
        font-size:9px;
        color:#94a3b8;
      }
      .scale-track {
        width:100%;
        height:10px;
        background:#d1d5db;
        border-radius:999px;
        overflow:hidden;
      }
      .scale-fill {
        height:100%;
        border-radius:999px;
      }
      .page-topline {
        display:flex;
        justify-content:space-between;
        align-items:flex-start;
        gap:20px;
        margin-bottom:18px;
      }
      .talent-card-shell {
        height:945px;
        border:1px solid #e5e7eb;
        border-radius:28px;
        overflow:hidden;
        box-shadow:0 10px 30px rgba(15, 23, 42, 0.06);
        background:#fff;
      }
      .talent-hero {
        padding:26px 30px 22px;
        border-bottom:1px solid #e5e7eb;
      }
      .talent-hero-grid {
        display:grid;
        grid-template-columns: 86px 1fr 118px;
        gap:18px;
        align-items:center;
      }
      .hero-badge {
        width:86px;
        height:86px;
        border-radius:24px;
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:42px;
        line-height:1;
        font-weight:800;
      }
      .talent-title {
        font-size:28px;
        line-height:1.08;
        font-weight:800;
        color:#111827;
      }
      .talent-eje {
        margin-top:8px;
        font-size:11px;
        line-height:1.45;
        font-weight:700;
        letter-spacing:1.2px;
        text-transform:uppercase;
      }
      .score-box {
        border:1px solid #e5e7eb;
        border-radius:20px;
        background:#ffffff;
        padding:14px 16px;
        text-align:center;
      }
      .score-number {
        margin-top:6px;
        font-size:42px;
        line-height:1;
        font-weight:800;
      }
      .battery-strip {
        margin-top:20px;
        border:1px solid #e5e7eb;
        border-radius:20px;
        background:#ffffff;
        padding:14px 16px;
      }
      .battery-strip-meta {
        display:flex;
        align-items:center;
        gap:10px;
        margin-bottom:8px;
      }
      .battery-strip-symbol {
        font-size:20px;
        line-height:1;
        font-weight:800;
      }
      .battery-strip-text {
        font-size:15px;
        line-height:1.35;
        font-weight:700;
        color:#111827;
      }
      .detail-grid {
        display:grid;
        grid-template-columns: 1.28fr 0.9fr;
        gap:20px;
        padding:22px 24px 24px;
      }
      .content-card {
        border:1px solid #eef2f7;
        border-radius:20px;
        background:#fbfcfe;
        padding:18px 18px 16px;
        margin-bottom:16px;
      }
      .content-card:last-child { margin-bottom:0; }
      .body-text {
        margin-top:10px;
        font-size:14px;
        line-height:1.68;
        color:#374151;
      }
      .role-card-side {
        border-left:6px solid #d1d5db;
      }
      .role-side-title {
        margin-top:10px;
        font-size:18px;
        line-height:1.4;
        font-weight:800;
        color:#111827;
      }
      .soft-inline {
        margin-top:12px;
        font-size:13px;
        line-height:1.6;
        color:#4b5563;
      }
      .final-card { padding:26px; }
      .final-title {
        margin-top:12px;
        font-size:28px;
        line-height:1.12;
        font-weight:800;
        color:#111827;
      }
      .final-text { margin-top:10px; max-width:560px; }
      .soft-table {
        width:100%;
        border-collapse:collapse;
        margin-top:22px;
      }
      .soft-table th,
      .soft-table td {
        padding:15px 14px;
        border-bottom:1px solid #e5e7eb;
        font-size:14px;
        line-height:1.4;
      }
      .soft-table th {
        font-size:12px;
        font-weight:800;
        letter-spacing:1.2px;
        text-transform:uppercase;
        color:#6b7280;
        text-align:left;
      }
      .center-cell { text-align:center; color:#94a3b8; }
      .table-battery {
        display:flex;
        align-items:center;
        gap:10px;
        font-weight:700;
        color:#111827;
      }
      .table-symbol {
        font-size:18px;
        font-weight:800;
        line-height:1;
      }
      .x-mark { font-weight:800; }
      .empty-soft {
        text-align:center;
        color:#6b7280;
        padding:30px 14px !important;
      }
    </style>
  </head><body>
    <div class="report-root">${cover}${detailPages}${finalPage}</div>
  </body></html>`;
}

function runHtml2Pdf(
  htmlContent: string,
  fileName: string,
  pageFormat: [number, number],
  zip?: JSZip,
  orientation: "landscape" | "portrait" = "landscape"
): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") { resolve(); return; }
    const html2pdf = (window as unknown as { html2pdf?: Html2PdfFn }).html2pdf;
    if (!html2pdf) { if (!zip) window.print(); resolve(); return; }

    const container = document.createElement("div");
    container.style.cssText = `position:fixed;top:-9999px;left:-9999px;width:${pageFormat[0]}px;background:#fff;`;
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
          html2canvas: {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: "#ffffff",
            windowWidth: pageFormat[0],
          },
          pagebreak: { mode: ["css", "legacy"] },
          jsPDF: { unit: "px", format: pageFormat, orientation },
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
    }, 500);
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
  return runHtml2Pdf(html, fileName, [1000, 707], zip, "landscape");
}

export function exportInformePDF(
  ranked: RankedTalent[],
  modelType: "genotipo" | "neurotalento",
  userName: string,
  summaryText?: string
): Promise<void> {
  const html     = generateInformeHTML(ranked, modelType, userName, summaryText);
  const fileName = `${userName ? userName.toLowerCase().replace(/\s+/g, "-") + "-" : ""}informe-${modelType}.pdf`;
  return runHtml2Pdf(html, fileName, [794, 1123], undefined, "portrait");
}

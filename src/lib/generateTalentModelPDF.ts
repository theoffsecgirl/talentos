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


function getSkillDescription(skill: string, modelType: "genotipo" | "neurotalento"): string {
  const descriptions: Record<string, string> = modelType === "genotipo"
    ? {
        "Creatividad": "Capacidad para generar ideas originales, soluciones nuevas y enfoques poco convencionales.",
        "Comunicación": "Facilidad para transmitir ideas, conectar con otras personas y expresar el pensamiento con claridad.",
        "Inteligencia emocional": "Lectura de las emociones propias y ajenas, empatía y regulación del vínculo interpersonal.",
        "Liderazgo": "Capacidad de influencia, guía y movilización de otras personas hacia objetivos concretos.",
      }
    : {
        "Pensamiento estratégico": "Visión de conjunto para anticipar escenarios, ordenar prioridades y orientar decisiones.",
        "Influencia": "Capacidad para movilizar a otras personas y generar adhesión a través del criterio y la presencia.",
        "Pensamiento creativo": "Generación de enfoques alternativos, soluciones originales y mirada innovadora.",
        "Comunicación empática": "Facilidad para comprender al otro, escuchar y comunicar desde el vínculo.",
        "Gestión emocional": "Capacidad para interpretar, contener y gestionar emociones en contextos complejos.",
        "Liderazgo pedagógico": "Capacidad para acompañar, enseñar y hacer crecer a otras personas desde la referencia.",
        "Escucha activa": "Presencia atenta, comprensión profunda y capacidad de acompañamiento desde la escucha.",
        "Influencia positiva": "Capacidad de orientar relaciones y decisiones desde una presencia constructiva.",
        "Pensamiento divergente": "Facilidad para explorar alternativas, conexiones no evidentes y soluciones no lineales.",
        "Comunicación": "Expresión clara de ideas y facilidad para transmitir sentido a otras personas.",
        "Liderazgo innovador": "Impulso para activar cambios, abrir caminos y liderar desde la novedad.",
      };

  return descriptions[skill] ?? "Competencia transversal identificada a partir de las baterías con mayor intensidad en el perfil.";
}

function chunkItems<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

function generateInformeHTML(
  ranked: RankedTalent[],
  modelType: "genotipo" | "neurotalento",
  userName: string,
  summaryText?: string
): string {
  const symMap = modelType === "genotipo" ? SYMBOLS_GENOTIPO : SYMBOLS_NEUROTALENTO;
  const softMap = modelType === "genotipo" ? SOFT_SKILLS_GENOTIPO : SOFT_SKILLS_NEUROTALENTO;
  const titulo = modelType === "genotipo" ? "INFORME DE TALENTOS" : "INFORME DE NEUROTALENTOS";
  const subtitulo = modelType === "genotipo" ? "Mapa e informe de baterías dominantes" : "Mapa e informe neurocognitivo";
  const fecha = new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" });

  const orderedEntries = ranked
    .map((rd) => {
      const key = ID_TO_KEY[rd.id];
      if (!key) return null;
      const pct = rd.max > 0 ? Math.round((rd.score / rd.max) * 100) : 0;
      const data = NEUROCOGNITIVE_DATA[key];
      return {
        id: rd.id,
        key,
        score: rd.score,
        max: rd.max,
        pct,
        color: INFORME_COLORS[key] ?? "#64748B",
        symbol: symMap[key] ?? "?",
        name: TALENT_NAMES[key] ?? rd.reportTitle ?? rd.quizTitle,
        title: rd.reportTitle ?? rd.quizTitle,
        data,
        softSkills: softMap[key] ?? [],
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
    .sort((a, b) => b.pct - a.pct || b.score - a.score);

  const dominant = orderedEntries[0];
  const coverWheel = generateWheelSVG(ranked, modelType)
    .replace('width="560" height="560"', 'width="430" height="430"');

  const topBatteries = orderedEntries.slice(0, 4).map((entry, index) => `
    <div class="top-battery-row">
      <div class="top-battery-rank">0${index + 1}</div>
      <div class="top-battery-main">
        <div class="top-battery-title"><span class="symbol-chip" style="background:${hex2rgba(entry.color, 0.16)};color:${entry.color};">${entry.symbol}</span>${entry.name}</div>
        <div class="top-battery-axis">${entry.data.eje}</div>
      </div>
      <div class="top-battery-score">
        <strong>${entry.score}</strong>
        <span>${entry.pct}%</span>
      </div>
    </div>
  `).join("");

  const portadaResumen = summaryText?.trim()
    ? `
      <div class="cover-note">
        <div class="section-label">Resumen de orientación</div>
        <p>${summaryText}</p>
      </div>`
    : "";

  const cover = `
    <section class="pagina cover-page">
      <div class="cover-header">
        <div>
          <div class="eyebrow">${titulo}</div>
          <h1>${userName}</h1>
          <div class="cover-subtitle">${subtitulo}</div>
        </div>
        <div class="cover-date">${fecha}</div>
      </div>

      <div class="cover-grid">
        <div class="map-panel card">
          <div class="section-label">Mapa correspondiente al modelo exportado</div>
          <div class="map-wrapper">${coverWheel}</div>
          <div class="map-footnote">Representación visual de las ocho baterías del modelo ${modelType === "genotipo" ? "Talentos" : "Neurotalentos"}.</div>
        </div>

        <div class="summary-panel">
          <div class="card dominant-card" style="border-top: 6px solid ${dominant?.color ?? "#0F172A"};">
            <div class="section-label">Perfil dominante</div>
            <div class="dominant-title">${dominant?.name ?? "—"}</div>
            <div class="dominant-axis">${dominant?.data.eje ?? ""}</div>
            <div class="dominant-score-row">
              <div>
                <div class="score-hero">${dominant?.score ?? 0}</div>
                <div class="score-caption">Batería ${dominant?.max ?? 15}</div>
              </div>
              <div class="score-meta">
                <div class="score-percent">${dominant?.pct ?? 0}%</div>
                <div class="score-role">${dominant?.data.rol ?? ""}</div>
              </div>
            </div>
            <div class="progress-track"><div class="progress-fill" style="width:${dominant?.pct ?? 0}%;background:${dominant?.color ?? "#0F172A"};"></div></div>
          </div>

          <div class="card ranking-card">
            <div class="section-label">Baterías más altas</div>
            ${topBatteries}
          </div>

          ${portadaResumen}
        </div>
      </div>
    </section>`;

  const talentPages = orderedEntries.map((entry, index) => {
    const activeLocalSkills = entry.softSkills.filter(() => entry.pct > 67);
    const skillChips = activeLocalSkills.length > 0
      ? activeLocalSkills.map((skill) => `<span class="skill-chip" style="background:${hex2rgba(entry.color, 0.12)};color:${entry.color};border-color:${hex2rgba(entry.color, 0.28)};">${skill}</span>`).join("")
      : `<span class="skill-empty">No supera el umbral del 67% para activar soft skills asociadas.</span>`;

    const ambitos = entry.data.ambitos.map((ambito) => `<li>${ambito}</li>`).join("");
    const bullets = (entry.data.perfilPuntos ?? []).map((point) => `<li>${point}</li>`).join("");

    return `
      <section class="pagina detail-page">
        <div class="detail-shell card">
          <aside class="talent-sidebar" style="background:${hex2rgba(entry.color, 0.08)};border-right:1px solid ${hex2rgba(entry.color, 0.18)};">
            <div>
              <div class="sidebar-symbol" style="background:${hex2rgba(entry.color, 0.12)};color:${entry.color};border-color:${hex2rgba(entry.color, 0.25)};">${entry.symbol}</div>
              <div class="section-label">Batería</div>
              <h2 class="talent-name">${entry.name}</h2>
              <div class="talent-axis">${entry.data.eje}</div>
            </div>

            <div class="score-card" style="border-color:${hex2rgba(entry.color, 0.2)};">
              <div class="section-label">Puntuación</div>
              <div class="score-number" style="color:${entry.color};">${entry.score}</div>
              <div class="score-battery">Batería ${entry.max}</div>
              <div class="progress-track"><div class="progress-fill" style="width:${entry.pct}%;background:${entry.color};"></div></div>
              <div class="score-percent-inline">${entry.pct}%</div>
            </div>

            <div>
              <div class="section-label">Soft skills asociadas</div>
              <div class="skills-block">${skillChips}</div>
            </div>
          </aside>

          <main class="talent-content">
            <div class="text-card">
              <div class="section-label">Resumen neurocognitivo</div>
              <p class="lead">${entry.data.resumen}</p>
              <div class="quote-box" style="border-left-color:${entry.color};">
                ${entry.data.detalle}
              </div>
            </div>

            <div class="detail-grid">
              <div class="text-card compact">
                <div class="section-label">Indicadores del perfil</div>
                <ul class="bullet-list">${bullets}</ul>
              </div>
              <div class="text-card compact">
                <div class="section-label">Ámbitos profesionales</div>
                <ul class="bullet-list">${ambitos}</ul>
                <div class="role-box" style="background:${hex2rgba(entry.color, 0.08)};border-color:${hex2rgba(entry.color, 0.18)};">
                  <div class="role-label">Rol sugerido</div>
                  <div class="role-value" style="color:${entry.color};">${entry.data.rol}</div>
                </div>
              </div>
            </div>
          </main>

          <div class="page-counter">${index + 2} / ${orderedEntries.length + 2}</div>
        </div>
      </section>`;
  }).join("");

  const activeTalents = orderedEntries.filter((entry) => entry.pct > 67);
  const allSkills = Array.from(new Set(Object.values(softMap).flat()));
  const activeSkills = allSkills.filter((skill) => activeTalents.some((entry) => entry.softSkills.includes(skill)));

  const skillColumns = activeSkills.map((skill) => `<th>${skill}</th>`).join("");
  const matrixRows = activeTalents.map((entry) => {
    const cells = activeSkills.map((skill) => {
      const hasSkill = entry.softSkills.includes(skill);
      return `<td class="matrix-mark ${hasSkill ? "is-active" : ""}" style="color:${hasSkill ? entry.color : "#CBD5E1"};">${hasSkill ? "×" : "—"}</td>`;
    }).join("");

    return `
      <tr>
        <td class="matrix-battery-cell">
          <div class="matrix-battery-title"><span class="symbol-chip" style="background:${hex2rgba(entry.color, 0.16)};color:${entry.color};">${entry.symbol}</span>${entry.name}</div>
          <div class="matrix-battery-meta">${entry.score} · ${entry.pct}%</div>
        </td>
        ${cells}
      </tr>`;
  }).join("");

  const skillCards = activeSkills.map((skill) => {
    const owners = activeTalents.filter((entry) => entry.softSkills.includes(skill));
    const ownerChips = owners.map((entry) => `<span class="skill-chip" style="background:${hex2rgba(entry.color, 0.12)};color:${entry.color};border-color:${hex2rgba(entry.color, 0.28)};">${entry.symbol} ${entry.name}</span>`).join("");
    return `
      <div class="skill-summary-card card">
        <div class="skill-summary-title">${skill}</div>
        <p>${getSkillDescription(skill, modelType)}</p>
        <div class="skill-summary-owners">${ownerChips}</div>
      </div>`;
  }).join("");

  const softSkillsPage = `
    <section class="pagina softskills-page">
      <div class="softskills-shell card">
        <div class="softskills-header">
          <div>
            <div class="eyebrow">SOFT SKILLS DESTACADAS</div>
            <h2>Cuadro final de competencias activas</h2>
            <p>Solo se muestran las soft skills activadas por baterías que superan el 67%.</p>
          </div>
          <div class="softskills-badge">${activeTalents.length} baterías activas</div>
        </div>

        ${activeSkills.length > 0 ? `
          <div class="matrix-card">
            <table class="softskills-matrix">
              <thead>
                <tr>
                  <th>Batería</th>
                  ${skillColumns}
                </tr>
              </thead>
              <tbody>
                ${matrixRows}
              </tbody>
            </table>
          </div>

          <div class="skill-summary-grid">
            ${skillCards}
          </div>` : `
          <div class="empty-softskills">
            Ninguna batería supera actualmente el umbral del 67%, por lo que no se muestran soft skills activas en este informe.
          </div>`}
      </div>
    </section>`;

  return `<!DOCTYPE html>
  <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <style>
        * { box-sizing: border-box; }
        body {
          margin: 0;
          font-family: Arial, Helvetica, sans-serif;
          color: #0F172A;
          background: #E9EEF5;
        }
        .pagina {
          width: 841px;
          height: 595px;
          position: relative;
          overflow: hidden;
          page-break-after: always;
          padding: 22px;
          background: linear-gradient(180deg, #F7FAFC 0%, #EEF3F8 100%);
        }
        .pagina:last-child { page-break-after: auto; }
        .card {
          background: rgba(255,255,255,0.92);
          border: 1px solid #DCE5F0;
          border-radius: 24px;
          box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
        }
        .eyebrow {
          font-size: 10px;
          letter-spacing: 2px;
          font-weight: 700;
          color: #64748B;
          text-transform: uppercase;
        }
        .section-label {
          font-size: 10px;
          letter-spacing: 1.4px;
          font-weight: 700;
          color: #64748B;
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .cover-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 18px;
          padding: 4px 4px 0;
        }
        .cover-header h1 {
          margin: 6px 0 4px;
          font-size: 32px;
          line-height: 1.05;
          color: #0F172A;
        }
        .cover-subtitle,
        .cover-date {
          color: #64748B;
          font-size: 14px;
        }
        .cover-grid {
          display: grid;
          grid-template-columns: 1.12fr 0.88fr;
          gap: 18px;
          height: calc(100% - 92px);
        }
        .map-panel {
          padding: 22px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .map-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 1;
        }
        .map-footnote {
          color: #64748B;
          font-size: 12px;
          line-height: 1.5;
        }
        .summary-panel {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .dominant-card,
        .ranking-card,
        .cover-note {
          padding: 18px 20px;
        }
        .dominant-title {
          font-size: 22px;
          line-height: 1.15;
          font-weight: 700;
          margin-bottom: 6px;
        }
        .dominant-axis {
          color: #475569;
          font-size: 12px;
          line-height: 1.45;
          min-height: 34px;
        }
        .dominant-score-row {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          align-items: flex-end;
          margin: 14px 0 12px;
        }
        .score-hero {
          font-size: 48px;
          line-height: 0.95;
          font-weight: 700;
          color: #0F172A;
        }
        .score-caption,
        .score-role,
        .top-battery-axis,
        .cover-note p,
        .lead,
        .quote-box,
        .bullet-list,
        .softskills-header p,
        .skill-summary-card p,
        .empty-softskills {
          color: #475569;
        }
        .score-caption { font-size: 13px; }
        .score-meta { text-align: right; }
        .score-percent {
          font-size: 24px;
          font-weight: 700;
          color: #0F172A;
        }
        .score-role {
          font-size: 12px;
          line-height: 1.4;
          max-width: 180px;
        }
        .progress-track {
          width: 100%;
          height: 10px;
          background: #E2E8F0;
          border-radius: 999px;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          border-radius: 999px;
        }
        .top-battery-row {
          display: grid;
          grid-template-columns: 36px 1fr auto;
          gap: 10px;
          align-items: center;
          padding: 10px 0;
          border-top: 1px solid #E5EDF5;
        }
        .top-battery-row:first-of-type { border-top: none; padding-top: 2px; }
        .top-battery-rank {
          width: 30px;
          height: 30px;
          border-radius: 999px;
          background: #EFF4FA;
          border: 1px solid #D8E3EF;
          color: #334155;
          font-size: 12px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .top-battery-title,
        .matrix-battery-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 700;
          color: #0F172A;
          line-height: 1.3;
        }
        .top-battery-score {
          text-align: right;
          min-width: 64px;
        }
        .top-battery-score strong {
          display: block;
          font-size: 18px;
          color: #0F172A;
        }
        .top-battery-score span,
        .matrix-battery-meta {
          font-size: 12px;
          color: #64748B;
        }
        .symbol-chip {
          width: 30px;
          height: 30px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 16px;
          flex-shrink: 0;
        }
        .detail-shell {
          display: grid;
          grid-template-columns: 245px 1fr;
          height: 100%;
          overflow: hidden;
        }
        .talent-sidebar {
          padding: 24px 20px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .sidebar-symbol {
          width: 70px;
          height: 70px;
          border-radius: 22px;
          border: 1px solid;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 34px;
          font-weight: 700;
          margin-bottom: 14px;
        }
        .talent-name {
          margin: 0 0 8px;
          font-size: 24px;
          line-height: 1.08;
          color: #0F172A;
        }
        .talent-axis {
          font-size: 12px;
          line-height: 1.45;
          color: #475569;
        }
        .score-card {
          margin: 18px 0;
          padding: 14px;
          border-radius: 18px;
          border: 1px solid;
          background: rgba(255,255,255,0.68);
        }
        .score-number {
          font-size: 54px;
          line-height: 0.95;
          font-weight: 700;
          margin: 4px 0 6px;
        }
        .score-battery,
        .score-percent-inline {
          font-size: 13px;
          color: #475569;
        }
        .score-percent-inline {
          margin-top: 8px;
          font-weight: 700;
        }
        .skills-block {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .skill-chip {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 28px;
          padding: 6px 10px;
          border: 1px solid;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 700;
          line-height: 1.2;
        }
        .skill-empty {
          display: block;
          font-size: 12px;
          line-height: 1.5;
          color: #64748B;
        }
        .talent-content {
          padding: 24px;
          display: grid;
          grid-template-rows: auto 1fr;
          gap: 16px;
        }
        .text-card {
          background: rgba(255,255,255,0.72);
          border: 1px solid #E2E8F0;
          border-radius: 20px;
          padding: 18px 20px;
        }
        .lead {
          font-size: 14px;
          line-height: 1.62;
          margin: 0;
        }
        .quote-box {
          margin-top: 14px;
          padding: 14px 16px;
          border-left: 4px solid;
          background: #F8FBFE;
          border-radius: 14px;
          font-size: 12px;
          line-height: 1.62;
        }
        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .text-card.compact {
          padding: 16px 18px;
        }
        .bullet-list {
          margin: 0;
          padding-left: 18px;
          font-size: 12px;
          line-height: 1.58;
        }
        .bullet-list li + li {
          margin-top: 5px;
        }
        .role-box {
          margin-top: 16px;
          padding: 12px 14px;
          border: 1px solid;
          border-radius: 16px;
        }
        .role-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.2px;
          text-transform: uppercase;
          color: #64748B;
          margin-bottom: 5px;
        }
        .role-value {
          font-size: 13px;
          font-weight: 700;
          line-height: 1.45;
        }
        .page-counter {
          position: absolute;
          right: 24px;
          bottom: 20px;
          font-size: 11px;
          color: #94A3B8;
          font-weight: 700;
        }
        .softskills-shell {
          height: 100%;
          padding: 22px;
          display: flex;
          flex-direction: column;
        }
        .softskills-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 16px;
        }
        .softskills-header h2 {
          margin: 6px 0 8px;
          font-size: 28px;
          line-height: 1.1;
          color: #0F172A;
        }
        .softskills-header p {
          margin: 0;
          font-size: 13px;
          line-height: 1.5;
        }
        .softskills-badge {
          padding: 10px 14px;
          border-radius: 999px;
          background: #EFF4FA;
          border: 1px solid #D8E3EF;
          color: #334155;
          font-size: 12px;
          font-weight: 700;
          white-space: nowrap;
        }
        .matrix-card {
          border: 1px solid #E2E8F0;
          border-radius: 20px;
          overflow: hidden;
          background: rgba(248, 250, 252, 0.95);
          margin-bottom: 16px;
        }
        .softskills-matrix {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
        }
        .softskills-matrix thead th {
          background: #F1F5F9;
          color: #475569;
          text-align: left;
          padding: 12px 14px;
          border-bottom: 1px solid #E2E8F0;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.9px;
        }
        .softskills-matrix tbody td {
          padding: 12px 14px;
          border-top: 1px solid #E2E8F0;
          vertical-align: middle;
        }
        .matrix-battery-cell {
          min-width: 210px;
        }
        .matrix-mark {
          text-align: center;
          font-size: 18px;
          font-weight: 700;
        }
        .matrix-mark.is-active {
          background: rgba(15, 23, 42, 0.03);
        }
        .skill-summary-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-top: auto;
        }
        .skill-summary-card {
          padding: 16px 18px;
        }
        .skill-summary-title {
          font-size: 16px;
          font-weight: 700;
          color: #0F172A;
          margin-bottom: 8px;
        }
        .skill-summary-card p {
          margin: 0 0 12px;
          font-size: 12px;
          line-height: 1.55;
        }
        .skill-summary-owners {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .empty-softskills {
          height: 100%;
          border: 1px dashed #CBD5E1;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 30px;
          font-size: 14px;
          line-height: 1.6;
          background: rgba(248, 250, 252, 0.9);
        }
      </style>
    </head>
    <body>
      ${cover}
      ${talentPages}
      ${softSkillsPage}
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
  return runHtml2Pdf(html, fileName, [841, 595], undefined);
}

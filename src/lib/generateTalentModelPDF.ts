import { TALENTS } from "@/lib/talents";
import {
  TALENT_COLORS as INFORME_COLORS,
  SYMBOLS_GENOTIPO,
  SYMBOLS_NEUROTALENTO,
  SOFT_SKILLS_GENOTIPO,
  TALENT_NAMES,
  NEUROCOGNITIVE_DATA,
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
  4: "□",
  1: "△",
  6: "⬯",
  7: "◇",
  8: "▭",
  5: "○",
  2: "⬠",
  3: "∞",
};

const NEUROTALENTO_SYMBOLS: Record<number, string> = {
  4: "Α",
  1: "Δ",
  6: "Φ",
  7: "Θ",
  8: "Μ",
  5: "Ω",
  2: "Π",
  3: "Ψ",
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
  { name: "ACCIÓN Y RESULTADOS", talents: [4, 1] },
  { name: "IMAGINACIÓN Y ARTE", talents: [6, 7] },
  { name: "DESTREZA Y PROYECCIÓN", talents: [8, 5] },
  { name: "SABER Y CONOCIMIENTO", talents: [2, 3] },
];

const REPORT_SKILL_COLUMNS = [
  "Creatividad",
  "Comunicación",
  "Inteligencia emocional",
  "Liderazgo",
] as const;

function toSafeNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  return fallback;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function percentageOf(score: number, max: number): number {
  return max > 0 ? Math.round((score / max) * 100) : 0;
}

function polarToCartesian(cx: number, cy: number, angle: number, r: number) {
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
}

function createArcPath(
  cx: number,
  cy: number,
  startAngle: number,
  endAngle: number,
  outerR: number,
  innerR: number,
): string {
  const start = polarToCartesian(cx, cy, startAngle, outerR);
  const end = polarToCartesian(cx, cy, endAngle, outerR);
  const innerStart = polarToCartesian(cx, cy, startAngle, innerR);
  const innerEnd = polarToCartesian(cx, cy, endAngle, innerR);
  const laf = endAngle - startAngle > Math.PI ? 1 : 0;
  return [
    `M ${start.x} ${start.y}`,
    `A ${outerR} ${outerR} 0 ${laf} 1 ${end.x} ${end.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerR} ${innerR} 0 ${laf} 0 ${innerStart.x} ${innerStart.y}`,
    "Z",
  ].join(" ");
}

function generateWheelSVG(ranked: RankedTalent[], modelType: "genotipo" | "neurotalento"): string {
  const size = 560;
  const center = size / 2;
  const radius = 184;
  const innerRadius = 60;
  const symbolMap = modelType === "genotipo" ? GENOTIPO_SYMBOLS : NEUROTALENTO_SYMBOLS;

  const sections = TALENT_ORDER.map((talentId, index) => {
    const rd = ranked.find((r) => r.id === talentId);
    const color = TALENT_COLORS[talentId] ?? "#999";
    const score = toSafeNumber(rd?.score, 0);
    const max = toSafeNumber(rd?.max, 15);
    const percentage = percentageOf(score, max);
    const fillPct = percentage / 100;
    const fillRadius = innerRadius + (radius - innerRadius) * fillPct;
    const aps = (Math.PI * 2) / 8;
    const startAngle = index * aps - Math.PI / 2;
    const endAngle = startAngle + aps;
    const midAngle = (startAngle + endAngle) / 2;
    const percentPos = polarToCartesian(center, center, midAngle, (fillRadius + innerRadius) / 2);
    const labelPos = polarToCartesian(center, center, midAngle, radius + 46);
    const talent = TALENTS.find((t) => t.id === talentId);
    const fullTitle = talent?.reportTitle ?? "";
    const symbol = symbolMap[talentId] ?? "?";
    let line1 = fullTitle;
    let line2 = "";

    if (fullTitle.includes(" y ")) {
      const p = fullTitle.split(" y ");
      if (p.length === 2) {
        line1 = `${p[0]} y`;
        line2 = p[1];
      }
    } else if (fullTitle.includes(" e ")) {
      const p = fullTitle.split(" e ");
      if (p.length === 2) {
        line1 = `${p[0]} e`;
        line2 = p[1];
      }
    } else {
      const w = fullTitle.split(" ");
      const m = Math.ceil(w.length / 2);
      line1 = w.slice(0, m).join(" ");
      line2 = w.slice(m).join(" ");
    }

    return {
      talentId,
      color,
      percentage,
      fillRadius,
      fillPct,
      startAngle,
      endAngle,
      labelPos,
      percentPos,
      symbol,
      line1,
      line2,
    };
  });

  const defs = sections
    .map(
      (s) => `
    <radialGradient id="pdf-g-${s.talentId}" cx="50%" cy="50%">
      <stop offset="0%" stop-color="${s.color}" stop-opacity="${Math.min(s.fillPct * 1.2, 1)}"/>
      <stop offset="${s.fillPct * 100}%" stop-color="${s.color}" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="${s.color}" stop-opacity="0.1"/>
    </radialGradient>`,
    )
    .join("");

  const diagonals = [1, 3, 5, 7]
    .map((idx) => {
      const angle = (idx * Math.PI * 2) / 8 - Math.PI / 2;
      const outer = polarToCartesian(center, center, angle, radius);
      return `<line x1="${center}" y1="${center}" x2="${outer.x.toFixed(2)}" y2="${outer.y.toFixed(2)}" stroke="#666" stroke-width="1" stroke-dasharray="4 4"/>`;
    })
    .join("");

  const sectorSVG = sections
    .map((s) => {
      const fillPath = createArcPath(center, center, s.startAngle, s.endAngle, s.fillRadius, innerRadius);
      const outerPath = createArcPath(center, center, s.startAngle, s.endAngle, radius, innerRadius);
      const pctText =
        s.percentage > 15
          ? `<text x="${s.percentPos.x.toFixed(2)}" y="${s.percentPos.y.toFixed(2)}" text-anchor="middle" dominant-baseline="middle" font-size="13" font-weight="bold" fill="white">${s.percentage}</text>`
          : "";
      return `
      <path d="${fillPath}" fill="url(#pdf-g-${s.talentId})" stroke="${s.color}" stroke-width="1"/>
      <path d="${outerPath}" fill="none" stroke="${s.color}" stroke-width="2" opacity="0.3"/>
      ${pctText}
      <text x="${s.labelPos.x.toFixed(2)}" y="${(s.labelPos.y - 12).toFixed(2)}" text-anchor="middle" dominant-baseline="middle" font-size="14" font-weight="700" fill="#222">${escapeHtml(s.symbol)}</text>
      <text x="${s.labelPos.x.toFixed(2)}" y="${(s.labelPos.y + 4).toFixed(2)}" text-anchor="middle" dominant-baseline="middle" font-size="5.3" font-weight="600" fill="#333">${escapeHtml(s.line1)}</text>
      ${
        s.line2
          ? `<text x="${s.labelPos.x.toFixed(2)}" y="${(s.labelPos.y + 13).toFixed(2)}" text-anchor="middle" dominant-baseline="middle" font-size="5.3" font-weight="600" fill="#333">${escapeHtml(s.line2)}</text>`
          : ""
      }
    `;
    })
    .join("");

  const centerLine1 = "MAPA";
  const centerLine2 = modelType === "genotipo" ? "TALENTOS" : "NEUROTALENTOS";

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>${defs}</defs>
  <line x1="${center}" y1="${center - radius}" x2="${center}" y2="${center + radius}" stroke="#000" stroke-width="2"/>
  <line x1="${center - radius}" y1="${center}" x2="${center + radius}" y2="${center}" stroke="#000" stroke-width="2"/>
  ${diagonals}
  ${sectorSVG}
  <circle cx="${center}" cy="${center}" r="${innerRadius}" fill="white" stroke="#000" stroke-width="2"/>
  <text x="${center}" y="${center - 5}" text-anchor="middle" dominant-baseline="middle" font-size="8" font-weight="700" fill="#444">${centerLine1}</text>
  <text x="${center}" y="${center + 6}" text-anchor="middle" dominant-baseline="middle" font-size="8" font-weight="700" fill="#444">${centerLine2}</text>
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
  meta?: ExportProfileMeta,
): string {
  const symbolMap = modelType === "genotipo" ? GENOTIPO_SYMBOLS : NEUROTALENTO_SYMBOLS;
  const modelLabel = modelType === "genotipo" ? "Modelo Talentos" : "Modelo Neurotalentos";
  const winner = ranked[0];
  const winnerFull = TALENTS.find((t) => t.id === winner?.id);
  const svgContent = generateWheelSVG(ranked, modelType);

  const competencies = winnerFull?.competencies ?? [];
  const topRole = meta?.rolEscogido || meta?.rolPensado || winnerFull?.exampleRoles?.[0] || "";
  const profileTitle = winner?.reportTitle ?? winner?.quizTitle ?? "—";

  const bulletItems = competencies
    .map(
      (c) => `
    <div style="display:flex;align-items:flex-start;gap:5px;margin-bottom:4px;">
      <span style="color:#CC0000;font-weight:bold;flex-shrink:0;font-size:9px;">&bull;</span>
      <span style="font-size:9px;color:#333;line-height:1.3;">${escapeHtml(c)}</span>
    </div>`,
    )
    .join("");

  const profileSection = `
    <div style="background:#f9f9f9;border:1px solid #ddd;border-radius:6px;padding:12px;margin-bottom:12px;">
      <div style="font-size:7px;font-weight:700;color:#888;letter-spacing:1px;margin-bottom:5px;">PERFIL PROFESIONAL</div>
      <div style="font-size:12px;font-weight:700;color:#111;margin-bottom:8px;text-transform:uppercase;">${escapeHtml(profileTitle)}</div>
      ${bulletItems}
      <div style="margin-top:8px;border:2px solid #CC0000;border-radius:5px;padding:6px;background:#fff3f3;">
        <div style="font-size:7px;font-weight:700;color:#CC0000;letter-spacing:0.5px;margin-bottom:2px;">ROL SUGERIDO</div>
        <div style="font-size:9px;color:#333;line-height:1.35;">${escapeHtml(topRole || "No indicado")}</div>
      </div>
    </div>`;

  const talentListRows = AXIS_GROUPS.map((group) => {
    const rows = group.talents
      .map((talentId) => {
        const rd = ranked.find((r) => r.id === talentId);
        const pct = rd && rd.max > 0 ? percentageOf(rd.score, rd.max) : 0;
        const sym = symbolMap[talentId] ?? "?";
        const nam = rd?.reportTitle ?? "";
        const bar = generateBatteryBar(pct);
        return `<div style="display:flex;align-items:flex-start;gap:6px;margin-bottom:6px;">
        <div style="font-size:10px;font-weight:700;color:#222;width:14px;text-align:center;flex-shrink:0;line-height:1.2;">${escapeHtml(sym)}</div>
        <div style="font-size:7px;font-weight:600;color:#333;width:110px;flex-shrink:0;line-height:1.25;word-break:break-word;">${pct} - ${escapeHtml(nam)}</div>
        <div style="flex:1;min-width:0;">${bar}</div>
      </div>`;
      })
      .join("");
    return `<div style="margin-bottom:8px;">
      <div style="font-size:7px;font-weight:700;color:#555;letter-spacing:0.5px;border-bottom:1px solid #ddd;padding-bottom:2px;margin-bottom:4px;">${group.name}</div>
      ${rows}
    </div>`;
  }).join("");

  const summaryBanner = summaryText?.trim()
    ? `<div style="width:100%;max-width:560px;margin:8px auto 0;padding:8px 16px;background:#000;color:#fff;border-radius:40px;font-size:7px;line-height:1.4;text-align:center;">${escapeHtml(summaryText)}</div>`
    : "";

  return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/>
  <style>* { box-sizing:border-box; margin:0; padding:0; } body { font-family:Arial,sans-serif; background:#fff; color:#111; }</style>
</head><body>
  <div style="width:1000px;padding:25px;">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;border-bottom:2px solid #111;padding-bottom:8px;">
      <div>
        <div style="font-size:16px;font-weight:700;">MAPA DE ${modelType === "genotipo" ? "TALENTOS" : "NEUROTALENTOS"}</div>
        <div style="font-size:10px;color:#555;">${escapeHtml(userName ? userName + " — " : "")}${modelLabel}</div>
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

function groupIntoPages<T>(items: T[], size: number): T[][] {
  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    pages.push(items.slice(i, i + size));
  }
  return pages;
}

function renderScoreBox(points: number, percentage: number, color: string): string {
  return `<div style="width:120px;border:1px solid #e5e7eb;border-radius:14px;padding:14px 12px;text-align:center;background:#fff;">
    <div style="font-size:11px;font-weight:700;color:#6b7280;letter-spacing:0.04em;">Puntuación</div>
    <div style="font-size:42px;line-height:1;font-weight:800;color:${color};margin-top:8px;">${points}</div>
    <div style="font-size:12px;color:#6b7280;margin-top:6px;">Batería 15</div>
    <div style="font-size:14px;font-weight:700;color:#111827;margin-top:6px;">${percentage}%</div>
  </div>`;
}

function generateSoftSkillsPage(
  ranked: RankedTalent[],
  symbolMap: Record<number, string>,
): string {
  const activeRows = ranked
    .map((rd) => {
      const key = ID_TO_KEY[rd.id];
      const percentage = percentageOf(rd.score, rd.max);
      return {
        rd,
        key,
        percentage,
        title: TALENT_NAMES[key] ?? rd.reportTitle ?? rd.quizTitle,
        skills: SOFT_SKILLS_GENOTIPO[key] ?? [],
        symbol: symbolMap[rd.id] ?? "?",
      };
    })
    .filter((row) => row.percentage > 67)
    .sort((a, b) => b.percentage - a.percentage);

  const visibleSkills = REPORT_SKILL_COLUMNS.filter((skill) => activeRows.some((row) => row.skills.includes(skill)));

  const summaryChips = visibleSkills.length
    ? visibleSkills
        .map(
          (skill) => `<span style="display:inline-block;border:1px solid #d1d5db;border-radius:999px;padding:8px 12px;margin:0 8px 8px 0;font-size:12px;font-weight:600;color:#111827;background:#f9fafb;">${skill}</span>`,
        )
        .join("")
    : '<div style="font-size:14px;color:#6b7280;">No hay soft skills con baterías por encima del 67%.</div>';

  const rowsHtml = activeRows.length
    ? activeRows
        .map((row) => {
          const cells = REPORT_SKILL_COLUMNS.map((skill) => {
            const mark = row.skills.includes(skill) ? "X" : "";
            return `<td style="padding:12px 10px;border:1px solid #d1d5db;text-align:center;font-size:15px;font-weight:700;color:${mark ? "#111827" : "#9ca3af"};">${mark}</td>`;
          }).join("");
          return `<tr>
            <td style="padding:12px 10px;border:1px solid #d1d5db;font-size:14px;font-weight:700;color:#111827;width:58px;text-align:center;">${escapeHtml(row.symbol)}</td>
            <td style="padding:12px 14px;border:1px solid #d1d5db;font-size:13px;color:#374151;font-weight:600;">${escapeHtml(row.title)}</td>
            ${cells}
          </tr>`;
        })
        .join("")
    : `<tr><td colspan="6" style="padding:22px;border:1px solid #d1d5db;text-align:center;color:#6b7280;font-size:14px;">No hay baterías activas con porcentaje superior al 67%.</td></tr>`;

  return `
  <section class="page">
    <div class="page-inner">
      <div class="header-band">
        <div>
          <div class="eyebrow">Cierre del informe</div>
          <h1 class="report-title">Soft skills activas</h1>
        </div>
      </div>

      <div class="intro-card" style="margin-bottom:18px;">
        <p>Se muestran únicamente las soft skills asociadas a las baterías que superan el 67%.</p>
      </div>

      <div style="margin-bottom:20px;">${summaryChips}</div>

      <div class="matrix-wrap">
        <table class="matrix-table">
          <thead>
            <tr>
              <th style="width:58px;">Símbolo</th>
              <th style="text-align:left;">Batería</th>
              <th>Creatividad</th>
              <th>Comunicación</th>
              <th>Inteligencia emocional</th>
              <th>Liderazgo</th>
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
  summaryText?: string,
  meta?: ExportProfileMeta,
): string {
  const symbolMap = modelType === "genotipo" ? GENOTIPO_SYMBOLS : NEUROTALENTO_SYMBOLS;
  const modelLabel = modelType === "genotipo" ? "TALENTOS" : "NEUROTALENTOS";
  const modelSubtitle = modelType === "genotipo" ? "Mapa e informe de baterías dominantes" : "Mapa e informe neurocognitivo";
  const today = new Date().toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const sorted = [...ranked].sort((a, b) => {
    const pa = percentageOf(a.score, a.max);
    const pb = percentageOf(b.score, b.max);
    return pb - pa;
  });

  const winner = sorted[0];
  const winnerKey = winner ? ID_TO_KEY[winner.id] : "acompanamiento";
  const winnerColor = INFORME_COLORS[winnerKey] ?? "#7B2D8B";
  const winnerTalent = TALENTS.find((t) => t.id === winner?.id);
  const winnerPct = winner ? percentageOf(winner.score, winner.max) : 0;
  const winnerPoints = winner ? Math.round(winner.score) : 0;
  const mapSvg = generateWheelSVG(sorted, modelType);

  const topCompetencies = (winnerTalent?.competencies ?? []).slice(0, 4);
  const topRole = meta?.rolEscogido || meta?.rolPensado || winnerTalent?.exampleRoles?.[0] || winner?.exampleRoles?.[0] || "No indicado";

  const groupedBars = AXIS_GROUPS.map((group) => {
    const rows = group.talents
      .map((talentId) => {
        const rd = sorted.find((item) => item.id === talentId);
        const pct = rd ? percentageOf(rd.score, rd.max) : 0;
        const name = rd?.reportTitle ?? rd?.quizTitle ?? "";
        const symbol = symbolMap[talentId] ?? "?";
        const barColor = pct > 67 ? "#dc2626" : "#111827";
        return `<div class="cover-bar-row">
          <div class="cover-bar-label"><span class="cover-symbol">${escapeHtml(symbol)}</span><span>${pct} - ${escapeHtml(name)}</span></div>
          <div class="cover-bar-scale"><span>0</span><span>60</span><span>100</span></div>
          <div class="cover-bar-track"><div class="cover-bar-fill" style="width:${pct}%;background:${barColor};"></div></div>
        </div>`;
      })
      .join("");

    return `<div class="cover-axis-group">
      <div class="cover-axis-title">${group.name}</div>
      ${rows}
    </div>`;
  }).join("");

  const coverSummary = summaryText?.trim()
    ? `<div class="intro-card" style="margin-top:14px;"><strong>Observación:</strong> ${escapeHtml(summaryText)}</div>`
    : "";

  const coverPage = `
  <section class="page">
    <div class="page-inner cover-page">
      <div class="top-meta">
        <div>
          <h1 class="cover-title">INFORME DE ${modelLabel}</h1>
          <div class="cover-user">${escapeHtml(userName)}</div>
          <div class="cover-subtitle">${modelSubtitle}</div>
          <div class="cover-date">${today}</div>
          <div class="cover-note">Mapa correspondiente al modelo exportado</div>
        </div>
        <div class="cover-tag">Basado en neurociencia aplicada</div>
      </div>

      <div class="cover-layout">
        <div class="cover-map-card">
          <div class="cover-map-inner">${mapSvg}</div>
          <div class="map-caption">Representación visual de las ocho baterías del modelo ${modelType === "genotipo" ? "Talentos" : "Neurotalentos"}.</div>
        </div>

        <div class="cover-side">
          <div class="profile-card">
            <div class="eyebrow">Perfil dominante</div>
            <h2 style="margin-bottom:8px;">${escapeHtml(winner?.reportTitle ?? winner?.quizTitle ?? "Sin resultado")}</h2>
            <div class="axis-line" style="color:${winnerColor};">${escapeHtml(NEUROCOGNITIVE_DATA[winnerKey]?.eje ?? "")}</div>
            <div style="margin-top:12px;">
              ${topCompetencies.map((item) => `<div class="bullet-line"><span class="bullet-dot">•</span><span>${escapeHtml(item)}</span></div>`).join("")}
            </div>
            <div class="role-box">
              <div class="role-label">Rol sugerido</div>
              <div class="role-value">${escapeHtml(topRole)}</div>
            </div>
            <div style="margin-top:14px;">${renderScoreBox(winnerPoints, winnerPct, winnerColor)}</div>
          </div>

          <div class="bars-card">
            ${groupedBars}
          </div>

          ${coverSummary}
        </div>
      </div>
    </div>
  </section>`;

  const detailPages = groupIntoPages(sorted, 2)
    .map((pageItems) => {
      const sections = pageItems
        .map((rd) => {
          const key = ID_TO_KEY[rd.id];
          const data = NEUROCOGNITIVE_DATA[key];
          const color = INFORME_COLORS[key] ?? "#7B2D8B";
          const symbol = symbolMap[rd.id] ?? "?";
          const title = TALENT_NAMES[key] ?? rd.reportTitle ?? rd.quizTitle;
          const percentage = percentageOf(rd.score, rd.max);
          const points = Math.round(rd.score);
          const ambitos = (data?.ambitos ?? []).map((item) => `<li>${escapeHtml(item)}</li>`).join("");
          const role = meta?.rolEscogido && rd.id === winner?.id ? meta.rolEscogido : data?.rol || rd.exampleRoles?.[0] || "No indicado";

          return `
          <article class="detail-section">
            <div class="detail-head">
              <div>
                <div class="detail-symbol" style="color:${color};">${escapeHtml(symbol)}</div>
                <h2 class="detail-title">${escapeHtml(title)}</h2>
                <div class="axis-line" style="color:${color};">${escapeHtml(data?.eje ?? "")}</div>
              </div>
              ${renderScoreBox(points, percentage, color)}
            </div>

            <div class="section-block">
              <div class="section-title">Resumen neurocognitivo</div>
              <p class="paragraph">${escapeHtml(data?.resumen ?? rd.reportSummary ?? "")}</p>
              <ul class="detail-list">
                <li>${escapeHtml(data?.detalle ?? rd.reportSummary ?? "")}</li>
              </ul>
            </div>

            <div class="section-block">
              <div class="section-title">Ámbitos profesionales</div>
              <ul class="ambitos-list">${ambitos}</ul>
            </div>

            <div class="section-block">
              <div class="section-title">Batería y orientación</div>
              <div class="orientation-row">
                <div class="orientation-pill">${points} · Batería 15</div>
                <div class="orientation-pill muted-pill">${percentage}%</div>
                <div class="orientation-pill role-pill">${escapeHtml(role)}</div>
              </div>
            </div>
          </article>`;
        })
        .join("");

      return `<section class="page"><div class="page-inner detail-page">${sections}</div></section>`;
    })
    .join("");

  const softSkillsPage = generateSoftSkillsPage(sorted, symbolMap);

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(userName)} - Informe ${modelLabel}</title>
  <style>
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; color: #111827; background: #f3f4f6; }
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .page {
      width: 794px;
      min-height: 1123px;
      margin: 0 auto;
      background: #ffffff;
      page-break-after: always;
      break-after: page;
      overflow: hidden;
      position: relative;
    }
    .page:last-child { page-break-after: auto; break-after: auto; }
    .page-inner { padding: 48px 52px; }
    .cover-page { padding-top: 42px; }
    .top-meta { display: flex; justify-content: space-between; gap: 20px; align-items: flex-start; border-bottom: 4px solid #111827; padding-bottom: 14px; }
    .cover-title { font-size: 26px; line-height: 1.05; margin: 0; font-weight: 800; letter-spacing: -0.02em; }
    .cover-user { margin-top: 10px; font-size: 18px; font-weight: 700; }
    .cover-subtitle, .cover-date, .cover-note { margin-top: 6px; font-size: 14px; color: #4b5563; }
    .cover-tag { font-size: 14px; color: #6b7280; font-weight: 600; padding-top: 6px; }
    .cover-layout { display: flex; gap: 28px; margin-top: 24px; align-items: flex-start; }
    .cover-map-card { flex: 1 1 52%; }
    .cover-map-inner { border: 1px solid #e5e7eb; border-radius: 18px; padding: 18px 14px; background: #ffffff; display: flex; justify-content: center; }
    .cover-map-inner svg { width: 100%; max-width: 420px; height: auto; }
    .map-caption { margin-top: 12px; font-size: 13px; line-height: 1.45; color: #374151; border-top: 6px solid #7b2d8b; padding-top: 10px; }
    .cover-side { width: 43%; }
    .profile-card, .bars-card, .intro-card { border: 1px solid #d1d5db; border-radius: 14px; padding: 18px; background: #ffffff; }
    .bars-card { margin-top: 18px; }
    .eyebrow { font-size: 11px; font-weight: 800; color: #6b7280; text-transform: uppercase; letter-spacing: 0.16em; margin-bottom: 10px; }
    h2 { font-size: 16px; line-height: 1.2; margin: 0; font-weight: 800; }
    .axis-line { font-size: 12px; line-height: 1.35; font-weight: 700; text-transform: uppercase; }
    .bullet-line { display: flex; align-items: flex-start; gap: 8px; margin-top: 8px; font-size: 13px; line-height: 1.45; color: #374151; }
    .bullet-dot { color: #dc2626; font-weight: 800; }
    .role-box { margin-top: 16px; border: 2px solid #dc2626; border-radius: 12px; padding: 12px; background: #fff8f8; }
    .role-label { font-size: 11px; font-weight: 800; color: #b91c1c; text-transform: uppercase; letter-spacing: 0.12em; }
    .role-value { margin-top: 8px; font-size: 14px; line-height: 1.35; color: #374151; font-weight: 700; }
    .cover-axis-group + .cover-axis-group { margin-top: 14px; }
    .cover-axis-title { font-size: 12px; font-weight: 800; letter-spacing: 0.12em; color: #4b5563; text-transform: uppercase; margin-bottom: 8px; }
    .cover-bar-row + .cover-bar-row { margin-top: 10px; }
    .cover-bar-label { display: flex; align-items: flex-start; gap: 8px; font-size: 13px; font-weight: 700; color: #374151; line-height: 1.3; }
    .cover-symbol { width: 18px; text-align: center; color: #111827; }
    .cover-bar-scale { display: flex; justify-content: space-between; font-size: 10px; color: #9ca3af; margin: 4px 0 4px 26px; }
    .cover-bar-track { margin-left: 26px; height: 10px; background: #d1d5db; border-radius: 999px; overflow: hidden; }
    .cover-bar-fill { height: 100%; border-radius: 999px; }
    .detail-page { padding-top: 36px; }
    .detail-section { padding: 4px 0 24px; }
    .detail-section + .detail-section { border-top: 1px solid #e5e7eb; padding-top: 30px; }
    .detail-head { display: flex; justify-content: space-between; gap: 20px; align-items: flex-start; }
    .detail-symbol { font-size: 28px; line-height: 1; font-weight: 800; margin-bottom: 8px; }
    .detail-title { font-size: 22px; line-height: 1.15; margin: 0; font-weight: 800; }
    .section-block { margin-top: 20px; }
    .section-title { font-size: 16px; line-height: 1.2; margin-bottom: 8px; font-weight: 800; }
    .paragraph { font-size: 13px; line-height: 1.62; color: #6b7280; margin: 0; }
    .detail-list, .ambitos-list { margin: 12px 0 0 0; padding-left: 24px; }
    .detail-list li, .ambitos-list li { font-size: 14px; line-height: 1.72; color: #111827; margin-bottom: 6px; }
    .ambitos-list li { color: #6b7280; }
    .orientation-row { display: flex; flex-wrap: wrap; gap: 8px; }
    .orientation-pill { display: inline-flex; align-items: center; min-height: 34px; padding: 7px 12px; background: #111827; color: #ffffff; border-radius: 999px; font-size: 13px; font-weight: 700; }
    .muted-pill { background: #f3f4f6; color: #111827; }
    .role-pill { background: #fef2f2; color: #991b1b; }
    .matrix-wrap { border: 1px solid #d1d5db; border-radius: 16px; overflow: hidden; }
    .matrix-table { width: 100%; border-collapse: collapse; }
    .matrix-table thead th { padding: 14px 10px; background: #f3f4f6; border: 1px solid #d1d5db; font-size: 13px; text-transform: uppercase; letter-spacing: 0.04em; color: #374151; }
    .intro-card p { margin: 0; font-size: 14px; line-height: 1.6; color: #374151; }
  </style>
</head>
<body>
  ${coverPage}
  ${detailPages}
  ${softSkillsPage}
</body>
</html>`;
}

function runHtml2Pdf(
  htmlContent: string,
  fileName: string,
  pageFormat: [number, number],
  zip?: JSZip,
): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve();
      return;
    }

    const html2pdf = (window as unknown as { html2pdf?: Html2PdfFn }).html2pdf;
    if (!html2pdf) {
      if (!zip) window.print();
      resolve();
      return;
    }

    const container = document.createElement("div");
    container.style.cssText = `position:fixed;top:-9999px;left:-9999px;width:${pageFormat[0]}px;background:#fff;`;
    document.body.appendChild(container);

    const iframe = document.createElement("iframe");
    iframe.style.cssText = `width:${pageFormat[0]}px;height:${pageFormat[1]}px;border:none;background:#fff;`;
    container.appendChild(iframe);

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) {
      document.body.removeChild(container);
      resolve();
      return;
    }

    iframeDoc.open();
    iframeDoc.write(htmlContent);
    iframeDoc.close();

    setTimeout(() => {
      const target = iframeDoc.body as HTMLElement;
      const instance = html2pdf()
        .set({
          margin: 0,
          filename: fileName,
          image: { type: "jpeg", quality: 0.98 },
          pagebreak: { mode: ["css", "legacy"] },
          html2canvas: {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: "#ffffff",
            scrollX: 0,
            scrollY: 0,
          },
          jsPDF: { unit: "px", format: pageFormat, orientation: pageFormat[0] > pageFormat[1] ? "landscape" : "portrait" },
        })
        .from(target);

      if (zip) {
        instance
          .output("blob")
          .then((blob: Blob) => {
            zip.file(fileName, blob);
            document.body.removeChild(container);
            resolve();
          })
          .catch(() => {
            document.body.removeChild(container);
            resolve();
          });
      } else {
        instance
          .save()
          .then(() => {
            document.body.removeChild(container);
            resolve();
          })
          .catch(() => {
            document.body.removeChild(container);
            resolve();
          });
      }
    }, 700);
  });
}

export function exportTalentModelPDF(
  ranked: RankedTalent[],
  modelType: "genotipo" | "neurotalento",
  userName: string,
  zip?: JSZip,
  summaryText?: string,
  meta?: ExportProfileMeta,
): Promise<void> {
  const html = generatePDFHTML(ranked, modelType, userName, summaryText, meta);
  const fileName = `${userName ? userName.toLowerCase().replace(/\s+/g, "-") + "-" : ""}${modelType === "genotipo" ? "talentos" : "neurotalentos"}.pdf`;
  return runHtml2Pdf(html, fileName, [1000, 707], zip);
}

export function exportInformePDF(
  ranked: RankedTalent[],
  modelType: "genotipo" | "neurotalento",
  userName: string,
  summaryText?: string,
  meta?: ExportProfileMeta,
): Promise<void> {
  const html = generateInformeHTML(ranked, modelType, userName, summaryText, meta);
  const suffix = modelType === "genotipo" ? "informe-talentos" : "informe-neurotalentos";
  const fileName = `${userName ? userName.toLowerCase().replace(/\s+/g, "-") + "-" : ""}${suffix}.pdf`;
  return runHtml2Pdf(html, fileName, [794, 1123], undefined);
}


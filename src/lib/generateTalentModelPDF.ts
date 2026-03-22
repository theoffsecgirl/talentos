import { TALENTS } from "@/lib/talents";
import {
  TALENT_COLORS as INFORME_COLORS,
  SYMBOLS_GENOTIPO, SYMBOLS_NEUROTALENTO,
  SOFT_SKILLS_GENOTIPO, SOFT_SKILLS_NEUROTALENTO,
  TALENT_NAMES, NEUROCOGNITIVE_DATA,
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

function toSafeNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && !isNaN(value)) return value;
  return fallback;
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

function generateWheelSVG(
  ranked: RankedTalent[],
  modelType: "genotipo" | "neurotalento",
): string {
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
    const percentage = max > 0 ? Math.round((score / max) * 100) : 0;
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
        line1 = p[0] + " y";
        line2 = p[1];
      }
    } else if (fullTitle.includes(" e ")) {
      const p = fullTitle.split(" e ");
      if (p.length === 2) {
        line1 = p[0] + " e";
        line2 = p[1];
      }
    } else {
      const w = fullTitle.split(" ");
      const m = Math.ceil(w.length / 2);
      line1 = w.slice(0, m).join(" ");
      line2 = w.slice(m).join(" ");
    }
    return { talentId, color, percentage, fillRadius, fillPct, startAngle, endAngle, labelPos, percentPos, symbol, line1, line2 };
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
      <text x="${s.labelPos.x.toFixed(2)}" y="${(s.labelPos.y - 12).toFixed(2)}" text-anchor="middle" dominant-baseline="middle" font-size="14" font-weight="700" fill="#222">${s.symbol}</text>
      <text x="${s.labelPos.x.toFixed(2)}" y="${(s.labelPos.y + 4).toFixed(2)}" text-anchor="middle" dominant-baseline="middle" font-size="5.3" font-weight="600" fill="#333">${s.line1}</text>
      ${s.line2 ? `<text x="${s.labelPos.x.toFixed(2)}" y="${(s.labelPos.y + 13).toFixed(2)}" text-anchor="middle" dominant-baseline="middle" font-size="5.3" font-weight="600" fill="#333">${s.line2}</text>` : ""}
    `;
    })
    .join("");

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
</svg>`;
}

function generateBatteryBar(percentage: number, compact = false): string {
  const pct = Math.min(Math.max(percentage, 0), 100);
  const fill = pct > 67 ? "#DC2626" : "#111111";
  const h = compact ? 8 : 10;
  return `<div>
    <div style="display:flex;justify-content:space-between;font-size:${compact ? 8 : 9}px;color:#6b7280;margin-bottom:4px;line-height:1;">
      <span>0</span><span>60</span><span>100</span>
    </div>
    <div style="width:100%;height:${h}px;background:#d1d5db;border-radius:999px;overflow:hidden;">
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
  const modelLabel = modelType === "genotipo" ? "Modelo Talentos" : "Modelo Neurotalento";
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
      <span style="font-size:9px;color:#333;line-height:1.3;">${c}</span>
    </div>`,
    )
    .join("");

  const profileSection = `
    <div style="background:#f9f9f9;border:1px solid #ddd;border-radius:6px;padding:12px;margin-bottom:12px;">
      <div style="font-size:7px;font-weight:700;color:#888;letter-spacing:1px;margin-bottom:5px;">PERFIL PROFESIONAL</div>
      <div style="font-size:12px;font-weight:700;color:#111;margin-bottom:8px;text-transform:uppercase;">${profileTitle}</div>
      ${bulletItems}
      <div style="margin-top:8px;border:2px solid #CC0000;border-radius:5px;padding:6px;background:#fff3f3;">
        <div style="font-size:7px;font-weight:700;color:#CC0000;letter-spacing:0.5px;margin-bottom:2px;">ROL SUGERIDO</div>
        <div style="font-size:9px;color:#333;line-height:1.35;">${topRole || "No indicado"}</div>
      </div>
    </div>`;

  const talentListRows = AXIS_GROUPS.map((group) => {
    const rows = group.talents
      .map((talentId) => {
        const rd = ranked.find((r) => r.id === talentId);
        const pct = rd && rd.max > 0 ? Math.round((rd.score / rd.max) * 100) : 0;
        const sym = symbolMap[talentId] ?? "?";
        const nam = rd?.reportTitle ?? "";
        const bar = generateBatteryBar(pct, true);
        return `<div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:9px;">
          <div style="font-size:13px;font-weight:700;color:#222;width:18px;text-align:center;flex-shrink:0;line-height:1.2;">${sym}</div>
          <div style="font-size:10px;font-weight:600;color:#333;width:160px;flex-shrink:0;line-height:1.25;word-break:break-word;">${pct} · ${nam}</div>
          <div style="flex:1;min-width:0;">${bar}</div>
        </div>`;
      })
      .join("");
    return `<div style="margin-bottom:12px;">
      <div style="font-size:9px;font-weight:700;color:#555;letter-spacing:0.6px;border-bottom:1px solid #ddd;padding-bottom:3px;margin-bottom:7px;">${group.name}</div>
      ${rows}
    </div>`;
  }).join("");

  const summaryBanner = summaryText?.trim()
    ? `<div style="width:100%;max-width:560px;margin:10px auto 0;padding:10px 16px;background:#000;color:#fff;border-radius:40px;font-size:10px;line-height:1.45;text-align:center;">${summaryText}</div>`
    : "";

  return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/>
  <style>*{box-sizing:border-box;margin:0;padding:0;}body{font-family:Arial,sans-serif;background:#fff;color:#111;}</style>
</head><body>
  <div id="pdf-root" style="width:1000px;padding:25px;">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;border-bottom:2px solid #111;padding-bottom:8px;">
      <div>
        <div style="font-size:16px;font-weight:700;">MAPA DE ${modelType === "genotipo" ? "TALENTOS" : "NEUROTALENTOS"}</div>
        <div style="font-size:10px;color:#555;">${userName ? `${userName} — ` : ""}${modelLabel}</div>
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
        <div style="background:#fff;border:1px solid #ddd;border-radius:6px;padding:10px;">${talentListRows}</div>
      </div>
    </div>
  </div>
</body></html>`;
}

function hex2rgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function escapeHtml(text?: string): string {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getPercent(rd?: RankedTalent): number {
  if (!rd || !rd.max) return 0;
  return Math.max(0, Math.min(100, Math.round((rd.score / rd.max) * 100)));
}

function buildIntroPage(
  ranked: RankedTalent[],
  modelType: "genotipo" | "neurotalento",
  userName: string,
  summaryText?: string,
): string {
  const symbolMap = modelType === "genotipo" ? GENOTIPO_SYMBOLS : NEUROTALENTO_SYMBOLS;
  const title = modelType === "genotipo" ? "Informe de talentos" : "Informe de neurotalentos";
  const winner = ranked[0];
  const winnerTalent = TALENTS.find((t) => t.id === winner?.id);
  const winnerRole = winnerTalent?.exampleRoles?.[0] ?? "No indicado";
  const wheel = generateWheelSVG(ranked, modelType)
    .replace('width="560" height="560"', 'width="430" height="430"');

  const batteryGroups = AXIS_GROUPS.map((group) => {
    const rows = group.talents
      .map((talentId) => {
        const rd = ranked.find((r) => r.id === talentId);
        const pct = getPercent(rd);
        const name = escapeHtml(rd?.reportTitle ?? TALENTS.find((t) => t.id === talentId)?.reportTitle ?? "");
        const symbol = symbolMap[talentId] ?? "?";
        return `<div class="battery-row">
          <div class="battery-symbol">${symbol}</div>
          <div class="battery-name">${pct} · ${name}</div>
          <div class="battery-bar-wrap">${generateBatteryBar(pct, true)}</div>
        </div>`;
      })
      .join("");

    return `<div class="axis-group">
      <div class="axis-title">${group.name}</div>
      ${rows}
    </div>`;
  }).join("");

  const profileBullets = (winnerTalent?.competencies ?? []).slice(0, 4).map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  const evaluatorText = summaryText?.trim() ? escapeHtml(summaryText) : "Síntesis generada a partir del mapa principal y de las baterías dominantes del perfil.";

  return `<section class="page page-cover">
    <div class="cover-header">
      <div>
        <div class="eyebrow">Centro Educativo San Cristóbal-Castellón</div>
        <h1>${title}</h1>
        <p class="subtitle">${escapeHtml(userName)}</p>
      </div>
      <div class="meta-chip">Basado en neurociencia aplicada</div>
    </div>

    <div class="cover-grid">
      <div class="map-card">
        <div class="card-title">Mapa principal</div>
        <div class="map-wrap">${wheel}</div>
      </div>

      <div class="sidebar-stack">
        <div class="info-card">
          <div class="card-title">Perfil profesional</div>
          <div class="hero-name">${escapeHtml(winner?.reportTitle ?? winner?.quizTitle ?? "Perfil principal")}</div>
          <div class="hero-role">${escapeHtml(winnerRole)}</div>
          <ul class="bullet-list">${profileBullets}</ul>
        </div>

        <div class="info-card compact">
          <div class="card-title">Resumen del evaluador</div>
          <p class="summary-copy">${evaluatorText}</p>
        </div>
      </div>
    </div>

    <div class="battery-card">
      <div class="card-title">Baterías destacadas</div>
      ${batteryGroups}
    </div>
  </section>`;
}

function buildTalentPages(
  ranked: RankedTalent[],
  modelType: "genotipo" | "neurotalento",
): string {
  const symMap = modelType === "genotipo" ? SYMBOLS_GENOTIPO : SYMBOLS_NEUROTALENTO;

  const ordered = [...ranked].sort((a, b) => getPercent(b) - getPercent(a));

  return ordered.map((rd, index) => {
    const key = ID_TO_KEY[rd.id];
    const data = NEUROCOGNITIVE_DATA[key];
    const color = INFORME_COLORS[key] ?? "#888";
    const symbol = symMap[key] ?? "?";
    const name = TALENT_NAMES[key] ?? rd.reportTitle ?? rd.quizTitle;
    const value = getPercent(rd);
    const ambitos = data.ambitos.map((a) => `<span class="tag" style="background:${hex2rgba(color, 0.14)};color:${color};">${escapeHtml(a)}</span>`).join("");
    const perfil = data.perfilPuntos.map((p) => `<li>${escapeHtml(p)}</li>`).join("");

    return `<section class="page page-talent">
      <div class="talent-card">
        <div class="talent-accent" style="background:${color};"></div>
        <div class="talent-header">
          <div class="talent-symbol" style="color:${color};">${symbol}</div>
          <div class="talent-headcopy">
            <div class="eyebrow" style="color:${color};">Batería ${index + 1}</div>
            <h2>${escapeHtml(name)}</h2>
            <div class="axis-line">${escapeHtml(data.eje)}</div>
          </div>
          <div class="score-box">
            <div class="score-label">Valor</div>
            <div class="score-number" style="color:${color};">${value}</div>
          </div>
        </div>

        <div class="hero-bar">${generateBatteryBar(value)}</div>

        <div class="talent-grid">
          <div class="panel">
            <div class="panel-title">Resumen neurocognitivo</div>
            <p>${escapeHtml(data.resumen)}</p>
            <p class="muted">${escapeHtml(data.detalle)}</p>
          </div>

          <div class="panel panel-soft">
            <div class="panel-title">Perfil</div>
            <ul class="bullet-list dark">${perfil}</ul>
            <div class="panel-title second">Rol sugerido</div>
            <p class="role-copy" style="color:${color};">${escapeHtml(data.rol)}</p>
          </div>
        </div>

        <div class="panel full">
          <div class="panel-title">Ámbitos profesionales</div>
          <div class="tag-wrap">${ambitos}</div>
        </div>
      </div>
    </section>`;
  }).join("");
}

function buildSoftSkillsPage(
  ranked: RankedTalent[],
  modelType: "genotipo" | "neurotalento",
): string {
  const symMap = modelType === "genotipo" ? SYMBOLS_GENOTIPO : SYMBOLS_NEUROTALENTO;
  const softMap = modelType === "genotipo" ? SOFT_SKILLS_GENOTIPO : SOFT_SKILLS_NEUROTALENTO;

  const rows = ranked
    .filter((rd) => getPercent(rd) > 67)
    .sort((a, b) => getPercent(b) - getPercent(a))
    .map((rd) => {
      const key = ID_TO_KEY[rd.id];
      const color = INFORME_COLORS[key] ?? "#888";
      const symbol = symMap[key] ?? "?";
      const name = TALENT_NAMES[key] ?? rd.reportTitle ?? rd.quizTitle;
      const skills = softMap[key] ?? [];
      if (!skills.length) return "";
      return `<tr>
        <td>
          <div class="soft-battery">
            <span class="soft-symbol" style="color:${color};">${symbol}</span>
            <span>${escapeHtml(name)}</span>
          </div>
        </td>
        <td>
          <div class="soft-chip-wrap">${skills.map((s) => `<span class="soft-chip" style="border-color:${hex2rgba(color, 0.25)};color:${color};background:${hex2rgba(color, 0.08)};">${escapeHtml(s)}</span>`).join("")}</div>
        </td>
      </tr>`;
    })
    .filter(Boolean)
    .join("");

  return `<section class="page page-softskills">
    <div class="soft-card">
      <div class="eyebrow">Cierre del informe</div>
      <h2>Soft skills destacadas</h2>
      <p class="soft-intro">Solo se muestran las baterías destacadas.</p>
      <table class="soft-table">
        <thead>
          <tr><th>Batería</th><th>Competencias asociadas</th></tr>
        </thead>
        <tbody>
          ${rows || '<tr><td colspan="2">No hay baterías destacadas por encima del umbral configurado.</td></tr>'}
        </tbody>
      </table>
    </div>
  </section>`;
}

function generateInformeHTML(
  ranked: RankedTalent[],
  modelType: "genotipo" | "neurotalento",
  userName: string,
  summaryText?: string,
): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, Helvetica, sans-serif; background: #eef2f7; color: #18212f; }
    #pdf-root { width: 794px; margin: 0 auto; }
    .page {
      width: 794px;
      min-height: 1123px;
      background: #f7f8fb;
      position: relative;
      overflow: hidden;
      page-break-after: always;
      break-after: page;
      padding: 48px;
    }
    .page:last-child { page-break-after: auto; break-after: auto; }
    .eyebrow { font-size: 12px; letter-spacing: 1.8px; text-transform: uppercase; color: #6b7280; font-weight: 700; }
    h1 { font-size: 34px; line-height: 1.08; margin-top: 10px; color: #0f172a; }
    h2 { font-size: 29px; line-height: 1.1; color: #0f172a; }
    .subtitle { margin-top: 12px; font-size: 18px; color: #475569; }
    .meta-chip { border: 1px solid #d6dbe4; background: #fff; color: #475569; padding: 10px 14px; border-radius: 999px; font-size: 12px; }
    .cover-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 26px; }
    .cover-grid { display: grid; grid-template-columns: 1.12fr 0.88fr; gap: 24px; align-items: start; }
    .map-card, .info-card, .battery-card, .talent-card, .soft-card {
      background: #fff;
      border: 1px solid #dde3eb;
      border-radius: 28px;
      box-shadow: 0 10px 28px rgba(15, 23, 42, 0.06);
    }
    .map-card { padding: 24px 24px 14px; }
    .map-wrap { display: flex; align-items: center; justify-content: center; min-height: 450px; }
    .sidebar-stack { display: flex; flex-direction: column; gap: 20px; }
    .info-card { padding: 24px; }
    .info-card.compact { min-height: 220px; }
    .card-title { font-size: 12px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 16px; }
    .hero-name { font-size: 24px; line-height: 1.15; font-weight: 800; color: #0f172a; margin-bottom: 10px; }
    .hero-role { font-size: 15px; line-height: 1.4; color: #475569; margin-bottom: 18px; }
    .summary-copy { font-size: 14px; line-height: 1.7; color: #334155; }
    .bullet-list { padding-left: 18px; display: flex; flex-direction: column; gap: 10px; }
    .bullet-list li { font-size: 13px; line-height: 1.55; color: #334155; }
    .bullet-list.dark li { font-size: 13px; }
    .battery-card { margin-top: 24px; padding: 24px; }
    .axis-group + .axis-group { margin-top: 16px; }
    .axis-title { font-size: 11px; font-weight: 800; letter-spacing: 1px; color: #475569; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 1px solid #e5e7eb; }
    .battery-row { display: grid; grid-template-columns: 22px 188px 1fr; gap: 12px; align-items: start; margin-bottom: 12px; }
    .battery-symbol { font-size: 16px; font-weight: 700; text-align: center; color: #111827; padding-top: 1px; }
    .battery-name { font-size: 12px; line-height: 1.35; color: #1f2937; font-weight: 600; }
    .battery-bar-wrap { padding-top: 1px; }
    .page-talent { padding: 54px 48px; }
    .talent-card { min-height: 1015px; padding: 32px 34px 34px; position: relative; }
    .talent-accent { position: absolute; inset: 0 0 auto 0; height: 10px; border-radius: 28px 28px 0 0; }
    .talent-header { display: grid; grid-template-columns: 78px 1fr 126px; gap: 18px; align-items: center; margin-top: 10px; }
    .talent-symbol { font-size: 62px; line-height: 1; font-weight: 700; text-align: center; }
    .talent-headcopy h2 { font-size: 31px; margin-top: 5px; }
    .axis-line { margin-top: 8px; font-size: 12px; line-height: 1.45; color: #64748b; letter-spacing: 0.5px; text-transform: uppercase; }
    .score-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 22px; padding: 18px 14px; text-align: center; }
    .score-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1.2px; color: #64748b; font-weight: 700; }
    .score-number { font-size: 40px; line-height: 1; font-weight: 800; margin-top: 8px; }
    .hero-bar { margin-top: 24px; }
    .talent-grid { display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 20px; margin-top: 26px; }
    .panel { background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 22px; padding: 22px; }
    .panel.full { margin-top: 20px; }
    .panel-title { font-size: 12px; font-weight: 800; letter-spacing: 1.2px; text-transform: uppercase; color: #64748b; margin-bottom: 14px; }
    .panel-title.second { margin-top: 18px; }
    .panel p { font-size: 14px; line-height: 1.72; color: #1f2937; }
    .panel p + p { margin-top: 14px; }
    .panel p.muted { color: #475569; }
    .role-copy { font-size: 18px; line-height: 1.45; font-weight: 700; }
    .tag-wrap, .soft-chip-wrap { display: flex; flex-wrap: wrap; gap: 10px; }
    .tag { display: inline-flex; align-items: center; padding: 9px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; line-height: 1.35; }
    .page-softskills { padding-top: 70px; }
    .soft-card { min-height: 980px; padding: 34px; }
    .soft-intro { margin-top: 12px; font-size: 15px; line-height: 1.6; color: #475569; }
    .soft-table { width: 100%; border-collapse: collapse; margin-top: 28px; }
    .soft-table th, .soft-table td { border-bottom: 1px solid #e5e7eb; padding: 16px 10px; vertical-align: top; text-align: left; }
    .soft-table th { font-size: 12px; letter-spacing: 1px; color: #64748b; text-transform: uppercase; }
    .soft-table td { font-size: 14px; line-height: 1.6; color: #1f2937; }
    .soft-battery { display: flex; align-items: center; gap: 12px; font-weight: 700; }
    .soft-symbol { font-size: 28px; line-height: 1; font-weight: 700; width: 26px; text-align: center; }
    .soft-chip { display: inline-flex; align-items: center; padding: 8px 11px; border-radius: 999px; border: 1px solid transparent; font-size: 12px; font-weight: 700; }
  </style>
</head>
<body>
  <div id="pdf-root">
    ${buildIntroPage(ranked, modelType, userName, summaryText)}
    ${buildTalentPages(ranked, modelType)}
    ${buildSoftSkillsPage(ranked, modelType)}
  </div>
</body>
</html>`;
}

function runHtml2Pdf(
  htmlContent: string,
  fileName: string,
  pageFormat: [number, number],
  zip?: JSZip,
  options?: { orientation?: "portrait" | "landscape"; useA4?: boolean },
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
    container.style.cssText = `position:fixed;left:-99999px;top:0;width:${pageFormat[0]}px;background:#fff;`;
    document.body.appendChild(container);

    const iframe = document.createElement("iframe");
    iframe.style.cssText = `width:${pageFormat[0]}px;height:${Math.max(pageFormat[1], 1200)}px;border:none;background:#fff;`;
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

    const render = () => {
      const target = iframeDoc.getElementById("pdf-root") as HTMLElement | null;
      if (!target) {
        document.body.removeChild(container);
        resolve();
        return;
      }

      const instance = html2pdf()
        .set({
          margin: 0,
          filename: fileName,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, allowTaint: true, backgroundColor: "#ffffff", windowWidth: pageFormat[0] },
          pagebreak: { mode: ["css", "legacy"] },
          jsPDF: options?.useA4
            ? { unit: "pt", format: "a4", orientation: options.orientation ?? "portrait" }
            : { unit: "px", format: pageFormat, orientation: options?.orientation ?? "landscape" },
        })
        .from(target);

      if (zip) {
        instance.output("blob")
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
        instance.save()
          .then(() => {
            document.body.removeChild(container);
            resolve();
          })
          .catch(() => {
            document.body.removeChild(container);
            resolve();
          });
      }
    };

    const wait = () => {
      const done = () => setTimeout(render, 350);
      const win = iframe.contentWindow;
      if (win && typeof win.requestAnimationFrame === "function") {
        win.requestAnimationFrame(() => win.requestAnimationFrame(done));
      } else {
        setTimeout(render, 700);
      }
    };

    setTimeout(wait, 500);
  });
}

export async function exportTalentModelPDF(
  ranked: RankedTalent[],
  modelType: "genotipo" | "neurotalento",
  userName: string,
  zip?: JSZip,
  summaryText?: string,
  meta?: ExportProfileMeta,
): Promise<void> {
  if (typeof window === "undefined") return;

  const scores = Object.fromEntries(
    ranked
      .map((rd) => [ID_TO_KEY[rd.id], getPercent(rd)] as const)
      .filter((entry): entry is readonly [string, number] => Boolean(entry[0])),
  );

  const fileName = `${userName ? userName.toLowerCase().replace(/\s+/g, "-") + "-" : ""}${modelType === "genotipo" ? "talentos" : "neurotalentos"}.pdf`;

  const res = await fetch("/api/generate-mapa-pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nombre: userName || "Resultado",
      scores,
      textoResumen: summaryText || "",
      modelo: modelType,
      rolEscogido: meta?.rolEscogido || "",
      rolPensado: meta?.rolPensado || "",
    }),
  });

  if (!res.ok) {
    throw new Error("No se pudo generar el PDF del mapa");
  }

  const blob = await res.blob();

  if (zip) {
    zip.file(fileName, blob);
    return;
  }

  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export async function exportInformePDF(
  ranked: RankedTalent[],
  modelType: "genotipo" | "neurotalento",
  userName: string,
  summaryText?: string,
): Promise<void> {
  if (typeof window === "undefined") return;

  const scores = Object.fromEntries(
    ranked
      .map((rd) => [ID_TO_KEY[rd.id], getPercent(rd)] as const)
      .filter((entry): entry is readonly [string, number] => Boolean(entry[0])),
  );

  const res = await fetch("/api/generate-informe-pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nombre: userName || "Resultado",
      scores,
      textoResumen: summaryText || "",
      modelo: modelType,
      fecha: new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" }),
    }),
  });

  if (!res.ok) {
    throw new Error("No se pudo generar el informe PDF");
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  const fileName = `${userName ? userName.toLowerCase().replace(/\s+/g, "-") + "-" : ""}informe-${modelType}.pdf`;
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

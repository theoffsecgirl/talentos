"use client";

import React, { useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const STEM = "ME GUSTAN LAS ACTIVIDADES O PIENSO EN UNA PROFESIÓN DONDE...";

const TALENT_CONFIG: Record<number, { symbol: string; color: string; secondaryColor: string; category: string; categoryLabel: string }> = {
  2: { symbol: "Π", color: "#8B5CF6", secondaryColor: "#A78BFA", category: "Conocimiento", categoryLabel: "Ciencia aplicada" },
  3: { symbol: "Ψ", color: "#7C3AED", secondaryColor: "#8B5CF6", category: "Conocimiento", categoryLabel: "Ciencia aplicada" },
  5: { symbol: "Ω", color: "#F59E0B", secondaryColor: "#FBBF24", category: "Desempeño", categoryLabel: "Energía" },
  7: { symbol: "Θ", color: "#10B981", secondaryColor: "#34D399", category: "Imaginación", categoryLabel: "Arte" },
  4: { symbol: "Α", color: "#EF4444", secondaryColor: "#F87171", category: "Acción", categoryLabel: "Resultados" },
  1: { symbol: "Δ", color: "#DC2626", secondaryColor: "#EF4444", category: "Acción", categoryLabel: "Resultados" },
  6: { symbol: "Φ", color: "#06B6D4", secondaryColor: "#22D3EE", category: "Imaginación", categoryLabel: "Arte" },
  8: { symbol: "▭", color: "#D97706", secondaryColor: "#F59E0B", category: "Desempeño", categoryLabel: "Energía" },
};

const TALENT_ORDER = [2, 3, 5, 7, 6, 8, 1, 4];

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function toISODate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function ageFromBirthdate(birth: Date) {
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function pct(score: number, max: number) {
  if (!max) return 0;
  return clamp(Math.round((score / max) * 100), 0, 100);
}

function scoreIndicator(score: number, max: number): string {
  if (max === 0) return "0 de 5";
  const normalized = Math.round((score / max) * 5);
  return `${normalized} de 5`;
}

function normalizeItemText(s: string) {
  const t = (s ?? "").trim().replace(/\s+/g, " ");
  if (!t) return "";
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function downloadTextFile(filename: string, content: string, mime = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function svgToPngDataUrl(svgText: string, width: number, height: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const svg = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svg);
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas context null");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        const pngUrl = canvas.toDataURL("image/png");
        URL.revokeObjectURL(url);
        resolve(pngUrl);
      } catch (e) {
        URL.revokeObjectURL(url);
        reject(e);
      }
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}

function downloadDataUrl(filename: string, dataUrl: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function donutStroke(p: number) {
  return p >= 65 ? "var(--danger)" : "var(--foreground)";
}

function Donut({ value }: { value: number }) {
  const r = 18;
  const c = 2 * Math.PI * r;
  const dash = (clamp(value, 0, 100) / 100) * c;
  return (
    <div className="relative h-12 w-12">
      <svg viewBox="0 0 48 48" className="h-12 w-12">
        <circle cx="24" cy="24" r={r} fill="none" stroke="var(--border)" strokeWidth="6" />
        <circle
          cx="24"
          cy="24"
          r={r}
          fill="none"
          stroke={donutStroke(value)}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
          transform="rotate(-90 24 24)"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">{value}%</div>
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1 text-xs text-[var(--muted-foreground)]">
      {children}
    </span>
  );
}

function ButtonPrimary(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { className, ...rest } = props;
  return (
    <button
      {...rest}
      className={cx(
        "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold",
        "bg-[var(--accent)] text-white",
        "hover:opacity-95 active:opacity-90 transition",
        "focus:outline-none focus:ring-2 focus:ring-[var(--ring)]",
        className
      )}
    />
  );
}

function ButtonGhost(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { className, ...rest } = props;
  return (
    <button
      {...rest}
      className={cx(
        "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold",
        "border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)]",
        "hover:bg-black/5 dark:hover:bg-white/5 active:opacity-90 transition",
        "focus:outline-none focus:ring-2 focus:ring-[var(--ring)]",
        className
      )}
    />
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className, ...rest } = props;
  return (
    <input
      {...rest}
      className={cx(
        "rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm",
        "text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]",
        "focus:outline-none focus:ring-2 focus:ring-[var(--ring)]",
        className
      )}
    />
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const { className, ...rest } = props;
  return (
    <select
      {...rest}
      className={cx(
        "rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm",
        "text-[var(--foreground)]",
        "focus:outline-none focus:ring-2 focus:ring-[var(--ring)]",
        className
      )}
    />
  );
}

// Componente Accordion
function Accordion({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-[var(--border)] rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between bg-[var(--background)] hover:bg-black/5 dark:hover:bg-white/5 transition"
      >
        <span className="font-semibold text-sm text-[var(--foreground)]">{title}</span>
        <svg
          className={cx("w-5 h-5 text-[var(--muted-foreground)] transition-transform", isOpen && "rotate-180")}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && <div className="px-4 py-3 bg-[var(--card)] border-t border-[var(--border)]">{children}</div>}
    </div>
  );
}

type FilterState = {
  q: string;
  genero: string;
  centro: string;
  curso: string;
  modalidad: string;
  idea: string;
};

type ScoreRow = { talentId: number; score: number; max: number };

function getScores(scoresJson: any): ScoreRow[] {
  return Array.isArray(scoresJson)
    ? scoresJson
        .map((x) => ({ talentId: Number(x?.talentId), score: Number(x?.score ?? 0), max: Number(x?.max ?? 0) }))
        .filter((x) => Number.isFinite(x.talentId))
    : [];
}

function topN(talents: any[], scoresJson: any, n: number) {
  const scores = getScores(scoresJson)
    .slice()
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, n);
  return scores.map((s) => {
    const t = talents.find((x: any) => x.id === s.talentId);
    return {
      talentId: s.talentId,
      code: t?.code ?? `T${s.talentId}`,
      quizTitle: t?.quizTitle ?? `Talento ${s.talentId}`,
      titleSymbolic: t?.titleSymbolic ?? "",
      titleGenotype: t?.titleGenotype ?? "",
      reportTitle: t?.reportTitle ?? "",
      reportSummary: t?.reportSummary ?? "",
      axis: t?.axis ?? "",
      group: t?.group ?? "",
      fields: Array.isArray(t?.fields) ? t.fields : [],
      competencies: Array.isArray(t?.competencies) ? t.competencies : [],
      exampleRoles: Array.isArray(t?.exampleRoles) ? t.exampleRoles : [],
      score: s.score ?? 0,
      max: s.max ?? 0,
    };
  });
}

function TalentWheelSVG({
  scores,
  svgRef,
}: {
  scores: ScoreRow[];
  svgRef?: React.RefObject<SVGSVGElement | null>;
}) {
  const size = 600;
  const center = size / 2;
  const radius = 240;
  const innerRadius = 60;

  const talents = TALENT_ORDER.map((talentId) => {
    const scoreData = scores.find((s) => s.talentId === talentId);
    const config = TALENT_CONFIG[talentId];
    const score = scoreData?.score ?? 0;
    const maxScore = scoreData?.max ?? 15;
    const fillPercentage = maxScore > 0 ? score / maxScore : 0;
    const fillRadius = innerRadius + (radius - innerRadius) * fillPercentage;

    return {
      id: talentId,
      code: `T${talentId}`,
      symbol: config.symbol,
      score,
      maxScore,
      color: config.color,
      fillRadius,
      fillPercentage,
    };
  });

  const sections = talents.map((talent, index) => {
    const anglePerSection = (Math.PI * 2) / 8;
    const startAngle = index * anglePerSection - Math.PI / 2;
    const endAngle = startAngle + anglePerSection;

    return {
      talent,
      startAngle,
      endAngle,
    };
  });

  const polarToCartesian = (angle: number, r: number) => ({
    x: center + r * Math.cos(angle),
    y: center + r * Math.sin(angle),
  });

  const createArcPath = (startAngle: number, endAngle: number, outerR: number, innerR: number) => {
    const start = polarToCartesian(startAngle, outerR);
    const end = polarToCartesian(endAngle, outerR);
    const innerStart = polarToCartesian(startAngle, innerR);
    const innerEnd = polarToCartesian(endAngle, innerR);

    const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;

    return [
      `M ${start.x} ${start.y}`,
      `A ${outerR} ${outerR} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`,
      `L ${innerEnd.x} ${innerEnd.y}`,
      `A ${innerR} ${innerR} 0 ${largeArcFlag} 0 ${innerStart.x} ${innerStart.y}`,
      `Z`,
    ].join(" ");
  };

  return (
    <svg ref={svgRef} width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ maxWidth: "100%", height: "auto" }}>
      <defs>
        {sections.map(({ talent }) => (
          <radialGradient key={`gradient-${talent.id}`} id={`gradient-${talent.id}`} cx="50%" cy="50%">
            <stop offset="0%" stopColor={talent.color} stopOpacity={Math.min(talent.fillPercentage * 1.2, 1)} />
            <stop offset={`${talent.fillPercentage * 100}%`} stopColor={talent.color} stopOpacity="0.6" />
            <stop offset="100%" stopColor={talent.color} stopOpacity="0.1" />
          </radialGradient>
        ))}
      </defs>

      <line x1={center} y1={center - radius} x2={center} y2={center + radius} stroke="#000" strokeWidth="2" />
      <line x1={center - radius} y1={center} x2={center + radius} y2={center} stroke="#000" strokeWidth="2" />

      {[1, 3, 5, 7].map((index) => {
        const angle = (index * Math.PI * 2) / 8 - Math.PI / 2;
        const outer = polarToCartesian(angle, radius);
        return (
          <line
            key={`divider-${index}`}
            x1={center}
            y1={center}
            x2={outer.x}
            y2={outer.y}
            stroke="#666"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
        );
      })}

      {sections.map(({ talent, startAngle, endAngle }) => {
        const midAngle = (startAngle + endAngle) / 2;
        const labelPos = polarToCartesian(midAngle, radius + 30);

        return (
          <g key={talent.id}>
            <path
              d={createArcPath(startAngle, endAngle, talent.fillRadius, innerRadius)}
              fill={`url(#gradient-${talent.id})`}
              stroke={talent.color}
              strokeWidth="1"
            />

            <path
              d={createArcPath(
                startAngle,
                endAngle,
                radius,
                talent.fillRadius > innerRadius ? talent.fillRadius : innerRadius
              )}
              fill="none"
              stroke={talent.color}
              strokeWidth="2"
              opacity="0.3"
            />

            <text
              x={labelPos.x}
              y={labelPos.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="18"
              fontWeight="bold"
              fill={talent.color}
            >
              {talent.symbol}
            </text>
            <text
              x={labelPos.x}
              y={labelPos.y + 16}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="12"
              fill="#666"
            >
              {talent.code}
            </text>
          </g>
        );
      })}

      <circle cx={center} cy={center} r={innerRadius} fill="white" stroke="#000" strokeWidth="2" />
    </svg>
  );
}

function buildHtmlDoc(title: string, body: string, extraCss = "") {
  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <style>
    :root{--bg:#ffffff;--fg:#0b1220;--muted:#6b7280;--border:#e5e7eb;--accent:#0ea5e9;--danger:#ef4444;}
    *{box-sizing:border-box} body{margin:0;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial; color:var(--fg); background:var(--bg)}
    .page{width:210mm;min-height:297mm;margin:0 auto;padding:18mm 16mm;page-break-after:always}
    .page:last-child{page-break-after:auto}
    .h1{font-size:34px;line-height:1.05;margin:0 0 10px;font-weight:900;letter-spacing:-0.02em}
    .h2{font-size:20px;margin:0 0 8px;font-weight:800}
    .muted{color:var(--muted)}
    .card{border:1px solid var(--border);border-radius:14px;padding:14px;background:#fff}
    .grid{display:grid;gap:12px}
    .grid2{grid-template-columns:1fr 1fr}
    .grid3{grid-template-columns:1fr 1fr 1fr}
    .pill{display:inline-flex;align-items:center;border:1px solid var(--border);border-radius:999px;padding:6px 10px;font-size:12px;color:var(--muted)}
    .bar{height:10px;border-radius:999px;background:var(--border);overflow:hidden}
    .bar>span{display:block;height:100%;background:var(--fg)}
    .bar.danger>span{background:var(--danger)}
    table{width:100%;border-collapse:collapse;font-size:12px}
    th,td{border:1px solid var(--border);padding:8px;vertical-align:top}
    th{background:#f8fafc;text-align:left}
    @media print{body{background:#fff}.page{padding:16mm}}
    ${extraCss}
  </style>
</head>
<body>
${body}
</body>
</html>`;
}

function ReportHtml({
  selected,
  talents,
  scores,
  top3Rows,
  mapSvg,
  answers,
  questionMap,
}: {
  selected: any;
  talents: any[];
  scores: ScoreRow[];
  top3Rows: any[];
  mapSvg: string;
  answers: Record<string, number>;
  questionMap: Record<string, { text: string; talentQuizTitle: string; talentId: number; idxInTalent: number }>;
}) {
  const byId = new Map(scores.map((s) => [s.talentId, s]));
  const ordered = talents.slice().sort((a, b) => a.id - b.id);

  const cover = `
  <section class="page">
    <div class="pill">NEUROCIENCIA APLICADA · DESCUBRE TU FUTURO PROFESIONAL</div>
    <div style="display:flex;justify-content:space-between;gap:16px;margin-top:18px;align-items:flex-end">
      <div>
        <h1 class="h1">TUS RESULTADOS</h1>
        <div class="muted" style="font-size:14px;">Mapa visual de tus talentos basado en neurociencia aplicada</div>
        <div style="margin-top:18px;font-size:16px;font-weight:800">${selected.nombre} ${selected.apellido}</div>
        <div class="muted" style="margin-top:4px">${toISODate(new Date(selected.createdAt))}</div>
      </div>
    </div>

    <div style="margin-top:32px;display:flex;justify-content:center">
      ${mapSvg}
    </div>

    <div style="margin-top:24px;display:grid;grid-template-columns:1fr 1fr;gap:12px">
      <div class="card">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
          <div style="width:16px;height:16px;border-radius:4px;background:#EF4444"></div>
          <div style="font-weight:900;font-size:13px">Acción</div>
        </div>
        <div class="muted" style="font-size:11px">Resultados</div>
      </div>
      <div class="card">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
          <div style="width:16px;height:16px;border-radius:4px;background:#8B5CF6"></div>
          <div style="font-weight:900;font-size:13px">Conocimiento</div>
        </div>
        <div class="muted" style="font-size:11px">Ciencia aplicada</div>
      </div>
      <div class="card">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
          <div style="width:16px;height:16px;border-radius:4px;background:#06B6D4"></div>
          <div style="font-weight:900;font-size:13px">Imaginación</div>
        </div>
        <div class="muted" style="font-size:11px">Arte</div>
      </div>
      <div class="card">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
          <div style="width:16px;height:16px;border-radius:4px;background:#F59E0B"></div>
          <div style="font-weight:900;font-size:13px">Desempeño</div>
        </div>
        <div class="muted" style="font-size:11px">Energía</div>
      </div>
    </div>
  </section>`;

  const talentosTable = TALENT_ORDER.map((tid) => {
    const s = byId.get(tid);
    const config = TALENT_CONFIG[tid];
    const t = talents.find((x: any) => x.id === tid);
    return `
      <tr>
        <td style="text-align:center;font-size:20px;color:${config.color}">${config.symbol}</td>
        <td style="font-weight:700">${t?.reportTitle || t?.quizTitle || `T${tid}`}</td>
        <td style="text-align:center">T${tid}</td>
        <td style="text-align:center;font-weight:700">${s?.score ?? 0} / ${s?.max ?? 15}</td>
      </tr>`;
  }).join("\n");

  const resumenPage = `
  <section class="page">
    <h2 class="h2">Tus 3 talentos más destacados</h2>
    <div class="grid" style="margin-top:14px">
      ${top3Rows
        .map((t, idx) => {
          const config = TALENT_CONFIG[t.talentId];
          return `
            <div class="card">
              <div style="display:flex;gap:12px;align-items:flex-start">
                <div style="font-size:32px;color:${config?.color || "#000"}">${config?.symbol || ""}</div>
                <div style="flex:1">
                  <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
                    <span style="font-size:12px;font-weight:700;color:var(--muted)">#${idx + 1}</span>
                    <span style="font-weight:900;font-size:16px">${t.reportTitle || t.quizTitle}</span>
                  </div>
                  <div class="muted" style="font-size:13px;line-height:1.5">${t.reportSummary}</div>
                  <div style="margin-top:8px;text-align:right">
                    <span style="font-size:20px;font-weight:900">${t.score}</span>
                    <span class="muted" style="font-size:12px"> / ${t.max}</span>
                  </div>
                </div>
              </div>
            </div>`;
        })
        .join("\n")}
    </div>

    <div style="margin-top:16px" class="card">
      <div style="font-weight:900;margin-bottom:8px">Listado completo de talentos</div>
      <table>
        <thead>
          <tr>
            <th>Símbolo</th>
            <th>Talento</th>
            <th>Código</th>
            <th>Puntuación</th>
          </tr>
        </thead>
        <tbody>
          ${talentosTable}
        </tbody>
      </table>
    </div>
  </section>`;

  const profesionesPage = `
  <section class="page">
    <h2 class="h2">Profesiones y roles sugeridos</h2>
    <div class="muted" style="font-size:13px;margin-bottom:12px">Basado en tus talentos principales. Marca las opciones con las que te identificas:</div>
    <div class="card">
      ${top3Rows
        .flatMap((t) => t.exampleRoles)
        .map(
          (role: string) => `
          <div style="padding:10px;border:1px solid var(--border);border-radius:8px;margin-bottom:8px;display:flex;align-items:center;gap:10px">
            <div style="width:18px;height:18px;border:2px solid var(--muted);border-radius:4px"></div>
            <div style="font-size:13px">${role}</div>
          </div>`
        )
        .join("\n")}
    </div>
  </section>`;

  const detailPages = ordered.map((t) => {
    const s = byId.get(t.id);
    const config = TALENT_CONFIG[t.id];
    const fields = (t.fields ?? []).map((x: string) => `<li>${x}</li>`).join("");
    const comps = (t.competencies ?? []).map((x: string) => `<li>${x}</li>`).join("");
    const roles = (t.exampleRoles ?? []).map((x: string) => `<li>${x}</li>`).join("");

    return `
    <section class="page">
      <div class="pill">${t.code} · ${config?.symbol || ""} · ${t.titleGenotype || ""}</div>
      <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-end;margin-top:14px">
        <div>
          <h2 class="h2">${t.reportTitle || t.quizTitle}</h2>
          <div class="muted" style="font-size:13px">${t.group || t.quizTitle}</div>
        </div>
        <div style="text-align:right">
          <div class="muted" style="font-size:12px;font-weight:700">Puntuación</div>
          <div style="font-size:28px;font-weight:900;color:${config?.color || "#000"}">${s?.score ?? 0}</div>
          <div class="muted" style="font-size:12px">/ ${s?.max ?? 15}</div>
        </div>
      </div>
      <div class="card" style="margin-top:14px">
        <div style="font-weight:900;margin-bottom:6px">Resumen neurocognitivo</div>
        <div style="font-size:13px" class="muted">${t.reportSummary || ""}</div>
      </div>
      <div class="grid grid2" style="margin-top:12px">
        <div class="card">
          <div style="font-weight:900;margin-bottom:8px">Ámbitos profesionales</div>
          <ul style="margin:0;padding-left:18px;font-size:13px" class="muted">${fields}</ul>
        </div>
        <div class="card">
          <div style="font-weight:900;margin-bottom:8px">Competencias personales</div>
          <ul style="margin:0;padding-left:18px;font-size:13px" class="muted">${comps}</ul>
        </div>
      </div>
      <div class="card" style="margin-top:12px">
        <div style="font-weight:900;margin-bottom:8px">Roles y profesiones de ejemplo</div>
        <ul style="margin:0;padding-left:18px;font-size:13px" class="muted">${roles}</ul>
      </div>
    </section>`;
  }).join("\n");

  const answerRows = Object.entries(answers)
    .sort(([a], [b]) => a.localeCompare(b, "es"))
    .map(([qid, v]) => {
      const meta = questionMap[qid];
      const text = meta?.text ? normalizeItemText(meta.text) : "(Pregunta no encontrada)";
      const vv = Number(v);
      const x = (n: number) => (vv === n ? "X" : "");
      return `
        <tr>
          <td style="width:64px"><b>${qid}</b></td>
          <td>${text}</td>
          <td style="width:40px;text-align:center">${x(0)}</td>
          <td style="width:40px;text-align:center">${x(1)}</td>
          <td style="width:40px;text-align:center">${x(2)}</td>
          <td style="width:40px;text-align:center">${x(3)}</td>
        </tr>`;
    })
    .join("\n");

  const cierre = `
  <section class="page">
    <h2 class="h2">Detalle de respuestas</h2>
    <div class="muted" style="font-size:13px">Escala 0–3. Marca "X" en la columna correspondiente.</div>
    <div class="card" style="margin-top:12px">
      <div style="font-size:12px;font-weight:800;margin-bottom:8px">${STEM}</div>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Afirmación</th>
            <th>0</th>
            <th>1</th>
            <th>2</th>
            <th>3</th>
          </tr>
        </thead>
        <tbody>
          ${answerRows}
        </tbody>
      </table>
    </div>
  </section>`;

  return cover + resumenPage + profesionesPage + detailPages + cierre;
}

export default function AdminClient({ rows, exportHref, talents, filters }: any) {
  const router = useRouter();
  const pathname = usePathname();

  const [openId, setOpenId] = useState<string | null>(null);
  const [tab, setTab] = useState<"resultados" | "mapa" | "informe">("resultados");

  const [form, setForm] = useState<FilterState>({
    q: filters?.q ?? "",
    genero: filters?.genero ?? "",
    centro: filters?.centro ?? "",
    curso: filters?.curso ?? "",
    modalidad: filters?.modalidad ?? "",
    idea: filters?.idea ?? "",
  });

  function update<K extends keyof FilterState>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    const entries: Array<[keyof FilterState, string]> = [
      ["q", form.q],
      ["genero", form.genero],
      ["centro", form.centro],
      ["curso", form.curso],
      ["modalidad", form.modalidad],
      ["idea", form.idea],
    ];
    for (const [k, v] of entries) {
      const t = (v ?? "").trim();
      if (t) params.set(k, t);
    }
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  function onClear() {
    setForm({ q: "", genero: "", centro: "", curso: "", modalidad: "", idea: "" });
    router.push(pathname);
  }

  const QUESTION_MAP = useMemo(() => {
    const map: Record<string, { text: string; talentQuizTitle: string; talentId: number; idxInTalent: number }> = {};
    for (const t of talents) {
      for (let i = 0; i < (t.items?.length ?? 0); i++) {
        const it = t.items[i];
        map[it.id] = { text: it.text, talentQuizTitle: t.quizTitle, talentId: t.id, idxInTalent: i };
      }
    }
    return map;
  }, [talents]);

  const selected = openId ? rows.find((r: any) => r.id === openId) : null;
  const assessment = selected?.assessments?.[0];

  const scores = useMemo(() => getScores(assessment?.scoresJson), [assessment?.scoresJson]);
  const top3Rows = useMemo(() => topN(talents, assessment?.scoresJson, 3), [talents, assessment?.scoresJson]);
  const answers = useMemo(() => {
    const a = assessment?.answersJson;
    return a && typeof a === "object" ? (a as Record<string, number>) : {};
  }, [assessment?.answersJson]);

  // Agrupar preguntas por talento para acordeones
  const questionsByTalent = useMemo(() => {
    const map = new Map<number, Array<{ itemId: string; text: string; answer: number }>>();
    
    // DEBUG: Ver qué claves tenemos
    console.log("🔍 DEBUG answers keys (primeras 10):", Object.keys(answers).slice(0, 10));
    console.log("🔍 DEBUG QUESTION_MAP keys (primeras 10):", Object.keys(QUESTION_MAP).slice(0, 10));
    console.log("🔍 DEBUG Total answers:", Object.keys(answers).length);
    console.log("🔍 DEBUG Total QUESTION_MAP:", Object.keys(QUESTION_MAP).length);
    
    Object.entries(answers).forEach(([itemId, answer]) => {
      const meta = QUESTION_MAP[itemId];
      if (!meta) {
        console.warn(`⚠️ No se encontró metadata para itemId: "${itemId}"`);
        return;
      }
      
      if (!map.has(meta.talentId)) {
        map.set(meta.talentId, []);
      }
      const list = map.get(meta.talentId);
      if (list) {
        list.push({
          itemId,
          text: meta.text,
          answer: Number(answer),
        });
      }
    });
    
    console.log("✅ questionsByTalent construido:", map);
    console.log("📊 Talentos con preguntas:", Array.from(map.keys()));
    return map;
  }, [answers, QUESTION_MAP]);

  const svgRef = useRef<SVGSVGElement>(null);

  function downloadJson() {
    if (!selected) return;
    const payload = {
      alumno: {
        id: selected.id,
        nombre: selected.nombre,
        apellido: selected.apellido,
        email: selected.user?.email,
        fecha: selected.createdAt,
      },
      scores,
      answers,
    };
    downloadTextFile(`resultado_${selected.id}.json`, JSON.stringify(payload, null, 2), "application/json;charset=utf-8");
  }

  async function downloadMapSvgPng() {
    if (!selected) return;
    const node = svgRef.current;
    if (!node) return;
    const svgText = new XMLSerializer().serializeToString(node);
    downloadTextFile(`mapa_${selected.id}.svg`, svgText, "image/svg+xml;charset=utf-8");
    const pngUrl = await svgToPngDataUrl(svgText, 1200, 1200);
    downloadDataUrl(`mapa_${selected.id}.png`, pngUrl);
  }

  function downloadTabHtml(which: "resultados" | "mapa" | "informe") {
    if (!selected) return;
    const title = `${selected.nombre} ${selected.apellido} · ${which}`;

    const byId = new Map(scores.map((s) => [s.talentId, s]));
    const ordered = talents.slice().sort((a: any, b: any) => a.id - b.id);

    const mapSvg = (() => {
      const node = svgRef.current;
      if (!node) return "";
      const svgText = new XMLSerializer().serializeToString(node);
      return svgText;
    })();

    let body = "";

    if (which === "mapa") {
      body = `
        <section class="page">
          <div class="pill">Mapa de Talentos</div>
          <h1 class="h1" style="margin-top:12px">${selected.nombre} ${selected.apellido}</h1>
          <div class="muted">${toISODate(new Date(selected.createdAt))}</div>
          <div class="card" style="margin-top:14px">${mapSvg}</div>
        </section>`;
    } else if (which === "resultados") {
      const talentosTable = TALENT_ORDER.map((tid) => {
        const s = byId.get(tid);
        const config = TALENT_CONFIG[tid];
        const t = talents.find((x: any) => x.id === tid);
        return `
          <tr>
            <td style="text-align:center;font-size:20px;color:${config.color}">${config.symbol}</td>
            <td style="font-weight:700">${t?.reportTitle || t?.quizTitle || `T${tid}`}</td>
            <td style="text-align:center">T${tid}</td>
            <td style="text-align:center;font-weight:700">${s?.score ?? 0} / ${s?.max ?? 15}</td>
          </tr>`;
      }).join("\n");

      body = `
        <section class="page">
          <div class="pill">Resultados</div>
          <h1 class="h1" style="margin-top:12px">${selected.nombre} ${selected.apellido}</h1>
          <div class="muted">${toISODate(new Date(selected.createdAt))}</div>

          <div class="card" style="margin-top:14px">
            <table>
              <thead>
                <tr>
                  <th>Símbolo</th>
                  <th>Talento</th>
                  <th>Código</th>
                  <th>Puntuación</th>
                </tr>
              </thead>
              <tbody>
                ${talentosTable}
              </tbody>
            </table>
          </div>
        </section>`;
    } else {
      const reportBody = ReportHtml({
        selected,
        talents,
        scores,
        top3Rows,
        mapSvg,
        answers,
        questionMap: QUESTION_MAP,
      });
      body = reportBody;
    }

    const html = buildHtmlDoc(title, body);
    downloadTextFile(`${which}_${selected.id}.html`, html, "text/html;charset=utf-8");
  }

  function downloadPdfReport() {
    if (!selected) return;
    window.open(`/api/pdf/informe/${selected.id}`, "_blank");
  }

  function downloadPdfMap() {
    if (!selected) return;
    window.open(`/api/pdf/mapa/${selected.id}`, "_blank");
  }

  // Ranked talents para mostrar en orden de puntuación
  const rankedTalents = useMemo(() => {
    return talents
      .slice()
      .map((t: any) => {
        const s = scores.find((x) => x.talentId === t.id);
        return {
          ...t,
          score: s?.score ?? 0,
          max: s?.max ?? 0,
        };
      })
      .sort((a: any, b: any) => b.score - a.score);
  }, [talents, scores]);

  return (
    <main className="max-w-6xl mx-auto px-4 py-10 bg-[var(--background)] text-[var(--foreground)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)]">Admin</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Mostrando {rows.length} resultados (máx. 200). Exporta Excel con los filtros actuales.
          </p>
        </div>

        <a href={exportHref}>
          <ButtonPrimary type="button">Exportar Excel (.xlsx)</ButtonPrimary>
        </a>
      </div>

      <form className="mt-6 grid gap-3 md:grid-cols-6" onSubmit={onSubmit}>
        <Input
          className="md:col-span-2"
          name="q"
          placeholder="Buscar (nombre, email, idea…)"
          value={form.q}
          onChange={(e) => update("q", e.target.value)}
        />

        <Select name="genero" value={form.genero} onChange={(e) => update("genero", e.target.value)}>
          <option value="">Sexo (todos)</option>
          <option value="Femenino">Femenino</option>
          <option value="Masculino">Masculino</option>
        </Select>

        <Input name="centro" placeholder="Centro" value={form.centro} onChange={(e) => update("centro", e.target.value)} />
        <Input name="curso" placeholder="Curso" value={form.curso} onChange={(e) => update("curso", e.target.value)} />
        <Input
          name="modalidad"
          placeholder="Modalidad"
          value={form.modalidad}
          onChange={(e) => update("modalidad", e.target.value)}
        />

        <div className="md:col-span-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            className="flex-1"
            name="idea"
            placeholder="Idea carrera (filtro extra)"
            value={form.idea}
            onChange={(e) => update("idea", e.target.value)}
          />
          <ButtonGhost type="submit">Aplicar filtros</ButtonGhost>

          <ButtonGhost type="button" onClick={onClear}>
            Limpiar
          </ButtonGhost>
        </div>
      </form>

      <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
        <div className="grid grid-cols-12 gap-0 px-3 py-2 text-xs font-semibold text-[var(--muted-foreground)] border-b border-[var(--border)] bg-[var(--card)]">
          <div className="col-span-2">Fecha</div>
          <div className="col-span-3">Nombre</div>
          <div className="col-span-3">Email</div>
          <div className="col-span-1">Edad</div>
          <div className="col-span-1">Curso</div>
          <div className="col-span-1">Modalidad</div>
          <div className="col-span-1 text-right">Ver</div>
        </div>

        <div className="divide-y divide-[var(--border)]">
          {rows.map((r: any) => (
            <div
              key={r.id}
              className="grid grid-cols-12 px-3 py-3 text-sm items-center hover:bg-black/5 dark:hover:bg-white/5 transition"
            >
              <div className="col-span-2 text-[var(--muted-foreground)] whitespace-nowrap">{toISODate(new Date(r.createdAt))}</div>

              <div className="col-span-3">
                <div className="font-semibold text-[var(--foreground)]">
                  {r.nombre} {r.apellido}
                </div>
                <div className="text-xs text-[var(--muted-foreground)]">{r.genero} · {r.centroEducativo ?? "—"}</div>
              </div>

              <div className="col-span-3 whitespace-nowrap text-[var(--foreground)]">{r.user.email}</div>

              <div className="col-span-1 whitespace-nowrap text-[var(--foreground)]">
                {ageFromBirthdate(new Date(r.fechaNacimiento))}
              </div>

              <div className="col-span-1 whitespace-nowrap text-[var(--foreground)]">{r.curso}</div>
              <div className="col-span-1 whitespace-nowrap text-[var(--foreground)]">{r.modalidad}</div>

              <div className="col-span-1 text-right">
                <ButtonGhost
                  type="button"
                  className="px-3 py-1.5 text-xs"
                  onClick={() => {
                    setTab("resultados");
                    setOpenId(r.id);
                  }}
                >
                  Ver
                </ButtonGhost>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/45" onClick={() => setOpenId(null)} />

          <div className="absolute right-0 top-0 h-full w-full max-w-3xl bg-[var(--card)] text-[var(--foreground)] shadow-2xl border-l border-[var(--border)] overflow-y-auto">
            <div className="p-5 border-b border-[var(--border)] flex items-start justify-between gap-4">
              <div>
                <div className="text-xs text-[var(--muted-foreground)]">{toISODate(new Date(selected.createdAt))}</div>
                <div className="text-lg font-bold text-[var(--foreground)]">
                  {selected.nombre} {selected.apellido}
                </div>
                <div className="text-sm text-[var(--muted-foreground)]">{selected.user.email}</div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <ButtonPrimary type="button" className="text-xs px-3 py-2" onClick={downloadPdfReport}>
                  📄 PDF Informe Completo
                </ButtonPrimary>
                <ButtonPrimary type="button" className="text-xs px-3 py-2" onClick={downloadPdfMap}>
                  🎓 PDF Mapa
                </ButtonPrimary>
                <ButtonGhost type="button" className="text-xs px-3 py-2" onClick={downloadJson}>
                  JSON
                </ButtonGhost>
                <ButtonGhost type="button" className="text-xs px-3 py-2" onClick={() => downloadTabHtml(tab)}>
                  HTML
                </ButtonGhost>
                {tab === "mapa" ? (
                  <ButtonGhost type="button" className="text-xs px-3 py-2" onClick={downloadMapSvgPng}>
                    SVG/PNG
                  </ButtonGhost>
                ) : null}
                <ButtonGhost type="button" onClick={() => setOpenId(null)}>
                  Cerrar
                </ButtonGhost>
              </div>
            </div>

            <div className="px-5 pt-4">
              <div className="inline-flex rounded-xl border border-[var(--border)] overflow-hidden">
                {([
                  ["resultados", "Resultados"],
                  ["mapa", "Mapa"],
                  ["informe", "Informe"],
                ] as const).map(([k, label]) => (
                  <button
                    key={k}
                    className={cx(
                      "px-4 py-2 text-sm font-semibold",
                      tab === k ? "bg-[var(--foreground)] text-[var(--background)]" : "bg-[var(--card)] text-[var(--foreground)]"
                    )}
                    onClick={() => setTab(k)}
                    type="button"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-5 space-y-6">
              <div className="rounded-2xl border border-[var(--border)] p-4 bg-[var(--card)]">
                <div className="text-xs font-semibold text-[var(--muted-foreground)] mb-2">Datos</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-[var(--muted-foreground)]">Edad:</span> {ageFromBirthdate(new Date(selected.fechaNacimiento))}
                  </div>
                  <div>
                    <span className="text-[var(--muted-foreground)]">Sexo:</span> {selected.genero}
                  </div>
                  <div>
                    <span className="text-[var(--muted-foreground)]">Curso:</span> {selected.curso}
                  </div>
                  <div>
                    <span className="text-[var(--muted-foreground)]">Modalidad:</span> {selected.modalidad}
                  </div>
                  <div className="col-span-2">
                    <span className="text-[var(--muted-foreground)]">Centro:</span> {selected.centroEducativo ?? "—"}
                  </div>
                </div>
              </div>

              {!assessment ? (
                <div className="rounded-2xl border border-[var(--border)] p-4 bg-[var(--card)]">
                  <div className="text-sm text-[var(--muted-foreground)]">Sin assessment asociado.</div>
                </div>
              ) : tab === "resultados" ? (
                <div className="rounded-2xl border border-[var(--border)] p-4 bg-[var(--card)]">
                  <div className="text-xs font-semibold text-[var(--muted-foreground)] mb-3">Top 3</div>
                  <div className="grid gap-3">
                    {top3Rows.map((t: any) => {
                      const p = pct(t.score, t.max);
                      const indicator = scoreIndicator(t.score, t.max);
                      return (
                        <div key={String(t.talentId)} className="rounded-xl border border-[var(--border)] p-3 bg-[var(--card)]">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <div className="font-semibold text-[var(--foreground)]">
                                {t.code} · {t.reportTitle || t.quizTitle}
                              </div>
                              <div className="text-xs text-[var(--muted-foreground)]">{t.quizTitle}</div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <Donut value={p} />
                              <Pill>{indicator}</Pill>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 rounded-xl border border-[var(--border)] p-3 bg-[var(--card)]">
                    <div className="text-xs font-semibold text-[var(--muted-foreground)] mb-2">Todos los talentos</div>
                    <div className="grid gap-2">
                      {talents
                        .slice()
                        .sort((a: any, b: any) => a.id - b.id)
                        .map((t: any) => {
                          const s = scores.find((x) => x.talentId === t.id);
                          const p = pct(s?.score ?? 0, s?.max ?? 0);
                          const indicator = scoreIndicator(s?.score ?? 0, s?.max ?? 0);
                          const danger = p >= 65;
                          return (
                            <div key={t.id} className="flex items-center justify-between gap-3">
                              <div className="text-sm">
                                <span className="font-semibold">{t.code}</span>
                                <span className="text-[var(--muted-foreground)]"> · {t.reportTitle || t.quizTitle}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className={cx("text-sm font-bold", danger ? "text-[var(--danger)]" : "text-[var(--foreground)]")}>{p}%</div>
                                <Pill>{indicator}</Pill>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  {/* NUEVO: Acordeones con respuestas detalladas por talento */}
                  <div className="mt-4 rounded-xl border border-[var(--border)] p-3 bg-[var(--card)]">
                    <div className="text-xs font-semibold text-[var(--muted-foreground)] mb-3">Detalle de respuestas por talento</div>
                    <div className="space-y-2">
                      {rankedTalents.map((t: any) => {
                        const talentQuestions = questionsByTalent.get(t.id) || [];
                        if (talentQuestions.length === 0) return null;

                        return (
                          <Accordion key={t.id} title={`${t.code} · ${t.reportTitle || t.quizTitle} (${t.score}/${t.max})`}>
                            <div className="space-y-3">
                              {talentQuestions.map((item) => (
                                <div key={item.itemId} className="p-3 rounded-lg bg-[var(--background)] border border-[var(--border)]">
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1">
                                      <div className="text-xs text-[var(--muted-foreground)] mb-1">
                                        {STEM}
                                      </div>
                                      <div className="text-sm text-[var(--foreground)]">
                                        {normalizeItemText(item.text)}
                                      </div>
                                    </div>
                                    <div className="flex-shrink-0">
                                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[var(--foreground)] text-[var(--background)] text-sm font-bold">
                                        {item.answer}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </Accordion>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : tab === "mapa" ? (
                <div className="rounded-2xl border border-[var(--border)] p-4 bg-[var(--card)]">
                  <div className="text-xs font-semibold text-[var(--muted-foreground)] mb-2">Mapa</div>
                  <TalentWheelSVG scores={scores} svgRef={svgRef} />
                  <div className="mt-3 text-xs text-[var(--muted-foreground)]">
                    Mapa visual de tus talentos basado en neurociencia aplicada.
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-[var(--border)] p-4 bg-[var(--card)]">
                  <div className="text-xs font-semibold text-[var(--muted-foreground)] mb-2">Informe completo</div>
                  <div className="text-sm text-[var(--muted-foreground)]">
                    Haz clic en <b>"📄 PDF Informe Completo"</b> arriba para descargar el informe completo en PDF con todas las secciones.
                  </div>
                  <div className="mt-3 rounded-xl border border-[var(--border)] p-3 bg-[var(--background)]">
                    <div className="text-sm font-bold">El PDF incluye:</div>
                    <ul className="list-disc pl-5 text-sm text-[var(--muted-foreground)] mt-2">
                      <li>Portada con mapa circular y leyenda de categorías</li>
                      <li>Top 3 talentos con símbolos y descripciones completas</li>
                      <li>Tabla completa con todos los talentos</li>
                      <li>Profesiones y roles sugeridos</li>
                      <li><b>Página individual por cada talento</b> (ámbitos, competencias, roles)</li>
                      <li>Detalle de respuestas (0–3)</li>
                    </ul>
                  </div>
                </div>
              )}

              <div className="pb-10" />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

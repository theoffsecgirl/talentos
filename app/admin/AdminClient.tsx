"use client";

import React, { useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const STEM = "ME GUSTAN LAS ACTIVIDADES O PIENSO EN UNA PROFESIÓN DONDE...";

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

function normalizeItemText(s: string) {
  const t = (s ?? "").trim().replace(/\s+/g, " ");
  if (!t) return "";
  // ✅ Primera letra en mayúscula (sin tocar acrónimos)
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
    // Evita CORS: SVG generado localmente
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
      fields: Array.isArray(t?.fields) ? t.fields : [],
      competencies: Array.isArray(t?.competencies) ? t.competencies : [],
      exampleRoles: Array.isArray(t?.exampleRoles) ? t.exampleRoles : [],
      score: s.score ?? 0,
      max: s.max ?? 0,
    };
  });
}

function WheelMapSVG({
  talents,
  scores,
  answers,
  questionMap,
  svgRef,
}: {
  talents: any[];
  scores: ScoreRow[];
  answers: Record<string, number>;
  questionMap: Record<string, { text: string; talentQuizTitle: string; talentId: number; idxInTalent: number }>;
  svgRef?: React.RefObject<SVGSVGElement | null>;
}) {
  // 8 sectores fijos (orden por id)
  const ordered = talents.slice().sort((a, b) => a.id - b.id);
  const W = 760;
  const H = 760;
  const cx0 = W / 2;
  const cy0 = H / 2;
  const outerR = 340;
  const ringW = 62;
  const innerR = outerR - ringW;
  const gridR = innerR - 24;

  const palette = [
    "#ef4444",
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#a855f7",
    "#06b6d4",
    "#22c55e",
    "#111827",
  ];

  function polar(r: number, a: number) {
    return { x: cx0 + r * Math.cos(a), y: cy0 + r * Math.sin(a) };
  }

  function arcPath(rOut: number, rIn: number, a0: number, a1: number) {
    const p0 = polar(rOut, a0);
    const p1 = polar(rOut, a1);
    const p2 = polar(rIn, a1);
    const p3 = polar(rIn, a0);
    const large = a1 - a0 > Math.PI ? 1 : 0;
    return [
      `M ${p0.x} ${p0.y}`,
      `A ${rOut} ${rOut} 0 ${large} 1 ${p1.x} ${p1.y}`,
      `L ${p2.x} ${p2.y}`,
      `A ${rIn} ${rIn} 0 ${large} 0 ${p3.x} ${p3.y}`,
      "Z",
    ].join(" ");
  }

  const scoreById = new Map(scores.map((s) => [s.talentId, s]));

  // puntos: cada pregunta en su sector, con distancia radial según respuesta 0-3
  const points = Object.entries(answers)
    .map(([qid, v]) => {
      const m = questionMap[qid];
      if (!m) return null;
      const tid = m.talentId;
      const secIdx = ordered.findIndex((t) => t.id === tid);
      if (secIdx < 0) return null;
      const val = Number(v);
      const aStart = -Math.PI / 2 + (secIdx * (2 * Math.PI)) / ordered.length;
      const aEnd = -Math.PI / 2 + ((secIdx + 1) * (2 * Math.PI)) / ordered.length;
      // ángulo dentro del sector según idx (1..5)
      const k = (m.idxInTalent + 1) / 6;
      const ang = aStart + (aEnd - aStart) * k;
      const rr = (val / 3) * (gridR - 40) + 40;
      const p = polar(rr, ang);
      return {
        qid,
        val,
        x: p.x,
        y: p.y,
        tid,
        label: `${m.talentQuizTitle} · ${qid} · ${val}`,
      };
    })
    .filter(Boolean) as Array<{ qid: string; val: number; x: number; y: number; tid: number; label: string }>;

  return (
    <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} width="100%" className="max-w-full">
      <rect x="0" y="0" width={W} height={H} fill="#ffffff" />

      {/* rejilla radial */}
      {[0.25, 0.5, 0.75, 1].map((k) => (
        <circle key={k} cx={cx0} cy={cy0} r={gridR * k} fill="none" stroke="#e5e7eb" strokeWidth="2" />
      ))}
      {ordered.map((t, i) => {
        const a = -Math.PI / 2 + (i * (2 * Math.PI)) / ordered.length;
        const p = polar(gridR, a);
        return <line key={t.id} x1={cx0} y1={cy0} x2={p.x} y2={p.y} stroke="#e5e7eb" strokeWidth="2" />;
      })}

      {/* anillo de talentos */}
      {ordered.map((t, i) => {
        const a0 = -Math.PI / 2 + (i * (2 * Math.PI)) / ordered.length;
        const a1 = -Math.PI / 2 + ((i + 1) * (2 * Math.PI)) / ordered.length;
        const s = scoreById.get(t.id);
        const p = pct(s?.score ?? 0, s?.max ?? 0);
        const mid = (a0 + a1) / 2;
        const labelPos = polar(outerR - ringW / 2, mid);
        const color = palette[i % palette.length];
        return (
          <g key={t.id}>
            <path d={arcPath(outerR, innerR, a0, a1)} fill={color} opacity="0.92" />
            <text
              x={labelPos.x}
              y={labelPos.y - 6}
              textAnchor="middle"
              fontSize="18"
              fontWeight="700"
              fill="#ffffff"
            >
              {t.code}
            </text>
            <text x={labelPos.x} y={labelPos.y + 16} textAnchor="middle" fontSize="14" fill="#ffffff">
              {p}%
            </text>
          </g>
        );
      })}

      {/* puntos */}
      {points.map((pt) => (
        <g key={pt.qid}>
          <title>{pt.label}</title>
          <circle cx={pt.x} cy={pt.y} r={10} fill="#111827" opacity="0.92" />
          <text x={pt.x} y={pt.y + 5} textAnchor="middle" fontSize="11" fill="#ffffff" fontWeight="700">
            {pt.qid.split(".")[1]}
          </text>
        </g>
      ))}

      {/* centro */}
      <circle cx={cx0} cy={cy0} r={18} fill="#111827" />
      <text x={cx0} y={cy0 + 5} textAnchor="middle" fontSize="12" fill="#ffffff" fontWeight="700">
        0–3
      </text>
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

  // “Estilo Abel” = portada fuerte + resumen + páginas por talento + cierre
  const cover = `
  <section class="page">
    <div class="pill">NEUROCIENCIA APLICADA · CONOCE TU TALENTO</div>
    <div style="display:flex;justify-content:space-between;gap:16px;margin-top:18px;align-items:flex-end">
      <div>
        <h1 class="h1">CONOCE TU<br/>TALENTO</h1>
        <div class="muted" style="font-size:14px;">Informe individual</div>
        <div style="margin-top:18px;font-size:16px;font-weight:800">${selected.nombre} ${selected.apellido}</div>
        <div class="muted" style="margin-top:4px">${toISODate(new Date(selected.createdAt))}</div>
      </div>
      <div class="card" style="width:360px">
        <div class="muted" style="font-size:12px;font-weight:700">Top 3 talentos</div>
        <div class="grid" style="margin-top:10px">
          ${top3Rows
            .map((t) => {
              const p = pct(t.score, t.max);
              const danger = p >= 65;
              return `
                <div>
                  <div style="display:flex;justify-content:space-between;gap:10px;align-items:center">
                    <div style="font-weight:900">${t.code} · ${t.reportTitle || t.quizTitle}</div>
                    <div style="font-weight:900;color:${danger ? "var(--danger)" : "var(--fg)"}">${p}%</div>
                  </div>
                  <div class="bar ${danger ? "danger" : ""}"><span style="width:${p}%"></span></div>
                </div>`;
            })
            .join("\n")}
        </div>
      </div>
    </div>
  </section>`;

  const resumen = `
  <section class="page">
    <h2 class="h2">Resumen de resultados</h2>
    <div class="muted" style="font-size:13px">Porcentajes normalizados sobre el máximo posible de cada talento (0–3 por pregunta).</div>
    <div class="grid grid2" style="margin-top:14px">
      ${ordered
        .map((t) => {
          const s = byId.get(t.id);
          const p = pct(s?.score ?? 0, s?.max ?? 0);
          const danger = p >= 65;
          return `
            <div class="card">
              <div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start">
                <div>
                  <div style="font-weight:900">${t.code} · ${t.reportTitle || t.quizTitle}</div>
                  <div class="muted" style="font-size:12px;margin-top:4px">${t.titleGenotype || ""}</div>
                </div>
                <div style="font-weight:900;color:${danger ? "var(--danger)" : "var(--fg)"}">${p}%</div>
              </div>
              <div class="bar ${danger ? "danger" : ""}" style="margin-top:10px"><span style="width:${p}%"></span></div>
            </div>`;
        })
        .join("\n")}
    </div>
    <div style="margin-top:16px" class="card">
      <div style="font-weight:900;margin-bottom:8px">Mapa visual</div>
      <div>${mapSvg}</div>
      <div class="muted" style="font-size:12px;margin-top:8px">Los puntos (1–5) representan las preguntas de cada talento; cuanto más lejos del centro, mayor acuerdo (0–3).</div>
    </div>
  </section>`;

  const pages = ordered
    .map((t) => {
      const s = byId.get(t.id);
      const p = pct(s?.score ?? 0, s?.max ?? 0);
      const danger = p >= 65;
      const fields = (t.fields ?? []).map((x: string) => `<li>${x}</li>`).join("");
      const comps = (t.competencies ?? []).map((x: string) => `<li>${x}</li>`).join("");
      const roles = (t.exampleRoles ?? []).map((x: string) => `<li>${x}</li>`).join("");

      return `
      <section class="page">
        <div class="pill">${t.code} · ${t.titleSymbolic || ""} · ${t.titleGenotype || ""}</div>
        <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-end;margin-top:14px">
          <div>
            <h2 class="h2">${t.reportTitle || t.quizTitle}</h2>
            <div class="muted" style="font-size:13px">${t.quizTitle}</div>
          </div>
          <div style="text-align:right">
            <div class="muted" style="font-size:12px;font-weight:700">Puntuación</div>
            <div style="font-size:28px;font-weight:900;color:${danger ? "var(--danger)" : "var(--fg)"}">${p}%</div>
          </div>
        </div>
        <div class="card" style="margin-top:14px">
          <div style="font-weight:900;margin-bottom:6px">Lectura rápida</div>
          <div style="font-size:13px" class="muted">${t.reportSummary || ""}</div>
        </div>
        <div class="grid grid2" style="margin-top:12px">
          <div class="card">
            <div style="font-weight:900;margin-bottom:8px">Campos profesionales</div>
            <ul style="margin:0;padding-left:18px;font-size:13px" class="muted">${fields}</ul>
          </div>
          <div class="card">
            <div style="font-weight:900;margin-bottom:8px">Competencias personales</div>
            <ul style="margin:0;padding-left:18px;font-size:13px" class="muted">${comps}</ul>
          </div>
        </div>
        <div class="card" style="margin-top:12px">
          <div style="font-weight:900;margin-bottom:8px">Roles ejemplo</div>
          <ul style="margin:0;padding-left:18px;font-size:13px" class="muted">${roles}</ul>
        </div>
      </section>`;
    })
    .join("\n");

  // tabla final (X 0-3)
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
    <div class="muted" style="font-size:13px">Escala 0–3. Marca “X” en la columna correspondiente.</div>
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

  return cover + resumen + pages + cierre;
}

export default function AdminClient({ rows, exportHref, talents, filters }: any) {
  const router = useRouter();
  const pathname = usePathname();

  const [openId, setOpenId] = useState<string | null>(null);
  const [tab, setTab] = useState<"resultados" | "mapa" | "informe">("resultados");

  // filtros
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

  // pregunta -> (texto, quizTitle, talentId, idx)
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
      // embebido directo
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
          <div class="muted" style="font-size:12px;margin-top:10px">Puntos 1–5 por talento. Cuanto más lejos del centro, mayor acuerdo (0–3).</div>
        </section>`;
    } else if (which === "resultados") {
      body = `
        <section class="page">
          <div class="pill">Resultados</div>
          <h1 class="h1" style="margin-top:12px">${selected.nombre} ${selected.apellido}</h1>
          <div class="muted">${toISODate(new Date(selected.createdAt))}</div>

          <div class="grid grid2" style="margin-top:14px">
            ${ordered
              .map((t: any) => {
                const s = byId.get(t.id);
                const p = pct(s?.score ?? 0, s?.max ?? 0);
                const danger = p >= 65;
                return `
                  <div class="card">
                    <div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start">
                      <div>
                        <div style="font-weight:900">${t.code} · ${t.reportTitle || t.quizTitle}</div>
                        <div class="muted" style="font-size:12px;margin-top:4px">${t.quizTitle}</div>
                      </div>
                      <div style="font-weight:900;color:${danger ? "var(--danger)" : "var(--fg)"}">${p}%</div>
                    </div>
                    <div class="bar ${danger ? "danger" : ""}" style="margin-top:10px"><span style="width:${p}%"></span></div>
                  </div>`;
              })
              .join("\n")}
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

      {/* Filtros */}
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

      {/* LISTA */}
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

      {/* DRAWER */}
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

              <div className="flex items-center gap-2">
                <ButtonGhost type="button" className="text-xs px-3 py-2" onClick={downloadJson}>
                  Descargar JSON
                </ButtonGhost>
                <ButtonGhost type="button" className="text-xs px-3 py-2" onClick={() => downloadTabHtml(tab)}>
                  Descargar {tab.toUpperCase()} (HTML)
                </ButtonGhost>
                {tab === "mapa" ? (
                  <ButtonGhost type="button" className="text-xs px-3 py-2" onClick={downloadMapSvgPng}>
                    Descargar SVG/PNG
                  </ButtonGhost>
                ) : null}
                <ButtonGhost type="button" onClick={() => setOpenId(null)}>
                  Cerrar
                </ButtonGhost>
              </div>
            </div>

            {/* Tabs */}
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
              {/* Datos */}
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
                      return (
                        <div key={String(t.talentId)} className="rounded-xl border border-[var(--border)] p-3 bg-[var(--card)]">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <div className="font-semibold text-[var(--foreground)]">
                                {t.code} · {t.reportTitle || t.quizTitle}
                              </div>
                              <div className="text-xs text-[var(--muted-foreground)]">{t.quizTitle}</div>
                            </div>
                            <Donut value={p} />
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
                          const danger = p >= 65;
                          return (
                            <div key={t.id} className="flex items-center justify-between gap-3">
                              <div className="text-sm">
                                <span className="font-semibold">{t.code}</span>
                                <span className="text-[var(--muted-foreground)]"> · {t.reportTitle || t.quizTitle}</span>
                              </div>
                              <div className={cx("text-sm font-bold", danger ? "text-[var(--danger)]" : "text-[var(--foreground)]")}>{p}%</div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              ) : tab === "mapa" ? (
                <div className="rounded-2xl border border-[var(--border)] p-4 bg-[var(--card)]">
                  <div className="text-xs font-semibold text-[var(--muted-foreground)] mb-2">Mapa</div>
                  <WheelMapSVG talents={talents} scores={scores} answers={answers} questionMap={QUESTION_MAP} svgRef={svgRef} />
                  <div className="mt-3 text-xs text-[var(--muted-foreground)]">
                    Pasa el ratón por un punto para ver el detalle. Los números 1–5 son las preguntas dentro de cada talento.
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-[var(--border)] p-4 bg-[var(--card)]">
                  <div className="text-xs font-semibold text-[var(--muted-foreground)] mb-2">Informe (vista previa)</div>
                  <div className="text-sm text-[var(--muted-foreground)]">
                    Para descargar el informe con el estilo “dossier”, usa <b>Descargar INFORME (HTML)</b> y ábrelo en el navegador.
                    Desde ahí puedes imprimir/guardar como PDF.
                  </div>
                  <div className="mt-3 rounded-xl border border-[var(--border)] p-3 bg-[var(--background)]">
                    <div className="text-sm font-bold">Incluye:</div>
                    <ul className="list-disc pl-5 text-sm text-[var(--muted-foreground)] mt-2">
                      <li>Portada</li>
                      <li>Resumen + mapa</li>
                      <li>Página por talento (campos, competencias, roles ejemplo)</li>
                      <li>Tabla final con X (0–3) por pregunta</li>
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

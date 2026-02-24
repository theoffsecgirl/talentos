"use client";

import React, { useMemo } from "react";

type TalentLike = {
  id: number;
  code: string;
  quizTitle: string;
  items?: Array<{ id: string; text: string }>;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function degToRad(d: number) {
  return (d * Math.PI) / 180;
}

function polar(cx: number, cy: number, r: number, aDeg: number) {
  const a = degToRad(aDeg);
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

function ringSectorPath(cx: number, cy: number, rOuter: number, rInner: number, a0: number, a1: number) {
  const p0 = polar(cx, cy, rOuter, a0);
  const p1 = polar(cx, cy, rOuter, a1);
  const p2 = polar(cx, cy, rInner, a1);
  const p3 = polar(cx, cy, rInner, a0);
  const large = Math.abs(a1 - a0) > 180 ? 1 : 0;
  return [
    `M ${p0.x.toFixed(2)} ${p0.y.toFixed(2)}`,
    `A ${rOuter} ${rOuter} 0 ${large} 1 ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`,
    `L ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`,
    `A ${rInner} ${rInner} 0 ${large} 0 ${p3.x.toFixed(2)} ${p3.y.toFixed(2)}`,
    "Z",
  ].join(" ");
}

function starPoints(cx: number, cy: number, rOuter: number, rInner: number, spikes = 5) {
  const pts: Array<string> = [];
  let rot = -Math.PI / 2;
  const step = Math.PI / spikes;
  for (let i = 0; i < spikes; i++) {
    const x1 = cx + Math.cos(rot) * rOuter;
    const y1 = cy + Math.sin(rot) * rOuter;
    pts.push(`${x1.toFixed(2)},${y1.toFixed(2)}`);
    rot += step;
    const x2 = cx + Math.cos(rot) * rInner;
    const y2 = cy + Math.sin(rot) * rInner;
    pts.push(`${x2.toFixed(2)},${y2.toFixed(2)}`);
    rot += step;
  }
  return pts.join(" ");
}

const DEFAULT_COLORS = [
  "#ef4444", // rojo
  "#f97316", // naranja
  "#eab308", // amarillo
  "#22c55e", // verde
  "#16a34a", // verde oscuro
  "#06b6d4", // cyan
  "#3b82f6", // azul
  "#6366f1", // índigo
];

export function TalentWheelMap({
  talents,
  answers,
  title,
}: {
  talents: TalentLike[];
  answers: Record<string, number | string>;
  title?: string;
}) {
  const ordered = useMemo(() => {
    return (Array.isArray(talents) ? talents : []).slice().sort((a, b) => (a.id ?? 0) - (b.id ?? 0)).slice(0, 8);
  }, [talents]);

  const points = useMemo(() => {
    // Construimos un índice 1..40 para rotular cada estrella.
    const seq: Array<{ qid: string; label: string; talentIdx: number; itemIdx: number }> = [];
    let n = 1;
    for (let ti = 0; ti < ordered.length; ti++) {
      const t = ordered[ti];
      const items = Array.isArray(t.items) ? t.items : [];
      for (let ii = 0; ii < items.length; ii++) {
        seq.push({ qid: items[ii].id, label: String(n), talentIdx: ti, itemIdx: ii });
        n++;
      }
    }
    return seq;
  }, [ordered]);

  const size = 520;
  const cx = size / 2;
  const cy = size / 2;

  const rOuter = 220;
  const rInner = 180;
  const rGridOuter = 170;
  const rGridInner = 35;

  const startDeg = -90; // arriba
  const sectorSpan = 360 / Math.max(1, ordered.length);

  return (
    <div className="space-y-3">
      {title ? <div className="text-xs font-semibold text-[var(--muted-foreground)]">{title}</div> : null}

      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="block mx-auto"
          style={{ width: "min(520px, 100%)", height: "auto" }}
        >
          {/* Anillo de roles */}
          {ordered.map((t, i) => {
            const a0 = startDeg + i * sectorSpan;
            const a1 = a0 + sectorSpan;
            const d = ringSectorPath(cx, cy, rOuter, rInner, a0, a1);
            const color = DEFAULT_COLORS[i % DEFAULT_COLORS.length];
            return (
              <path key={t.id} d={d} fill={color} opacity={0.95} />
            );
          })}

          {/* Círculos guía */}
          {[0.25, 0.5, 0.75, 1].map((k) => (
            <circle
              key={k}
              cx={cx}
              cy={cy}
              r={rGridInner + (rGridOuter - rGridInner) * k}
              fill="none"
              stroke="rgba(100,116,139,0.35)"
              strokeWidth={1}
            />
          ))}
          <circle cx={cx} cy={cy} r={rGridOuter} fill="none" stroke="rgba(100,116,139,0.45)" strokeWidth={1.2} />

          {/* Radios */}
          {ordered.map((t, i) => {
            const a = startDeg + i * sectorSpan;
            const p = polar(cx, cy, rGridOuter, a);
            return (
              <line
                key={t.id}
                x1={cx}
                y1={cy}
                x2={p.x}
                y2={p.y}
                stroke="rgba(100,116,139,0.35)"
                strokeWidth={1}
              />
            );
          })}

          {/* Etiquetas de sectores */}
          {ordered.map((t, i) => {
            const mid = startDeg + i * sectorSpan + sectorSpan / 2;
            const p = polar(cx, cy, (rOuter + rInner) / 2, mid);
            // giro del texto para que siga el anillo, sin complicar: solo rotamos ligeramente.
            const rot = mid + 90;
            return (
              <text
                key={`lbl-${t.id}`}
                x={p.x}
                y={p.y}
                fill="rgba(255,255,255,0.95)"
                fontSize={12}
                fontWeight={700}
                textAnchor="middle"
                dominantBaseline="middle"
                transform={`rotate(${rot.toFixed(2)} ${p.x.toFixed(2)} ${p.y.toFixed(2)})`}
              >
                {t.code}
              </text>
            );
          })}

          {/* Estrellas */}
          {points.map((p) => {
            const t = ordered[p.talentIdx];
            const items = Array.isArray(t?.items) ? t.items : [];
            const nItems = Math.max(1, items.length);
            const a0 = startDeg + p.talentIdx * sectorSpan;
            const a1 = a0 + sectorSpan;
            const a = a0 + ((p.itemIdx + 1) / (nItems + 1)) * (a1 - a0);

            const raw = answers?.[p.qid];
            const v = clamp(Number(raw ?? 0), 0, 3);
            const r = rGridInner + (v / 3) * (rGridOuter - rGridInner);
            const pos = polar(cx, cy, r, a);
            const fill = "rgba(15,23,42,0.9)";
            const stroke = "rgba(255,255,255,0.85)";
            const sp = starPoints(pos.x, pos.y, 7, 3.2, 5);
            const lp = polar(cx, cy, r + 14, a);
            return (
              <g key={p.qid}>
                <polygon points={sp} fill={fill} stroke={stroke} strokeWidth={0.9} />
                <text
                  x={lp.x}
                  y={lp.y}
                  fill="rgba(15,23,42,0.85)"
                  fontSize={10}
                  fontWeight={700}
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {p.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="grid gap-2">
        <div className="text-xs text-[var(--muted-foreground)]">
          Las estrellas representan cada pregunta (1–40). Cuanto más lejos del centro, mayor afinidad.
        </div>
        <div className="text-xs text-[var(--muted-foreground)]">
          Nota: esta rueda es una adaptación visual (no reproduce exactamente el gráfico del proveedor).
        </div>
      </div>
    </div>
  );
}

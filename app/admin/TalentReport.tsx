"use client";

import React, { useMemo, useState } from "react";
import { TalentWheelMap } from "./TalentWheelMap";

type TalentLike = {
  id: number;
  code: string;
  quizTitle: string;
  items?: Array<{ id: string; text: string }>;
};

type QuestionItem = {
  itemId: string;
  text: string;
  answer: number;
};

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

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function pct(score: number, max: number) {
  return max > 0 ? clamp(Math.round((score / max) * 100), 0, 100) : 0;
}

function Donut({ score, max }: { score: number; max: number }) {
  const p = pct(score, max);
  const color = p >= 65 ? "var(--danger)" : "var(--foreground)";
  const size = 52;
  const r = 20;
  const c = 2 * Math.PI * r;
  const dash = (p / 100) * c;
  return (
    <div className="flex items-center gap-3">
      <svg width={size} height={size} viewBox="0 0 52 52" aria-label={`${p}%`}>
        <circle cx="26" cy="26" r={r} fill="none" stroke="rgba(100,116,139,0.25)" strokeWidth="6" />
        <circle
          cx="26"
          cy="26"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          transform="rotate(-90 26 26)"
        />
        <text x="26" y="29" textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--foreground)">
          {p}%
        </text>
      </svg>
    </div>
  );
}

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
          className={`w-5 h-5 text-[var(--muted-foreground)] transition-transform ${isOpen ? 'rotate-180' : ''}`}
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

const STEM = "ME GUSTAN LAS ACTIVIDADES O PIENSO EN UNA PROFESIÓN DONDE...";

export function TalentReport({
  person,
  talents,
  assessment,
}: {
  person: any;
  talents: TalentLike[];
  assessment: any;
}) {
  const answers: Record<string, number | string> =
    assessment?.answersJson && typeof assessment.answersJson === "object" ? (assessment.answersJson as any) : {};

  const scores: Array<{ talentId: number; score: number; max: number }> = useMemo(() => {
    if (!assessment?.scoresJson || !Array.isArray(assessment.scoresJson)) return [];
    return assessment.scoresJson
      .map((s: any) => ({ talentId: Number(s.talentId), score: Number(s.score ?? 0), max: Number(s.max ?? 0) }))
      .sort((a: { score: number }, b: { score: number }) => (b.score ?? 0) - (a.score ?? 0));
  }, [assessment]);

  const top3 = scores.slice(0, 3).map((s) => {
    const t = (Array.isArray(talents) ? talents : []).find((x) => x.id === s.talentId);
    return {
      ...s,
      code: t?.code ?? `T${s.talentId}`,
      title: t?.quizTitle ?? `Talento ${s.talentId}`,
    };
  });

  const orderedQuestions = useMemo(() => {
    const out: Array<{ qid: string; text: string; talent: string }> = [];
    const ordered = (Array.isArray(talents) ? talents : []).slice().sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
    for (const t of ordered) {
      const items = Array.isArray(t.items) ? t.items : [];
      for (const it of items) {
        out.push({ qid: it.id, text: it.text, talent: t.quizTitle });
      }
    }
    return out;
  }, [talents]);

  // Agrupar preguntas por talento
  const questionsByTalent = useMemo(() => {
    const map = new Map<number, QuestionItem[]>();
    
    for (const t of talents) {
      if (!map.has(t.id)) {
        map.set(t.id, []);
      }
      const items = Array.isArray(t.items) ? t.items : [];
      for (const it of items) {
        const list = map.get(t.id);
        if (list) {
          list.push({
            itemId: it.id,
            text: it.text,
            answer: Number(answers[it.id] ?? 0),
          });
        }
      }
    }
    
    return map;
  }, [talents, answers]);

  // Ordenar talentos por puntuación
  const rankedTalents = useMemo(() => {
    return talents.map((t) => {
      const scoreData = scores.find((s) => s.talentId === t.id);
      return {
        ...t,
        score: scoreData?.score ?? 0,
        max: scoreData?.max ?? 0,
      };
    }).sort((a, b) => b.score - a.score);
  }, [talents, scores]);

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 space-y-5">
      {/* Cabecera */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs text-[var(--muted-foreground)]">Informe de Talentos</div>
          <div className="text-lg font-bold text-[var(--foreground)]">
            {person?.nombre} {person?.apellido}
          </div>
          <div className="text-sm text-[var(--muted-foreground)]">
            {person?.user?.email ?? "—"} · {person?.genero ?? "—"} · {person?.fechaNacimiento ? ageFromBirthdate(new Date(person.fechaNacimiento)) : "—"} años
          </div>
        </div>
        <div className="text-xs text-[var(--muted-foreground)]">{assessment?.createdAt ? toISODate(new Date(assessment.createdAt)) : "—"}</div>
      </div>

      {/* Top 3 */}
      <div className="grid gap-3">
        <div className="text-xs font-semibold text-[var(--muted-foreground)]">Top 3 talentos</div>
        <div className="grid sm:grid-cols-3 gap-3">
          {top3.map((t) => (
            <div key={t.talentId} className="rounded-xl border border-[var(--border)] p-4 bg-[var(--card)]">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs text-[var(--muted-foreground)]">{t.code}</div>
                  <div className="font-semibold text-[var(--foreground)] leading-snug">{t.title}</div>
                </div>
                <Donut score={t.score} max={t.max} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mapa */}
      <div className="rounded-2xl border border-[var(--border)] p-4 bg-[var(--card)]">
        <TalentWheelMap talents={talents} answers={answers} title="Mapa (rueda)" />
      </div>

      {/* NUEVO: Acordeones con respuestas por talento */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-[var(--muted-foreground)]">Detalle de respuestas por talento</div>
        {rankedTalents.map((t) => {
          const talentQuestions = questionsByTalent.get(t.id) || [];
          return (
            <Accordion key={t.id} title={`${t.code} · ${t.quizTitle} (${t.score}/${t.max})`}>
              <div className="space-y-3">
                {talentQuestions.map((item) => (
                  <div key={item.itemId} className="p-3 rounded-lg bg-[var(--background)] border border-[var(--border)]">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="text-xs text-[var(--muted-foreground)] mb-1">
                          {STEM}
                        </div>
                        <div className="text-sm text-[var(--foreground)]">
                          {item.text}
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

      {/* Tabla marcada (mantener para compatibilidad) */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-[var(--muted-foreground)]">Detalle por pregunta (tabla)</div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-[var(--muted-foreground)]">
                <th className="py-2 pr-2 text-left">ID</th>
                <th className="py-2 pr-2 text-left">Pregunta</th>
                <th className="py-2 pr-2 text-left">0</th>
                <th className="py-2 pr-2 text-left">1</th>
                <th className="py-2 pr-2 text-left">2</th>
                <th className="py-2 text-left">3</th>
              </tr>
            </thead>
            <tbody>
              {orderedQuestions.map((q) => {
                const n = clamp(Number(answers[q.qid] ?? 0), 0, 3);
                return (
                  <tr key={q.qid} className="border-t border-[var(--border)]">
                    <td className="py-2 pr-2 align-top text-[var(--muted-foreground)]">{q.qid}</td>
                    <td className="py-2 pr-2 align-top">
                      <div className="font-medium text-[var(--foreground)]">{q.text}</div>
                      <div className="text-[10px] text-[var(--muted-foreground)]">{q.talent}</div>
                    </td>
                    {[0, 1, 2, 3].map((k) => (
                      <td key={k} className="py-2 pr-2 align-top">
                        <span
                          className={
                            "inline-flex h-6 w-6 items-center justify-center rounded-md border " +
                            (n === k
                              ? "border-[var(--foreground)] bg-black/5 dark:bg-white/5 font-semibold"
                              : "border-[var(--border)]")
                          }
                        >
                          {n === k ? "X" : ""}
                        </span>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

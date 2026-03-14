"use client";

import React, { useMemo, useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import BothTalentWheels from "@/components/BothTalentWheels";
import TalentWheel from "@/components/TalentWheel";
import { exportTalentModelPDF, RankedTalent } from "@/lib/generateTalentModelPDF";
import { TALENTS } from "@/lib/talents";

const STEM = "ME GUSTAN LAS ACTIVIDADES O PIENSO EN UNA PROFESIÓN DONDE...";

const TALENT_CONFIG: Record<number, { symbol: string; color: string; secondaryColor: string; category: string; categoryLabel: string }> = {
  4: { symbol: "□", color: "#EF4444", secondaryColor: "#F87171", category: "Acción", categoryLabel: "Resultados" },
  1: { symbol: "△", color: "#DC2626", secondaryColor: "#EF4444", category: "Acción", categoryLabel: "Resultados" },
  6: { symbol: "⬭", color: "#06B6D4", secondaryColor: "#22D3EE", category: "Imaginación", categoryLabel: "Arte" },
  7: { symbol: "◇", color: "#10B981", secondaryColor: "#34D399", category: "Imaginación", categoryLabel: "Arte" },
  8: { symbol: "▭", color: "#D97706", secondaryColor: "#F59E0B", category: "Desempeño", categoryLabel: "Proyección" },
  5: { symbol: "○", color: "#F59E0B", secondaryColor: "#FBBF24", category: "Desempeño", categoryLabel: "Proyección" },
  2: { symbol: "⬟", color: "#8B5CF6", secondaryColor: "#A78BFA", category: "Conocimiento", categoryLabel: "Ciencia aplicada" },
  3: { symbol: "∞", color: "#7C3AED", secondaryColor: "#8B5CF6", category: "Conocimiento", categoryLabel: "Facilitación" },
};

const TALENT_ORDER = [4, 1, 6, 7, 8, 5, 2, 3];

function calculateRanked(answers: Record<string, number>): RankedTalent[] {
  return TALENTS.map((t) => {
    const score = t.items.reduce((sum, item) => sum + (answers[item.id] ?? 0), 0);
    const max = t.items.length * 3;
    return {
      id: t.id,
      code: t.code,
      quizTitle: t.quizTitle,
      titleSymbolic: t.titleSymbolic,
      titleGenotype: t.titleGenotype,
      reportTitle: t.reportTitle,
      reportSummary: t.reportSummary,
      exampleRoles: Array.isArray(t.exampleRoles) ? t.exampleRoles : [],
      score,
      max,
    };
  }).sort((a, b) => b.score - a.score);
}

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function getRowAnswers(row: any): Record<string, number> | null {
  const ans = row.assessments?.[0]?.answersJson;
  return ans && typeof ans === "object" ? (ans as Record<string, number>) : null;
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
          cx="24" cy="24" r={r}
          fill="none"
          stroke={donutStroke(value)}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
          transform="rotate(-90 24 24)"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">{value}</div>
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
        <svg className={cx("w-5 h-5 text-[var(--muted-foreground)] transition-transform", isOpen && "rotate-180")} fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
  const scores = getScores(scoresJson).slice().sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).slice(0, n);
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

export default function AdminClient({ rows, exportHref, talents, filters, branding, fixedCenter }: any) {
  const router = useRouter();
  const pathname = usePathname();

  const [openId, setOpenId] = useState<string | null>(null);
  const [tab, setTab] = useState<"resultados" | "mapa">("resultados");
  const [svgReady, setSvgReady] = useState(false);

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
      ["q", form.q], ["genero", form.genero], ["centro", fixedCenter || form.centro],
      ["curso", form.curso], ["modalidad", form.modalidad], ["idea", form.idea],
    ];
    for (const [k, v] of entries) {
      const t = (v ?? "").trim();
      if (t) params.set(k, t);
    }
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  function onClear() {
    setForm({ q: "", genero: "", centro: fixedCenter || "", curso: "", modalidad: "", idea: "" });
    router.push(fixedCenter ? `${pathname}?centro=${encodeURIComponent(fixedCenter)}` : pathname);
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

  const questionsByTalent = useMemo(() => {
    const map = new Map<number, Array<{ itemId: string; text: string; answer: number }>>();
    Object.entries(answers).forEach(([itemId, answer]) => {
      const meta = QUESTION_MAP[itemId];
      if (!meta) return;
      if (!map.has(meta.talentId)) map.set(meta.talentId, []);
      map.get(meta.talentId)!.push({ itemId, text: meta.text, answer: Number(answer) });
    });
    return map;
  }, [answers, QUESTION_MAP]);

  useEffect(() => {
    if (selected) {
      const timer = setTimeout(() => setSvgReady(true), 300);
      return () => clearTimeout(timer);
    } else {
      setSvgReady(false);
    }
  }, [selected]);

  const rankedTalents = useMemo(() => {
    return talents.slice()
      .map((t: any) => {
        const s = scores.find((x) => x.talentId === t.id);
        return { ...t, score: s?.score ?? 0, max: s?.max ?? 0 };
      })
      .sort((a: any, b: any) => b.score - a.score);
  }, [talents, scores]);

  return (
    <main className="max-w-6xl mx-auto px-4 py-10 bg-[var(--background)] text-[var(--foreground)]">
      {branding ? (
        <div className="mb-6 rounded-3xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm">
          <img src={branding.logoSrc} alt={branding.name} className="h-24 w-auto object-contain" />
        </div>
      ) : null}
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
        <Input className="md:col-span-2" name="q" placeholder="Buscar (nombre, email, idea…)" value={form.q} onChange={(e) => update("q", e.target.value)} />
        <Select name="genero" value={form.genero} onChange={(e) => update("genero", e.target.value)}>
          <option value="">Sexo (todos)</option>
          <option value="Femenino">Femenino</option>
          <option value="Masculino">Masculino</option>
        </Select>
        <Input name="centro" placeholder="Centro" value={fixedCenter || form.centro} onChange={(e) => update("centro", e.target.value)} disabled={!!fixedCenter} />
        <Input name="curso" placeholder="Curso" value={form.curso} onChange={(e) => update("curso", e.target.value)} />
        <Input name="modalidad" placeholder="Modalidad" value={form.modalidad} onChange={(e) => update("modalidad", e.target.value)} />

        <div className="md:col-span-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input className="flex-1" name="idea" placeholder="Idea carrera (filtro extra)" value={form.idea} onChange={(e) => update("idea", e.target.value)} />
          <ButtonGhost type="submit">Aplicar filtros</ButtonGhost>
          <ButtonGhost type="button" onClick={onClear}>Limpiar</ButtonGhost>

          {/* Exportar masivo Talentos */}
          <ButtonGhost
            type="button"
            onClick={async () => {
              const JSZip = (window as any).JSZip;
              if (!JSZip) { alert('JSZip no está cargado'); return; }
              const zip = new JSZip();
              const fecha = new Date().toISOString().slice(0, 10);
              for (const r of rows) {
                const ans = getRowAnswers(r);
                if (!ans) continue;
                await exportTalentModelPDF(calculateRanked(ans), "genotipo", r.nombre, zip, undefined, { rolEscogido: r.campoIdentificado ?? r.identificaCampos ?? "", rolPensado: r.ideaCarreraTextoFinal ?? r.ideaCarrera ?? "" });
              }
              const content = await zip.generateAsync({ type: "blob" });
              const url = URL.createObjectURL(content);
              const a = document.createElement("a");
              a.href = url; a.download = `neurotalentos-talentos-${fecha}.zip`;
              document.body.appendChild(a); a.click(); a.remove();
              URL.revokeObjectURL(url);
            }}
          >
            Exportar filtrados (Talentos)
          </ButtonGhost>

          {/* Exportar masivo Neurotalento */}
          <ButtonGhost
            type="button"
            onClick={async () => {
              const JSZip = (window as any).JSZip;
              if (!JSZip) { alert('JSZip no está cargado'); return; }
              const zip = new JSZip();
              const fecha = new Date().toISOString().slice(0, 10);
              for (const r of rows) {
                const ans = getRowAnswers(r);
                if (!ans) continue;
                await exportTalentModelPDF(calculateRanked(ans), "neurotalento", r.nombre, zip, undefined, { rolEscogido: r.campoIdentificado ?? r.identificaCampos ?? "", rolPensado: r.ideaCarreraTextoFinal ?? r.ideaCarrera ?? "" });
              }
              const content = await zip.generateAsync({ type: "blob" });
              const url = URL.createObjectURL(content);
              const a = document.createElement("a");
              a.href = url; a.download = `neurotalentos-neurotalento-${fecha}.zip`;
              document.body.appendChild(a); a.click(); a.remove();
              URL.revokeObjectURL(url);
            }}
          >
            Exportar filtrados (Neurotalento)
          </ButtonGhost>
        </div>
      </form>

      {/* Tabla */}
      <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
        <div className="grid grid-cols-12 gap-0 px-3 py-2 text-xs font-semibold text-[var(--muted-foreground)] border-b border-[var(--border)] bg-[var(--card)]">
          <div className="col-span-2">Fecha</div>
          <div className="col-span-3">Nombre</div>
          <div className="col-span-2">Email</div>
          <div className="col-span-1">Edad</div>
          <div className="col-span-1">Curso</div>
          <div className="col-span-2">Modalidad</div>
          <div className="col-span-1 text-right">Acciones</div>
        </div>

        <div className="divide-y divide-[var(--border)]">
          {rows.map((r: any) => (
            <div
              key={r.id}
              className="grid grid-cols-12 px-3 py-3 text-sm items-center hover:bg-black/5 dark:hover:bg-white/5 transition"
            >
              <div className="col-span-2 text-[var(--muted-foreground)] whitespace-nowrap">{toISODate(new Date(r.createdAt))}</div>
              <div className="col-span-3">
                <div className="font-semibold text-[var(--foreground)]">{r.nombre} {r.apellido}</div>
                <div className="text-xs text-[var(--muted-foreground)]">{r.genero} · {r.centroEducativo ?? "—"}</div>
              </div>
              <div className="col-span-2 whitespace-nowrap overflow-hidden text-ellipsis text-[var(--foreground)]">{r.user.email}</div>
              <div className="col-span-1 whitespace-nowrap text-[var(--foreground)]">{ageFromBirthdate(new Date(r.fechaNacimiento))}</div>
              <div className="col-span-1 whitespace-nowrap text-[var(--foreground)]">{r.curso}</div>
              <div className="col-span-2 whitespace-nowrap text-[var(--foreground)]">{r.modalidad}</div>
              <div className="col-span-1 flex items-center justify-end">
                <ButtonGhost
                  type="button"
                  className="px-2 py-1 text-xs"
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
        <>
          <div id="hidden-talent-wheel" style={{ position: 'absolute', left: '-9999px', width: '600px', height: '600px' }}>
            <TalentWheel scores={scores} showFullLabels={true} />
          </div>

          <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/45" onClick={() => setOpenId(null)} />

            <div className="absolute right-0 top-0 h-full w-full max-w-3xl bg-[var(--card)] text-[var(--foreground)] shadow-2xl border-l border-[var(--border)] overflow-y-auto">
              <div className="p-5 border-b border-[var(--border)] flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs text-[var(--muted-foreground)]">{toISODate(new Date(selected.createdAt))}</div>
                  <div className="text-lg font-bold text-[var(--foreground)]">{selected.nombre} {selected.apellido}</div>
                  <div className="text-sm text-[var(--muted-foreground)]">{selected.user.email}</div>
                </div>
                <ButtonGhost type="button" onClick={() => setOpenId(null)}>Cerrar</ButtonGhost>
              </div>

              <div className="px-5 pt-4">
                <div className="inline-flex rounded-xl border border-[var(--border)] overflow-hidden">
                  {(["resultados", "mapa"] as const).map((k) => (
                    <button
                      key={k}
                      className={cx(
                        "px-4 py-2 text-sm font-semibold capitalize",
                        tab === k ? "bg-[var(--foreground)] text-[var(--background)]" : "bg-[var(--card)] text-[var(--foreground)]"
                      )}
                      onClick={() => setTab(k)}
                      type="button"
                    >
                      {k === "resultados" ? "Resultados" : "Mapa & PDFs"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-5 space-y-6">
                <div className="rounded-2xl border border-[var(--border)] p-4 bg-[var(--card)]">
                  <div className="text-xs font-semibold text-[var(--muted-foreground)] mb-2">Datos</div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-[var(--muted-foreground)]">Edad:</span> {ageFromBirthdate(new Date(selected.fechaNacimiento))}</div>
                    <div><span className="text-[var(--muted-foreground)]">Sexo:</span> {selected.genero}</div>
                    <div><span className="text-[var(--muted-foreground)]">Curso:</span> {selected.curso}</div>
                    <div><span className="text-[var(--muted-foreground)]">Modalidad:</span> {selected.modalidad}</div>
                    <div className="col-span-2"><span className="text-[var(--muted-foreground)]">Centro:</span> {selected.centroEducativo ?? "—"}</div>
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
                                <div className="font-semibold text-[var(--foreground)]">{t.code} · {t.reportTitle || t.quizTitle}</div>
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
                        {talents.slice().sort((a: any, b: any) => a.id - b.id).map((t: any) => {
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
                                <div className={cx("text-sm font-bold", danger ? "text-[var(--danger)]" : "text-[var(--foreground)]")}>{p}</div>
                                <Pill>{indicator}</Pill>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

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
                                        <div className="text-xs text-[var(--muted-foreground)] mb-1">{STEM}</div>
                                        <div className="text-sm text-[var(--foreground)]">{normalizeItemText(item.text)}</div>
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
                ) : (
                  /* Tab Mapa & PDFs — contiene BothTalentWheels con los 4 botones de descarga */
                  <div className="rounded-2xl border border-[var(--border)] p-4 bg-[var(--card)]">
                    <BothTalentWheels
                      scores={scores}
                      userName={`${selected.nombre} ${selected.apellido}`}
                    />
                  </div>
                )}

                <div className="pb-10" />
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
}

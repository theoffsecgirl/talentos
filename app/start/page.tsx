"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { TALENTS } from "@/lib/talents";
import TalentWheel from "@/components/TalentWheel";

type PreData = {
  nombre: string;
  email: string;
};

type PostData = {
  apellido: string;
  fechaNacimiento: string; // YYYY-MM-DD
  genero: "Femenino" | "Masculino" | "";
  curso: string;
  modalidad: string;
  centroEducativo: string;

  // idea de carrera (antes de "te identificas con alguno")
  ideaCarreraFinal: "Sí" | "No" | "";
  ideaCarreraTextoFinal: string;

  // "te identificas con alguno"
  identificaCampos: "Sí" | "No" | "";
  campoIdentificado: string;
};

type Answers = Record<string, number>;

type Question = {
  itemId: string;
  text: string;
  talentId: number;
  talentCode: string;
  talentQuizTitle: string;
};

const initialPre: PreData = {
  nombre: "",
  email: "",
};

const initialPost: PostData = {
  apellido: "",
  fechaNacimiento: "",
  genero: "",
  curso: "",
  modalidad: "",
  centroEducativo: "",

  ideaCarreraFinal: "",
  ideaCarreraTextoFinal: "",

  identificaCampos: "",
  campoIdentificado: "",
};

// Enunciado fijo: las frases de cada ítem continúan este inicio.
const STEM = "ME GUSTAN LAS ACTIVIDADES O PIENSO EN UNA PROFESIÓN DONDE...";

function normalizeItemText(s: string) {
  const t = (s ?? "").trim();
  if (!t) return "";
  return t.replace(/\s+/g, " ");
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function ProgressRing({ value }: { value: number }) {
  const pct = clamp(Math.round(value), 0, 100);
  const style = {
    background: `conic-gradient(var(--foreground) ${pct}%, rgba(148,163,184,0.35) ${pct}% 100%)`,
  } as React.CSSProperties;

  return (
    <div className="flex items-center gap-3">
      <div className="w-11 h-11 rounded-full p-[3px]" style={style}>
        <div className="w-full h-full rounded-full bg-[var(--card)] flex items-center justify-center border border-[var(--border)]">
          <span className="text-[11px] font-semibold text-[var(--foreground)]">{pct}%</span>
        </div>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-sm text-[var(--muted-foreground)]">{children}</label>;
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cx(
        "mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-3",
        "text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] shadow-sm",
        "focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition disabled:opacity-60",
        props.className
      )}
    />
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cx(
        "mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-3",
        "text-[var(--foreground)] shadow-sm",
        "focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition disabled:opacity-60",
        props.className
      )}
    />
  );
}

function ButtonPrimary(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cx(
        "px-4 py-2.5 rounded-2xl text-sm font-semibold",
        "bg-[var(--accent)] text-[var(--accent-foreground)]",
        "shadow-[0_10px_25px_-15px_rgba(0,0,0,0.35)]",
        "hover:opacity-95 hover:-translate-y-[1px] active:translate-y-0 transition",
        "disabled:opacity-50 disabled:hover:translate-y-0",
        props.className
      )}
    />
  );
}

function ButtonGhost(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cx(
        "px-4 py-2.5 rounded-2xl text-sm font-semibold",
        "border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)]",
        "shadow-sm hover:-translate-y-[1px] active:translate-y-0 transition",
        "disabled:opacity-50 disabled:hover:translate-y-0",
        props.className
      )}
    />
  );
}

const SCALE = [
  { n: 0, label: "Nada" },
  { n: 1, label: "Un poco" },
  { n: 2, label: "Bastante" },
  { n: 3, label: "Totalmente" },
] as const;

// Componente Accordion para mostrar respuestas por talento
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

type QuestionItem = {
  itemId: string;
  text: string;
  answer: number;
};

export default function StartPage() {
  console.log("[DEBUG] Component render started");

  const questions = useMemo<Question[]>(() => {
    console.log("[DEBUG] Generating questions");
    const shuffledTalents = shuffle(TALENTS).map((t) => ({
      ...t,
      items: shuffle(t.items),
    }));

    const result = shuffledTalents.flatMap((t) =>
      t.items.map((it) => ({
        itemId: it.id,
        text: it.text,
        talentId: t.id,
        talentCode: t.code,
        talentQuizTitle: t.quizTitle,
      }))
    );
    console.log("[DEBUG] Questions generated:", result.length);
    return result;
  }, []); // CRITICAL: Empty deps para no re-shuffle

  const N = questions.length;
  const STEP_PRE = 1;
  const STEP_Q_START = 2;
  const STEP_Q_END = STEP_Q_START + N - 1;
  const STEP_RESULT = STEP_Q_END + 1;
  const STEP_POST_1 = STEP_RESULT + 1;
  const STEP_POST_2 = STEP_POST_1 + 1;
  const STEP_POST_3 = STEP_POST_2 + 1;
  const STEP_DONE = STEP_POST_3 + 1;

  const totalSteps = STEP_DONE;

  const [step, setStep] = useState<number>(STEP_PRE);
  const [pre, setPre] = useState<PreData>(initialPre);
  const [post, setPost] = useState<PostData>(initialPost);
  const [answers, setAnswers] = useState<Answers>({});
  const [error, setError] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);
  const [savedOk, setSavedOk] = useState<boolean>(false);
  const [selectedCareers, setSelectedCareers] = useState<string[]>([]);

  const submittingRef = useRef(false);

  const isQuestionStep = step >= STEP_Q_START && step <= STEP_Q_END;
  const qIndex = isQuestionStep ? step - STEP_Q_START : -1;
  const currentQ = isQuestionStep && qIndex >= 0 && qIndex < questions.length ? questions[qIndex] : null;

  const progress = Math.round((step / totalSteps) * 100);

  useEffect(() => {
    console.log("[DEBUG] Step changed:", { step, isQuestionStep, qIndex, currentQ: currentQ?.itemId });
  }, [step]);

  function updatePre<K extends keyof PreData>(key: K, value: PreData[K]) {
    setPre((d) => ({ ...d, [key]: value }));
  }
  function updatePost<K extends keyof PostData>(key: K, value: PostData[K]) {
    setPost((d) => ({ ...d, [key]: value }));
  }
  function setAnswer(itemId: string, value: number) {
    console.log("[DEBUG] Setting answer:", { itemId, value });
    setAnswers((a) => ({ ...a, [itemId]: value }));
  }

  function validateStep(): string {
    console.log("[DEBUG] Validating step:", step);
    if (step === STEP_PRE) {
      if (!pre.nombre.trim()) return "Escribe tu nombre.";
      const email = pre.email.trim();
      if (!email) return "Escribe tu correo electrónico.";
      if (!isValidEmail(email)) return "Ese correo no parece válido.";
    }

    if (isQuestionStep && currentQ) {
      const v = answers[currentQ.itemId];
      if (v === undefined) return "Elige una opción para continuar.";
    }

    if (step === STEP_POST_1) {
      if (!post.apellido.trim()) return "Escribe tus apellidos.";
      if (!post.fechaNacimiento) return "Selecciona tu fecha de nacimiento.";
      if (Number.isNaN(new Date(post.fechaNacimiento).getTime())) return "La fecha no es válida.";
      if (!post.genero) return "Selecciona tu sexo.";
      if (!post.curso.trim()) return "Indica tu curso.";
      if (!post.modalidad.trim()) return "Indica tu modalidad.";
    }

    if (step === STEP_POST_2) {
      if (!post.ideaCarreraFinal) return "Indica si tienes una idea de carrera.";
      if (post.ideaCarreraFinal === "Sí" && post.ideaCarreraTextoFinal.trim().length < 2) {
        return "Escribe tu idea de carrera (aunque sea en pocas palabras).";
      }
    }

    return "";
  }

  function next() {
    console.log("[DEBUG] Next clicked");
    const msg = validateStep();
    if (msg) {
      console.log("[DEBUG] Validation failed:", msg);
      return setError(msg);
    }
    setError("");
    const newStep = clamp(step + 1, STEP_PRE, totalSteps);
    console.log("[DEBUG] Moving to step:", newStep);
    setStep(newStep);
  }

  function back() {
    setError("");
    setStep((s) => clamp(s - 1, STEP_PRE, totalSteps));
  }

  const scores = useMemo(() => {
    console.log("[DEBUG] Computing scores");
    const scoreMap = new Map<number, number>();
    for (const q of questions) {
      const v = answers[q.itemId];
      if (v !== undefined) {
        scoreMap.set(q.talentId, (scoreMap.get(q.talentId) ?? 0) + v);
      }
    }
    console.log("[DEBUG] Scores computed:", Array.from(scoreMap.entries()));
    return scoreMap;
  }, [questions, answers]);

  const ranked = useMemo(() => {
    console.log("[DEBUG] Ranking talents");
    const result = TALENTS.map((t) => ({
      id: t.id,
      code: t.code,
      quizTitle: t.quizTitle,
      titleSymbolic: t.titleSymbolic,
      titleGenotype: t.titleGenotype,
      reportTitle: t.reportTitle,
      reportSummary: t.reportSummary,
      exampleRoles: t.exampleRoles || [],
      score: scores.get(t.id) ?? 0,
      max: t.items.length * 3,
    })).sort((a, b) => b.score - a.score);
    console.log("[DEBUG] Ranked:", result.map(r => ({ id: r.id, score: r.score })));
    return result;
  }, [scores]);

  function toggleCareer(career: string) {
    setSelectedCareers((prev) =>
      prev.includes(career) ? prev.filter((c) => c !== career) : [...prev, career]
    );
  }

  async function saveAll() {
    console.log("[DEBUG] Save all triggered");
    const msg = validateStep();
    if (msg) return setError(msg);
    if (saving) return;

    for (const q of questions) {
      if (answers[q.itemId] === undefined) {
        setError("Faltan respuestas del cuestionario.");
        return;
      }
    }

    setSaving(true);
    setError("");

    try {
      const identificaCampos = selectedCareers.length > 0 ? "Sí" : "No";
      const campoIdentificado = selectedCareers.join(", ");

      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: pre.nombre.trim(),
          email: pre.email.trim(),
          apellido: post.apellido.trim(),
          fechaNacimiento: post.fechaNacimiento,
          genero: post.genero,
          curso: post.curso.trim(),
          modalidad: post.modalidad.trim(),
          centroEducativo: post.centroEducativo.trim() || null,
          tienesIdeaCarrera: post.ideaCarreraFinal || "No",
          ideaCarrera: post.ideaCarreraFinal === "Sí" ? post.ideaCarreraTextoFinal.trim() : null,
          ideaCarreraFinal: post.ideaCarreraFinal || null,
          ideaCarreraTextoFinal: post.ideaCarreraFinal === "Sí" ? post.ideaCarreraTextoFinal.trim() : null,
          identificaCampos,
          campoIdentificado: selectedCareers.length > 0 ? campoIdentificado : null,
          answers,
        }),
      });

      const json = await res.json().catch(() => ({} as any));

      if (!res.ok) {
        setError(json?.error ?? "No se pudo guardar.");
        setSaving(false);
        return;
      }

      setSavedOk(true);
      setSaving(false);
      setStep(STEP_DONE);
    } catch {
      setError("Error de red. Inténtalo de nuevo.");
      setSaving(false);
    }
  }

  console.log("[DEBUG] About to render, step:", step, "STEP_RESULT:", STEP_RESULT);

  if (step === STEP_RESULT) {
    console.log("[DEBUG] Rendering RESULT screen");
    const top3 = ranked.slice(0, 3);

    const questionsByTalent = useMemo(() => {
      console.log("[DEBUG] Building questionsByTalent map");
      const map = new Map<number, QuestionItem[]>();
      
      for (const q of questions) {
        if (!map.has(q.talentId)) {
          map.set(q.talentId, []);
        }
        const list = map.get(q.talentId);
        if (list) {
          list.push({
            itemId: q.itemId,
            text: q.text,
            answer: answers[q.itemId] ?? 0,
          });
        }
      }
      
      console.log("[DEBUG] questionsByTalent map size:", map.size);
      return map;
    }, [questions, answers]);

    return (
      <main className="min-h-screen bg-[var(--background)]">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <header className="flex items-end justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-[var(--foreground)]">Tus Resultados</h1>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                Mapa visual de tus talentos basado en neurociencia aplicada
              </p>
            </div>
            <ProgressRing value={progress} />
          </header>

          <div className="mb-12">
            {console.log("[DEBUG] About to render TalentWheel")}
            <TalentWheel
              scores={ranked.map((t) => ({
                talentId: t.id,
                score: t.score,
                max: t.max,
              }))}
            />
            {console.log("[DEBUG] TalentWheel rendered")}
          </div>

          <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm mb-8">
            <h2 className="text-xl font-semibold text-[var(--foreground)]">Tus 3 talentos más destacados</h2>
            <ol className="mt-4 space-y-3">
              {top3.map((t, idx) => (
                <li key={t.id} className="p-4 rounded-lg border border-[var(--border)]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[var(--muted-foreground)]">#{idx + 1}</span>
                        <span className="font-bold text-lg text-[var(--foreground)]">{t.reportTitle || t.quizTitle}</span>
                      </div>
                      <p className="mt-2 text-sm text-[var(--muted-foreground)]">{t.reportSummary}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-[var(--foreground)]">{t.score}</div>
                      <div className="text-xs text-[var(--muted-foreground)]">/ {t.max}</div>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm mb-8">
            <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">Detalle de respuestas por talento</h2>
            <div className="space-y-2">
              {ranked.map((t) => {
                const talentQuestions = questionsByTalent.get(t.id) || [];
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

          <div className="mt-6 flex justify-between gap-3">
            <ButtonGhost type="button" onClick={back}>
              Atrás
            </ButtonGhost>
            <ButtonPrimary type="button" onClick={next}>
              Continuar con el registro
            </ButtonPrimary>
          </div>
        </div>
      </main>
    );
  }

  console.log("[DEBUG] Rendering normal flow")
  // Resto del componente sin cambios...
  return <main className="min-h-screen bg-[var(--background)]"><div className="max-w-2xl mx-auto px-4 py-12"><p className="text-red-500">DEBUG BUILD - Check console for logs. Step: {step}</p></div></main>;
}

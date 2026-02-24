"use client";

import { useMemo, useRef, useState } from "react";
import { TALENTS } from "@/lib/talents";

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

  // idea de carrera (antes de “te identificas con alguno”)
  ideaCarreraFinal: "Sí" | "No" | "";
  ideaCarreraTextoFinal: string;

  // “te identificas con alguno”
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

function DonutMeter({ score, max }: { score: number; max: number }) {
  const pct = max > 0 ? clamp(Math.round((score / max) * 100), 0, 100) : 0;
  const color = pct >= 65 ? "var(--danger)" : "var(--foreground)";
  const style = {
    background: `conic-gradient(${color} ${pct}%, rgba(148,163,184,0.35) ${pct}% 100%)`,
  } as React.CSSProperties;

  return (
    <div className="w-11 h-11 rounded-full p-[3px]" style={style} aria-label={`${pct}%`}>
      <div className="w-full h-full rounded-full bg-[var(--card)] flex items-center justify-center border border-[var(--border)]">
        <span className="text-[11px] font-semibold" style={{ color }}>{pct}%</span>
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

// Campos profesionales por talento (ajústalo a tu gusto)
const FIELDS_BY_TALENT: Record<number, string[]> = {
  1: ["Marketing y comunicación", "Ventas y negociación", "Relaciones públicas", "Dirección comercial"],
  2: ["Ciencia e investigación", "Ingeniería", "Datos y analítica", "Tecnología"],
  3: ["Educación", "Psicología y orientación", "Coaching", "Recursos humanos"],
  4: ["Dirección y gestión", "Administración", "Operaciones", "Seguridad y organización"],
  5: ["Salud y atención social", "ONG / cooperación", "Derecho y mediación", "Servicios públicos"],
  6: ["Diseño", "Arte y creatividad", "Producto e innovación", "Contenido"],
  7: ["Investigación y análisis", "Forense", "Criminología", "Ciberseguridad (análisis)"],
  8: ["Operaciones", "Calidad y procesos", "Logística", "Soporte y ejecución"],
};

export default function StartPage() {
  const questions = useMemo<Question[]>(() => {
    const shuffledTalents = shuffle(TALENTS).map((t) => ({
      ...t,
      items: shuffle(t.items),
    }));

    return shuffledTalents.flatMap((t) =>
      t.items.map((it) => ({
        itemId: it.id,
        text: it.text,
        talentId: t.id,
        talentCode: t.code,
        talentQuizTitle: t.quizTitle,
      }))
    );
  }, []);

  // pasos:
  // 1) pre (nombre+email)
  // 2..(1+N) preguntas
  // luego: resultado
  // luego: post-1 (datos básicos)
  // luego: post-2 (idea carrera final)
  // luego: post-3 (identificaCampos)
  // luego: pantalla final (ok)
  const N = questions.length;
  const STEP_PRE = 1;
  const STEP_Q_START = 2;
  const STEP_Q_END = STEP_Q_START + N - 1;
  const STEP_RESULT = STEP_Q_END + 1;
  const STEP_POST_1 = STEP_RESULT + 1; // apellidos + nacimiento + sexo + curso + modalidad + centro
  const STEP_POST_2 = STEP_POST_1 + 1; // idea carrera final
  const STEP_POST_3 = STEP_POST_2 + 1; // identificaCampos
  const STEP_DONE = STEP_POST_3 + 1;

  const totalSteps = STEP_DONE;

  const [step, setStep] = useState<number>(STEP_PRE);
  const [pre, setPre] = useState<PreData>(initialPre);
  const [post, setPost] = useState<PostData>(initialPost);
  const [answers, setAnswers] = useState<Answers>({});
  const [error, setError] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);
  const [savedOk, setSavedOk] = useState<boolean>(false);

  const submittingRef = useRef(false);

  const isQuestionStep = step >= STEP_Q_START && step <= STEP_Q_END;
  const qIndex = isQuestionStep ? step - STEP_Q_START : -1;
  const currentQ = isQuestionStep ? questions[qIndex] : null;

  const progress = Math.round((step / totalSteps) * 100);

  function updatePre<K extends keyof PreData>(key: K, value: PreData[K]) {
    setPre((d) => ({ ...d, [key]: value }));
  }
  function updatePost<K extends keyof PostData>(key: K, value: PostData[K]) {
    setPost((d) => ({ ...d, [key]: value }));
  }
  function setAnswer(itemId: string, value: number) {
    setAnswers((a) => ({ ...a, [itemId]: value }));
  }

  function validateStep(): string {
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

    if (step === STEP_POST_3) {
      if (!post.identificaCampos) return "Indica si te identificas con alguno de los campos.";
      if (post.identificaCampos === "Sí" && post.campoIdentificado.trim().length < 2) {
        return "Especifica con cuál te identificas.";
      }
    }

    return "";
  }

  function next() {
    const msg = validateStep();
    if (msg) return setError(msg);
    setError("");
    setStep((s) => clamp(s + 1, STEP_PRE, totalSteps));
  }

  function back() {
    setError("");
    setStep((s) => clamp(s - 1, STEP_PRE, totalSteps));
  }

  function computeScores() {
    const scores = new Map<number, number>();
    for (const q of questions) {
      const v = answers[q.itemId];
      if (v === undefined) continue;
      scores.set(q.talentId, (scores.get(q.talentId) ?? 0) + v);
    }
    return scores;
  }

  const scores = useMemo(() => computeScores(), [answers, questions]);

  const ranked = useMemo(() => {
    return TALENTS.map((t) => ({
      id: t.id,
      code: t.code,
      quizTitle: t.quizTitle,
      titleSymbolic: t.titleSymbolic,
      titleGenotype: t.titleGenotype,
      score: scores.get(t.id) ?? 0,
      max: t.items.length * 3,
    })).sort((a, b) => b.score - a.score);
  }, [scores]);

  const winner = ranked[0];

  function fieldsForWinner() {
    if (!winner) return [];
    return FIELDS_BY_TALENT[winner.id] ?? [];
  }

  async function saveAll() {
    const msg = validateStep();
    if (msg) return setError(msg);
    if (saving) return;

    // asegura que estén todas las respuestas
    for (const q of questions) {
      if (answers[q.itemId] === undefined) {
        setError("Faltan respuestas del cuestionario.");
        return;
      }
    }

    setSaving(true);
    setError("");

    try {
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

          // “idea de carrera” original del modelo (para compatibilidad admin/filtros actuales)
          // aquí la fijamos con la “final”
          tienesIdeaCarrera: post.ideaCarreraFinal || "No",
          ideaCarrera: post.ideaCarreraFinal === "Sí" ? post.ideaCarreraTextoFinal.trim() : null,

          // nuevos
          ideaCarreraFinal: post.ideaCarreraFinal || null,
          ideaCarreraTextoFinal: post.ideaCarreraFinal === "Sí" ? post.ideaCarreraTextoFinal.trim() : null,

          identificaCampos: post.identificaCampos || null,
          campoIdentificado: post.identificaCampos === "Sí" ? post.campoIdentificado.trim() : null,

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

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <header className="flex items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1 text-xs text-[var(--muted-foreground)] shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
              Cuestionario
            </div>
            <h1 className="mt-3 text-3xl font-bold text-[var(--foreground)]">Encuentra tu talento</h1>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Paso {step} de {totalSteps}
            </p>
          </div>
          <ProgressRing value={progress} />
        </header>

        <section className="mt-8 rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
          {error && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* STEP 1: PRE (nombre + email) */}
          {step === STEP_PRE && (
            <div className="grid gap-5">
              <div>
                <h2 className="text-lg font-semibold text-[var(--foreground)]">Datos de contacto</h2>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">Nombre y correo electrónico.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Nombre</Label>
                  <Input value={pre.nombre} onChange={(e) => updatePre("nombre", e.target.value)} placeholder="Nombre" />
                </div>
                <div>
                  <Label>Correo</Label>
                  <Input
                    value={pre.email}
                    onChange={(e) => updatePre("email", e.target.value)}
                    placeholder="correo@ejemplo.com"
                    type="email"
                    inputMode="email"
                  />
                </div>
              </div>
            </div>
          )}

          {/* QUESTIONS */}
          {isQuestionStep && currentQ && (
            <>
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="text-lg font-semibold text-[var(--foreground)]">
                  Pregunta {qIndex + 1} de {questions.length}
                </h2>
                <div className="text-xs text-[var(--muted-foreground)]">0–3</div>
              </div>

              <div className="mt-5 rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-[var(--muted-foreground)]">{STEM}</div>
                  <div className="text-xl font-semibold leading-snug text-[var(--foreground)]">
                    {normalizeItemText(currentQ.text)}
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {SCALE.map(({ n, label }) => {
                    const active = answers[currentQ.itemId] === n;
                    return (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setAnswer(currentQ.itemId, n)}
                        className={cx(
                          "rounded-2xl px-4 py-3 text-left transition border",
                          active
                            ? "bg-[var(--foreground)] text-[var(--background)] border-[var(--foreground)] shadow-[0_14px_30px_-18px_rgba(0,0,0,0.35)]"
                            : "bg-[var(--card)] border-[var(--border)] text-[var(--foreground)] hover:-translate-y-[1px] hover:opacity-95"
                        )}
                      >
                        <div className="text-sm font-semibold">{n}</div>
                        <div
                          className={cx(
                            "text-xs",
                            active ? "text-[var(--background)]/80" : "text-[var(--muted-foreground)]"
                          )}
                        >
                          {label}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <p className="mt-4 text-xs text-[var(--muted-foreground)]">
                  Responde según tu forma habitual de ser. No hay respuestas correctas o incorrectas.
                </p>
              </div>
            </>
          )}

          {/* RESULT */}
          {step === STEP_RESULT && winner && (
            <div className="grid gap-5">
              <div>
                <h2 className="text-lg font-semibold text-[var(--foreground)]">Resultado</h2>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  Tu resultado se obtiene sumando tus respuestas (0–3) en cada grupo.
                </p>
              </div>

              <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
                <div className="text-sm text-[var(--muted-foreground)]">{winner.code}</div>
                <div className="mt-1 text-2xl font-semibold text-[var(--foreground)]">{winner.quizTitle}</div>
                <div className="mt-2 text-sm text-[var(--muted-foreground)]">
                  {winner.titleSymbolic}
                  {winner.titleSymbolic && winner.titleGenotype ? " · " : ""}
                  {winner.titleGenotype}
                </div>
                <div className="mt-3 text-sm text-[var(--muted-foreground)]">
                  Puntuación: <span className="font-semibold text-[var(--foreground)]">{winner.score}</span> / {winner.max}
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
                <div className="text-sm font-semibold text-[var(--foreground)]">Campos profesionales relacionados</div>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  Estos campos suelen encajar con este perfil. ¿Te identificas con alguno?
                </p>
                <ul className="mt-3 grid gap-2">
                  {fieldsForWinner().length ? (
                    fieldsForWinner().map((x) => (
                      <li key={x} className="text-sm text-[var(--foreground)]">
                        • {x}
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-[var(--muted-foreground)]">No hay campos configurados para este talento.</li>
                  )}
                </ul>
              </div>

              <h3 className="text-sm font-semibold text-[var(--foreground)]">Top 3</h3>
              <div className="grid gap-3">
                {ranked.slice(0, 3).map((t, idx) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-xl border border-[var(--border)] flex items-center justify-center text-sm font-semibold text-[var(--foreground)]">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-[var(--foreground)]">{t.quizTitle}</div>
                        <div className="text-xs text-[var(--muted-foreground)]">{t.code}</div>
                      </div>
                    </div>
                    <DonutMeter score={t.score} max={t.max} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* POST 1 */}
          {step === STEP_POST_1 && (
            <div className="grid gap-5">
              <div>
                <h2 className="text-lg font-semibold text-[var(--foreground)]">Datos académicos</h2>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">Completa la información para finalizar.</p>
              </div>

              <div>
                <Label>Apellidos</Label>
                <Input value={post.apellido} onChange={(e) => updatePost("apellido", e.target.value)} placeholder="Apellidos" />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Fecha de nacimiento</Label>
                  <Input type="date" value={post.fechaNacimiento} onChange={(e) => updatePost("fechaNacimiento", e.target.value)} />
                </div>
                <div>
                  <Label>Sexo</Label>
                  <Select value={post.genero} onChange={(e) => updatePost("genero", e.target.value as PostData["genero"])}>
                    <option value="">Selecciona…</option>
                    <option value="Femenino">Femenino</option>
                    <option value="Masculino">Masculino</option>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Curso</Label>
                  <Input value={post.curso} onChange={(e) => updatePost("curso", e.target.value)} placeholder="Ej: 1º Bachillerato" />
                </div>
                <div>
                  <Label>Modalidad</Label>
                  <Input value={post.modalidad} onChange={(e) => updatePost("modalidad", e.target.value)} placeholder="Ej: Ciencias / Letras / FP…" />
                </div>
              </div>

              <div>
                <Label>Centro educativo (opcional)</Label>
                <Input
                  value={post.centroEducativo}
                  onChange={(e) => updatePost("centroEducativo", e.target.value)}
                  placeholder="IES / Colegio / Universidad…"
                />
              </div>
            </div>
          )}

          {/* POST 2: idea carrera final */}
          {step === STEP_POST_2 && (
            <div className="grid gap-5">
              <div>
                <h2 className="text-lg font-semibold text-[var(--foreground)]">Preferencias</h2>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">Sobre tu idea de carrera.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>¿Tienes una idea de carrera?</Label>
                  <Select
                    value={post.ideaCarreraFinal}
                    onChange={(e) => updatePost("ideaCarreraFinal", e.target.value as PostData["ideaCarreraFinal"])}
                  >
                    <option value="">Selecciona…</option>
                    <option value="Sí">Sí</option>
                    <option value="No">No</option>
                  </Select>
                </div>

                <div>
                  <Label>¿Cuál?</Label>
                  <Input
                    value={post.ideaCarreraTextoFinal}
                    onChange={(e) => updatePost("ideaCarreraTextoFinal", e.target.value)}
                    placeholder="Ej: Medicina, Informática, Diseño…"
                    disabled={post.ideaCarreraFinal !== "Sí"}
                  />
                </div>
              </div>
            </div>
          )}

          {/* POST 3: identificaCampos */}
          {step === STEP_POST_3 && (
            <div className="grid gap-5">
              <div>
                <h2 className="text-lg font-semibold text-[var(--foreground)]">Afinidad con campos profesionales</h2>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">Indica si te identificas con alguno de los campos mostrados.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>¿Te identificas con alguno?</Label>
                  <Select
                    value={post.identificaCampos}
                    onChange={(e) => updatePost("identificaCampos", e.target.value as PostData["identificaCampos"])}
                  >
                    <option value="">Selecciona…</option>
                    <option value="Sí">Sí</option>
                    <option value="No">No</option>
                  </Select>
                </div>

                <div>
                  <Label>¿Cuál?</Label>
                  <Input
                    value={post.campoIdentificado}
                    onChange={(e) => updatePost("campoIdentificado", e.target.value)}
                    placeholder="Ej: Investigación, Salud, Diseño…"
                    disabled={post.identificaCampos !== "Sí"}
                  />
                </div>
              </div>

              <div className="pt-2">
                <ButtonPrimary type="button" onClick={saveAll} disabled={saving} className="w-full">
                  {saving ? "Guardando…" : "Guardar y finalizar"}
                </ButtonPrimary>
              </div>
            </div>
          )}

          {/* DONE */}
          {step === STEP_DONE && (
            <div className="grid gap-4">
              <h2 className="text-lg font-semibold text-[var(--foreground)]">Registro completado</h2>
              <p className="text-sm text-[var(--muted-foreground)]">
                Gracias. Tus respuestas han quedado registradas correctamente.
              </p>

              <ButtonPrimary
                type="button"
                className="w-full"
                onClick={() => {
                  setStep(STEP_PRE);
                  setPre(initialPre);
                  setPost(initialPost);
                  setAnswers({});
                  setError("");
                  setSaving(false);
                  setSavedOk(false);
                  submittingRef.current = false;
                }}
              >
                Empezar de nuevo
              </ButtonPrimary>
            </div>
          )}

          {/* NAV (cuando no estás en DONE) */}
          {step !== STEP_DONE && (
            <div className="mt-6 flex items-center justify-between gap-3">
              <ButtonGhost type="button" onClick={back} disabled={step === STEP_PRE || saving}>
                Atrás
              </ButtonGhost>

              {step < STEP_Q_END ? (
                <ButtonPrimary type="button" onClick={next}>
                  Siguiente
                </ButtonPrimary>
              ) : step === STEP_Q_END ? (
                <ButtonPrimary type="button" onClick={next}>
                  Ver resultado
                </ButtonPrimary>
              ) : step === STEP_RESULT ? (
                <ButtonPrimary type="button" onClick={next}>
                  Continuar
                </ButtonPrimary>
              ) : step === STEP_POST_1 || step === STEP_POST_2 ? (
                <ButtonPrimary type="button" onClick={next} disabled={saving}>
                  Siguiente
                </ButtonPrimary>
              ) : (
                // STEP_POST_3 tiene su propio botón Guardar
                <div />
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}


"use client";

import { useMemo, useState } from "react";
import { TALENTS } from "@/lib/talents";
import TalentWheel from "@/components/TalentWheel";

type Answers = Record<string, number>;
type Question = {
  itemId: string;
  talentId: number;
  text: string;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function scoreByTalent(answers: Answers) {
  const scores = TALENTS.map((t) => {
    const sum = t.items.reduce((acc, it) => acc + (answers[it.id] ?? 0), 0);
    return {
      talentId: t.id,
      code: t.code,
      title: t.quizTitle,
      score: sum,
      max: t.items.length * 3,
    };
  });
  scores.sort((a, b) => b.score - a.score);
  return scores;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function generateRandomizedQuestions(): Question[] {
  const allQuestions: Question[] = [];
  
  TALENTS.forEach((talent) => {
    talent.items.forEach((item) => {
      allQuestions.push({
        itemId: item.id,
        talentId: talent.id,
        text: item.text,
      });
    });
  });

  return shuffleArray(allQuestions);
}

export default function TestPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<null | { top: ReturnType<typeof scoreByTalent> }>(null);
  const [selectedCareers, setSelectedCareers] = useState<string[]>([]);

  const questions = useMemo(() => generateRandomizedQuestions(), []);
  const totalQuestions = questions.length;

  const progress = useMemo(() => {
    if (step === 0) return 0;
    if (step > totalQuestions) return 100;
    return Math.round((step / totalQuestions) * 100);
  }, [step, totalQuestions]);

  const currentQuestion = step >= 1 && step <= totalQuestions ? questions[step - 1] : null;

  function setAnswer(itemId: string, value: number) {
    setAnswers((a) => ({ ...a, [itemId]: value }));
  }

  function validateStep(): string {
    if (step === 0) {
      if (!email.trim()) return "Escribe tu correo para continuar.";
      return "";
    }

    if (currentQuestion && answers[currentQuestion.itemId] === undefined) {
      return "Responde la pregunta antes de continuar.";
    }

    return "";
  }

  function next() {
    const msg = validateStep();
    if (msg) return setError(msg);
    setError("");
    
    if (step < totalQuestions) {
      setStep((s) => s + 1);
    } else {
      finish();
    }
  }

  function back() {
    setError("");
    setStep((s) => clamp(s - 1, 0, totalQuestions));
  }

  async function finish() {
    setLoading(true);
    setError("");

    const scores = scoreByTalent(answers);

    try {
      const res = await fetch("/api/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          answers,
          scores: scores.map((s) => ({
            talentId: s.talentId,
            score: s.score,
            max: s.max,
          })),
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(json?.error ?? "No se pudo guardar el cuestionario.");
        setLoading(false);
        return;
      }

      setDone({ top: scores });
      setLoading(false);
      setStep(totalQuestions + 1);
    } catch {
      setError("Error de red. Inténtalo otra vez.");
      setLoading(false);
    }
  }

  function toggleCareer(career: string) {
    setSelectedCareers((prev) =>
      prev.includes(career) ? prev.filter((c) => c !== career) : [...prev, career]
    );
  }

  if (done) {
    const top3 = done.top.slice(0, 3);
    
    // Obtener carreras sugeridas basadas en los datos de neurociencia
    const suggestedCareers = top3.flatMap((t) => {
      const talent = TALENTS.find((tal) => tal.id === t.talentId);
      return talent?.exampleRoles || [];
    });

    return (
      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-center">Tus Resultados</h1>
        <p className="mt-2 text-center text-zinc-600">
          Mapa visual de tus talentos basado en neurociencia aplicada
        </p>

        <div className="mt-12">
          <TalentWheel
            scores={done.top.map((t) => ({
              talentId: t.talentId,
              score: t.score,
              max: t.max,
            }))}
          />
        </div>

        <div className="mt-12 border border-zinc-200 rounded-2xl bg-white p-6">
          <h2 className="text-xl font-semibold">Tus 3 talentos más destacados</h2>
          <ol className="mt-4 space-y-3">
            {top3.map((t, idx) => {
              const talent = TALENTS.find((tal) => tal.id === t.talentId);
              return (
                <li key={t.talentId} className="p-4 rounded-lg bg-zinc-50 border border-zinc-200">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-zinc-500">#{idx + 1}</span>
                        <span className="font-bold text-lg">{talent?.reportTitle || t.title}</span>
                      </div>
                      <p className="mt-2 text-sm text-zinc-600">{talent?.reportSummary}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {talent?.fields.slice(0, 3).map((field, i) => (
                          <span key={i} className="px-2 py-1 bg-zinc-200 rounded-md text-xs font-medium">
                            {field}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{t.score}</div>
                      <div className="text-xs text-zinc-500">/ {t.max}</div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="mt-8 border border-zinc-200 rounded-2xl bg-white p-6">
          <h2 className="text-xl font-semibold">Profesiones y roles sugeridos</h2>
          <p className="mt-2 text-sm text-zinc-600">
            Basado en tus talentos principales. Marca las opciones con las que te identificas:
          </p>

          <div className="mt-4 space-y-2">
            {suggestedCareers.map((career, idx) => (
              <button
                key={`${career}-${idx}`}
                onClick={() => toggleCareer(career)}
                className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                  selectedCareers.includes(career)
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-zinc-200 bg-white hover:border-zinc-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                      selectedCareers.includes(career)
                        ? "border-white bg-white"
                        : "border-zinc-300"
                    }`}
                  >
                    {selectedCareers.includes(career) && (
                      <svg className="w-3 h-3 text-zinc-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm">{career}</span>
                </div>
              </button>
            ))}
          </div>

          {selectedCareers.length > 0 && (
            <div className="mt-4 p-3 rounded-lg bg-green-50 border border-green-200">
              <p className="text-sm text-green-800">
                ✓ Has seleccionado {selectedCareers.length} opción(es)
              </p>
            </div>
          )}
        </div>

        <button
          onClick={() => {
            setStep(0);
            setAnswers({});
            setEmail("");
            setDone(null);
            setError("");
            setSelectedCareers([]);
          }}
          className="mt-8 w-full md:w-auto mx-auto flex items-center justify-center rounded-xl border border-zinc-300 px-6 py-3 text-sm hover:bg-zinc-50"
        >
          Realizar test de nuevo
        </button>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Cuestionario de Talentos</h1>
          <p className="mt-1 text-sm text-zinc-600">
            {step === 0 ? "Introducción" : `Pregunta ${step} de ${totalQuestions}`}
          </p>
        </div>

        <div className="w-40">
          <div className="h-2 bg-zinc-200 rounded-full">
            <div
              className="h-2 bg-zinc-900 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-1 text-xs text-zinc-500 text-right">{progress}%</div>
        </div>
      </header>

      <section className="mt-8 border border-zinc-200 rounded-2xl p-6 bg-white">
        {step === 0 && (
          <>
            <h2 className="text-lg font-semibold">Antes de empezar</h2>

            <p className="mt-3 text-sm text-zinc-700 leading-relaxed">
              A continuación encontrarás {totalQuestions} afirmaciones presentadas de forma aleatoria.
              Indica de <strong>0 a 3</strong> hasta qué punto estás de acuerdo según tu forma habitual de ser.
            </p>

            <div className="mt-4 text-sm text-zinc-700">
              <div className="font-semibold">Escala de respuesta</div>
              <ul className="mt-2 space-y-1 text-zinc-600">
                <li><strong>3</strong> → Totalmente de acuerdo</li>
                <li><strong>2</strong> → Bastante de acuerdo</li>
                <li><strong>1</strong> → Un poco de acuerdo</li>
                <li><strong>0</strong> → Nada de acuerdo</li>
              </ul>
              <p className="mt-3 text-xs text-zinc-500">
                No hay respuestas correctas o incorrectas. Las preguntas están mezcladas y no revelan a qué talento corresponden.
              </p>
            </div>

            <div className="mt-5">
              <label className="text-sm text-zinc-700">
                Tu correo (para asociar tus respuestas)
              </label>
              <input
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-xl border border-zinc-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                placeholder="tu@correo.com"
                inputMode="email"
              />
            </div>
          </>
        )}

        {currentQuestion && (
          <>
            <div className="text-sm text-zinc-500 mb-4">
              Pregunta {step} de {totalQuestions}
            </div>

            <div className="rounded-2xl border border-zinc-200 p-4 bg-zinc-50">
              <div className="font-semibold text-lg">{currentQuestion.text}</div>

              <div className="mt-4 flex items-center justify-center gap-6">
                {[0, 1, 2, 3].map((n) => (
                  <label
                    key={n}
                    className="flex flex-col items-center gap-2 cursor-pointer group"
                  >
                    <input
                      type="radio"
                      name={currentQuestion.itemId}
                      value={n}
                      checked={answers[currentQuestion.itemId] === n}
                      onChange={() => setAnswer(currentQuestion.itemId, n)}
                      className="w-6 h-6 accent-zinc-900"
                    />
                    <span className="text-sm font-medium group-hover:text-zinc-900">{n}</span>
                  </label>
                ))}
              </div>

              <div className="mt-3 text-center text-xs text-zinc-500">
                0 = nada de acuerdo · 3 = totalmente de acuerdo
              </div>
            </div>
          </>
        )}

        {error && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <footer className="mt-6 flex justify-between gap-3">
          <button
            onClick={back}
            disabled={step === 0 || loading}
            className="px-4 py-2 rounded-xl border border-zinc-300 text-sm disabled:opacity-50 hover:bg-zinc-50"
          >
            Atrás
          </button>

          {step < totalQuestions ? (
            <button
              onClick={next}
              disabled={loading}
              className="px-6 py-2 rounded-xl bg-zinc-900 text-white text-sm disabled:opacity-60 hover:bg-zinc-800"
            >
              Siguiente
            </button>
          ) : (
            <button
              onClick={finish}
              disabled={loading}
              className="px-6 py-2 rounded-xl bg-zinc-900 text-white text-sm disabled:opacity-60 hover:bg-zinc-800"
            >
              {loading ? "Guardando…" : "Ver Resultados"}
            </button>
          )}
        </footer>
      </section>

      <footer className="mt-6 text-xs text-zinc-500 leading-relaxed">
        <strong>Aviso de privacidad:</strong> los datos se utilizan exclusivamente para análisis interno y mejora del proyecto.
      </footer>
    </main>
  );
}

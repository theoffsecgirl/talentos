"use client";

import { useMemo, useState } from "react";
import { TALENTS } from "@/lib/talents";

type Answers = Record<string, number>; // key = itemId (ej: "1.3"), value 0..3

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

export default function TestPage() {
  const total = TALENTS.length;

  const [step, setStep] = useState(0); // 0 = intro, 1..8 = talentos
  const [answers, setAnswers] = useState<Answers>({});
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<null | { top: ReturnType<typeof scoreByTalent> }>(null);

  const progress = useMemo(() => {
    if (step === 0) return 0;
    return Math.round((step / total) * 100);
  }, [step, total]);

  const currentTalent = step >= 1 ? TALENTS[step - 1] : null;

  function setAnswer(itemId: string, value: number) {
    setAnswers((a) => ({ ...a, [itemId]: value }));
  }

  function validateStep(): string {
    if (step === 0) {
      if (!email.trim()) return "Escribe tu correo (el mismo que has usado en el registro).";
      return "";
    }

    if (!currentTalent) return "";

    for (const it of currentTalent.items) {
      if (answers[it.id] === undefined) {
        return "Responde todas las afirmaciones antes de continuar.";
      }
    }

    return "";
  }

  function next() {
    const msg = validateStep();
    if (msg) return setError(msg);
    setError("");
    setStep((s) => clamp(s + 1, 0, total));
  }

  function back() {
    setError("");
    setStep((s) => clamp(s - 1, 0, total));
  }

  async function finish() {
    const msg = validateStep();
    if (msg) return setError(msg);

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
    } catch {
      setError("Error de red. Inténtalo otra vez.");
      setLoading(false);
    }
  }

  if (done) {
    const top3 = done.top.slice(0, 3);

    return (
      <main className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold">Resultados (vista previa)</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Esto es un resumen simple. Luego lo convertimos en un informe completo.
        </p>

        <div className="mt-6 border border-zinc-200 rounded-2xl bg-white p-6">
          <h2 className="text-lg font-semibold">Tus 3 talentos más altos</h2>

          <ol className="mt-4 space-y-3">
            {top3.map((t, idx) => (
              <li key={t.talentId} className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm text-zinc-500">#{idx + 1}</div>
                  <div className="font-semibold">{t.title}</div>
                </div>
                <div className="text-sm text-zinc-700">
                  {t.score}/{t.max}
                </div>
              </li>
            ))}
          </ol>
        </div>

        <button
          onClick={() => {
            setStep(0);
            setAnswers({});
            setEmail("");
            setDone(null);
            setError("");
          }}
          className="mt-6 inline-flex items-center justify-center rounded-xl border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-50"
        >
          Hacerlo otra vez
        </button>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Cuestionario: identifica tu talento</h1>
          <p className="mt-1 text-sm text-zinc-600">
            {step === 0 ? "Introducción" : `${currentTalent?.quizTitle}`}
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
              A continuación encontrarás una serie de afirmaciones.
              Indica de <strong>0 a 3</strong> hasta qué punto estás de acuerdo
              según tu forma habitual de ser.
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
                No hay respuestas correctas o incorrectas.
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

        {currentTalent && (
          <>
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-lg font-semibold">{currentTalent.quizTitle}</h2>
              <span className="text-xs text-zinc-500">{currentTalent.code}</span>
            </div>

            <p className="mt-2 text-sm text-zinc-600">
              Responde con sinceridad. Marca la opción que mejor refleje tu forma habitual de actuar.
            </p>

            <div className="mt-5 space-y-5">
              {currentTalent.items.map((it) => {
                const value = answers[it.id];

                return (
                  <div key={it.id} className="rounded-2xl border border-zinc-200 p-4">
                    <div className="font-semibold">
                      {it.id} {it.text}
                    </div>

                    <div className="mt-3 flex items-center gap-4">
                      {[0, 1, 2, 3].map((n) => (
                        <label key={n} className="flex items-center gap-2 text-sm text-zinc-700 cursor-pointer">
                          <input
                            type="radio"
                            name={it.id}
                            value={n}
                            checked={value === n}
                            onChange={() => setAnswer(it.id, n)}
                            className="accent-zinc-900"
                          />
                          {n}
                        </label>
                      ))}
                    </div>

                    <div className="mt-2 text-xs text-zinc-500">
                      0 = nada de acuerdo · 3 = totalmente de acuerdo
                    </div>
                  </div>
                );
              })}
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
            className="px-4 py-2 rounded-xl border border-zinc-300 text-sm disabled:opacity-50"
          >
            Atrás
          </button>

          {step < total ? (
            <button
              onClick={next}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-zinc-900 text-white text-sm disabled:opacity-60"
            >
              Siguiente
            </button>
          ) : (
            <button
              onClick={finish}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-zinc-900 text-white text-sm disabled:opacity-60"
            >
              {loading ? "Guardando…" : "Finalizar"}
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

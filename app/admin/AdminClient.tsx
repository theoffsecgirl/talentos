"use client";

import { useMemo, useState } from "react";

const STEM = "¿Hasta qué punto estás de acuerdo con esta afirmación?";

function normalizeItemText(s: string) {
  const t = (s ?? "").trim();
  if (!t) return "";
  return t.replace(/\s+/g, " ");
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

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function winnerFromScores(talents: any[], scoresJson: any) {
  const scores = Array.isArray(scoresJson) ? scoresJson : [];
  if (!scores.length) return null;

  const best = scores.slice().sort((a, b) => (b?.score ?? 0) - (a?.score ?? 0))[0];
  if (!best?.talentId) return null;

  const t = talents.find((x) => x.id === best.talentId);
  return {
    talentId: best.talentId,
    code: t?.code ?? `T${best.talentId}`,
    quizTitle: t?.quizTitle ?? `Talento ${best.talentId}`,
    titleSymbolic: t?.titleSymbolic ?? "",
    titleGenotype: t?.titleGenotype ?? "",
    score: best?.score ?? 0,
    max: best?.max ?? null,
  };
}

function top3(talents: any[], scoresJson: any) {
  const scores = Array.isArray(scoresJson) ? scoresJson : [];
  return scores
    .slice()
    .sort((a, b) => (b?.score ?? 0) - (a?.score ?? 0))
    .slice(0, 3)
    .map((s: any) => {
      const t = talents.find((x) => x.id === s.talentId);
      return {
        talentId: s.talentId,
        code: t?.code ?? `T${s.talentId}`,
        quizTitle: t?.quizTitle ?? `Talento ${s.talentId}`,
        titleSymbolic: t?.titleSymbolic ?? "",
        titleGenotype: t?.titleGenotype ?? "",
        score: s.score ?? 0,
        max: s.max ?? 0,
      };
    });
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

function ButtonPrimary(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { className, ...rest } = props;
  return (
    <button
      {...rest}
      className={cx(
        "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold",
        "bg-[var(--foreground)] text-[var(--background)]",
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
        "hover:opacity-95 active:opacity-90 transition",
        "focus:outline-none focus:ring-2 focus:ring-[var(--ring)]",
        className
      )}
    />
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1 text-xs text-[var(--muted-foreground)]">
      {children}
    </span>
  );
}

export default function AdminClient({ rows, exportHref, talents, filters }: any) {
  const [openId, setOpenId] = useState<string | null>(null);

  // Mapa pregunta -> (texto, quizTitle)
  const QUESTION_MAP = useMemo(() => {
    const map: Record<string, { text: string; talentQuizTitle: string }> = {};
    for (const t of talents) {
      for (const it of t.items) {
        map[it.id] = { text: it.text, talentQuizTitle: t.quizTitle };
      }
    }
    return map;
  }, [talents]);

  const selected = openId ? rows.find((r: any) => r.id === openId) : null;
  const assessment = selected?.assessments?.[0];

  const winner = selected ? winnerFromScores(talents, assessment?.scoresJson) : null;
  const top = selected ? top3(talents, assessment?.scoresJson) : [];

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
      <form className="mt-6 grid gap-3 md:grid-cols-6">
        <Input className="md:col-span-2" name="q" placeholder="Buscar (nombre, email, idea…)" defaultValue={filters.q} />

        <Select name="genero" defaultValue={filters.genero}>
          <option value="">Sexo (todos)</option>
          <option value="Femenino">Femenino</option>
          <option value="Masculino">Masculino</option>
        </Select>

        <Input name="centro" placeholder="Centro" defaultValue={filters.centro} />
        <Input name="curso" placeholder="Curso" defaultValue={filters.curso} />
        <Input name="modalidad" placeholder="Modalidad" defaultValue={filters.modalidad} />

        <div className="md:col-span-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input className="flex-1" name="idea" placeholder="Idea carrera (filtro extra)" defaultValue={filters.idea} />
          <ButtonGhost type="submit">Aplicar filtros</ButtonGhost>
          <a href="/admin" className="inline-flex">
            <ButtonGhost type="button">Limpiar</ButtonGhost>
          </a>
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
              <div className="col-span-2 text-[var(--muted-foreground)] whitespace-nowrap">
                {toISODate(new Date(r.createdAt))}
              </div>

              <div className="col-span-3">
                <div className="font-semibold text-[var(--foreground)]">
                  {r.nombre} {r.apellido}
                </div>
                <div className="text-xs text-[var(--muted-foreground)]">
                  {r.genero} · {r.centroEducativo ?? "—"}
                </div>
              </div>

              <div className="col-span-3 whitespace-nowrap text-[var(--foreground)]">{r.user.email}</div>

              <div className="col-span-1 whitespace-nowrap text-[var(--foreground)]">
                {ageFromBirthdate(new Date(r.fechaNacimiento))}
              </div>

              <div className="col-span-1 whitespace-nowrap text-[var(--foreground)]">{r.curso}</div>
              <div className="col-span-1 whitespace-nowrap text-[var(--foreground)]">{r.modalidad}</div>

              <div className="col-span-1 text-right">
                <ButtonGhost type="button" className="px-3 py-1.5 text-xs" onClick={() => setOpenId(r.id)}>
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

          <div className="absolute right-0 top-0 h-full w-full max-w-xl bg-[var(--card)] text-[var(--foreground)] shadow-2xl border-l border-[var(--border)] overflow-y-auto">
            <div className="p-5 border-b border-[var(--border)] flex items-start justify-between gap-4">
              <div>
                <div className="text-xs text-[var(--muted-foreground)]">{toISODate(new Date(selected.createdAt))}</div>
                <div className="text-lg font-bold text-[var(--foreground)]">
                  {selected.nombre} {selected.apellido}
                </div>
                <div className="text-sm text-[var(--muted-foreground)]">{selected.user.email}</div>
              </div>

              <ButtonGhost type="button" onClick={() => setOpenId(null)}>
                Cerrar
              </ButtonGhost>
            </div>

            <div className="p-5 space-y-6">
              <div className="rounded-2xl border border-[var(--border)] p-4 bg-[var(--card)]">
                <div className="text-xs font-semibold text-[var(--muted-foreground)] mb-2">Datos</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-[var(--muted-foreground)]">Edad:</span>{" "}
                    {ageFromBirthdate(new Date(selected.fechaNacimiento))}
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
                  <div className="col-span-2">
                    <span className="text-[var(--muted-foreground)]">Idea de carrera:</span>{" "}
                    {selected.tienesIdeaCarrera} · {selected.ideaCarrera ?? "—"}
                  </div>

                  <div className="col-span-2 pt-2 border-t border-[var(--border)]" />

                  <div className="col-span-2">
                    <span className="text-[var(--muted-foreground)]">Idea de carrera (final):</span>{" "}
                    {selected.ideaCarreraFinal ?? "—"} · {selected.ideaCarreraTextoFinal ?? "—"}
                  </div>
                  <div className="col-span-2">
                    <span className="text-[var(--muted-foreground)]">Afinidad con campos:</span>{" "}
                    {selected.identificaCampos ?? "—"} · {selected.campoIdentificado ?? "—"}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--border)] p-4 bg-[var(--card)]">
                <div className="text-xs font-semibold text-[var(--muted-foreground)] mb-2">Resultado</div>
                {!assessment ? (
                  <div className="text-sm text-[var(--muted-foreground)]">Sin assessment asociado.</div>
                ) : (
                  <>
                    <div className="text-sm">
                      <span className="text-[var(--muted-foreground)]">Ganador:</span>{" "}
                      <span className="font-semibold text-[var(--foreground)]">
                        {winner ? `${winner.code} · ${winner.quizTitle}` : "—"}
                      </span>
                      {winner ? (
                        <span className="text-[var(--muted-foreground)]">
                          {" "}
                          · {winner.score}
                          {winner.max ? `/${winner.max}` : ""}
                        </span>
                      ) : null}
                    </div>

                    {winner?.titleSymbolic || winner?.titleGenotype ? (
                      <div className="mt-2 text-sm text-[var(--muted-foreground)]">
                        {winner.titleSymbolic}
                        {winner.titleSymbolic && winner.titleGenotype ? " · " : ""}
                        {winner.titleGenotype}
                      </div>
                    ) : null}

                    <div className="mt-3 grid gap-2">
                      {top.map((t: any) => (
                        <div key={String(t.talentId)} className="rounded-xl border border-[var(--border)] p-3 bg-[var(--card)]">
                          <div className="font-semibold text-[var(--foreground)]">
                            {t.code} · {t.quizTitle}
                          </div>
                          <div className="text-xs text-[var(--muted-foreground)]">
                            {t.titleSymbolic}
                            {t.titleSymbolic && t.titleGenotype ? " · " : ""}
                            {t.titleGenotype}
                          </div>
                          <div className="text-xs text-[var(--muted-foreground)] mt-1">
                            {t.score} / {t.max}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="rounded-2xl border border-[var(--border)] p-4 bg-[var(--card)]">
                <div className="text-xs font-semibold text-[var(--muted-foreground)] mb-2">Respuestas (0–3)</div>
                {!assessment || !(assessment.answersJson && typeof assessment.answersJson === "object") ? (
                  <div className="text-sm text-[var(--muted-foreground)]">answersJson inválido.</div>
                ) : (
                  <div className="grid gap-2">
                    {Object.entries(assessment.answersJson as any)
                      .sort(([a], [b]) => a.localeCompare(b, "es"))
                      .map(([id, val]) => {
                        const meta = QUESTION_MAP[id as string];
                        return (
                          <div key={String(id)} className="rounded-xl border border-[var(--border)] p-3 bg-[var(--card)]">
                            <div className="text-xs text-[var(--muted-foreground)] mb-2 flex items-center gap-2 flex-wrap">
                              <Pill>{String(id)}</Pill>
                              <span>{meta?.talentQuizTitle ?? "—"}</span>
                            </div>

                            <div className="space-y-1">
                              <div className="text-xs font-semibold text-[var(--muted-foreground)]">{STEM}</div>
                              <div className="font-medium text-[var(--foreground)]">
                                {meta?.text ? normalizeItemText(meta.text) : "(Pregunta no encontrada en TALENTS)"}
                              </div>
                            </div>

                            <div className="mt-2 text-sm">
                              <span className="text-[var(--muted-foreground)]">Respuesta:</span>{" "}
                              <span className="font-semibold text-[var(--foreground)]">{String(val)}</span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              <div className="pb-6" />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

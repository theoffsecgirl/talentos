import { prisma } from "@/lib/prisma";
import { TALENTS } from "@/lib/talents";

type Body = {
  // pre
  nombre: string;
  email: string;

  // post base
  apellido: string;
  fechaNacimiento: string; // YYYY-MM-DD
  genero: "Femenino" | "Masculino" | string;
  curso: string;
  modalidad: string;
  centroEducativo?: string | null;

  // compat / idea carrera (modelo actual)
  tienesIdeaCarrera?: "Sí" | "No" | string;
  ideaCarrera?: string | null;

  // nuevos (orientación final)
  identificaCampos?: "Sí" | "No" | string | null;
  campoIdentificado?: string | null;
  ideaCarreraFinal?: "Sí" | "No" | string | null;
  ideaCarreraTextoFinal?: string | null;

  // test
  answers: Record<string, number>; // itemId -> 0..3
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function parseDateYYYYMMDD(s: string) {
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

function computeScores(answers: Record<string, number>) {
  const scores = TALENTS.map((t) => {
    const score = t.items.reduce((acc, it) => acc + (answers[it.id] ?? 0), 0);
    const max = t.items.length * 3;
    return { talentId: t.id, score, max };
  }).sort((a, b) => b.score - a.score);

  return { scores };
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body) return Response.json({ error: "JSON inválido." }, { status: 400 });

  // pre
  const nombre = (body.nombre ?? "").trim();
  const email = (body.email ?? "").trim().toLowerCase();

  if (!nombre) return Response.json({ error: "Falta el nombre." }, { status: 400 });

  if (!email || !isValidEmail(email)) {
    return Response.json({ error: "Correo inválido." }, { status: 400 });
  }

  // post
  const apellido = (body.apellido ?? "").trim();
  const genero = (body.genero ?? "").trim();
  const curso = (body.curso ?? "").trim();
  const modalidad = (body.modalidad ?? "").trim();
  const centroEducativo = (body.centroEducativo ?? "").toString().trim() || null;

  if (!apellido) return Response.json({ error: "Faltan los apellidos." }, { status: 400 });

  const fecha = parseDateYYYYMMDD(body.fechaNacimiento ?? "");
  if (!fecha) return Response.json({ error: "Fecha de nacimiento inválida." }, { status: 400 });

  if (!genero) return Response.json({ error: "Falta el sexo." }, { status: 400 });
  if (!curso) return Response.json({ error: "Falta el curso." }, { status: 400 });
  if (!modalidad) return Response.json({ error: "Falta la modalidad." }, { status: 400 });

  // idea carrera (compat con admin actual)
  const tienesIdeaCarrera = ((body.tienesIdeaCarrera ?? "No").toString().trim() || "No") as string;
  const ideaCarreraRaw = (body.ideaCarrera ?? "").toString().trim();
  const ideaCarrera = tienesIdeaCarrera === "Sí" ? (ideaCarreraRaw || null) : null;

  if (tienesIdeaCarrera !== "Sí" && tienesIdeaCarrera !== "No") {
    return Response.json({ error: "Indica si tienes una idea de carrera (Sí/No)." }, { status: 400 });
  }
  if (tienesIdeaCarrera === "Sí" && !ideaCarrera) {
    return Response.json({ error: "Escribe tu idea de carrera." }, { status: 400 });
  }

  // nuevos (orientación final)
  const identificaCampos = (body.identificaCampos ?? null)?.toString().trim() || null;
  const campoIdentificadoRaw = (body.campoIdentificado ?? "").toString().trim();
  const campoIdentificado = identificaCampos === "Sí" ? (campoIdentificadoRaw || null) : null;

  const ideaCarreraFinal = (body.ideaCarreraFinal ?? null)?.toString().trim() || null;
  const ideaCarreraTextoFinalRaw = (body.ideaCarreraTextoFinal ?? "").toString().trim();
  const ideaCarreraTextoFinal = ideaCarreraFinal === "Sí" ? (ideaCarreraTextoFinalRaw || null) : null;

  if (identificaCampos && identificaCampos !== "Sí" && identificaCampos !== "No") {
    return Response.json({ error: "Indica si te identificas con algún campo (Sí/No)." }, { status: 400 });
  }
  if (identificaCampos === "Sí" && !campoIdentificado) {
    return Response.json({ error: "Especifica con cuál te identificas." }, { status: 400 });
  }

  if (ideaCarreraFinal && ideaCarreraFinal !== "Sí" && ideaCarreraFinal !== "No") {
    return Response.json({ error: "Indica si tienes idea de carrera (Sí/No)." }, { status: 400 });
  }
  if (ideaCarreraFinal === "Sí" && !ideaCarreraTextoFinal) {
    return Response.json({ error: "Escribe tu idea de carrera." }, { status: 400 });
  }

  // test
  const answers = body.answers ?? {};

  // Validación: todas las preguntas contestadas 0..3
  for (const t of TALENTS) {
    for (const it of t.items) {
      const v = answers[it.id];
      if (v === undefined || v === null || !Number.isInteger(v) || v < 0 || v > 3) {
        return Response.json({ error: "Faltan respuestas del cuestionario o alguna es inválida." }, { status: 400 });
      }
    }
  }

  const { scores } = computeScores(answers);

  // 1) Usuario (upsert)
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email },
  });

  // 2) Submission
  const submission = await prisma.submission.create({
    data: {
      nombre,
      apellido,
      fechaNacimiento: fecha,
      genero,
      curso,
      modalidad,
      tienesIdeaCarrera,
      ideaCarrera,
      centroEducativo,

      // nuevos
      identificaCampos,
      campoIdentificado,
      ideaCarreraFinal,
      ideaCarreraTextoFinal,

      userId: user.id,
    },
  });

  // 3) Assessment
  const assessment = await prisma.assessment.create({
    data: {
      submissionId: submission.id,
      email,
      answersJson: answers,
      scoresJson: scores.map((s) => ({ talentId: s.talentId, score: s.score, max: s.max })),
    },
  });

  return Response.json({
    ok: true,
    submissionId: submission.id,
    assessmentId: assessment.id,
  });
}

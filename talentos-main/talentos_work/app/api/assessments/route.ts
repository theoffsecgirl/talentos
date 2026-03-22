import { prisma } from "@/lib/prisma";

type Body = {
  email: string;
  answers: Record<string, number>;
  scores: { talentId: number; score: number; max: number }[];
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body) return Response.json({ error: "JSON inválido." }, { status: 400 });

  const email = (body.email ?? "").trim().toLowerCase();
  if (!email || !isValidEmail(email)) {
    return Response.json({ error: "Correo inválido." }, { status: 400 });
  }

  // Buscamos el último submission asociado a ese email (MVP)
  const submission = await prisma.submission.findFirst({
    where: { user: { email } },
    orderBy: { createdAt: "desc" },
    include: { user: true },
  });

  if (!submission) {
    return Response.json(
      { error: "No encuentro un registro previo con ese correo. Completa primero el registro." },
      { status: 400 }
    );
  }

  // Guardamos todo en una tabla JSON por ahora (MVP).
  // Si quieres normalizarlo (Assessment + Answers + Scores), lo hacemos en la siguiente iteración.
  const saved = await prisma.assessment.create({
    data: {
      submissionId: submission.id,
      email,
      answersJson: body.answers,
      scoresJson: body.scores,
    },
  });

  return Response.json({ ok: true, id: saved.id });
}

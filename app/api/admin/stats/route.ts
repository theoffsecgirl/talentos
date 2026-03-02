import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TALENTS } from "@/lib/talents";

export const dynamic = "force-dynamic";

type ScoreRow = { talentId: number; score: number; max: number };

function getScores(scoresJson: any): ScoreRow[] {
  return Array.isArray(scoresJson)
    ? scoresJson
        .map((x: any) => ({
          talentId: Number(x?.talentId),
          score: Number(x?.score ?? 0),
          max: Number(x?.max ?? 0),
        }))
        .filter((x) => Number.isFinite(x.talentId))
    : [];
}

function topTalent(scoresJson: any): number | null {
  const scores = getScores(scoresJson);
  if (scores.length === 0) return null;
  const sorted = scores.slice().sort((a, b) => b.score - a.score);
  return sorted[0]?.talentId ?? null;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q") ?? "";
  const genero = url.searchParams.get("genero") ?? "";
  const centro = url.searchParams.get("centro") ?? "";
  const curso = url.searchParams.get("curso") ?? "";
  const modalidad = url.searchParams.get("modalidad") ?? "";
  const idea = url.searchParams.get("idea") ?? "";

  const where: any = {};

  if (genero) where.genero = genero;
  if (centro) where.centroEducativo = { contains: centro, mode: "insensitive" };
  if (curso) where.curso = { contains: curso, mode: "insensitive" };
  if (modalidad) where.modalidad = { contains: modalidad, mode: "insensitive" };

  if (idea) {
    where.OR = [
      { ideaCarrera: { contains: idea, mode: "insensitive" } },
      { ideaCarreraTextoFinal: { contains: idea, mode: "insensitive" } },
      { campoIdentificado: { contains: idea, mode: "insensitive" } },
    ];
  }

  if (q) {
    where.AND = [
      ...(where.AND ?? []),
      {
        OR: [
          { nombre: { contains: q, mode: "insensitive" } },
          { apellido: { contains: q, mode: "insensitive" } },
          { ideaCarrera: { contains: q, mode: "insensitive" } },
          { ideaCarreraTextoFinal: { contains: q, mode: "insensitive" } },
          { campoIdentificado: { contains: q, mode: "insensitive" } },
          { user: { email: { contains: q, mode: "insensitive" } } },
        ],
      },
    ];
  }

  const submissions = await prisma.submission.findMany({
    where,
    include: {
      assessments: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  // Estadísticas generales
  const total = submissions.length;
  const conAssessment = submissions.filter((s) => s.assessments.length > 0).length;

  // Distribución por género
  const byGenero = submissions.reduce((acc: Record<string, number>, s) => {
    acc[s.genero] = (acc[s.genero] || 0) + 1;
    return acc;
  }, {});

  // Distribución por curso
  const byCurso = submissions.reduce((acc: Record<string, number>, s) => {
    acc[s.curso] = (acc[s.curso] || 0) + 1;
    return acc;
  }, {});

  // Distribución por modalidad
  const byModalidad = submissions.reduce((acc: Record<string, number>, s) => {
    acc[s.modalidad] = (acc[s.modalidad] || 0) + 1;
    return acc;
  }, {});

  // Distribución de talentos dominantes
  const talentCounts: Record<number, number> = {};
  for (const sub of submissions) {
    const assessment = sub.assessments[0];
    if (!assessment) continue;
    const top = topTalent(assessment.scoresJson);
    if (top !== null) {
      talentCounts[top] = (talentCounts[top] || 0) + 1;
    }
  }

  const talentDistribution = Object.entries(talentCounts)
    .map(([talentId, count]) => {
      const t = TALENTS.find((x) => x.id === Number(talentId));
      return {
        talentId: Number(talentId),
        code: t?.code ?? `T${talentId}`,
        name: t?.reportTitle || t?.quizTitle || `Talento ${talentId}`,
        count,
      };
    })
    .sort((a, b) => b.count - a.count);

  return NextResponse.json({
    total,
    conAssessment,
    sinAssessment: total - conAssessment,
    byGenero,
    byCurso,
    byModalidad,
    talentDistribution,
  });
}

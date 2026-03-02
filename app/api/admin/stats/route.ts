import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

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

  const [total, byGenero, byCurso, byModalidad, byCentro] = await Promise.all([
    prisma.submission.count({ where }),
    prisma.submission.groupBy({
      by: ["genero"],
      where,
      _count: true,
    }),
    prisma.submission.groupBy({
      by: ["curso"],
      where,
      _count: true,
    }),
    prisma.submission.groupBy({
      by: ["modalidad"],
      where,
      _count: true,
    }),
    prisma.submission.groupBy({
      by: ["centroEducativo"],
      where,
      _count: true,
    }),
  ]);

  return NextResponse.json({
    total,
    byGenero: byGenero.map((x) => ({ genero: x.genero, count: x._count })),
    byCurso: byCurso.map((x) => ({ curso: x.curso, count: x._count })),
    byModalidad: byModalidad.map((x) => ({ modalidad: x.modalidad, count: x._count })),
    byCentro: byCentro
      .filter((x) => x.centroEducativo)
      .map((x) => ({ centro: x.centroEducativo!, count: x._count })),
  });
}

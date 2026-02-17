import { prisma } from "@/lib/prisma";
import AdminClient from "./AdminClient";
import { TALENTS } from "@/lib/talents";

export const dynamic = "force-dynamic";

function toStr(v: unknown) {
  return typeof v === "string" ? v : "";
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const q = toStr(searchParams.q).trim();
  const genero = toStr(searchParams.genero).trim();
  const centro = toStr(searchParams.centro).trim();
  const curso = toStr(searchParams.curso).trim();
  const modalidad = toStr(searchParams.modalidad).trim();
  const idea = toStr(searchParams.idea).trim();

  // where dinámico
  const where: any = {};

  if (genero) where.genero = genero;
  if (centro) where.centroEducativo = { contains: centro, mode: "insensitive" };
  if (curso) where.curso = { contains: curso, mode: "insensitive" };
  if (modalidad) where.modalidad = { contains: modalidad, mode: "insensitive" };

  // filtro extra por idea
  if (idea) {
    where.OR = [
      { ideaCarrera: { contains: idea, mode: "insensitive" } },
      { ideaCarreraTextoFinal: { contains: idea, mode: "insensitive" } },
      { campoIdentificado: { contains: idea, mode: "insensitive" } },
    ];
  }

  // búsqueda general q (nombre/email/idea)
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

  const rows = await prisma.submission.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      user: true,
      assessments: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  // export link con mismos filtros
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (genero) params.set("genero", genero);
  if (centro) params.set("centro", centro);
  if (curso) params.set("curso", curso);
  if (modalidad) params.set("modalidad", modalidad);
  if (idea) params.set("idea", idea);

  const exportHref = `/api/admin/export?${params.toString()}`;

  return (
    <AdminClient
      rows={rows}
      talents={TALENTS}
      filters={{ q, genero, centro, curso, modalidad, idea }}
      exportHref={exportHref}
    />
  );
}

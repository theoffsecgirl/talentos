import { prisma } from "@/lib/prisma";
import { TALENTS } from "@/lib/talents";
import AdminClient from "./AdminClient";

type SearchParams = {
  q?: string;
  genero?: string;
  centro?: string;
  curso?: string;
  modalidad?: string;
  idea?: string;
};

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export default async function AdminPage({ searchParams }: { searchParams: SearchParams }) {
  const q = searchParams.q ?? "";
  const genero = searchParams.genero ?? "";
  const centro = searchParams.centro ?? "";
  const curso = searchParams.curso ?? "";
  const modalidad = searchParams.modalidad ?? "";
  const idea = searchParams.idea ?? "";

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

  const rows = await prisma.submission.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      user: true,
      assessments: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  const serialized = rows.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
    fechaNacimiento: r.fechaNacimiento.toISOString(),
    user: {
      ...r.user,
      createdAt: r.user.createdAt.toISOString(),
    },
    assessments: r.assessments.map((a) => ({
      ...a,
      createdAt: a.createdAt.toISOString(),
    })),
  }));

  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (genero) params.set("genero", genero);
  if (centro) params.set("centro", centro);
  if (curso) params.set("curso", curso);
  if (modalidad) params.set("modalidad", modalidad);
  if (idea) params.set("idea", idea);

  const exportHref = `/api/admin/export?${params.toString()}`;
  const downloadAllHref = `/api/admin/download-all?${params.toString()}`;
  const statsHref = `/api/admin/stats?${params.toString()}`;

  return (
    <AdminClient
      rows={serialized}
      exportHref={exportHref}
      downloadAllHref={downloadAllHref}
      statsHref={statsHref}
      talents={TALENTS}
      filters={{ q, genero, centro, curso, modalidad, idea }}
    />
  );
}

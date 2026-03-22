import { prisma } from "@/lib/prisma";
import AdminClient from "./AdminClient";
import { TALENTS } from "@/lib/talents";
import type { ReadonlyURLSearchParams } from "next/navigation";

export const dynamic = "force-dynamic";

async function unwrapSearchParams(
  searchParams: unknown
): Promise<ReadonlyURLSearchParams | Record<string, string | string[] | undefined>> {
  // Next 16 puede pasarlo como Promise
  if (searchParams && typeof (searchParams as any).then === "function") {
    return await (searchParams as Promise<any>);
  }
  return searchParams as any;
}

function getParam(
  sp: ReadonlyURLSearchParams | Record<string, string | string[] | undefined>,
  key: string
) {
  // URLSearchParams-like
  if (sp && typeof (sp as any).get === "function") {
    return ((sp as any).get(key) ?? "").toString();
  }
  // Record fallback
  const v = (sp as any)?.[key];
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return v[0] ?? "";
  return "";
}

export default async function AdminPage({
  searchParams,
}: {
  // ✅ Next 16: puede venir como Promise o como URLSearchParams
  searchParams: unknown;
}) {
  const sp = await unwrapSearchParams(searchParams);

  const q = getParam(sp, "q").trim();
  const genero = getParam(sp, "genero").trim();
  const centro = getParam(sp, "centro").trim();
  const curso = getParam(sp, "curso").trim();
  const modalidad = getParam(sp, "modalidad").trim();
  const idea = getParam(sp, "idea").trim();

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

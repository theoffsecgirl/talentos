import { prisma } from "@/lib/prisma";
import AdminClient from "../../admin/AdminClient";
import { TALENTS } from "@/lib/talents";
import { SANCRISTOBAL_BRANDING, SANCRISTOBAL_CENTER } from "@/lib/branding";

export const dynamic = "force-dynamic";

export default async function SanCristobalAdminPage() {
  const where: any = {
    centroEducativo: { contains: SANCRISTOBAL_CENTER, mode: "insensitive" },
  };

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
  params.set("centro", SANCRISTOBAL_CENTER);

  return (
    <AdminClient
      rows={rows}
      talents={TALENTS}
      filters={{ q: "", genero: "", centro: SANCRISTOBAL_CENTER, curso: "", modalidad: "", idea: "" }}
      exportHref={`/api/admin/export?${params.toString()}`}
      branding={{ name: SANCRISTOBAL_BRANDING.name, logoSrc: SANCRISTOBAL_BRANDING.logoSrc }}
      fixedCenter={SANCRISTOBAL_CENTER}
    />
  );
}

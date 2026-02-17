import { prisma } from "@/lib/prisma";

function toStr(v: unknown) {
  return typeof v === "string" ? v : "";
}

function esc(s: string) {
  return s.replaceAll('"', '""');
}

// Export CSV (compatible con Excel). Si quieres .xlsx real, lo hacemos luego.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const q = toStr(searchParams.get("q")).trim();
  const genero = toStr(searchParams.get("genero")).trim();
  const centro = toStr(searchParams.get("centro")).trim();
  const curso = toStr(searchParams.get("curso")).trim();
  const modalidad = toStr(searchParams.get("modalidad")).trim();
  const idea = toStr(searchParams.get("idea")).trim();

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
    take: 2000,
    include: {
      user: true,
      assessments: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  const header = [
    "createdAt",
    "nombre",
    "apellido",
    "email",
    "fechaNacimiento",
    "genero",
    "curso",
    "modalidad",
    "centroEducativo",
    "tienesIdeaCarrera",
    "ideaCarrera",
    "ideaCarreraFinal",
    "ideaCarreraTextoFinal",
    "identificaCampos",
    "campoIdentificado",
  ];

  const lines = [header.join(",")];

  for (const r of rows as any[]) {
    const line = [
      r.createdAt?.toISOString?.() ?? "",
      r.nombre ?? "",
      r.apellido ?? "",
      r.user?.email ?? "",
      r.fechaNacimiento?.toISOString?.().slice(0, 10) ?? "",
      r.genero ?? "",
      r.curso ?? "",
      r.modalidad ?? "",
      r.centroEducativo ?? "",
      r.tienesIdeaCarrera ?? "",
      r.ideaCarrera ?? "",
      r.ideaCarreraFinal ?? "",
      r.ideaCarreraTextoFinal ?? "",
      r.identificaCampos ?? "",
      r.campoIdentificado ?? "",
    ].map((x) => `"${esc(String(x))}"`);

    lines.push(line.join(","));
  }

  const csv = lines.join("\n");
  const filename = `export_${new Date().toISOString().slice(0, 10)}.csv`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

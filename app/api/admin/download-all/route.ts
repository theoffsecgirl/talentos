import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import JSZip from "jszip";
import { generatePDFBuffer } from "@/lib/pdf-generator";
import { TALENTS } from "@/lib/talents";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

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
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: true,
      assessments: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  if (submissions.length === 0) {
    return NextResponse.json({ error: "No hay resultados para generar ZIP" }, { status: 404 });
  }

  const zip = new JSZip();

  for (const sub of submissions) {
    const assessment = sub.assessments?.[0];
    if (!assessment) continue;

    try {
      const pdfBuffer = await generatePDFBuffer({
        submission: sub,
        assessment,
        talents: TALENTS,
      });

      const fileName = `${sub.nombre}_${sub.apellido}_${sub.id}.pdf`;
      zip.file(fileName, pdfBuffer);
    } catch (err) {
      console.error(`Error generando PDF para ${sub.id}:`, err);
    }
  }

  const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

  return new NextResponse(zipBuffer, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="talentos_${new Date().toISOString().split("T")[0]}.zip"`,
    },
  });
}

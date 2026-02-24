import { prisma } from "@/lib/prisma";
import ExcelJS from "exceljs";

function toStr(v: unknown) {
  return typeof v === "string" ? v : "";
}

function isoDate(d?: Date | null) {
  if (!d) return "";
  try {
    return d.toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

function pct(score: number, max: number) {
  if (!max) return 0;
  return Math.max(0, Math.min(100, Math.round((score / max) * 100)));
}

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

  const wb = new ExcelJS.Workbook();
  wb.creator = "talentos";
  wb.created = new Date();

  const ws = wb.addWorksheet("Export");

  ws.columns = [
    { header: "createdAt", key: "createdAt", width: 20 },
    { header: "nombre", key: "nombre", width: 18 },
    { header: "apellido", key: "apellido", width: 18 },
    { header: "email", key: "email", width: 28 },
    { header: "fechaNacimiento", key: "fechaNacimiento", width: 14 },
    { header: "genero", key: "genero", width: 12 },
    { header: "curso", key: "curso", width: 14 },
    { header: "modalidad", key: "modalidad", width: 14 },
    { header: "centroEducativo", key: "centroEducativo", width: 24 },
    { header: "tienesIdeaCarrera", key: "tienesIdeaCarrera", width: 16 },
    { header: "ideaCarrera", key: "ideaCarrera", width: 26 },
    { header: "ideaCarreraFinal", key: "ideaCarreraFinal", width: 18 },
    { header: "ideaCarreraTextoFinal", key: "ideaCarreraTextoFinal", width: 30 },
    { header: "identificaCampos", key: "identificaCampos", width: 18 },
    { header: "campoIdentificado", key: "campoIdentificado", width: 20 },
    // Columnas de talentos (T1-T8 en porcentaje)
    { header: "T1_Delta_%", key: "t1", width: 10 },
    { header: "T2_Pi_%", key: "t2", width: 10 },
    { header: "T3_Psi_%", key: "t3", width: 10 },
    { header: "T4_Alfa_%", key: "t4", width: 10 },
    { header: "T5_Omega_%", key: "t5", width: 10 },
    { header: "T6_Fi_%", key: "t6", width: 10 },
    { header: "T7_Theta_%", key: "t7", width: 10 },
    { header: "T8_Meandro_%", key: "t8", width: 10 },
    { header: "top1_talent", key: "top1", width: 16 },
    { header: "top2_talent", key: "top2", width: 16 },
    { header: "top3_talent", key: "top3", width: 16 },
  ];

  // Cabecera en negrita y con autofiltro
  ws.getRow(1).font = { bold: true };
  ws.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: ws.columns.length },
  };

  for (const r of rows as any[]) {
    const assessment = r.assessments?.[0];
    const scoresJson = assessment?.scoresJson;
    const scores = Array.isArray(scoresJson) ? scoresJson : [];

    // Calcular porcentajes por talento
    const talentMap: Record<number, number> = {};
    for (const s of scores) {
      const tid = Number(s?.talentId);
      const score = Number(s?.score ?? 0);
      const max = Number(s?.max ?? 0);
      if (Number.isFinite(tid)) {
        talentMap[tid] = pct(score, max);
      }
    }

    // Top 3 talentos
    const sortedTalents = scores
      .slice()
      .sort((a: any, b: any) => (b.score ?? 0) - (a.score ?? 0))
      .slice(0, 3);

    const top1 = sortedTalents[0] ? `T${sortedTalents[0].talentId}` : "";
    const top2 = sortedTalents[1] ? `T${sortedTalents[1].talentId}` : "";
    const top3 = sortedTalents[2] ? `T${sortedTalents[2].talentId}` : "";

    ws.addRow({
      createdAt: r.createdAt?.toISOString?.() ?? "",
      nombre: r.nombre ?? "",
      apellido: r.apellido ?? "",
      email: r.user?.email ?? "",
      fechaNacimiento: isoDate(r.fechaNacimiento),
      genero: r.genero ?? "",
      curso: r.curso ?? "",
      modalidad: r.modalidad ?? "",
      centroEducativo: r.centroEducativo ?? "",
      tienesIdeaCarrera: r.tienesIdeaCarrera ?? "",
      ideaCarrera: r.ideaCarrera ?? "",
      ideaCarreraFinal: r.ideaCarreraFinal ?? "",
      ideaCarreraTextoFinal: r.ideaCarreraTextoFinal ?? "",
      identificaCampos: r.identificaCampos ?? "",
      campoIdentificado: r.campoIdentificado ?? "",
      t1: talentMap[1] ?? "",
      t2: talentMap[2] ?? "",
      t3: talentMap[3] ?? "",
      t4: talentMap[4] ?? "",
      t5: talentMap[5] ?? "",
      t6: talentMap[6] ?? "",
      t7: talentMap[7] ?? "",
      t8: talentMap[8] ?? "",
      top1,
      top2,
      top3,
    });
  }

  // Congela la primera fila (cabecera)
  ws.views = [{ state: "frozen", ySplit: 1 }];

  const buffer = await wb.xlsx.writeBuffer();
  const filename = `export_${new Date().toISOString().slice(0, 10)}.xlsx`;

  return new Response(buffer as any, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

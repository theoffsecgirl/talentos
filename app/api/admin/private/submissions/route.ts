import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function DELETE(req: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");

    if (!id) {
      const body = await req.json().catch(() => ({} as any));
      id = body?.id ?? null;
    }

    if (!id) {
      return NextResponse.json({ error: "Falta el id del registro." }, { status: 400 });
    }

    await prisma.submission.delete({
      where: { id: String(id) },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "No se pudo eliminar el registro." },
      { status: 500 }
    );
  }
}

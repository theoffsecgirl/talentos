import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      nombre,
      apellido,
      fechaNacimiento,
      genero,
      centroEducativo,
      email,
    } = body ?? {};

    if (!nombre || !apellido || !fechaNacimiento || !genero || !email) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios." },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Email inválido." }, { status: 400 });
    }

    const dob = new Date(fechaNacimiento);
    if (Number.isNaN(dob.getTime())) {
      return NextResponse.json(
        { error: "Fecha de nacimiento inválida." },
        { status: 400 }
      );
    }

    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email },
    });

    const submission = await prisma.submission.create({
      data: {
        nombre: String(nombre).trim(),
        apellido: String(apellido).trim(),
        fechaNacimiento: dob,
        genero: String(genero).trim(),
        centroEducativo: centroEducativo
          ? String(centroEducativo).trim()
          : null,
        userId: user.id,
      },
    });

    return NextResponse.json({ ok: true, id: submission.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}

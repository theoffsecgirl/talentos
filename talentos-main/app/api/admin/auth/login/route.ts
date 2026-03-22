import { NextResponse } from "next/server";
import {
  applyAdminSession,
  hasAdminCredentialsConfigured,
  validateAdminCredentials,
} from "@/lib/admin-auth";

export async function POST(req: Request) {
  try {
    if (!hasAdminCredentialsConfigured()) {
      return NextResponse.json(
        { error: "ADMIN_USER y ADMIN_PASSWORD no están configurados." },
        { status: 503 }
      );
    }

    const body = await req.json().catch(() => ({} as any));
    const user = String(body?.user ?? "").trim();
    const password = String(body?.password ?? "");

    if (!user || !password) {
      return NextResponse.json(
        { error: "Usuario y contraseña obligatorios." },
        { status: 400 }
      );
    }

    if (!validateAdminCredentials(user, password)) {
      return NextResponse.json(
        { error: "Credenciales incorrectas." },
        { status: 401 }
      );
    }

    return applyAdminSession(NextResponse.json({ ok: true }));
  } catch {
    return NextResponse.json(
      { error: "No se pudo iniciar sesión." },
      { status: 500 }
    );
  }
}

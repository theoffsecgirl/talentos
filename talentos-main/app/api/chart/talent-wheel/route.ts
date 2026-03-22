import { NextResponse } from "next/server";

// Endpoint desactivado - ya no se usa canvas
export async function POST() {
  return NextResponse.json({ error: 'Endpoint desactivado' }, { status: 404 });
}

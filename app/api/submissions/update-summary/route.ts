import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { submissionId, genotipoSummary, neurotalentoSummary } = await req.json();

    if (!submissionId) {
      return NextResponse.json({ error: "submissionId is required" }, { status: 400 });
    }

    const updated = await prisma.submission.update({
      where: { id: submissionId },
      data: {
        genotipoSummary: genotipoSummary ?? undefined,
        neurotalentoSummary: neurotalentoSummary ?? undefined,
      },
    });

    return NextResponse.json({ success: true, submission: updated });
  } catch (error) {
    console.error("Error updating summary:", error);
    return NextResponse.json({ error: "Failed to update summary" }, { status: 500 });
  }
}

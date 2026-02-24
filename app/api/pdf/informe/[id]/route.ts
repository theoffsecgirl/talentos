import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateReportHTML } from '@/lib/generateReportHTML';
import puppeteer from 'puppeteer';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const submissionId = parseInt(id);

    if (isNaN(submissionId)) {
      return NextResponse.json(
        { error: 'ID de evaluación inválido' },
        { status: 400 }
      );
    }

    // Obtener evaluación con persona y respuestas
    const assessment = await prisma.assessment.findUnique({
      where: { id: submissionId },
      include: {
        person: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!assessment || !assessment.person) {
      return NextResponse.json(
        { error: 'Evaluación no encontrada' },
        { status: 404 }
      );
    }

    // Obtener todos los talentos
    const talents = await prisma.talent.findMany({
      orderBy: { id: 'asc' },
    });

    // Extraer datos
    const person = {
      nombre: assessment.person.nombre,
      apellido: assessment.person.apellido,
      email: assessment.person.user?.email,
      genero: assessment.person.genero,
      edad: assessment.person.fechaNacimiento
        ? new Date().getFullYear() -
          new Date(assessment.person.fechaNacimiento).getFullYear()
        : undefined,
    };

    const answers: Record<string, number> =
      typeof assessment.answersJson === 'object' && assessment.answersJson
        ? (assessment.answersJson as any)
        : {};

    const scores: Array<{ talentId: number; score: number; max: number }> =
      Array.isArray(assessment.scoresJson)
        ? (assessment.scoresJson as any[]).map((s: any) => ({
            talentId: Number(s.talentId),
            score: Number(s.score ?? 0),
            max: Number(s.max ?? 0),
          }))
        : [];

    // Formatear talentos
    const talentsData = talents.map((t) => ({
      id: t.id,
      code: t.code,
      symbol: t.symbol,
      quizTitle: t.quizTitle,
      reportTitle: t.reportTitle || t.quizTitle,
      reportSummary: t.reportSummary || '',
      fields: t.fields || '',
      competencies: t.competencies || '',
      exampleRoles: t.exampleRoles || '',
      color: t.color,
    }));

    // Generar SVG del mapa (simplificado, puedes mejorarlo)
    const mapSvg = `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
      <circle cx="200" cy="200" r="150" fill="none" stroke="#e2e8f0" stroke-width="2" />
      <text x="200" y="210" text-anchor="middle" font-size="24" fill="#64748b">Mapa de talentos</text>
    </svg>`;

    // Generar HTML
    const html = generateReportHTML({
      person,
      talents: talentsData,
      scores,
      answers,
      mapSvg,
    });

    // Generar PDF con Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setContent(html, {
      waitUntil: 'networkidle0',
    });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
    });

    await browser.close();

    // Devolver PDF
    const fileName = `${person.nombre}-${person.apellido}-Informe-Talentos.pdf`
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9-]/g, '-');

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error('Error generando PDF:', error);
    return NextResponse.json(
      { error: 'Error al generar el PDF' },
      { status: 500 }
    );
  }
}

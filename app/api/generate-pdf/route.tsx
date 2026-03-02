import { NextRequest, NextResponse } from 'next/server';
import React from 'react';
import { renderToStream } from '@react-pdf/renderer';
import PDFReport from '@/components/PDFReport';
import { TALENTS } from '@/lib/talents';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      nombre,
      apellido,
      email,
      fechaNacimiento,
      genero,
      curso,
      modalidad,
      centroEducativo,
      scores,
      selectedCareers,
      customCareers,
      ideaCarreraTexto,
    } = body;

    // Validar datos requeridos
    if (!nombre || !apellido || !email || !scores) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      );
    }

    // Calcular top 3 talentos
    const ranked = TALENTS.map((t) => {
      const scoreData = scores.find((s: any) => s.talentId === t.id);
      const score = scoreData?.score || 0;
      const max = scoreData?.max || t.items.length * 3;
      const percentage = max > 0 ? Math.round((score / max) * 100) : 0;

      return {
        id: t.id,
        title: t.reportTitle || t.quizTitle,
        summary: t.reportSummary || '',
        percentage,
        label: t.wheelLabel || '',
      };
    }).sort((a, b) => b.percentage - a.percentage);

    const top3Talents = ranked.slice(0, 3).map((t) => ({
      id: t.id,
      title: t.title,
      percentage: t.percentage,
      summary: t.summary,
    }));

    const allTalents = ranked.map((t) => ({
      id: t.id,
      label: t.label,
      percentage: t.percentage,
    }));

    // Generar PDF
    const pdfStream = await renderToStream(
      <PDFReport
        nombre={nombre}
        apellido={apellido}
        email={email}
        fechaNacimiento={fechaNacimiento}
        genero={genero}
        curso={curso}
        modalidad={modalidad}
        centroEducativo={centroEducativo || ''}
        top3Talents={top3Talents}
        allTalents={allTalents}
        selectedCareers={selectedCareers || []}
        customCareers={customCareers || ''}
        ideaCarreraTexto={ideaCarreraTexto || ''}
      />
    );

    // Convertir stream a buffer
    const chunks: Buffer[] = [];
    for await (const chunk of pdfStream) {
      chunks.push(Buffer.from(chunk));
    }
    const pdfBuffer = Buffer.concat(chunks);

    // Nombre del archivo
    const filename = `informe-talentos-${nombre.toLowerCase().replace(/\s+/g, '-')}-${apellido.toLowerCase().replace(/\s+/g, '-')}.pdf`;

    // Retornar PDF
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
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

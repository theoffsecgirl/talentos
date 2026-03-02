import { NextRequest, NextResponse } from 'next/server';
import { generatePDFFromURL } from '@/lib/puppeteer';

export const maxDuration = 60; // Puppeteer necesita más tiempo

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // Construir URL del endpoint HTML
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const host = req.headers.get('host') || 'localhost:3000';
    const htmlUrl = `${protocol}://${host}/api/mapa-html/${id}`;
    
    console.log('Generando PDF desde:', htmlUrl);
    
    // Generar PDF usando Puppeteer
    const pdfBuffer = await generatePDFFromURL(htmlUrl);
    
    // Obtener nombre de archivo (necesitamos hacer fetch al HTML para extraer info)
    const htmlResponse = await fetch(htmlUrl);
    const htmlText = await htmlResponse.text();
    const titleMatch = htmlText.match(/<title>Mapa de Talentos - (.+?)<\/title>/);
    const personName = titleMatch ? titleMatch[1].replace(/\s+/g, '-') : 'Mapa-Talentos';
    
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${personName}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generando mapa PDF:', error);
    return NextResponse.json(
      { error: 'Error generando mapa PDF', details: String(error) },
      { status: 500 }
    );
  }
}

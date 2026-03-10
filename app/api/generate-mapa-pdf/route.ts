import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import React from 'react'
import { MapaPDF } from '@/components/pdf/MapaPDF'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { nombre, scores, textoResumen, modelo } = body
    if (!nombre || !scores || !modelo) {
      return NextResponse.json({ error: 'Faltan campos: nombre, scores, modelo' }, { status: 400 })
    }
    if (!['genotipo', 'neurotalento'].includes(modelo)) {
      return NextResponse.json({ error: 'modelo debe ser genotipo o neurotalento' }, { status: 400 })
    }
    const buffer = await renderToBuffer(
      React.createElement(MapaPDF, { modelo, nombre, scores, textoResumen })
    )
    const filename = `${nombre.toLowerCase().replace(/\s+/g, '-')}-mapa-${modelo}.pdf`
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (err) {
    console.error('[generate-mapa-pdf]', err)
    return NextResponse.json({ error: 'Error generando PDF' }, { status: 500 })
  }
}

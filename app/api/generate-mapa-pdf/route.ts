import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import React from 'react'
import { MapaPDF } from '../../../src/components/pdf/MapaPDF'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { nombre, scores, textoResumen, modelo } = body
    if (!nombre || !scores || !modelo)
      return NextResponse.json({ error: 'Faltan campos: nombre, scores, modelo' }, { status: 400 })
    if (!['genotipo','neurotalento'].includes(modelo))
      return NextResponse.json({ error: 'modelo debe ser geniotipo o neurotalento' }, { status: 400 })
    const element = React.createElement(MapaPDF, { modelo, nombre, scores, textoResumen }) as React.ReactElement<any>
    const buffer = await renderToBuffer(element)
    const filename = `${nombre.toLowerCase().replace(/\s+/g,'-')}-mapa-${modelo}.pdf`
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="${filename}"` },
    })
  } catch (err) {
    console.error('[generate-mapa-pdf]', err)
    return NextResponse.json({ error: 'Error generando PDF' }, { status: 500 })
  }
}

import React from 'react'
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import {
  TALENT_COLORS, SYMBOLS_GENOTIPO, SYMBOLS_NEUROTALENTO,
  SOFT_SKILLS_GENOTIPO, SOFT_SKILLS_NEUROTALENTO,
  TALENT_NAMES, NEUROCOGNITIVE_DATA, EJES,
} from '../../lib/pdf-data'

const BG='#0B0B1A', BG2='#0F0F20', GRAY='#6B7280', BORDER='#1E1E36'

const styles = StyleSheet.create({
  portada: { backgroundColor: BG, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: 841.89, height: 595.28, padding: 60 },
  portadaEyebrow: { color: GRAY, fontSize: 8, letterSpacing: 4, marginBottom: 18 },
  portadaNombre:  { color: '#FFFFFF', fontSize: 38, fontWeight: 'bold', letterSpacing: 3 },
  portadaFecha:   { color: '#374151', fontSize: 9, marginTop: 14, letterSpacing: 2 },
  portadaLinea:   { width: 60, height: 2, backgroundColor: '#1E1E36', marginTop: 20, marginBottom: 20 },
  portadaModelo:  { color: '#374151', fontSize: 7, letterSpacing: 3, textTransform: 'uppercase' },
  portadaResumenBox: { marginTop: 28, borderWidth: 1, borderColor: BORDER, borderRadius: 8, padding: 16, width: '70%' },
  portadaResumenLabel: { color: GRAY, fontSize: 7, letterSpacing: 2, marginBottom: 6 },
  portadaResumenText:  { color: '#D1D5DB', fontSize: 9, lineHeight: 1.6 },
  page: { flexDirection: 'row', backgroundColor: BG, width: 841.89, height: 595.28 },
  colLeft: { width: '36%', padding: 38, flexDirection: 'column', justifyContent: 'space-between' },
  colRight: { width: '64%', backgroundColor: BG2, padding: 38, flexDirection: 'column' },
  simboloBig:   { fontSize: 72, fontWeight: 'bold', lineHeight: 1 },
  talentNombre: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', marginTop: 6 },
  ejeText:      { color: GRAY, fontSize: 6.5, letterSpacing: 1.5, marginTop: 5, lineHeight: 1.4 },
  scoreLabel:   { color: GRAY, fontSize: 6.5, letterSpacing: 2, textTransform: 'uppercase', marginTop: 18 },
  scoreValRow:  { flexDirection: 'row', alignItems: 'baseline', marginTop: 2 },
  scoreVal:     { fontSize: 44, fontWeight: 'bold', lineHeight: 1 },
  scoreDen:     { color: '#374151', fontSize: 18, marginLeft: 4 },
  barBig:       { height: 5, borderRadius: 3, marginTop: 6, backgroundColor: BORDER },
  sectionLabel: { color: GRAY, fontSize: 6.5, letterSpacing: 2, textTransform: 'uppercase', marginTop: 14, marginBottom: 5 },
  resumenText:  { color: '#D1D5DB', fontSize: 8.5, lineHeight: 1.6 },
  detalleText:  { color: '#9CA3AF', fontSize: 7.5, lineHeight: 1.5, marginTop: 8 },
  tagsRow:      { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 },
  ambitoTag:    { borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3, marginRight: 5, marginBottom: 5 },
  ambitoText:   { fontSize: 7, fontWeight: 'bold' },
  softTag:      { borderWidth: 1, borderRadius: 4, paddingHorizontal: 7, paddingVertical: 3, marginRight: 5, marginBottom: 5 },
  softText:     { fontSize: 7 },
  pageNum:      { color: '#1F2937', fontSize: 7, position: 'absolute', bottom: 16, right: 24 },
})

function Portada({ nombre, modelo, fecha, textoResumen }: { nombre: string; modelo: 'genotipo'|'neurotalento'; fecha: string; textoResumen?: string }) {
  const titulo = modelo === 'genotipo' ? 'INFORME DE TALENTOS' : 'INFORME DE NEUROTALENTOS'
  const modelLabel = modelo === 'genotipo' ? 'Talentos' : 'Neurotalento'
  return (
    <Page size="A4" orientation="landscape" style={styles.portada}>
      <Text style={styles.portadaEyebrow}>{titulo}</Text>
      <Text style={styles.portadaNombre}>{nombre.toUpperCase()}</Text>
      <View style={styles.portadaLinea} />
      <Text style={styles.portadaFecha}>{fecha}</Text>
      <Text style={[styles.portadaModelo, { marginTop: 6 }]}>Modelo {modelLabel}</Text>
      {textoResumen ? (
        <View style={styles.portadaResumenBox}>
          <Text style={styles.portadaResumenLabel}>RESUMEN DEL EVALUADOR</Text>
          <Text style={styles.portadaResumenText}>{textoResumen}</Text>
        </View>
      ) : null}
    </Page>
  )
}

function TalentPage({ talentKey, score, modelo, pageIndex }: { talentKey: string; score: number; modelo: 'genotipo'|'neurotalento'; pageIndex: number }) {
  const color      = TALENT_COLORS[talentKey]
  const symbol     = modelo === 'genotipo' ? SYMBOLS_GENOTIPO[talentKey] : SYMBOLS_NEUROTALENTO[talentKey]
  const data       = NEUROCOGNITIVE_DATA[talentKey]
  const softSkills = modelo === 'genotipo' ? SOFT_SKILLS_GENOTIPO[talentKey] : SOFT_SKILLS_NEUROTALENTO[talentKey]
  const puntos15   = Math.round(score * 15 / 100)
  const barW       = `${score}%`
  return (
    <Page size="A4" orientation="landscape" style={styles.page}>
      <View style={[styles.colLeft, { backgroundColor: color+'12' }]}>
        <View>
          <Text style={[styles.simboloBig, { color }]}>{symbol}</Text>
          <Text style={styles.talentNombre}>{TALENT_NAMES[talentKey]}</Text>
          <Text style={styles.ejeText}>{data.eje}</Text>
        </View>
        <View>
          <Text style={styles.scoreLabel}>Puntuación</Text>
          <View style={styles.scoreValRow}>
            <Text style={[styles.scoreVal, { color }]}>{puntos15}</Text>
            <Text style={styles.scoreDen}>/15</Text>
          </View>
          <View style={styles.barBig}>
            <View style={{ width: barW, height: 5, backgroundColor: color, borderRadius: 3 }} />
          </View>
        </View>
        {softSkills && softSkills.length > 0 ? (
          <View>
            <Text style={styles.sectionLabel}>Soft Skills</Text>
            <View style={styles.tagsRow}>
              {softSkills.map((s,i) => (
                <View key={i} style={[styles.softTag, { borderColor: color+'55' }]}>
                  <Text style={[styles.softText, { color }]}>{s}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}
      </View>
      <View style={styles.colRight}>
        <Text style={[styles.sectionLabel, { marginTop: 0 }]}>Resumen Neurocognitivo</Text>
        <Text style={styles.resumenText}>{data.resumen}</Text>
        <Text style={styles.detalleText}>{data.detalle}</Text>
        <Text style={styles.sectionLabel}>Ámbitos Profesionales</Text>
        <View style={styles.tagsRow}>
          {data.ambitos.map((a,i) => (
            <View key={i} style={[styles.ambitoTag, { backgroundColor: color+'22' }]}>
              <Text style={[styles.ambitoText, { color }]}>{a}</Text>
            </View>
          ))}
        </View>
      </View>
      <Text style={styles.pageNum}>{pageIndex} / 9</Text>
    </Page>
  )
}

export interface InformePDFProps {
  modelo: 'genotipo' | 'neurotalento'
  nombre: string
  scores: Record<string, number>
  textoResumen?: string
  fecha?: string
}

export function InformePDF({ modelo, nombre, scores, textoResumen, fecha }: InformePDFProps) {
  const ordenado = EJES.flatMap(e => e.keys).sort((a,b) => (scores[b]??0)-(scores[a]??0))
  const fechaStr = fecha ?? new Date().toLocaleDateString('es-ES', { year:'numeric', month:'long', day:'numeric' })
  return (
    <Document>
      <Portada nombre={nombre} modelo={modelo} fecha={fechaStr} textoResumen={textoResumen} />
      {ordenado.map((key,i) => <TalentPage key={key} talentKey={key} score={scores[key]??0} modelo={modelo} pageIndex={i+2} />)}
    </Document>
  )
}

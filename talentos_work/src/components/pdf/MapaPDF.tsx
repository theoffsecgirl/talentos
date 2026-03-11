import React from 'react'
import { Document, Page, View, Text, Svg, Circle, Path, StyleSheet } from '@react-pdf/renderer'
import { TALENT_COLORS, SYMBOLS_GENOTIPO, SYMBOLS_NEUROTALENTO, EJES, TALENT_NAMES, NEUROCOGNITIVE_DATA } from '../../lib/pdf-data'

const BG = '#0B0B1A'
const BG2 = '#0F0F20'
const BORDER = '#1E1E36'

const styles = StyleSheet.create({
  page: { flexDirection: 'row', backgroundColor: BG, width: 841.89, height: 595.28 },
  colLeft: { width: '48%', alignItems: 'center', justifyContent: 'center', padding: 28 },
  colRight: { width: '52%', backgroundColor: BG2, padding: 36, flexDirection: 'column', justifyContent: 'space-between' },
  mapaTitle: { color: '#6B7280', fontSize: 7, letterSpacing: 3, marginBottom: 12, textTransform: 'uppercase' },
  mapaSubtitle: { color: '#4B5563', fontSize: 6, marginTop: 10, letterSpacing: 1 },
  headerNombre: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold', letterSpacing: 2 },
  headerModelo: { color: '#4B5563', fontSize: 7, letterSpacing: 3, marginTop: 2 },
  perfilBox: { backgroundColor: '#13132A', borderRadius: 8, padding: 12, borderLeftWidth: 3, marginTop: 12, marginBottom: 10 },
  perfilTitulo: { color: '#FFFFFF', fontSize: 11, fontWeight: 'bold', marginBottom: 6 },
  perfilItem: { color: '#9CA3AF', fontSize: 7.5, marginBottom: 3, lineHeight: 1.4 },
  rolBox: { backgroundColor: '#1A1A30', borderRadius: 5, padding: 7, marginTop: 8 },
  rolLabel: { color: '#4B5563', fontSize: 6, letterSpacing: 2, textTransform: 'uppercase' },
  rolText: { color: '#D1D5DB', fontSize: 8, marginTop: 2 },
  ejeLabel: { color: '#374151', fontSize: 6, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 3, marginTop: 6 },
  talentRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  talentSymbol: { fontSize: 10, width: 16, textAlign: 'center' },
  talentScore: { color: '#FFFFFF', fontSize: 7.5, fontWeight: 'bold', width: 22, marginLeft: 2 },
  talentName: { color: '#9CA3AF', fontSize: 7, flex: 1 },
  barBg: { width: 70, height: 3, backgroundColor: BORDER, borderRadius: 2 },
  resumenBox: { borderTopWidth: 1, borderTopColor: BORDER, paddingTop: 8, marginTop: 6 },
  resumenLabel: { color: '#4B5563', fontSize: 6, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 3 },
  resumenText: { color: '#D1D5DB', fontSize: 7.5, lineHeight: 1.5 },
})

function BarTalent({ score, color }: { score: number; color: string }) {
  const w = Math.max(1, (score / 100) * 70)
  return (
    <View style={styles.barBg}>
      <View style={{ width: w, height: 3, backgroundColor: color, borderRadius: 2 }} />
    </View>
  )
}

function MapaSVG({ scores }: { scores: Record<string, number> }) {
  const cx = 150, cy = 150, r = 120
  const keys = ['gestion','estrategia','analitico','acompanamiento','imaginacion','profundo','aplicado','empatico']
  const step = (2 * Math.PI) / 8
  const toRad = (i: number) => i * step - Math.PI / 2
  return (
    <Svg width={300} height={300} viewBox="0 0 300 300">
      {[0.25,0.5,0.75,1].map((f,i) => <Circle key={i} cx={cx} cy={cy} r={r*f} fill="none" stroke="#1E1E36" strokeWidth={0.8} />)}
      {keys.map((key,i) => {
        const a1=toRad(i), a2=toRad(i+1), val=(scores[key]??0)/100, rv=r*val
        const x1=cx+rv*Math.cos(a1), y1=cy+rv*Math.sin(a1)
        const x2=cx+rv*Math.cos(a2), y2=cy+rv*Math.sin(a2)
        return <Path key={key} d={`M ${cx} ${cy} L ${x1} ${y1} A ${rv} ${rv} 0 0 1 ${x2} ${y2} Z`} fill={TALENT_COLORS[key]} fillOpacity={0.75} stroke={TALENT_COLORS[key]} strokeWidth={0.4} />
      })}
      {keys.map((_,i) => { const a=toRad(i); return <Path key={i} d={`M ${cx} ${cy} L ${cx+r*Math.cos(a)} ${cy+r*Math.sin(a)}`} stroke={BG} strokeWidth={1.5} /> })}
      <Circle cx={cx} cy={cy} r={3} fill="#FFFFFF" fillOpacity={0.4} />
    </Svg>
  )
}

export interface MapaPDFProps {
  modelo: 'genotipo' | 'neurotalento'
  nombre: string
  scores: Record<string, number>
  textoResumen?: string
}

export function MapaPDF({ modelo, nombre, scores, textoResumen }: MapaPDFProps) {
  const symbols = SYMBOLS_GENOTIPO
  const titulo  = modelo === 'genotipo' ? 'MAPA DE GENIOTIPOS' : 'MAPA DE NEUROTALENTOS'
  const modelLabel = modelo === 'genotipo' ? 'GENIOTIPO' : 'NEUROTALENTO'
  const dominante = Object.entries(scores).sort((a,b) => b[1]-a[1])[0][0]
  const dominanteData = NEUROCOGNITIVE_DATA[dominante]
  const dominanteColor = TALENT_COLORS[dominante]
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.colLeft}>
          <Text style={styles.mapaTitle}>{titulo}</Text>
          <MapaSVG scores={scores} />
          <Text style={styles.mapaSubtitle}>Basado en neurociencia aplicada</Text>
        </View>
        <View style={styles.colRight}>
          <View>
            <Text style={styles.headerNombre}>{nombre.toUpperCase()}</Text>
            <Text style={styles.headerModelo}>Modelo {modelLabel}</Text>
          </View>
          <View style={[styles.perfilBox, { borderLeftColor: dominanteColor }]}>
            <Text style={[styles.perfilTitulo, { color: dominanteColor }]}>{TALENT_NAMES[dominante].toUpperCase()}</Text>
            {dominanteData.perfilPuntos.map((p,i) => <Text key={i} style={styles.perfilItem}>· {p}</Text>)}
            <View style={styles.rolBox}>
              <Text style={styles.rolLabel}>Rol sugerido</Text>
              <Text style={styles.rolText}>{dominanteData.rol}</Text>
            </View>
          </View>
          <View>
            {EJES.map(eje => (
              <View key={eje.label}>
                <Text style={styles.ejeLabel}>{eje.label}</Text>
                {eje.keys.map(key => (
                  <View key={key} style={styles.talentRow}>
                    <Text style={[styles.talentSymbol, { color: TALENT_COLORS[key] }]}>{symbols[key]}</Text>
                    <Text style={styles.talentScore}>{scores[key]}</Text>
                    <Text style={styles.talentName}>{TALENT_NAMES[key]}</Text>
                    <BarTalent score={scores[key]} color={TALENT_COLORS[key]} />
                  </View>
                ))}
              </View>
            ))}
          </View>
          {textoResumen ? (
            <View style={styles.resumenBox}>
              <Text style={styles.resumenLabel}>Observaciones del evaluador</Text>
              <Text style={styles.resumenText}>{textoResumen}</Text>
            </View>
          ) : null}
        </View>
      </Page>
    </Document>
  )
}

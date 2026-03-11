import React from 'react'
import { Document, Page, View, Text, Svg, Circle, Path, StyleSheet } from '@react-pdf/renderer'
import { TALENT_COLORS, SYMBOLS_GENOTIPO, EJES, TALENT_NAMES, NEUROCOGNITIVE_DATA } from '@/lib/pdf-data'

const BG = '#0B0B1A'
const BG2 = '#0F0F20'
const BORDER = '#1E1E36'
const MUTED = '#6B7280'
const GRID = '#2A2A45'
const RADAR_FILL = '#D1D5DB'
const RADAR_STROKE = '#F3F4F6'
const SYMBOL_COLOR = '#D1D5DB'
const SCORE_COLOR = '#F9FAFB'
const BAR_RED = '#DC2626'
const BAR_DARK = '#111111'

const styles = StyleSheet.create({
  page: {
    flexDirection: 'row',
    backgroundColor: BG,
    width: 841.89,
    height: 595.28,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  colLeft: {
    width: '44%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 10,
  },
  colRight: {
    width: '56%',
    backgroundColor: BG2,
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderRadius: 10,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  mapaTitle: {
    color: MUTED,
    fontSize: 6.4,
    letterSpacing: 2.4,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  mapaSubtitle: {
    color: '#4B5563',
    fontSize: 5.5,
    marginTop: 6,
    letterSpacing: 0.8,
  },
  headerNombre: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1.2,
  },
  headerModelo: {
    color: '#6B7280',
    fontSize: 6,
    letterSpacing: 2.2,
    marginTop: 2,
  },
  perfilBox: {
    backgroundColor: '#13132A',
    borderRadius: 8,
    padding: 10,
    borderLeftWidth: 3,
    marginTop: 8,
    marginBottom: 8,
  },
  perfilTitulo: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  perfilItem: {
    color: '#C7CED8',
    fontSize: 6.5,
    marginBottom: 2.5,
    lineHeight: 1.35,
  },
  rolesRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  rolBox: {
    backgroundColor: '#1A1A30',
    borderRadius: 5,
    padding: 6,
    flex: 1,
    minHeight: 34,
  },
  rolLabel: {
    color: '#6B7280',
    fontSize: 5.3,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  rolText: {
    color: '#E5E7EB',
    fontSize: 6.8,
    marginTop: 2,
    lineHeight: 1.2,
  },
  ejesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 2,
    marginTop: 2,
  },
  ejeBlock: {
    width: '48.5%',
    marginBottom: 4,
  },
  ejeLabel: {
    color: '#7B8192',
    fontSize: 5.4,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    marginBottom: 2.5,
  },
  talentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  talentSymbol: {
    fontSize: 8.5,
    width: 12,
    textAlign: 'center',
    color: SYMBOL_COLOR,
  },
  talentScore: {
    color: SCORE_COLOR,
    fontSize: 6.2,
    fontWeight: 'bold',
    width: 18,
    marginLeft: 2,
  },
  talentName: {
    color: '#C7CED8',
    fontSize: 5.8,
    width: 110,
    lineHeight: 1.15,
    marginRight: 4,
  },
  barBg: {
    width: 58,
    height: 3,
    backgroundColor: BORDER,
    borderRadius: 2,
  },
  resumenBox: {
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingTop: 6,
    marginTop: 4,
  },
  resumenLabel: {
    color: '#6B7280',
    fontSize: 5.3,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  resumenText: {
    color: '#D1D5DB',
    fontSize: 6.5,
    lineHeight: 1.35,
  },
})

function BarTalent({ score }: { score: number }) {
  const totalWidth = 58
  const safeScore = Number.isFinite(score) ? Math.max(0, Math.min(100, score)) : 0
  const w = Math.max(1, (safeScore / 100) * totalWidth)
  const color = safeScore > 67 ? BAR_RED : BAR_DARK
  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: totalWidth, marginBottom: 1.5 }}>
        <Text style={{ color: MUTED, fontSize: 4.6 }}>0</Text>
        <Text style={{ color: MUTED, fontSize: 4.6 }}>60</Text>
        <Text style={{ color: MUTED, fontSize: 4.6 }}>100</Text>
      </View>
      <View style={styles.barBg}>
        <View style={{ width: w, height: 3, backgroundColor: color, borderRadius: 2 }} />
      </View>
    </View>
  )
}

function MapaSVG({ scores }: { scores: Record<string, number> }) {
  const cx = 118
  const cy = 118
  const r = 82
  const keys = ['gestion', 'estrategia', 'imaginacion', 'profundo', 'aplicado', 'empatico', 'analitico', 'acompanamiento']
  const step = (2 * Math.PI) / keys.length
  const toRad = (i: number) => i * step - Math.PI / 2
  const levels = [0.2, 0.4, 0.6, 0.8, 1]

  const points = keys.map((key, i) => {
    const raw = Number(scores?.[key] ?? 0)
    const valuePct = Number.isFinite(raw) ? Math.max(0, Math.min(100, raw)) : 0
    const value = valuePct / 100
    const angle = toRad(i)
    const rv = r * value
    return {
      key,
      value: Math.round(valuePct),
      x: cx + rv * Math.cos(angle),
      y: cy + rv * Math.sin(angle),
      labelX: cx + (rv + 10) * Math.cos(angle),
      labelY: cy + (rv + 10) * Math.sin(angle),
    }
  })

  const radarPath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(' ') + ' Z'

  return (
    <Svg width={236} height={236} viewBox="0 0 236 236">
      {levels.map((level, idx) => {
        const ringPath = keys
          .map((_, i) => {
            const angle = toRad(i)
            const x = cx + (r * level) * Math.cos(angle)
            const y = cy + (r * level) * Math.sin(angle)
            return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`
          })
          .join(' ') + ' Z'
        return <Path key={`ring-${idx}`} d={ringPath} fill="none" stroke={GRID} strokeWidth={0.8} />
      })}

      {keys.map((_, i) => {
        const angle = toRad(i)
        return (
          <Path
            key={`axis-${i}`}
            d={`M ${cx} ${cy} L ${(cx + r * Math.cos(angle)).toFixed(2)} ${(cy + r * Math.sin(angle)).toFixed(2)}`}
            stroke={GRID}
            strokeWidth={0.8}
          />
        )
      })}

      <Path d={radarPath} fill={RADAR_FILL} fillOpacity={0.32} stroke={RADAR_STROKE} strokeWidth={1.2} />

      {points.map((p) => (
        <Circle key={`point-${p.key}`} cx={p.x} cy={p.y} r={2.2} fill={RADAR_STROKE} />
      ))}

      {[0, 60, 100].map((tick, idx) => (
        <Text
          key={`tick-${tick}`}
          style={{ color: MUTED, fontSize: 5.8 }}
          x={cx + 4}
          y={cy - (r * [0, 0.6, 1][idx]) + (idx === 0 ? -2 : 2)}
        >
          {String(tick)}
        </Text>
      ))}

      {points.map((p) => (
        <Text
          key={`score-${p.key}`}
          style={{ color: '#E5E7EB', fontSize: 5.4, fontWeight: 'bold' }}
          x={p.labelX - 4}
          y={p.labelY + 2}
        >
          {String(p.value)}
        </Text>
      ))}

      <Circle cx={cx} cy={cy} r={3} fill="#FFFFFF" fillOpacity={0.55} />
    </Svg>
  )
}

export interface MapaPDFProps {
  modelo: 'genotipo' | 'neurotalento'
  nombre: string
  scores: Record<string, number>
  textoResumen?: string
  rolEscogido?: string
  rolPensado?: string
}

export function MapaPDF({ modelo, nombre, scores, textoResumen, rolEscogido, rolPensado }: MapaPDFProps) {
  const symbols = SYMBOLS_GENOTIPO
  const titulo = modelo === 'genotipo' ? 'MAPA DE GENIOTIPOS' : 'MAPA DE NEUROTALENTOS'
  const modelLabel = modelo === 'genotipo' ? 'GENIOTIPO' : 'NEUROTALENTO'
  const dominante = Object.entries(scores).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'gestion'
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
            {dominanteData?.perfilPuntos?.map((p, i) => (
              <Text key={i} style={styles.perfilItem}>· {p}</Text>
            ))}

            <View style={styles.rolesRow}>
              <View style={styles.rolBox}>
                <Text style={styles.rolLabel}>Rol sugerido</Text>
                <Text style={styles.rolText}>{dominanteData?.rol || 'No indicado'}</Text>
              </View>
              <View style={styles.rolBox}>
                <Text style={styles.rolLabel}>Rol escogido</Text>
                <Text style={styles.rolText}>{(rolEscogido && rolEscogido.trim()) || 'No indicado'}</Text>
              </View>
              <View style={styles.rolBox}>
                <Text style={styles.rolLabel}>Rol pensado</Text>
                <Text style={styles.rolText}>{(rolPensado && rolPensado.trim()) || 'No indicado'}</Text>
              </View>
            </View>
          </View>

          <View style={styles.ejesGrid}>
            {EJES.map((eje) => (
              <View key={eje.label} style={styles.ejeBlock}>
                <Text style={styles.ejeLabel}>{eje.label}</Text>
                {eje.keys.map((key) => (
                  <View key={key} style={styles.talentRow}>
                    <Text style={styles.talentSymbol}>{symbols[key]}</Text>
                    <Text style={styles.talentScore}>{Math.round(scores[key] ?? 0)}</Text>
                    <Text style={styles.talentName}>{TALENT_NAMES[key]}</Text>
                    <BarTalent score={scores[key] ?? 0} />
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

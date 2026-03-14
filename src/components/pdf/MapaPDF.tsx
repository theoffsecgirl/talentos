import React from 'react'
import { Document, Page, View, Text, Svg, Circle, Path, StyleSheet } from '@react-pdf/renderer'
import { TALENT_COLORS, SYMBOLS_GENOTIPO, EJES, TALENT_NAMES, NEUROCOGNITIVE_DATA } from '../../lib/pdf-data'

const BG = '#0B0B1A'
const BG2 = '#0F0F20'
const BORDER = '#1E1E36'
const MUTED = '#6B7280'
const GRID = '#2A2A45'
const RADAR_FILL = '#D1D5DB'
const RADAR_STROKE = '#F3F4F6'
const SYMBOL_COLOR = '#E5E7EB'
const SCORE_COLOR = '#F9FAFB'
const BAR_RED = '#DC2626'
const BAR_DARK = '#111111'

const styles = StyleSheet.create({
  page: {
    flexDirection: 'row',
    backgroundColor: BG,
    width: 841.89,
    height: 595.28,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  colLeft: {
    width: '36%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 10,
  },
  colRight: {
    width: '64%',
    backgroundColor: BG2,
    paddingVertical: 12,
    paddingHorizontal: 12,
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
    fontSize: 14.5,
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
    fontSize: 8.2,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  perfilItem: {
    color: '#C7CED8',
    fontSize: 6.0,
    marginBottom: 2,
    lineHeight: 1.35,
  },
  rolesRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 6,
  },
  rolBox: {
    backgroundColor: '#1A1A30',
    borderRadius: 5,
    padding: 6,
    flex: 1,
    minHeight: 30,
  },
  rolLabel: {
    color: '#6B7280',
    fontSize: 5.3,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  rolText: {
    color: '#E5E7EB',
    fontSize: 6.2,
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
    fontSize: 4.5,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    marginBottom: 2.5,
  },
  talentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  talentSymbol: {
    fontSize: 6.6,
    width: 12,
    textAlign: 'center',
    color: SYMBOL_COLOR,
  },
  talentScore: {
    color: SCORE_COLOR,
    fontSize: 5.4,
    fontWeight: 'bold',
    width: 16,
    marginLeft: 2,
  },
  talentName: {
    color: '#C7CED8',
    fontSize: 4.35,
    width: 120,
    lineHeight: 1.15,
    marginRight: 3,
  },
  barBg: {
    width: 42,
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
    fontSize: 6.0,
    lineHeight: 1.3,
  },
})

function BarTalent({ score }: { score: number }) {
  const totalWidth = 42
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
  const r = 74
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
      labelX: cx + (rv + 8) * Math.cos(angle),
      labelY: cy + (rv + 8) * Math.sin(angle),
    }
  })

  const radarPath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(' ') + ' Z'

  return (
    <Svg width={214} height={214} viewBox="0 0 236 236">
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
          style={{ color: MUTED, fontSize: 5.0 }}
          x={cx + 4}
          y={cy - (r * [0, 0.6, 1][idx]) + (idx === 0 ? -2 : 2)}
        >
          {String(tick)}
        </Text>
      ))}

      {points.map((p) => (
        <Text
          key={`score-${p.key}`}
          style={{ color: '#E5E7EB', fontSize: 4.8, fontWeight: 'bold' }}
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
  const symbols: Record<string, string> = { ...SYMBOLS_GENOTIPO, analitico: '⬠' }
  const titulo = modelo === 'genotipo' ? 'MAPA DE TALENTOS' : 'MAPA DE NEUROTALENTOS'
  const modelLabel = modelo === 'genotipo' ? 'TALENTOS' : 'NEUROTALENTO'
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

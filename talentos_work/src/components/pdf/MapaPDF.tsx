import React from 'react'
import { Document, Page, View, Text, StyleSheet, Image } from '@react-pdf/renderer'
import {
  TALENT_COLORS,
  SYMBOLS_GENOTIPO,
  SYMBOLS_NEUROTALENTO,
  EJES,
  TALENT_NAMES,
  NEUROCOGNITIVE_DATA,
} from '../../lib/pdf-data'

const PAGE_BG = '#F3F5F9'
const CARD_BG = '#FFFFFF'
const TEXT = '#152033'
const MUTED = '#617086'
const BORDER = '#DCE3ED'
const RED = '#C81E1E'
const ID_ORDER = ['gestion', 'estrategia', 'imaginacion', 'profundo', 'aplicado', 'empatico', 'analitico', 'acompanamiento'] as const

type TalentKey = keyof typeof TALENT_NAMES

const RANK_PRIORITY = ['estrategia', 'analitico', 'acompanamiento', 'gestion', 'empatico', 'imaginacion', 'profundo', 'aplicado'] as const
const RANK_INDEX = RANK_PRIORITY.reduce((acc, key, index) => {
  acc[key as TalentKey] = index
  return acc
}, {} as Record<TalentKey, number>)

const styles = StyleSheet.create({
  page: {
    backgroundColor: PAGE_BG,
    paddingTop: 22,
    paddingBottom: 22,
    paddingHorizontal: 24,
    color: TEXT,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  eyebrow: {
    fontSize: 9,
    color: MUTED,
    letterSpacing: 1.5,
    fontWeight: 700,
    marginBottom: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: 800,
    color: TEXT,
  },
  name: {
    fontSize: 13,
    color: MUTED,
    marginTop: 6,
  },
  chip: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
    fontSize: 9,
    color: MUTED,
  },
  body: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  left: {
    width: '60%',
    paddingRight: 10,
  },
  right: {
    width: '40%',
    paddingLeft: 10,
  },
  card: {
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 18,
  },
  mapCard: {
    padding: 18,
    minHeight: 476,
  },
  sectionTitle: {
    fontSize: 10,
    color: MUTED,
    fontWeight: 800,
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  mapWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 360,
  },
  summaryBanner: {
    backgroundColor: '#0F172A',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 10,
  },
  summaryText: {
    color: '#F8FAFC',
    fontSize: 9,
    lineHeight: 1.45,
    textAlign: 'center',
  },
  sideCard: {
    padding: 18,
    marginBottom: 12,
  },
  profileName: {
    fontSize: 18,
    color: TEXT,
    fontWeight: 800,
    lineHeight: 1.2,
    marginBottom: 8,
  },
  profileRole: {
    fontSize: 11,
    color: MUTED,
    lineHeight: 1.35,
    marginBottom: 12,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  bulletDot: {
    width: 10,
    fontSize: 10,
    color: RED,
    fontWeight: 800,
  },
  bulletText: {
    flex: 1,
    fontSize: 9,
    lineHeight: 1.4,
    color: TEXT,
  },
  batteryCard: {
    padding: 18,
  },
  axisTitle: {
    fontSize: 8.5,
    color: MUTED,
    fontWeight: 800,
    letterSpacing: 1,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    paddingBottom: 5,
  },
  axisBlock: {
    marginBottom: 10,
  },
  batteryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  batterySymbol: {
    width: 18,
    fontSize: 14,
    fontWeight: 700,
    color: TEXT,
    textAlign: 'center',
    marginTop: 1,
  },
  batteryValue: {
    width: 24,
    fontSize: 10,
    fontWeight: 800,
    color: TEXT,
    textAlign: 'right',
    marginRight: 8,
    marginTop: 2,
  },
  batteryLabel: {
    width: 124,
    fontSize: 9,
    lineHeight: 1.3,
    fontWeight: 700,
    color: TEXT,
    paddingRight: 8,
  },
  batteryBarCol: {
    flex: 1,
    marginTop: 1,
  },
  barLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  barLabelText: {
    fontSize: 7,
    color: MUTED,
  },
  barTrack: {
    height: 7,
    borderRadius: 999,
    backgroundColor: '#D5DAE3',
    overflow: 'hidden',
  },
  barFillBase: {
    height: 7,
    borderRadius: 999,
  },
})

function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(n || 0)))
}

function polarToCartesian(cx: number, cy: number, angle: number, r: number) {
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }
}

function createArcPath(cx: number, cy: number, startAngle: number, endAngle: number, outerR: number, innerR: number) {
  const start = polarToCartesian(cx, cy, startAngle, outerR)
  const end = polarToCartesian(cx, cy, endAngle, outerR)
  const innerEnd = polarToCartesian(cx, cy, endAngle, innerR)
  const innerStart = polarToCartesian(cx, cy, startAngle, innerR)
  const laf = endAngle - startAngle > Math.PI ? 1 : 0
  return [
    `M ${start.x} ${start.y}`,
    `A ${outerR} ${outerR} 0 ${laf} 1 ${end.x} ${end.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerR} ${innerR} 0 ${laf} 0 ${innerStart.x} ${innerStart.y}`,
    'Z',
  ].join(' ')
}

function splitLabel(title: string) {
  if (title.includes(' y ')) {
    const p = title.split(' y ')
    if (p.length === 2) return [p[0] + ' y', p[1]]
  }
  if (title.includes(' e ')) {
    const p = title.split(' e ')
    if (p.length === 2) return [p[0] + ' e', p[1]]
  }
  const words = title.split(' ')
  const mid = Math.ceil(words.length / 2)
  return [words.slice(0, mid).join(' '), words.slice(mid).join(' ')]
}

function escapeSvgText(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function sortTalentKeysByScore(scores: Record<string, number>): TalentKey[] {
  return [...ID_ORDER].sort((a, b) => {
    const diff = clamp(scores[b] ?? 0) - clamp(scores[a] ?? 0)
    if (diff !== 0) return diff
    return RANK_INDEX[a] - RANK_INDEX[b]
  }) as TalentKey[]
}

function buildCoverWheelSvg(modelo: 'genotipo' | 'neurotalento', scores: Record<string, number>) {
  const size = 640
  const center = size / 2
  const radius = 206
  const innerRadius = 72
  const step = (Math.PI * 2) / ID_ORDER.length
  const symbols = modelo === 'genotipo' ? SYMBOLS_GENOTIPO : SYMBOLS_NEUROTALENTO

  const sections = ID_ORDER.map((key, index) => {
    const color = TALENT_COLORS[key]
    const value = clamp(scores[key] ?? 0)
    const fillPct = value / 100
    const fillRadius = innerRadius + (radius - innerRadius) * fillPct
    const startAngle = index * step - Math.PI / 2
    const endAngle = startAngle + step
    const mid = (startAngle + endAngle) / 2
    const pctPos = polarToCartesian(center, center, mid, (fillRadius + innerRadius) / 2)
    const labelPos = polarToCartesian(center, center, mid, radius + 40)
    const [line1, line2] = splitLabel(TALENT_NAMES[key])

    return {
      key,
      color,
      value,
      symbol: symbols[key] ?? '',
      pctPos,
      labelPos,
      line1,
      line2,
      fillPath: createArcPath(center, center, startAngle, endAngle, fillRadius, innerRadius),
      outlinePath: createArcPath(center, center, startAngle, endAngle, radius, innerRadius),
      gradientId: `cover-g-${key}`,
    }
  })

  const diagonals = [1, 3, 5, 7]
    .map((idx) => {
      const angle = idx * step - Math.PI / 2
      const outer = polarToCartesian(center, center, angle, radius)
      return `<line x1="${center}" y1="${center}" x2="${outer.x.toFixed(2)}" y2="${outer.y.toFixed(2)}" stroke="#666666" stroke-width="1" stroke-dasharray="4 4" />`
    })
    .join('')

  const defs = sections
    .map((s) => `
      <radialGradient id="${s.gradientId}" cx="50%" cy="50%">
        <stop offset="0%" stop-color="${s.color}" stop-opacity="${Math.min((s.value / 100) * 1.2, 1).toFixed(3)}" />
        <stop offset="${s.value.toFixed(2)}%" stop-color="${s.color}" stop-opacity="0.6" />
        <stop offset="100%" stop-color="${s.color}" stop-opacity="0.1" />
      </radialGradient>`)
    .join('')

  const sectorMarkup = sections
    .map((s) => `
      <g>
        <path d="${s.fillPath}" fill="url(#${s.gradientId})" stroke="${s.color}" stroke-width="1" />
        <path d="${s.outlinePath}" fill="none" stroke="${s.color}" stroke-width="2" opacity="0.3" />
        ${s.value > 15 ? `<text x="${s.pctPos.x.toFixed(2)}" y="${s.pctPos.y.toFixed(2)}" text-anchor="middle" dominant-baseline="middle" font-size="16" font-weight="700" fill="#FFFFFF" stroke="rgba(0,0,0,0.24)" stroke-width="2" paint-order="stroke">${s.value}</text>` : ''}
        <text x="${s.labelPos.x.toFixed(2)}" y="${(s.labelPos.y - 12).toFixed(2)}" text-anchor="middle" dominant-baseline="middle" font-size="14" font-weight="700" fill="${s.color}">${escapeSvgText(String(s.symbol))}</text>
        <text x="${s.labelPos.x.toFixed(2)}" y="${(s.labelPos.y + 4).toFixed(2)}" text-anchor="middle" dominant-baseline="middle" font-size="5.3" font-weight="600" fill="#333333">${escapeSvgText(s.line1)}</text>
        ${s.line2 ? `<text x="${s.labelPos.x.toFixed(2)}" y="${(s.labelPos.y + 13).toFixed(2)}" text-anchor="middle" dominant-baseline="middle" font-size="5.3" font-weight="600" fill="#333333">${escapeSvgText(s.line2)}</text>` : ''}
      </g>`)
    .join('')

  const centerText = modelo === 'genotipo' ? 'Talentos' : 'Neurotalento'

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <defs>${defs}</defs>
      <line x1="${center}" y1="${center - radius}" x2="${center}" y2="${center + radius}" stroke="#000000" stroke-width="2" />
      <line x1="${center - radius}" y1="${center}" x2="${center + radius}" y2="${center}" stroke="#000000" stroke-width="2" />
      ${diagonals}
      ${sectorMarkup}
      <circle cx="${center}" cy="${center}" r="${innerRadius}" fill="#FFFFFF" stroke="#000000" stroke-width="2" />
      <text x="${center}" y="${center + 6}" text-anchor="middle" dominant-baseline="middle" font-size="16" font-weight="700" fill="#555555">${centerText}</text>
    </svg>`
}

function svgToDataUri(svg: string) {
  return `data:image/svg+xml;base64,${Buffer.from(svg, 'utf8').toString('base64')}`
}

function WheelGraphic({ modelo, scores }: { modelo: 'genotipo' | 'neurotalento'; scores: Record<string, number> }) {
  const src = svgToDataUri(buildCoverWheelSvg(modelo, scores))
  return <Image src={src} style={{ width: 392, height: 392 }} />
}

function BatteryBar({ value }: { value: number }) {
  const pct = clamp(value)
  const fillColor = pct > 67 ? RED : '#111111'
  return (
    <View style={styles.batteryBarCol}>
      <View style={styles.barLabels}>
        <Text style={styles.barLabelText}>0</Text>
        <Text style={styles.barLabelText}>60</Text>
        <Text style={styles.barLabelText}>100</Text>
      </View>
      <View style={styles.barTrack}>
        <View style={[styles.barFillBase, { width: `${pct}%`, backgroundColor: fillColor }]} />
      </View>
    </View>
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
  const symbols = modelo === 'genotipo' ? SYMBOLS_GENOTIPO : SYMBOLS_NEUROTALENTO
  const winnerKey = sortTalentKeysByScore(scores)[0] as TalentKey
  const winnerData = NEUROCOGNITIVE_DATA[winnerKey]
  const winnerRole = winnerData?.rol ?? 'No indicado'
  const bullets = (winnerData?.perfilPuntos ?? []).slice(0, 4)
  const mapTitle = modelo === 'genotipo' ? 'Mapa de talentos' : 'Mapa de neurotalentos'
  const batteryGroups = EJES.map((eje) => ({
    label: eje.label,
    rows: eje.keys.map((key) => ({
      key: key as TalentKey,
      symbol: symbols[key] ?? '',
      value: clamp(scores[key] ?? 0),
      label: TALENT_NAMES[key],
    })),
  }))

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page} wrap={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>Centro Educativo San Cristóbal-Castellón</Text>
            <Text style={styles.title}>{mapTitle}</Text>
            <Text style={styles.name}>{nombre}</Text>
          </View>
          <Text style={styles.chip}>Basado en neurociencia aplicada</Text>
        </View>

        <View style={styles.body}>
          <View style={styles.left}>
            <View style={[styles.card, styles.mapCard]}>
              <Text style={styles.sectionTitle}>Mapa principal</Text>
              <View style={styles.mapWrap}>
                <WheelGraphic modelo={modelo} scores={scores} />
              </View>
              <View style={styles.summaryBanner}>
                <Text style={styles.summaryText}>{textoResumen?.trim() || 'Síntesis general del perfil y de las baterías dominantes identificadas en la evaluación.'}</Text>
              </View>
            </View>
          </View>

          <View style={styles.right}>
            <View style={[styles.card, styles.sideCard]}>
              <Text style={styles.sectionTitle}>Perfil profesional</Text>
              <Text style={styles.profileName}>{TALENT_NAMES[winnerKey]}</Text>
              <Text style={styles.profileRole}>{winnerRole}</Text>
              {bullets.map((item, index) => (
                <View key={`${winnerKey}-${index}`} style={styles.bulletRow}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>{item}</Text>
                </View>
              ))}
              {rolEscogido ? (
                <View style={[styles.bulletRow, { marginTop: 6 }]}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>Campo identificado: {rolEscogido}</Text>
                </View>
              ) : null}
              {rolPensado ? (
                <View style={styles.bulletRow}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>Idea profesional: {rolPensado}</Text>
                </View>
              ) : null}
            </View>

            <View style={[styles.card, styles.batteryCard]}>
              <Text style={styles.sectionTitle}>Baterías destacadas</Text>
              {batteryGroups.map((group) => (
                <View key={group.label} style={styles.axisBlock}>
                  <Text style={styles.axisTitle}>{group.label}</Text>
                  {group.rows.map((row) => (
                    <View key={row.key} style={styles.batteryRow}>
                      <Text style={[styles.batterySymbol, { color: TALENT_COLORS[row.key] }]}>{row.symbol}</Text>
                      <Text style={styles.batteryValue}>{row.value}</Text>
                      <Text style={styles.batteryLabel}>{row.label}</Text>
                      <BatteryBar value={row.value} />
                    </View>
                  ))}
                </View>
              ))}
            </View>
          </View>
        </View>
      </Page>
    </Document>
  )
}

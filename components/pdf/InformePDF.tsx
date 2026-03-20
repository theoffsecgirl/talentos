import React from 'react'
import { Document, Page, View, Text, StyleSheet, Svg, Path, Circle, Line, Text as SvgText } from '@react-pdf/renderer'
import {
  TALENT_COLORS,
  SYMBOLS_GENOTIPO,
  SYMBOLS_NEUROTALENTO,
  SOFT_SKILLS_GENOTIPO,
  SOFT_SKILLS_NEUROTALENTO,
  TALENT_NAMES,
  NEUROCOGNITIVE_DATA,
  EJES,
} from '../../lib/pdf-data'

const PAGE_BG = '#F3F5F9'
const CARD_BG = '#FFFFFF'
const TEXT = '#152033'
const MUTED = '#617086'
const BORDER = '#DCE3ED'
const DARK = '#111827'
const RED = '#C81E1E'

const ID_ORDER = ['gestion', 'estrategia', 'imaginacion', 'profundo', 'aplicado', 'empatico', 'analitico', 'acompanamiento'] as const

type TalentKey = keyof typeof TALENT_NAMES

type InformePDFProps = {
  modelo: 'genotipo' | 'neurotalento'
  nombre: string
  scores: Record<string, number>
  textoResumen?: string
  fecha?: string
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: PAGE_BG,
    paddingTop: 22,
    paddingBottom: 22,
    paddingHorizontal: 24,
    color: TEXT,
    fontFamily: 'Helvetica',
  },
  card: {
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 18,
  },
  coverHeader: {
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
  coverTitle: {
    fontSize: 24,
    fontWeight: 800,
    color: TEXT,
  },
  coverName: {
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
  coverBody: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  coverLeft: {
    width: '55%',
    paddingRight: 10,
  },
  coverRight: {
    width: '45%',
    paddingLeft: 10,
  },
  mapCard: {
    padding: 18,
    minHeight: 448,
  },
  coverSectionTitle: {
    fontSize: 10,
    color: MUTED,
    fontWeight: 800,
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  mapWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 322,
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
    color: DARK,
    textAlign: 'center',
    marginTop: 1,
  },
  batteryValue: {
    width: 24,
    fontSize: 10,
    fontWeight: 800,
    color: DARK,
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
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '70%',
  },
  detailSymbolBox: {
    width: 66,
    height: 66,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  detailSymbol: {
    fontSize: 34,
    fontWeight: 800,
  },
  detailTitleWrap: {
    flex: 1,
  },
  detailTitle: {
    fontSize: 22,
    fontWeight: 800,
    color: TEXT,
    lineHeight: 1.1,
  },
  detailAxis: {
    fontSize: 9,
    color: MUTED,
    marginTop: 6,
    lineHeight: 1.35,
    letterSpacing: 0.5,
  },
  scoreCard: {
    width: 96,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 8,
    color: MUTED,
    letterSpacing: 1,
    fontWeight: 800,
    marginBottom: 5,
  },
  scoreValue: {
    fontSize: 28,
    fontWeight: 800,
  },
  infoStrip: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    backgroundColor: '#FBFCFE',
    padding: 14,
    marginBottom: 14,
  },
  twoCol: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  colMain: {
    width: '58%',
    paddingRight: 8,
  },
  colSide: {
    width: '42%',
    paddingLeft: 8,
  },
  panel: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 16,
    backgroundColor: '#FBFCFE',
    padding: 16,
    marginBottom: 12,
  },
  panelTitle: {
    fontSize: 9,
    color: MUTED,
    letterSpacing: 1,
    fontWeight: 800,
    marginBottom: 10,
  },
  bodyText: {
    fontSize: 10,
    color: TEXT,
    lineHeight: 1.45,
  },
  bodyTextMuted: {
    fontSize: 9,
    color: MUTED,
    lineHeight: 1.45,
    marginTop: 8,
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginRight: -6,
    marginBottom: -6,
  },
  tag: {
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 9,
    marginRight: 6,
    marginBottom: 6,
  },
  tagText: {
    fontSize: 8,
    fontWeight: 700,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 8,
    color: MUTED,
  },
  softTitle: {
    fontSize: 24,
    fontWeight: 800,
    color: TEXT,
    marginTop: 4,
  },
  softIntro: {
    fontSize: 10,
    lineHeight: 1.45,
    color: MUTED,
    marginTop: 8,
    marginBottom: 14,
  },
  softRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  softBatteryCol: {
    width: '32%',
    paddingRight: 10,
  },
  softSkillsCol: {
    width: '68%',
  },
  softBatteryWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  softSymbolBox: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  softSymbol: {
    fontSize: 15,
    fontWeight: 800,
  },
  softBatteryText: {
    flex: 1,
    fontSize: 10,
    color: TEXT,
    fontWeight: 700,
    lineHeight: 1.35,
  },
  emptyText: {
    fontSize: 10,
    color: MUTED,
    lineHeight: 1.5,
  },
})

function hex2rgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.slice(0, 2), 16)
  const g = parseInt(clean.slice(2, 4), 16)
  const b = parseInt(clean.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

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

function modelSymbols(modelo: 'genotipo' | 'neurotalento') {
  return modelo === 'genotipo' ? SYMBOLS_GENOTIPO : SYMBOLS_NEUROTALENTO
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

function WheelGraphic({ modelo, scores }: { modelo: 'genotipo' | 'neurotalento'; scores: Record<string, number> }) {
  const symbols = modelSymbols(modelo)
  const size = 360
  const center = size / 2
  const radius = 118
  const innerRadius = 42
  const sections = ID_ORDER.map((key, index) => {
    const color = TALENT_COLORS[key]
    const value = clamp(scores[key] ?? 0)
    const fillRadius = innerRadius + (radius - innerRadius) * (value / 100)
    const step = (Math.PI * 2) / ID_ORDER.length
    const startAngle = index * step - Math.PI / 2
    const endAngle = startAngle + step
    const mid = (startAngle + endAngle) / 2
    const pctPos = polarToCartesian(center, center, mid, (fillRadius + innerRadius) / 2)
    const labelPos = polarToCartesian(center, center, mid, radius + 34)
    const [line1, line2] = splitLabel(TALENT_NAMES[key])
    return {
      key,
      color,
      value,
      symbol: symbols[key],
      startAngle,
      endAngle,
      fillRadius,
      pctPos,
      labelPos,
      line1,
      line2,
      bgPath: createArcPath(center, center, startAngle, endAngle, radius, innerRadius),
      fillPath: createArcPath(center, center, startAngle, endAngle, fillRadius, innerRadius),
    }
  })

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Line x1={center} y1={center - radius} x2={center} y2={center + radius} stroke="#111111" strokeWidth={1.5} />
      <Line x1={center - radius} y1={center} x2={center + radius} y2={center} stroke="#111111" strokeWidth={1.5} />
      {[1, 3, 5, 7].map((idx) => {
        const angle = (idx * Math.PI * 2) / ID_ORDER.length - Math.PI / 2
        const outer = polarToCartesian(center, center, angle, radius)
        return <Line key={idx} x1={center} y1={center} x2={outer.x} y2={outer.y} stroke="#8A94A6" strokeWidth={1} />
      })}
      {sections.map((s) => (
        <React.Fragment key={s.key}>
          <Path d={s.bgPath} fill={hex2rgba(s.color, 0.14)} stroke={s.color} strokeWidth={1.2} />
          <Path d={s.fillPath} fill={s.color} />
          {s.value > 0 ? (
            <SvgText x={s.pctPos.x} y={s.pctPos.y + 4} style={{ fontSize: 11, fontWeight: 800, fill: "#FFFFFF", textAnchor: "middle" }}>
              {String(s.value)}
            </SvgText>
          ) : null}
          <SvgText x={s.labelPos.x} y={s.labelPos.y - 6} style={{ fontSize: 10.5, fontWeight: 800, fill: "#222222", textAnchor: "middle" }}>
            {s.symbol}
          </SvgText>
          <SvgText x={s.labelPos.x} y={s.labelPos.y + 8} style={{ fontSize: 5.5, fontWeight: 700, fill: "#333333", textAnchor: "middle" }}>
            {s.line1}
          </SvgText>
          {s.line2 ? (
            <SvgText x={s.labelPos.x} y={s.labelPos.y + 15} style={{ fontSize: 5.5, fontWeight: 700, fill: "#333333", textAnchor: "middle" }}>
              {s.line2}
            </SvgText>
          ) : null}
        </React.Fragment>
      ))}
      <Circle cx={center} cy={center} r={innerRadius} fill="#FFFFFF" stroke="#111111" strokeWidth={1.5} />
      <SvgText x={center} y={center - 4} style={{ fontSize: 8, fontWeight: 800, fill: "#475569", textAnchor: "middle" }}>
        MAPA
      </SvgText>
      <SvgText x={center} y={center + 8} style={{ fontSize: 8, fontWeight: 800, fill: "#475569", textAnchor: "middle" }}>
        {modelo === 'genotipo' ? 'TALENTOS' : 'NEUROTALENTOS'}
      </SvgText>
    </Svg>
  )
}

function CoverPage({ nombre, modelo, scores, textoResumen, fecha }: InformePDFProps & { fecha: string }) {
  const symbols = modelSymbols(modelo)
  const winnerKey = [...ID_ORDER].sort((a, b) => clamp(scores[b] ?? 0) - clamp(scores[a] ?? 0))[0] as TalentKey
  const winnerData = NEUROCOGNITIVE_DATA[winnerKey]
  const winnerRole = winnerData?.rol ?? 'No indicado'
  const bullets = (winnerData?.perfilPuntos ?? []).slice(0, 4)
  const batteryGroups = EJES.map((eje) => ({
    label: eje.label,
    rows: eje.keys.map((key) => ({
      key: key as TalentKey,
      symbol: symbols[key],
      value: clamp(scores[key] ?? 0),
      label: TALENT_NAMES[key],
    })),
  }))

  return (
    <Page size="A4" orientation="landscape" style={styles.page} wrap={false}>
      <View style={styles.coverHeader}>
        <View>
          <Text style={styles.eyebrow}>Centro Educativo San Cristóbal-Castellón</Text>
          <Text style={styles.coverTitle}>{modelo === 'genotipo' ? 'Informe de talentos' : 'Informe de neurotalentos'}</Text>
          <Text style={styles.coverName}>{nombre} · {fecha}</Text>
        </View>
        <Text style={styles.chip}>Basado en neurociencia aplicada</Text>
      </View>

      <View style={styles.coverBody}>
        <View style={styles.coverLeft}>
          <View style={[styles.card, styles.mapCard]}>
            <Text style={styles.coverSectionTitle}>Mapa principal</Text>
            <View style={styles.mapWrap}>
              <WheelGraphic modelo={modelo} scores={scores} />
            </View>
            <View style={styles.summaryBanner}>
              <Text style={styles.summaryText}>{textoResumen?.trim() || 'Síntesis general del perfil y de las baterías dominantes identificadas en la evaluación.'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.coverRight}>
          <View style={[styles.card, styles.sideCard]}>
            <Text style={styles.coverSectionTitle}>Perfil profesional</Text>
            <Text style={styles.profileName}>{TALENT_NAMES[winnerKey]}</Text>
            <Text style={styles.profileRole}>{winnerRole}</Text>
            {bullets.map((item, idx) => (
              <View style={styles.bulletRow} key={idx}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>{item}</Text>
              </View>
            ))}
          </View>

          <View style={[styles.card, styles.batteryCard]}>
            <Text style={styles.coverSectionTitle}>Baterías destacadas</Text>
            {batteryGroups.map((group, groupIndex) => (
              <View style={styles.axisBlock} key={groupIndex}>
                <Text style={styles.axisTitle}>{group.label}</Text>
                {group.rows.map((row) => (
                  <View style={styles.batteryRow} key={row.key}>
                    <Text style={styles.batterySymbol}>{row.symbol}</Text>
                    <Text style={styles.batteryValue}>{String(row.value)}</Text>
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
  )
}

function TalentDetailPage({ talentKey, score, modelo, pageIndex, totalPages }: { talentKey: TalentKey; score: number; modelo: 'genotipo' | 'neurotalento'; pageIndex: number; totalPages: number }) {
  const color = TALENT_COLORS[talentKey]
  const data = NEUROCOGNITIVE_DATA[talentKey]
  const symbol = modelSymbols(modelo)[talentKey]
  const value = clamp(score)

  return (
    <Page size="A4" orientation="landscape" style={styles.page} wrap={false}>
      <View style={[styles.card, { flex: 1, padding: 22 }]}> 
        <View style={styles.detailHeader}>
          <View style={styles.detailHeaderLeft}>
            <View style={[styles.detailSymbolBox, { backgroundColor: hex2rgba(color, 0.12) }]}>
              <Text style={[styles.detailSymbol, { color }]}>{symbol}</Text>
            </View>
            <View style={styles.detailTitleWrap}>
              <Text style={[styles.eyebrow, { color }]}>{modelo === 'genotipo' ? 'Mapa de talentos' : 'Mapa de neurotalentos'}</Text>
              <Text style={styles.detailTitle}>{TALENT_NAMES[talentKey]}</Text>
              <Text style={styles.detailAxis}>{data.eje}</Text>
            </View>
          </View>
          <View style={styles.scoreCard}>
            <Text style={styles.scoreLabel}>Valor</Text>
            <Text style={[styles.scoreValue, { color }]}>{String(value)}</Text>
          </View>
        </View>

        <View style={styles.infoStrip}>
          <BatteryBar value={value} />
        </View>

        <View style={styles.twoCol}>
          <View style={styles.colMain}>
            <View style={styles.panel}>
              <Text style={styles.panelTitle}>Resumen neurocognitivo</Text>
              <Text style={styles.bodyText}>{data.resumen}</Text>
              <Text style={styles.bodyTextMuted}>{data.detalle}</Text>
            </View>

            <View style={[styles.panel, { marginBottom: 0 }]}> 
              <Text style={styles.panelTitle}>Ámbitos profesionales</Text>
              <View style={styles.tagWrap}>
                {data.ambitos.map((ambito, idx) => (
                  <View key={idx} style={[styles.tag, { backgroundColor: hex2rgba(color, 0.12) }]}>
                    <Text style={[styles.tagText, { color }]}>{ambito}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.colSide}>
            <View style={styles.panel}>
              <Text style={styles.panelTitle}>Claves del perfil</Text>
              {data.perfilPuntos.map((item, idx) => (
                <View style={styles.bulletRow} key={idx}>
                  <Text style={[styles.bulletDot, { color } ]}>•</Text>
                  <Text style={styles.bulletText}>{item}</Text>
                </View>
              ))}
            </View>

            <View style={[styles.panel, { marginBottom: 0 }]}> 
              <Text style={styles.panelTitle}>Rol sugerido</Text>
              <Text style={[styles.bodyText, { color, fontWeight: 700 }]}>{data.rol}</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{nombreModelo(modelo)}</Text>
          <Text style={styles.footerText}>{pageIndex} / {totalPages}</Text>
        </View>
      </View>
    </Page>
  )
}

function SoftSkillsPage({ modelo, scores, pageIndex, totalPages }: { modelo: 'genotipo' | 'neurotalento'; scores: Record<string, number>; pageIndex: number; totalPages: number }) {
  const symbols = modelSymbols(modelo)
  const softMap = modelo === 'genotipo' ? SOFT_SKILLS_GENOTIPO : SOFT_SKILLS_NEUROTALENTO
  const rows = ID_ORDER
    .filter((key) => clamp(scores[key] ?? 0) > 67)
    .sort((a, b) => clamp(scores[b] ?? 0) - clamp(scores[a] ?? 0))
    .map((key) => ({
      key,
      color: TALENT_COLORS[key],
      symbol: symbols[key],
      title: TALENT_NAMES[key],
      skills: softMap[key] ?? [],
    }))
    .filter((row) => row.skills.length > 0)

  return (
    <Page size="A4" orientation="landscape" style={styles.page} wrap={false}>
      <View style={[styles.card, { flex: 1, padding: 24 }]}> 
        <Text style={styles.eyebrow}>Cierre del informe</Text>
        <Text style={styles.softTitle}>Soft skills destacadas</Text>
        <Text style={styles.softIntro}>Solo se muestran las baterías destacadas. Cada fila resume las competencias transversales asociadas a los bloques más fuertes del perfil.</Text>

        <View style={[styles.card, { borderRadius: 16, paddingHorizontal: 18, paddingVertical: 6, flex: 1 }]}> 
          {rows.length ? rows.map((row, idx) => (
            <View style={[styles.softRow, idx === rows.length - 1 ? { borderBottomWidth: 0 } : null]} key={row.key}>
              <View style={styles.softBatteryCol}>
                <View style={styles.softBatteryWrap}>
                  <View style={[styles.softSymbolBox, { backgroundColor: hex2rgba(row.color, 0.12) }]}>
                    <Text style={[styles.softSymbol, { color: row.color }]}>{row.symbol}</Text>
                  </View>
                  <Text style={styles.softBatteryText}>{row.title}</Text>
                </View>
              </View>
              <View style={styles.softSkillsCol}>
                <View style={styles.tagWrap}>
                  {row.skills.map((skill, skillIndex) => (
                    <View key={skillIndex} style={[styles.tag, { backgroundColor: hex2rgba(row.color, 0.08), borderWidth: 1, borderColor: hex2rgba(row.color, 0.22) }]}>
                      <Text style={[styles.tagText, { color: row.color }]}>{skill}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )) : (
            <Text style={styles.emptyText}>No hay baterías destacadas por encima del umbral configurado.</Text>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{nombreModelo(modelo)}</Text>
          <Text style={styles.footerText}>{pageIndex} / {totalPages}</Text>
        </View>
      </View>
    </Page>
  )
}

function nombreModelo(modelo: 'genotipo' | 'neurotalento') {
  return modelo === 'genotipo' ? 'Informe de talentos' : 'Informe de neurotalentos'
}

export function InformePDF({ modelo, nombre, scores, textoResumen, fecha }: InformePDFProps) {
  const ordered = [...ID_ORDER].sort((a, b) => clamp(scores[b] ?? 0) - clamp(scores[a] ?? 0))
  const fechaStr = fecha ?? new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
  const totalPages = 1 + ordered.length + 1

  return (
    <Document>
      <CoverPage modelo={modelo} nombre={nombre} scores={scores} textoResumen={textoResumen} fecha={fechaStr} />
      {ordered.map((key, index) => (
        <TalentDetailPage
          key={key}
          talentKey={key}
          score={scores[key] ?? 0}
          modelo={modelo}
          pageIndex={index + 2}
          totalPages={totalPages}
        />
      ))}
      <SoftSkillsPage modelo={modelo} scores={scores} pageIndex={totalPages} totalPages={totalPages} />
    </Document>
  )
}

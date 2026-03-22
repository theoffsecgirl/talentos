import React from 'react'
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import { EJES, NEUROCOGNITIVE_DATA, SYMBOLS_GENOTIPO, SYMBOLS_NEUROTALENTO, TALENT_NAMES } from '../../lib/pdf-data'
import { WheelGraphic } from './InformePDF'

const BG = '#F3F4F6'
const CARD = '#FFFFFF'
const BORDER = '#D9DEE7'
const TEXT = '#0F172A'
const MUTED = '#64748B'
const BAR_BG = '#D1D5DB'
const BAR_RED = '#DC2626'
const BAR_DARK = '#111111'

type TalentKey = 'gestion' | 'estrategia' | 'imaginacion' | 'profundo' | 'aplicado' | 'empatico' | 'analitico' | 'acompanamiento'

const styles = StyleSheet.create({
  page: {
    backgroundColor: BG,
    paddingTop: 28,
    paddingBottom: 28,
    paddingHorizontal: 28,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  titleWrap: {
    flexDirection: 'column',
  },
  title: {
    fontSize: 24,
    fontWeight: 800,
    color: TEXT,
    marginBottom: 4,
  },
  name: {
    fontSize: 11,
    color: MUTED,
  },
  chip: {
    fontSize: 9,
    color: MUTED,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 999,
    backgroundColor: CARD,
  },
  body: {
    flexDirection: 'row',
  },
  left: {
    width: '54%',
    paddingRight: 8,
  },
  right: {
    width: '46%',
    paddingLeft: 8,
  },
  card: {
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 22,
    padding: 18,
  },
  sectionTitle: {
    fontSize: 10,
    color: MUTED,
    fontWeight: 800,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  mapWrap: {
    minHeight: 330,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryBanner: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: '#0F172A',
  },
  summaryText: {
    color: '#FFFFFF',
    fontSize: 9,
    textAlign: 'center',
  },
  profileName: {
    fontSize: 20,
    lineHeight: 1.15,
    fontWeight: 800,
    color: TEXT,
    marginBottom: 6,
  },
  profileRole: {
    fontSize: 10,
    color: MUTED,
    marginBottom: 12,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  bulletDot: {
    width: 10,
    fontSize: 10,
    color: '#CC0000',
    fontWeight: 700,
  },
  bulletText: {
    flex: 1,
    fontSize: 9.6,
    lineHeight: 1.45,
    color: '#334155',
  },
  axisBlock: {
    marginBottom: 10,
  },
  axisTitle: {
    fontSize: 9,
    color: '#475569',
    fontWeight: 800,
    letterSpacing: 1,
    textTransform: 'uppercase',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 5,
    marginBottom: 7,
  },
  batteryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  batterySymbol: {
    width: 18,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 700,
    color: '#111827',
    marginTop: 1,
  },
  batteryName: {
    width: 150,
    fontSize: 9.5,
    lineHeight: 1.25,
    color: '#1F2937',
    fontWeight: 600,
    marginRight: 8,
  },
  batteryBarWrap: {
    flex: 1,
  },
  ticks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  tick: {
    fontSize: 6.8,
    color: MUTED,
  },
  barBg: {
    width: '100%',
    height: 6,
    backgroundColor: BAR_BG,
    borderRadius: 999,
  },
})

function clamp(n: number) {
  return Math.max(0, Math.min(100, Math.round(n || 0)))
}

function modelSymbols(modelo: 'genotipo' | 'neurotalento') {
  return modelo === 'genotipo' ? SYMBOLS_GENOTIPO : SYMBOLS_NEUROTALENTO
}

function BatteryBar({ value }: { value: number }) {
  const safe = clamp(value)
  const fillColor = safe > 67 ? BAR_RED : BAR_DARK
  return (
    <View style={styles.batteryBarWrap}>
      <View style={styles.ticks}>
        <Text style={styles.tick}>0</Text>
        <Text style={styles.tick}>60</Text>
        <Text style={styles.tick}>100</Text>
      </View>
      <View style={styles.barBg}>
        <View style={{ width: `${safe}%`, height: 6, backgroundColor: fillColor, borderRadius: 999 }} />
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
  const symbols = modelSymbols(modelo)
  const title = modelo === 'genotipo' ? 'Informe de talentos' : 'Informe de neurotalentos'
  const winnerKey = (Object.entries(scores)
    .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))[0]?.[0] ?? 'gestion') as TalentKey
  const winnerData = NEUROCOGNITIVE_DATA[winnerKey]
  const winnerRole = rolEscogido || rolPensado || winnerData?.rol || 'No indicado'
  const bullets = (winnerData?.perfilPuntos ?? []).slice(0, 4)
  const summary = textoResumen?.trim() || 'Síntesis general del perfil y de las baterías dominantes identificadas en la evaluación.'

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page} wrap={false}>
        <View style={styles.header}>
          <View style={styles.titleWrap}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.name}>{nombre}</Text>
          </View>
          <Text style={styles.chip}>Basado en neurociencia aplicada</Text>
        </View>

        <View style={styles.body}>
          <View style={styles.left}>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Mapa principal</Text>
              <View style={styles.mapWrap}>
                <WheelGraphic modelo={modelo} scores={scores} />
              </View>
              <View style={styles.summaryBanner}>
                <Text style={styles.summaryText}>{summary}</Text>
              </View>
            </View>
          </View>

          <View style={styles.right}>
            <View style={[styles.card, { marginBottom: 12 }] }>
              <Text style={styles.sectionTitle}>Perfil profesional</Text>
              <Text style={styles.profileName}>{TALENT_NAMES[winnerKey]}</Text>
              <Text style={styles.profileRole}>{winnerRole}</Text>
              {bullets.map((item, idx) => (
                <View style={styles.bulletRow} key={idx}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>{item}</Text>
                </View>
              ))}
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Baterías destacadas</Text>
              {EJES.map((group, groupIndex) => (
                <View style={styles.axisBlock} key={groupIndex}>
                  <Text style={styles.axisTitle}>{group.label}</Text>
                  {group.keys.map((key) => {
                    const talentKey = key as TalentKey
                    const value = clamp(scores[talentKey] ?? 0)
                    return (
                      <View style={styles.batteryRow} key={talentKey}>
                        <Text style={styles.batterySymbol}>{symbols[talentKey]}</Text>
                        <Text style={styles.batteryName}>{value} · {TALENT_NAMES[talentKey]}</Text>
                        <BatteryBar value={value} />
                      </View>
                    )
                  })}
                </View>
              ))}
            </View>
          </View>
        </View>
      </Page>
    </Document>
  )
}

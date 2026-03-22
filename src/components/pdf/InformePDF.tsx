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


const RANK_PRIORITY = ['estrategia', 'analitico', 'acompanamiento', 'gestion', 'empatico', 'imaginacion', 'profundo', 'aplicado'] as const
const RANK_INDEX = RANK_PRIORITY.reduce((acc, key, index) => {
  acc[key as TalentKey] = index
  return acc
}, {} as Record<TalentKey, number>)

const SYMBOL_VECTOR_DATA: Record<'genotipo' | 'neurotalento', Record<TalentKey, { d: string; fill?: boolean }>> = {
  genotipo: {
    gestion: { d: 'M4 4H20V20H4Z' },
    estrategia: { d: 'M12 4L20 20H4Z' },
    imaginacion: { d: 'M12 4C15.866 4 19 7.582 19 12C19 16.418 15.866 20 12 20C8.134 20 5 16.418 5 12C5 7.582 8.134 4 12 4Z' },
    profundo: { d: 'M12 4L20 12L12 20L4 12Z' },
    aplicado: { d: 'M4 7H20V17H4Z' },
    empatico: { d: 'M12 4C16.418 4 20 7.582 20 12C20 16.418 16.418 20 12 20C7.582 20 4 16.418 4 12C4 7.582 7.582 4 12 4Z' },
    analitico: { d: 'M12 3.5L19.5 9L16.7 19H7.3L4.5 9Z' },
    acompanamiento: { d: 'M13.26382306477093 20.104265402843602Q12.774091627172195 19.53554502369668 11.999999999999998 18.208530805687204Q10.941548183254344 20.104265402843602 10.00947867298578 20.94154818325434Q8.84044233807267 21.95260663507109 7.023696682464454 21.95260663507109Q4.890995260663507 21.95260663507109 3.484992101105845 20.357030015797786Q2.0 18.6824644549763 2.0 15.917851500789888Q2.0 13.26382306477093 3.484992101105845 11.462875197472354Q4.812006319115325 9.867298578199051 7.055292259083728 9.867298578199051Q8.208530805687204 9.867298578199051 9.061611374407581 10.34123222748815Q10.05687203791469 10.86255924170616 10.736176935229066 11.76303317535545Q11.368088467614532 12.568720379146917 11.999999999999998 13.658767772511847Q13.058451816745654 11.76303317535545 13.990521327014218 10.925750394944707Q15.15955766192733 9.914691943127961 16.976303317535542 9.914691943127961Q19.10900473933649 9.914691943127961 20.515007898894154 11.510268562401263Q22.0 13.184834123222748 22.0 15.949447077409161Q22.0 18.60347551342812 20.515007898894154 20.404423380726698Q19.187993680884674 22.0 16.94470774091627 22.0Q15.791469194312796 22.0 14.938388625592417 21.5260663507109Q14.085308056872037 21.09952606635071 13.26382306477093 20.104265402843602ZM6.84992101105845 19.88309636650869Q9.456556082148499 19.88309636650869 11.020537124802527 16.091627172195892Q9.014218009478672 11.952606635071088 6.84992101105845 11.952606635071088Q5.270142180094787 11.952606635071088 4.464454976303317 13.090047393364928Q3.595576619273302 14.306477093206949 3.595576619273302 15.917851500789888Q3.595576619273302 17.687203791469194 4.464454976303317 18.77725118483412Q5.349131121642969 19.88309636650869 6.84992101105845 19.88309636650869ZM17.150078988941548 11.984202211690363Q14.796208530805686 11.984202211690363 12.979462875197472 15.775671406003157Q14.969984202211688 19.91469194312796 17.150078988941548 19.91469194312796Q18.729857819905213 19.91469194312796 19.53554502369668 18.77725118483412Q20.404423380726698 17.560821484992097 20.404423380726698 15.949447077409161Q20.404423380726698 14.180094786729857 19.53554502369668 13.090047393364928Q18.650868878357027 11.984202211690363 17.150078988941548 11.984202211690363Z', fill: true },
  },
  neurotalento: {
    gestion: { d: 'M11.162759544541192 4.6657736101808425 7.49229738780978 14.61888814467515H14.846617548559946ZM9.635632953784327 2.0H12.703281982585398L20.325519089082384 22.0H17.51239115874079L15.690555927662425 16.869390488948426H6.675150703281982L4.853315472203617 22.0H2.0Z', fill: true },
    estrategia: { d: 'M11.162759544541192 4.6657736101808425 5.670462156731413 19.749497655726724H16.66845277963831ZM2.0 22.0 9.635632953784327 2.0H12.703281982585398L20.325519089082384 22.0Z', fill: true },
    imaginacion: { d: 'M9.916945746818486 6.380442062960482Q7.907568653717347 6.6617548559946425 6.594775619557937 7.827193569993302Q4.853315472203617 9.367716008037508 4.853315472203617 12.02009377093101Q4.853315472203617 14.659075686537173 6.594775619557937 16.199598124581378Q7.907568653717347 17.36503683858004 9.916945746818486 17.6463496316142ZM12.622906898861352 17.6463496316142Q14.632283991962492 17.36503683858004 15.945077026121902 16.199598124581378Q17.65974547890154 14.659075686537173 17.65974547890154 12.02009377093101Q17.65974547890154 9.367716008037508 15.945077026121902 7.827193569993302Q14.632283991962492 6.6617548559946425 12.622906898861352 6.380442062960482ZM9.916945746818486 19.883456128600134Q6.648359008707301 19.588747488278635 4.531815137307435 17.79370395177495Q2.0 15.650368385800402 2.0 12.02009377093101Q2.0 8.389819156061622 4.531815137307435 6.233087742799732Q6.63496316141996 4.424648359008707 9.916945746818486 4.129939718687208V2.0H12.622906898861352V4.129939718687208Q15.891493636972537 4.438044206296048 17.994641661085062 6.233087742799732Q20.513060951105157 8.389819156061622 20.513060951105157 12.02009377093101Q20.513060951105157 15.63697253851306 17.994641661085062 17.79370395177495Q15.891493636972537 19.588747488278635 12.622906898861352 19.896851975887476V22.0H9.916945746818486Z', fill: true },
    profundo: { d: 'M6.364105874757909 10.263395739186572H15.479664299548094V12.458360232408006H6.364105874757909ZM10.934796642995481 4.117495158166559Q8.094254357650097 4.117495158166559 6.428663653970304 6.2349903163331195Q4.75016139444803 8.352485474499678 4.75016139444803 12.006455777921241Q4.75016139444803 15.647514525500323 6.422207876049064 17.765009683666882Q8.094254357650097 19.88250484183344 10.934796642995481 19.88250484183344Q13.775338928340865 19.88250484183344 15.440929632020659 17.765009683666882Q17.093608779857973 15.647514525500323 17.093608779857973 12.006455777921241Q17.093608779857973 8.352485474499678 15.440929632020659 6.2349903163331195Q13.775338928340865 4.117495158166559 10.934796642995481 4.117495158166559ZM10.934796642995481 2.0Q14.989025177533893 2.0 17.41639767591995 4.7178825048418345Q19.843770174306005 7.435765009683669 19.843770174306005 12.006455777921241Q19.843770174306005 16.564234990316336 17.41639767591995 19.27566171723693Q14.989025177533893 22.0 10.934796642995481 22.0Q6.867656552614591 22.0 4.440284054228535 19.288573273079407Q2.0 16.577146546158815 2.0 12.006455777921241Q2.0 7.435765009683669 4.440284054228535 4.711426726920596Q6.867656552614591 2.0 10.934796642995481 2.0Z', fill: true },
    aplicado: { d: 'M2.0 2.0H6.032150033489618L11.13596784996651 15.61018084393838L16.266577361018083 2.0H20.298727394507704V22.0H17.65974547890154V4.438044206296048L12.502344273275284 18.155391828533155H9.782987273945077L4.625586068318821 4.438044206296048V22.0H2.0Z', fill: true },
    empatico: { d: 'M20.64990072799471 19.643944407677036V22.0H12.70814030443415V19.643944407677036Q15.050959629384515 18.360026472534745 16.361350099272006 16.16280608868299Q17.6717405691595 13.965585704831238 17.6717405691595 11.29185969556585Q17.6717405691595 8.115155526141628 15.924553275976177 6.195896757114493Q14.177365982792853 4.276637988087359 11.318332230311054 4.276637988087359Q8.459298477829252 4.276637988087359 6.705493050959629 6.202514890800794Q4.951687624090006 8.12839179351423 4.951687624090006 11.29185969556585Q4.951687624090006 13.965585704831238 6.2620780939774985 16.16280608868299Q7.585704831237591 18.360026472534745 9.941760423560556 19.643944407677036V22.0H2.0V19.643944407677036H6.222369291859696Q4.131039046988749 17.804103242885507 3.1647915287888813 15.831899404367968Q2.2117802779616147 13.85969556585043 2.2117802779616147 11.42422236929186Q2.2117802779616147 7.215089344804765 4.753143613500993 4.607544672402383Q7.2812706816677695 2.0 11.318332230311054 2.0Q15.328921244209134 2.0 17.883520847121112 4.607544672402383Q20.42488418266049 7.201853077432164 20.42488418266049 11.29185969556585Q20.42488418266049 13.85969556585043 19.485109199205827 15.818663136995367Q18.545334215751158 17.777630708140304 16.414295168762408 19.643944407677036Z', fill: true },
    analitico: { d: 'M17.24447421299397 2.0V22.0H14.538513060951106V4.2772940388479554H4.705961152042867V22.0H2.0V2.0Z', fill: true },
    acompanamiento: { d: 'M9.916945746818486 22.0Q9.930341594105826 20.204956463496316 9.916945746818486 17.847287340924314Q7.050234427327529 17.847287340924314 4.531815137307435 15.03415941058272Q2.066979236436705 12.301406563965172 2.0 7.478901540522438V2.0H4.853315472203617V7.478901540522438Q4.853315472203617 11.256530475552578 6.594775619557937 13.453449430676491Q8.06831882116544 15.32886805090422 9.916945746818486 15.516409912926992V2.0H12.622906898861352V15.516409912926992Q14.4715338245144 15.32886805090422 15.945077026121902 13.453449430676491Q17.68653717347622 11.256530475552578 17.68653717347622 7.478901540522438V2.0H20.53985264567984V7.478901540522438Q20.472873409243135 12.301406563965172 18.008037508372404 15.03415941058272Q15.48961821835231 17.847287340924314 12.622906898861352 17.847287340924314Q12.609511051574012 18.81178834561286 12.622906898861352 22.0Z', fill: true },
  },
}

function sortTalentKeysByScore(scores: Record<string, number>): TalentKey[] {
  return [...ID_ORDER].sort((a, b) => {
    const diff = clamp(scores[b] ?? 0) - clamp(scores[a] ?? 0)
    if (diff !== 0) return diff
    return RANK_INDEX[a] - RANK_INDEX[b]
  }) as TalentKey[]
}

function symbolStrokeWidth(size: number) {
  return size >= 28 ? 1.8 : size >= 18 ? 1.6 : 1.45
}

function renderSymbolVector(talentKey: TalentKey, modelo: 'genotipo' | 'neurotalento', color: string, size: number) {
  const vector = SYMBOL_VECTOR_DATA[modelo][talentKey]
  if (!vector) return null
  if (vector.fill) {
    return <Path d={vector.d} fill={color} />
  }
  return <Path d={vector.d} fill="none" stroke={color} strokeWidth={symbolStrokeWidth(size)} strokeLinecap="round" strokeLinejoin="round" />
}

function InlineSymbol({ talentKey, modelo, color, size }: { talentKey: TalentKey; modelo: 'genotipo' | 'neurotalento'; color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {renderSymbolVector(talentKey, modelo, color, size)}
    </Svg>
  )
}

function transformPathData(d: string, offsetX: number, offsetY: number, size: number) {
  const tokens = d.match(/[A-Za-z]|-?\d*\.?\d+/g) ?? []
  const scale = size / 24
  const out: string[] = []
  let i = 0
  let cmd = ''
  const isLetter = (value: string) => /^[A-Za-z]$/.test(value)
  const fx = (value: string) => Number((offsetX + Number(value) * scale).toFixed(3)).toString()
  const fy = (value: string) => Number((offsetY + Number(value) * scale).toFixed(3)).toString()

  while (i < tokens.length) {
    const token = tokens[i]
    if (isLetter(token)) {
      cmd = token
      i += 1
      if (cmd === 'Z') out.push('Z')
      continue
    }

    if (cmd === 'M') {
      let first = true
      while (i + 1 < tokens.length && !isLetter(tokens[i]) && !isLetter(tokens[i + 1])) {
        const x = fx(tokens[i])
        const y = fy(tokens[i + 1])
        out.push(`${first ? 'M' : 'L'}${x} ${y}`)
        first = false
        i += 2
      }
      continue
    }

    if (cmd === 'L') {
      while (i + 1 < tokens.length && !isLetter(tokens[i]) && !isLetter(tokens[i + 1])) {
        out.push(`L${fx(tokens[i])} ${fy(tokens[i + 1])}`)
        i += 2
      }
      continue
    }

    if (cmd === 'H') {
      while (i < tokens.length && !isLetter(tokens[i])) {
        out.push(`H${fx(tokens[i])}`)
        i += 1
      }
      continue
    }

    if (cmd === 'V') {
      while (i < tokens.length && !isLetter(tokens[i])) {
        out.push(`V${fy(tokens[i])}`)
        i += 1
      }
      continue
    }

    if (cmd === 'Q') {
      while (i + 3 < tokens.length && !isLetter(tokens[i]) && !isLetter(tokens[i + 1]) && !isLetter(tokens[i + 2]) && !isLetter(tokens[i + 3])) {
        out.push(`Q${fx(tokens[i])} ${fy(tokens[i + 1])} ${fx(tokens[i + 2])} ${fy(tokens[i + 3])}`)
        i += 4
      }
      continue
    }

    if (cmd === 'C') {
      while (i + 5 < tokens.length && !isLetter(tokens[i]) && !isLetter(tokens[i + 1]) && !isLetter(tokens[i + 2]) && !isLetter(tokens[i + 3]) && !isLetter(tokens[i + 4]) && !isLetter(tokens[i + 5])) {
        out.push(`C${fx(tokens[i])} ${fy(tokens[i + 1])} ${fx(tokens[i + 2])} ${fy(tokens[i + 3])} ${fx(tokens[i + 4])} ${fy(tokens[i + 5])}`)
        i += 6
      }
      continue
    }

    i += 1
  }

  return out.join(' ')
}

function PositionedSymbol({ talentKey, modelo, color, size, x, y }: { talentKey: TalentKey; modelo: 'genotipo' | 'neurotalento'; color: string; size: number; x: number; y: number }) {
  const vector = SYMBOL_VECTOR_DATA[modelo][talentKey]
  if (!vector) return null
  const d = transformPathData(vector.d, x - size / 2, y - size / 2, size)
  if (vector.fill) {
    return <Path d={d} fill={color} />
  }
  return <Path d={d} fill="none" stroke={color} strokeWidth={symbolStrokeWidth(size)} strokeLinecap="round" strokeLinejoin="round" />
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

export function WheelGraphic({ modelo, scores }: { modelo: 'genotipo' | 'neurotalento'; scores: Record<string, number> }) {
  const baseSize = 640
  const size = 360
  const scale = size / baseSize
  const center = size / 2
  const radius = 206 * scale
  const innerRadius = 72 * scale
  const step = (Math.PI * 2) / ID_ORDER.length
  const rectPath = (x: number, y: number, w: number, h: number) => `M ${x} ${y} H ${x + w} V ${y + h} H ${x} Z`

  const sections = ID_ORDER.map((key, index) => {
    const color = TALENT_COLORS[key]
    const value = clamp(scores[key] ?? 0)
    const fillRadius = innerRadius + (radius - innerRadius) * (value / 100)
    const startAngle = index * step - Math.PI / 2
    const endAngle = startAngle + step
    const mid = (startAngle + endAngle) / 2
    const pctPos = polarToCartesian(center, center, mid, (fillRadius + innerRadius) / 2)
    const labelPos = polarToCartesian(center, center, mid, radius + 26 * scale)
    const [line1, line2] = splitLabel(TALENT_NAMES[key])

    const fillSteps = [1, 0.84, 0.68, 0.52].map((factor, fillIndex) => ({
      key: `${key}-${fillIndex}`,
      opacity: [0.18, 0.28, 0.4, 0.54][fillIndex],
      d: createArcPath(
        center,
        center,
        startAngle,
        endAngle,
        innerRadius + (fillRadius - innerRadius) * factor,
        innerRadius,
      ),
    }))

    return {
      key,
      color,
      value,
      pctPos,
      labelPos,
      line1,
      line2,
      outlinePath: createArcPath(center, center, startAngle, endAngle, radius, innerRadius),
      fillSteps,
    }
  })

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Line x1={center} y1={center - radius} x2={center} y2={center + radius} stroke="#000000" strokeWidth={1.15} />
      <Line x1={center - radius} y1={center} x2={center + radius} y2={center} stroke="#000000" strokeWidth={1.15} />
      {[1, 3, 5, 7].map((idx) => {
        const angle = idx * step - Math.PI / 2
        const outer = polarToCartesian(center, center, angle, radius)
        return <Line key={idx} x1={center} y1={center} x2={outer.x} y2={outer.y} stroke="#6B7280" strokeWidth={0.7} />
      })}
      {sections.map((s) => (
        <React.Fragment key={s.key}>
          <Path d={s.outlinePath} fill="none" stroke={hex2rgba(s.color, 0.3)} strokeWidth={1.15} />
          {s.fillSteps.map((layer) => (
            <Path key={layer.key} d={layer.d} fill={hex2rgba(s.color, layer.opacity)} />
          ))}
          {s.value > 15 ? (
            <SvgText x={s.pctPos.x} y={s.pctPos.y + 3} textAnchor="middle" style={{ fontSize: 9, fontWeight: 800, fill: "#FFFFFF" }}>
              {String(s.value)}
            </SvgText>
          ) : null}
        </React.Fragment>
      ))}

      <Path d={rectPath(center - 70 * scale, 8 * scale, 140 * scale, 24 * scale)} fill="#FFFFFF" />
      <Path d={rectPath(0, center - 12 * scale, 112 * scale, 24 * scale)} fill="#FFFFFF" />
      <Path d={rectPath(size - 112 * scale, center - 12 * scale, 112 * scale, 24 * scale)} fill="#FFFFFF" />
      <Path d={rectPath(center - 84 * scale, size - 34 * scale, 168 * scale, 26 * scale)} fill="#FFFFFF" />

      {sections.map((s) => (
        <React.Fragment key={`${s.key}-label`}>
          <PositionedSymbol talentKey={s.key} modelo={modelo} color={s.color} size={8} x={s.labelPos.x} y={s.labelPos.y - 8 * scale} />
          <SvgText x={s.labelPos.x} y={s.labelPos.y + 2 * scale} textAnchor="middle" style={{ fontSize: 5.6, fontWeight: 700, fill: "#111111" }}>
            {s.line1}
          </SvgText>
          {s.line2 ? (
            <SvgText x={s.labelPos.x} y={s.labelPos.y + 14 * scale} textAnchor="middle" style={{ fontSize: 5.6, fontWeight: 700, fill: "#111111" }}>
              {s.line2}
            </SvgText>
          ) : null}
        </React.Fragment>
      ))}

      <Circle cx={center} cy={center} r={innerRadius} fill="#FFFFFF" stroke="#000000" strokeWidth={1.15} />
      <SvgText x={center} y={center + 1} textAnchor="middle" style={{ fontSize: modelo === 'genotipo' ? 9 : 7.5, fontWeight: 700, fill: "#666666" }}>
        {modelo === 'genotipo' ? 'Talentos' : 'Neurotalento'}
      </SvgText>
    </Svg>
  )
}

function CoverPage({ nombre, modelo, scores, textoResumen, fecha }: InformePDFProps & { fecha: string }) {
  const symbols = modelSymbols(modelo)
  const winnerKey = sortTalentKeysByScore(scores)[0] as TalentKey
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
                    <View style={{ width: 18, alignItems: 'center', marginTop: 1 }}><InlineSymbol talentKey={row.key} modelo={modelo} color={DARK} size={13} /></View>
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
              <InlineSymbol talentKey={talentKey} modelo={modelo} color={color} size={34} />
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
            <View style={[styles.softRow, idx === rows.length - 1 ? { borderBottomWidth: 0 } : {}]} key={row.key}>
              <View style={styles.softBatteryCol}>
                <View style={styles.softBatteryWrap}>
                  <View style={[styles.softSymbolBox, { backgroundColor: hex2rgba(row.color, 0.12) }]}>
                    <InlineSymbol talentKey={row.key} modelo={modelo} color={row.color} size={15} />
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
  const ordered = sortTalentKeysByScore(scores)
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

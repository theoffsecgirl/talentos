"use client";

import { useMemo } from "react";
import { TALENTS } from "@/lib/talents";

type Props = {
  scores: Array<{
    talentId: number;
    score: number;
    max: number;
  }>;
  printMode?: boolean;
  showFullLabels?: boolean;
  modelType?: "genotipo" | "neurotalento";
  centerText?: string;
  summaryText?: string;
  minimal?: boolean;
};

type TalentKey = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

type VectorDef = { d: string; fill?: boolean };

type TalentConfig = {
  symbol: string;
  color: string;
  secondaryColor: string;
  axis: string;
};

const TALENT_CONFIG: Record<number, TalentConfig> = {
  4: { symbol: "□", color: "#DC2626", secondaryColor: "#EF4444", axis: "Acción y resultados" },
  1: { symbol: "△", color: "#EF4444", secondaryColor: "#F87171", axis: "Acción y resultados" },
  6: { symbol: "⬭", color: "#06B6D4", secondaryColor: "#22D3EE", axis: "Imaginación y arte" },
  7: { symbol: "◇", color: "#10B981", secondaryColor: "#34D399", axis: "Imaginación y arte" },
  8: { symbol: "▭", color: "#D97706", secondaryColor: "#F59E0B", axis: "Destreza y proyección" },
  5: { symbol: "○", color: "#F59E0B", secondaryColor: "#FBBF24", axis: "Destreza y proyección" },
  2: { symbol: "⬠", color: "#8B5CF6", secondaryColor: "#A78BFA", axis: "Saber y conocimiento" },
  3: { symbol: "∞", color: "#7C3AED", secondaryColor: "#8B5CF6", axis: "Saber y conocimiento" },
};

const TALENT_ORDER: TalentKey[] = [4, 1, 6, 7, 8, 5, 2, 3];

const SYMBOL_VECTOR_DATA: Record<"genotipo" | "neurotalento", Record<TalentKey, VectorDef>> = {
  genotipo: {
    4: { d: "M4 4H20V20H4Z" },
    1: { d: "M12 4L20 20H4Z" },
    6: { d: "M12 4C15.866 4 19 7.582 19 12C19 16.418 15.866 20 12 20C8.134 20 5 16.418 5 12C5 7.582 8.134 4 12 4Z" },
    7: { d: "M12 4L20 12L12 20L4 12Z" },
    8: { d: "M4 7H20V17H4Z" },
    5: { d: "M12 4C16.418 4 20 7.582 20 12C20 16.418 16.418 20 12 20C7.582 20 4 16.418 4 12C4 7.582 7.582 4 12 4Z" },
    2: { d: "M12 3.5L19.5 9L16.7 19H7.3L4.5 9Z" },
    3: {
      d: "M13.26382306477093 20.104265402843602Q12.774091627172195 19.53554502369668 11.999999999999998 18.208530805687204Q10.941548183254344 20.104265402843602 10.00947867298578 20.94154818325434Q8.84044233807267 21.95260663507109 7.023696682464454 21.95260663507109Q4.890995260663507 21.95260663507109 3.484992101105845 20.357030015797786Q2.0 18.6824644549763 2.0 15.917851500789888Q2.0 13.26382306477093 3.484992101105845 11.462875197472354Q4.812006319115325 9.867298578199051 7.055292259083728 9.867298578199051Q8.208530805687204 9.867298578199051 9.061611374407581 10.34123222748815Q10.05687203791469 10.86255924170616 10.736176935229066 11.76303317535545Q11.368088467614532 12.568720379146917 11.999999999999998 13.658767772511847Q13.058451816745654 11.76303317535545 13.990521327014218 10.925750394944707Q15.15955766192733 9.914691943127961 16.976303317535542 9.914691943127961Q19.10900473933649 9.914691943127961 20.515007898894154 11.510268562401263Q22.0 13.184834123222748 22.0 15.949447077409161Q22.0 18.60347551342812 20.515007898894154 20.404423380726698Q19.187993680884674 22.0 16.94470774091627 22.0Q15.791469194312796 22.0 14.938388625592417 21.5260663507109Q14.085308056872037 21.09952606635071 13.26382306477093 20.104265402843602ZM6.84992101105845 19.88309636650869Q9.456556082148499 19.88309636650869 11.020537124802527 16.091627172195892Q9.014218009478672 11.952606635071088 6.84992101105845 11.952606635071088Q5.270142180094787 11.952606635071088 4.464454976303317 13.090047393364928Q3.595576619273302 14.306477093206949 3.595576619273302 15.917851500789888Q3.595576619273302 17.687203791469194 4.464454976303317 18.77725118483412Q5.349131121642969 19.88309636650869 6.84992101105845 19.88309636650869ZM17.150078988941548 11.984202211690363Q14.796208530805686 11.984202211690363 12.979462875197472 15.775671406003157Q14.969984202211688 19.91469194312796 17.150078988941548 19.91469194312796Q18.729857819905213 19.91469194312796 19.53554502369668 18.77725118483412Q20.404423380726698 17.560821484992097 20.404423380726698 15.949447077409161Q20.404423380726698 14.180094786729857 19.53554502369668 13.090047393364928Q18.650868878357027 11.984202211690363 17.150078988941548 11.984202211690363Z",
      fill: true,
    },
  },
  neurotalento: {
    4: { d: "M11.162759544541192 4.6657736101808425 7.49229738780978 14.61888814467515H14.846617548559946ZM9.635632953784327 2.0H12.703281982585398L20.325519089082384 22.0H17.51239115874079L15.690555927662425 16.869390488948426H6.675150703281982L4.853315472203617 22.0H2.0Z", fill: true },
    1: { d: "M11.162759544541192 4.6657736101808425 5.670462156731413 19.749497655726724H16.66845277963831ZM2.0 22.0 9.635632953784327 2.0H12.703281982585398L20.325519089082384 22.0Z", fill: true },
    6: { d: "M9.916945746818486 6.380442062960482Q7.907568653717347 6.6617548559946425 6.594775619557937 7.827193569993302Q4.853315472203617 9.367716008037508 4.853315472203617 12.02009377093101Q4.853315472203617 14.659075686537173 6.594775619557937 16.199598124581378Q7.907568653717347 17.36503683858004 9.916945746818486 17.6463496316142ZM12.622906898861352 17.6463496316142Q14.632283991962492 17.36503683858004 15.945077026121902 16.199598124581378Q17.65974547890154 14.659075686537173 17.65974547890154 12.02009377093101Q17.65974547890154 9.367716008037508 15.945077026121902 7.827193569993302Q14.632283991962492 6.6617548559946425 12.622906898861352 6.380442062960482ZM9.916945746818486 19.883456128600134Q6.648359008707301 19.588747488278635 4.531815137307435 17.79370395177495Q2.0 15.650368385800402 2.0 12.02009377093101Q2.0 8.389819156061622 4.531815137307435 6.233087742799732Q6.63496316141996 4.424648359008707 9.916945746818486 4.129939718687208V2.0H12.622906898861352V4.129939718687208Q15.891493636972537 4.438044206296048 17.994641661085062 6.233087742799732Q20.513060951105157 8.389819156061622 20.513060951105157 12.02009377093101Q20.513060951105157 15.63697253851306 17.994641661085062 17.79370395177495Q15.891493636972537 19.588747488278635 12.622906898861352 19.896851975887476V22.0H9.916945746818486Z", fill: true },
    7: { d: "M6.364105874757909 10.263395739186572H15.479664299548094V12.458360232408006H6.364105874757909ZM10.934796642995481 4.117495158166559Q8.094254357650097 4.117495158166559 6.428663653970304 6.2349903163331195Q4.75016139444803 8.352485474499678 4.75016139444803 12.006455777921241Q4.75016139444803 15.647514525500323 6.422207876049064 17.765009683666882Q8.094254357650097 19.88250484183344 10.934796642995481 19.88250484183344Q13.775338928340865 19.88250484183344 15.440929632020659 17.765009683666882Q17.093608779857973 15.647514525500323 17.093608779857973 12.006455777921241Q17.093608779857973 8.352485474499678 15.440929632020659 6.2349903163331195Q13.775338928340865 4.117495158166559 10.934796642995481 4.117495158166559ZM10.934796642995481 2.0Q14.989025177533893 2.0 17.41639767591995 4.7178825048418345Q19.843770174306005 7.435765009683669 19.843770174306005 12.006455777921241Q19.843770174306005 16.564234990316336 17.41639767591995 19.27566171723693Q14.989025177533893 22.0 10.934796642995481 22.0Q6.867656552614591 22.0 4.440284054228535 19.288573273079407Q2.0 16.577146546158815 2.0 12.006455777921241Q2.0 7.435765009683669 4.440284054228535 4.711426726920596Q6.867656552614591 2.0 10.934796642995481 2.0Z", fill: true },
    8: { d: "M2.0 2.0H6.032150033489618L11.13596784996651 15.61018084393838L16.266577361018083 2.0H20.298727394507704V22.0H17.65974547890154V4.438044206296048L12.502344273275284 18.155391828533155H9.782987273945077L4.625586068318821 4.438044206296048V22.0H2.0Z", fill: true },
    5: { d: "M20.64990072799471 19.643944407677036V22.0H12.70814030443415V19.643944407677036Q15.050959629384515 18.360026472534745 16.361350099272006 16.16280608868299Q17.6717405691595 13.965585704831238 17.6717405691595 11.29185969556585Q17.6717405691595 8.115155526141628 15.924553275976177 6.195896757114493Q14.177365982792853 4.276637988087359 11.318332230311054 4.276637988087359Q8.459298477829252 4.276637988087359 6.705493050959629 6.202514890800794Q4.951687624090006 8.12839179351423 4.951687624090006 11.29185969556585Q4.951687624090006 13.965585704831238 6.2620780939774985 16.16280608868299Q7.585704831237591 18.360026472534745 9.941760423560556 19.643944407677036V22.0H2.0V19.643944407677036H6.222369291859696Q4.131039046988749 17.804103242885507 3.1647915287888813 15.831899404367968Q2.2117802779616147 13.85969556585043 2.2117802779616147 11.42422236929186Q2.2117802779616147 7.215089344804765 4.753143613500993 4.607544672402383Q7.2812706816677695 2.0 11.318332230311054 2.0Q15.328921244209134 2.0 17.883520847121112 4.607544672402383Q20.42488418266049 7.201853077432164 20.42488418266049 11.29185969556585Q20.42488418266049 13.85969556585043 19.485109199205827 15.818663136995367Q18.545334215751158 17.777630708140304 16.414295168762408 19.643944407677036Z", fill: true },
    2: { d: "M17.24447421299397 2.0V22.0H14.538513060951106V4.2772940388479554H4.705961152042867V22.0H2.0V2.0Z", fill: true },
    3: { d: "M9.916945746818486 22.0Q9.930341594105826 20.204956463496316 9.916945746818486 17.847287340924314Q7.050234427327529 17.847287340924314 4.531815137307435 15.03415941058272Q2.066979236436705 12.301406563965172 2.0 7.478901540522438V2.0H4.853315472203617V7.478901540522438Q4.853315472203617 11.256530475552578 6.594775619557937 13.453449430676491Q8.06831882116544 15.32886805090422 9.916945746818486 15.516409912926992V2.0H12.622906898861352V15.516409912926992Q14.4715338245144 15.32886805090422 15.945077026121902 13.453449430676491Q17.68653717347622 11.256530475552578 17.68653717347622 7.478901540522438V2.0H20.53985264567984V7.478901540522438Q20.472873409243135 12.301406563965172 18.008037508372404 15.03415941058272Q15.48961821835231 17.847287340924314 12.622906898861352 17.847287340924314Q12.609511051574012 18.81178834561286 12.622906898861352 22.0Z", fill: true },
  },
};

function toSafeNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  return fallback;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function pct(score: number, max: number) {
  return max > 0 ? clamp(Math.round((score / max) * 100), 0, 100) : 0;
}

function degToRad(d: number) {
  return (d * Math.PI) / 180;
}

function polar(cx: number, cy: number, r: number, aDeg: number) {
  const a = degToRad(aDeg);
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

function ringSectorPath(cx: number, cy: number, rOuter: number, rInner: number, a0: number, a1: number) {
  const p0 = polar(cx, cy, rOuter, a0);
  const p1 = polar(cx, cy, rOuter, a1);
  const p2 = polar(cx, cy, rInner, a1);
  const p3 = polar(cx, cy, rInner, a0);
  const large = Math.abs(a1 - a0) > 180 ? 1 : 0;
  return [
    `M ${p0.x.toFixed(2)} ${p0.y.toFixed(2)}`,
    `A ${rOuter} ${rOuter} 0 ${large} 1 ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`,
    `L ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`,
    `A ${rInner} ${rInner} 0 ${large} 0 ${p3.x.toFixed(2)} ${p3.y.toFixed(2)}`,
    "Z",
  ].join(" ");
}

function splitTalentTitle(title: string): [string, string] {
  if (title.includes(" y ")) {
    const parts = title.split(" y ");
    if (parts.length === 2) return [parts[0] + " y", parts[1]];
  }

  if (title.includes(" e ")) {
    const parts = title.split(" e ");
    if (parts.length === 2) return [parts[0] + " e", parts[1]];
  }

  const words = title.split(" ");
  if (words.length <= 2) return [title, ""];

  const midPoint = Math.ceil(words.length / 2);
  return [words.slice(0, midPoint).join(" "), words.slice(midPoint).join(" ")];
}

function calculateProfessionalProfile(talents: Array<{ id: number; percentage: number; axis: string }>) {
  const axisScores: Record<string, number[]> = {};

  talents.forEach((t) => {
    if (!axisScores[t.axis]) axisScores[t.axis] = [];
    axisScores[t.axis].push(t.percentage);
  });

  return Object.entries(axisScores)
    .map(([axis, scores]) => ({ axis, average: scores.reduce((sum, s) => sum + s, 0) / scores.length }))
    .sort((a, b) => b.average - a.average);
}

function getTalentTitle(id: number): string {
  const titles: Record<number, string> = {
    4: "Control y gestión",
    1: "Estrategia y comunicación",
    6: "Creatividad e inventiva",
    7: "Introspección y mirada interior",
    8: "Funcionalidad y cooperación",
    5: "Trascendencia y intuición",
    2: "Investigación y ciencia aplicada",
    3: "Acompañamiento y facilitación",
  };

  return titles[id] ?? `Talento ${id}`;
}

function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.replace("#", "");
  const safe = normalized.length === 3
    ? normalized.split("").map((c) => c + c).join("")
    : normalized;
  const num = Number.parseInt(safe, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function symbolStrokeWidth(size: number) {
  return size >= 24 ? 1.8 : size >= 16 ? 1.6 : 1.4;
}

function transformPathData(d: string, offsetX: number, offsetY: number, size: number) {
  const tokens = d.match(/[A-Za-z]|-?\d*\.?\d+/g) ?? [];
  const scale = size / 24;
  const out: string[] = [];
  let i = 0;
  let cmd = "";

  const isLetter = (value: string) => /^[A-Za-z]$/.test(value);
  const fx = (value: string) => Number((offsetX + Number(value) * scale).toFixed(3)).toString();
  const fy = (value: string) => Number((offsetY + Number(value) * scale).toFixed(3)).toString();

  while (i < tokens.length) {
    const token = tokens[i];
    if (isLetter(token)) {
      cmd = token;
      i += 1;
      if (cmd === "Z") out.push("Z");
      continue;
    }

    if (cmd === "M") {
      let first = true;
      while (i + 1 < tokens.length && !isLetter(tokens[i]) && !isLetter(tokens[i + 1])) {
        const x = fx(tokens[i]);
        const y = fy(tokens[i + 1]);
        out.push(`${first ? "M" : "L"}${x} ${y}`);
        first = false;
        i += 2;
      }
      continue;
    }

    if (cmd === "L") {
      while (i + 1 < tokens.length && !isLetter(tokens[i]) && !isLetter(tokens[i + 1])) {
        out.push(`L${fx(tokens[i])} ${fy(tokens[i + 1])}`);
        i += 2;
      }
      continue;
    }

    if (cmd === "H") {
      while (i < tokens.length && !isLetter(tokens[i])) {
        out.push(`H${fx(tokens[i])}`);
        i += 1;
      }
      continue;
    }

    if (cmd === "V") {
      while (i < tokens.length && !isLetter(tokens[i])) {
        out.push(`V${fy(tokens[i])}`);
        i += 1;
      }
      continue;
    }

    if (cmd === "Q") {
      while (i + 3 < tokens.length && !isLetter(tokens[i]) && !isLetter(tokens[i + 1]) && !isLetter(tokens[i + 2]) && !isLetter(tokens[i + 3])) {
        out.push(`Q${fx(tokens[i])} ${fy(tokens[i + 1])} ${fx(tokens[i + 2])} ${fy(tokens[i + 3])}`);
        i += 4;
      }
      continue;
    }

    if (cmd === "C") {
      while (
        i + 5 < tokens.length &&
        !isLetter(tokens[i]) &&
        !isLetter(tokens[i + 1]) &&
        !isLetter(tokens[i + 2]) &&
        !isLetter(tokens[i + 3]) &&
        !isLetter(tokens[i + 4]) &&
        !isLetter(tokens[i + 5])
      ) {
        out.push(`C${fx(tokens[i])} ${fy(tokens[i + 1])} ${fx(tokens[i + 2])} ${fy(tokens[i + 3])} ${fx(tokens[i + 4])} ${fy(tokens[i + 5])}`);
        i += 6;
      }
      continue;
    }

    i += 1;
  }

  return out.join(" ");
}

function PositionedSymbol({
  talentId,
  modelType,
  color,
  size,
  x,
  y,
}: {
  talentId: TalentKey;
  modelType: "genotipo" | "neurotalento";
  color: string;
  size: number;
  x: number;
  y: number;
}) {
  const vector = SYMBOL_VECTOR_DATA[modelType][talentId];
  if (!vector) return null;

  const d = transformPathData(vector.d, x - size / 2, y - size / 2, size);
  if (vector.fill) {
    return <path d={d} fill={color} />;
  }

  return <path d={d} fill="none" stroke={color} strokeWidth={symbolStrokeWidth(size)} strokeLinecap="round" strokeLinejoin="round" />;
}

function Donut({ score, max }: { score: number; max: number }) {
  const p = pct(score, max);
  const color = p >= 65 ? "var(--danger)" : "var(--foreground)";
  const size = 52;
  const r = 20;
  const c = 2 * Math.PI * r;
  const dash = (p / 100) * c;

  return (
    <div className="flex items-center gap-3">
      <svg width={size} height={size} viewBox="0 0 52 52" aria-label={`${p}`}>
        <circle cx="26" cy="26" r={r} fill="none" stroke="rgba(100,116,139,0.25)" strokeWidth="6" />
        <circle
          cx="26"
          cy="26"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          transform="rotate(-90 26 26)"
        />
        <text x="26" y="29" textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--foreground)">
          {p}
        </text>
      </svg>
    </div>
  );
}

export default function TalentWheel({
  scores,
  showFullLabels = false,
  modelType = "genotipo",
  centerText,
  summaryText,
  minimal = false,
}: Props) {
  const talents = useMemo(() => {
    return TALENT_ORDER.map((talentId) => {
      const scoreData = scores.find((s) => s.talentId === talentId);
      const config = TALENT_CONFIG[talentId];
      const talent = TALENTS.find((t) => t.id === talentId);
      const score = toSafeNumber(scoreData?.score, 0);
      const maxScore = toSafeNumber(scoreData?.max, 15);
      const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
      const fullTitle = talent?.reportTitle || getTalentTitle(talentId);
      const [line1, line2] = splitTalentTitle(fullTitle);

      return {
        id: talentId,
        title: fullTitle,
        titleLine1: line1,
        titleLine2: line2,
        score,
        maxScore,
        percentage,
        color: config.color,
        secondaryColor: config.secondaryColor,
        axis: config.axis,
      };
    });
  }, [scores]);

  const professionalProfile = useMemo(() => calculateProfessionalProfile(talents), [talents]);

const size = 600;
const center = size / 2;
const radius = 236;
const innerRadius = 72;
const angleSize = 360 / TALENT_ORDER.length;
const startAngle = -90;

const sections = talents.map((talent, index) => {
  const a0 = startAngle + index * angleSize;
  const a1 = a0 + angleSize;
  const mid = (a0 + a1) / 2;
  const fillRadius = innerRadius + (radius - innerRadius) * (talent.percentage / 100);
  const glowRadius = Math.max(28, 20 + (fillRadius - innerRadius) * 0.22);
  const innerGlowRadius = Math.max(18, 12 + (fillRadius - innerRadius) * 0.16);
  const valuePos = polar(center, center, innerRadius + (fillRadius - innerRadius) * 0.62, mid);
  const glowPos = polar(center, center, innerRadius + (fillRadius - innerRadius) * 0.64, mid);
  const labelDistance = showFullLabels ? radius + 34 : radius + 24;
  const labelPos = polar(center, center, labelDistance, mid);

  return {
    ...talent,
    a0,
    a1,
    mid,
    fillRadius,
    labelPos,
    valuePos,
    glowPos,
    glowRadius,
    innerGlowRadius,
    outlinePath: ringSectorPath(center, center, radius, innerRadius, a0, a1),
    fillPaths: [
      {
        key: `${talent.id}-base`,
        opacity: 0.06,
        d: ringSectorPath(center, center, fillRadius, innerRadius, a0, a1),
      },
      {
        key: `${talent.id}-mid`,
        opacity: 0.08,
        d: ringSectorPath(
          center,
          center,
          innerRadius + (fillRadius - innerRadius) * 0.82,
          innerRadius,
          a0,
          a1,
        ),
      },
    ],
  };
});

const displayCenterText = centerText || (modelType === "genotipo" ? "Talentos" : "Neurotalento");
const viewBoxPadding = showFullLabels ? 40 : 26;

  return (
    <div className="flex flex-col items-center gap-8 print:gap-4">
      <svg width={size} height={size} viewBox={`${-viewBoxPadding} ${-viewBoxPadding} ${size + viewBoxPadding * 2} ${size + viewBoxPadding * 2}`} className="max-w-full h-auto print:max-w-[500px]" overflow="visible">
        <defs>
          <filter id="talent-wheel-soft-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="12" />
          </filter>
          <filter id="talent-wheel-text-shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="2.6" floodColor="rgba(0,0,0,0.45)" />
          </filter>
        </defs>

        <line x1={center} y1={center - radius} x2={center} y2={center + radius} stroke="#4B5563" strokeWidth="1.6" />
        <line x1={center - radius} y1={center} x2={center + radius} y2={center} stroke="#4B5563" strokeWidth="1.6" />

        {sections.map((section) => (
          <g key={section.id}>
            <path d={section.outlinePath} fill="none" stroke={hexToRgba(section.color, 0.28)} strokeWidth="1.6" />
            {section.fillPaths.map((layer) => (
              <path key={layer.key} d={layer.d} fill={hexToRgba(section.color, layer.opacity)} />
            ))}
            <circle
              cx={section.glowPos.x}
              cy={section.glowPos.y}
              r={section.glowRadius}
              fill={hexToRgba(section.color, 0.28)}
              filter="url(#talent-wheel-soft-glow)"
            />
            <circle
              cx={section.glowPos.x}
              cy={section.glowPos.y}
              r={section.innerGlowRadius}
              fill={hexToRgba(section.color, 0.12)}
            />
            {section.percentage > 0 ? (
              <text
                x={section.valuePos.x}
                y={section.valuePos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="16"
                fontWeight="800"
                fill="#FFFFFF"
                filter="url(#talent-wheel-text-shadow)"
              >
                {section.percentage}
              </text>
            ) : null}
          </g>
        ))}

        {sections.map((section) => (
          <g key={`${section.id}-label`}>
            <PositionedSymbol
              talentId={section.id as TalentKey}
              modelType={modelType}
              color={section.color}
              size={showFullLabels ? 14 : 12}
              x={section.labelPos.x}
              y={section.labelPos.y - (showFullLabels ? 14 : 0)}
            />
            {showFullLabels ? (
              <g>
                <text
                  x={section.labelPos.x}
                  y={section.labelPos.y + 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="11"
                  fontWeight="700"
                  fill="#111111"
                >
                  {section.titleLine1}
                </text>
                {section.titleLine2 ? (
                  <text
                    x={section.labelPos.x}
                    y={section.labelPos.y + 16}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="11"
                    fontWeight="700"
                    fill="#111111"
                  >
                    {section.titleLine2}
                  </text>
                ) : null}
              </g>
            ) : null}
          </g>
        ))}

        <circle cx={center} cy={center} r={innerRadius} fill="#F4F4F5" stroke="#111111" strokeWidth="2.2" />
        <text
          x={center}
          y={center}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={displayCenterText.length > 10 ? "14" : "18"}
          fontWeight="700"
          fill="#666666"
        >
          {displayCenterText}
        </text>
      </svg>

      {summaryText && summaryText.trim() ? (
        <div
          style={{
            width: "100%",
            maxWidth: "700px",
            margin: "20px auto",
            padding: "20px 30px",
            background: "#000",
            color: "#fff",
            borderRadius: "60px",
            fontSize: "14px",
            lineHeight: "1.6",
            textAlign: "center",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          {summaryText}
        </div>
      ) : null}

      {!minimal && professionalProfile.length > 0 ? (
        <div className="w-full max-w-2xl print:max-w-full mb-6">
          <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3 print:text-black">Perfil profesional</h3>
          <div className="flex flex-wrap gap-2">
            {professionalProfile.map((axis, idx) => (
              <div
                key={axis.axis}
                className="px-4 py-2 rounded-lg border-2 font-semibold text-sm"
                style={{
                  borderColor: idx === 0 ? "#10B981" : "#e5e7eb",
                  backgroundColor: idx === 0 ? "#f0fdf4" : "white",
                  color: idx === 0 ? "#10B981" : "#6b7280",
                }}
              >
                {axis.axis} ({Math.round(axis.average)})
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {!minimal ? (
        <div className="w-full max-w-2xl print:max-w-full">
          <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3 print:text-black">Detalle por talento</h3>
          <div className="grid gap-2 print:gap-1">
            {talents.map((t) => {
              const isDanger = t.percentage > 67;
              const textColor = isDanger ? "#DC2626" : "#000000";
              const barColor = isDanger ? "#DC2626" : "#111111";

              return (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-lg border border-[var(--border)] bg-[var(--card)] print:border-gray-300 print:bg-white print:p-2">
                  <div className="flex items-center gap-3 flex-1">
                    <svg width="26" height="26" viewBox="0 0 24 24" className="shrink-0">
                      <PositionedSymbol talentId={t.id as TalentKey} modelType={modelType} color={t.color} size={20} x={12} y={12} />
                    </svg>
                    <div className="flex-1">
                      <div className="font-semibold text-sm mb-1" style={{ color: textColor }}>
                        {t.title}
                      </div>
                      <div className="text-xs text-[var(--muted-foreground)] print:text-gray-600 mb-1">{t.axis}</div>
                      <div className="w-full">
                        <div className="mb-1 flex justify-between text-[10px] text-gray-500"><span>0</span><span>60</span><span>100</span></div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${t.percentage}%`,
                              backgroundColor: barColor,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-3">
                    <div className="font-bold text-lg print:text-base" style={{ color: textColor }}>
                      {t.percentage}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

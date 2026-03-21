import { TALENTS } from "@/lib/talents";
import {
  TALENT_COLORS as INFORME_COLORS,
  SYMBOLS_GENOTIPO, SYMBOLS_NEUROTALENTO,
  SOFT_SKILLS_GENOTIPO, SOFT_SKILLS_NEUROTALENTO,
  TALENT_NAMES, NEUROCOGNITIVE_DATA,
} from "@/lib/pdf-data";
import type JSZip from "jszip";

type Html2PdfInstance = {
  set(options: Record<string, unknown>): Html2PdfInstance;
  from(element: HTMLElement): Html2PdfInstance;
  save(): Promise<void>;
  output(type: string): Promise<Blob>;
};

type Html2PdfFn = () => Html2PdfInstance;

export type RankedTalent = {
  id: number;
  code: string;
  quizTitle: string;
  titleSymbolic: string;
  titleGenotype: string;
  reportTitle?: string;
  reportSummary?: string;
  exampleRoles: string[];
  score: number;
  max: number;
};

export type ExportProfileMeta = {
  rolEscogido?: string;
  rolPensado?: string;
};

const ID_TO_KEY: Record<number, string> = {
  1: "estrategia",
  2: "analitico",
  3: "acompanamiento",
  4: "gestion",
  5: "empatico",
  6: "imaginacion",
  7: "profundo",
  8: "aplicado",
};

const GENOTIPO_SYMBOLS: Record<number, string> = {
  4: "□",
  1: "△",
  6: "⬯",
  7: "◇",
  8: "▭",
  5: "○",
  2: "⬠",
  3: "∞",
};

const NEUROTALENTO_SYMBOLS: Record<number, string> = {
  4: "Α",
  1: "Δ",
  6: "Φ",
  7: "Θ",
  8: "Μ",
  5: "Ω",
  2: "Π",
  3: "Ψ",
};

type TalentKey = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
type VectorDef = { d: string; fill?: boolean };

const TALENT_COLORS: Record<number, string> = {
  1: "#DC2626",
  2: "#8B5CF6",
  3: "#7C3AED",
  4: "#EF4444",
  5: "#F59E0B",
  6: "#06B6D4",
  7: "#10B981",
  8: "#D97706",
};

const TALENT_ORDER: TalentKey[] = [4, 1, 6, 7, 8, 5, 2, 3];

const AXIS_GROUPS = [
  { name: "ACCIÓN Y RESULTADOS", talents: [4, 1] },
  { name: "IMAGINACIÓN Y ARTE", talents: [6, 7] },
  { name: "DESTREZA Y PROYECCIÓN", talents: [8, 5] },
  { name: "SABER Y CONOCIMIENTO", talents: [2, 3] },
];

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
  if (typeof value === "number" && !isNaN(value)) return value;
  return fallback;
}

function splitLabel(title: string): [string, string] {
  if (title.includes(" y ")) {
    const p = title.split(" y ");
    if (p.length === 2) return [p[0] + " y", p[1]];
  }
  if (title.includes(" e ")) {
    const p = title.split(" e ");
    if (p.length === 2) return [p[0] + " e", p[1]];
  }
  const words = title.split(" ");
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
}

function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.replace("#", "");
  const safe = normalized.length === 3 ? normalized.split("").map((c) => c + c).join("") : normalized;
  const num = Number.parseInt(safe, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function degToRad(deg: number) {
  return (deg * Math.PI) / 180;
}

function polarToCartesian(cx: number, cy: number, angle: number, r: number) {
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
}

function polarDeg(cx: number, cy: number, r: number, angleDeg: number) {
  return polarToCartesian(cx, cy, degToRad(angleDeg), r);
}

function createArcPath(
  cx: number,
  cy: number,
  startAngle: number,
  endAngle: number,
  outerR: number,
  innerR: number,
): string {
  const start = polarToCartesian(cx, cy, startAngle, outerR);
  const end = polarToCartesian(cx, cy, endAngle, outerR);
  const innerStart = polarToCartesian(cx, cy, startAngle, innerR);
  const innerEnd = polarToCartesian(cx, cy, endAngle, innerR);
  const laf = endAngle - startAngle > Math.PI ? 1 : 0;
  return [
    `M ${start.x} ${start.y}`,
    `A ${outerR} ${outerR} 0 ${laf} 1 ${end.x} ${end.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerR} ${innerR} 0 ${laf} 0 ${innerStart.x} ${innerStart.y}`,
    "Z",
  ].join(" ");
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
      while (i + 5 < tokens.length && !isLetter(tokens[i]) && !isLetter(tokens[i + 1]) && !isLetter(tokens[i + 2]) && !isLetter(tokens[i + 3]) && !isLetter(tokens[i + 4]) && !isLetter(tokens[i + 5])) {
        out.push(`C${fx(tokens[i])} ${fy(tokens[i + 1])} ${fx(tokens[i + 2])} ${fy(tokens[i + 3])} ${fx(tokens[i + 4])} ${fy(tokens[i + 5])}`);
        i += 6;
      }
      continue;
    }

    i += 1;
  }

  return out.join(" ");
}

function symbolFragment(talentId: TalentKey, modelType: "genotipo" | "neurotalento", color: string, size: number, x: number, y: number) {
  const vector = SYMBOL_VECTOR_DATA[modelType][talentId];
  if (!vector) return "";
  const d = transformPathData(vector.d, x - size / 2, y - size / 2, size);
  if (vector.fill) {
    return `<path d="${d}" fill="${color}"/>`;
  }
  return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${symbolStrokeWidth(size)}" stroke-linecap="round" stroke-linejoin="round"/>`;
}

function generateWheelSVG(
  ranked: RankedTalent[],
  modelType: "genotipo" | "neurotalento",
): string {
  const size = 600;
  const center = size / 2;
  const radius = 236;
  const innerRadius = 72;
  const angleSize = 360 / TALENT_ORDER.length;
  const startAngle = -90;

  const sections = TALENT_ORDER.map((talentId, index) => {
    const rd = ranked.find((r) => r.id === talentId);
    const color = TALENT_COLORS[talentId] ?? "#999";
    const score = toSafeNumber(rd?.score, 0);
    const max = toSafeNumber(rd?.max, 15);
    const percentage = max > 0 ? Math.round((score / max) * 100) : 0;
    const a0 = startAngle + index * angleSize;
    const a1 = a0 + angleSize;
    const mid = (a0 + a1) / 2;
    const fillRadius = innerRadius + (radius - innerRadius) * (percentage / 100);
    const glowRadius = Math.max(28, 20 + (fillRadius - innerRadius) * 0.22);
    const valuePos = polarDeg(center, center, innerRadius + (fillRadius - innerRadius) * 0.62, mid);
    const glowPos = polarDeg(center, center, innerRadius + (fillRadius - innerRadius) * 0.64, mid);
    const labelPos = polarDeg(center, center, radius + 34, mid);
    const talent = TALENTS.find((t) => t.id === talentId);
    const fullTitle = talent?.reportTitle ?? "";
    const [line1, line2] = splitLabel(fullTitle);
    return {
      talentId,
      color,
      percentage,
      labelPos,
      valuePos,
      glowPos,
      glowRadius,
      outlinePath: createArcPath(center, center, degToRad(a0), degToRad(a1), radius, innerRadius),
      fillPaths: [0.45, 0.68, 0.88, 1].map((factor, fillIndex) => ({
        key: `${talentId}-${fillIndex}`,
        opacity: [0.08, 0.12, 0.18, 0.26][fillIndex],
        d: createArcPath(
          center,
          center,
          degToRad(a0),
          degToRad(a1),
          innerRadius + (fillRadius - innerRadius) * factor,
          innerRadius,
        ),
      })),
      line1,
      line2,
    };
  });

  const sectionSvg = sections
    .map((s) => {
      const layers = s.fillPaths
        .map((layer) => `<path d="${layer.d}" fill="${hexToRgba(s.color, layer.opacity)}"/>`)
        .join("");
      const pctText = s.percentage > 0
        ? `<text x="${s.valuePos.x.toFixed(2)}" y="${s.valuePos.y.toFixed(2)}" text-anchor="middle" dominant-baseline="middle" font-size="16" font-weight="800" fill="#FFFFFF" filter="url(#tw-text-shadow)">${s.percentage}</text>`
        : "";
      return `
      <g>
        <path d="${s.outlinePath}" fill="none" stroke="${hexToRgba(s.color, 0.28)}" stroke-width="1.6"/>
        ${layers}
        <circle cx="${s.glowPos.x.toFixed(2)}" cy="${s.glowPos.y.toFixed(2)}" r="${s.glowRadius.toFixed(2)}" fill="${hexToRgba(s.color, 0.28)}" filter="url(#tw-soft-glow)"/>
        ${pctText}
      </g>
      <g>
        ${symbolFragment(s.talentId, modelType, s.color, 14, s.labelPos.x, s.labelPos.y - 14)}
        <text x="${s.labelPos.x.toFixed(2)}" y="${(s.labelPos.y + 2).toFixed(2)}" text-anchor="middle" dominant-baseline="middle" font-size="11" font-weight="700" fill="#111111">${s.line1}</text>
        ${s.line2 ? `<text x="${s.labelPos.x.toFixed(2)}" y="${(s.labelPos.y + 16).toFixed(2)}" text-anchor="middle" dominant-baseline="middle" font-size="11" font-weight="700" fill="#111111">${s.line2}</text>` : ""}
      </g>`;
    })
    .join("");

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="tw-soft-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="12"/></filter>
      <filter id="tw-text-shadow" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="2" stdDeviation="2.6" flood-color="rgba(0,0,0,0.45)"/></filter>
    </defs>
    <line x1="${center}" y1="${center - radius}" x2="${center}" y2="${center + radius}" stroke="#4B5563" stroke-width="1.6"/>
    <line x1="${center - radius}" y1="${center}" x2="${center + radius}" y2="${center}" stroke="#4B5563" stroke-width="1.6"/>
    ${sectionSvg}
    <circle cx="${center}" cy="${center}" r="${innerRadius}" fill="#F4F4F5" stroke="#111111" stroke-width="2.2"/>
    <text x="${center}" y="${center}" text-anchor="middle" dominant-baseline="middle" font-size="${modelType === "genotipo" ? 18 : 14}" font-weight="700" fill="#666666">${modelType === "genotipo" ? "Talentos" : "Neurotalento"}</text>
  </svg>`;
}

function generateBatteryBar(percentage: number, compact = false): string {
  const pct = Math.min(Math.max(percentage, 0), 100);
  const fill = pct > 67 ? "#DC2626" : "#111111";
  const h = compact ? 8 : 10;
  return `<div>
    <div style="display:flex;justify-content:space-between;font-size:${compact ? 8 : 9}px;color:#6b7280;margin-bottom:4px;line-height:1;">
      <span>0</span><span>60</span><span>100</span>
    </div>
    <div style="width:100%;height:${h}px;background:#d1d5db;border-radius:999px;overflow:hidden;">
      <div style="width:${pct}%;height:100%;background:${fill};border-radius:999px;"></div>
    </div>
  </div>`;
}

function generatePDFHTML(
  ranked: RankedTalent[],
  modelType: "genotipo" | "neurotalento",
  userName: string,
  summaryText?: string,
  meta?: ExportProfileMeta,
): string {
  const symbolMap = modelType === "genotipo" ? GENOTIPO_SYMBOLS : NEUROTALENTO_SYMBOLS;
  const modelLabel = modelType === "genotipo" ? "Modelo Talentos" : "Modelo Neurotalento";
  const winner = ranked[0];
  const winnerFull = TALENTS.find((t) => t.id === winner?.id);

  const svgContent = generateWheelSVG(ranked, modelType);

  const competencies = winnerFull?.competencies ?? [];
  const topRole = meta?.rolEscogido || meta?.rolPensado || winnerFull?.exampleRoles?.[0] || "";
  const profileTitle = winner?.reportTitle ?? winner?.quizTitle ?? "—";

  const bulletItems = competencies
    .map(
      (c) => `
    <div style="display:flex;align-items:flex-start;gap:5px;margin-bottom:4px;">
      <span style="color:#CC0000;font-weight:bold;flex-shrink:0;font-size:9px;">&bull;</span>
      <span style="font-size:9px;color:#333;line-height:1.3;">${c}</span>
    </div>`,
    )
    .join("");

  const profileSection = `
    <div style="background:#f9f9f9;border:1px solid #ddd;border-radius:6px;padding:12px;margin-bottom:12px;">
      <div style="font-size:7px;font-weight:700;color:#888;letter-spacing:1px;margin-bottom:5px;">PERFIL PROFESIONAL</div>
      <div style="font-size:12px;font-weight:700;color:#111;margin-bottom:8px;text-transform:uppercase;">${profileTitle}</div>
      ${bulletItems}
      <div style="margin-top:8px;border:2px solid #CC0000;border-radius:5px;padding:6px;background:#fff3f3;">
        <div style="font-size:7px;font-weight:700;color:#CC0000;letter-spacing:0.5px;margin-bottom:2px;">ROL SUGERIDO</div>
        <div style="font-size:9px;color:#333;line-height:1.35;">${topRole || "No indicado"}</div>
      </div>
    </div>`;

  const talentListRows = AXIS_GROUPS.map((group) => {
    const rows = group.talents
      .map((talentId) => {
        const rd = ranked.find((r) => r.id === talentId);
        const pct = rd && rd.max > 0 ? Math.round((rd.score / rd.max) * 100) : 0;
        const sym = symbolMap[talentId] ?? "?";
        const nam = rd?.reportTitle ?? "";
        const bar = generateBatteryBar(pct, true);
        return `<div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:9px;">
          <div style="font-size:13px;font-weight:700;color:#222;width:18px;text-align:center;flex-shrink:0;line-height:1.2;">${sym}</div>
          <div style="font-size:10px;font-weight:600;color:#333;width:160px;flex-shrink:0;line-height:1.25;word-break:break-word;">${pct} · ${nam}</div>
          <div style="flex:1;min-width:0;">${bar}</div>
        </div>`;
      })
      .join("");
    return `<div style="margin-bottom:12px;">
      <div style="font-size:9px;font-weight:700;color:#555;letter-spacing:0.6px;border-bottom:1px solid #ddd;padding-bottom:3px;margin-bottom:7px;">${group.name}</div>
      ${rows}
    </div>`;
  }).join("");

  const summaryBanner = summaryText?.trim()
    ? `<div style="width:100%;max-width:560px;margin:10px auto 0;padding:10px 16px;background:#000;color:#fff;border-radius:40px;font-size:10px;line-height:1.45;text-align:center;">${summaryText}</div>`
    : "";

  return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/>
  <style>*{box-sizing:border-box;margin:0;padding:0;}body{font-family:Arial,sans-serif;background:#fff;color:#111;}</style>
</head><body>
  <div id="pdf-root" style="width:1000px;padding:25px;">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;border-bottom:2px solid #111;padding-bottom:8px;">
      <div>
        <div style="font-size:16px;font-weight:700;">MAPA DE ${modelType === "genotipo" ? "TALENTOS" : "NEUROTALENTOS"}</div>
        <div style="font-size:10px;color:#555;">${userName ? `${userName} — ` : ""}${modelLabel}</div>
      </div>
      <div style="font-size:9px;color:#888;">Basado en neurociencia aplicada</div>
    </div>
    <div style="display:flex;gap:24px;align-items:flex-start;">
      <div style="flex-shrink:0;display:flex;flex-direction:column;align-items:center;">
        ${svgContent}
        ${summaryBanner}
      </div>
      <div style="flex:1;display:flex;flex-direction:column;gap:10px;">
        ${profileSection}
        <div style="background:#fff;border:1px solid #ddd;border-radius:6px;padding:10px;">${talentListRows}</div>
      </div>
    </div>
  </div>
</body></html>`;
}

function hex2rgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function escapeHtml(text?: string): string {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getPercent(rd?: RankedTalent): number {
  if (!rd || !rd.max) return 0;
  return Math.max(0, Math.min(100, Math.round((rd.score / rd.max) * 100)));
}

function buildIntroPage(
  ranked: RankedTalent[],
  modelType: "genotipo" | "neurotalento",
  userName: string,
  summaryText?: string,
): string {
  const symbolMap = modelType === "genotipo" ? GENOTIPO_SYMBOLS : NEUROTALENTO_SYMBOLS;
  const title = modelType === "genotipo" ? "Informe de talentos" : "Informe de neurotalentos";
  const winner = ranked[0];
  const winnerTalent = TALENTS.find((t) => t.id === winner?.id);
  const winnerRole = winnerTalent?.exampleRoles?.[0] ?? "No indicado";
  const wheel = generateWheelSVG(ranked, modelType)
    .replace('width="560" height="560"', 'width="430" height="430"');

  const batteryGroups = AXIS_GROUPS.map((group) => {
    const rows = group.talents
      .map((talentId) => {
        const rd = ranked.find((r) => r.id === talentId);
        const pct = getPercent(rd);
        const name = escapeHtml(rd?.reportTitle ?? TALENTS.find((t) => t.id === talentId)?.reportTitle ?? "");
        const symbol = symbolMap[talentId] ?? "?";
        return `<div class="battery-row">
          <div class="battery-symbol">${symbol}</div>
          <div class="battery-name">${pct} · ${name}</div>
          <div class="battery-bar-wrap">${generateBatteryBar(pct, true)}</div>
        </div>`;
      })
      .join("");

    return `<div class="axis-group">
      <div class="axis-title">${group.name}</div>
      ${rows}
    </div>`;
  }).join("");

  const profileBullets = (winnerTalent?.competencies ?? []).slice(0, 4).map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  const evaluatorText = summaryText?.trim() ? escapeHtml(summaryText) : "Síntesis generada a partir del mapa principal y de las baterías dominantes del perfil.";

  return `<section class="page page-cover">
    <div class="cover-header">
      <div>
        <div class="eyebrow">Centro Educativo San Cristóbal-Castellón</div>
        <h1>${title}</h1>
        <p class="subtitle">${escapeHtml(userName)}</p>
      </div>
      <div class="meta-chip">Basado en neurociencia aplicada</div>
    </div>

    <div class="cover-grid">
      <div class="map-card">
        <div class="card-title">Mapa principal</div>
        <div class="map-wrap">${wheel}</div>
      </div>

      <div class="sidebar-stack">
        <div class="info-card">
          <div class="card-title">Perfil profesional</div>
          <div class="hero-name">${escapeHtml(winner?.reportTitle ?? winner?.quizTitle ?? "Perfil principal")}</div>
          <div class="hero-role">${escapeHtml(winnerRole)}</div>
          <ul class="bullet-list">${profileBullets}</ul>
        </div>

        <div class="info-card compact">
          <div class="card-title">Resumen del evaluador</div>
          <p class="summary-copy">${evaluatorText}</p>
        </div>
      </div>
    </div>

    <div class="battery-card">
      <div class="card-title">Baterías destacadas</div>
      ${batteryGroups}
    </div>
  </section>`;
}

function buildTalentPages(
  ranked: RankedTalent[],
  modelType: "genotipo" | "neurotalento",
): string {
  const symMap = modelType === "genotipo" ? SYMBOLS_GENOTIPO : SYMBOLS_NEUROTALENTO;

  const ordered = [...ranked].sort((a, b) => getPercent(b) - getPercent(a));

  return ordered.map((rd, index) => {
    const key = ID_TO_KEY[rd.id];
    const data = NEUROCOGNITIVE_DATA[key];
    const color = INFORME_COLORS[key] ?? "#888";
    const symbol = symMap[key] ?? "?";
    const name = TALENT_NAMES[key] ?? rd.reportTitle ?? rd.quizTitle;
    const value = getPercent(rd);
    const ambitos = data.ambitos.map((a) => `<span class="tag" style="background:${hex2rgba(color, 0.14)};color:${color};">${escapeHtml(a)}</span>`).join("");
    const perfil = data.perfilPuntos.map((p) => `<li>${escapeHtml(p)}</li>`).join("");

    return `<section class="page page-talent">
      <div class="talent-card">
        <div class="talent-accent" style="background:${color};"></div>
        <div class="talent-header">
          <div class="talent-symbol" style="color:${color};">${symbol}</div>
          <div class="talent-headcopy">
            <div class="eyebrow" style="color:${color};">Batería ${index + 1}</div>
            <h2>${escapeHtml(name)}</h2>
            <div class="axis-line">${escapeHtml(data.eje)}</div>
          </div>
          <div class="score-box">
            <div class="score-label">Valor</div>
            <div class="score-number" style="color:${color};">${value}</div>
          </div>
        </div>

        <div class="hero-bar">${generateBatteryBar(value)}</div>

        <div class="talent-grid">
          <div class="panel">
            <div class="panel-title">Resumen neurocognitivo</div>
            <p>${escapeHtml(data.resumen)}</p>
            <p class="muted">${escapeHtml(data.detalle)}</p>
          </div>

          <div class="panel panel-soft">
            <div class="panel-title">Perfil</div>
            <ul class="bullet-list dark">${perfil}</ul>
            <div class="panel-title second">Rol sugerido</div>
            <p class="role-copy" style="color:${color};">${escapeHtml(data.rol)}</p>
          </div>
        </div>

        <div class="panel full">
          <div class="panel-title">Ámbitos profesionales</div>
          <div class="tag-wrap">${ambitos}</div>
        </div>
      </div>
    </section>`;
  }).join("");
}

function buildSoftSkillsPage(
  ranked: RankedTalent[],
  modelType: "genotipo" | "neurotalento",
): string {
  const symMap = modelType === "genotipo" ? SYMBOLS_GENOTIPO : SYMBOLS_NEUROTALENTO;
  const softMap = modelType === "genotipo" ? SOFT_SKILLS_GENOTIPO : SOFT_SKILLS_NEUROTALENTO;

  const rows = ranked
    .filter((rd) => getPercent(rd) > 67)
    .sort((a, b) => getPercent(b) - getPercent(a))
    .map((rd) => {
      const key = ID_TO_KEY[rd.id];
      const color = INFORME_COLORS[key] ?? "#888";
      const symbol = symMap[key] ?? "?";
      const name = TALENT_NAMES[key] ?? rd.reportTitle ?? rd.quizTitle;
      const skills = softMap[key] ?? [];
      if (!skills.length) return "";
      return `<tr>
        <td>
          <div class="soft-battery">
            <span class="soft-symbol" style="color:${color};">${symbol}</span>
            <span>${escapeHtml(name)}</span>
          </div>
        </td>
        <td>
          <div class="soft-chip-wrap">${skills.map((s) => `<span class="soft-chip" style="border-color:${hex2rgba(color, 0.25)};color:${color};background:${hex2rgba(color, 0.08)};">${escapeHtml(s)}</span>`).join("")}</div>
        </td>
      </tr>`;
    })
    .filter(Boolean)
    .join("");

  return `<section class="page page-softskills">
    <div class="soft-card">
      <div class="eyebrow">Cierre del informe</div>
      <h2>Soft skills destacadas</h2>
      <p class="soft-intro">Solo se muestran las baterías destacadas.</p>
      <table class="soft-table">
        <thead>
          <tr><th>Batería</th><th>Competencias asociadas</th></tr>
        </thead>
        <tbody>
          ${rows || '<tr><td colspan="2">No hay baterías destacadas por encima del umbral configurado.</td></tr>'}
        </tbody>
      </table>
    </div>
  </section>`;
}

function generateInformeHTML(
  ranked: RankedTalent[],
  modelType: "genotipo" | "neurotalento",
  userName: string,
  summaryText?: string,
): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, Helvetica, sans-serif; background: #eef2f7; color: #18212f; }
    #pdf-root { width: 794px; margin: 0 auto; }
    .page {
      width: 794px;
      min-height: 1123px;
      background: #f7f8fb;
      position: relative;
      overflow: hidden;
      page-break-after: always;
      break-after: page;
      padding: 48px;
    }
    .page:last-child { page-break-after: auto; break-after: auto; }
    .eyebrow { font-size: 12px; letter-spacing: 1.8px; text-transform: uppercase; color: #6b7280; font-weight: 700; }
    h1 { font-size: 34px; line-height: 1.08; margin-top: 10px; color: #0f172a; }
    h2 { font-size: 29px; line-height: 1.1; color: #0f172a; }
    .subtitle { margin-top: 12px; font-size: 18px; color: #475569; }
    .meta-chip { border: 1px solid #d6dbe4; background: #fff; color: #475569; padding: 10px 14px; border-radius: 999px; font-size: 12px; }
    .cover-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 26px; }
    .cover-grid { display: grid; grid-template-columns: 1.12fr 0.88fr; gap: 24px; align-items: start; }
    .map-card, .info-card, .battery-card, .talent-card, .soft-card {
      background: #fff;
      border: 1px solid #dde3eb;
      border-radius: 28px;
      box-shadow: 0 10px 28px rgba(15, 23, 42, 0.06);
    }
    .map-card { padding: 24px 24px 14px; }
    .map-wrap { display: flex; align-items: center; justify-content: center; min-height: 450px; }
    .sidebar-stack { display: flex; flex-direction: column; gap: 20px; }
    .info-card { padding: 24px; }
    .info-card.compact { min-height: 220px; }
    .card-title { font-size: 12px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 16px; }
    .hero-name { font-size: 24px; line-height: 1.15; font-weight: 800; color: #0f172a; margin-bottom: 10px; }
    .hero-role { font-size: 15px; line-height: 1.4; color: #475569; margin-bottom: 18px; }
    .summary-copy { font-size: 14px; line-height: 1.7; color: #334155; }
    .bullet-list { padding-left: 18px; display: flex; flex-direction: column; gap: 10px; }
    .bullet-list li { font-size: 13px; line-height: 1.55; color: #334155; }
    .bullet-list.dark li { font-size: 13px; }
    .battery-card { margin-top: 24px; padding: 24px; }
    .axis-group + .axis-group { margin-top: 16px; }
    .axis-title { font-size: 11px; font-weight: 800; letter-spacing: 1px; color: #475569; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 1px solid #e5e7eb; }
    .battery-row { display: grid; grid-template-columns: 22px 188px 1fr; gap: 12px; align-items: start; margin-bottom: 12px; }
    .battery-symbol { font-size: 16px; font-weight: 700; text-align: center; color: #111827; padding-top: 1px; }
    .battery-name { font-size: 12px; line-height: 1.35; color: #1f2937; font-weight: 600; }
    .battery-bar-wrap { padding-top: 1px; }
    .page-talent { padding: 54px 48px; }
    .talent-card { min-height: 1015px; padding: 32px 34px 34px; position: relative; }
    .talent-accent { position: absolute; inset: 0 0 auto 0; height: 10px; border-radius: 28px 28px 0 0; }
    .talent-header { display: grid; grid-template-columns: 78px 1fr 126px; gap: 18px; align-items: center; margin-top: 10px; }
    .talent-symbol { font-size: 62px; line-height: 1; font-weight: 700; text-align: center; }
    .talent-headcopy h2 { font-size: 31px; margin-top: 5px; }
    .axis-line { margin-top: 8px; font-size: 12px; line-height: 1.45; color: #64748b; letter-spacing: 0.5px; text-transform: uppercase; }
    .score-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 22px; padding: 18px 14px; text-align: center; }
    .score-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1.2px; color: #64748b; font-weight: 700; }
    .score-number { font-size: 40px; line-height: 1; font-weight: 800; margin-top: 8px; }
    .hero-bar { margin-top: 24px; }
    .talent-grid { display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 20px; margin-top: 26px; }
    .panel { background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 22px; padding: 22px; }
    .panel.full { margin-top: 20px; }
    .panel-title { font-size: 12px; font-weight: 800; letter-spacing: 1.2px; text-transform: uppercase; color: #64748b; margin-bottom: 14px; }
    .panel-title.second { margin-top: 18px; }
    .panel p { font-size: 14px; line-height: 1.72; color: #1f2937; }
    .panel p + p { margin-top: 14px; }
    .panel p.muted { color: #475569; }
    .role-copy { font-size: 18px; line-height: 1.45; font-weight: 700; }
    .tag-wrap, .soft-chip-wrap { display: flex; flex-wrap: wrap; gap: 10px; }
    .tag { display: inline-flex; align-items: center; padding: 9px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; line-height: 1.35; }
    .page-softskills { padding-top: 70px; }
    .soft-card { min-height: 980px; padding: 34px; }
    .soft-intro { margin-top: 12px; font-size: 15px; line-height: 1.6; color: #475569; }
    .soft-table { width: 100%; border-collapse: collapse; margin-top: 28px; }
    .soft-table th, .soft-table td { border-bottom: 1px solid #e5e7eb; padding: 16px 10px; vertical-align: top; text-align: left; }
    .soft-table th { font-size: 12px; letter-spacing: 1px; color: #64748b; text-transform: uppercase; }
    .soft-table td { font-size: 14px; line-height: 1.6; color: #1f2937; }
    .soft-battery { display: flex; align-items: center; gap: 12px; font-weight: 700; }
    .soft-symbol { font-size: 28px; line-height: 1; font-weight: 700; width: 26px; text-align: center; }
    .soft-chip { display: inline-flex; align-items: center; padding: 8px 11px; border-radius: 999px; border: 1px solid transparent; font-size: 12px; font-weight: 700; }
  </style>
</head>
<body>
  <div id="pdf-root">
    ${buildIntroPage(ranked, modelType, userName, summaryText)}
    ${buildTalentPages(ranked, modelType)}
    ${buildSoftSkillsPage(ranked, modelType)}
  </div>
</body>
</html>`;
}

function runHtml2Pdf(
  htmlContent: string,
  fileName: string,
  pageFormat: [number, number],
  zip?: JSZip,
  options?: { orientation?: "portrait" | "landscape"; useA4?: boolean },
): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve();
      return;
    }

    const html2pdf = (window as unknown as { html2pdf?: Html2PdfFn }).html2pdf;
    if (!html2pdf) {
      if (!zip) window.print();
      resolve();
      return;
    }

    const container = document.createElement("div");
    container.style.cssText = `position:fixed;left:-99999px;top:0;width:${pageFormat[0]}px;background:#fff;`;
    document.body.appendChild(container);

    const iframe = document.createElement("iframe");
    iframe.style.cssText = `width:${pageFormat[0]}px;height:${Math.max(pageFormat[1], 1200)}px;border:none;background:#fff;`;
    container.appendChild(iframe);

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) {
      document.body.removeChild(container);
      resolve();
      return;
    }

    iframeDoc.open();
    iframeDoc.write(htmlContent);
    iframeDoc.close();

    const render = () => {
      const target = iframeDoc.getElementById("pdf-root") as HTMLElement | null;
      if (!target) {
        document.body.removeChild(container);
        resolve();
        return;
      }

      const instance = html2pdf()
        .set({
          margin: 0,
          filename: fileName,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, allowTaint: true, backgroundColor: "#ffffff", windowWidth: pageFormat[0] },
          pagebreak: { mode: ["css", "legacy"] },
          jsPDF: options?.useA4
            ? { unit: "pt", format: "a4", orientation: options.orientation ?? "portrait" }
            : { unit: "px", format: pageFormat, orientation: options?.orientation ?? "landscape" },
        })
        .from(target);

      if (zip) {
        instance.output("blob")
          .then((blob: Blob) => {
            zip.file(fileName, blob);
            document.body.removeChild(container);
            resolve();
          })
          .catch(() => {
            document.body.removeChild(container);
            resolve();
          });
      } else {
        instance.save()
          .then(() => {
            document.body.removeChild(container);
            resolve();
          })
          .catch(() => {
            document.body.removeChild(container);
            resolve();
          });
      }
    };

    const wait = () => {
      const done = () => setTimeout(render, 350);
      const win = iframe.contentWindow;
      if (win && typeof win.requestAnimationFrame === "function") {
        win.requestAnimationFrame(() => win.requestAnimationFrame(done));
      } else {
        setTimeout(render, 700);
      }
    };

    setTimeout(wait, 500);
  });
}

export function exportTalentModelPDF(
  ranked: RankedTalent[],
  modelType: "genotipo" | "neurotalento",
  userName: string,
  zip?: JSZip,
  summaryText?: string,
  meta?: ExportProfileMeta,
): Promise<void> {
  const html = generatePDFHTML(ranked, modelType, userName, summaryText, meta);
  const fileName = `${userName ? userName.toLowerCase().replace(/\s+/g, "-") + "-" : ""}${modelType === "genotipo" ? "talentos" : "neurotalentos"}.pdf`;
  return runHtml2Pdf(html, fileName, [1000, 707], zip);
}

export async function exportInformePDF(
  ranked: RankedTalent[],
  modelType: "genotipo" | "neurotalento",
  userName: string,
  summaryText?: string,
): Promise<void> {
  if (typeof window === "undefined") return;

  const scores = Object.fromEntries(
    ranked
      .map((rd) => [ID_TO_KEY[rd.id], getPercent(rd)] as const)
      .filter((entry): entry is readonly [string, number] => Boolean(entry[0])),
  );

  const res = await fetch("/api/generate-informe-pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nombre: userName || "Resultado",
      scores,
      textoResumen: summaryText || "",
      modelo: modelType,
      fecha: new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" }),
    }),
  });

  if (!res.ok) {
    throw new Error("No se pudo generar el informe PDF");
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  const fileName = `${userName ? userName.toLowerCase().replace(/\s+/g, "-") + "-" : ""}informe-${modelType}.pdf`;
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

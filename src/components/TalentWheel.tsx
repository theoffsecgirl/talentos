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
  modelType?: 'genotipo' | 'neurotalento';
  centerText?: string;
  summaryText?: string;
  minimal?: boolean;
};

const TALENT_CONFIG: Record<number, { symbol: string; color: string; secondaryColor: string; axis: string }> = {
  4: { symbol: "□", color: "#DC2626", secondaryColor: "#EF4444", axis: "Acción y resultados" },
  1: { symbol: "△", color: "#EF4444", secondaryColor: "#F87171", axis: "Acción y resultados" },
  6: { symbol: "⬭", color: "#06B6D4", secondaryColor: "#22D3EE", axis: "Imaginación y arte" },
  7: { symbol: "◇", color: "#10B981", secondaryColor: "#34D399", axis: "Imaginación y arte" },
  8: { symbol: "▭", color: "#D97706", secondaryColor: "#F59E0B", axis: "Destreza y proyección" },
  5: { symbol: "○", color: "#F59E0B", secondaryColor: "#FBBF24", axis: "Destreza y proyección" },
  2: { symbol: "⬠", color: "#8B5CF6", secondaryColor: "#A78BFA", axis: "Saber y conocimiento" },
  3: { symbol: "∞", color: "#7C3AED", secondaryColor: "#8B5CF6", axis: "Saber y conocimiento" },
};

const GENOTIPO_SYMBOLS: Record<number, string> = {
  4: "□",
  1: "△",
  6: "⬭",
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

const TALENT_ORDER = [4, 1, 6, 7, 8, 5, 2, 3];

function toSafeNumber(value: any, fallback: number = 0): number {
  if (typeof value === 'number' && !isNaN(value)) return value;
  return fallback;
}

function splitTalentTitle(title: string): [string, string] {
  if (title.includes(' y ')) {
    const parts = title.split(' y ');
    if (parts.length === 2) {
      return [parts[0] + ' y', parts[1]];
    }
  }
  
  if (title.includes(' e ')) {
    const parts = title.split(' e ');
    if (parts.length === 2) {
      return [parts[0] + ' e', parts[1]];
    }
  }
  
  const words = title.split(' ');
  if (words.length <= 2) {
    return [title, ''];
  }
  
  const midPoint = Math.ceil(words.length / 2);
  return [
    words.slice(0, midPoint).join(' '),
    words.slice(midPoint).join(' '),
  ];
}

function calculateProfessionalProfile(talents: Array<{ id: number; percentage: number; axis: string }>) {
  const axisScores: Record<string, number[]> = {};
  
  talents.forEach(t => {
    if (!axisScores[t.axis]) {
      axisScores[t.axis] = [];
    }
    axisScores[t.axis].push(t.percentage);
  });

  const axisAverages = Object.entries(axisScores).map(([axis, scores]) => ({
    axis,
    average: scores.reduce((sum, s) => sum + s, 0) / scores.length,
  })).sort((a, b) => b.average - a.average);

  return axisAverages;
}

export default function TalentWheel({ scores, printMode = false, showFullLabels = false, modelType, centerText, summaryText, minimal = false }: Props) {
  const talents = useMemo(() => {
    return TALENT_ORDER.map((talentId) => {
      const scoreData = scores.find((s) => s.talentId === talentId);
      const config = TALENT_CONFIG[talentId];
      const talent = TALENTS.find(t => t.id === talentId);
      const score = toSafeNumber(scoreData?.score, 0);
      const maxScore = toSafeNumber(scoreData?.max, 15);
      const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
      const fullTitle = talent?.reportTitle || getTalentTitle(talentId);
      const [line1, line2] = splitTalentTitle(fullTitle);

      let symbol: string;
      if (modelType === 'genotipo') {
        symbol = GENOTIPO_SYMBOLS[talentId] ?? config.symbol;
      } else if (modelType === 'neurotalento') {
        symbol = NEUROTALENTO_SYMBOLS[talentId] ?? config.symbol;
      } else {
        symbol = config.symbol;
      }
      
      return {
        id: talentId,
        title: fullTitle,
        titleLine1: line1,
        titleLine2: line2,
        symbol,
        score,
        maxScore,
        percentage,
        color: config.color,
        secondaryColor: config.secondaryColor,
        axis: config.axis,
      };
    });
  }, [scores, modelType]);

  const professionalProfile = useMemo(() => calculateProfessionalProfile(talents), [talents]);

  const size = 640;
  const center = size / 2;
  const radius = 206;
  const innerRadius = 72;

  const sections = talents.map((talent, index) => {
    const anglePerSection = (Math.PI * 2) / 8;
    const startAngle = index * anglePerSection - Math.PI / 2;
    const endAngle = startAngle + anglePerSection;
    const fillPercentage = talent.percentage / 100;
    const fillRadius = innerRadius + (radius - innerRadius) * fillPercentage;

    return {
      talent,
      startAngle,
      endAngle,
      fillRadius,
      fillPercentage,
    };
  });

  const polarToCartesian = (angle: number, r: number) => {
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const createArcPath = (startAngle: number, endAngle: number, outerR: number, innerR: number) => {
    const start = polarToCartesian(startAngle, outerR);
    const end = polarToCartesian(endAngle, outerR);
    const innerStart = polarToCartesian(startAngle, innerR);
    const innerEnd = polarToCartesian(endAngle, innerR);
    const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;

    return [
      `M ${start.x} ${start.y}`,
      `A ${outerR} ${outerR} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`,
      `L ${innerEnd.x} ${innerEnd.y}`,
      `A ${innerR} ${innerR} 0 ${largeArcFlag} 0 ${innerStart.x} ${innerStart.y}`,
      `Z`,
    ].join(" ");
  };

  const displayCenterText = centerText || (modelType === 'genotipo' ? 'Talentos' : modelType === 'neurotalento' ? 'Neurotalento' : 'Talentos');

  return (
    <div className="flex flex-col items-center gap-8 print:gap-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="max-w-full h-auto print:max-w-[500px]">
        <defs>
          {sections.map(({ talent, fillPercentage }) => (
            <radialGradient
              key={`gradient-${talent.id}`}
              id={`gradient-${talent.id}`}
              cx="50%"
              cy="50%"
            >
              <stop offset="0%" stopColor={talent.color} stopOpacity={Math.min(fillPercentage * 1.2, 1)} />
              <stop offset={`${fillPercentage * 100}%`} stopColor={talent.color} stopOpacity={0.6} />
              <stop offset="100%" stopColor={talent.color} stopOpacity={0.1} />
            </radialGradient>
          ))}
        </defs>

        <line x1={center} y1={center - radius} x2={center} y2={center + radius} stroke="#000" strokeWidth="2" />
        <line x1={center - radius} y1={center} x2={center + radius} y2={center} stroke="#000" strokeWidth="2" />

        {[1, 3, 5, 7].map((index) => {
          const angle = (index * Math.PI * 2) / 8 - Math.PI / 2;
          const outer = polarToCartesian(angle, radius);
          return (
            <line
              key={`divider-${index}`}
              x1={center}
              y1={center}
              x2={outer.x}
              y2={outer.y}
              stroke="#666"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          );
        })}

        {sections.map(({ talent, startAngle, endAngle, fillRadius }) => {
          const midAngle = (startAngle + endAngle) / 2;
          const labelDistance = showFullLabels ? radius + 26 : radius + 40;
          const labelPos = polarToCartesian(midAngle, labelDistance);
          const percentPos = polarToCartesian(midAngle, (fillRadius + innerRadius) / 2);

          return (
            <g key={talent.id}>
              <path
                d={createArcPath(startAngle, endAngle, fillRadius, innerRadius)}
                fill={`url(#gradient-${talent.id})`}
                stroke={talent.color}
                strokeWidth="1"
              />

              <path
                d={createArcPath(startAngle, endAngle, radius, innerRadius)}
                fill="none"
                stroke={talent.color}
                strokeWidth="2"
                opacity="0.3"
              />

              {talent.percentage > 15 && (
                <text
                  x={percentPos.x}
                  y={percentPos.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="16"
                  fontWeight="bold"
                  fill="white"
                  style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
                >
                  {talent.percentage}
                </text>
              )}

              <text
                x={labelPos.x}
                y={labelPos.y - (showFullLabels ? 14 : 0)}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="14"
                fontWeight="700"
                fill={talent.color}
              >
                {talent.symbol}
              </text>

              {showFullLabels && (
                <g>
                  <text
                    x={labelPos.x}
                    y={labelPos.y + 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="10"
                    fontWeight="600"
                    fill="#111111"
                  >
                    {talent.titleLine1}
                  </text>
                  {talent.titleLine2 ? (
                    <text
                      x={labelPos.x}
                      y={labelPos.y + 14}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="10"
                      fontWeight="600"
                      fill="#111111"
                    >
                      {talent.titleLine2}
                    </text>
                  ) : null}
                </g>
              )}
            </g>
          );
        })}

        <rect x={center - 70} y={8} width={140} height={24} fill="white" opacity={1} />
        <rect x={0} y={center - 12} width={112} height={24} fill="white" opacity={1} />
        <rect x={size - 112} y={center - 12} width={112} height={24} fill="white" opacity={1} />
        <rect x={center - 84} y={size - 34} width={168} height={26} fill="white" opacity={1} />

        <circle cx={center} cy={center} r={innerRadius} fill="white" stroke="#000" strokeWidth="2" />
        <text
          x={center}
          y={center}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={displayCenterText.length > 10 ? "12" : "16"}
          fontWeight="600"
          fill="#666"
        >
          {displayCenterText}
        </text>
      </svg>

      {/* Curved summary banner */}
      {summaryText && summaryText.trim() && (
        <div
          style={{
            width: '100%',
            maxWidth: '700px',
            margin: '20px auto',
            padding: '20px 30px',
            background: '#000',
            color: '#fff',
            borderRadius: '60px',
            fontSize: '14px',
            lineHeight: '1.6',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          {summaryText}
        </div>
      )}

      {!minimal && professionalProfile.length > 0 && (
        <div className="w-full max-w-2xl print:max-w-full mb-6">
          <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3 print:text-black">Perfil profesional</h3>
          <div className="flex flex-wrap gap-2">
            {professionalProfile.map((axis, idx) => (
              <div
                key={axis.axis}
                className="px-4 py-2 rounded-lg border-2 font-semibold text-sm"
                style={{
                  borderColor: idx === 0 ? '#10B981' : '#e5e7eb',
                  backgroundColor: idx === 0 ? '#f0fdf4' : 'white',
                  color: idx === 0 ? '#10B981' : '#6b7280',
                }}
              >
                {axis.axis} ({Math.round(axis.average)})
              </div>
            ))}
          </div>
        </div>
      )}

      {!minimal && <div className="w-full max-w-2xl print:max-w-full">
        <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3 print:text-black">Detalle por talento</h3>
        <div className="grid gap-2 print:gap-1">
          {talents.map((t) => {
            const isDanger = t.percentage > 67;
            const textColor = isDanger ? '#DC2626' : '#000000';
            const barColor = isDanger ? '#DC2626' : '#111111';
            
            return (
              <div key={t.id} className="flex items-center justify-between p-3 rounded-lg border border-[var(--border)] bg-[var(--card)] print:border-gray-300 print:bg-white print:p-2">
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-2xl print:text-xl font-bold" style={{ color: t.color }}>
                    {t.symbol}
                  </span>
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
      </div>}
    </div>
  );
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
  return titles[id] || "";
}

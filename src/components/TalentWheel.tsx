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
};

// Configuración de talentos según el diagrama adjunto
const TALENT_CONFIG: Record<number, { symbol: string; color: string; secondaryColor: string; axis: string }> = {
  2: { symbol: "Π", color: "#8B5CF6", secondaryColor: "#A78BFA", axis: "Conocimiento" },
  3: { symbol: "Ψ", color: "#7C3AED", secondaryColor: "#8B5CF6", axis: "Conocimiento" },
  5: { symbol: "Ω", color: "#F59E0B", secondaryColor: "#FBBF24", axis: "Entrega" },
  7: { symbol: "Θ", color: "#10B981", secondaryColor: "#34D399", axis: "Imaginación" },
  6: { symbol: "Φ", color: "#06B6D4", secondaryColor: "#22D3EE", axis: "Imaginación" },
  8: { symbol: "▭", color: "#D97706", secondaryColor: "#F59E0B", axis: "Desempeño" },
  1: { symbol: "Δ", color: "#DC2626", secondaryColor: "#EF4444", axis: "Acción" },
  4: { symbol: "Α", color: "#EF4444", secondaryColor: "#F87171", axis: "Acción" },
};

// Orden exacto del diagrama (sentido horario desde arriba)
const TALENT_ORDER = [2, 3, 5, 7, 6, 8, 1, 4];

function toSafeNumber(value: any, fallback: number = 0): number {
  if (typeof value === 'number' && !isNaN(value)) return value;
  return fallback;
}

export default function TalentWheel({ scores, printMode = false, showFullLabels = false }: Props) {
  const talents = useMemo(() => {
    return TALENT_ORDER.map((talentId) => {
      const scoreData = scores.find((s) => s.talentId === talentId);
      const config = TALENT_CONFIG[talentId];
      const talent = TALENTS.find(t => t.id === talentId);
      const score = toSafeNumber(scoreData?.score, 0);
      const maxScore = toSafeNumber(scoreData?.max, 15);
      const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
      
      return {
        id: talentId,
        title: talent?.reportTitle || getTalentTitle(talentId),
        symbol: config.symbol,
        score,
        maxScore,
        percentage,
        color: config.color,
        secondaryColor: config.secondaryColor,
        axis: config.axis,
      };
    });
  }, [scores]);

  const size = 700;
  const center = size / 2;
  const radius = 260;
  const innerRadius = 80;

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

  return (
    <div className="flex flex-col items-center gap-8 print:gap-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="max-w-full h-auto print:max-w-[550px]">
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

        {/* Líneas separadoras principales */}
        <line x1={center} y1={center - radius} x2={center} y2={center + radius} stroke="#000" strokeWidth="2" />
        <line x1={center - radius} y1={center} x2={center + radius} y2={center} stroke="#000" strokeWidth="2" />

        {/* Líneas diagonales */}
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

        {/* Secciones de talentos */}
        {sections.map(({ talent, startAngle, endAngle, fillRadius }) => {
          const midAngle = (startAngle + endAngle) / 2;
          const labelDistance = showFullLabels ? radius + 80 : radius + 50;
          const labelPos = polarToCartesian(midAngle, labelDistance);
          const percentPos = polarToCartesian(midAngle, (fillRadius + innerRadius) / 2);

          return (
            <g key={talent.id}>
              {/* Área sombreada según puntuación */}
              <path
                d={createArcPath(startAngle, endAngle, fillRadius, innerRadius)}
                fill={`url(#gradient-${talent.id})`}
                stroke={talent.color}
                strokeWidth="1"
              />

              {/* Borde exterior completo */}
              <path
                d={createArcPath(startAngle, endAngle, radius, innerRadius)}
                fill="none"
                stroke={talent.color}
                strokeWidth="2"
                opacity="0.3"
              />

              {/* Porcentaje dentro de la sección */}
              {talent.percentage > 15 && (
                <text
                  x={percentPos.x}
                  y={percentPos.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="18"
                  fontWeight="bold"
                  fill="white"
                  style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
                >
                  {talent.percentage}%
                </text>
              )}

              {/* Etiqueta con símbolo y nombre */}
              <text
                x={labelPos.x}
                y={labelPos.y - (showFullLabels ? 12 : 0)}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="24"
                fontWeight="bold"
                fill={talent.color}
              >
                {talent.symbol}
              </text>
              {showFullLabels && (
                <text
                  x={labelPos.x}
                  y={labelPos.y + 16}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="13"
                  fontWeight="600"
                  fill="#333"
                  className="print:text-xs"
                >
                  {talent.title}
                </text>
              )}
            </g>
          );
        })}

        {/* Centro */}
        <circle cx={center} cy={center} r={innerRadius} fill="white" stroke="#000" strokeWidth="2" />
        <text
          x={center}
          y={center}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="16"
          fontWeight="600"
          fill="#666"
        >
          Talentos
        </text>
      </svg>

      {!showFullLabels && (
        <>
          {/* Leyenda de ejes */}
          <div className="w-full max-w-2xl print:max-w-full">
            <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3 print:text-black">Ejes neurocognitivos</h3>
            <div className="grid grid-cols-2 gap-3 text-xs print:grid-cols-3 print:gap-2">
              {[
                { axis: "Acción", description: "Control y resultados", color: "#EF4444" },
                { axis: "Conocimiento", description: "Ciencia aplicada", color: "#8B5CF6" },
                { axis: "Imaginación", description: "Arte", color: "#06B6D4" },
                { axis: "Desempeño", description: "Servicio y estabilidad", color: "#F59E0B" },
                { axis: "Entrega", description: "Conexión humana", color: "#F59E0B" },
              ].map((cat) => (
                <div key={cat.axis} className="flex items-start gap-2 p-2 rounded border border-[var(--border)] print:border-gray-300">
                  <div className="w-3 h-3 rounded-full mt-0.5" style={{ backgroundColor: cat.color }} />
                  <div>
                    <div className="font-semibold text-[var(--foreground)] print:text-black">{cat.axis}</div>
                    <div className="text-[var(--muted-foreground)] print:text-gray-600">{cat.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lista de talentos con porcentajes */}
          <div className="w-full max-w-2xl print:max-w-full">
            <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3 print:text-black">Detalle por talento</h3>
            <div className="grid gap-2 print:gap-1">
              {talents.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-lg border border-[var(--border)] bg-[var(--card)] print:border-gray-300 print:bg-white print:p-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl print:text-xl" style={{ color: t.color }}>
                      {t.symbol}
                    </span>
                    <div>
                      <div className="font-semibold text-sm text-[var(--foreground)] print:text-black">{t.title}</div>
                      <div className="text-xs text-[var(--muted-foreground)] print:text-gray-600">{t.axis}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg print:text-base" style={{ color: t.color }}>
                      {t.percentage}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function getTalentTitle(id: number): string {
  const titles: Record<number, string> = {
    1: "Estrategia y comunicación",
    2: "Analítico y riguroso",
    3: "Acompañamiento y docencia",
    4: "Gestión y organización",
    5: "Empático y compasivo",
    6: "Imaginación y creatividad",
    7: "Profundo e introspectivo",
    8: "Aplicado y cooperador",
  };
  return titles[id] || "";
}

"use client";

import { useMemo } from "react";
import { TALENTS, WHEEL_ORDER } from "@/lib/talents";

type Props = {
  scores: Array<{
    talentId: number;
    score: number;
    max: number;
  }>;
};

// Configuración de talentos según el diagrama
const TALENT_CONFIG: Record<
  number,
  { symbol: string; color: string; secondaryColor: string; position: string }
> = {
  4: { symbol: "Α", color: "#EF4444", secondaryColor: "#F87171", position: "Acción" }, // ALFA - Arriba
  1: { symbol: "Δ", color: "#DC2626", secondaryColor: "#EF4444", position: "Resultados" }, // DELTA - Derecha arriba
  6: { symbol: "Φ", color: "#06B6D4", secondaryColor: "#22D3EE", position: "Imaginación" }, // FI - Derecha abajo
  7: { symbol: "Θ", color: "#10B981", secondaryColor: "#34D399", position: "Arte" }, // THETA - Abajo
  5: { symbol: "Ω", color: "#F59E0B", secondaryColor: "#FBBF24", position: "Entrega" }, // OMEGA - Izquierda abajo
  8: { symbol: "▭", color: "#D97706", secondaryColor: "#F59E0B", position: "Servicio" }, // MEANDRO - Izquierda centro
  3: { symbol: "Ψ", color: "#7C3AED", secondaryColor: "#8B5CF6", position: "Conocimiento" }, // PSI - Izquierda arriba
  2: { symbol: "Π", color: "#8B5CF6", secondaryColor: "#A78BFA", position: "Ciencia aplicada" }, // PI - Arriba izquierda
};

function toSafeNumber(value: any, fallback: number = 0): number {
  if (typeof value === "number" && !isNaN(value)) return value;
  return fallback;
}

function getTalentLabel(talentId: number): string {
  const talent = TALENTS.find((t) => t.id === talentId);
  return talent?.wheelLabel || "";
}

export default function TalentWheel({ scores }: Props) {
  const talents = useMemo(() => {
    return WHEEL_ORDER.map((talentId) => {
      const scoreData = scores.find((s) => s.talentId === talentId);
      const config = TALENT_CONFIG[talentId];
      const score = toSafeNumber(scoreData?.score, 0);
      const max = toSafeNumber(scoreData?.max, 15);
      const percentage = max > 0 ? Math.round((score / max) * 100) : 0;

      return {
        id: talentId,
        label: getTalentLabel(talentId),
        symbol: config.symbol,
        score,
        maxScore: max,
        percentage,
        color: config.color,
        secondaryColor: config.secondaryColor,
        position: config.position,
      };
    });
  }, [scores]);

  const size = 600;
  const center = size / 2;
  const radius = 240;
  const innerRadius = 60;

  // Calcular secciones (8 partes)
  const sections = talents.map((talent, index) => {
    const anglePerSection = (Math.PI * 2) / 8;
    const startAngle = index * anglePerSection - Math.PI / 2; // Empezar desde arriba
    const endAngle = startAngle + anglePerSection;

    // Calcular porcentaje de sombreado (0-1)
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

  const createArcPath = (
    startAngle: number,
    endAngle: number,
    outerR: number,
    innerR: number
  ) => {
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
    <div className="flex flex-col items-center gap-8">
      {/* Mapa circular */}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="max-w-full h-auto"
      >
        <defs>
          {sections.map(({ talent, fillPercentage }) => (
            <radialGradient
              key={`gradient-${talent.id}`}
              id={`gradient-${talent.id}`}
              cx="50%"
              cy="50%"
            >
              <stop
                offset="0%"
                stopColor={talent.color}
                stopOpacity={Math.min(fillPercentage * 1.2, 1)}
              />
              <stop
                offset={`${fillPercentage * 100}%`}
                stopColor={talent.color}
                stopOpacity={0.6}
              />
              <stop offset="100%" stopColor={talent.color} stopOpacity={0.1} />
            </radialGradient>
          ))}
        </defs>

        {/* Líneas separadoras principales (cruz) */}
        <line
          x1={center}
          y1={center - radius}
          x2={center}
          y2={center + radius}
          stroke="#000"
          strokeWidth="2"
        />
        <line
          x1={center - radius}
          y1={center}
          x2={center + radius}
          y2={center}
          stroke="#000"
          strokeWidth="2"
        />

        {/* Líneas separadoras secundarias (diagonales) */}
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
          const labelPos = polarToCartesian(midAngle, radius + 40);

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

              {/* Etiqueta con símbolo */}
              <text
                x={labelPos.x}
                y={labelPos.y - 8}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-lg font-bold"
                fill={talent.color}
              >
                {talent.symbol}
              </text>
              {/* Porcentaje */}
              <text
                x={labelPos.x}
                y={labelPos.y + 10}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xs font-semibold"
                fill={talent.color}
              >
                {talent.percentage}%
              </text>
            </g>
          );
        })}

        {/* Centro con título */}
        <circle
          cx={center}
          cy={center}
          r={innerRadius}
          fill="white"
          stroke="#000"
          strokeWidth="2"
        />
        <text
          x={center}
          y={center}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-xs font-semibold"
          fill="#333"
        >
          Mapa de
        </text>
        <text
          x={center}
          y={center + 14}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-xs font-semibold"
          fill="#333"
        >
          Talentos
        </text>
      </svg>

      {/* Leyenda de áreas */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        {[
          { category: "Acción", color: "#EF4444" },
          { category: "Resultados", color: "#DC2626" },
          { category: "Imaginación", color: "#06B6D4" },
          { category: "Arte", color: "#10B981" },
          { category: "Entrega", color: "#F59E0B" },
          { category: "Servicio", color: "#D97706" },
          { category: "Conocimiento", color: "#7C3AED" },
          { category: "Ciencia aplicada", color: "#8B5CF6" },
        ].map((cat) => (
          <div key={cat.category} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: cat.color }}
            />
            <div className="font-medium text-xs">{cat.category}</div>
          </div>
        ))}
      </div>

      {/* Lista de talentos con barras de progreso */}
      <div className="w-full max-w-2xl space-y-3">
        <h3 className="text-lg font-semibold text-center mb-4">Puntuación por talento</h3>
        {talents.map((t) => (
          <div
            key={t.id}
            className="p-4 rounded-xl border border-zinc-200 bg-white shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="text-2xl" style={{ color: t.color }}>
                  {t.symbol}
                </span>
                <div>
                  <div className="font-semibold text-sm">{t.label}</div>
                  <div className="text-xs text-zinc-500">{t.position}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold" style={{ color: t.color }}>
                  {t.percentage}%
                </div>
              </div>
            </div>
            {/* Barra de progreso */}
            <div className="w-full h-3 bg-zinc-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${t.percentage}%`,
                  backgroundColor: t.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

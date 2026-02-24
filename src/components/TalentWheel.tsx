"use client";

import { useMemo } from "react";

type TalentScore = {
  id: number;
  code: string;
  title: string;
  symbol: string;
  score: number;
  maxScore: number;
  color: string;
  secondaryColor: string;
  category: string;
  categoryLabel: string;
};

type Props = {
  scores: Array<{
    talentId: number;
    score: number;
    max: number;
  }>;
};

// Configuración de talentos según el diagrama
const TALENT_CONFIG: Record<number, { symbol: string; color: string; secondaryColor: string; category: string; categoryLabel: string }> = {
  2: { symbol: "Π", color: "#8B5CF6", secondaryColor: "#A78BFA", category: "Conocimiento", categoryLabel: "Ciencia aplicada" },
  3: { symbol: "Ψ", color: "#7C3AED", secondaryColor: "#8B5CF6", category: "Conocimiento", categoryLabel: "Ciencia aplicada" },
  5: { symbol: "Ω", color: "#F59E0B", secondaryColor: "#FBBF24", category: "Desempeño", categoryLabel: "Energía" },
  7: { symbol: "Θ", color: "#10B981", secondaryColor: "#34D399", category: "Imaginación", categoryLabel: "Arte" },
  4: { symbol: "Α", color: "#EF4444", secondaryColor: "#F87171", category: "Acción", categoryLabel: "Resultados" },
  1: { symbol: "Δ", color: "#DC2626", secondaryColor: "#EF4444", category: "Acción", categoryLabel: "Resultados" },
  6: { symbol: "Φ", color: "#06B6D4", secondaryColor: "#22D3EE", category: "Imaginación", categoryLabel: "Arte" },
  8: { symbol: "▭", color: "#D97706", secondaryColor: "#F59E0B", category: "Desempeño", categoryLabel: "Energía" },
};

// Orden exacto del diagrama (sentido horario desde arriba)
const TALENT_ORDER = [2, 3, 5, 7, 6, 8, 1, 4];

export default function TalentWheel({ scores }: Props) {
  const talents = useMemo(() => {
    return TALENT_ORDER.map((talentId) => {
      const scoreData = scores.find((s) => s.talentId === talentId);
      const config = TALENT_CONFIG[talentId];
      
      return {
        id: talentId,
        code: `T${talentId}`,
        title: getTalentTitle(talentId),
        symbol: config.symbol,
        score: scoreData?.score ?? 0,
        maxScore: scoreData?.max ?? 15,
        color: config.color,
        secondaryColor: config.secondaryColor,
        category: config.category,
        categoryLabel: config.categoryLabel,
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
    const fillPercentage = talent.score / talent.maxScore;
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
    <div className="flex flex-col items-center gap-8">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="max-w-full h-auto">
        <defs>
          {/* Gradientes radiales para cada talento */}
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

        {/* Líneas separadoras secundarias (diagonales sutiles) */}
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
          const labelPos = polarToCartesian(midAngle, radius + 30);

          return (
            <g key={talent.id}>
              {/* Área sombreada según puntuación */}
              <path
                d={createArcPath(startAngle, endAngle, fillRadius, innerRadius)}
                fill={`url(#gradient-${talent.id})`}
                stroke={talent.color}
                strokeWidth="1"
              />

              {/* Borde exterior (siempre visible) */}
              <path
                d={createArcPath(startAngle, endAngle, radius, fillRadius > innerRadius ? fillRadius : innerRadius)}
                fill="none"
                stroke={talent.color}
                strokeWidth="2"
                opacity="0.3"
              />

              {/* Etiqueta con símbolo y código */}
              <text
                x={labelPos.x}
                y={labelPos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-sm font-bold"
                fill={talent.color}
              >
                {talent.symbol}
              </text>
              <text
                x={labelPos.x}
                y={labelPos.y + 16}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xs"
                fill="#666"
              >
                {talent.code}
              </text>
            </g>
          );
        })}

        {/* Centro */}
        <circle cx={center} cy={center} r={innerRadius} fill="white" stroke="#000" strokeWidth="2" />
      </svg>

      {/* Leyenda de categorías */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        {[
          { category: "Acción", label: "Resultados", color: "#EF4444" },
          { category: "Conocimiento", label: "Ciencia aplicada", color: "#8B5CF6" },
          { category: "Imaginación", label: "Arte", color: "#06B6D4" },
          { category: "Desempeño", label: "Energía", color: "#F59E0B" },
        ].map((cat) => (
          <div key={cat.category} className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: cat.color }} />
            <div>
              <div className="font-semibold">{cat.category}</div>
              <div className="text-xs text-zinc-600">{cat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Lista de talentos con puntuaciones */}
      <div className="w-full max-w-md space-y-2">
        {talents.map((t) => (
          <div key={t.id} className="flex items-center justify-between p-3 rounded-lg border border-zinc-200">
            <div className="flex items-center gap-3">
              <span className="text-2xl" style={{ color: t.color }}>
                {t.symbol}
              </span>
              <div>
                <div className="font-semibold text-sm">{t.title}</div>
                <div className="text-xs text-zinc-500">{t.code}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold" style={{ color: t.color }}>
                {t.score}
              </div>
              <div className="text-xs text-zinc-500">/ {t.maxScore}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function getTalentTitle(id: number): string {
  const titles: Record<number, string> = {
    1: "Estrategia",
    2: "Saber",
    3: "Instruir",
    4: "Control",
    5: "Trascender",
    6: "Creatividad",
    7: "Introspección",
    8: "Hacer",
  };
  return titles[id] || "";
}

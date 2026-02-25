/**
 * Genera HTML del mapa de talentos para exportar a PDF
 * Incluye etiquetas externas y leyenda completa
 */

type ScoreRow = { talentId: number; score: number; max: number };

const TALENT_CONFIG: Record<number, { symbol: string; color: string; secondaryColor: string; category: string; categoryLabel: string; title: string }> = {
  2: { symbol: "Π", color: "#8B5CF6", secondaryColor: "#A78BFA", category: "Conocimiento", categoryLabel: "Ciencia aplicada", title: "Saber" },
  3: { symbol: "Ψ", color: "#7C3AED", secondaryColor: "#8B5CF6", category: "Conocimiento", categoryLabel: "Ciencia aplicada", title: "Instruir" },
  5: { symbol: "Ω", color: "#F59E0B", secondaryColor: "#FBBF24", category: "Desempeño", categoryLabel: "Energía", title: "Trascender" },
  7: { symbol: "Θ", color: "#10B981", secondaryColor: "#34D399", category: "Imaginación", categoryLabel: "Arte", title: "Introspección" },
  4: { symbol: "Α", color: "#EF4444", secondaryColor: "#F87171", category: "Acción", categoryLabel: "Resultados", title: "Control" },
  1: { symbol: "Δ", color: "#DC2626", secondaryColor: "#EF4444", category: "Acción", categoryLabel: "Resultados", title: "Estrategia" },
  6: { symbol: "Φ", color: "#06B6D4", secondaryColor: "#22D3EE", category: "Imaginación", categoryLabel: "Arte", title: "Creatividad" },
  8: { symbol: "▭", color: "#D97706", secondaryColor: "#F59E0B", category: "Desempeño", categoryLabel: "Energía", title: "Hacer" },
};

const TALENT_ORDER = [2, 3, 5, 7, 6, 8, 1, 4];

export function generateMapHTML({
  nombre,
  apellido,
  fecha,
  scores,
}: {
  nombre: string;
  apellido: string;
  fecha: string;
  scores: ScoreRow[];
}): string {
  const size = 600;
  const center = size / 2;
  const radius = 240;
  const innerRadius = 60;

  const talents = TALENT_ORDER.map((talentId) => {
    const scoreData = scores.find((s) => s.talentId === talentId);
    const config = TALENT_CONFIG[talentId];
    const score = scoreData?.score ?? 0;
    const maxScore = scoreData?.max ?? 15;
    const fillPercentage = maxScore > 0 ? score / maxScore : 0;
    const fillRadius = innerRadius + (radius - innerRadius) * fillPercentage;

    return {
      id: talentId,
      code: `T${talentId}`,
      symbol: config.symbol,
      title: config.title,
      score,
      maxScore,
      color: config.color,
      category: config.category,
      categoryLabel: config.categoryLabel,
      fillRadius,
      fillPercentage,
    };
  });

  const sections = talents.map((talent, index) => {
    const anglePerSection = (Math.PI * 2) / 8;
    const startAngle = index * anglePerSection - Math.PI / 2;
    const endAngle = startAngle + anglePerSection;

    return {
      talent,
      startAngle,
      endAngle,
    };
  });

  const polarToCartesian = (angle: number, r: number) => ({
    x: center + r * Math.cos(angle),
    y: center + r * Math.sin(angle),
  });

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

  // Generar gradientes
  const gradients = sections
    .map(
      ({ talent }) => `
    <radialGradient id="gradient-${talent.id}" cx="50%" cy="50%">
      <stop offset="0%" stop-color="${talent.color}" stop-opacity="${Math.min(talent.fillPercentage * 1.2, 1)}" />
      <stop offset="${talent.fillPercentage * 100}%" stop-color="${talent.color}" stop-opacity="0.6" />
      <stop offset="100%" stop-color="${talent.color}" stop-opacity="0.1" />
    </radialGradient>`
    )
    .join("\n");

  // Generar secciones del mapa
  const sectionsMarkup = sections
    .map(({ talent, startAngle, endAngle }) => {
      const midAngle = (startAngle + endAngle) / 2;
      const labelPos = polarToCartesian(midAngle, radius + 40);

      return `
      <g>
        <path
          d="${createArcPath(startAngle, endAngle, talent.fillRadius, innerRadius)}"
          fill="url(#gradient-${talent.id})"
          stroke="${talent.color}"
          stroke-width="1"
        />
        <path
          d="${createArcPath(startAngle, endAngle, radius, innerRadius)}"
          fill="none"
          stroke="${talent.color}"
          stroke-width="2"
          opacity="0.3"
        />
        <text
          x="${labelPos.x}"
          y="${labelPos.y - 12}"
          text-anchor="middle"
          dominant-baseline="middle"
          font-size="28"
          font-weight="bold"
          fill="${talent.color}"
        >${talent.symbol}</text>
        <text
          x="${labelPos.x}"
          y="${labelPos.y + 12}"
          text-anchor="middle"
          dominant-baseline="middle"
          font-size="11"
          fill="#666"
          font-weight="600"
        >${talent.code}</text>
      </g>`;
    })
    .join("\n");

  // Generar líneas divisorias
  const mainLines = `
    <line x1="${center}" y1="${center - radius}" x2="${center}" y2="${center + radius}" stroke="#000" stroke-width="2" />
    <line x1="${center - radius}" y1="${center}" x2="${center + radius}" y2="${center}" stroke="#000" stroke-width="2" />
  `;

  const diagonalLines = [1, 3, 5, 7]
    .map((index) => {
      const angle = (index * Math.PI * 2) / 8 - Math.PI / 2;
      const outer = polarToCartesian(angle, radius);
      return `<line x1="${center}" y1="${center}" x2="${outer.x}" y2="${outer.y}" stroke="#666" stroke-width="1" stroke-dasharray="4 4" />`;
    })
    .join("\n");

  const svgMarkup = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="max-width:100%;height:auto">
      <defs>
        ${gradients}
      </defs>
      ${mainLines}
      ${diagonalLines}
      ${sectionsMarkup}
      <circle cx="${center}" cy="${center}" r="${innerRadius}" fill="white" stroke="#000" stroke-width="2" />
    </svg>
  `;

  return `
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Mapa de Talentos - ${nombre} ${apellido}</title>
  <style>
    :root {
      --bg: #ffffff;
      --fg: #0b1220;
      --muted: #6b7280;
      --border: #e5e7eb;
      --accent: #0ea5e9;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Arial;
      color: var(--fg);
      background: var(--bg);
      padding: 0;
    }

    .page {
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      padding: 20mm 16mm;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .pill {
      display: inline-flex;
      align-items: center;
      border: 1px solid var(--border);
      border-radius: 999px;
      padding: 6px 12px;
      font-size: 12px;
      color: var(--muted);
      margin-bottom: 16px;
    }

    h1 {
      font-size: 32px;
      font-weight: 900;
      margin: 0 0 6px;
      text-align: center;
    }

    .date {
      font-size: 14px;
      color: var(--muted);
      margin-bottom: 24px;
      text-align: center;
    }

    .map-container {
      margin: 24px 0;
    }

    .legend {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      max-width: 500px;
      margin-top: 24px;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px;
      border: 1px solid var(--border);
      border-radius: 8px;
    }

    .legend-color {
      width: 18px;
      height: 18px;
      border-radius: 4px;
    }

    .legend-text {
      font-size: 13px;
    }

    .legend-label {
      font-weight: 800;
    }

    .legend-sub {
      color: var(--muted);
      font-size: 11px;
    }

    @media print {
      body {
        background: #fff;
      }
      .page {
        padding: 16mm;
      }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="pill">MAPA DE TALENTOS</div>
    
    <h1>${nombre} ${apellido}</h1>
    <div class="date">${fecha}</div>

    <div class="map-container">
      ${svgMarkup}
    </div>

    <div class="legend">
      <div class="legend-item">
        <div class="legend-color" style="background:#EF4444"></div>
        <div class="legend-text">
          <div class="legend-label">Acción</div>
          <div class="legend-sub">Resultados</div>
        </div>
      </div>
      
      <div class="legend-item">
        <div class="legend-color" style="background:#8B5CF6"></div>
        <div class="legend-text">
          <div class="legend-label">Conocimiento</div>
          <div class="legend-sub">Ciencia aplicada</div>
        </div>
      </div>
      
      <div class="legend-item">
        <div class="legend-color" style="background:#06B6D4"></div>
        <div class="legend-text">
          <div class="legend-label">Imaginación</div>
          <div class="legend-sub">Arte</div>
        </div>
      </div>
      
      <div class="legend-item">
        <div class="legend-color" style="background:#F59E0B"></div>
        <div class="legend-text">
          <div class="legend-label">Desempeño</div>
          <div class="legend-sub">Energía</div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

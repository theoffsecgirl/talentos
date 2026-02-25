/**
 * Genera HTML estático completo para el informe en PDF
 * Estilo basado en GenioTipo con descripciones neurocientíficas completas
 */

type TalentData = {
  id: number;
  code: string;
  symbol: string;
  quizTitle: string;
  reportTitle: string;
  reportSummary: string;
  fields: string;
  competencies: string;
  exampleRoles: string;
  color: string;
  axis: string;
};

type ScoreData = {
  talentId: number;
  score: number;
  max: number;
};

type PersonData = {
  nombre: string;
  apellido: string;
  email?: string;
  genero?: string;
  edad?: number;
};

type AnswersData = Record<string, number>;

// Descripciones completas de ejes (tipo GenioTipo)
const AXIS_DESCRIPTIONS: Record<string, { title: string; description: string; color: string }> = {
  "Acción": {
    title: "EJE ACCIÓN",
    description: "El eje del talento de Acción se relaciona con la razón y el control. Predomina el enfoque mental en la forma de funcionar. Destaca la capacidad de las personas de gestionar y organizar los recursos, de dirigir o ser dirigidas. Capacidad analítica y práctica de enfrentarse a los problemas. Importante la adquisición de conocimiento intelectual, el rigor científico, las evidencias, la responsabilidad y el compromiso en la realización de la tarea.",
    color: "#EF4444"
  },
  "Conocimiento": {
    title: "EJE CONOCIMIENTO",
    description: "El eje del talento de Conocimiento se relaciona con la investigación y la pasión por el descubrimiento. Es habitual que genere ideas innovadoras. Les atrae el mundo de la ciencia y la adquisición de conocimientos. Capacidad de estudio, curiosidad científica y deseo de saber. Rigor metodológico y enfoque sistemático para comprender el mundo.",
    color: "#8B5CF6"
  },
  "Imaginación": {
    title: "EJE IMAGINACIÓN",
    description: "El eje del talento de Imaginación se ubica entre los ámbitos de la emoción y la razón, buscando el equilibrio y la creatividad individual. La forma en que se conectan tiene que ver con la relación de las personas y las capacidades creativas aplicadas. Pasión por la creatividad, gran imaginación e inventiva aplicada a todos los ámbitos profesionales.",
    color: "#06B6D4"
  },
  "Desempeño": {
    title: "EJE DESEMPEÑO",
    description: "El eje del talento de Desempeño está relacionado con la capacidad de la persona para la intuición, la capacidad de relación con los demás y consigo mismo. Les interesa la trascendencia, el mundo de lo que no es tan evidente. Utilizan la intuición, la prospección y la percepción frente al análisis y la razón. Priorizan el bienestar de las personas y el acompañamiento.",
    color: "#F59E0B"
  }
};

// Descripciones tipo GenioTipo por talento
const TALENT_GENOTYPE_DATA: Record<number, {
  shape: string;
  geniusType: string;
  description: string;
  softSkills: {
    creativity: string;
    communication: string;
    emotionalIntelligence: string;
    leadership: string;
  };
}> = {
  1: {
    shape: "TRIÁNGULO",
    geniusType: "UN GENIO DE LA ESTRATEGIA Y LA COMUNICACIÓN",
    description: "Es habitual mostrar facilidad para la estrategia y el arte de la palabra, así como su divulgación. También, capacidad para vender, convencer y negociar.",
    softSkills: {
      creativity: "Crean utilizando todo tipo de estrategias para conseguir sus objetivos",
      communication: "Dominan la comunicación, la oratoria y el arte de la palabra",
      emotionalIntelligence: "Son especialistas en Inteligencia emocional y dominan las claves",
      leadership: "Lideran desde su habilidad comunicativa y generando conexión"
    }
  },
  2: {
    shape: "PENTÁGONO",
    geniusType: "UN GENIO ANALÍTICO Y RIGUROSO",
    description: "Muestran interés por la investigación y pasión por el descubrimiento. Es habitual que genere ideas innovadoras. Les atrae el mundo de la ciencia y la adquisición de conocimientos.",
    softSkills: {
      creativity: "Crean desde una base de conocimiento, estudian y exploran lo imposible",
      communication: "Se comunican con un lenguaje culto y técnico",
      emotionalIntelligence: "Conocen la inteligencia emocional, pero no les preocupa su aplicación",
      leadership: "Lideran desde el saber, la autoridad científica"
    }
  },
  3: {
    shape: "INFINITO",
    geniusType: "UN GENIO DEL ACOMPAÑAMIENTO",
    description: "Es frecuente la pasión por el saber y el conocimiento. Suele ser una persona expresiva y comunicativa, con capacidad de escucha y de visión crítica.",
    softSkills: {
      creativity: "Crean utilizando todo tipo de pensamiento, divergente o disruptivo",
      communication: "Dominan la comunicación y la oratoria para convencer y enseñar",
      emotionalIntelligence: "Son especialistas en Inteligencia emocional, empáticos y asertivos",
      leadership: "Lideran desde el comportamiento y son un ejemplo enriquecedor"
    }
  },
  4: {
    shape: "CUADRADO",
    geniusType: "UN GENIO DE LA GESTIÓN",
    description: "Suelen mostrar capacidad de gestión y organización, también, para seguir, proponer y dirigir retos. Pueden ser emprendedores y muestran iniciativas para conseguir sus objetivos.",
    softSkills: {
      creativity: "Crean desde una base analítica y de conocimiento previo, no imaginan",
      communication: "Se comunican de forma directa, breve, van al grano",
      emotionalIntelligence: "Conocen la inteligencia emocional, pero la razón va por delante de la emoción",
      leadership: "Lideran desde la jerarquía, les cuesta delegar y pueden ser inflexibles"
    }
  },
  5: {
    shape: "ROMBO",
    geniusType: "UN GENIO VISIONARIO E INNOVADOR",
    description: "Muestran mucha sensibilidad y profundidad en la forma de percibir el mundo. También destacan por tener una gran intuición. Suelen sentir atracción por temas ocultos o no evidentes y que requieren introspección, investigación o profundidad.",
    softSkills: {
      creativity: "Crean en zonas ocultas, profundas, a veces de difícil comprensión",
      communication: "Su comunicación es especial, necesita un nivel de conocimiento diferente",
      emotionalIntelligence: "Viven las emociones de una forma diferente y no son muy sociables",
      leadership: "Lideran desde la generación de estilos que cautivan a seguidores"
    }
  },
  6: {
    shape: "ELIPSE",
    geniusType: "UN GENIO DE LA IMAGINACIÓN",
    description: "Se caracteriza por su pasión por la creatividad y suele destacar por su gran imaginación e inventiva, aplicada a todos los ámbitos profesionales. Capacidades artísticas y creatividad aplicada.",
    softSkills: {
      creativity: "Crean constantemente en todas las facetas de la vida",
      communication: "Comunican desde el entusiasmo cuando visualizan oportunidades",
      emotionalIntelligence: "Los mueve la emoción pero no siempre son comprendidos en las ideas",
      leadership: "Lideran desde el contagio para conseguir nuevos objetivos"
    }
  },
  7: {
    shape: "CÍRCULO",
    geniusType: "UN GENIO EMPÁTICO Y COMPASIVO",
    description: "Suelen priorizar el bienestar de las personas, acompañarlas es una prioridad. Se caracterizan por su intuición y también por su compromiso y altruismo. Capacidad para comprender los sentimientos y resolver conflictos.",
    softSkills: {
      creativity: "Crean visualizando un mundo mejor, más justo y equitativo",
      communication: "Comunican estableciendo enlaces potentes",
      emotionalIntelligence: "Son especialistas en Inteligencia emocional, sobre todo intrapersonal",
      leadership: "Lideran siendo un referente, sabiendo escuchar, con el ejemplo"
    }
  },
  8: {
    shape: "RECTÁNGULO",
    geniusType: "UN GENIO APLICADO Y COOPERADOR",
    description: "Suelen demostrar facilidad de adaptación al trabajo rutinario, así como constancia y responsabilidad para cumplir retos y objetivos con una alta capacidad funcional.",
    softSkills: {
      creativity: "La creatividad no es su característica principal",
      communication: "Se comunican de forma clara y sin florituras",
      emotionalIntelligence: "No son expertos en inteligencia emocional, pero no generan conflicto",
      leadership: "Lideran desde el hacer, son un modelo y ejemplo de cumplimiento"
    }
  }
};

export function generateReportHTML({
  person,
  talents,
  scores,
  answers,
  mapSvg,
}: {
  person: PersonData;
  talents: TalentData[];
  scores: ScoreData[];
  answers: AnswersData;
  mapSvg: string;
}): string {
  // Ordenar scores de mayor a menor
  const sortedScores = [...scores].sort((a, b) => b.score - a.score);
  const top3 = sortedScores.slice(0, 3);

  // Crear mapa de talentos por ID
  const talentMap = new Map(talents.map((t) => [t.id, t]));

  // Función para calcular porcentaje
  const pct = (score: number, max: number) => {
    return max > 0 ? Math.round((score / max) * 100) : 0;
  };

  const currentDate = new Date().toISOString().split('T')[0];

  // Determinar eje dominante
  const axisScores = new Map<string, number>();
  for (const s of sortedScores) {
    const t = talentMap.get(s.talentId);
    if (!t) continue;
    const axis = t.axis || "Desconocido";
    axisScores.set(axis, (axisScores.get(axis) || 0) + s.score);
  }
  const dominantAxis = Array.from(axisScores.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || "Acción";

  return `
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${person.nombre} ${person.apellido} - Informe</title>
  <style>
    :root {
      --bg: #ffffff;
      --fg: #0b1220;
      --muted: #6b7280;
      --border: #e5e7eb;
      --accent: #0ea5e9;
      --danger: #ef4444;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Arial;
      color: var(--fg);
      background: var(--bg);
    }

    .page {
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      padding: 18mm 16mm;
      page-break-after: always;
    }

    .page:last-child {
      page-break-after: auto;
    }

    .h1 {
      font-size: 34px;
      line-height: 1.05;
      margin: 0 0 10px;
      font-weight: 900;
      letter-spacing: -0.02em;
    }

    .h2 {
      font-size: 20px;
      margin: 0 0 8px;
      font-weight: 800;
    }

    .h3 {
      font-size: 16px;
      margin: 0 0 6px;
      font-weight: 700;
    }

    .muted {
      color: var(--muted);
    }

    .card {
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 14px;
      background: #fff;
    }

    .grid {
      display: grid;
      gap: 12px;
    }

    .grid-2 {
      grid-template-columns: 1fr 1fr;
    }

    .grid-3 {
      grid-template-columns: 1fr 1fr 1fr;
    }

    .pill {
      display: inline-flex;
      align-items: center;
      border: 1px solid var(--border);
      border-radius: 999px;
      padding: 6px 10px;
      font-size: 12px;
      color: var(--muted);
    }

    .bar {
      height: 10px;
      border-radius: 999px;
      background: var(--border);
      overflow: hidden;
    }

    .bar span {
      display: block;
      height: 100%;
      background: var(--fg);
    }

    .bar.danger span {
      background: var(--danger);
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }

    th, td {
      border: 1px solid var(--border);
      padding: 8px;
      vertical-align: top;
    }

    th {
      background: #f8fafc;
      text-align: left;
    }

    .soft-skills-box {
      background: #f8fafc;
      border-left: 4px solid;
      padding: 12px;
      margin-top: 8px;
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

  <!-- PÁGINA 1: PORTADA -->
  <section class="page">
    <div class="pill">NEUROCIENCIA APLICADA · CONOCE TU TALENTO</div>
    
    <div style="display:flex;justify-content:space-between;gap:16px;margin-top:18px;align-items:flex-end;">
      <div>
        <h1 class="h1">${person.nombre} ${person.apellido}</h1>
        <div class="muted" style="margin-top:4px;font-size:14px;">${currentDate}</div>
      </div>
    </div>

    <div style="margin-top:32px;display:flex;justify-content:center;">
      ${mapSvg}
    </div>

    <div style="margin-top:24px;">
      <div class="h2">EJES DEL TALENTO</div>
      <div style="margin-top:12px;display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        ${[
          { label: 'Acción', sublabel: 'Resultados', color: '#EF4444' },
          { label: 'Conocimiento', sublabel: 'Ciencia aplicada', color: '#8B5CF6' },
          { label: 'Imaginación', sublabel: 'Arte', color: '#06B6D4' },
          { label: 'Desempeño', sublabel: 'Energía', color: '#F59E0B' }
        ].map(({ label, sublabel, color }) => `
          <div class="card">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
              <div style="width:16px;height:16px;border-radius:4px;background:${color};"></div>
              <div style="font-weight:900;font-size:13px;">${label}</div>
            </div>
            <div class="muted" style="font-size:11px;">${sublabel}</div>
          </div>
        `).join('')}
      </div>
    </div>
  </section>

  <!-- PÁGINA 2: TOP 3 TALENTOS -->
  <section class="page">
    <h2 class="h2">Tus 3 talentos más destacados</h2>
    
    <div class="grid" style="margin-top:14px;">
      ${top3.map((s, idx) => {
        const t = talentMap.get(s.talentId);
        if (!t) return '';
        const percentage = pct(s.score, s.max);
        const genoData = TALENT_GENOTYPE_DATA[t.id];
        
        return `
          <div class="card">
            <div style="display:flex;gap:12px;align-items:flex-start;">
              <div style="font-size:32px;color:${t.color};">${t.symbol}</div>
              <div style="flex:1;">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                  <span style="font-size:12px;font-weight:700;color:var(--muted);">${idx + 1}</span>
                  <span style="font-weight:900;font-size:16px;">${t.reportTitle}</span>
                </div>
                <div class="muted" style="font-size:11px;margin-bottom:4px;">${genoData?.shape || t.code} · ${genoData?.geniusType || ''}</div>
                <div class="muted" style="font-size:13px;line-height:1.5;">${t.reportSummary}</div>
                <div style="margin-top:8px;text-align:right;">
                  <span style="font-size:20px;font-weight:900;">${s.score}</span>
                  <span class="muted" style="font-size:12px;"> / ${s.max}</span>
                </div>
              </div>
            </div>
          </div>
        `;
      }).join('')}
    </div>

    <div style="margin-top:16px;" class="card">
      <div style="font-weight:900;margin-bottom:8px;">Listado completo de talentos</div>
      <table>
        <thead>
          <tr>
            <th>Símbolo</th>
            <th>Talento</th>
            <th>Código</th>
            <th>Puntuación</th>
          </tr>
        </thead>
        <tbody>
          ${sortedScores.map((s) => {
            const t = talentMap.get(s.talentId);
            if (!t) return '';
            return `
              <tr>
                <td style="text-align:center;font-size:20px;color:${t.color};">${t.symbol}</td>
                <td style="font-weight:700;">${t.reportTitle}</td>
                <td style="text-align:center;">${t.code}</td>
                <td style="text-align:center;font-weight:700;">${s.score} / ${s.max}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  </section>

  <!-- PÁGINA 3: PROFESIONES SUGERIDAS -->
  <section class="page">
    <h2 class="h2">Profesiones y roles sugeridos</h2>
    <div class="muted" style="font-size:13px;margin-bottom:12px;">Basado en tus talentos principales. Marca las opciones con las que te identificas:</div>
    
    <div class="card">
      ${top3.flatMap((s) => {
        const t = talentMap.get(s.talentId);
        if (!t) return [];
        const roles = t.exampleRoles?.split('\n').filter((x) => x.trim()) || [];
        return roles.map((role) => `
          <div style="padding:10px;border:1px solid var(--border);border-radius:8px;margin-bottom:8px;display:flex;align-items:center;gap:10px;">
            <div style="width:18px;height:18px;border:2px solid var(--muted);border-radius:4px;"></div>
            <div style="font-size:13px;">${role}</div>
          </div>
        `);
      }).join('')}
    </div>
  </section>

  <!-- PÁGINA 4: EJE DOMINANTE -->
  <section class="page">
    <div class="pill">EJES DEL TALENTO</div>
    <h2 class="h2" style="margin-top:12px;">${AXIS_DESCRIPTIONS[dominantAxis]?.title || 'TU EJE PRINCIPAL'}</h2>
    
    <div class="card" style="margin-top:14px;border-left:4px solid ${AXIS_DESCRIPTIONS[dominantAxis]?.color || '#000'};">
      <p style="font-size:14px;line-height:1.6;margin:0;">${AXIS_DESCRIPTIONS[dominantAxis]?.description || ''}</p>
    </div>

    <div style="margin-top:20px;">
      <h3 class="h3">Soft Skills - Competencias Personales</h3>
      <div class="grid grid-2" style="margin-top:10px;">
        <div class="card">
          <div style="font-weight:700;font-size:13px;margin-bottom:4px;">Creatividad</div>
          <div class="muted" style="font-size:12px;">Cómo generan ideas nuevas</div>
        </div>
        <div class="card">
          <div style="font-weight:700;font-size:13px;margin-bottom:4px;">Comunicación</div>
          <div class="muted" style="font-size:12px;">Estilo de transmisión de mensajes</div>
        </div>
        <div class="card">
          <div style="font-weight:700;font-size:13px;margin-bottom:4px;">Inteligencia Emocional</div>
          <div class="muted" style="font-size:12px;">Gestión de emociones propias y ajenas</div>
        </div>
        <div class="card">
          <div style="font-weight:700;font-size:13px;margin-bottom:4px;">Liderazgo</div>
          <div class="muted" style="font-size:12px;">Estilo de influencia y dirección</div>
        </div>
      </div>
    </div>
  </section>

  <!-- PÁGINAS INDIVIDUALES POR TALENTO -->
  ${sortedScores.map((s) => {
    const t = talentMap.get(s.talentId);
    if (!t) return '';
    const percentage = pct(s.score, s.max);
    const genoData = TALENT_GENOTYPE_DATA[t.id];
    
    const fieldsList = t.fields?.split('\n').filter((x) => x.trim()) || [];
    const competenciesList = t.competencies?.split('\n').filter((x) => x.trim()) || [];
    const rolesList = t.exampleRoles?.split('\n').filter((x) => x.trim()) || [];

    return `
  <section class="page">
    <div class="pill">${t.code} · ${t.symbol} · ${genoData?.shape || ''}</div>
    
    <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-end;margin-top:14px;">
      <div>
        <h2 class="h2">${t.reportTitle}</h2>
        <div class="muted" style="font-size:13px;">${genoData?.geniusType || t.axis || 'TALENTO'}</div>
      </div>
      <div style="text-align:right;">
        <div class="muted" style="font-size:12px;font-weight:700;">Puntuación</div>
        <div style="font-size:28px;font-weight:900;color:${t.color};">${s.score}</div>
        <div class="muted" style="font-size:12px;"> / ${s.max}</div>
      </div>
    </div>

    <div class="card" style="margin-top:14px;">
      <div style="font-weight:900;margin-bottom:6px;">Descripción</div>
      <div style="font-size:13px;" class="muted">${genoData?.description || t.reportSummary}</div>
    </div>

    <div class="grid grid-2" style="margin-top:12px;">
      ${fieldsList.length > 0 ? `
      <div class="card">
        <div style="font-weight:900;margin-bottom:8px;">Ámbitos profesionales</div>
        <ul style="margin:0;padding-left:18px;font-size:13px;" class="muted">
          ${fieldsList.map((f) => `<li>${f}</li>`).join('')}
        </ul>
      </div>
      ` : ''}
      
      ${competenciesList.length > 0 ? `
      <div class="card">
        <div style="font-weight:900;margin-bottom:8px;">Competencias personales</div>
        <ul style="margin:0;padding-left:18px;font-size:13px;" class="muted">
          ${competenciesList.map((c) => `<li>${c}</li>`).join('')}
        </ul>
      </div>
      ` : ''}
    </div>

    ${rolesList.length > 0 ? `
    <div class="card" style="margin-top:12px;">
      <div style="font-weight:900;margin-bottom:8px;">Roles y profesiones de ejemplo</div>
      <ul style="margin:0;padding-left:18px;font-size:13px;" class="muted">
        ${rolesList.map((r) => `<li>${r}</li>`).join('')}
      </ul>
    </div>
    ` : ''}

    ${genoData ? `
    <div style="margin-top:12px;">
      <div style="font-weight:900;margin-bottom:8px;">Soft Skills - Competencias Personales</div>
      <div class="soft-skills-box" style="border-color:${t.color};">
        <div style="margin-bottom:8px;">
          <div style="font-weight:700;font-size:12px;margin-bottom:2px;">Creatividad</div>
          <div style="font-size:12px;" class="muted">${genoData.softSkills.creativity}</div>
        </div>
        <div style="margin-bottom:8px;">
          <div style="font-weight:700;font-size:12px;margin-bottom:2px;">Comunicación</div>
          <div style="font-size:12px;" class="muted">${genoData.softSkills.communication}</div>
        </div>
        <div style="margin-bottom:8px;">
          <div style="font-weight:700;font-size:12px;margin-bottom:2px;">Inteligencia Emocional</div>
          <div style="font-size:12px;" class="muted">${genoData.softSkills.emotionalIntelligence}</div>
        </div>
        <div>
          <div style="font-weight:700;font-size:12px;margin-bottom:2px;">Liderazgo</div>
          <div style="font-size:12px;" class="muted">${genoData.softSkills.leadership}</div>
        </div>
      </div>
    </div>
    ` : ''}
  </section>
    `;
  }).join('')}

  <!-- PÁGINA FINAL: DETALLE DE RESPUESTAS -->
  <section class="page">
    <h2 class="h2">Detalle de respuestas</h2>
    <div class="muted" style="font-size:13px;">Escala 0–3. Marca X en la columna correspondiente.</div>
    
    <div class="card" style="margin-top:12px;">
      <div style="font-size:12px;font-weight:800;margin-bottom:8px;">ME GUSTAN LAS ACTIVIDADES O PIENSO EN UNA PROFESIÓN DONDE...</div>
      
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Afirmación</th>
            <th>0</th>
            <th>1</th>
            <th>2</th>
            <th>3</th>
          </tr>
        </thead>
        <tbody>
          ${Object.entries(answers).map(([qid, value]) => `
            <tr>
              <td style="width:64px;"><b>${qid}</b></td>
              <td>Pregunta ${qid}</td>
              ${[0, 1, 2, 3].map((v) => `
                <td style="width:40px;text-align:center;">${value === v ? 'X' : ''}</td>
              `).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  </section>

  <!-- PÁGINA RESUMEN FINAL -->
  <section class="page">
    <div class="pill">RESUMEN FINAL</div>
    <h2 class="h2" style="margin-top:12px;">${person.nombre} destaca principalmente por...</h2>
    
    <div class="card" style="margin-top:14px;border-left:4px solid ${AXIS_DESCRIPTIONS[dominantAxis]?.color || '#000'};">
      <p style="font-size:14px;line-height:1.6;margin:0 0 12px;">
        <strong>${person.nombre}</strong> destaca principalmente por el eje <strong>${dominantAxis}</strong>.
      </p>
      <p style="font-size:14px;line-height:1.6;margin:0;">
        ${AXIS_DESCRIPTIONS[dominantAxis]?.description || ''}
      </p>
    </div>

    <div style="margin-top:20px;">
      <h3 class="h3">Ejes del talento</h3>
      <div class="grid grid-2" style="margin-top:10px;">
        ${Object.entries(AXIS_DESCRIPTIONS).map(([axis, data]) => {
          const axisScore = axisScores.get(axis) || 0;
          const maxAxisScore = Array.from(axisScores.values()).reduce((a, b) => Math.max(a, b), 0);
          const percentage = maxAxisScore > 0 ? Math.round((axisScore / maxAxisScore) * 100) : 0;
          
          return `
          <div class="card">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
              <div style="width:14px;height:14px;border-radius:3px;background:${data.color};"></div>
              <div style="font-weight:700;font-size:13px;">${axis}</div>
            </div>
            <div style="margin-top:6px;">
              <div class="bar">
                <span style="width:${percentage}%;background:${data.color};"></span>
              </div>
              <div class="muted" style="font-size:11px;margin-top:4px;">${percentage}% de tu perfil</div>
            </div>
          </div>
          `;
        }).join('')}
      </div>
    </div>
  </section>

</body>
</html>
  `.trim();
}

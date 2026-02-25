/**
 * Genera HTML estático completo para el informe en PDF
 * Estilo basado en el diseño neurocientífico con estructura completa
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

  // Agrupar respuestas por talento para la tabla detallada
  const answersByTalent = new Map<number, Array<{ qid: string; text: string; value: number }>>();
  
  const currentDate = new Date().toISOString().split('T')[0];

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
    <div class="pill">NEUROCIENCIA APLICADA · DESCUBRE TU FUTURO PROFESIONAL</div>
    
    <div style="display:flex;justify-content:space-between;gap:16px;margin-top:18px;align-items:flex-end;">
      <div>
        <h1 class="h1">TUS RESULTADOS</h1>
        <div style="margin-top:18px;font-size:16px;font-weight:800;">${person.nombre} ${person.apellido}</div>
        <div class="muted" style="margin-top:4px;">${currentDate}</div>
      </div>
    </div>

    <div style="margin-top:32px;display:flex;justify-content:center;">
      ${mapSvg}
    </div>

    <div style="margin-top:24px;display:grid;grid-template-columns:1fr 1fr;gap:12px;">
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
  </section>

  <!-- PÁGINA 2: TOP 3 TALENTOS -->
  <section class="page">
    <h2 class="h2">Tus 3 talentos más destacados</h2>
    
    <div class="grid" style="margin-top:14px;">
      ${top3.map((s, idx) => {
        const t = talentMap.get(s.talentId);
        if (!t) return '';
        const percentage = pct(s.score, s.max);
        
        return `
          <div class="card">
            <div style="display:flex;gap:12px;align-items:flex-start;">
              <div style="font-size:32px;color:${t.color};">${t.symbol}</div>
              <div style="flex:1;">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                  <span style="font-size:12px;font-weight:700;color:var(--muted);">${idx + 1}</span>
                  <span style="font-weight:900;font-size:16px;">${t.reportTitle}</span>
                </div>
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
    <div class="muted" style="font-size:13px;margin-bottom:12px;">Basado en tus talentos principales. Marca las opciones con las que te identificas.</div>
    
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

  <!-- PÁGINAS INDIVIDUALES POR TALENTO -->
  ${sortedScores.map((s) => {
    const t = talentMap.get(s.talentId);
    if (!t) return '';
    const percentage = pct(s.score, s.max);
    
    const fieldsList = t.fields?.split('\n').filter((x) => x.trim()) || [];
    const competenciesList = t.competencies?.split('\n').filter((x) => x.trim()) || [];
    const rolesList = t.exampleRoles?.split('\n').filter((x) => x.trim()) || [];

    return `
  <section class="page">
    <div class="pill">${t.code} · ${t.symbol}</div>
    
    <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-end;margin-top:14px;">
      <div>
        <h2 class="h2">${t.reportTitle}</h2>
        <div class="muted" style="font-size:13px;">${t.axis || 'CREATIVIDAD Y VÍNCULO'}</div>
      </div>
      <div style="text-align:right;">
        <div class="muted" style="font-size:12px;font-weight:700;">Puntuación</div>
        <div style="font-size:28px;font-weight:900;color:${t.color};">${s.score}</div>
        <div class="muted" style="font-size:12px;"> / ${s.max}</div>
      </div>
    </div>

    <div class="card" style="margin-top:14px;">
      <div style="font-weight:900;margin-bottom:6px;">Resumen neurocognitivo</div>
      <div style="font-size:13px;" class="muted">${t.reportSummary}</div>
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

</body>
</html>
  `.trim();
}

/**
 * Genera HTML estático completo para el informe en PDF
 * Basado en el diseño GenioTipo pero con el estilo de la app
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

  // Generar preguntas ordenadas por talento
  const orderedQuestions: Array<{ qid: string; text: string; talentTitle: string }> = [];
  const sortedTalents = [...talents].sort((a, b) => a.id - b.id);

  // Función para calcular porcentaje
  const pct = (score: number, max: number) => {
    return max > 0 ? Math.round((score / max) * 100) : 0;
  };

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Informe de Talentos - ${person.nombre} ${person.apellido}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    @page {
      size: A4;
      margin: 0;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #0f172a;
      background: #ffffff;
      line-height: 1.6;
    }

    .page {
      width: 210mm;
      min-height: 297mm;
      padding: 25mm;
      page-break-after: always;
      position: relative;
    }

    .page:last-child {
      page-break-after: auto;
    }

    /* PORTADA */
    .cover {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      background: linear-gradient(135deg, rgba(14,165,233,0.05) 0%, rgba(239,68,68,0.03) 100%);
    }

    .cover h1 {
      font-size: 48px;
      font-weight: 700;
      color: #0ea5e9;
      margin-bottom: 8px;
      letter-spacing: -1px;
    }

    .cover h2 {
      font-size: 32px;
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 60px;
    }

    .cover .student-name {
      font-size: 36px;
      font-weight: 700;
      color: #64748b;
      margin-bottom: 40px;
    }

    .cover .map-container {
      max-width: 400px;
      margin: 0 auto;
    }

    .cover .map-container svg {
      width: 100%;
      height: auto;
    }

    /* RESUMEN */
    .summary-header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid #0ea5e9;
    }

    .summary-header h1 {
      font-size: 36px;
      color: #0f172a;
      margin-bottom: 8px;
    }

    .summary-header p {
      font-size: 14px;
      color: #64748b;
    }

    .top3-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-bottom: 40px;
    }

    .top3-card {
      border: 2px solid #e2e8f0;
      border-radius: 16px;
      padding: 20px;
      background: #ffffff;
      text-align: center;
    }

    .top3-card .symbol {
      font-size: 48px;
      margin-bottom: 12px;
    }

    .top3-card .code {
      font-size: 12px;
      color: #64748b;
      margin-bottom: 4px;
    }

    .top3-card .title {
      font-size: 18px;
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 16px;
    }

    .top3-card .score {
      font-size: 32px;
      font-weight: 700;
      color: #0ea5e9;
    }

    .top3-card .score-label {
      font-size: 12px;
      color: #64748b;
    }

    /* TABLA COMPLETA */
    .full-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }

    .full-table th {
      background: #f8fafc;
      padding: 12px;
      text-align: left;
      font-size: 12px;
      font-weight: 600;
      color: #475569;
      border-bottom: 2px solid #e2e8f0;
    }

    .full-table td {
      padding: 12px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 12px;
    }

    .full-table .symbol-cell {
      font-size: 24px;
      text-align: center;
    }

    .full-table .score-cell {
      font-weight: 700;
      color: #0ea5e9;
    }

    /* PÁGINA INDIVIDUAL DE TALENTO */
    .talent-page {
      background: linear-gradient(135deg, rgba(14,165,233,0.03) 0%, transparent 100%);
    }

    .talent-header {
      text-align: center;
      margin-bottom: 40px;
      padding: 30px;
      border-radius: 20px;
      background: #ffffff;
      border: 3px solid;
    }

    .talent-header .symbol {
      font-size: 80px;
      margin-bottom: 12px;
    }

    .talent-header .code {
      font-size: 16px;
      color: #64748b;
      margin-bottom: 8px;
    }

    .talent-header .title {
      font-size: 28px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 20px;
    }

    .talent-header .score {
      font-size: 48px;
      font-weight: 700;
      margin-bottom: 4px;
    }

    .talent-header .score-label {
      font-size: 14px;
      color: #64748b;
    }

    .talent-section {
      margin-bottom: 30px;
      background: #ffffff;
      padding: 20px;
      border-radius: 12px;
      border-left: 4px solid;
    }

    .talent-section h3 {
      font-size: 18px;
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 12px;
    }

    .talent-section p,
    .talent-section ul {
      font-size: 14px;
      color: #475569;
      line-height: 1.7;
    }

    .talent-section ul {
      padding-left: 20px;
    }

    .talent-section li {
      margin-bottom: 8px;
    }

    /* TABLA DE RESPUESTAS */
    .answers-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10px;
    }

    .answers-table th {
      background: #f8fafc;
      padding: 8px;
      text-align: left;
      font-weight: 600;
      color: #475569;
      border-bottom: 2px solid #e2e8f0;
    }

    .answers-table td {
      padding: 8px;
      border-bottom: 1px solid #e2e8f0;
    }

    .answers-table .checkbox {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      border: 2px solid #cbd5e1;
      border-radius: 4px;
      font-weight: 700;
    }

    .answers-table .checkbox.checked {
      background: #0ea5e9;
      color: #ffffff;
      border-color: #0ea5e9;
    }

    /* FOOTER */
    .page-footer {
      position: absolute;
      bottom: 15mm;
      left: 25mm;
      right: 25mm;
      text-align: center;
      font-size: 10px;
      color: #94a3b8;
      padding-top: 10px;
      border-top: 1px solid #e2e8f0;
    }
  </style>
</head>
<body>

  <!-- PORTADA -->
  <div class="page cover">
    <h1>CONOCE TU TALENTO</h1>
    <h2>Neurociencia Aplicada</h2>
    <div class="student-name">${person.nombre} ${person.apellido}</div>
    <div class="map-container">
      ${mapSvg}
    </div>
    <div class="page-footer">encuentra-tu-talento.online</div>
  </div>

  <!-- RESUMEN -->
  <div class="page">
    <div class="summary-header">
      <h1>${person.nombre} ${person.apellido}</h1>
      <p>${person.email || ''} ${person.genero ? '· ' + person.genero : ''} ${person.edad ? '· ' + person.edad + ' años' : ''}</p>
    </div>

    <h2 style="font-size: 24px; margin-bottom: 20px; color: #0f172a;">Top 3 Talentos</h2>
    <div class="top3-grid">
      ${top3
        .map((s) => {
          const t = talentMap.get(s.talentId);
          if (!t) return '';
          const percentage = pct(s.score, s.max);
          return `
        <div class="top3-card">
          <div class="symbol" style="color: ${t.color};">${t.symbol}</div>
          <div class="code">${t.code}</div>
          <div class="title">${t.reportTitle}</div>
          <div class="score" style="color: ${t.color};">${percentage}%</div>
          <div class="score-label">${s.score} / ${s.max}</div>
        </div>
      `;
        })
        .join('')}
    </div>

    <h2 style="font-size: 20px; margin: 40px 0 20px; color: #0f172a;">Puntuaciones Completas</h2>
    <table class="full-table">
      <thead>
        <tr>
          <th>Símbolo</th>
          <th>Talento</th>
          <th>Código</th>
          <th style="text-align: right;">Puntuación</th>
        </tr>
      </thead>
      <tbody>
        ${sortedScores
          .map((s) => {
            const t = talentMap.get(s.talentId);
            if (!t) return '';
            return `
          <tr>
            <td class="symbol-cell" style="color: ${t.color};">${t.symbol}</td>
            <td><strong>${t.reportTitle}</strong></td>
            <td>${t.code}</td>
            <td class="score-cell" style="text-align: right; color: ${t.color};">${s.score} / ${s.max}</td>
          </tr>
        `;
          })
          .join('')}
      </tbody>
    </table>

    <div class="page-footer">encuentra-tu-talento.online · Página 2</div>
  </div>

  <!-- PÁGINAS INDIVIDUALES DE CADA TALENTO -->
  ${sortedScores
    .map((s, idx) => {
      const t = talentMap.get(s.talentId);
      if (!t) return '';
      const percentage = pct(s.score, s.max);

      // Parsear listas si vienen separadas por saltos de línea
      const fieldsList = t.fields?.split('\n').filter((x) => x.trim()) || [];
      const competenciesList = t.competencies?.split('\n').filter((x) => x.trim()) || [];
      const rolesList = t.exampleRoles?.split('\n').filter((x) => x.trim()) || [];

      return `
  <div class="page talent-page">
    <div class="talent-header" style="border-color: ${t.color};">
      <div class="symbol" style="color: ${t.color};">${t.symbol}</div>
      <div class="code">${t.code}</div>
      <div class="title">${t.reportTitle}</div>
      <div class="score" style="color: ${t.color};">${percentage}%</div>
      <div class="score-label">${s.score} de ${s.max} puntos</div>
    </div>

    ${t.reportSummary ? `
    <div class="talent-section" style="border-left-color: ${t.color};">
      <h3>Resumen Neurocognitivo</h3>
      <p>${t.reportSummary}</p>
    </div>
    ` : ''}

    ${fieldsList.length > 0 ? `
    <div class="talent-section" style="border-left-color: ${t.color};">
      <h3>Ámbitos Profesionales</h3>
      <ul>
        ${fieldsList.map((f) => `<li>${f}</li>`).join('')}
      </ul>
    </div>
    ` : ''}

    ${competenciesList.length > 0 ? `
    <div class="talent-section" style="border-left-color: ${t.color};">
      <h3>Competencias Personales</h3>
      <ul>
        ${competenciesList.map((c) => `<li>${c}</li>`).join('')}
      </ul>
    </div>
    ` : ''}

    ${rolesList.length > 0 ? `
    <div class="talent-section" style="border-left-color: ${t.color};">
      <h3>Roles y Profesiones de Ejemplo</h3>
      <ul>
        ${rolesList.map((r) => `<li>${r}</li>`).join('')}
      </ul>
    </div>
    ` : ''}

    <div class="page-footer">encuentra-tu-talento.online · Página ${idx + 3}</div>
  </div>
  `;
    })
    .join('')}

  <!-- TABLA DE RESPUESTAS DETALLADA -->
  <div class="page">
    <h1 style="font-size: 28px; margin-bottom: 20px; color: #0f172a;">Detalle de Respuestas</h1>
    <p style="font-size: 14px; color: #64748b; margin-bottom: 30px;">
      A continuación se muestran todas las afirmaciones del test con las respuestas seleccionadas.
    </p>
    
    <table class="answers-table">
      <thead>
        <tr>
          <th style="width: 50px;">ID</th>
          <th>Pregunta</th>
          <th style="text-align: center; width: 50px;">0</th>
          <th style="text-align: center; width: 50px;">1</th>
          <th style="text-align: center; width: 50px;">2</th>
          <th style="text-align: center; width: 50px;">3</th>
        </tr>
      </thead>
      <tbody>
        ${orderedQuestions
          .map((q) => {
            const answerVal = answers[q.qid] ?? 0;
            return `
          <tr>
            <td style="color: #64748b;">${q.qid}</td>
            <td>
              <div style="font-weight: 600; color: #0f172a;">${q.text}</div>
              <div style="font-size: 9px; color: #94a3b8; margin-top: 2px;">${q.talentTitle}</div>
            </td>
            ${[0, 1, 2, 3]
              .map((val) => {
                const isChecked = answerVal === val;
                return `<td style="text-align: center;"><span class="checkbox ${isChecked ? 'checked' : ''}">${isChecked ? 'X' : ''}</span></td>`;
              })
              .join('')}
          </tr>
        `;
          })
          .join('')}
      </tbody>
    </table>

    <div class="page-footer">encuentra-tu-talento.online · Página ${sortedScores.length + 3}</div>
  </div>

</body>
</html>
  `.trim();
}

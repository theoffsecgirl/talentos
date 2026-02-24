import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import puppeteer from "puppeteer";

const TALENT_CONFIG: Record<number, { symbol: string; color: string }> = {
  2: { symbol: "Π", color: "#8B5CF6" },
  3: { symbol: "Ψ", color: "#7C3AED" },
  5: { symbol: "Ω", color: "#F59E0B" },
  7: { symbol: "Θ", color: "#10B981" },
  4: { symbol: "Α", color: "#EF4444" },
  1: { symbol: "Δ", color: "#DC2626" },
  6: { symbol: "Φ", color: "#06B6D4" },
  8: { symbol: "▭", color: "#D97706" },
};

const TALENT_ORDER = [2, 3, 5, 7, 6, 8, 1, 4];

function buildReportHTML(data: {
  nombre: string;
  apellido: string;
  fecha: string;
  scores: Array<{ talentId: number; score: number; max: number }>;
  top3: Array<any>;
  talents: Array<any>;
  mapSvg: string;
  answers: Record<string, number>;
  questionMap: Record<string, { text: string; talentQuizTitle: string }>;
}) {
  const { nombre, apellido, fecha, scores, top3, talents, mapSvg, answers, questionMap } = data;

  const byId = new Map(scores.map((s) => [s.talentId, s]));

  // Portada
  const portada = `
    <section class="page">
      <div class="pill">NEUROCIENCIA APLICADA · DESCUBRE TU FUTURO PROFESIONAL</div>
      <div style="display:flex;justify-content:space-between;gap:16px;margin-top:18px;align-items:flex-end">
        <div>
          <h1 class="h1">CONOCE TU TALENTO</h1>
          <div class="muted" style="font-size:14px;">Mapa visual de tus talentos basado en neurociencia aplicada</div>
          <div style="margin-top:18px;font-size:16px;font-weight:800">${nombre} ${apellido}</div>
          <div class="muted" style="margin-top:4px">${fecha}</div>
        </div>
      </div>

      <div style="margin-top:32px;display:flex;justify-content:center">
        ${mapSvg}
      </div>

      <div style="margin-top:24px;display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div class="card">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
            <div style="width:16px;height:16px;border-radius:4px;background:#EF4444"></div>
            <div style="font-weight:900;font-size:13px">Acción</div>
          </div>
          <div class="muted" style="font-size:11px">Resultados</div>
        </div>
        <div class="card">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
            <div style="width:16px;height:16px;border-radius:4px;background:#8B5CF6"></div>
            <div style="font-weight:900;font-size:13px">Conocimiento</div>
          </div>
          <div class="muted" style="font-size:11px">Ciencia aplicada</div>
        </div>
        <div class="card">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
            <div style="width:16px;height:16px;border-radius:4px;background:#06B6D4"></div>
            <div style="font-weight:900;font-size:13px">Imaginación</div>
          </div>
          <div class="muted" style="font-size:11px">Arte</div>
        </div>
        <div class="card">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
            <div style="width:16px;height:16px;border-radius:4px;background:#F59E0B"></div>
            <div style="font-weight:900;font-size:13px">Desempeño</div>
          </div>
          <div class="muted" style="font-size:11px">Energía</div>
        </div>
      </div>
    </section>`;

  // Top 3
  const talentosTable = TALENT_ORDER.map((tid) => {
    const s = byId.get(tid);
    const config = TALENT_CONFIG[tid];
    const t = talents.find((x: any) => x.id === tid);
    return `
      <tr>
        <td style="text-align:center;font-size:20px;color:${config.color}">${config.symbol}</td>
        <td style="font-weight:700">${t?.reportTitle || t?.quizTitle || `T${tid}`}</td>
        <td style="text-align:center">T${tid}</td>
        <td style="text-align:center;font-weight:700">${s?.score ?? 0} / ${s?.max ?? 15}</td>
      </tr>`;
  }).join("\n");

  const resumenPage = `
    <section class="page">
      <h2 class="h2">Tus 3 talentos más destacados</h2>
      <div class="grid" style="margin-top:14px">
        ${top3
          .map((t: any, idx: number) => {
            const config = TALENT_CONFIG[t.talentId];
            return `
              <div class="card">
                <div style="display:flex;gap:12px;align-items:flex-start">
                  <div style="font-size:32px;color:${config?.color || "#000"}">${config?.symbol || ""}</div>
                  <div style="flex:1">
                    <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
                      <span style="font-size:12px;font-weight:700;color:#64748b">#${idx + 1}</span>
                      <span style="font-weight:900;font-size:16px">${t.reportTitle || t.quizTitle}</span>
                    </div>
                    <div class="muted" style="font-size:13px;line-height:1.5">${t.reportSummary}</div>
                    <div style="margin-top:8px;text-align:right">
                      <span style="font-size:20px;font-weight:900">${t.score}</span>
                      <span class="muted" style="font-size:12px"> / ${t.max}</span>
                    </div>
                  </div>
                </div>
              </div>`;
          })
          .join("\n")}
      </div>

      <div style="margin-top:16px" class="card">
        <div style="font-weight:900;margin-bottom:8px">Listado completo de talentos</div>
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
            ${talentosTable}
          </tbody>
        </table>
      </div>
    </section>`;

  // Profesiones
  const profesionesPage = `
    <section class="page">
      <h2 class="h2">Profesiones y roles sugeridos</h2>
      <div class="muted" style="font-size:13px;margin-bottom:12px">Basado en tus talentos principales:</div>
      <div class="card">
        ${top3
          .flatMap((t: any) => t.exampleRoles || [])
          .map(
            (role: string) => `
            <div style="padding:10px;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:8px;display:flex;align-items:center;gap:10px">
              <div style="width:18px;height:18px;border:2px solid #64748b;border-radius:4px"></div>
              <div style="font-size:13px">${role}</div>
            </div>`
          )
          .join("\n")}
      </div>
    </section>`;

  // Páginas individuales de cada talento
  const detailPages = talents
    .slice()
    .sort((a: any, b: any) => a.id - b.id)
    .map((t: any) => {
      const s = byId.get(t.id);
      const config = TALENT_CONFIG[t.id];
      const fields = (t.fields ?? []).map((x: string) => `<li>${x}</li>`).join("");
      const comps = (t.competencies ?? []).map((x: string) => `<li>${x}</li>`).join("");
      const roles = (t.exampleRoles ?? []).map((x: string) => `<li>${x}</li>`).join("");

      return `
        <section class="page">
          <div class="pill">${t.code} · ${config?.symbol || ""} · ${t.titleGenotype || ""}</div>
          <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-end;margin-top:14px">
            <div>
              <h2 class="h2">${t.reportTitle || t.quizTitle}</h2>
              <div class="muted" style="font-size:13px">${t.group || t.quizTitle}</div>
            </div>
            <div style="text-align:right">
              <div class="muted" style="font-size:12px;font-weight:700">Puntuación</div>
              <div style="font-size:28px;font-weight:900;color:${config?.color || "#000"}">${s?.score ?? 0}</div>
              <div class="muted" style="font-size:12px">/ ${s?.max ?? 15}</div>
            </div>
          </div>
          <div class="card" style="margin-top:14px">
            <div style="font-weight:900;margin-bottom:6px">Resumen neurocognitivo</div>
            <div style="font-size:13px" class="muted">${t.reportSummary || ""}</div>
          </div>
          <div class="grid grid2" style="margin-top:12px">
            <div class="card">
              <div style="font-weight:900;margin-bottom:8px">Ámbitos profesionales</div>
              <ul style="margin:0;padding-left:18px;font-size:13px" class="muted">${fields}</ul>
            </div>
            <div class="card">
              <div style="font-weight:900;margin-bottom:8px">Competencias personales</div>
              <ul style="margin:0;padding-left:18px;font-size:13px" class="muted">${comps}</ul>
            </div>
          </div>
          <div class="card" style="margin-top:12px">
            <div style="font-weight:900;margin-bottom:8px">Roles y profesiones de ejemplo</div>
            <ul style="margin:0;padding-left:18px;font-size:13px" class="muted">${roles}</ul>
          </div>
        </section>`;
    })
    .join("\n");

  // Detalle de respuestas
  const answerRows = Object.entries(answers)
    .sort(([a], [b]) => a.localeCompare(b, "es"))
    .map(([qid, v]) => {
      const meta = questionMap[qid];
      const text = meta?.text || "(Pregunta no encontrada)";
      const vv = Number(v);
      const x = (n: number) => (vv === n ? "X" : "");
      return `
        <tr>
          <td style="width:64px"><b>${qid}</b></td>
          <td>${text}</td>
          <td style="width:40px;text-align:center">${x(0)}</td>
          <td style="width:40px;text-align:center">${x(1)}</td>
          <td style="width:40px;text-align:center">${x(2)}</td>
          <td style="width:40px;text-align:center">${x(3)}</td>
        </tr>`;
    })
    .join("\n");

  const cierre = `
    <section class="page">
      <h2 class="h2">Detalle de respuestas</h2>
      <div class="muted" style="font-size:13px">Escala 0–3. Marca "X" en la columna correspondiente.</div>
      <div class="card" style="margin-top:12px">
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
            ${answerRows}
          </tbody>
        </table>
      </div>
    </section>`;

  const css = `
    :root{--bg:#ffffff;--fg:#0f172a;--muted:#64748b;--border:#e5e7eb;--accent:#0ea5e9;--danger:#ef4444;}
    *{box-sizing:border-box} 
    body{margin:0;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial; color:var(--fg); background:var(--bg)}
    .page{width:210mm;min-height:297mm;margin:0 auto;padding:18mm 16mm;page-break-after:always}
    .page:last-child{page-break-after:auto}
    .h1{font-size:34px;line-height:1.05;margin:0 0 10px;font-weight:900;letter-spacing:-0.02em}
    .h2{font-size:20px;margin:0 0 8px;font-weight:800}
    .muted{color:var(--muted)}
    .card{border:1px solid var(--border);border-radius:14px;padding:14px;background:#fff}
    .grid{display:grid;gap:12px}
    .grid2{grid-template-columns:1fr 1fr}
    .pill{display:inline-flex;align-items:center;border:1px solid var(--border);border-radius:999px;padding:6px 10px;font-size:12px;color:var(--muted)}
    table{width:100%;border-collapse:collapse;font-size:12px}
    th,td{border:1px solid var(--border);padding:8px;vertical-align:top}
    th{background:#f8fafc;text-align:left}
    @media print{body{background:#fff}.page{padding:16mm}}
  `;

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${nombre} ${apellido} - Informe de Talentos</title>
  <style>${css}</style>
</head>
<body>
${portada}
${resumenPage}
${profesionesPage}
${detailPages}
${cierre}
</body>
</html>`;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // FIX: Usar 'submission' (el modelo correcto del schema)
    const person = await prisma.submission.findUnique({
      where: { id },
      include: {
        user: true,
        assessments: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!person || !person.assessments[0]) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }

    const assessment = person.assessments[0];
    const talents = await prisma.talent.findMany({ orderBy: { id: "asc" } });

    const scores: Array<{ talentId: number; score: number; max: number }> = Array.isArray(assessment.scoresJson)
      ? assessment.scoresJson
          .map((x: any) => ({ talentId: Number(x?.talentId), score: Number(x?.score ?? 0), max: Number(x?.max ?? 0) }))
          .filter((x: any) => Number.isFinite(x.talentId))
      : [];

    const top3 = scores
      .slice()
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((s) => {
        const t = talents.find((x: any) => x.id === s.talentId);
        return {
          talentId: s.talentId,
          code: t?.code ?? `T${s.talentId}`,
          quizTitle: t?.quizTitle ?? "",
          reportTitle: t?.reportTitle ?? "",
          reportSummary: t?.reportSummary ?? "",
          exampleRoles: t?.exampleRoles ?? [],
          score: s.score,
          max: s.max,
        };
      });

    const answers: Record<string, number> =
      assessment?.answersJson && typeof assessment.answersJson === "object" ? (assessment.answersJson as any) : {};

    const questionMap: Record<string, { text: string; talentQuizTitle: string }> = {};
    for (const t of talents) {
      for (const it of t.items || []) {
        questionMap[it.id] = { text: it.text, talentQuizTitle: t.quizTitle };
      }
    }

    // Generate SVG map
    const mapSvg = generateTalentWheelSVG(scores);

    const html = buildReportHTML({
      nombre: person.nombre,
      apellido: person.apellido,
      fecha: new Date(person.createdAt).toLocaleDateString("es-ES"),
      scores,
      top3,
      talents,
      mapSvg,
      answers,
      questionMap,
    });

    // Generate PDF with Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" },
    });

    await browser.close();

    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${person.nombre}-${person.apellido}-Informe-Talentos.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generando PDF:", error);
    return NextResponse.json({ error: "Error generando PDF" }, { status: 500 });
  }
}

function generateTalentWheelSVG(scores: Array<{ talentId: number; score: number; max: number }>): string {
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

    return { id: talentId, code: `T${talentId}`, symbol: config.symbol, score, maxScore, color: config.color, fillRadius, fillPercentage };
  });

  const sections = talents.map((talent, index) => {
    const anglePerSection = (Math.PI * 2) / 8;
    const startAngle = index * anglePerSection - Math.PI / 2;
    const endAngle = startAngle + anglePerSection;
    return { talent, startAngle, endAngle };
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

  const paths = sections
    .map(
      ({ talent, startAngle, endAngle }) => `
    <path
      d="${createArcPath(startAngle, endAngle, talent.fillRadius, innerRadius)}"
      fill="url(#gradient-${talent.id})"
      stroke="${talent.color}"
      stroke-width="1"
    />
    <path
      d="${createArcPath(startAngle, endAngle, radius, talent.fillRadius > innerRadius ? talent.fillRadius : innerRadius)}"
      fill="none"
      stroke="${talent.color}"
      stroke-width="2"
      opacity="0.3"
    />`
    )
    .join("\n");

  const labels = sections
    .map(({ talent, startAngle, endAngle }) => {
      const midAngle = (startAngle + endAngle) / 2;
      const labelPos = polarToCartesian(midAngle, radius + 30);
      return `
      <text x="${labelPos.x}" y="${labelPos.y}" text-anchor="middle" dominant-baseline="middle" font-size="18" font-weight="bold" fill="${talent.color}">
        ${talent.symbol}
      </text>
      <text x="${labelPos.x}" y="${labelPos.y + 16}" text-anchor="middle" dominant-baseline="middle" font-size="12" fill="#666">
        ${talent.code}
      </text>`;
    })
    .join("\n");

  return `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="max-width:100%;height:auto">
  <defs>${gradients}</defs>
  <line x1="${center}" y1="${center - radius}" x2="${center}" y2="${center + radius}" stroke="#000" stroke-width="2" />
  <line x1="${center - radius}" y1="${center}" x2="${center + radius}" y2="${center}" stroke="#000" stroke-width="2" />
  ${[1, 3, 5, 7]
    .map((index) => {
      const angle = (index * Math.PI * 2) / 8 - Math.PI / 2;
      const outer = polarToCartesian(angle, radius);
      return `<line x1="${center}" y1="${center}" x2="${outer.x}" y2="${outer.y}" stroke="#666" stroke-width="1" stroke-dasharray="4 4" />`;
    })
    .join("\n")}
  ${paths}
  ${labels}
  <circle cx="${center}" cy="${center}" r="${innerRadius}" fill="white" stroke="#000" stroke-width="2" />
</svg>`;
}

import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

const isDev = process.env.NODE_ENV === "development";

type TalentScore = { talentId: number; score: number; max: number };

interface GeneratePDFOptions {
  submission: any;
  assessment: any;
  talents: any[];
}

function buildInformeHTML(submission: any, assessment: any, talents: any[]): string {
  const scores: TalentScore[] = Array.isArray(assessment?.scoresJson)
    ? assessment.scoresJson.map((x: any) => ({
        talentId: Number(x?.talentId),
        score: Number(x?.score ?? 0),
        max: Number(x?.max ?? 0),
      }))
    : [];

  const top3 = scores
    .slice()
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((s) => {
      const t = talents.find((x) => x.id === s.talentId);
      return {
        talentId: s.talentId,
        code: t?.code ?? `T${s.talentId}`,
        reportTitle: t?.reportTitle ?? t?.quizTitle ?? "",
        reportSummary: t?.reportSummary ?? "",
        score: s.score,
        max: s.max,
      };
    });

  const nombre = `${submission.nombre} ${submission.apellido}`;
  const fecha = new Date(submission.createdAt).toISOString().split("T")[0];

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Informe ${nombre}</title>
  <style>
    :root{--bg:#ffffff;--fg:#0b1220;--muted:#6b7280;--border:#e5e7eb;}
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial;color:var(--fg);background:var(--bg);padding:20mm}
    h1{font-size:32px;font-weight:900;margin-bottom:16px}
    h2{font-size:24px;font-weight:800;margin:24px 0 12px}
    .muted{color:var(--muted)}
    .card{border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:16px;background:#fff}
    table{width:100%;border-collapse:collapse;margin-top:12px}
    th,td{border:1px solid var(--border);padding:10px;text-align:left}
    th{background:#f8fafc;font-weight:700}
  </style>
</head>
<body>
  <h1>Informe de Talentos</h1>
  <div class="muted">Fecha: ${fecha}</div>
  <div style="margin-top:8px;font-size:18px;font-weight:700">${nombre}</div>
  <div class="muted">${submission.user?.email || ""}</div>

  <h2>Top 3 Talentos</h2>
  ${top3
    .map(
      (t, idx) => `
    <div class="card">
      <div style="font-size:20px;font-weight:900">#${idx + 1} - ${t.code}: ${t.reportTitle}</div>
      <div class="muted" style="margin-top:8px">${t.reportSummary}</div>
      <div style="margin-top:12px;text-align:right">
        <span style="font-size:24px;font-weight:900">${t.score}</span>
        <span class="muted"> / ${t.max}</span>
      </div>
    </div>
  `
    )
    .join("")}

  <h2>Todos los talentos</h2>
  <table>
    <thead>
      <tr>
        <th>Código</th>
        <th>Talento</th>
        <th>Puntuación</th>
      </tr>
    </thead>
    <tbody>
      ${talents
        .sort((a, b) => a.id - b.id)
        .map((t) => {
          const s = scores.find((x) => x.talentId === t.id);
          return `
        <tr>
          <td>${t.code}</td>
          <td>${t.reportTitle || t.quizTitle}</td>
          <td>${s?.score ?? 0} / ${s?.max ?? 0}</td>
        </tr>`;
        })
        .join("")}
    </tbody>
  </table>

  <div style="margin-top:24px;padding:16px;border:1px solid var(--border);border-radius:12px;background:#f8fafc">
    <div style="font-weight:700">Datos del estudiante</div>
    <div class="muted" style="margin-top:8px">
      <div>Edad: ${Math.floor((Date.now() - new Date(submission.fechaNacimiento).getTime()) / 31557600000)}</div>
      <div>Género: ${submission.genero}</div>
      <div>Curso: ${submission.curso}</div>
      <div>Modalidad: ${submission.modalidad}</div>
      <div>Centro: ${submission.centroEducativo || "-"}</div>
    </div>
  </div>
</body>
</html>`;
}

export async function generatePDFBuffer(options: GeneratePDFOptions): Promise<Buffer> {
  const html = buildInformeHTML(options.submission, options.assessment, options.talents);
  let browser;

  try {
    if (isDev) {
      const puppeteerDev = await import("puppeteer");
      browser = await puppeteerDev.default.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
    } else {
      browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
      });
    }

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "10mm",
        right: "10mm",
        bottom: "10mm",
        left: "10mm",
      },
    });

    await browser.close();
    return Buffer.from(pdfBuffer);
  } catch (error) {
    if (browser) {
      await browser.close();
    }
    throw error;
  }
}

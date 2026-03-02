import { db } from "@/db";
import { onboardings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import TalentWheel from "@/components/TalentWheel";
import { TALENTS } from "@/lib/talents";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function MapaPage({ params }: Props) {
  const { id } = await params;
  const recordId = parseInt(id, 10);

  if (isNaN(recordId)) {
    notFound();
  }

  const record = await db
    .select()
    .from(onboardings)
    .where(eq(onboardings.id, recordId))
    .limit(1)
    .then((rows) => rows[0]);

  if (!record || !record.answers) {
    notFound();
  }

  const answers = typeof record.answers === "string" ? JSON.parse(record.answers) : record.answers;

  // Calcular puntuaciones
  const scoreMap = new Map<number, number>();
  for (const talent of TALENTS) {
    for (const item of talent.items) {
      const value = answers[item.id];
      if (typeof value === "number") {
        scoreMap.set(talent.id, (scoreMap.get(talent.id) ?? 0) + value);
      }
    }
  }

  const wheelScores = TALENTS.map((t) => ({
    talentId: t.id,
    score: scoreMap.get(t.id) ?? 0,
    max: t.items.length * 3,
  }));

  return (
    <html lang="es">
      <head>
        <title>Mapa de Talentos - {record.nombre} {record.apellido}</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          @page {
            margin: 1.5cm;
            size: A4 portrait;
          }
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: white;
            color: #333;
            padding: 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #ddd;
            padding-bottom: 15px;
          }
          .header h1 {
            font-size: 24px;
            font-weight: 700;
            color: #111;
            margin-bottom: 8px;
          }
          .header .name {
            font-size: 18px;
            color: #666;
            margin-bottom: 4px;
          }
          .header .date {
            font-size: 14px;
            color: #999;
          }
          .diagram-container {
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 40px 0;
          }
          .no-print {
            display: none !important;
          }
          @media print {
            body {
              padding: 0;
            }
            .no-print {
              display: none !important;
            }
          }
        `}</style>
      </head>
      <body>
        <div className="header">
          <h1>MAPA DE TALENTOS</h1>
          <div className="name">{record.nombre} {record.apellido}</div>
          <div className="date">{new Date(record.createdAt).toLocaleDateString("es-ES")}</div>
        </div>
        
        <div className="diagram-container">
          <TalentWheel scores={wheelScores} showFullLabels={true} />
        </div>

        <script dangerouslySetInnerHTML={{
          __html: `
            window.addEventListener('load', function() {
              if (window.location.search.includes('auto=1')) {
                setTimeout(function() {
                  window.print();
                }, 500);
              }
            });
          `
        }} />
      </body>
    </html>
  );
}

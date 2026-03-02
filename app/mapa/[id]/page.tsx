import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import TalentWheel from "@/components/TalentWheel";
import { TALENTS } from "@/lib/talents";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function MapaPage({ params }: Props) {
  const { id } = await params;

  const person = await prisma.submission.findUnique({
    where: { id },
    include: {
      user: true,
      assessments: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  if (!person || !person.assessments[0]) {
    notFound();
  }

  const assessment = person.assessments[0];

  // Extraer puntuaciones
  const scores: Array<{ talentId: number; score: number; max: number }> = Array.isArray(assessment.scoresJson)
    ? assessment.scoresJson
        .map((x: any) => ({ 
          talentId: Number(x?.talentId), 
          score: Number(x?.score ?? 0), 
          max: Number(x?.max ?? 0) 
        }))
        .filter((x: any) => Number.isFinite(x.talentId))
    : [];

  const wheelScores = scores.map((s) => ({
    talentId: s.talentId,
    score: s.score,
    max: s.max,
  }));

  return (
    <html lang="es">
      <head>
        <title>Mapa de Talentos - {person.nombre} {person.apellido}</title>
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
          <div className="name">{person.nombre} {person.apellido}</div>
          <div className="date">{new Date(person.createdAt).toLocaleDateString("es-ES")}</div>
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

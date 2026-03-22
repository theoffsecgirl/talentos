import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import BothTalentWheels from "@/components/BothTalentWheels";

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

  const fullName = `${person.nombre} ${person.apellido}`;

  return (
    <html lang="es">
      <head>
        <title>Mapas de Talentos - {fullName}</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          @page {
            margin: 1.5cm;
            size: A4 landscape;
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
            max-width: 100%;
            margin: 0 auto;
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
            flex-direction: column;
            align-items: center;
            margin: 20px 0;
          }
          @media print {
            body {
              padding: 10px;
              max-width: 100%;
            }
            .header h1 {
              font-size: 20px;
            }
            .diagram-container {
              margin: 15px 0;
            }
          }
        `}</style>
      </head>
      <body>
        <div className="header">
          <h1>MAPAS DE TALENTOS</h1>
          <div className="name">{fullName}</div>
          <div className="date">{new Date(person.createdAt).toLocaleDateString("es-ES")}</div>
        </div>
        
        <div className="diagram-container">
          <BothTalentWheels 
            scores={wheelScores}
            userName={fullName}
            initialGenotipoSummary={person.genotipoSummary ?? ""}
            initialNeurotalentoSummary={person.neurotalentoSummary ?? ""}
            rolEscogido={person.campoIdentificado ?? person.identificaCampos ?? ""}
            rolPensado={person.ideaCarreraTextoFinal ?? person.ideaCarrera ?? ""}
          />
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

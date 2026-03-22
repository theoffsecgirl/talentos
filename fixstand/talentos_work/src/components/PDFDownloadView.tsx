"use client";

import { useMemo } from "react";
import { TALENTS } from "@/lib/talents";
import TalentWheel from "@/components/TalentWheel";

type Props = {
  scores: Array<{
    talentId: number;
    score: number;
    max: number;
  }>;
  userName: string;
  userLastName?: string;
};

// Corregir símbolos según CSV
const NEUROTALENTO_SYMBOLS: Record<number, string> = {
  1: "Σ", // Sigma (era Delta)
  2: "Π", // Pi
  3: "Ψ", // Psi
  4: "α", // Alfa minúscula (era mayúscula)
  5: "Ω", // Omega
  6: "Φ", // Fi
  7: "Θ", // Theta
  8: "Μ", // Mu/Meandro (era rectángulo)
};

const GENOTIPO_SYMBOLS: Record<number, string> = {
  1: "△", // Triángulo
  2: "⬠", // Pentágono
  3: "∞", // Infinito
  4: "◇", // Rombo
  5: "○", // Círculo
  6: "⬯", // Elipse contorno
  7: "□", // Cuadrado
  8: "▭", // Rectángulo
};

const AXES_CONFIG = {
  PRAGMATICO: { name: "Pragmático", shortName: "Acción y resultados", talents: [2, 4, 8] },
  GENERADOR: { name: "Generador", shortName: "Creatividad y vínculo", talents: [1, 3, 6] },
  VINCULO: { name: "Vínculo", shortName: "Profundidad y sensibilidad", talents: [5, 7] },
};

export default function PDFDownloadView({ scores, userName, userLastName }: Props) {
  const ranked = useMemo(() => {
    return TALENTS.map((t) => {
      const scoreData = scores.find((s) => s.talentId === t.id);
      const score = scoreData?.score ?? 0;
      const max = scoreData?.max ?? 15;
      const percentage = max > 0 ? Math.round((score / max) * 100) : 0;
      
      return {
        ...t,
        score,
        max,
        percentage,
        symbolNeuro: NEUROTALENTO_SYMBOLS[t.id],
        symbolGeno: GENOTIPO_SYMBOLS[t.id],
      };
    }).sort((a, b) => b.percentage - a.percentage);
  }, [scores]);

  const dominant = ranked[0];

  // Agrupar talentos por eje
  const talentsByAxis = useMemo(() => {
    const groups: Record<string, typeof ranked> = {};
    
    Object.entries(AXES_CONFIG).forEach(([axisKey, axisData]) => {
      groups[axisKey] = ranked.filter(t => axisData.talents.includes(t.id));
    });
    
    return groups;
  }, [ranked]);

  const BatteryBar = ({ percentage }: { percentage: number }) => {
    const isRed = percentage >= 67;
    const bars = Math.round((percentage / 100) * 5);
    
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="w-2 h-6 border border-gray-400"
            style={{
              backgroundColor: i < bars ? (isRed ? '#ef4444' : '#1f2937') : 'transparent',
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="w-full bg-white text-black p-8" id="pdf-download-content">
      {/* Header */}
      <div className="mb-6 pb-4 border-b-2 border-gray-800">
        <h1 className="text-2xl font-bold text-center">MAPA DE TALENTOS</h1>
        <p className="text-center text-lg mt-2">
          {userName} {userLastName || ''}
        </p>
        <p className="text-center text-sm text-gray-600 mt-1">
          {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Dos columnas */}
      <div className="grid grid-cols-2 gap-8">
        {/* Columna izquierda: Diagrama */}
        <div className="flex flex-col items-center">
          <h2 className="text-lg font-semibold mb-4">Neurotalento</h2>
          <TalentWheel 
            scores={scores} 
            showFullLabels={true} 
            modelType="neurotalento"
            centerText="Neurotalento"
          />
          
          {/* 4 Ejes */}
          <div className="mt-6 w-full">
            <h3 className="text-sm font-semibold mb-2">Ejes Neurocognitivos</h3>
            <div className="space-y-1 text-xs">
              <div><strong>Pragmático:</strong> T2, T4, T8</div>
              <div><strong>Generador:</strong> T1, T3, T6</div>
              <div><strong>Vínculo:</strong> T5, T7</div>
            </div>
          </div>
        </div>

        {/* Columna derecha: Perfil + Lista */}
        <div>
          {/* Perfil profesional del dominante */}
          <div className="mb-6 p-4 border-2 border-gray-800 rounded">
            <h2 className="text-lg font-bold mb-2">
              {dominant.symbolNeuro} {dominant.reportTitle || dominant.quizTitle}
            </h2>
            <p className="text-sm text-gray-700 mb-3">
              {dominant.reportSummary}
            </p>
            {dominant.exampleRoles && dominant.exampleRoles.length > 0 && (
              <div className="text-xs">
                <strong>Roles profesionales:</strong>
                <ul className="list-disc list-inside mt-1 space-y-0.5">
                  {dominant.exampleRoles.slice(0, 3).map((role, i) => (
                    <li key={i} className="text-gray-600">{role}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Lista de 8 talentos agrupados por eje */}
          <div>
            <h3 className="text-base font-semibold mb-3">Tus 8 Talentos</h3>
            
            {Object.entries(AXES_CONFIG).map(([axisKey, axisData]) => (
              <div key={axisKey} className="mb-4">
                <h4 className="text-sm font-bold text-gray-700 mb-2">
                  {axisData.name} - {axisData.shortName}
                </h4>
                <div className="space-y-2">
                  {talentsByAxis[axisKey]?.map((talent) => (
                    <div key={talent.id} className="flex items-center justify-between p-2 border border-gray-300 rounded">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-lg font-bold">{talent.symbolNeuro}</span>
                        <div className="text-xs">
                          <div className="font-semibold">{talent.reportTitle || talent.quizTitle}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold min-w-[2rem] text-right">{talent.percentage}</span>
                        <BatteryBar percentage={talent.percentage} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-gray-300 text-xs text-gray-500 text-center">
        Mapa generado por Northstar Academy - Sistema basado en Neurociencia aplicada
      </div>
    </div>
  );
}

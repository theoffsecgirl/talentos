"use client";

import { useState } from "react";
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

// Mapa talentId → clave usada en pdf-data.ts
const TALENT_KEY_MAP: Record<number, string> = {
  1: "estrategia",
  2: "analitico",
  3: "acompanamiento",
  4: "gestion",
  5: "empatico",
  6: "imaginacion",
  7: "profundo",
  8: "aplicado",
};

type PdfType = "mapa" | "informe";
type ModelType = "genotipo" | "neurotalento";

const NEUROTALENTO_SYMBOLS: Record<number, string> = {
  1: "Σ", 2: "Π", 3: "Ψ", 4: "α", 5: "Ω", 6: "Φ", 7: "Θ", 8: "Μ",
};
const GENOTIPO_SYMBOLS: Record<number, string> = {
  1: "△", 2: "⬠", 3: "∞", 4: "◇", 5: "○", 6: "⬭", 7: "□", 8: "▭",
};

export default function PDFDownloadView({ scores, userName, userLastName }: Props) {
  const [textoResumen, setTextoResumen] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Construir objeto scores { clave: porcentaje } para las APIs PDF
  const pdfScores = Object.fromEntries(
    scores.map((s) => [
      TALENT_KEY_MAP[s.talentId],
      s.max > 0 ? Math.round((s.score / s.max) * 100) : 0,
    ])
  );

  const nombre = `${userName}${userLastName ? " " + userLastName : ""}`;

  async function downloadPDF(tipo: PdfType, modelo: ModelType) {
    const key = `${tipo}-${modelo}`;
    setLoading(key);
    setError(null);
    try {
      const res = await fetch(`/api/generate-${tipo}-pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          modelo,
          scores: pdfScores,
          textoResumen: textoResumen.trim() || undefined,
          fecha: new Date().toLocaleDateString("es-ES", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${nombre.toLowerCase().replace(/\s+/g, "-")}-${tipo}-${modelo}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al generar el PDF");
    } finally {
      setLoading(null);
    }
  }

  const ranked = scores
    .map((s) => {
      const talent = TALENTS.find((t) => t.id === s.talentId);
      const pct = s.max > 0 ? Math.round((s.score / s.max) * 100) : 0;
      return { ...talent, score: s.score, max: s.max, percentage: pct };
    })
    .sort((a, b) => (b.percentage ?? 0) - (a.percentage ?? 0));

  const dominant = ranked[0];

  return (
    <div className="w-full space-y-8">
      {/* ── Rueda de talentos ── */}
      <div className="flex justify-center">
        <TalentWheel
          scores={scores}
          showFullLabels={true}
          modelType="neurotalento"
          centerText="Neurotalento"
        />
      </div>

      {/* ── Perfil dominante ── */}
      {dominant && (
        <div className="bg-[#0F0F20] border border-[#1E1E36] rounded-xl p-5">
          <p className="text-xs text-gray-500 tracking-widest uppercase mb-1">Talento dominante</p>
          <h2 className="text-white text-lg font-bold">
            {NEUROTALENTO_SYMBOLS[dominant.id ?? 0]} {dominant.reportTitle ?? dominant.quizTitle}
          </h2>
          <p className="text-gray-400 text-sm mt-2 leading-relaxed">{dominant.reportSummary}</p>
        </div>
      )}

      {/* ── Texto resumen opcional ── */}
      <div className="space-y-2">
        <label className="block text-xs text-gray-500 tracking-widest uppercase">
          Observaciones del evaluador
          <span className="ml-2 font-normal normal-case text-gray-600">(opcional — aparece en el PDF)</span>
        </label>
        <textarea
          value={textoResumen}
          onChange={(e) => setTextoResumen(e.target.value)}
          rows={3}
          placeholder="Escribe aquí tus observaciones personalizadas..."
          className="w-full bg-[#0F0F20] border border-[#1E1E36] rounded-lg px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-gray-500 resize-none"
        />
      </div>

      {/* ── Botones de descarga ── */}
      <div className="space-y-3">
        <p className="text-xs text-gray-500 tracking-widest uppercase">Descargar PDF</p>

        <div className="grid grid-cols-2 gap-3">
          {/* Mapa Genotipo */}
          <button
            onClick={() => downloadPDF("mapa", "genotipo")}
            disabled={loading !== null}
            className="flex items-center justify-center gap-2 bg-[#0F0F20] hover:bg-[#161628] border border-[#1E1E36] hover:border-gray-600 text-white rounded-xl px-4 py-4 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading === "mapa-genotipo" ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span className="text-lg">{GENOTIPO_SYMBOLS[dominant?.id ?? 1]}</span>
            )}
            <span className="text-left">
              <span className="block text-white">Mapa Genotipo</span>
              <span className="block text-xs text-gray-500">1 página · horizontal</span>
            </span>
          </button>

          {/* Mapa Neurotalento */}
          <button
            onClick={() => downloadPDF("mapa", "neurotalento")}
            disabled={loading !== null}
            className="flex items-center justify-center gap-2 bg-[#0F0F20] hover:bg-[#161628] border border-[#1E1E36] hover:border-gray-600 text-white rounded-xl px-4 py-4 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading === "mapa-neurotalento" ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span className="text-lg">{NEUROTALENTO_SYMBOLS[dominant?.id ?? 1]}</span>
            )}
            <span className="text-left">
              <span className="block text-white">Mapa Neurotalento</span>
              <span className="block text-xs text-gray-500">1 página · horizontal</span>
            </span>
          </button>

          {/* Informe Genotipo */}
          <button
            onClick={() => downloadPDF("informe", "genotipo")}
            disabled={loading !== null}
            className="flex items-center justify-center gap-2 bg-[#13132A] hover:bg-[#1a1a36] border border-[#1E1E36] hover:border-gray-600 text-white rounded-xl px-4 py-4 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading === "informe-genotipo" ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span className="text-lg">📄</span>
            )}
            <span className="text-left">
              <span className="block text-white">Informe Genotipo</span>
              <span className="block text-xs text-gray-500">9 páginas · soft skills</span>
            </span>
          </button>

          {/* Informe Neurotalento */}
          <button
            onClick={() => downloadPDF("informe", "neurotalento")}
            disabled={loading !== null}
            className="flex items-center justify-center gap-2 bg-[#13132A] hover:bg-[#1a1a36] border border-[#1E1E36] hover:border-gray-600 text-white rounded-xl px-4 py-4 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading === "informe-neurotalento" ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span className="text-lg">📄</span>
            )}
            <span className="text-left">
              <span className="block text-white">Informe Neurotalento</span>
              <span className="block text-xs text-gray-500">9 páginas · soft skills</span>
            </span>
          </button>
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-400 text-xs mt-2 bg-red-950/30 border border-red-900 rounded-lg px-4 py-2">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

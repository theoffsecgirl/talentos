"use client";

import { useState } from "react";
import TalentWheel from "@/components/TalentWheel";
import { exportTalentModelPDF, type RankedTalent } from "@/lib/generateTalentModelPDF";
import { TALENTS } from "@/lib/talents";

type Score = {
  talentId: number;
  score: number;
  max: number;
};

type Props = {
  initialGenotipoSummary?: string;
  initialNeurotalentoSummary?: string;
  scores: Score[];
  userName?: string;
};

// Mapeo talentId (1-8) -> key usado en pdf-data
const TALENT_KEY_MAP: Record<number, string> = {
  1: 'estrategia',
  2: 'analitico',
  3: 'acompanamiento',
  4: 'gestion',
  5: 'empatico',
  6: 'imaginacion',
  7: 'profundo',
  8: 'aplicado',
};

async function downloadPDF(
  endpoint: string,
  payload: object,
  filename: string
) {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Error ${res.status}`);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function BothTalentWheels({
  scores,
  userName = "",
}: Props) {
  const [activeTab, setActiveTab] = useState<"genotipo" | "neurotalento">("genotipo");
  const [genotipoSummary, setGenotipoSummary] = useState("");
  const [neurotalentoSummary, setNeurotalentoSummary] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [loadingBtn, setLoadingBtn] = useState<string | null>(null);

  // Convierte scores array -> Record<string, number> (porcentaje 0-100)
  const buildScoresRecord = (): Record<string, number> => {
    const record: Record<string, number> = {};
    for (const s of scores) {
      const key = TALENT_KEY_MAP[s.talentId];
      if (key) record[key] = s.max > 0 ? Math.round((s.score / s.max) * 100) : 0;
    }
    return record;
  };

  const handleDownload = async (
    tipo: 'informe' | 'mapa',
    modelo: 'genotipo' | 'neurotalento'
  ) => {
    const btnKey = `${tipo}-${modelo}`;
    setLoadingBtn(btnKey);
    try {
      const scoresRecord = buildScoresRecord();
      const resumen = modelo === 'genotipo' ? genotipoSummary : neurotalentoSummary;
      const endpoint = tipo === 'informe'
        ? '/api/generate-informe-pdf'
        : '/api/generate-mapa-pdf';
      const safeName = userName.toLowerCase().replace(/\s+/g, '-') || 'talentos';
      const filename = `${safeName}-${tipo}-${modelo}.pdf`;
      await downloadPDF(endpoint, {
        nombre: userName || 'Candidato',
        scores: scoresRecord,
        modelo,
        textoResumen: resumen || undefined,
      }, filename);
    } catch (err) {
      console.error(`Error descargando ${tipo} ${modelo}:`, err);
      alert(`Error al generar el PDF. Inténtalo de nuevo.`);
    } finally {
      setLoadingBtn(null);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    const ranked: RankedTalent[] = scores
      .map(s => {
        const talent = TALENTS.find(t => t.id === s.talentId);
        if (!talent) return null;
        return {
          id: s.talentId,
          code: talent.code,
          quizTitle: talent.quizTitle,
          titleSymbolic: talent.titleSymbolic,
          titleGenotype: talent.titleGenotype,
          reportTitle: talent.reportTitle,
          reportSummary: talent.reportSummary,
          exampleRoles: talent.exampleRoles,
          score: s.score,
          max: s.max,
        };
      })
      .filter(Boolean) as RankedTalent[];
    ranked.sort((a, b) => {
      const pctA = a.max > 0 ? a.score / a.max : 0;
      const pctB = b.max > 0 ? b.score / b.max : 0;
      return pctB - pctA;
    });
    const summary = activeTab === "genotipo" ? genotipoSummary : neurotalentoSummary;
    try {
      await exportTalentModelPDF(ranked, activeTab, userName, undefined, summary);
    } catch (err) {
      console.error('Error exporting PDF:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const btnStyle = (color: string, loading: boolean) => ({
    padding: "8px 14px",
    fontSize: "13px",
    fontWeight: "600" as const,
    color: "#fff",
    background: loading ? "#9ca3af" : color,
    border: "none",
    borderRadius: "6px",
    cursor: loading ? "not-allowed" : "pointer",
    transition: "all 0.2s",
    whiteSpace: "nowrap" as const,
  });

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      {/* Tabs + botón legacy */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          borderBottom: "2px solid #e5e7eb",
          marginBottom: "16px",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => setActiveTab("genotipo")}
            style={{
              padding: "12px 24px",
              fontSize: "15px",
              fontWeight: "600",
              color: activeTab === "genotipo" ? "#fff" : "#666",
              background: activeTab === "genotipo" ? "#1a1d29" : "transparent",
              border: "none",
              borderRadius: "8px 8px 0 0",
              cursor: "pointer",
            }}
          >
            Mapa Genotipo
          </button>
          <button
            onClick={() => setActiveTab("neurotalento")}
            style={{
              padding: "12px 24px",
              fontSize: "15px",
              fontWeight: "600",
              color: activeTab === "neurotalento" ? "#fff" : "#666",
              background: activeTab === "neurotalento" ? "#1a1d29" : "transparent",
              border: "none",
              borderRadius: "8px 8px 0 0",
              cursor: "pointer",
            }}
          >
            Mapa Neurotalento
          </button>
        </div>
        <button
          onClick={handleExport}
          disabled={isExporting}
          style={btnStyle("#DC2626", isExporting)}
        >
          {isExporting ? "Exportando..." : `Exportar ${activeTab === "genotipo" ? "Genotipo" : "Neurotalento"}`}
        </button>
      </div>

      {/* Botones nuevos PDF */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px" }}>
        <button
          onClick={() => handleDownload('informe', 'genotipo')}
          disabled={loadingBtn === 'informe-genotipo'}
          style={btnStyle("#1d4ed8", loadingBtn === 'informe-genotipo')}
        >
          {loadingBtn === 'informe-genotipo' ? '⏳ Generando...' : '📄 Informe Genotipo'}
        </button>
        <button
          onClick={() => handleDownload('informe', 'neurotalento')}
          disabled={loadingBtn === 'informe-neurotalento'}
          style={btnStyle("#7c3aed", loadingBtn === 'informe-neurotalento')}
        >
          {loadingBtn === 'informe-neurotalento' ? '⏳ Generando...' : '📄 Informe Neurotalento'}
        </button>
        <button
          onClick={() => handleDownload('mapa', 'genotipo')}
          disabled={loadingBtn === 'mapa-genotipo'}
          style={btnStyle("#0f766e", loadingBtn === 'mapa-genotipo')}
        >
          {loadingBtn === 'mapa-genotipo' ? '⏳ Generando...' : '🗺️ Mapa Genotipo'}
        </button>
        <button
          onClick={() => handleDownload('mapa', 'neurotalento')}
          disabled={loadingBtn === 'mapa-neurotalento'}
          style={btnStyle("#b45309", loadingBtn === 'mapa-neurotalento')}
        >
          {loadingBtn === 'mapa-neurotalento' ? '⏳ Generando...' : '🗺️ Mapa Neurotalento'}
        </button>
      </div>

      {/* Summary input */}
      <div style={{ marginBottom: "20px" }}>
        <label
          htmlFor={`summary-${activeTab}`}
          style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "8px", color: "#374151" }}
        >
          {activeTab === "genotipo" ? "Resumen genotípico" : "Resumen neurocognitivo"} (opcional)
        </label>
        <textarea
          id={`summary-${activeTab}`}
          value={activeTab === "genotipo" ? genotipoSummary : neurotalentoSummary}
          onChange={(e) => {
            if (activeTab === "genotipo") setGenotipoSummary(e.target.value);
            else setNeurotalentoSummary(e.target.value);
          }}
          placeholder={`Escribe el ${activeTab === "genotipo" ? "resumen genotípico" : "resumen neurocognitivo"} aquí.`}
          style={{
            width: "100%",
            minHeight: "80px",
            padding: "12px",
            fontSize: "14px",
            lineHeight: "1.5",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            resize: "vertical",
            fontFamily: "inherit",
          }}
        />
        <div style={{ marginTop: "4px", fontSize: "11px", color: "#6b7280" }}>
          💡 El resumen se incluirá en todos los PDFs del modelo activo.
        </div>
      </div>

      {/* Rueda */}
      <div style={{ display: "flex", justifyContent: "center", padding: "20px" }}>
        {activeTab === "genotipo" ? (
          <TalentWheel scores={scores} showFullLabels={true} modelType="genotipo" summaryText={genotipoSummary} />
        ) : (
          <TalentWheel scores={scores} showFullLabels={true} modelType="neurotalento" summaryText={neurotalentoSummary} />
        )}
      </div>
    </div>
  );
}

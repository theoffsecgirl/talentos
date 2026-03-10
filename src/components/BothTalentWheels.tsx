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

export default function BothTalentWheels({
  scores,
  userName = "",
}: Props) {
  const [activeTab, setActiveTab] = useState<"genotipo" | "neurotalento">("genotipo");
  const [genotipoSummary, setGenotipoSummary] = useState("");
  const [neurotalentoSummary, setNeurotalentoSummary] = useState("");
  const [loadingBtn, setLoadingBtn] = useState<string | null>(null);

  // Construye el array RankedTalent ordenado por porcentaje desc
  const buildRanked = (): RankedTalent[] => {
    return scores
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
      .filter(Boolean)
      .sort((a, b) => {
        const pctA = (a as RankedTalent).max > 0 ? (a as RankedTalent).score / (a as RankedTalent).max : 0;
        const pctB = (b as RankedTalent).max > 0 ? (b as RankedTalent).score / (b as RankedTalent).max : 0;
        return pctB - pctA;
      }) as RankedTalent[];
  };

  // Exporta mapa usando html2pdf (mismo mecanismo que los botones G/N del admin)
  const handleExportMapa = async (modelo: "genotipo" | "neurotalento") => {
    const btnKey = `mapa-${modelo}`;
    setLoadingBtn(btnKey);
    try {
      const ranked = buildRanked();
      const summary = modelo === "genotipo" ? genotipoSummary : neurotalentoSummary;
      await exportTalentModelPDF(ranked, modelo, userName, undefined, summary);
    } catch (err) {
      console.error(`Error exportando mapa ${modelo}:`, err);
      alert("Error al generar el PDF. Inténtalo de nuevo.");
    } finally {
      setLoadingBtn(null);
    }
  };

  // Exporta informe usando la API route (generate-informe-pdf)
  const handleDownloadInforme = async (modelo: "genotipo" | "neurotalento") => {
    const btnKey = `informe-${modelo}`;
    setLoadingBtn(btnKey);
    try {
      const scoresRecord: Record<string, number> = {};
      const KEY_MAP: Record<number, string> = {
        1: 'estrategia', 2: 'analitico', 3: 'acompanamiento',
        4: 'gestion', 5: 'empatico', 6: 'imaginacion',
        7: 'profundo', 8: 'aplicado',
      };
      for (const s of scores) {
        const key = KEY_MAP[s.talentId];
        if (key) scoresRecord[key] = s.max > 0 ? Math.round((s.score / s.max) * 100) : 0;
      }
      const resumen = modelo === 'genotipo' ? genotipoSummary : neurotalentoSummary;
      const res = await fetch('/api/generate-informe-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: userName || 'Candidato',
          scores: scoresRecord,
          modelo,
          textoResumen: resumen || undefined,
        }),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(userName || 'talentos').toLowerCase().replace(/\s+/g, '-')}-informe-${modelo}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(`Error descargando informe ${modelo}:`, err);
      alert('Error al generar el informe. Inténtalo de nuevo.');
    } finally {
      setLoadingBtn(null);
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
      {/* Tabs */}
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
      </div>

      {/* Botones de descarga */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px" }}>
        <button
          onClick={() => handleDownloadInforme('genotipo')}
          disabled={!!loadingBtn}
          style={btnStyle("#1d4ed8", loadingBtn === 'informe-genotipo')}
        >
          {loadingBtn === 'informe-genotipo' ? '⏳ Generando...' : '📄 Informe Genotipo'}
        </button>
        <button
          onClick={() => handleDownloadInforme('neurotalento')}
          disabled={!!loadingBtn}
          style={btnStyle("#7c3aed", loadingBtn === 'informe-neurotalento')}
        >
          {loadingBtn === 'informe-neurotalento' ? '⏳ Generando...' : '📄 Informe Neurotalento'}
        </button>
        <button
          onClick={() => handleExportMapa('genotipo')}
          disabled={!!loadingBtn}
          style={btnStyle("#0f766e", loadingBtn === 'mapa-genotipo')}
        >
          {loadingBtn === 'mapa-genotipo' ? '⏳ Generando...' : '🗺️ Mapa Genotipo'}
        </button>
        <button
          onClick={() => handleExportMapa('neurotalento')}
          disabled={!!loadingBtn}
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

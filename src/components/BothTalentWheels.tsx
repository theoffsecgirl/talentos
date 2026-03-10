"use client";

import { useState } from "react";
import TalentWheel from "@/components/TalentWheel";
import { exportTalentModelPDF, exportInformePDF, type RankedTalent } from "@/lib/generateTalentModelPDF";
import { TALENTS } from "@/lib/talents";

type Score = {
  talentId: number;
  score: number;
  max: number;
};

type Props = {
  scores: Score[];
  userName?: string;
};

export default function BothTalentWheels({ scores, userName = "" }: Props) {
  const [activeTab, setActiveTab] = useState<"genotipo" | "neurotalento">("genotipo");
  const [genotipoSummary, setGenotipoSummary] = useState("");
  const [neurotalentoSummary, setNeurotalentoSummary] = useState("");
  const [loadingBtn, setLoadingBtn] = useState<string | null>(null);

  const buildRanked = (): RankedTalent[] =>
    scores
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
        } as RankedTalent;
      })
      .filter(Boolean)
      .sort((a, b) => {
        const pA = (a as RankedTalent).max > 0 ? (a as RankedTalent).score / (a as RankedTalent).max : 0;
        const pB = (b as RankedTalent).max > 0 ? (b as RankedTalent).score / (b as RankedTalent).max : 0;
        return pB - pA;
      }) as RankedTalent[];

  const handle = async (
    tipo: "mapa" | "informe",
    modelo: "genotipo" | "neurotalento"
  ) => {
    const key = `${tipo}-${modelo}`;
    setLoadingBtn(key);
    try {
      const ranked  = buildRanked();
      const summary = modelo === "genotipo" ? genotipoSummary : neurotalentoSummary;
      if (tipo === "mapa") {
        await exportTalentModelPDF(ranked, modelo, userName, undefined, summary);
      } else {
        await exportInformePDF(ranked, modelo, userName, summary);
      }
    } catch (err) {
      console.error(`Error exportando ${tipo} ${modelo}:`, err);
      alert("Error al generar el PDF. Inténtalo de nuevo.");
    } finally {
      setLoadingBtn(null);
    }
  };

  const btn = (label: string, key: string, color: string, onClick: () => void) => (
    <button
      key={key}
      onClick={onClick}
      disabled={!!loadingBtn}
      style={{
        padding: "8px 14px",
        fontSize: "13px",
        fontWeight: 600,
        color: "#fff",
        background: loadingBtn === key ? "#9ca3af" : color,
        border: "none",
        borderRadius: "6px",
        cursor: loadingBtn ? "not-allowed" : "pointer",
        whiteSpace: "nowrap" as const,
        transition: "all 0.2s",
      }}
    >
      {loadingBtn === key ? "⏳ Generando..." : label}
    </button>
  );

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", borderBottom: "2px solid #e5e7eb", marginBottom: "16px" }}>
        {(["genotipo", "neurotalento"] as const).map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            style={{
              padding: "12px 24px",
              fontSize: "15px",
              fontWeight: 600,
              color: activeTab === t ? "#fff" : "#666",
              background: activeTab === t ? "#1a1d29" : "transparent",
              border: "none",
              borderRadius: "8px 8px 0 0",
              cursor: "pointer",
            }}
          >
            {t === "genotipo" ? "Mapa Genotipo" : "Mapa Neurotalento"}
          </button>
        ))}
      </div>

      {/* Botones de descarga */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px" }}>
        {btn("🗺️ Mapa Genotipo",      "mapa-genotipo",      "#0f766e", () => handle("mapa",    "genotipo"))}
        {btn("🗺️ Mapa Neurotalento", "mapa-neurotalento", "#b45309", () => handle("mapa",    "neurotalento"))}
        {btn("📄 Informe Genotipo",    "informe-genotipo",   "#1d4ed8", () => handle("informe", "genotipo"))}
        {btn("📄 Informe Neurotalento","informe-neurotalento","#7c3aed", () => handle("informe", "neurotalento"))}
      </div>

      {/* Resumen */}
      <div style={{ marginBottom: "20px" }}>
        <label
          htmlFor={`summary-${activeTab}`}
          style={{ display: "block", fontSize: "14px", fontWeight: 600, marginBottom: "8px", color: "#374151" }}
        >
          {activeTab === "genotipo" ? "Resumen genotípico" : "Resumen neurocognitivo"} (opcional)
        </label>
        <textarea
          id={`summary-${activeTab}`}
          value={activeTab === "genotipo" ? genotipoSummary : neurotalentoSummary}
          onChange={e => activeTab === "genotipo" ? setGenotipoSummary(e.target.value) : setNeurotalentoSummary(e.target.value)}
          placeholder={`Escribe el ${activeTab === "genotipo" ? "resumen genotípico" : "resumen neurocognitivo"} aquí.`}
          style={{
            width: "100%",
            minHeight: "80px",
            padding: "12px",
            fontSize: "14px",
            lineHeight: 1.5,
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            resize: "vertical",
            fontFamily: "inherit",
          }}
        />
        <div style={{ marginTop: "4px", fontSize: "11px", color: "#6b7280" }}>
          💡 El resumen aparece en portada del informe y en el banner del mapa.
        </div>
      </div>

      {/* Rueda */}
      <div style={{ display: "flex", justifyContent: "center", padding: "20px" }}>
        {activeTab === "genotipo" ? (
          <TalentWheel scores={scores} showFullLabels modelType="genotipo" summaryText={genotipoSummary} />
        ) : (
          <TalentWheel scores={scores} showFullLabels modelType="neurotalento" summaryText={neurotalentoSummary} />
        )}
      </div>
    </div>
  );
}

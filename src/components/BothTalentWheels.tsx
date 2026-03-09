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
  scores: Score[];
  userName?: string;
  submissionId?: string;
  initialGenotipoSummary?: string;
  initialNeurotalentoSummary?: string;
};

export default function BothTalentWheels({ 
  scores, 
  userName = "", 
  submissionId,
  initialGenotipoSummary = "",
  initialNeurotalentoSummary = ""
}: Props) {
  const [activeTab, setActiveTab] = useState<"genotipo" | "neurotalento">("genotipo");
  const [genotipoSummary, setGenotipoSummary] = useState(initialGenotipoSummary);
  const [neurotalentoSummary, setNeurotalentoSummary] = useState(initialNeurotalentoSummary);
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string>("");

  const handleSave = async () => {
    if (!submissionId) {
      setSaveStatus("❌ Sin submissionId");
      return;
    }
    
    setIsSaving(true);
    setSaveStatus("");
    
    try {
      const response = await fetch('/api/submissions/update-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId,
          genotipoSummary,
          neurotalentoSummary,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      setSaveStatus("✓ Guardado " + new Date().toLocaleTimeString());
      setTimeout(() => setSaveStatus(""), 3000);
    } catch (err) {
      console.error('Error saving:', err);
      setSaveStatus("❌ Error al guardar");
    } finally {
      setIsSaving(false);
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

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          borderBottom: "2px solid #e5e7eb",
          marginBottom: "30px",
          alignItems: "center",
          justifyContent: "space-between",
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
              transition: "all 0.2s",
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
              transition: "all 0.2s",
            }}
          >
            Mapa Neurotalento
          </button>
        </div>

        {/* Export button */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={handleExport}
            disabled={isExporting}
            style={{
              padding: "8px 16px",
              fontSize: "14px",
              fontWeight: "600",
              color: "#fff",
              background: isExporting ? "#9ca3af" : "#DC2626",
              border: "none",
              borderRadius: "6px",
              cursor: isExporting ? "not-allowed" : "pointer",
              transition: "all 0.2s",
            }}
          >
            {isExporting ? "Exportando..." : `Exportar ${activeTab === "genotipo" ? "Genotipo" : "Neurotalento"}`}
          </button>
        </div>
      </div>

      {/* Summary input field */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <label
            htmlFor={`summary-${activeTab}`}
            style={{
              fontSize: "14px",
              fontWeight: "600",
              color: "#374151",
            }}
          >
            {activeTab === "genotipo" ? "Resumen genotípico" : "Resumen neurocognitivo"} (opcional)
          </label>
          {submissionId && (
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              {saveStatus && (
                <span style={{ fontSize: "12px", color: saveStatus.includes("✓") ? "#10b981" : "#ef4444" }}>
                  {saveStatus}
                </span>
              )}
              <button
                onClick={handleSave}
                disabled={isSaving}
                style={{
                  padding: "6px 12px",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#fff",
                  background: isSaving ? "#9ca3af" : "#10b981",
                  border: "none",
                  borderRadius: "6px",
                  cursor: isSaving ? "not-allowed" : "pointer",
                  transition: "all 0.2s",
                }}
              >
                {isSaving ? "Guardando..." : "Guardar resumen"}
              </button>
            </div>
          )}
        </div>
        <textarea
          id={`summary-${activeTab}`}
          value={activeTab === "genotipo" ? genotipoSummary : neurotalentoSummary}
          onChange={(e) => {
            if (activeTab === "genotipo") {
              setGenotipoSummary(e.target.value);
            } else {
              setNeurotalentoSummary(e.target.value);
            }
          }}
          placeholder={`Escribe el ${activeTab === "genotipo" ? "resumen genotípico" : "resumen neurocognitivo"} aquí...`}
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
      </div>

      {/* Content */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "20px",
        }}
      >
        {activeTab === "genotipo" ? (
          <TalentWheel
            scores={scores}
            showFullLabels={true}
            modelType="genotipo"
            summaryText={genotipoSummary}
          />
        ) : (
          <TalentWheel
            scores={scores}
            showFullLabels={true}
            modelType="neurotalento"
            summaryText={neurotalentoSummary}
          />
        )}
      </div>
    </div>
  );
}

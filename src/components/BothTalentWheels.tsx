"use client";

import { useState, useEffect, useCallback } from "react";
import TalentWheel from "@/components/TalentWheel";
import { exportTalentModelPDF, type RankedTalent } from "@/lib/generateTalentModelPDF";
import { TALENTS } from "@/lib/talents";
import { debounce } from "@/lib/utils";

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
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // Save function
  const saveSummary = async (genotipo: string, neurotalento: string) => {
    if (!submissionId) {
      console.log('[BothTalentWheels] No submissionId, skipping save');
      return;
    }
    
    console.log('[BothTalentWheels] Saving summaries...', { submissionId, genotipo: genotipo.slice(0, 50), neurotalento: neurotalento.slice(0, 50) });
    setIsSaving(true);
    
    try {
      const response = await fetch('/api/submissions/update-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId,
          genotipoSummary: genotipo,
          neurotalentoSummary: neurotalento,
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[BothTalentWheels] Save failed:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('[BothTalentWheels] Save successful:', result);
      setLastSaved(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('[BothTalentWheels] Error saving summary:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Debounced version
  const debouncedSave = useCallback(
    debounce((genotipo: string, neurotalento: string) => {
      saveSummary(genotipo, neurotalento);
    }, 1500),
    [submissionId]
  );

  // Auto-save when summaries change
  useEffect(() => {
    console.log('[BothTalentWheels] Summary changed, triggering debounced save');
    if (submissionId) {
      debouncedSave(genotipoSummary, neurotalentoSummary);
    }
  }, [genotipoSummary, neurotalentoSummary, debouncedSave, submissionId]);

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

        {/* Export button + save indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {isSaving && (
            <span style={{ fontSize: "12px", color: "#9ca3af" }}>Guardando...</span>
          )}
          {!isSaving && lastSaved && (
            <span style={{ fontSize: "12px", color: "#10b981" }}>✓ Guardado {lastSaved}</span>
          )}
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
        <label
          htmlFor={`summary-${activeTab}`}
          style={{
            display: "block",
            fontSize: "14px",
            fontWeight: "600",
            marginBottom: "8px",
            color: "#374151",
          }}
        >
          {activeTab === "genotipo" ? "Resumen genotípico" : "Resumen neurocognitivo"} (opcional)
        </label>
        <textarea
          id={`summary-${activeTab}`}
          value={activeTab === "genotipo" ? genotipoSummary : neurotalentoSummary}
          onChange={(e) => {
            console.log('[BothTalentWheels] Textarea changed:', e.target.value.slice(0, 50));
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
        {submissionId && (
          <div style={{ marginTop: "4px", fontSize: "11px", color: "#6b7280" }}>
            ID: {submissionId}
          </div>
        )}
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

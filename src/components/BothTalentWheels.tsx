"use client";

import { useState } from "react";
import TalentWheel from "@/components/TalentWheel";

type Score = {
  talentId: number;
  score: number;
  max: number;
};

type Props = {
  scores: Score[];
};

export default function BothTalentWheels({ scores }: Props) {
  const [activeTab, setActiveTab] = useState<"genotipo" | "neurotalento">("genotipo");
  const [genotipoSummary, setGenotipoSummary] = useState("");
  const [neurotalentoSummary, setNeurotalentoSummary] = useState("");

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          borderBottom: "2px solid #e5e7eb",
          marginBottom: "30px",
        }}
      >
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
          onChange={(e) =>
            activeTab === "genotipo"
              ? setGenotipoSummary(e.target.value)
              : setNeurotalentoSummary(e.target.value)
          }
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

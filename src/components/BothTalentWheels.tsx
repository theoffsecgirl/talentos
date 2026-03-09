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
            color: activeTab === "genotipo" ? "#111" : "#666",
            background: activeTab === "genotipo" ? "#1a1d29" : "transparent",
            border: "none",
            borderRadius: "8px 8px 0 0",
            cursor: "pointer",
            transition: "all 0.2s",
            ...(activeTab === "genotipo" && { color: "#fff" }),
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
            color: activeTab === "neurotalento" ? "#111" : "#666",
            background: activeTab === "neurotalento" ? "#1a1d29" : "transparent",
            border: "none",
            borderRadius: "8px 8px 0 0",
            cursor: "pointer",
            transition: "all 0.2s",
            ...(activeTab === "neurotalento" && { color: "#fff" }),
          }}
        >
          Mapa Neurotalento
        </button>
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
          <TalentWheel scores={scores} showFullLabels={true} modelType="genotipo" />
        ) : (
          <TalentWheel scores={scores} showFullLabels={true} modelType="neurotalento" />
        )}
      </div>
    </div>
  );
}

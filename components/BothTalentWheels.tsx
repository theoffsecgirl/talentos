"use client";

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
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "40px",
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "20px",
      }}
    >
      {/* Mapa Genotipo */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <h2
          style={{
            fontSize: "20px",
            fontWeight: "700",
            color: "#111",
            textAlign: "center",
          }}
        >
          MAPA GENOTIPO
        </h2>
        <TalentWheel scores={scores} showFullLabels={true} modelType="genotipo" />
      </div>

      {/* Mapa Neurotalento */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <h2
          style={{
            fontSize: "20px",
            fontWeight: "700",
            color: "#111",
            textAlign: "center",
          }}
        >
          MAPA NEUROTALENTO
        </h2>
        <TalentWheel scores={scores} showFullLabels={true} modelType="neurotalento" />
      </div>
    </div>
  );
}

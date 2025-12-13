// CoverBack.tsx
import React from "react";
import CoverBackImage from "../../../common/assets/faq/cover_back.png";
import InsideCoverBackImage from "../../../common/assets/faq/inside_back_cover.png";

type CoverBackProps = {
  side?: "inside" | "outside";
};

const CoverBack: React.FC<CoverBackProps> = ({ side = "inside" }) => {
  const THICKNESS = 2;

  // If we want OUTSIDE facing camera, rotate the whole thing 180
  const containerRotate = side === "outside" ? "rotateY(180deg)" : "rotateY(0deg)";

  return (
    <div
      className="relative w-full h-full rounded-xl"
      style={{ transformStyle: "preserve-3d", transform: containerRotate }}
    >
      {/* INSIDE face */}
      <div
        className="absolute inset-0 overflow-hidden rounded-xl"
        style={{
          backfaceVisibility: "hidden",
          transform: `translateZ(${THICKNESS}px)`,
        }}
      >
        <img src={InsideCoverBackImage} alt="Inside back cover" className="w-full h-full object-fill" />
      </div>

      {/* OUTSIDE face (must be rotated 180 so it’s the opposite side) */}
      <div
        className="absolute inset-0 overflow-hidden rounded-xl"
        style={{
          backfaceVisibility: "hidden",
          transform: ` translateZ(${THICKNESS}px)`,
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3), 0 10px 30px rgba(0, 0, 0, 0.2)",
        }}
      >
        <img src={CoverBackImage} alt="Back cover" className="w-full h-full object-fill" />
      </div>
    </div>
  );
};

export default CoverBack;

import React from "react";

type FlipSheetProps = {
  sheetRef: (el: HTMLDivElement | null) => void;
  frontSrc: string;
  backSrc: string;
  rounded?: string;      // e.g. "rounded-r-xl"
  zIndex: number;        // higher = on top
};

const FlipSheet: React.FC<FlipSheetProps> = ({
  sheetRef,
  frontSrc,
  backSrc,
  rounded = "rounded-r-xl",
  zIndex,
}) => {
  return (
    <div
      ref={sheetRef}
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
      style={{
        transformStyle: "preserve-3d",
        transformOrigin: "left center",
        willChange: "transform",
        zIndex,
        backfaceVisibility: "visible", // IMPORTANT: keep draggable even when turned
      }}
    >
      {/* FRONT */}
      <div
        className={`absolute inset-0 overflow-hidden ${rounded}`}
        style={{
          backfaceVisibility: "hidden",
          transform: "translateZ(0.1px)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.22), 0 10px 30px rgba(0,0,0,0.16)",
          pointerEvents: "none",
        }}
      >
        <img src={frontSrc} className="w-full h-full object-cover" draggable={false} />
      </div>

      {/* BACK */}
      <div
        className={`absolute inset-0 overflow-hidden ${rounded}`}
        style={{
          backfaceVisibility: "hidden",
          transform: "rotateY(180deg) translateZ(0.1px)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.22), 0 10px 30px rgba(0,0,0,0.16)",
          pointerEvents: "none",
        }}
      >
        <img src={backSrc} className="w-full h-full object-cover" draggable={false} />
      </div>
    </div>
  );
};

export default FlipSheet;

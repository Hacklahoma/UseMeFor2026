import React from "react";
import FlipSheet from "./FlipSheet";

import BrownPaper from "../../../common/assets/faq/base_brownpaper.jpg";
import WhitePaper from "../../../common/assets/faq/base_whitepaper.jpg";
import Page3Front from "../../../common/assets/faq/base_texturedbrown.jpg";
import Page3Back from "../../../common/assets/faq/base_texturedbrown.jpg";
import Page4Front from "../../../common/assets/faq/base_whitepaper.jpg";
import Page4Back from "../../../common/assets/faq/base_brownpaper.jpg";

type Page1Props = {
  setSheetRef: (index: number) => (el: HTMLDivElement | null) => void;
};

const Page1: React.FC<Page1Props> = ({ setSheetRef }) => {
  return (
    <div className="relative w-full h-full" style={{ transformStyle: "preserve-3d" }}>
      {/* RIGHT HALF */}
      <div className="absolute inset-y-0 left-1/2 w-1/2" style={{ transformStyle: "preserve-3d" }}>
        {/* Stack order: highest zIndex flips first */}
        <FlipSheet
          sheetRef={setSheetRef(0)}   // Page 1 (top)
          frontSrc={BrownPaper}
          backSrc={BrownPaper}
          zIndex={400}
        />
        <FlipSheet
          sheetRef={setSheetRef(1)}   // Page 2
          frontSrc={WhitePaper}
          backSrc={WhitePaper}
          zIndex={300}
        />
        <FlipSheet
          sheetRef={setSheetRef(2)}   // Page 3
          frontSrc={Page3Front}
          backSrc={Page3Back}
          zIndex={200}
        />
        <FlipSheet
          sheetRef={setSheetRef(3)}   // Page 4 (bottom-most page)
          frontSrc={Page4Front}
          backSrc={Page4Back}
          zIndex={100}
        />
      </div>

      {/* Optional spine shadow */}
      <div
        className="absolute top-0 left-1/2 h-full w-10 pointer-events-none"
        style={{
          transform: "translateX(-50%)",
          background: "linear-gradient(to right, rgba(0,0,0,0.18), rgba(0,0,0,0), rgba(0,0,0,0.18))",
          opacity: 0.22,
          zIndex: 50,
        }}
      />
    </div>
  );
};

export default Page1;

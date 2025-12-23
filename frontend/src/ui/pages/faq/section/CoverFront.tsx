import React from "react";
import CoverFrontImage from "../../../common/assets/faq/cover_front.png";
import Stars1 from "../../../common/assets/faq/stars1.png";
import Stars2 from "../../../common/assets/faq/stars2.png";
import LetterH from "../../../common/assets/faq/letters/h.png";
import LetterA from "../../../common/assets/faq/letters/a.png";
import LetterC from "../../../common/assets/faq/letters/c.png";
import LetterK from "../../../common/assets/faq/letters/k.png";
import LetterE from "../../../common/assets/faq/letters/e.png";
import LetterR from "../../../common/assets/faq/letters/r.png";
import LetterG from "../../../common/assets/faq/letters/g.png";
import LetterU from "../../../common/assets/faq/letters/u.png";
import LetterI from "../../../common/assets/faq/letters/i.png";
import LetterD from "../../../common/assets/faq/letters/d.png";
import LetterE2 from "../../../common/assets/faq/letters/e_2.png";

type Letter = { id: string; src: string; className: string };

const Letters: Letter[] = [
  { id: "H", src: LetterH, className: "left-[13%] top-[36%] rotate-[-8deg]" },
  { id: "A", src: LetterA, className: "left-[26%] top-[37%] rotate-[4deg]" },
  { id: "C", src: LetterC, className: "left-[40%] top-[36%] rotate-[-3deg]" },
  { id: "K", src: LetterK, className: "left-[56%] top-[37%] rotate-[2deg]" },
  { id: "E", src: LetterE, className: "left-[70%] top-[36%] rotate-[-1deg]" },
  { id: "R", src: LetterR, className: "left-[83%] top-[37%] rotate-[1deg]" },
  { id: "G", src: LetterG, className: "left-[20%] top-[51%] rotate-[5deg]" },
  { id: "U", src: LetterU, className: "left-[36%] top-[52%] rotate-[5deg]" },
  { id: "I", src: LetterI, className: "left-[53%] top-[51%] rotate-[5deg]" },
  { id: "D", src: LetterD, className: "left-[60%] top-[51%] rotate-[5deg]" },
  { id: "E2", src: LetterE2, className: "left-[72%] top-[51%] rotate-[5deg]" },
];

const CoverFront: React.FC = () => {
  const THICKNESS = 2;

  return (
    <div
      className="relative w-[85vw] max-w-[320px] sm:max-w-[420px] md:max-w-[500px] lg:max-w-[450px] aspect-[3/4] rounded-xl"
      style={{ transformStyle: "preserve-3d" }}
    >
      {/* OUTSIDE front cover */}
      <div
        className="absolute inset-0 overflow-hidden rounded-xl"
        style={{
          backfaceVisibility: "hidden",
          transform: `translateZ(${THICKNESS}px)`,
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3), 0 10px 30px rgba(0, 0, 0, 0.2)",
        }}
      >
        <img src={CoverFrontImage} alt="Diary cover" className="w-full h-full object-fill" />

        <img
          src={Stars1}
          alt="Stars decoration"
          className="absolute top-[20%] left-[9%] w-[18%] sm:w-[20%] h-auto drop-shadow-lg animate-float-spin"
          style={{ animationDelay: "0.5s" }}
        />
        <img
          src={Stars2}
          alt="Stars decoration"
          className="absolute top-[8%] left-[25%] w-[14%] sm:w-[15%] h-auto drop-shadow-lg animate-float-spin-reverse"
          style={{ animationDelay: "0.1s" }}
        />

        {Letters.map((letter, index) => (
          <img
            key={letter.id}
            src={letter.src}
            alt={letter.id}
            className={`absolute h-[10%] sm:h-[11%] md:h-[12%] w-auto drop-shadow-xl animate-float object-contain ${letter.className}`}
            style={{
              animationDelay: `${index * 0.04}s`,
              backfaceVisibility: "hidden",
            }}
          />
        ))}
      </div>

    </div>
  );
};

export default CoverFront;

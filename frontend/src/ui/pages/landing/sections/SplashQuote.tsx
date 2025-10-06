import React from "react";
import Equation from "../../../common/assets/eq.png";
// Uses global background from page wrapper

const SplashQuote: React.FC = () => {
  return (
    // <div className="h-screen w-full min-w-[380px] bg-[#F5F5DC] flex items-center justify-center px-8">
    <div className="relative min-h-[100svh] w-full min-w-[380px] flex items-center justify-center px-8 overflow-hidden m-0 py-16">
      {/* Equation image at top center */}
      <img
        src={Equation}
        alt="Equation graphic"
        className="absolute top-6 left-[15%] -translate-x-1/2 w-16 md:w-20 lg:w-24 h-auto z-10 opacity-3 pointer-events-none select-none"
      />
      <div className="relative z-10 text-center max-w-4xl">
        <blockquote className="text-4xl font-medium text-[#3D472C] leading-relaxed">
          "There's never been a better time to build something"
        </blockquote>
      </div>
    </div>
  );
};

export default SplashQuote;

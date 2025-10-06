import React from "react";

const SplashQuote: React.FC = () => {
  return (
    <div className="h-screen w-full min-w-[380px] bg-[#F5F5DC] flex items-center justify-center px-8">
      <div className="text-center max-w-4xl">
        <blockquote className="text-4xl font-medium text-[#3D472C] leading-relaxed">
          "There's never been a better time to build something"
        </blockquote>
      </div>
    </div>
  );
};

export default SplashQuote;

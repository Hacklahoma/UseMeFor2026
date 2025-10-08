import React from 'react';
// Uses global background from page wrapper

const SplashQuote: React.FC = () => {
  return (
    // <div className="h-screen w-full min-w-[380px] bg-[#F5F5DC] flex items-center justify-center px-8">
    <div className="relative min-h-[100svh] w-full min-w-[380px] flex items-center justify-center px-8 overflow-hidden m-0 py-16">
      <div className="relative z-10 text-center max-w-4xl">
        <blockquote className="text-4xl font-medium text-[#3D472C] leading-relaxed">
          "There's never been a better time to build something"
        </blockquote>
      </div>
    </div>
  );
};

export default SplashQuote;

import React from 'react';
import Postcard from '../../../common/assets/Postcard.png';

const PhotoCollage: React.FC = () => {
  const postcards = [
    // Main center postcard
    { widthClass: 'w-80 md:w-[32rem] lg:w-[40rem]', rotate: 5, top: '50%', left: '50%', opacity: 100, shadow: '2xl', zIndex: 5 },
    // Top left of cluster
    { widthClass: 'w-64 md:w-[26rem] lg:w-[32rem]', rotate: -15, top: '35%', left: '35%', opacity: 90, shadow: 'lg', zIndex: 4 },
    // Top right of cluster
    { widthClass: 'w-[17rem] md:w-[28rem] lg:w-[34rem]', rotate: 20, top: '38%', left: '63%', opacity: 85, shadow: 'lg', zIndex: 3 },
    // Bottom left of cluster
    { widthClass: 'w-[16.5rem] md:w-[27rem] lg:w-[33rem]', rotate: -8, top: '60%', left: '38%', opacity: 88, shadow: 'lg', zIndex: 2 },
    // Bottom right of cluster
    { widthClass: 'w-[17.5rem] md:w-[29rem] lg:w-[35rem]', rotate: 12, top: '62%', left: '60%', opacity: 92, shadow: 'lg', zIndex: 1 },
  ];

  return (
    <section className="relative min-h-[150svh] w-full min-w-[380px] overflow-hidden m-0 py-16">
      {/* Centered quote above postcards */}
      <div className="absolute top-8 sm:top-5 md:top-10 lg:top-20 xl:top-25 2xl:top-30 left-1/2 -translate-x-1/2 px-4 sm:px-6 z-20">
        <p className="text-center text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-medium text-[#3D472C] max-w-xs sm:max-w-sm md:max-w-2xl lg:max-w-4xl leading-relaxed">
          That's why we're giving you free food, merch, and 24 hours in Norman, Oklahoma to make something cool!
        </p>
      </div>

      {/* Centered postcard cluster */}
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <div className="relative w-full max-w-5xl h-96">
          {postcards.map((card, index) => (
            <img
              key={index}
              src={Postcard}
              alt="Vintage postcard"
              className={`absolute ${card.widthClass} drop-shadow-${card.shadow} select-none pointer-events-none`}
              style={{
                top: card.top,
                left: card.left,
                transform: `translate(-50%, -50%) rotate(${card.rotate}deg)`,
                opacity: card.opacity / 100,
                zIndex: card.zIndex,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PhotoCollage;
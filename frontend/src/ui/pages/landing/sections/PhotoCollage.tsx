import React from 'react';
import Postcard from '../../../common/assets/Postcard.png';
import MapOutline from '../../../common/assets/OK_Norman_706465_1936_625002.png';
import Equation from '../../../common/assets/eq.png';

const PhotoCollage: React.FC = () => {
  return (
    <section className="relative min-h-[150svh] w-full min-w-[380px] overflow-hidden m-0 py-16">
      {/* Centered quote above postcards */}
      <div className="absolute top-8 sm:top-5 md:top-10 lg:top-20 xl:top-25 2xl:top-30 left-1/2 -translate-x-1/2 px-4 sm:px-6 z-10">
        <p className="text-center text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-medium text-[#3D472C] max-w-xs sm:max-w-sm md:max-w-2xl lg:max-w-4xl leading-relaxed">
          That's why we're giving you free food, merch, and 24 hours in Norman, Oklahoma to make something cool!
        </p>
      </div>

      {/* Centered postcard cluster */}
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        {/* Central cluster of scattered postcards */}
        <div className="relative w-full max-w-[60%]">
          {/* Main center postcard */}
          <img
            src={Postcard}
            alt="Vintage postcard"
            className="w-80 md:w-96 lg:w-[28rem] rotate-[5deg] drop-shadow-2xl select-none pointer-events-none"
          />
          
          {/* Top left of cluster */}
          <img
            src={Postcard}
            alt="Vintage postcard"
            className="absolute -top-20 -left-24 w-64 md:w-72 rotate-[-15deg] drop-shadow-lg opacity-90 select-none pointer-events-none"
          />
          
          {/* Top right of cluster */}
          <img
            src={Postcard}
            alt="Vintage postcard"
            className="absolute -top-16 -right-20 w-68 md:w-76 rotate-[20deg] drop-shadow-lg opacity-85 select-none pointer-events-none"
          />
          
          {/* Bottom left of cluster */}
          <img
            src={Postcard}
            alt="Vintage postcard"
            className="absolute -bottom-16 -left-18 w-66 md:w-74 rotate-[-8deg] drop-shadow-lg opacity-88 select-none pointer-events-none"
          />
          
          {/* Bottom right of cluster */}
          <img
            src={Postcard}
            alt="Vintage postcard"
            className="absolute -bottom-12 -right-16 w-70 md:w-78 rotate-[12deg] drop-shadow-lg opacity-92 select-none pointer-events-none"
          />
          
          
        </div>
      </div>
    </section>
  );
};

export default PhotoCollage;
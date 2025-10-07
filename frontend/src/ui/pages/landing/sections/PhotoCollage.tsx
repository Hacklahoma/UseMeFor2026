import React from 'react';
import * as motion from "motion/react-client"
import type { Variants } from "motion/react"
import PhotoImage from '../../../common/assets/Postcard.png';

const PhotoCollage: React.FC = () => {
  const photoItems = [
    // Main center photo
    { widthClass: 'w-80 md:w-[32rem] lg:w-[40rem]', rotate: 5, top: '50%', left: '50%', opacity: 100, shadow: '2xl', zIndex: 5 },
    // Top left photo
    { widthClass: 'w-64 md:w-[26rem] lg:w-[32rem]', rotate: -15, top: '35%', left: '35%', opacity: 90, shadow: 'lg', zIndex: 4 },
    // Top right photo
    { widthClass: 'w-[17rem] md:w-[28rem] lg:w-[34rem]', rotate: 20, top: '38%', left: '63%', opacity: 85, shadow: 'lg', zIndex: 3 },
    // Bottom left photo
    { widthClass: 'w-[16.5rem] md:w-[27rem] lg:w-[33rem]', rotate: -8, top: '60%', left: '38%', opacity: 88, shadow: 'lg', zIndex: 2 },
    // Bottom right photo
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

      {/* Centered photo collage cluster */}
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <motion.div 
          className="photo-collage-container relative w-full h-96"
          initial="offscreen"
          whileInView="onscreen"
          viewport={{ amount: 0.3 }}
        >
          {photoItems.map((item, index) => {
            // Determine if photo is on the right side (top right and bottom right)
            const isRightSide = index === 2 || index === 4; // Top right and bottom right photos
            
            // Calculate delay based on z-index (lower z-index = earlier animation)
            // Lower z-index should have less delay (animate first)
            const animationDelay = (item.zIndex - 1) * 0.15;
            
            return (
              <motion.img
                key={index}
                src={PhotoImage}
                alt="Photo collage item"
                className={`absolute ${item.widthClass} drop-shadow-${item.shadow} select-none pointer-events-none`}
                style={{
                  top: item.top,
                  left: item.left,
                  opacity: item.opacity / 100,
                  zIndex: item.zIndex,
                }}
                variants={photoItemVariants}
                custom={{ rotate: item.rotate, delay: animationDelay, fromRight: isRightSide }}
              />
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

// Global variable for off-screen distance
const OFF_SCREEN_DISTANCE = "100vw";

const photoItemVariants: Variants = {
  offscreen: (custom: { fromRight: boolean }) => ({
    x: custom.fromRight ? OFF_SCREEN_DISTANCE : `-${OFF_SCREEN_DISTANCE}`, // Start off screen using global variable
    translateX: "-50%",
    translateY: "-50%",
    rotate: 0,
    opacity: 0,
  }),
  onscreen: (custom: { rotate: number; delay: number; fromRight: boolean }) => ({
    x: 0, // Move to final position
    translateX: "-50%",
    translateY: "-50%",
    rotate: custom.rotate, // Apply the card's specific rotation
    opacity: 1,
    transition: {
      type: "spring",
      bounce: 0.3,
      duration: 0.8,
      delay: custom.delay, // Stagger the animations
    },
  }),
};

export default PhotoCollage;
import React, { useState } from 'react';
import * as motion from "motion/react-client"
import type { Variants } from "motion/react"
import PhotoImage from '../../../common/assets/Postcard.png';
import CollageArrow from '../../../common/assets/nav-arrow.svg';

// Global scale value for all photo items
const SCALE_VALUE = 0.7;

const PhotoCollage: React.FC = () => {
  const [isInView, setIsInView] = useState(false);
  
  // Base photo configuration - all cards have same size now
  const basePhotoItems = [
    // Main center photo
    { rotate: 0, top: '50%', left: '50%', opacity: 100, shadow: '2xl', baseZIndex: 5 },
    // Top left photo
    { rotate: -8, top: '40%', left: '42%', opacity: 90, shadow: 'lg', baseZIndex: 4 },
    // Top right photo
    { rotate: 14, top: '39%', left: '60%', opacity: 85, shadow: 'lg', baseZIndex: 3 },
    // Bottom left photo
    { rotate: -8, top: '60%', left: '40%', opacity: 88, shadow: 'lg', baseZIndex: 2 },
    // Bottom right photo
    { rotate: 12, top: '62%', left: '60%', opacity: 92, shadow: 'lg', baseZIndex: 1 },
  ];

  // State to track current zIndex rotation - maps card index to current zIndex
  // Initial: [5, 4, 3, 2, 1] (card 0 has z5, card 1 has z4, etc.)
  const [zIndexMap, setZIndexMap] = useState<number[]>([5, 4, 3, 2, 1]);

  // Shuffle function: move highest zIndex to the back (becomes zIndex 1)
  const shuffleForward = () => {
    setZIndexMap(prev => {
      // Map each zIndex: 5→1, others increment
      return prev.map(zIndex => zIndex === 5 ? 1 : zIndex + 1);
    });
  };

  // Shuffle function: move lowest zIndex to the front (becomes zIndex 5)
  const shuffleBackward = () => {
    setZIndexMap(prev => {
      // Map each zIndex: 1→5, others decrement
      return prev.map(zIndex => zIndex === 1 ? 5 : zIndex - 1);
    });
  };

  // Create photo items with current zIndex mapping and same size
  const photoItems = basePhotoItems.map((item, index) => ({
    ...item,
    widthClass: 'w-80 md:w-[32rem] lg:w-[40rem]', // Same size for all
    zIndex: zIndexMap[index],
  }));

  return (
    <section className="root-containerrelative h-auto w-full min-w-[380px] overflow-hidden m-0">

      {/* Proper flexbox container for centering content */}
      <div className="flexbox-container flex flex-col justify-center items-center h-full min-h-[calc(100vh-8rem)] ">

        {/* Quote section - now properly positioned in flex layout */}
        <div className="px-4 sm:px-6 z-20 max-w-xs sm:max-w-sm md:max-w-2xl lg:max-w-4xl">

          <p className="text-center text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-medium text-[#3D472C] leading-relaxed">
            That's why we're giving you free food, merch, and 24 hours in Norman, Oklahoma to make something cool!
          </p>

        </div>

        <div className="photo-collage-parent-container relative w-full z-10 flex items-center justify-center">

          <motion.button 
            className="left-arrow relative opacity-20 cursor-pointer bg-transparent border-none p-0 hidden custom600:flex items-center justify-center mr-5"
            aria-label="Previous photo"
            onClick={shuffleBackward}
            whileHover={{ 
              opacity: .8, 
              scale: 1.15
            }}
            whileTap={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <motion.img 
              src={CollageArrow} 
              alt="Left arrow" 
              className="w-16 h-16 md:w-20 md:h-20 pointer-events-none aspect-square object-contain" 
              initial={{ rotate: -90 }}
              animate={{ rotate: -90 }}
            />
          </motion.button>

          {/* Photo collage section - now properly positioned in flex layout */}
          <motion.div 
            className="photo-collage-container relative w-2/3 flex-shrink-0 h-[16rem] md:h-[32rem] lg:h-[40rem] xl:h-[48rem] overflow-visible"
            onViewportEnter={() => setIsInView(true)}
            onViewportLeave={() => setIsInView(false)}
            viewport={{ amount: 0.8 }}
          >
            {photoItems.map((item, index) => (
              <PhotoCollageItem
                key={index}
                item={item}
                index={index}
                isInView={isInView}
              />
            ))}
          </motion.div>

          <motion.button 
            className="right-arrow relative opacity-20 cursor-pointer bg-transparent border-none p-0 hidden custom600:flex items-center justify-center ml-5"
            aria-label="Next photo"
            onClick={shuffleForward}
            whileHover={{ 
              opacity: .8, 
              scale: 1.15
            }}
            whileTap={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <motion.img 
              src={CollageArrow} 
              alt="Right arrow" 
              className="w-16 h-16 md:w-20 md:h-20 pointer-events-none aspect-square object-contain" 
              initial={{ rotate: 90 }}
              animate={{ rotate: 90 }}
            />
          </motion.button>
        </div>
      </div>
    </section>
  );
};

interface PhotoCollageItemProps {
  item: {
    widthClass: string;
    rotate: number;
    top: string;
    left: string;
    opacity: number;
    shadow: string;
    zIndex: number;
  };
  index: number;
  isInView: boolean;
}

function PhotoCollageItem({ item, index, isInView }: PhotoCollageItemProps) {
  
  // Determine if photo is on the right side (top right and bottom right)
  const isRightSide = index === 2 || index === 4; // Top right and bottom right photos
  
  // Calculate delay based on z-index (lower z-index = earlier animation)
  // Lower z-index should have less delay (animate first)
  const animationDelay = (item.zIndex - 1) * 0.15;
  
  // Calculate exit delay (reversed order - higher z-index exits first)
  // Max z-index is 5, so (5 - zIndex) gives reverse order
  const maxZIndex = 5;
  const exitDelay = (maxZIndex - item.zIndex) * 0.15 * 0.5;

  // Adjust opacity and shadow based on current zIndex (higher zIndex = more prominent)
  const opacityMap: { [key: number]: number } = {
    5: 100,
    4: 90,
    3: 85,
    2: 88,
    1: 92,
  };
  const shadowMap: { [key: number]: string } = {
    5: '2xl',
    4: 'lg',
    3: 'lg',
    2: 'lg',
    1: 'lg',
  };

  const currentOpacity = opacityMap[item.zIndex as keyof typeof opacityMap] || item.opacity;
  const currentShadow = shadowMap[item.zIndex as keyof typeof shadowMap] || item.shadow;
  
  return (
    <motion.img
      src={PhotoImage}
      alt="Photo collage item"
      className={`absolute ${item.widthClass} drop-shadow-${currentShadow} select-none pointer-events-none`}
      style={{
        top: item.top,
        left: item.left,
        opacity: currentOpacity / 100,
        zIndex: item.zIndex,
      }}
      initial="offscreen"
      animate={isInView ? "onscreen" : "leaving"}
      variants={photoItemVariants}
      custom={{ rotate: item.rotate, delay: animationDelay, exitDelay: exitDelay, fromRight: isRightSide }}
    />
  );
}

// Global variable for off-screen distance
const OFF_SCREEN_DISTANCE = "100vw";

const photoItemVariants: Variants = {
  offscreen: (custom: { fromRight: boolean }) => ({
    x: custom.fromRight ? OFF_SCREEN_DISTANCE : `-${OFF_SCREEN_DISTANCE}`, // Start off screen using global variable
    translateX: "-50%",
    translateY: "-50%",
    rotate: 0,
    opacity: 0,
    scale: SCALE_VALUE,
  }),
  onscreen: (custom: { rotate: number; delay: number; fromRight: boolean }) => ({
    x: 0, // Move to final position
    translateX: "-50%",
    translateY: "-50%",
    rotate: custom.rotate, // Apply the card's specific rotation
    opacity: 1,
    scale: SCALE_VALUE,
    transition: {
      type: "spring",
      bounce: 0.3,
      duration: 0.8,
      delay: custom.delay, // Stagger the animations
    },
  }),
  leaving: (custom: { rotate: number; delay: number; exitDelay: number; fromRight: boolean }) => ({
    x: custom.fromRight ? OFF_SCREEN_DISTANCE : `-${OFF_SCREEN_DISTANCE}`, // Animate back out
    translateX: "-50%",
    translateY: "-50%",
    rotate: 0,
    opacity: 0,
    scale: SCALE_VALUE,
    transition: {
      type: "spring",
      bounce: 0.2,
      duration: 0.6,
      delay: custom.exitDelay, // Reversed exit order - higher z-index exits first
    },
  }),
};

export default PhotoCollage;
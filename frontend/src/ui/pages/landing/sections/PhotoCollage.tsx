import React, { useState } from "react";
import * as motion from "motion/react-client";
import type { Variants } from "motion/react";
import PhotoImage from "../../../common/assets/Postcard.png";

const PhotoCollage: React.FC = () => {
  const [isInView, setIsInView] = useState(false);

  const photoItems = [
    // Main center photo
    {
      widthClass: "w-80 md:w-[32rem] lg:w-[40rem]",
      rotate: 5,
      top: "50%",
      left: "50%",
      opacity: 100,
      shadow: "2xl",
      zIndex: 5,
    },
    // Top left photo
    {
      widthClass: "w-64 md:w-[26rem] lg:w-[32rem]",
      rotate: -15,
      top: "35%",
      left: "35%",
      opacity: 90,
      shadow: "lg",
      zIndex: 4,
    },
    // Top right photo
    {
      widthClass: "w-[17rem] md:w-[28rem] lg:w-[34rem]",
      rotate: 20,
      top: "38%",
      left: "63%",
      opacity: 85,
      shadow: "lg",
      zIndex: 3,
    },
    // Bottom left photo
    {
      widthClass: "w-[16.5rem] md:w-[27rem] lg:w-[33rem]",
      rotate: -8,
      top: "60%",
      left: "38%",
      opacity: 88,
      shadow: "lg",
      zIndex: 2,
    },
    // Bottom right photo
    {
      widthClass: "w-[17.5rem] md:w-[29rem] lg:w-[35rem]",
      rotate: 12,
      top: "62%",
      left: "60%",
      opacity: 92,
      shadow: "lg",
      zIndex: 1,
    },
  ];

  return (
    <section className="root-containerrelative min-h-screen w-full min-w-[380px] overflow-hidden m-0 py-16">
      {/* Proper flexbox container for centering content */}
      <div className="flexbox-container flex flex-col justify-center items-center h-full min-h-[calc(100vh-8rem)] gap-8 md:gap-12 lg:gap-[8rem]">
        {/* Quote section - now properly positioned in flex layout */}
        <div className="px-4 sm:px-6 z-20 max-w-xs sm:max-w-sm md:max-w-2xl lg:max-w-4xl mb-8">
          <p className="text-center text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-medium text-[#3D472C] leading-relaxed">
            That's why we're giving you free food, merch, and 24 hours in
            Norman, Oklahoma to make something cool!
          </p>
        </div>

        {/* Photo collage section - now properly positioned in flex layout */}
        <div className="photo-collage-parent-container relative w-full z-10 flex items-center justify-center">
          <motion.div
            className="photo-collage-container relative w-full h-96"
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

  return (
    <motion.img
      src={PhotoImage}
      alt="Photo collage item"
      className={`absolute ${item.widthClass} drop-shadow-${item.shadow} select-none pointer-events-none`}
      style={{
        top: item.top,
        left: item.left,
        opacity: item.opacity / 100,
        zIndex: item.zIndex,
      }}
      initial="offscreen"
      animate={isInView ? "onscreen" : "leaving"}
      variants={photoItemVariants}
      custom={{
        rotate: item.rotate,
        delay: animationDelay,
        fromRight: isRightSide,
      }}
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
  }),
  onscreen: (custom: {
    rotate: number;
    delay: number;
    fromRight: boolean;
  }) => ({
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
  leaving: (custom: { rotate: number; delay: number; fromRight: boolean }) => ({
    x: custom.fromRight ? OFF_SCREEN_DISTANCE : `-${OFF_SCREEN_DISTANCE}`, // Animate back out
    translateX: "-50%",
    translateY: "-50%",
    rotate: 0,
    opacity: 0,
    transition: {
      type: "spring",
      bounce: 0.2,
      duration: 0.6,
      delay: custom.delay * 0.5, // Faster exit stagger
    },
  }),
};

export default PhotoCollage;

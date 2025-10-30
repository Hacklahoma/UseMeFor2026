import React, { useState } from 'react';
import * as motion from "motion/react-client"
import type { Variants } from "motion/react"
import PhotoImage from '../../../common/assets/Postcard.png';
import CollageArrow from '../../../common/assets/nav-arrow.svg';

// Global scale value for all photo items
const SCALE_VALUE = 0.7;

// Photo item type definitions
interface BasePhotoItem {
  name: string;
  rotate: number;
  top: string;
  left: string;
  shadow: string;
  baseZIndex: number;
  isRightSide: boolean;
}

const PhotoCollage: React.FC = () => {
  const [isInView, setIsInView] = useState(false);
  
  // Base photo configuration - all cards have same size now
  const basePhotoItems: BasePhotoItem[] = [
    { 
      name: 'card1',
      rotate: 0, 
      top: '50%', 
      left: '50%', 
      shadow: '2xl', 
      baseZIndex: 5,
      isRightSide: false,
    },
    { 
      name: 'card2',
      rotate: -8, 
      top: '40%', 
      left: '42%', 
      shadow: 'lg', 
      baseZIndex: 4,
      isRightSide: false,
    },
    { 
      name: 'card3',
      rotate: 14, 
      top: '39%', 
      left: '60%', 
      shadow: 'lg', 
      baseZIndex: 3,
      isRightSide: true,
    },
    { 
      name: 'card4',
      rotate: -8, 
      top: '60%', 
      left: '40%', 
      shadow: 'lg', 
      baseZIndex: 2,
      isRightSide: false,
    },
    { 
      name: 'card5',
      rotate: 12, 
      top: '62%', 
      left: '60%', 
      shadow: 'lg', 
      baseZIndex: 1,
      isRightSide: true,
    },
  ];

  // State to track the order of cards in the deck
  // Initial: [0, 1, 2, 3, 4] means card1 is front, card5 is back
  const [cardOrder, setCardOrder] = useState<number[]>([0, 1, 2, 3, 4]);

  // State to track custom updates for each card (keyed by card index)
  interface CardUpdate {
    rotate?: number;
    top?: string;
    left?: string;
  }
  const [cardUpdates, setCardUpdates] = useState<Record<number, CardUpdate>>({});

  // State to track animation direction for each card
  // 'left' = fly left off screen, 'right' = fly right off screen, 'toCenter' = animate to center, null = no animation
  const [animationDirection, setAnimationDirection] = useState<Record<number, 'left' | 'right' | 'toCenter' | null>>({});

  // Function to update rotation and/or position for a specific card
  const updateCard = (cardIndex: number, updates: CardUpdate) => {
    setCardUpdates(prev => ({
      ...prev,
      [cardIndex]: {
        ...prev[cardIndex],
        ...updates,
      },
    }));
  };

  // Shuffle function: move front card to back with proper property transitions
  const shuffleForward = () => {
    const frontCardIndex = cardOrder[0]; // Card currently at front
    const secondCardIndex = cardOrder[1]; // Card currently at position 1
    
    // Get CURRENT properties of card at position 1 (including any updates)
    const secondCardBase = basePhotoItems[secondCardIndex];
    const secondCardCurrentUpdates = cardUpdates[secondCardIndex] || {};
    const secondCardCurrentProps = {
      rotate: secondCardCurrentUpdates.rotate !== undefined ? secondCardCurrentUpdates.rotate : secondCardBase.rotate,
      top: secondCardCurrentUpdates.top !== undefined ? secondCardCurrentUpdates.top : secondCardBase.top,
      left: secondCardCurrentUpdates.left !== undefined ? secondCardCurrentUpdates.left : secondCardBase.left,
    };
    
    // Step 1: Determine animation direction based on where the card is going
    // Parse the left percentage to determine if it's left or right of center
    const targetLeftPercent = parseFloat(secondCardCurrentProps.left);
    const flyDirection = targetLeftPercent < 50 ? 'left' : 'right';
    
    // Step 2: Set animation directions - front card flies off, second card moves to center
    setAnimationDirection(prev => ({
      ...prev,
      [frontCardIndex]: flyDirection,
      [secondCardIndex]: 'toCenter',
    }));
    
    // Step 3: Update second card properties immediately - Framer Motion will animate smoothly
    updateCard(secondCardIndex, {
      rotate: 0,
      top: '50%',
      left: '50%',
    });
    
    // Step 4: Wait for front card to be off-screen, THEN update its properties and shift array
    setTimeout(() => {
      // Update front card properties while it's off-screen
      updateCard(frontCardIndex, {
        rotate: secondCardCurrentProps.rotate,
        top: secondCardCurrentProps.top,
        left: secondCardCurrentProps.left,
      });
      
      // Shift array - front card moves to back position
      setCardOrder(prev => {
        const newOrder = [...prev];
        newOrder.shift(); // Remove front card
        newOrder.push(frontCardIndex); // Add to back
        return newOrder;
      });
      
      // Clear animation directions
      setAnimationDirection(prev => ({
        ...prev,
        [frontCardIndex]: null,
        [secondCardIndex]: null,
      }));
    }, 400); // Halfway through animation (card is off-screen)
  };

  // Shuffle function: move back card to front with proper property transitions
  const shuffleBackward = () => {
    const backCardIndex = cardOrder[cardOrder.length - 1]; // Card currently at back (card5)
    const frontCardIndex = cardOrder[0]; // Card currently at front (card1)
    
    // Get CURRENT properties of back card (including any updates)
    const backCardBase = basePhotoItems[backCardIndex];
    const backCardCurrentUpdates = cardUpdates[backCardIndex] || {};
    const backCardCurrentProps = {
      rotate: backCardCurrentUpdates.rotate !== undefined ? backCardCurrentUpdates.rotate : backCardBase.rotate,
      top: backCardCurrentUpdates.top !== undefined ? backCardCurrentUpdates.top : backCardBase.top,
      left: backCardCurrentUpdates.left !== undefined ? backCardCurrentUpdates.left : backCardBase.left,
    };
    
    // Step 1: Determine animation direction for BACK card based on where it currently is
    // Parse the left percentage to determine if it's left or right of center
    const currentLeftPercent = parseFloat(backCardCurrentProps.left);
    const flyDirection = currentLeftPercent < 50 ? 'left' : 'right';
    
    // Step 2: Set animation directions - back card flies off, front card animates to back position
    setAnimationDirection(prev => ({
      ...prev,
      [backCardIndex]: flyDirection,
      [frontCardIndex]: 'toCenter', // Use toCenter variant for smooth animation
    }));
    
    // Step 3: Front card (card1) starts moving to back card's position immediately (mirrors forward shuffle)
    updateCard(frontCardIndex, {
      rotate: backCardCurrentProps.rotate,
      top: backCardCurrentProps.top,
      left: backCardCurrentProps.left,
    });
    
    // Step 4: Update back card properties to center immediately - will animate when it flies back in
    updateCard(backCardIndex, {
      rotate: 0,
      top: '50%',
      left: '50%',
    });
    
    // Step 5: Wait for back card to be off-screen, THEN shift array
    setTimeout(() => {
      
      // Shift array - back card moves to front
      setCardOrder(prev => {
        const newOrder = [...prev];
        newOrder.pop(); // Remove back card
        newOrder.unshift(backCardIndex); // Add to front
        return newOrder;
      });
      
      // Clear animation directions for both cards
      setAnimationDirection(prev => ({
        ...prev,
        [backCardIndex]: null,
        [frontCardIndex]: null,
      }));
    }, 400); // Halfway through animation (card is off-screen)
  };

  // Create photo items based on current card order
  // cardOrder[0] is the front card (zIndex 5), cardOrder[4] is the back card (zIndex 1)
  const photoItems = cardOrder.map((cardIndex, position) => {
    const item = basePhotoItems[cardIndex];
    const updates = cardUpdates[cardIndex] || {};
    
    // Calculate z-index: position 0 = zIndex 5 (front), position 4 = zIndex 1 (back)
    const zIndex = 5 - position;
    
    return {
      ...item,
      cardIndex, // Track original card index
      widthClass: 'w-80 md:w-[32rem] lg:w-[40rem]', // Same size for all
      zIndex: zIndex,
      rotate: updates.rotate !== undefined ? updates.rotate : item.rotate,
      top: updates.top !== undefined ? updates.top : item.top,
      left: updates.left !== undefined ? updates.left : item.left,
      animationDirection: animationDirection[cardIndex] || null, // Add animation direction
    };
  });

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
            className="left-arrow relative opacity-20 z-10 cursor-pointer bg-transparent border-none p-0 hidden custom600:flex items-center justify-center mr-5"
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
            {photoItems.map((item) => (
              <PhotoCollageItem
                key={item.name}
                item={item}
                isInView={isInView}
              />
            ))}
          </motion.div>

          <motion.button 
            className="right-arrow relative opacity-20 z-10 cursor-pointer bg-transparent border-none p-0 hidden custom600:flex items-center justify-center ml-5"
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
  item: BasePhotoItem & {
    cardIndex: number;
    widthClass: string;
    zIndex: number;
    animationDirection: 'left' | 'right' | 'toCenter' | null;
  };
  isInView: boolean;
}

function PhotoCollageItem({ item, isInView }: PhotoCollageItemProps) {
  
  // Calculate delay based on z-index (lower z-index = earlier animation)
  // Lower z-index should have less delay (animate first)
  const animationDelay = (item.zIndex - 1) * 0.15;
  
  // Calculate exit delay (reversed order - higher z-index exits first)
  // Max z-index is 5, so (5 - zIndex) gives reverse order
  const maxZIndex = 5;
  const exitDelay = (maxZIndex - item.zIndex) * 0.15 * 0.5;

  // Adjust shadow based on current zIndex (higher zIndex = more prominent)
  const shadowMap: { [key: number]: string } = {
    5: '2xl',
    4: 'lg',
    3: 'lg',
    2: 'lg',
    1: 'lg',
  };

  const currentShadow = shadowMap[item.zIndex as keyof typeof shadowMap] || item.shadow;
  
  // Determine animation state based on animationDirection
  let animateState = isInView ? "onscreen" : "leaving";
  if (item.animationDirection === 'left') {
    animateState = "shuffleLeft";
  } else if (item.animationDirection === 'right') {
    animateState = "shuffleRight";
  } else if (item.animationDirection === 'toCenter') {
    animateState = "moveToCenter";
  }
  
  return (
    <motion.img
      src={PhotoImage}
      alt={`Photo collage - ${item.name}`}
      className={`absolute ${item.widthClass} drop-shadow-${currentShadow} select-none pointer-events-none`}
      style={{
        zIndex: item.zIndex,
      }}
      initial="offscreen"
      animate={animateState}
      variants={photoItemVariants}
      custom={{ 
        rotate: item.rotate, 
        delay: animationDelay, 
        exitDelay: exitDelay, 
        fromRight: item.isRightSide,
        top: item.top,
        left: item.left,
      }}
    />
  );
}

// Global variable for off-screen distance
const OFF_SCREEN_DISTANCE = "55vw";

const photoItemVariants: Variants = {
  offscreen: (custom: { fromRight: boolean; top: string; left: string }) => ({
    x: custom.fromRight ? OFF_SCREEN_DISTANCE : `-${OFF_SCREEN_DISTANCE}`, // Start off screen using global variable
    top: custom.top,
    left: custom.left,
    translateX: "-50%",
    translateY: "-50%",
    rotate: 0,
    opacity: 0,
    scale: SCALE_VALUE,
  }),
  onscreen: (custom: { rotate: number; delay: number; fromRight: boolean; top: string; left: string }) => ({
    x: 0, // Move to final position
    top: custom.top,
    left: custom.left,
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
  leaving: (custom: { rotate: number; delay: number; exitDelay: number; fromRight: boolean; top: string; left: string }) => ({
    x: custom.fromRight ? OFF_SCREEN_DISTANCE : `-${OFF_SCREEN_DISTANCE}`, // Animate back out
    top: custom.top,
    left: custom.left,
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
  shuffleRight: (custom: { rotate: number; top: string; left: string }) => ({
    x: OFF_SCREEN_DISTANCE, // Fly right off screen
    top: custom.top,
    left: custom.left,
    translateX: "-50%",
    translateY: "-50%",
    rotate: 25, // Tilt clockwise when flying right
    opacity: 1,
    scale: SCALE_VALUE,
    transition: {
      type: "spring",
      bounce: 0.2,
      duration: 0.6,
    },
  }),
  shuffleLeft: (custom: { rotate: number; top: string; left: string }) => ({
    x: `-${OFF_SCREEN_DISTANCE}`, // Fly left off screen
    top: custom.top,
    left: custom.left,
    translateX: "-50%",
    translateY: "-50%",
    rotate: -25, // Tilt counter-clockwise when flying left
    opacity: 1,
    scale: SCALE_VALUE,
    transition: {
      type: "spring",
      bounce: 0.2,
      duration: 0.6,
    },
  }),
  moveToCenter: (custom: { rotate: number; top: string; left: string }) => ({
    x: 0, // Move to center position
    top: '50%', // Animate to center
    left: '50%', // Animate to center
    translateX: "-50%",
    translateY: "-50%",
    rotate: 0, // Always rotate to 0 (straight)
    opacity: 1,
    scale: SCALE_VALUE,
    transition: {
      type: "spring",
      bounce: 0.2,
      duration: 0.6,
    },
  }),
};

export default PhotoCollage;
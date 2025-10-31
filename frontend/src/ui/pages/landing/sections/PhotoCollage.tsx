/**
 * Photo Collage Component
 * 
 * Interactive photo collage with shuffleable cards. Users can navigate through
 * cards using left/right arrow buttons, creating smooth animated transitions.
 * 
 * Architecture:
 * - Pure presentational component (UI only)
 * - Business logic delegated to cardShuffleLogic module
 * - Position configs and cycles defined in cardPositions module
 * - Animation variants defined in photoCollageVariants module
 * - All types centralized in photoCollageTypes module
 * 
 * State Management:
 * - cardPositions: Tracks which card is in which position
 * - animationStates: Controls which animation variant each card uses
 * - isInView: Triggers initial entrance animations
 */

import React, { useState, useEffect } from 'react';
import * as motion from 'motion/react-client';

// Asset imports
import PhotoImage from '../../../common/assets/Postcard.png';
import CollageArrow from '../../../common/assets/nav-arrow.svg';

// Type imports
import {
  Card,
  CardId,
  CardAnimationMap,
  AnimationState,
} from './photoCollage/photoCollageTypes';

// Logic and data imports
import {
  getPositionConfig,
} from './photoCollage/cardPositions';
import { photoCollageCardVariants } from './photoCollage/photoCollageVariants';
import {
  initializeCards,
  executeForwardShuffle,
  executeBackwardShuffle,
  resetAllCardsToIdle,
} from './photoCollage/cardShuffleLogic';
import { SHUFFLE_DELAY } from './photoCollage/cardConstants';

/**
 * Main Photo Collage Component
 */
const PhotoCollage: React.FC = () => {
  // Track viewport visibility for entrance animations
  const [isInView, setIsInView] = useState(false);
  
  // Track card objects (each has id and position)
  const [cards, setCards] = useState<Card[]>(initializeCards());
  
  // Track whether the initial entrance animation has completed
  const [hasCompletedEntrance, setHasCompletedEntrance] = useState(false);
  
  // Track whether button animations have completed
  const [leftButtonAnimationComplete, setLeftButtonAnimationComplete] = useState(false);
  const [rightButtonAnimationComplete, setRightButtonAnimationComplete] = useState(false);
  
  // Track whether buttons are disabled (for click throttling)
  const [buttonsDisabled, setButtonsDisabled] = useState(false);
  
  // Track animation state for each card
  const [animationStates, setAnimationStates] = useState<CardAnimationMap>({
    [CardId.CARD_1]: AnimationState.OFFSCREEN,
    [CardId.CARD_2]: AnimationState.OFFSCREEN,
    [CardId.CARD_3]: AnimationState.OFFSCREEN,
    [CardId.CARD_4]: AnimationState.OFFSCREEN,
    [CardId.CARD_5]: AnimationState.OFFSCREEN,
  });

  /**
   * Trigger entrance animation when component comes into view
   */
  useEffect(() => {
    if (isInView && !hasCompletedEntrance) {
      // Transition all cards to ONSCREEN state to trigger entrance animation
      setAnimationStates({
        [CardId.CARD_1]: AnimationState.ONSCREEN,
        [CardId.CARD_2]: AnimationState.ONSCREEN,
        [CardId.CARD_3]: AnimationState.ONSCREEN,
        [CardId.CARD_4]: AnimationState.ONSCREEN,
        [CardId.CARD_5]: AnimationState.ONSCREEN,
      });
    }
  }, [isInView, hasCompletedEntrance]);

  /**
   * Handle forward shuffle (right arrow click)
   * Swaps positions between center card and next card in journey
   * Updates z-indexes at midpoint when card is off-screen
   */
  const handleShuffleForward = () => {
    // Prevent clicks if buttons are disabled
    if (buttonsDisabled) return;
    
    // Disable buttons for 500ms
    setButtonsDisabled(true);
    setTimeout(() => {
      setButtonsDisabled(false);
    }, 200);
    
    // Execute shuffle logic (pure function, no side effects)
    const shuffleResult = executeForwardShuffle(cards);
    
    // Phase 1 (t=0ms): Update positions with OLD z-indexes, start animations
    setCards(shuffleResult.cardsWithOldZIndex);
    setAnimationStates(shuffleResult.animationStates);

    // Phase 2 (t=200ms): Update z-indexes when card is off-screen (midpoint)
    setTimeout(() => {
      setCards(shuffleResult.cardsWithNewZIndex);
    }, SHUFFLE_DELAY / 2);

    // Phase 3 (t=400ms): Reset animations to idle
    setTimeout(() => {
      setAnimationStates(resetAllCardsToIdle());
    }, SHUFFLE_DELAY);
  };

  /**
   * Handle backward shuffle (left arrow click)
   * Swaps positions between center card and previous card in journey
   * Updates z-indexes at midpoint when card is off-screen
   */
  const handleShuffleBackward = () => {
    // Prevent clicks if buttons are disabled
    if (buttonsDisabled) return;
    
    // Disable buttons for 500ms
    setButtonsDisabled(true);
    setTimeout(() => {
      setButtonsDisabled(false);
    }, 200);
    
    // Execute shuffle logic (pure function, no side effects)
    const shuffleResult = executeBackwardShuffle(cards);
    
    // Phase 1 (t=0ms): Update positions with OLD z-indexes, start animations
    setCards(shuffleResult.cardsWithOldZIndex);
    setAnimationStates(shuffleResult.animationStates);

    // Phase 2 (t=200ms): Update z-indexes when card is off-screen (midpoint)
    setTimeout(() => {
      setCards(shuffleResult.cardsWithNewZIndex);
    }, SHUFFLE_DELAY / 2);

    // Phase 3 (t=400ms): Reset animations to idle
    setTimeout(() => {
      setAnimationStates(resetAllCardsToIdle());
    }, SHUFFLE_DELAY);
  };

  return (
    <section className="root-container relative h-auto w-full min-w-[380px] overflow-hidden m-0">
      {/* Main flexbox container for centering content */}
      <div className="flexbox-container flex flex-col justify-center items-center h-full min-h-[calc(100vh-8rem)]">
        
        {/* Quote section */}
        <div className="px-4 sm:px-6 z-20 max-w-xs sm:max-w-sm md:max-w-2xl lg:max-w-4xl">
          <p className="text-center text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-medium text-[#3D472C] leading-relaxed">
            That's why we're giving you free food, merch, and 24 hours in Norman, Oklahoma to make something cool!
          </p>
        </div>

        {/* Photo collage with navigation arrows */}
        <div className="photo-collage-parent-container relative w-full z-10 flex items-center justify-center">
          
          {/* Left arrow button - triggers backward shuffle */}
          <motion.button 
            className="left-arrow relative opacity-20 cursor-pointer bg-transparent border-none p-0 hidden custom600:flex items-center justify-center mr-16"
            style={{ zIndex: leftButtonAnimationComplete ? 10 : 0 }}
            aria-label="Previous photo"
            onClick={handleShuffleBackward}
            initial={{ 
              x: '30vw',  // Start at center of screen (move right from left position)
              opacity: 0,
              scale: 0.5,
            }}
            animate={hasCompletedEntrance ? { 
              x: 0,  // Move to final left position
              opacity: 0.2,
              scale: 1,
            } : {
              x: '30vw',  // Stay at center
              opacity: 0,
              scale: 0.5,
            }}
            transition={{
              x: { type: 'spring', stiffness: 100, damping: 25, duration: 0.8 },
              opacity: { duration: 0.6 },
              scale: { type: 'spring', stiffness: 100, damping: 25 },
              delay: hasCompletedEntrance ? 0.2 : 0,
            }}
            onAnimationComplete={() => {
              if (hasCompletedEntrance && !leftButtonAnimationComplete) {
                setLeftButtonAnimationComplete(true);
              }
            }}
            whileHover={{ 
              opacity: 0.8, 
              scale: 1.15,
              transition: {
                type: 'spring',
                stiffness: 300,
                damping: 20,
              }
            }}
            whileTap={{ 
              scale: 1.05,
              transition: {
                type: 'spring',
                stiffness: 300,
                damping: 20,
              }
            }}
          >
            <motion.img 
              src={CollageArrow} 
              alt="Left arrow" 
              className="w-16 h-16 md:w-20 md:h-20 pointer-events-none aspect-square object-contain" 
              initial={{ rotate: -90 }}
              animate={{ rotate: -90 }}
            />
          </motion.button>

          {/* Photo collage container */}
          <motion.div 
            className="photo-collage-container relative w-1/2 flex-shrink-0 h-[16rem] md:h-[32rem] lg:h-[40rem] xl:h-[48rem] overflow-visible"
            onViewportEnter={() => setIsInView(true)}
            onViewportLeave={() => setIsInView(false)}
            viewport={{ amount: 0.8 }}
          >
            {/* Render all 5 cards based on their current positions */}
            {cards.map((card) => {
              // Get position config based on card's current position
              const positionConfig = getPositionConfig(card.position);
              
              // Get current animation state
              const currentAnimationState = animationStates[card.id];
              
              // Calculate stagger delay for initial entrance animation
              const entranceDelay = (card.zIndex - 1) * 0.15;
              
              return (
                <motion.img
                  key={card.id}
                  src={PhotoImage}
                  alt={`Photo collage ${card.id}`}
                  className={`absolute w-80 md:w-[32rem] lg:w-[40rem] drop-shadow-lg select-none pointer-events-none`}
                  style={{
                    zIndex: card.zIndex, // Use card's zIndex, not position's default
                    willChange: 'transform, opacity', // GPU acceleration hint
                    transform: 'translateZ(0)', // Force GPU layer
                  }}
                  initial={AnimationState.OFFSCREEN}
                  animate={currentAnimationState}
                  variants={photoCollageCardVariants}
                  custom={{
                    ...positionConfig,
                    zIndex: card.zIndex, // Pass card's zIndex to variants as well
                    delay: entranceDelay,
                  }}
                  onAnimationComplete={(definition) => {
                    // Track when the initial entrance animation completes
                    // Only trigger once for the last card (highest z-index = 5)
                    if (definition === AnimationState.ONSCREEN && card.zIndex === 5 && !hasCompletedEntrance) {
                      setHasCompletedEntrance(true);
                      // Transition all cards to idle state after entrance
                      setAnimationStates(resetAllCardsToIdle());
                    }
                  }}
                />
              );
            })}
          </motion.div>

          {/* Right arrow button - triggers forward shuffle */}
          <motion.button 
            className="right-arrow relative opacity-20 cursor-pointer bg-transparent border-none p-0 hidden custom600:flex items-center justify-center ml-16"
            style={{ zIndex: rightButtonAnimationComplete ? 10 : 0 }}
            aria-label="Next photo"
            onClick={handleShuffleForward}
            initial={{ 
              x: '-30vw',  // Start at center of screen (move left from right position)
              opacity: 0,
              scale: 0.5,
            }}
            animate={hasCompletedEntrance ? { 
              x: 0,  // Move to final right position
              opacity: 0.2,
              scale: 1,
            } : {
              x: '-30vw',  // Stay at center
              opacity: 0,
              scale: 0.5,
            }}
            transition={{
              x: { type: 'spring', stiffness: 100, damping: 25, duration: 0.8 },
              opacity: { duration: 0.6 },
              scale: { type: 'spring', stiffness: 100, damping: 25 },
              delay: hasCompletedEntrance ? 0.2 : 0,
            }}
            onAnimationComplete={() => {
              if (hasCompletedEntrance && !rightButtonAnimationComplete) {
                setRightButtonAnimationComplete(true);
              }
            }}
            whileHover={{ 
              opacity: 0.8, 
              scale: 1.15,
              transition: {
                type: 'spring',
                stiffness: 300,
                damping: 20,
              }
            }}
            whileTap={{ 
              scale: 1.05,
              transition: {
                type: 'spring',
                stiffness: 300,
                damping: 20,
              }
            }}
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

export default PhotoCollage;

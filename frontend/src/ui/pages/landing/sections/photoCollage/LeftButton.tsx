/**
 * Left Button Component
 * 
 * Navigation button for the photo collage that triggers backward shuffle.
 * Includes entrance animation, interactive hover/tap states, and shuffle logic.
 */

import React, { MutableRefObject } from 'react';
import * as motion from 'motion/react-client';
import CollageArrow from '../../../../common/assets/nav-arrow.svg';
import { Card, CardAnimationMap } from './photoCollageTypes';
import { executeBackwardShuffle } from './cardShuffleLogic';
import { SHUFFLE_DELAY } from './cardConstants';

interface LeftButtonProps {
  /** Whether the entrance animation has completed */
  hasCompletedEntrance: boolean;
  /** Whether the button's entrance animation has completed */
  leftButtonAnimationComplete: boolean;
  /** Callback when button animation completes */
  onAnimationComplete: () => void;
  /** Current cards state */
  cards: Card[];
  /** Whether buttons are disabled (for click throttling) */
  buttonsDisabled: boolean;
  /** Callback to set cards state */
  setCards: (cards: Card[]) => void;
  /** Callback to set animation states */
  setAnimationStates: (states: CardAnimationMap) => void;
  /** Callback to set buttons disabled state */
  setButtonsDisabled: (disabled: boolean) => void;
  /** Ref to track if animation is in progress (synchronous check) */
  isAnimatingRef: MutableRefObject<boolean>;
  /** Callback to swap center back card's photo before shuffle logic executes */
  swapPhotoBackShuffle: (cards: Card[]) => Card[];
}

/**
 * Left arrow button for photo collage navigation
 * Triggers backward shuffle when clicked
 */
export const LeftButton: React.FC<LeftButtonProps> = ({
  hasCompletedEntrance,
  leftButtonAnimationComplete,
  onAnimationComplete,
  cards,
  buttonsDisabled,
  setCards,
  setAnimationStates,
  setButtonsDisabled,
  isAnimatingRef,
  swapPhotoBackShuffle,
}) => {
  /**
   * Handle backward shuffle (left arrow click)
   * Swaps positions between center card and previous card in journey
   * Updates z-indexes at midpoint when card is off-screen
   */
  const handleShuffleBackward = (e: React.MouseEvent) => {
    // Stop event propagation and prevent default
    e.stopPropagation();
    e.preventDefault();
    
    // Synchronous check using ref (prevents race conditions)
    // This MUST be the first check and immediately return if true
    if (isAnimatingRef.current) {
      return;
    }
    
    // Prevent clicks if buttons are disabled
    if (buttonsDisabled) {
      return;
    }
    
    // Set ref immediately (synchronous) - this blocks all subsequent clicks
    isAnimatingRef.current = true;
    
    // Disable buttons during animation
    setButtonsDisabled(true);
    setTimeout(() => {
      setButtonsDisabled(false);
      isAnimatingRef.current = false; // Reset ref when animation completes
    }, SHUFFLE_DELAY);
    
    // Swap photo BEFORE shuffle logic executes
    const cardsWithUpdatedPhoto = swapPhotoBackShuffle(cards);
    
    // Execute shuffle logic (pure function, no side effects) on cards with updated photo
    const shuffleResult = executeBackwardShuffle(cardsWithUpdatedPhoto);
    
    // Phase 1 (t=0ms): Update positions with OLD z-indexes, start animations
    setCards(shuffleResult.cardsWithOldZIndex);
    setAnimationStates(shuffleResult.animationStates);
    // Phase 2 (t=200ms): Update z-indexes when card is off-screen (midpoint)
    setTimeout(() => {
      setCards(shuffleResult.cardsWithNewZIndex);
    }, SHUFFLE_DELAY / 2);

    // Phase 3 (t=400ms): Animation states maintained in MOVE_TO_POSITION
  };

  return (
    <motion.button 
      className="left-arrow relative opacity-20 cursor-pointer bg-transparent border-none p-0 hidden custom600:flex items-center justify-center mr-16 select-none"
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
          onAnimationComplete();
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
  );
};


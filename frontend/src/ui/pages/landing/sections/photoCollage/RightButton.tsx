/**
 * Right Button Component
 * 
 * Navigation button for the photo collage that triggers forward shuffle.
 * Includes entrance animation, interactive hover/tap states, and shuffle logic.
 */

import React, { MutableRefObject } from 'react';
import * as motion from 'motion/react-client';
import CollageArrow from '../../../../common/assets/nav-arrow.svg';
import { Card, CardId, CardAnimationMap } from './photoCollageTypes';
import { executeForwardShuffle } from './cardShuffleLogic';
import { SHUFFLE_DELAY } from './cardConstants';

interface RightButtonProps {
  /** Whether the entrance animation has completed */
  hasCompletedEntrance: boolean;
  /** Whether the button's entrance animation has completed */
  rightButtonAnimationComplete: boolean;
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
  /** Callback to swap a card's photo after flying animation completes */
  swapPhotoOnCardID: (cardId: CardId, cards: Card[]) => Card[];
}

/**
 * Right arrow button for photo collage navigation
 * Triggers forward shuffle when clicked
 */
export const RightButton: React.FC<RightButtonProps> = ({
  hasCompletedEntrance,
  rightButtonAnimationComplete,
  onAnimationComplete,
  cards,
  buttonsDisabled,
  setCards,
  setAnimationStates,
  setButtonsDisabled,
  isAnimatingRef,
  swapPhotoOnCardID,
}) => {
  /**
   * Handle forward shuffle (right arrow click)
   * Swaps positions between center card and next card in journey
   * Updates z-indexes at midpoint when card is off-screen
   */
  const handleShuffleForward = (e: React.MouseEvent) => {
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
    }, SHUFFLE_DELAY + 100);
    
    // Execute shuffle logic (pure function, no side effects)
    const shuffleResult = executeForwardShuffle(cards);
    
    // Phase 1 (t=0ms): Update positions with OLD z-indexes, start animations
    setCards(shuffleResult.cardsWithOldZIndex);
    setAnimationStates(shuffleResult.animationStates);

    // Phase 2 (t=300ms): Update z-indexes when card is off-screen (midpoint)
    setTimeout(() => {
      setCards(shuffleResult.cardsWithNewZIndex);
    }, SHUFFLE_DELAY);

    // Phase 3 (t=600ms): Swap center back photo
    setTimeout(() => {
      const updatedCards = swapPhotoOnCardID(shuffleResult.flyingCardId, shuffleResult.cardsWithNewZIndex);
      setCards(updatedCards);
    }, SHUFFLE_DELAY + 100);
  };

  return (
    <motion.button 
      className="right-arrow relative opacity-20 cursor-pointer bg-transparent border-none p-0 hidden custom600:flex items-center justify-center ml-16 select-none"
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
        alt="Right arrow" 
        className="w-16 h-16 md:w-20 md:h-20 pointer-events-none aspect-square object-contain" 
        initial={{ rotate: 90 }}
        animate={{ rotate: 90 }}
      />
    </motion.button>
  );
};


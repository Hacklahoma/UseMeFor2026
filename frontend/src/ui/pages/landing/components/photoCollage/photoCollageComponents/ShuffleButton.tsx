/**
 * Navigation Button Component
 *
 * Shared component for left and right navigation arrows.
 * Handles entrance animation, interactive hover/tap states, and shuffle logic.
 */

import React, { MutableRefObject } from 'react';
import * as motion from 'motion/react-client';
import CollageArrow from '../../../../../common/assets/nav-arrow.svg';
import { Card, CardId, CardAnimationMap } from './Card';
import { executeForwardShuffle, executeBackwardShuffle } from './CardShuffleLogic';
import configSettings from './Config';

type Direction = 'left' | 'right';

interface NavigationButtonProps {
  /** Direction of the button */
  direction: Direction;
  /** Whether the entrance animation has completed */
  hasCompletedEntrance: boolean;
  /** Whether the button's entrance animation has completed */
  animationComplete: boolean;
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
  /** Callback to swap center back card's photo before shuffle (left only) */
  swapPhotoBackShuffle?: (cards: Card[]) => Card[];
  /** Callback to swap a card's photo after flying animation (right only) */
  swapPhotoOnCardID?: (cardId: CardId, cards: Card[]) => Card[];
  /** Whether navigation buttons are visible (based on breakpoint) */
  areButtonsVisible: boolean;
}

const DIRECTION_CONFIG = {
  left: {
    className: 'left-arrow mr-16',
    ariaLabel: 'Previous photo',
    rotate: -90,
    initialX: '30vw',
    animateX: 0,
  },
  right: {
    className: 'right-arrow ml-16',
    ariaLabel: 'Next photo',
    rotate: 90,
    initialX: '-30vw',
    animateX: 0,
  },
} as const;

/**
 * Navigation button for photo collage
 */
export const NavigationButton: React.FC<NavigationButtonProps> = ({
  direction,
  hasCompletedEntrance,
  animationComplete,
  onAnimationComplete,
  cards,
  buttonsDisabled,
  setCards,
  setAnimationStates,
  setButtonsDisabled,
  isAnimatingRef,
  swapPhotoBackShuffle,
  swapPhotoOnCardID,
  areButtonsVisible,
}) => {
  const config = DIRECTION_CONFIG[direction];

  /**
   * Handle shuffle (left or right arrow click)
   */
  const handleShuffle = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    // Synchronous check using ref (prevents race conditions)
    if (isAnimatingRef.current || buttonsDisabled) return;

    // Set ref immediately (synchronous) - this blocks all subsequent clicks
    isAnimatingRef.current = true;

    // Execute direction-specific logic
    if (direction === 'left') {
      // Left button: backward shuffle
      const delay = configSettings.SHUFFLE_DELAY + 100;
      setButtonsDisabled(true);
      setTimeout(() => {
        setButtonsDisabled(false);
        isAnimatingRef.current = false;
      }, delay);

      // Swap photo BEFORE shuffle logic executes
      const cardsWithUpdatedPhoto = swapPhotoBackShuffle ? swapPhotoBackShuffle(cards) : cards;
      // Use consistent fly direction when buttons are hidden (mobile)
      const shuffleResult = executeBackwardShuffle(cardsWithUpdatedPhoto, !areButtonsVisible);

      setCards(shuffleResult.cardsWithOldZIndex);
      setAnimationStates(shuffleResult.animationStates);
      setTimeout(() => setCards(shuffleResult.cardsWithNewZIndex), configSettings.SHUFFLE_DELAY);
    } else {
      // Right button: forward shuffle
      const delay = configSettings.SHUFFLE_DELAY + 100;
      setButtonsDisabled(true);
      setTimeout(() => {
        setButtonsDisabled(false);
        isAnimatingRef.current = false;
      }, delay);

      // Use consistent fly direction when buttons are hidden (mobile)
      const shuffleResult = executeForwardShuffle(cards, !areButtonsVisible);

      setCards(shuffleResult.cardsWithOldZIndex);
      setAnimationStates(shuffleResult.animationStates);
      setTimeout(() => setCards(shuffleResult.cardsWithNewZIndex), configSettings.SHUFFLE_DELAY);
      setTimeout(() => {
        if (swapPhotoOnCardID) {
          const updatedCards = swapPhotoOnCardID(shuffleResult.flyingCardId, shuffleResult.cardsWithNewZIndex);
          setCards(updatedCards);
        }
      }, delay);
    }
  };

  return (
    <motion.button
      className={`${config.className} relative opacity-20 cursor-pointer bg-transparent border-none p-0 hidden custom600:flex items-center justify-center select-none`}
      style={{ 
        zIndex: animationComplete ? 10 : 0,
        willChange: 'transform, opacity',
        transform: 'translateZ(0)',
      }}
      aria-label={config.ariaLabel}
      onClick={handleShuffle}
      initial={{
        x: config.initialX,
        opacity: 0,
        scale: 0.5,
      }}
      animate={hasCompletedEntrance ? {
        x: config.animateX,
        opacity: 0.2,
        scale: 1,
      } : {
        x: config.initialX,
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
        if (hasCompletedEntrance && !animationComplete) {
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
        alt={`${direction === 'left' ? 'Left' : 'Right'} arrow`}
        className="w-16 h-16 md:w-20 md:h-20 pointer-events-none aspect-square object-contain"
        style={{
          willChange: 'transform',
          transform: 'translateZ(0)',
        }}
        initial={{ rotate: config.rotate }}
        animate={{ rotate: config.rotate }}
      />
    </motion.button>
  );
};

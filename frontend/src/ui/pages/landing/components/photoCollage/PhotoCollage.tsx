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

import React, { useState, useEffect, useRef } from 'react';
import * as motion from 'motion/react-client';

// Type imports
import {
  Card,
  CardId,
  CardAnimationMap,
  AnimationState,
} from './photoCollageComponents/photoCollageTypes';

// Logic and data imports
import {
  getPositionConfig,
} from './photoCollageComponents/cardPositions';
import { photoCollageCardVariants } from './photoCollageComponents/photoCollageFramerVariants';
import {
  initializeCards,
} from './photoCollageComponents/cardShuffleLogic';
import { getPhotoData, photoImages } from './photoCollageComponents/photoData';

// Component imports
import { NavigationButton } from './photoCollageComponents/NavigationButton';
import { VintagePostcard } from './photoCollageComponents/VintagePostcard';

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
  
  // Use ref for immediate synchronous check (prevents race conditions)
  const isAnimatingRef = useRef(false);

  // Track animation state for each card
  const [animationStates, setAnimationStates] = useState<CardAnimationMap>({
    [CardId.CARD_A]: AnimationState.OFFSCREEN,
    [CardId.CARD_B]: AnimationState.OFFSCREEN,
    [CardId.CARD_C]: AnimationState.OFFSCREEN,
    [CardId.CARD_D]: AnimationState.OFFSCREEN,
    [CardId.CARD_E]: AnimationState.OFFSCREEN,
    [CardId.CARD_F]: AnimationState.OFFSCREEN,
  });
  
  // Debug: Toggle fixed image visibility
  const [showDebugImage, setShowDebugImage] = useState(false);

  /**
   * Trigger entrance animation when component comes into view
   */
  useEffect(() => {
    if (isInView && !hasCompletedEntrance) {
      // Transition all cards to ONSCREEN state to trigger entrance animation
      setAnimationStates({
        [CardId.CARD_A]: AnimationState.ONSCREEN,
        [CardId.CARD_B]: AnimationState.ONSCREEN,
        [CardId.CARD_C]: AnimationState.ONSCREEN,
        [CardId.CARD_D]: AnimationState.ONSCREEN,
        [CardId.CARD_E]: AnimationState.ONSCREEN,
        [CardId.CARD_F]: AnimationState.ONSCREEN,
      });
    }
  }, [isInView, hasCompletedEntrance]);

  /**
   * Swap a card's photo to the next photo in the sequence.
   * @param cardId - The ID of the card to swap the photo for
   * @param cards - The current cards array
   * @returns Updated cards array with photo swapped
   */
  const swapPhotoOnCardID = (cardId: CardId, cards: Card[]): Card[] => {
    const updatedCards = cards.map(c => ({ ...c }));
    const targetCard = updatedCards.find(c => c.id === cardId);
    
    if (targetCard) {
      targetCard.currentPhotoIndex = (targetCard.currentPhotoIndex + 6) % photoImages.length;
    }
    
    return updatedCards;
  };

  /**
   * Swap the center back card's photo to the previous photo in the sequence.
   * Returns updated cards array with photo change applied.
   * Called BEFORE the shuffle logic executes.
   */
  const swapPhotoBackShuffle = (currentCards: Card[]): Card[] => {
    const updatedCards = currentCards.map(c => ({ ...c }));
    const centerBackCard = updatedCards.find(c => c.position === 'centerBack');
    const centerCard = updatedCards.find(c => c.position === 'center');
    
    if (centerCard && centerBackCard) {
      if (centerCard.currentPhotoIndex === 0) {
        centerBackCard.currentPhotoIndex = photoImages.length - 1; // Wrap to last photo
      } else {
        centerBackCard.currentPhotoIndex = centerCard.currentPhotoIndex - 1; // Move to previous photo
      }
    }
    
    return updatedCards;
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
          <NavigationButton
            direction="left"
            hasCompletedEntrance={hasCompletedEntrance}
            animationComplete={leftButtonAnimationComplete}
            onAnimationComplete={() => setLeftButtonAnimationComplete(true)}
            cards={cards}
            buttonsDisabled={buttonsDisabled}
            setCards={setCards}
            setAnimationStates={setAnimationStates}
            setButtonsDisabled={setButtonsDisabled}
            isAnimatingRef={isAnimatingRef}
            swapPhotoBackShuffle={swapPhotoBackShuffle}
          />

          {/* Photo collage container */}
          <motion.div 
            className="photo-collage-container relative w-1/2 flex-shrink-0 h-[16rem] md:h-[32rem] lg:h-[40rem] xl:h-[48rem] overflow-visible"
            onViewportEnter={() => setIsInView(true)}
            onViewportLeave={() => setIsInView(false)}
            viewport={{ amount: 0.8 }}
          >
            {/* Render all 6 cards based on their current positions */}
            {cards.map((card) => {
              // Get position config based on card's current position
              const positionConfig = getPositionConfig(card.position);
              
              // Get current animation state
              const currentAnimationState = animationStates[card.id];
              
              // Calculate stagger delay for initial entrance animation
              // Use max(0, ...) to ensure delay is never negative (for z-index 0)
              const entranceDelay = Math.max(0, (card.zIndex - 1) * 0.15);
              
              // Determine which photo to display for this card
              // For now, all cards display their currentPhotoIndex (static photos)
              const photoIndexToDisplay = card.currentPhotoIndex;

              const photoData = getPhotoData(photoIndexToDisplay);

              return (
                <motion.div
                  key={card.id}
                  className={`${card.id} absolute w-80 md:w-[32rem] lg:w-[40rem] drop-shadow-lg select-none pointer-events-none`}
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
                      // Transition all cards to MOVE_TO_POSITION to maintain their positions
                      setAnimationStates({
                        [CardId.CARD_A]: AnimationState.MOVE_TO_POSITION,
                        [CardId.CARD_B]: AnimationState.MOVE_TO_POSITION,
                        [CardId.CARD_C]: AnimationState.MOVE_TO_POSITION,
                        [CardId.CARD_D]: AnimationState.MOVE_TO_POSITION,
                        [CardId.CARD_E]: AnimationState.MOVE_TO_POSITION,
                        [CardId.CARD_F]: AnimationState.MOVE_TO_POSITION,
                      });
                    }

                    // Reset fly animations to MOVE_TO_POSITION after completion
                    // This ensures the next fly animation will trigger (state change detection)
                    if (definition === AnimationState.FLY_LEFT || definition === AnimationState.FLY_RIGHT) {
                      setAnimationStates(prevStates => ({
                        ...prevStates,
                        [card.id]: AnimationState.MOVE_TO_POSITION,
                      }));
                    }
                  }}
                >
                  <VintagePostcard
                    imageUrl={photoData.path}
                    title={photoData.title}
                    footer={photoData.footer}
                  />
                </motion.div>
              );
            })}
          </motion.div>

          {/* Right arrow button - triggers forward shuffle */}
          <NavigationButton
            direction="right"
            hasCompletedEntrance={hasCompletedEntrance}
            animationComplete={rightButtonAnimationComplete}
            onAnimationComplete={() => setRightButtonAnimationComplete(true)}
            cards={cards}
            buttonsDisabled={buttonsDisabled}
            setCards={setCards}
            setAnimationStates={setAnimationStates}
            setButtonsDisabled={setButtonsDisabled}
            isAnimatingRef={isAnimatingRef}
            swapPhotoOnCardID={swapPhotoOnCardID}
          />
        </div>
      </div>
    </section>
  );
};

export default PhotoCollage;

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
import { photoCollageCardVariants } from './photoCollage/photoCollageFramerVariants';
import {
  initializeCards,
  resetAllCardsToIdle,
} from './photoCollage/cardShuffleLogic';
import { getPhotoData } from './photoCollage/photoData';

// Component imports
import { LeftButton } from './photoCollage/LeftButton';
import { RightButton } from './photoCollage/RightButton';
import { VintagePostcard } from './photoCollage/VintagePostcard';

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
    [CardId.CARD_6]: AnimationState.OFFSCREEN,
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
        [CardId.CARD_1]: AnimationState.ONSCREEN,
        [CardId.CARD_2]: AnimationState.ONSCREEN,
        [CardId.CARD_3]: AnimationState.ONSCREEN,
        [CardId.CARD_4]: AnimationState.ONSCREEN,
        [CardId.CARD_5]: AnimationState.ONSCREEN,
        [CardId.CARD_6]: AnimationState.ONSCREEN,
      });
    }
  }, [isInView, hasCompletedEntrance]);

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
          <LeftButton
            hasCompletedEntrance={hasCompletedEntrance}
            leftButtonAnimationComplete={leftButtonAnimationComplete}
            onAnimationComplete={() => setLeftButtonAnimationComplete(true)}
            cards={cards}
            buttonsDisabled={buttonsDisabled}
            setCards={setCards}
            setAnimationStates={setAnimationStates}
            setButtonsDisabled={setButtonsDisabled}
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
              const entranceDelay = (card.zIndex - 1) * 0.15;
              
              // Get the photo data for this card based on its photoIndex
              const photoData = getPhotoData(card.photoIndex);
              
              return (
                <motion.div
                  key={card.id}
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
          <RightButton
            hasCompletedEntrance={hasCompletedEntrance}
            rightButtonAnimationComplete={rightButtonAnimationComplete}
            onAnimationComplete={() => setRightButtonAnimationComplete(true)}
            cards={cards}
            buttonsDisabled={buttonsDisabled}
            setCards={setCards}
            setAnimationStates={setAnimationStates}
            setButtonsDisabled={setButtonsDisabled}
          />
        </div>
      </div>
    </section>
  );
};

export default PhotoCollage;

/**
 * Card Shuffle Business Logic
 * 
 * This file contains the core business logic for shuffling cards in the photo collage.
 * It operates on Card objects (id + position) and determines which cards need to
 * swap positions and which animations to apply.
 * 
 * Key Responsibilities:
 * - Find which card is at CENTER position
 * - Find which card is at the next position in the journey
 * - Swap their positions
 * - Assign appropriate animation states (fly away vs smooth transition)
 * - Return updated card array
 * 
 * Architecture:
 * - Cards are objects with { id, position }
 * - Only 2 cards change position per shuffle
 * - Only 2 cards animate per shuffle
 * - All other 3 cards remain unchanged
 */

import {
  Card,
  CardId,
  CardPosition,
  CardAnimationMap,
  AnimationState,
} from './photoCollageTypes';
import {
  getPositionConfig,
  POSITION_JOURNEY_ORDER,
} from './cardPositions';

/**
 * Result object returned by shuffle operations.
 * Contains the updated card array and animation states.
 */
export interface ShuffleResult {
  /** Updated array of cards with new positions (but old z-indexes) */
  cardsWithOldZIndex: Card[];
  
  /** Updated array of cards with new positions AND new z-indexes */
  cardsWithNewZIndex: Card[];
  
  /** New animation state for each card (which variant to use) */
  animationStates: CardAnimationMap;
  
  /** ID of the card that flew off screen during this shuffle */
  flyingCardId: CardId;
  
  /** ID of the card that smoothly moved to center */
  movingToCenterCardId: CardId;
}

/**
 * Initialize the starting card configuration.
 * Sets up the 5 cards with their initial positions, z-indexes, and photo assignments.
 * 
 * Step 0: 
 * - CARD_1: CENTER (z:5, photo:0)
 * - CARD_2: TOP_LEFT (z:4, photo:1)
 * - CARD_3: TOP_RIGHT (z:3, photo:2)
 * - CARD_4: BOTTOM_LEFT (z:2, photo:3)
 * - CARD_5: BOTTOM_RIGHT (z:1, photo:4)
 * 
 * Each card gets a unique photo index (0-4) that never changes.
 */
export function initializeCards(): Card[] {
  return [
    { id: CardId.CARD_1, position: CardPosition.CENTER, zIndex: 5, photoIndex: 0 },
    { id: CardId.CARD_2, position: CardPosition.TOP_LEFT, zIndex: 4, photoIndex: 1 },
    { id: CardId.CARD_3, position: CardPosition.TOP_RIGHT, zIndex: 3, photoIndex: 2 },
    { id: CardId.CARD_4, position: CardPosition.BOTTOM_LEFT, zIndex: 2, photoIndex: 3 },
    { id: CardId.CARD_5, position: CardPosition.BOTTOM_RIGHT, zIndex: 1, photoIndex: 4 },
  ];
}

/**
 * Card sequence for rotating through CENTER position.
 * This defines which card takes CENTER next during forward shuffles.
 */
const CARD_SEQUENCE: CardId[] = [
  CardId.CARD_1,
  CardId.CARD_2,
  CardId.CARD_3,
  CardId.CARD_4,
  CardId.CARD_5,
];

/**
 * Execute a forward shuffle operation (right arrow).
 * 
 * Forward Shuffle Behavior:
 * 1. Find card at CENTER position
 * 2. Find which card should be NEXT at CENTER (based on card ID rotation: 1→2→3→4→5→1)
 * 3. SWAP their positions:
 *    - CENTER card takes the next card's position
 *    - Next card takes CENTER
 * 4. All other 3 cards stay in their current positions
 * 5. Assign animations: center card flies away, next card smoothly moves to center
 * 
 * Example:
 * - CARD_1 at CENTER, CARD_2 at TOP_LEFT
 * - After shuffle: CARD_1 at TOP_LEFT, CARD_2 at CENTER
 * - They simply swapped positions!
 * 
 * @param currentCards - Current array of card objects
 * @returns ShuffleResult with updated cards and animation states
 */
export function executeForwardShuffle(currentCards: Card[]): ShuffleResult {
  // Deep clone the cards array to avoid mutation
  const newCards = currentCards.map(card => ({ ...card }));
  
  // Find the card currently at CENTER
  const centerCard = newCards.find(card => card.position === CardPosition.CENTER);
  if (!centerCard) {
    throw new Error('No card found at CENTER position');
  }
  
  // Determine which card should be next at CENTER (rotate through card sequence)
  const currentCenterIndex = CARD_SEQUENCE.indexOf(centerCard.id);
  const nextCenterCardIndex = (currentCenterIndex + 1) % CARD_SEQUENCE.length;
  const nextCenterCardId = CARD_SEQUENCE[nextCenterCardIndex];
  
  // Find the card that will move to CENTER
  const nextCenterCard = newCards.find(card => card.id === nextCenterCardId);
  if (!nextCenterCard) {
    throw new Error(`Card ${nextCenterCardId} not found`);
  }
  
  // Determine where the center card will move to
  // The card leaving CENTER always goes to where the next center card currently is
  const nextPosition = nextCenterCard.position;
  
  // Get fly direction for the card leaving center (based on where it's going)
  const flyDirection = getPositionConfig(nextPosition).flyDirection;
  
  // Update positions (swap the two cards)
  centerCard.position = nextPosition;
  nextCenterCard.position = CardPosition.CENTER;
  
  // Create version WITH old z-indexes (for initial state at t=0)
  const cardsWithOldZIndex = newCards.map(card => ({ ...card }));
  
  // Update z-indexes (rotate for ALL cards)
  // Card leaving CENTER goes to back (z-index 1)
  // All other cards shift up in z-index (front card leaves, everyone moves forward)
  // Card entering CENTER gets z-index 5
  
  centerCard.zIndex = 1; // Card leaving CENTER goes to back of deck
  nextCenterCard.zIndex = 5; // Card entering CENTER gets highest z-index
  
  // All other cards shift UP by 1 (moving forward in the deck)
  newCards.forEach(card => {
    if (card.id !== centerCard.id && card.id !== nextCenterCard.id) {
      // Shift up: 1→2, 2→3, 3→4, 4→5 (but 5 is impossible since CENTER takes it)
      card.zIndex = card.zIndex + 1;
    }
  });
  
  // Create version WITH new z-indexes (for midpoint state at t=200ms)
  const cardsWithNewZIndex = newCards.map(card => ({ ...card }));
  
  // Build animation states
  const animationStates: CardAnimationMap = resetAllCardsToIdle();
  
  // Center card flies away
  animationStates[centerCard.id] = flyDirection === 'left' 
    ? AnimationState.FLY_LEFT 
    : AnimationState.FLY_RIGHT;
  
  // Next center card smoothly moves to center
  animationStates[nextCenterCard.id] = AnimationState.MOVE_TO_POSITION;
  
  return {
    cardsWithOldZIndex,
    cardsWithNewZIndex,
    animationStates,
    flyingCardId: centerCard.id,
    movingToCenterCardId: nextCenterCard.id,
  };
}

/**
 * Execute a backward shuffle operation (left arrow).
 * 
 * Backward Shuffle Behavior:
 * 1. Find card at CENTER position
 * 2. Find which card should be PREVIOUS at CENTER (based on card ID rotation: 1←2←3←4←5←1)
 * 3. SWAP their positions:
 *    - CENTER card takes the previous card's position
 *    - Previous card takes CENTER
 * 4. All other 3 cards stay in their current positions
 * 5. Z-indexes rotate in reverse: all shift up (1→2→3→4→5), CENTER always gets 5
 * 6. Assign animations: center card flies away, previous card smoothly moves to center
 * 
 * @param currentCards - Current array of card objects
 * @returns ShuffleResult with updated cards and animation states
 */
export function executeBackwardShuffle(currentCards: Card[]): ShuffleResult {
  // Deep clone the cards array to avoid mutation
  const newCards = currentCards.map(card => ({ ...card }));
  
  // Find the card currently at CENTER
  const centerCard = newCards.find(card => card.position === CardPosition.CENTER);
  if (!centerCard) {
    throw new Error('No card found at CENTER position');
  }
  
  // Determine which card should be previous at CENTER (rotate backward through card sequence)
  const currentCenterIndex = CARD_SEQUENCE.indexOf(centerCard.id);
  const prevCenterCardIndex = (currentCenterIndex - 1 + CARD_SEQUENCE.length) % CARD_SEQUENCE.length;
  const prevCenterCardId = CARD_SEQUENCE[prevCenterCardIndex];
  
  // Find the card that will move to CENTER
  const prevCenterCard = newCards.find(card => card.id === prevCenterCardId);
  if (!prevCenterCard) {
    throw new Error(`Card ${prevCenterCardId} not found`);
  }
  
  // Determine where the center card will move to
  // The card leaving CENTER always goes to where the previous center card currently is
  const prevPosition = prevCenterCard.position;
  
  // Get fly direction for the BACK card (based on where it currently is)
  // In backward shuffle, the back card flies from its current position to CENTER
  const flyDirection = getPositionConfig(prevPosition).flyDirection;
  
  // Update positions (swap the two cards)
  centerCard.position = prevPosition;
  prevCenterCard.position = CardPosition.CENTER;
  
  // Create version WITH old z-indexes (for initial state at t=0)
  const cardsWithOldZIndex = newCards.map(card => ({ ...card }));
  
  // Update z-indexes (rotate BACKWARD for ALL cards)
  // Card entering CENTER comes from z:1 (backmost) and gets z:5
  // All other cards shift DOWN in z-index (everyone moves back as back card comes forward)
  
  prevCenterCard.zIndex = 5; // Card entering CENTER (was at z:1) gets highest z-index
  
  // All other cards shift DOWN by 1 (moving backward in the deck)
  newCards.forEach(card => {
    if (card.id !== prevCenterCard.id) {
      // Shift down: 5→4, 4→3, 3→2, 2→1
      card.zIndex = card.zIndex - 1;
    }
  });
  
  // Create version WITH new z-indexes (for midpoint state at t=200ms)
  const cardsWithNewZIndex = newCards.map(card => ({ ...card }));
  
  // Build animation states
  const animationStates: CardAnimationMap = resetAllCardsToIdle();
  
  // Back card (entering CENTER) flies in
  animationStates[prevCenterCard.id] = flyDirection === 'left' 
    ? AnimationState.FLY_LEFT 
    : AnimationState.FLY_RIGHT;
  
  // Center card (leaving CENTER) smoothly moves to back position
  animationStates[centerCard.id] = AnimationState.MOVE_TO_POSITION;
  
  return {
    cardsWithOldZIndex,
    cardsWithNewZIndex,
    animationStates,
    flyingCardId: prevCenterCard.id, // Back card flies
    movingToCenterCardId: centerCard.id, // Center card moves (but not to center, to back!)
  };
}

/**
 * Reset all cards to idle animation state.
 * Used after shuffle animations complete to return cards to rest state.
 * 
 * @returns Animation state map with all cards set to IDLE
 */
export function resetAllCardsToIdle(): CardAnimationMap {
  return {
    [CardId.CARD_1]: AnimationState.IDLE,
    [CardId.CARD_2]: AnimationState.IDLE,
    [CardId.CARD_3]: AnimationState.IDLE,
    [CardId.CARD_4]: AnimationState.IDLE,
    [CardId.CARD_5]: AnimationState.IDLE,
  };
}

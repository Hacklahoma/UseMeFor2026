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
 * Sets up the 6 cards with their initial positions, z-indexes, and photo assignments.
 * 
 * Initial State: 
 * - CARD_A: CENTER (z:5, original photo:0, displaying photo:0)
 * - CARD_B: TOP_LEFT (z:4, original photo:1, displaying photo:1)
 * - CARD_C: TOP_RIGHT (z:3, original photo:2, displaying photo:2)
 * - CARD_D: BOTTOM_LEFT (z:2, original photo:3, displaying photo:3)
 * - CARD_E: BOTTOM_RIGHT (z:1, original photo:4, displaying photo:4)
 * - CARD_F: CENTER_BACK (z:0, original photo:5, displaying photo:5)
 * 
 * Each card gets:
 * - id: Permanent letter identity (A-F) shown in footer
 * - photoIndex: Original photo assignment (immutable, for reference)
 * - currentPhotoIndex: Currently displayed photo (mutable, changes when card reaches CENTER)
 */
export function initializeCards(): Card[] {
  return [
    { id: CardId.CARD_A, position: CardPosition.CENTER, zIndex: 5, photoIndex: 0, currentPhotoIndex: 0 },
    { id: CardId.CARD_F, position: CardPosition.CENTER_BACK, zIndex: 0, photoIndex: 5, currentPhotoIndex: 5 },
    { id: CardId.CARD_B, position: CardPosition.TOP_LEFT, zIndex: 4, photoIndex: 1, currentPhotoIndex: 1 },
    { id: CardId.CARD_C, position: CardPosition.TOP_RIGHT, zIndex: 3, photoIndex: 2, currentPhotoIndex: 2 },
    { id: CardId.CARD_D, position: CardPosition.BOTTOM_LEFT, zIndex: 2, photoIndex: 3, currentPhotoIndex: 3 },
    { id: CardId.CARD_E, position: CardPosition.BOTTOM_RIGHT, zIndex: 1, photoIndex: 4, currentPhotoIndex: 4 },
  ];
}

/**
 * Card sequence for rotating through CENTER position.
 * This defines which card takes CENTER next during forward shuffles.
 * Order: A → B → C → D → E → F → A (repeats)
 */
const CARD_SEQUENCE: CardId[] = [
  CardId.CARD_A,
  CardId.CARD_B,
  CardId.CARD_C,
  CardId.CARD_D,
  CardId.CARD_E,
  CardId.CARD_F,
];


/**
 * Execute a forward shuffle operation (right arrow).
 * 
 * Forward Shuffle Behavior:
 * 1. Find card at CENTER position
 * 2. Find which card should be NEXT at CENTER (based on card ID rotation: 1→2→3→4→5→6→1)
 * 3. THREE cards move positions:
 *    - CENTER card → CENTER_BACK (always)
 *    - Next card → CENTER
 *    - CENTER_BACK card → Takes the position the next card vacated
 * 4. All other cards stay in their current positions
 * 5. Assign animations: center card flies away, next card smoothly moves to center, center_back card moves to vacated spot
 * 
 * Example:
 * - CARD_1 at CENTER, CARD_2 at TOP_LEFT, CARD_6 at CENTER_BACK
 * - After shuffle: CARD_1 at CENTER_BACK, CARD_2 at CENTER, CARD_6 at TOP_LEFT
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
  
  // Find the card currently at CENTER_BACK
  const centerBackCard = newCards.find(card => card.position === CardPosition.CENTER_BACK);
  if (!centerBackCard) {
    throw new Error('No card found at CENTER_BACK position');
  }
  
  // Determine which card should be next at CENTER (based on card ID sequence)
  const currentCenterIndex = CARD_SEQUENCE.indexOf(centerCard.id);
  const nextCenterIndex = (currentCenterIndex + 1) % CARD_SEQUENCE.length;
  const nextCenterId = CARD_SEQUENCE[nextCenterIndex];
  
  // Find the card that should move to CENTER
  const nextCenterCard = newCards.find(card => card.id === nextCenterId);
  if (!nextCenterCard) {
    throw new Error(`Card ${nextCenterId} not found`);
  }
  
  // Check if nextCenterCard is already at CENTER_BACK
  // If so, we have a special case: only TWO cards move (CENTER and CENTER_BACK swap)
  if (nextCenterCard.position === CardPosition.CENTER_BACK) {
    // Simple two-way swap
    centerCard.position = CardPosition.CENTER_BACK;
    nextCenterCard.position = CardPosition.CENTER;
    
    // Get fly direction (use right as default for this special case)
    const specialFlyDirection = 'right' as const;
    
    // Create snapshots
    const cardsWithOldZIndex = newCards.map(card => ({ ...card }));
    
    // Update z-indexes
    newCards.forEach(card => {
      card.zIndex = card.zIndex + 1;
    });
    centerCard.zIndex = 0;
    nextCenterCard.zIndex = 5;
    
    const cardsWithNewZIndex = newCards.map(card => ({ ...card }));
    
    // Build animation states
    const animationStates: CardAnimationMap = resetAllCardsToIdle();
    animationStates[centerCard.id] = AnimationState.FLY_RIGHT; // Always fly right in special case
    animationStates[nextCenterCard.id] = AnimationState.MOVE_TO_POSITION;
    
    return {
      cardsWithOldZIndex,
      cardsWithNewZIndex,
      animationStates,
      flyingCardId: centerCard.id,
      movingToCenterCardId: nextCenterCard.id,
    };
  }
  
  // Normal case: nextCenterCard is at a visible position
  // Save where nextCenterCard is coming from
  const vacatedPosition = nextCenterCard.position;
  
  // Get fly direction based on where CENTER_BACK card is moving to
  const flyDirection = getPositionConfig(vacatedPosition).flyDirection;
  
  // Update positions (three-way rotation)
  centerCard.position = CardPosition.CENTER_BACK;        // CENTER → CENTER_BACK
  nextCenterCard.position = CardPosition.CENTER;         // Next in sequence → CENTER
  centerBackCard.position = vacatedPosition;             // CENTER_BACK → position vacated by nextCenterCard
  
  // Create version WITH old z-indexes (for initial state at t=0)
  const cardsWithOldZIndex = newCards.map(card => ({ ...card }));
  
  // Update z-indexes
  // Strategy: Everyone shifts up by 1 (including CENTER_BACK card)
  // Then set special cases:
  // - centerCard: goes to z:0 (back)
  // - nextCenterCard: goes to z:5 (front)
  
  // Shift ALL cards up by 1 (front card left, everyone moves forward including CENTER_BACK)
  newCards.forEach(card => {
    card.zIndex = card.zIndex + 1;
  });
  
  // Set the two special cards
  centerCard.zIndex = 0; // Card leaving CENTER goes to back (CENTER_BACK)
  nextCenterCard.zIndex = 5; // Card entering CENTER gets front
  // centerBackCard keeps its shifted value (was 0, now 1)
  
  // Create version WITH new z-indexes (for midpoint state at t=200ms)
  const cardsWithNewZIndex = newCards.map(card => ({ ...card }));
  
  // Build animation states
  const animationStates: CardAnimationMap = resetAllCardsToIdle();
  
  // Center card flies away to CENTER_BACK
  animationStates[centerCard.id] = flyDirection === 'left' 
    ? AnimationState.FLY_LEFT 
    : AnimationState.FLY_RIGHT;
  
  // Next center card smoothly moves to center
  animationStates[nextCenterCard.id] = AnimationState.MOVE_TO_POSITION;
  
  // CENTER_BACK card smoothly moves to vacated position
  animationStates[centerBackCard.id] = AnimationState.MOVE_TO_POSITION;
  
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
 * Backward Shuffle Behavior (reverse of forward):
 * Card sequence in reverse: A → F → E → D → C → B → A (repeats)
 * 
 * 1. Find card at CENTER position
 * 2. Find card at CENTER_BACK position
 * 3. Determine which card should be PREVIOUS at CENTER (based on card ID rotation in reverse)
 * 4. THREE cards move positions:
 *    - CENTER card → position vacated by previous card
 *    - Previous card (from some position) → CENTER
 *    - CENTER_BACK card → position vacated by CENTER card (if needed)
 * 
 * This is the mirror of forward shuffle, moving through the card sequence backwards.
 * 
 * Example:
 * - CARD_A at CENTER, click backward → CARD_F moves to CENTER
 * - CARD_F at CENTER, click backward → CARD_E moves to CENTER
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
  
  // Find the card currently at CENTER_BACK
  const centerBackCard = newCards.find(card => card.position === CardPosition.CENTER_BACK);
  if (!centerBackCard) {
    throw new Error('No card found at CENTER_BACK position');
  }
  
  // Determine which card should be PREVIOUS at CENTER (based on card ID sequence in reverse)
  const currentCenterIndex = CARD_SEQUENCE.indexOf(centerCard.id);
  const prevCenterIndex = (currentCenterIndex - 1 + CARD_SEQUENCE.length) % CARD_SEQUENCE.length;
  const prevCenterId = CARD_SEQUENCE[prevCenterIndex];
  
  console.log(`📍 Current CENTER card: ${centerCard.id}`);
  console.log(`📍 Previous card in sequence: ${prevCenterId}`);
  
  // Find the card that should move to CENTER
  const prevCenterCard = newCards.find(card => card.id === prevCenterId);
  if (!prevCenterCard) {
    throw new Error(`Card ${prevCenterId} not found`);
  }
  
  console.log(`📍 Previous card is at position: ${prevCenterCard.position}`);
  
  // ALWAYS do 3-way rotation for backward shuffle
  // The "special case" logic was incorrect - we always need to move 3 cards:
  // 1. prevCenterCard → CENTER
  // 2. centerCard → CENTER_BACK  
  // 3. centerBackCard → position vacated by prevCenterCard
  console.log(`✅ NORMAL CASE: 3-way rotation`);
  
  // Remove the special case - it was causing the bug
  if (false && prevCenterCard.position === CardPosition.CENTER_BACK) {
    // Simple two-way swap
    centerCard.position = CardPosition.CENTER_BACK;
    prevCenterCard.position = CardPosition.CENTER;
    
    // Get fly direction (use left as default for this special case)
    const specialFlyDirection = 'left' as const;
    
    // Create snapshots
    const cardsWithOldZIndex = newCards.map(card => ({ ...card }));
    
    // Update z-indexes
    newCards.forEach(card => {
      card.zIndex = card.zIndex - 1;
    });
    centerCard.zIndex = 0;
    prevCenterCard.zIndex = 5;
    
    const cardsWithNewZIndex = newCards.map(card => ({ ...card }));
    
    // Build animation states
    const animationStates: CardAnimationMap = resetAllCardsToIdle();
    animationStates[prevCenterCard.id] = AnimationState.FLY_LEFT; // Always fly left in special case
    animationStates[centerCard.id] = AnimationState.MOVE_TO_POSITION;
    
    return {
      cardsWithOldZIndex,
      cardsWithNewZIndex,
      animationStates,
      flyingCardId: prevCenterCard.id,
      movingToCenterCardId: prevCenterCard.id,
    };
  }
  
  // Normal case: prevCenterCard is at a visible position
  // Save where prevCenterCard is coming from
  const vacatedPosition = prevCenterCard.position;
  
  console.log(`🔄 BACKWARD 3-WAY ROTATION:`);
  console.log(`  ${prevCenterCard.id} (at ${vacatedPosition}) → CENTER`);
  console.log(`  ${centerCard.id} (at CENTER) → CENTER_BACK`);
  console.log(`  ${centerBackCard.id} (at CENTER_BACK) → ${vacatedPosition}`);
  
  // Get fly direction based on where CENTER_BACK card is moving to (mirror of forward)
  const flyDirection = getPositionConfig(vacatedPosition).flyDirection;
  
  // Update positions (three-way rotation - mirror of forward shuffle)
  prevCenterCard.position = CardPosition.CENTER;         // Previous card → CENTER
  centerCard.position = CardPosition.CENTER_BACK;        // CENTER → CENTER_BACK
  centerBackCard.position = vacatedPosition;             // CENTER_BACK → position vacated by prevCenterCard
  
  // Create version WITH old z-indexes (for initial state at t=0)
  const cardsWithOldZIndex = newCards.map(card => ({ ...card }));
  
  // Update z-indexes (reverse of forward shuffle)
  // Strategy: Everyone shifts DOWN by 1 (back card comes forward, everyone moves back)
  // Then set special cases:
  // - prevCenterCard: goes to z:5 (front, it's the new CENTER)
  // - centerCard: goes to z:0 (back, it's going to CENTER_BACK)
  // - centerBackCard: gets the z-index that centerCard had (was 5, becomes 4 after shift)
  
  // Save centerCard's z-index before shifting (it's currently 5 at CENTER)
  const oldCenterZIndex = centerCard.zIndex;
  
  // Shift ALL cards down by 1 (back card comes forward, everyone moves back)
  newCards.forEach(card => {
    card.zIndex = card.zIndex - 1;
  });
  
  // Set the special cards
  prevCenterCard.zIndex = 5; // Card entering CENTER gets front (z:5)
  centerCard.zIndex = 0; // Card leaving CENTER goes to back (z:0 at CENTER_BACK)
  // centerBackCard gets the old center's z-index minus 1 (was 5, now 4)
  centerBackCard.zIndex = oldCenterZIndex - 1;
  
  // Create version WITH new z-indexes (for midpoint state at t=200ms)
  const cardsWithNewZIndex = newCards.map(card => ({ ...card }));
  
  // Build animation states
  const animationStates: CardAnimationMap = resetAllCardsToIdle();
  
  // Previous center card flies to CENTER
  animationStates[prevCenterCard.id] = flyDirection === 'left' 
    ? AnimationState.FLY_LEFT 
    : AnimationState.FLY_RIGHT;
  
  // Center card smoothly moves to CENTER_BACK
  animationStates[centerCard.id] = AnimationState.MOVE_TO_POSITION;
  
  // CENTER_BACK card smoothly moves to vacated position
  animationStates[centerBackCard.id] = AnimationState.MOVE_TO_POSITION;
  
  return {
    cardsWithOldZIndex,
    cardsWithNewZIndex,
    animationStates,
    flyingCardId: prevCenterCard.id, // Previous card flies to CENTER
    movingToCenterCardId: prevCenterCard.id, // Same card, it's moving to center
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
    [CardId.CARD_A]: AnimationState.IDLE,
    [CardId.CARD_B]: AnimationState.IDLE,
    [CardId.CARD_C]: AnimationState.IDLE,
    [CardId.CARD_D]: AnimationState.IDLE,
    [CardId.CARD_E]: AnimationState.IDLE,
    [CardId.CARD_F]: AnimationState.IDLE,
  };
}

/**
 * Assign a photo to the card currently at CENTER position.
 * This should be called after the shuffle animation completes.
 * 
 * The card at CENTER receives the new photo and "holds onto" it
 * as it moves through other positions in future shuffles.
 * 
 * @param cards - Current array of cards
 * @param photoIndex - The photo index to assign to the CENTER card
 * @returns Updated array of cards with photo assigned
 */
export function assignPhotoToCenterCard(cards: Card[], photoIndex: number): Card[] {
  const updatedCards = cards.map(card => ({ ...card }));
  const centerCard = updatedCards.find(card => card.position === CardPosition.CENTER);
  
  if (centerCard) {
    centerCard.currentPhotoIndex = photoIndex;
  }
  
  return updatedCards;
}

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
 * Step 0: 
 * - CARD_1: CENTER (z:5, photo:0)
 * - CARD_2: TOP_LEFT (z:4, photo:1)
 * - CARD_3: TOP_RIGHT (z:3, photo:2)
 * - CARD_4: BOTTOM_LEFT (z:2, photo:3)
 * - CARD_5: BOTTOM_RIGHT (z:1, photo:4)
 * - CARD_6: CENTER_BACK (z:0, photo:5)
 * 
 * Each card gets a unique photo index (0-5) that never changes.
 */
export function initializeCards(): Card[] {
  return [
    { id: CardId.CARD_1, position: CardPosition.CENTER, zIndex: 5, photoIndex: 0 },
    { id: CardId.CARD_6, position: CardPosition.CENTER_BACK, zIndex: 0, photoIndex: 5 },
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
  CardId.CARD_6,
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
  
  // Determine which card should be next at CENTER (rotate through card sequence)
  const currentCenterIndex = CARD_SEQUENCE.indexOf(centerCard.id);
  const nextCenterCardIndex = (currentCenterIndex + 1) % CARD_SEQUENCE.length;
  const nextCenterCardId = CARD_SEQUENCE[nextCenterCardIndex];
  
  // Find the card that will move to CENTER
  const nextCenterCard = newCards.find(card => card.id === nextCenterCardId);
  if (!nextCenterCard) {
    throw new Error(`Card ${nextCenterCardId} not found`);
  }
  
  // Save the position that the next center card is vacating
  const vacatedPosition = nextCenterCard.position;
  
  // Get fly direction based on where CENTER_BACK card is moving to
  // This determines if the center card flies left or right
  const flyDirection = getPositionConfig(vacatedPosition).flyDirection;
  
  // Update positions (three-way rotation)
  centerCard.position = CardPosition.CENTER_BACK;        // CENTER → CENTER_BACK
  nextCenterCard.position = CardPosition.CENTER;         // Next → CENTER
  centerBackCard.position = vacatedPosition;             // CENTER_BACK → vacated position
  
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
  
  // Set the two special cards (centerBackCard already shifted up by 1, which is correct)
  centerCard.zIndex = 0; // Card leaving CENTER goes to back
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
 * Backward Shuffle Behavior:
 * The CENTER card cycles through positions: TOP_LEFT → TOP_RIGHT → BOTTOM_LEFT → BOTTOM_RIGHT → (repeat)
 * 
 * 1. Find card at CENTER position
 * 2. Find card at CENTER_BACK position
 * 3. Determine target position (cycles through non-CENTER positions in POSITION_JOURNEY_ORDER)
 * 4. THREE cards move positions:
 *    - CENTER card → target position (displacing the card there)
 *    - CENTER_BACK card → CENTER (comes forward)
 *    - Card at target position → CENTER_BACK (gets displaced)
 * 
 * Example sequence:
 * Click 1: CARD_1(CENTER) → TOP_LEFT, CARD_6(CENTER_BACK) → CENTER, CARD_2(TOP_LEFT) → CENTER_BACK
 * Click 2: CARD_6(CENTER) → TOP_RIGHT, CARD_2(CENTER_BACK) → CENTER, CARD_3(TOP_RIGHT) → CENTER_BACK
 * Click 3: CARD_2(CENTER) → BOTTOM_LEFT, CARD_3(CENTER_BACK) → CENTER, CARD_4(BOTTOM_LEFT) → CENTER_BACK
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
  
  // Determine target position by finding which position to target next
  // We cycle through: TOP_LEFT → TOP_RIGHT → BOTTOM_LEFT → BOTTOM_RIGHT → (repeat)
  // Strategy: Find which card from CENTER_BACK has most recently been placed
  // Look at positions 2-5 (TOP_LEFT, TOP_RIGHT, BOTTOM_LEFT, BOTTOM_RIGHT)
  // Find the "newest" card (highest z-index among those positions)
  // Target the next position in the cycle
  
  // Get all cards at the 4 target positions
  const positionsToCheck = [
    CardPosition.TOP_LEFT,
    CardPosition.TOP_RIGHT,
    CardPosition.BOTTOM_LEFT,
    CardPosition.BOTTOM_RIGHT,
  ];
  
  // Find which position has the card with highest z-index (most recently placed)
  let highestZIndex = -1;
  let positionWithHighestZ: CardPosition | null = null;
  
  positionsToCheck.forEach(pos => {
    const cardAtPos = newCards.find(card => card.position === pos);
    if (cardAtPos && cardAtPos.zIndex > highestZIndex) {
      highestZIndex = cardAtPos.zIndex;
      positionWithHighestZ = pos;
    }
  });
  
  // Determine target position: next position after the one with highest z-index
  let targetPosition: CardPosition;
  
  if (positionWithHighestZ === null) {
    // No cards placed yet, start with TOP_LEFT
    targetPosition = CardPosition.TOP_LEFT;
  } else {
    // Find the index of the position with highest z-index
    const currentPosIndex = positionsToCheck.indexOf(positionWithHighestZ);
    // Get next position in cycle
    const nextPosIndex = (currentPosIndex + 1) % positionsToCheck.length;
    targetPosition = positionsToCheck[nextPosIndex];
  }
  
  // Find the card at the target position (this card will be displaced to CENTER_BACK)
  const targetPositionCard = newCards.find(card => card.position === targetPosition);
  if (!targetPositionCard) {
    throw new Error(`No card found at position ${targetPosition}`);
  }
  
  // Get fly direction based on where CENTER_BACK card is going
  const flyDirection = getPositionConfig(targetPosition).flyDirection;
  
  // Update positions (three-way rotation)
  centerCard.position = targetPosition;                  // CENTER → target position
  centerBackCard.position = CardPosition.CENTER;         // CENTER_BACK → CENTER
  targetPositionCard.position = CardPosition.CENTER_BACK;  // target position → CENTER_BACK
  
  // Create version WITH old z-indexes (for initial state at t=0)
  const cardsWithOldZIndex = newCards.map(card => ({ ...card }));
  
  // Update z-indexes (reverse of forward shuffle)
  // Strategy: Everyone shifts DOWN by 1 (back card comes forward, everyone moves back)
  // Then set special cases:
  // - centerBackCard: goes to z:5 (front)
  // - centerCard: keeps shifted value
  // - nextPositionCard: goes to z:0 (back)
  
  // Shift ALL cards down by 1 (back card comes forward, everyone moves back)
  newCards.forEach(card => {
    card.zIndex = card.zIndex - 1;
  });
  
  // Set the two special cards
  centerBackCard.zIndex = 5; // Card coming from CENTER_BACK goes to front
  targetPositionCard.zIndex = 0; // Card going to CENTER_BACK goes to back
  // centerCard keeps its shifted value (was 5, now 4)
  
  // Create version WITH new z-indexes (for midpoint state at t=200ms)
  const cardsWithNewZIndex = newCards.map(card => ({ ...card }));
  
  // Build animation states
  const animationStates: CardAnimationMap = resetAllCardsToIdle();
  
  // CENTER_BACK card flies to CENTER
  animationStates[centerBackCard.id] = flyDirection === 'left' 
    ? AnimationState.FLY_LEFT 
    : AnimationState.FLY_RIGHT;
  
  // Center card smoothly moves to target position
  animationStates[centerCard.id] = AnimationState.MOVE_TO_POSITION;
  
  // Target position card smoothly moves to CENTER_BACK
  animationStates[targetPositionCard.id] = AnimationState.MOVE_TO_POSITION;
  
  return {
    cardsWithOldZIndex,
    cardsWithNewZIndex,
    animationStates,
    flyingCardId: centerBackCard.id, // CENTER_BACK card flies to CENTER
    movingToCenterCardId: centerBackCard.id, // Same card, it's moving to center
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
    [CardId.CARD_6]: AnimationState.IDLE,
  };
}

/**
 * Card Shuffle Business Logic
 * 
 * This file contains the core business logic for shuffling cards in the photo collage.
 * It operates on Card objects (id + position) and determines which cards need to
 * swap positions and which animations to apply.
 * 
 * Key Responsibilities:
 * - Find which card is at CENTER position
 * - Determine next/previous card in the sequence
 * - Execute 3-way position rotation
 * - Assign appropriate animation states (fly away vs smooth transition)
 * - Manage z-index updates to prevent visual glitches
 *
 * Architecture:
 * - THREE cards change position per shuffle (3-way rotation)
 * - THREE cards animate per shuffle (1 flies, 2 move smoothly)
 * - Other 3 cards remain stationary
 */

import {
  Card,
  CardId,
  CardPosition,
  CardAnimationMap,
  AnimationState,
  getPositionConfig,
} from './Card';

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
 * - CARD_A: CENTER (z:5, displaying photo:0)
 * - CARD_B: TOP_LEFT (z:4, displaying photo:1)
 * - CARD_C: TOP_RIGHT (z:3, displaying photo:2)
 * - CARD_D: BOTTOM_LEFT (z:2, displaying photo:3)
 * - CARD_E: BOTTOM_RIGHT (z:1, displaying photo:4)
 * - CARD_F: CENTER_BACK (z:0, displaying photo:5)
 *
 * Each card gets:
 * - id: Permanent letter identity (A-F) shown in footer
 * - currentPhotoIndex: Currently displayed photo (mutable, changes when card reaches CENTER)
 */
export function initializeCards(): Card[] {
  return [
    { id: CardId.CARD_A, position: CardPosition.CENTER, zIndex: 5, currentPhotoIndex: 0 },
    { id: CardId.CARD_B, position: CardPosition.TOP_LEFT, zIndex: 4, currentPhotoIndex: 1 },
    { id: CardId.CARD_C, position: CardPosition.TOP_RIGHT, zIndex: 3, currentPhotoIndex: 2 },
    { id: CardId.CARD_D, position: CardPosition.BOTTOM_LEFT, zIndex: 2, currentPhotoIndex: 3 },
    { id: CardId.CARD_E, position: CardPosition.BOTTOM_RIGHT, zIndex: 1, currentPhotoIndex: 4 },
    { id: CardId.CARD_F, position: CardPosition.CENTER_BACK, zIndex: 0, currentPhotoIndex: 5 },
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
 * 2. Find which card should be NEXT at CENTER (based on card ID rotation: A→B→C→D→E→F→A)
 * 3. THREE cards move positions (3-way rotation):
 *    - CENTER card → CENTER_BACK (flies away dramatically)
 *    - Next card → CENTER (smoothly moves in)
 *    - CENTER_BACK card → Takes the position the next card vacated (smoothly moves)
 * 4. All other 3 cards stay in their current positions
 * 5. Z-indexes updated in two phases to prevent visual glitches
 *
 * Example:
 * - CARD_A at CENTER, CARD_B at TOP_LEFT, CARD_F at CENTER_BACK
 * - After shuffle: CARD_A at CENTER_BACK, CARD_B at CENTER, CARD_F at TOP_LEFT
 *
 * @param currentCards - Current array of card objects
 * @returns ShuffleResult with updated cards and animation states
 */
export function executeForwardShuffle(currentCards: Card[]): ShuffleResult {
  // Deep clone to avoid mutation
  const newCards = currentCards.map(card => ({ ...card }));
  
  // Step 1: Find the key cards involved in the shuffle
  const centerCard = findCardAtPosition(newCards, CardPosition.CENTER);
  const centerBackCard = findCardAtPosition(newCards, CardPosition.CENTER_BACK);
  
  // Step 2: Determine which card should move to CENTER next
  const nextCenterId = getNextCardIdInSequence(centerCard.id, 'forward');
  const nextCenterCard = findCardById(newCards, nextCenterId);
  
  // Step 3: THREE cards move (3-way rotation)
  // Save where nextCenterCard is coming from (this position will be vacated)
  const vacatedPosition = nextCenterCard.position;
  
  // Get fly direction based on where CENTER_BACK card is moving to
  const flyDirection = getPositionConfig(vacatedPosition).flyDirection;
  
  // Step 4: Update positions (three-way rotation)
  centerCard.position = CardPosition.CENTER_BACK;    // CENTER → CENTER_BACK
  nextCenterCard.position = CardPosition.CENTER;     // Next card → CENTER
  centerBackCard.position = vacatedPosition;         // CENTER_BACK → vacated spot
  
  // Step 5: Create two-phase z-index snapshots (prevents visual glitches)
  // Phase 1: Snapshot with OLD z-indexes (t=0ms, cards start moving)
  const cardsWithOldZIndex = newCards.map(card => ({ ...card }));
  
  // Phase 2: Update z-indexes using helper
  updateZIndexes(newCards, centerCard, nextCenterCard, 'forward');
  
  // Phase 3: Snapshot with NEW z-indexes (t=200ms, applied mid-animation)
  const cardsWithNewZIndex = newCards.map(card => ({ ...card }));
  
  // Step 6: Build animations - center flies away, others move smoothly
  const animationStates = buildAnimationStates(
    centerCard.id,
    flyDirection,
    [nextCenterCard.id, centerBackCard.id]
  );
  
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
 * Backward Shuffle Behavior (mirror of forward):
 * Card sequence in reverse: A → F → E → D → C → B → A (repeats)
 *
 * 1. Find card at CENTER position
 * 2. Find card at CENTER_BACK position
 * 3. Determine which card should be PREVIOUS at CENTER (based on card ID rotation in reverse)
 * 4. THREE cards move positions:
 *    - CENTER card → CENTER_BACK (flies away - symmetric with forward)
 *    - Previous card (from some position) → CENTER (smoothly moves)
 *    - CENTER_BACK card → position vacated by previous card
 *
 * Animation behavior is symmetric with forward shuffle:
 * - CENTER card always flies away (creating dramatic exit)
 * - Incoming card always smoothly moves to CENTER (creating smooth entrance)
 * - Fly direction is opposite of forward (since moving backward)
 *
 * Example:
 * - CARD_A at CENTER, click backward → CARD_A flies to CENTER_BACK, CARD_F smoothly moves to CENTER
 * - CARD_F at CENTER, click backward → CARD_F flies to CENTER_BACK, CARD_E smoothly moves to CENTER
 *
 * @param currentCards - Current array of card objects
 * @returns ShuffleResult with updated cards and animation states
 */
export function executeBackwardShuffle(currentCards: Card[]): ShuffleResult {
  // Deep clone to avoid mutation
  const newCards = currentCards.map(card => ({ ...card }));
  
  // Step 1: Find the key cards involved in the shuffle
  const centerCard = findCardAtPosition(newCards, CardPosition.CENTER);
  const centerBackCard = findCardAtPosition(newCards, CardPosition.CENTER_BACK);
  
  // Step 2: Determine which card should move to CENTER next (2 steps back in sequence)
  const oneStepBackId = getNextCardIdInSequence(centerCard.id, 'backward');
  const twoStepsBackId = getNextCardIdInSequence(oneStepBackId, 'backward');
  const targetCard = findCardById(newCards, twoStepsBackId);
  
  // Step 3: THREE cards move (3-way rotation)
  const vacatedPosition = targetCard.position;
  const flyDirection = getPositionConfig(vacatedPosition).flyDirection;
  
  // Step 4: Update positions (three-way rotation)
  centerCard.position = vacatedPosition;             // CENTER → vacated position
  centerBackCard.position = CardPosition.CENTER;     // CENTER_BACK → CENTER
  targetCard.position = CardPosition.CENTER_BACK;    // Target → CENTER_BACK
  
  // Step 5: Create two-phase z-index snapshots (prevents visual glitches)
  // Phase 1: Snapshot with OLD z-indexes (t=0ms, cards start moving)
  const cardsWithOldZIndex = newCards.map(card => ({ ...card }));
  
  // Phase 2: Update z-indexes using helper
  updateZIndexes(newCards, centerCard, centerBackCard, 'backward');
  
  // Phase 3: Snapshot with NEW z-indexes (t=200ms, applied mid-animation)
  const cardsWithNewZIndex = newCards.map(card => ({ ...card }));
  
  // Step 6: Build animations - center flies away, others move smoothly
  const animationStates = buildAnimationStates(
    centerBackCard.id,
    flyDirection,
    [targetCard.id, centerCard.id]
  );
  
  return {
    cardsWithOldZIndex,
    cardsWithNewZIndex,
    animationStates,
    flyingCardId: centerBackCard.id,
    movingToCenterCardId: centerBackCard.id,
  };
}

/**
 * Helper: Find a card at a specific position, throw if not found.
 * This ensures we always have the required cards for a shuffle.
 */
function findCardAtPosition(cards: Card[], position: CardPosition): Card {
  const card = cards.find(c => c.position === position);
  if (!card) {
    throw new Error(`No card found at ${position} position`);
  }
  return card;
}

/**
 * Helper: Find a card by its ID, throw if not found.
 * This ensures we always have the required cards for a shuffle.
 */
function findCardById(cards: Card[], cardId: CardId): Card {
  const card = cards.find(c => c.id === cardId);
  if (!card) {
    throw new Error(`Card ${cardId} not found`);
  }
  return card;
}

/**
 * Helper: Get the next card ID in the sequence (circular).
 * Used for forward shuffles to determine which card moves to CENTER next.
 */
function getNextCardIdInSequence(currentCardId: CardId, direction: 'forward' | 'backward'): CardId {
  const currentIndex = CARD_SEQUENCE.indexOf(currentCardId);
  const nextIndex = direction === 'forward'
    ? (currentIndex + 1) % CARD_SEQUENCE.length
    : (currentIndex - 1 + CARD_SEQUENCE.length) % CARD_SEQUENCE.length;
  return CARD_SEQUENCE[nextIndex];
}

/**
 * Helper: Update z-indexes for shuffle operations.
 *
 * Forward: Shift all cards up (+1), then set special cases
 * Backward: Shift all cards down (-1), then set special cases
 */
function updateZIndexes(cards: Card[], centerCard: Card, nextCenterCard: Card, direction: 'forward' | 'backward'): void {
  if (direction === 'forward') {
    
    cards.forEach(card => {
      card.zIndex = card.zIndex + 1;
    });
    centerCard.zIndex = 0;      // Card leaving CENTER goes to back
    nextCenterCard.zIndex = 5;  // Card entering CENTER goes to front

  } else if (direction === 'backward') {

    cards.forEach(card => {
      card.zIndex = card.zIndex - 1;
    });
    nextCenterCard.zIndex = 5;

  } else {
    throw new Error(`Invalid direction: ${direction}`);
  }
}

/**
 * Helper: Build animation states for a shuffle.
 * Sets which cards animate and how (fly vs smooth move).
 */
function buildAnimationStates(
  flyingCardId: CardId,
  flyDirection: 'left' | 'right',
  movingCardIds: CardId[]
): CardAnimationMap {
  // Initialize all cards to MOVE_TO_POSITION (maintains their current position)
  const animationStates: CardAnimationMap = {
    [CardId.CARD_A]: AnimationState.MOVE_TO_POSITION,
    [CardId.CARD_B]: AnimationState.MOVE_TO_POSITION,
    [CardId.CARD_C]: AnimationState.MOVE_TO_POSITION,
    [CardId.CARD_D]: AnimationState.MOVE_TO_POSITION,
    [CardId.CARD_E]: AnimationState.MOVE_TO_POSITION,
    [CardId.CARD_F]: AnimationState.MOVE_TO_POSITION,
  };
  
  // Flying card gets directional fly animation
  animationStates[flyingCardId] = flyDirection === 'left'
    ? AnimationState.FLY_LEFT
    : AnimationState.FLY_RIGHT;
  
  // Moving cards get smooth position transitions
  movingCardIds.forEach(cardId => {
    animationStates[cardId] = AnimationState.MOVE_TO_POSITION;
  });
  
  return animationStates;
}

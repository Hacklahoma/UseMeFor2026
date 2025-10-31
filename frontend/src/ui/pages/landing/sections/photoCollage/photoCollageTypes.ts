/**
 * Type definitions for the Photo Collage component
 * 
 * This file contains all type definitions, enums, and interfaces used throughout
 * the photo collage system. These types ensure type safety and make the codebase
 * easier to maintain and extend.
 */

/**
 * Represents the six distinct positions cards can occupy in the collage.
 * Each position has associated properties like coordinates, rotation, and z-index.
 * 
 * Position hierarchy (by z-index):
 * 1. CENTER - Front-most card (z-index: 5)
 * 2. TOP_LEFT - Behind center, left side (z-index: 4)
 * 3. TOP_RIGHT - Behind center, right side (z-index: 3)
 * 4. BOTTOM_LEFT - Back layer, left side (z-index: 2)
 * 5. BOTTOM_RIGHT - Back-most card, right side (z-index: 1)
 * 6. CENTER_BACK - Hidden behind center (z-index: 0)
 */
export enum CardPosition {
  CENTER = 'center',
  CENTER_BACK = 'centerBack',
  TOP_LEFT = 'topLeft',
  TOP_RIGHT = 'topRight',
  BOTTOM_LEFT = 'bottomLeft',
  BOTTOM_RIGHT = 'bottomRight'
}

/**
 * Unique identifiers for each of the six physical cards in the collage.
 * These IDs remain constant throughout the lifecycle of the component,
 * even as cards move between positions.
 */
export enum CardId {
  CARD_1 = 'card1',
  CARD_2 = 'card2',
  CARD_3 = 'card3',
  CARD_4 = 'card4',
  CARD_5 = 'card5',
  CARD_6 = 'card6',
}

/**
 * Card object representing a single card with its identity, position, z-index, and photo.
 * 
 * This is the core data structure for the collage system:
 * - id: Never changes (CARD_1, CARD_2, etc.)
 * - position: Changes during shuffles (CENTER, TOP_LEFT, etc.)
 * - zIndex: Changes during every shuffle (rotates: 5→4→3→2→1→4, CENTER always gets 5)
 * - photoIndex: Never changes, determines which photo this card displays (0-4)
 * 
 * Visual properties (top, left, rotate, flyDirection) come from the position's config,
 * but zIndex is tracked separately per card and overrides the position's default zIndex.
 * All properties are passed to Framer Motion variants which handle animations.
 */
export interface Card {
  /** Unique card identifier (immutable) */
  id: CardId;
  
  /** Current visual position in the collage (changes during shuffles) */
  position: CardPosition;
  
  /** Current z-index stacking order (1=back, 5=front, CENTER always has 5) */
  zIndex: number;
  
  /** Index of the photo to display (0-4, immutable) */
  photoIndex: number;
}

/**
 * Possible animation states a card can be in.
 * These states map directly to Framer Motion variants.
 * 
 * - IDLE: Card is at rest in its current position
 * - FLY_LEFT: Card is flying off screen to the left
 * - FLY_RIGHT: Card is flying off screen to the right
 * - MOVE_TO_POSITION: Card is smoothly transitioning to a new position
 * - OFFSCREEN: Initial state before page load animation
 * - ONSCREEN: Animating onto screen during page load
 */
export enum AnimationState {
  IDLE = 'idle',
  FLY_LEFT = 'flyLeft',
  FLY_RIGHT = 'flyRight',
  MOVE_TO_POSITION = 'moveToPosition',
  OFFSCREEN = 'offscreen',
  ONSCREEN = 'onscreen',
}

/**
 * Configuration defining the visual properties of a card position.
 * All positions have predefined, hardcoded values for consistency.
 */
export interface PositionConfig {
  /** Vertical position as CSS percentage (e.g., '50%') */
  top: string;
  
  /** Horizontal position as CSS percentage (e.g., '50%') */
  left: string;
  
  /** Rotation angle in degrees (positive = clockwise) */
  rotate: number;
  
  /** Stacking order (1 = back, 5 = front) */
  zIndex: number;
  
  /** Direction card should fly when exiting this position during shuffle */
  flyDirection: 'left' | 'right';
}

/**
 * Maps each card ID to its current animation state.
 * Used to control which Framer Motion variant each card should use.
 * 
 * Example: { card1: 'idle', card2: 'moveToPosition', ... }
 */
export type CardAnimationMap = Record<CardId, AnimationState>;

/**
 * Maps position names to their configuration objects.
 * This is used to look up the visual properties for any given position.
 */
export type PositionConfigMap = Record<CardPosition, PositionConfig>;


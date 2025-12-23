/**
 * Card Position Definitions and Logic
 * 
 * This file contains:
 * - Hardcoded position configurations for all 5 card positions
 * - Position journey order (z-index flow: front → back → front)
 * - Card order array management (circular queue)
 * - Helper functions for position lookups and shuffle operations
 * 
 * Architecture:
 * Cards flow through positions in a fixed order as they're shuffled.
 * CENTER → TOP_LEFT → TOP_RIGHT → BOTTOM_LEFT → BOTTOM_RIGHT → CENTER (repeat)
 * This creates a natural deck-shuffling effect where cards cycle through
 * from front (highest z-index) to back (lowest z-index) and return to front.
 */

import {
  CardPosition,
  PositionConfig,
  PositionConfigMap,
} from './photoCollageTypes';

/**
 * Hardcoded position configurations for all six card positions.
 * 
 * These values define the exact visual appearance of each position slot:
 * - top/left: CSS percentage coordinates
 * - rotate: Rotation angle in degrees
 * - zIndex: Stacking order (higher = closer to viewer)
 * - flyDirection: Which direction the card should exit when shuffling
 * 
 * These values are based on the original design and should not be
 * modified without careful consideration of the overall visual balance.
 */
export const POSITION_CONFIGS: PositionConfigMap = {
  [CardPosition.CENTER]: {
    top: '50%',
    left: '50%',
    rotate: 0,
    zIndex: 5,
    flyDirection: 'right', // Default; actual direction determined by target position
  },
  
  [CardPosition.CENTER_BACK]: {
    top: '50%',
    left: '50%',
    rotate: 0,
    zIndex: 0,
    flyDirection: 'left',
  },
  
  [CardPosition.TOP_LEFT]: {
    top: '40%',
    left: '42%',
    rotate: -8,
    zIndex: 4,
    flyDirection: 'left',
  },
  
  [CardPosition.TOP_RIGHT]: {
    top: '39%',
    left: '60%',
    rotate: 14,
    zIndex: 3,
    flyDirection: 'right',
  },
  
  [CardPosition.BOTTOM_LEFT]: {
    top: '60%',
    left: '40%',
    rotate: -8,
    zIndex: 2,
    flyDirection: 'left',
  },
  
  [CardPosition.BOTTOM_RIGHT]: {
    top: '62%',
    left: '60%',
    rotate: 12,
    zIndex: 1,
    flyDirection: 'right',
  },
};

/**
 * The journey order of positions as cards flow through the deck.
 * 
 * This array defines the circular path cards take as they're shuffled:
 * - Index 0: CENTER (z-index 5) - Front of deck, visible on top
 * - Index 1: CENTER_BACK (z-index 0) - Hidden behind center
 * - Index 2: TOP_LEFT (z-index 4) - Just behind center
 * - Index 3: TOP_RIGHT (z-index 3) - Middle layer
 * - Index 4: BOTTOM_LEFT (z-index 2) - Near back
 * - Index 5: BOTTOM_RIGHT (z-index 1) - Very back of deck
 * 
 * As cards are shuffled forward, each card moves to the next position in this array.
 * When a card reaches BOTTOM_RIGHT (index 5), it wraps back to CENTER (index 0).
 * 
 * This creates the visual effect of:
 * - Forward shuffle: Front card moves through positions toward the back
 * - Backward shuffle: Back card cycles forward to become the new front card
 */
export const POSITION_JOURNEY_ORDER: CardPosition[] = [
  CardPosition.CENTER,        // Index 0: Front (z-index 5)
  CardPosition.CENTER_BACK,   // Index 1: Hidden behind (z-index 0)
  CardPosition.TOP_LEFT,      // Index 2: Behind center (z-index 4)
  CardPosition.TOP_RIGHT,     // Index 3: Middle (z-index 3)
  CardPosition.BOTTOM_LEFT,   // Index 4: Near back (z-index 2)
  CardPosition.BOTTOM_RIGHT,  // Index 5: Back (z-index 1)
];


/**
 * Get the configuration for a specific position.
 * 
 * @param position - The position to look up
 * @returns The complete configuration object for that position
 * 
 * @example
 * const centerConfig = getPositionConfig(CardPosition.CENTER);
 * // Returns: { top: '50%', left: '50%', rotate: 0, zIndex: 5, flyDirection: 'right' }
 */
export function getPositionConfig(position: CardPosition): PositionConfig {
  return POSITION_CONFIGS[position];
}



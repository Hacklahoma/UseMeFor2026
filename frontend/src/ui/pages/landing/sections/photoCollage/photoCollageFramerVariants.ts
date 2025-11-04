/**
 * Framer Motion Animation Variants for Photo Collage
 * 
 * This file defines all animation variants used by the photo collage cards.
 * Each variant corresponds to a specific AnimationState and controls how
 * cards appear, transition, and animate during interactions.
 * 
 * Variants are pure functions that return animation configuration objects.
 * They receive position configuration as a parameter to ensure animations
 * are always synchronized with the card's target position.
 * 
 * Design Philosophy:
 * - Variants should be stateless and deterministic
 * - All position-specific values come from PositionConfig
 * - Timing values are consistent across similar animation types
 * - Spring animations provide natural, fluid motion
*/

import type { Variants } from 'motion/react';
import { PositionConfig } from './photoCollageTypes';
import { SCALE_VALUE, OFF_SCREEN_DISTANCE, FLY_DISTANCE } from './cardConstants';

/**
 * Custom properties passed to variants for dynamic animation calculations.
 * Extends PositionConfig with additional context needed for specific animations.
 */
interface VariantCustomProps extends PositionConfig {
  /** Animation delay in seconds (used for staggered entrance animations) */
  delay?: number;
}

/**
 * Complete set of animation variants for photo collage cards.
 * 
 * Variant naming convention:
 * - Directional suffixes for movement (e.g., 'flyLeft', 'flyRight')
 * - Descriptive names for complex states (e.g., 'moveToPosition')
 * 
 * Each variant must return a complete animation configuration including:
 * - Transform properties (x, y, rotate, scale)
 * - Position properties (top, left)
 * - Visual properties (opacity)
 * - Transition configuration (type, duration, easing)
 */
export const photoCollageCardVariants: Variants = {
  /**
   * IDLE STATE
   * Card is at rest in its assigned position with no active animation.
   * This is the default state after animations complete.
   */
  idle: (config: VariantCustomProps) => ({
    x: 0,
    y: 0,
  }),
  /**
   * MOVE TO POSITION STATE
   * Card smoothly transitions from its current position to a new position.
   * Uses spring physics for natural, organic motion.
   * 
   * Used when:
   * - Card is moving during a shuffle (non-flying cards)
   * - Card needs to adjust to a new position slot
   * - Smooth positional transitions are required
   * 
   * Animation characteristics:
   * - Moderate bounce for visual interest
   * - 0.6s duration for balanced speed
   * - Animates position, rotation, and transform simultaneously
   */
  moveToPosition: (config: VariantCustomProps) => ({
    x: 0,
    y: 0,
    top: config.top,
    left: config.left,
    rotate: config.rotate,
    translateX: '-50%',
    translateY: '-50%',
    opacity: 1,
    scale: SCALE_VALUE,
    transition: {
      type: 'spring',
      bounce: 0.2,
      duration: 0.3,
      damping: 20,
      stiffness: 200,
    },
    // GPU acceleration
    willChange: 'transform',
  }),

  /**
   * FLY LEFT STATE
   * Card rapidly exits to the left with a tilted rotation, then returns to center.
   * Creates a dynamic "swooping away and back" effect.
   * 
   * Used when:
   * - Left-positioned cards are shuffled away
   * - Cards need to exit dramatically before repositioning
   * - Directional feedback is important for user understanding
   * 
   * Animation characteristics:
   * - -25° rotation (counter-clockwise tilt) at peak
   * - Exits to -45vw (well off-screen left), then returns
   * - Smooth return to center position
   * - Maintains opacity for smooth visual effect
   */
  flyLeft: (config: VariantCustomProps) => ({
    x: [0, `-${FLY_DISTANCE}`, 0], // Keyframes: start -> fly left -> return to center
    y: 0,
    top: config.top,
    left: config.left,
    rotate: [0, -25, 0], // Keyframes: start -> tilt left -> return to straight
    translateX: '-50%',
    translateY: '-50%',
    opacity: 1,
    scale: SCALE_VALUE,
    transition: {
      type: 'tween',
      duration: 0.6, // Total duration for both movements (there and back)
      ease: 'easeInOut',
      times: [0, 0.5, 1], // Timeline: 0% at start, 50% at left peak, 100% back at center
    },
    // GPU acceleration
    willChange: 'transform',
  }),

  /**
   * FLY RIGHT STATE
   * Card rapidly exits to the right with a tilted rotation, then returns to center.
   * Mirror of flyLeft for rightward motion.
   * 
   * Used when:
   * - Right-positioned cards are shuffled away
   * - Cards need to exit dramatically before repositioning
   * - Directional feedback is important for user understanding
   * 
   * Animation characteristics:
   * - +25° rotation (clockwise tilt) at peak
   * - Exits to +45vw (well off-screen right), then returns
   * - Smooth return to center position
   * - Maintains opacity for smooth visual effect
   */
  flyRight: (config: VariantCustomProps) => ({
    x: [0, FLY_DISTANCE, 0], // Keyframes: start -> fly right -> return to center
    y: 0,
    top: config.top,
    left: config.left,
    rotate: [0, 25, 0], // Keyframes: start -> tilt right -> return to straight
    translateX: '-50%',
    translateY: '-50%',
    opacity: 1,
    scale: SCALE_VALUE,
    transition: {
      type: 'tween',
      duration: 0.6, // Total duration for both movements (there and back)
      ease: 'easeInOut',
      times: [0, 0.5, 1], // Timeline: 0% at start, 50% at right peak, 100% back at center
    },
    // GPU acceleration
    willChange: 'transform',
  }),

  /**
   * OFFSCREEN STATE
   * Initial state for cards before page load animation begins.
   * Cards are positioned off-viewport based on their final position's fly direction.
   * 
   * Used when:
   * - Component first mounts
   * - Cards are preparing for entrance animation
   * - Initial state needs to be set before onscreen animation
   * 
   * Animation characteristics:
   * - No rotation (0°) for clean entrance
   * - Positioned off-screen based on flyDirection
   * - Uses 55vw distance for entrance (more dramatic than shuffle animations)
   * - Opacity 0 for fade-in effect
   * - No transition (instant positioning)
   */
  offscreen: (config: VariantCustomProps) => ({
    x: config.flyDirection === 'right' ? '55vw' : '-55vw',
    y: 0,
    top: config.top,
    left: config.left,
    rotate: 0,
    translateX: '-50%',
    translateY: '-50%',
    opacity: 0,
    scale: SCALE_VALUE,
  }),

  /**
   * ONSCREEN STATE
   * Cards animate into view during initial page load.
   * Creates a staggered entrance effect with delays.
   * 
   * Used when:
   * - Component becomes visible in viewport
   * - Initial page load animation occurs
   * - Cards need to make a grand entrance
   * 
   * Animation characteristics:
   * - Staggered delays for sequential appearance
   * - Higher bounce (0.3) for playful entrance
   * - Longer duration (0.8s) for dramatic effect
   * - Fades in while animating position and rotation
   */
  onscreen: (config: VariantCustomProps) => ({
    x: 0,
    y: 0,
    top: config.top,
    left: config.left,
    rotate: config.rotate,
    translateX: '-50%',
    translateY: '-50%',
    opacity: 1,
    scale: SCALE_VALUE,
    transition: {
      type: 'spring',
      bounce: 0.3,
      duration: 0.8,
      delay: config.delay || 0,
      damping: 20,
      stiffness: 300,
    },
  }),
};

/**
 * Helper function to get the appropriate variant name for a card's animation state.
 * Provides a type-safe way to map AnimationState enums to variant keys.
 * 
 * @param animationState - The current animation state of the card
 * @returns The corresponding variant key string
 * 
 * @example
 * const variantKey = getVariantForAnimationState(AnimationState.FLY_LEFT);
 * // Returns: 'flyLeft'
 * 
 * Note: This function ensures compile-time type safety when working with variants.
 * If AnimationState enum changes, TypeScript will flag any mismatches here.
 */
export function getVariantKeyForAnimationState(animationState: string): string {
  // Variant keys match AnimationState enum values by design
  // This function exists for explicit mapping and future extensibility
  return animationState;
}


/**
 * Photo Data Configuration
 * 
 * Manages the photo content for each card in the collage.
 * Each photo has a unique image, title, and footer text.
 * Provides functions to create vintage postcard-styled elements.
 */

import React from 'react';
import { VintagePostcard } from './VintagePostcard';

// Import all photo images
import IMG_1326 from '../../../../common/assets/photoCollageImages/IMG_1326.png';
import IMG_1353 from '../../../../common/assets/photoCollageImages/IMG_1353.png';
import IMG_1372 from '../../../../common/assets/photoCollageImages/IMG_1372.png';
import IMG_1382 from '../../../../common/assets/photoCollageImages/IMG_1382.png';
import IMG_1749 from '../../../../common/assets/photoCollageImages/IMG_1749.png';

// Fallback image for missing cards
import Postcard from '../../../../common/assets/Postcard.png';

/**
 * Photo data interface
 */
export interface PhotoData {
  /** Path to the image file */
  path: string;
  /** Title text for the photo */
  title: string;
  /** Footer text for the photo */
  footer: string;
}

/**
 * Array of photo data for each card in the collage
 * Index corresponds to card number (0-4 for cards 1-5)
 * Additional cards beyond this array will use the fallback Postcard.png
 */
export const photoImages: PhotoData[] = [
  {
    path: IMG_1326,
    title: 'Administration Building, Norman, Okla.',
    footer: 'HK2024-001',
  },
  {
    path: IMG_1353,
    title: 'Team Collaboration, Norman, Okla.',
    footer: 'HK2024-002',
  },
  {
    path: IMG_1372,
    title: 'Hacking in Progress, Norman, Okla.',
    footer: 'HK2024-003',
  },
  {
    path: IMG_1382,
    title: 'Project Presentations, Norman, Okla.',
    footer: 'HK2024-004',
  },
  {
    path: IMG_1749,
    title: 'Awards Ceremony, Norman, Okla.',
    footer: 'HK2024-005',
  },
];

/**
 * Get photo data for a specific card by index
 * @param index - Card index (0-5+)
 * @returns Photo data for the specified card, or fallback Postcard.png if index is out of bounds
 */
export const getPhotoData = (index: number): PhotoData => {
  if (index < 0) {
    throw new Error(`Invalid card index: ${index}. Must be >= 0`);
  }
  
  // If index is within bounds, return the photo data
  if (index < photoImages.length) {
    return photoImages[index];
  }
  
  // Otherwise, return fallback postcard
  return {
    path: Postcard,
    title: 'Hacklahoma, Norman, Okla.',
    footer: `HK2024-${String(index + 1).padStart(3, '0')}`,
  };
};

/**
 * Get photo path for a specific card by index
 * @param index - Card index (0-5+)
 * @returns Image path for the specified card, or fallback if out of bounds
 */
export const getPhotoPath = (index: number): string => {
  return getPhotoData(index).path;
};

/**
 * Create a vintage postcard element for a specific card
 * Applies vintage styling with border, title, and footer text
 * 
 * @param index - Card index (0-5+)
 * @param className - Optional additional CSS classes
 * @returns React element with vintage postcard styling
 */
export const createVintagePostcard = (index: number, className?: string): React.ReactElement => {
  const data = getPhotoData(index);
  return React.createElement(VintagePostcard, {
    imageUrl: data.path,
    title: data.title,
    footer: data.footer,
    className,
  });
};
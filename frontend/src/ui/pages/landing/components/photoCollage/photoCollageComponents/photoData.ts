/**
 * Photo Data Configuration
 * 
 * Manages the photo content for each card in the collage.
 * Each photo has a unique image, title, and footer text.
 * Provides functions to create vintage postcard-styled elements.
 */

import React from 'react';
import { VintagePostcard } from './VintagePostcard';

import IMG_1249 from '../../../../../common/assets/photoCollageImages/IMG_1249.webp';
import IMG_1302 from '../../../../../common/assets/photoCollageImages/IMG_1302.webp';
import IMG_1326 from '../../../../../common/assets/photoCollageImages/IMG_1326.webp';
import IMG_1353 from '../../../../../common/assets/photoCollageImages/IMG_1353.webp';
import IMG_1372 from '../../../../../common/assets/photoCollageImages/IMG_1372.webp';
import IMG_1382 from '../../../../../common/assets/photoCollageImages/IMG_1382.webp';
import IMG_1566 from '../../../../../common/assets/photoCollageImages/IMG_1566.webp';
import IMG_1624 from '../../../../../common/assets/photoCollageImages/IMG_1624.webp';
import IMG_1709 from '../../../../../common/assets/photoCollageImages/IMG_1709.webp';
import IMG_1738 from '../../../../../common/assets/photoCollageImages/IMG_1738.webp';
import IMG_1749 from '../../../../../common/assets/photoCollageImages/IMG_1749.webp';
import IMG_1834 from '../../../../../common/assets/photoCollageImages/IMG_1834.webp';

// Fallback image for missing cards
import Postcard from '../../../../../common/assets/Postcard.png';

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

//COMMENTED OUT - Original photo data
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
  {
    path: IMG_1249,
    title: 'Hacklahoma Event, Norman, Okla.',
    footer: 'HK2024-006',
  },
  {
    path: IMG_1302,
    title: 'Hacklahoma Event, Norman, Okla.',
    footer: 'HK2024-007',
  },
  {
    path: IMG_1566,
    title: 'Hacklahoma Event, Norman, Okla.',
    footer: 'HK2024-008',
  },
  {
    path: IMG_1624,
    title: 'Hacklahoma Event, Norman, Okla.',
    footer: 'HK2024-009',
  },
  {
    path: IMG_1709,
    title: 'Hacklahoma Event, Norman, Okla.',
    footer: 'HK2024-010',
  },
  {
    path: IMG_1738,
    title: 'Hacklahoma Event, Norman, Okla.',
    footer: 'HK2024-011',
  },
  {
    path: IMG_1834,
    title: 'Hacklahoma Event, Norman, Okla.',
    footer: 'HK2024-012',
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
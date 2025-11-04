/**
 * Photo Data Configuration
 * 
 * Manages the photo content for each card in the collage.
 * Each photo has a unique image, title, and footer text.
 * Provides functions to create vintage postcard-styled elements.
 */

import React from 'react';
import { VintagePostcard } from './VintagePostcard';

// Import all photo images - TESTING (numbered images for easy tracking)
import IMG_1 from '../../../../common/assets/photoCollageImages/1.png';
import IMG_2 from '../../../../common/assets/photoCollageImages/2.png';
import IMG_3 from '../../../../common/assets/photoCollageImages/3.png';
import IMG_4 from '../../../../common/assets/photoCollageImages/4.png';
import IMG_5 from '../../../../common/assets/photoCollageImages/5.png';
import IMG_6 from '../../../../common/assets/photoCollageImages/6.png';
import IMG_7 from '../../../../common/assets/photoCollageImages/7.png';
import IMG_8 from '../../../../common/assets/photoCollageImages/8.png';
import IMG_9 from '../../../../common/assets/photoCollageImages/9.png';
import IMG_10 from '../../../../common/assets/photoCollageImages/10.png';
import IMG_11 from '../../../../common/assets/photoCollageImages/11.png';
import IMG_12 from '../../../../common/assets/photoCollageImages/12.png';
import IMG_13 from '../../../../common/assets/photoCollageImages/13.png';
import IMG_14 from '../../../../common/assets/photoCollageImages/14.png';
import IMG_15 from '../../../../common/assets/photoCollageImages/15.png';
import IMG_16 from '../../../../common/assets/photoCollageImages/16.png';

// COMMENTED OUT - Original photo images
import IMG_1249 from '../../../../common/assets/photoCollageImages/IMG_1249.png';
import IMG_1302 from '../../../../common/assets/photoCollageImages/IMG_1302.png';
import IMG_1326 from '../../../../common/assets/photoCollageImages/IMG_1326.png';
import IMG_1353 from '../../../../common/assets/photoCollageImages/IMG_1353.png';
import IMG_1372 from '../../../../common/assets/photoCollageImages/IMG_1372.png';
import IMG_1382 from '../../../../common/assets/photoCollageImages/IMG_1382.png';
import IMG_1566 from '../../../../common/assets/photoCollageImages/IMG_1566.png';
import IMG_1624 from '../../../../common/assets/photoCollageImages/IMG_1624.png';
import IMG_1709 from '../../../../common/assets/photoCollageImages/IMG_1709.png';
import IMG_1738 from '../../../../common/assets/photoCollageImages/IMG_1738.png';
import IMG_1749 from '../../../../common/assets/photoCollageImages/IMG_1749.png';
import IMG_1834 from '../../../../common/assets/photoCollageImages/IMG_1834.png';

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

// /**
//  * Array of photo data for each card in the collage
//  * Index corresponds to card number (0-15 for cards 1-16)
//  * Additional cards beyond this array will use the fallback Postcard.png
//  * 
//  * TESTING MODE: Using numbered images (1-16) for easy tracking of photo rotation
//  */
// export const photoImages: PhotoData[] = [
//   {
//     path: IMG_1,
//     title: 'Photo #1, Norman, Okla.',
//     footer: 'HK2024-001',
//   },
//   {
//     path: IMG_2,
//     title: 'Photo #2, Norman, Okla.',
//     footer: 'HK2024-002',
//   },
//   {
//     path: IMG_3,
//     title: 'Photo #3, Norman, Okla.',
//     footer: 'HK2024-003',
//   },
//   {
//     path: IMG_4,
//     title: 'Photo #4, Norman, Okla.',
//     footer: 'HK2024-004',
//   },
//   {
//     path: IMG_5,
//     title: 'Photo #5, Norman, Okla.',
//     footer: 'HK2024-005',
//   },
//   {
//     path: IMG_6,
//     title: 'Photo #6, Norman, Okla.',
//     footer: 'HK2024-006',
//   },
//   {
//     path: IMG_7,
//     title: 'Photo #7, Norman, Okla.',
//     footer: 'HK2024-007',
//   },
//   {
//     path: IMG_8,
//     title: 'Photo #8, Norman, Okla.',
//     footer: 'HK2024-008',
//   },
//   {
//     path: IMG_9,
//     title: 'Photo #9, Norman, Okla.',
//     footer: 'HK2024-009',
//   },
//   {
//     path: IMG_10,
//     title: 'Photo #10, Norman, Okla.',
//     footer: 'HK2024-010',
//   },
//   {
//     path: IMG_11,
//     title: 'Photo #11, Norman, Okla.',
//     footer: 'HK2024-011',
//   },
//   {
//     path: IMG_12,
//     title: 'Photo #12, Norman, Okla.',
//     footer: 'HK2024-012',
//   },
//   {
//     path: IMG_13,
//     title: 'Photo #13, Norman, Okla.',
//     footer: 'HK2024-013',
//   },
//   {
//     path: IMG_14,
//     title: 'Photo #14, Norman, Okla.',
//     footer: 'HK2024-014',
//   },
//   {
//     path: IMG_15,
//     title: 'Photo #15, Norman, Okla.',
//     footer: 'HK2024-015',
//   },
//   {
//     path: IMG_16,
//     title: 'Photo #16, Norman, Okla.',
//     footer: 'HK2024-016',
//   },
// ];

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
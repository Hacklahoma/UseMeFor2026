import React from 'react';
import MapOutline from '../../../common/assets/OK_Norman_706465_1936_625001.png';

/**
 * Background component for the registration page
 * Displays the map outline with overlay
 */
export const Background: React.FC = () => {
  return (
    <div className="absolute inset-0 -z-50 pointer-events-none select-none">
      <div
        className="absolute inset-0 bg-no-repeat bg-cover"
        style={{ backgroundImage: `url(${MapOutline})`, backgroundSize: 'cover' }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-[#FFFCF5]/15" aria-hidden />
    </div>
  );
};


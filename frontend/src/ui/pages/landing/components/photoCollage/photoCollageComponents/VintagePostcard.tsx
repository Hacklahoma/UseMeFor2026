/**
 * Vintage Postcard Component
 * 
 * Renders a photo with vintage postcard styling including:
 * - Teal border around the image
 * - Top title text in italic serif font
 * - Bottom footer text in monospace font
 * - Amber background for vintage aesthetic
 */

import React from 'react';

interface VintagePostcardProps {
  /** URL/path to the image */
  imageUrl: string;
  /** Title text displayed above the image */
  title: string;
  /** Footer text displayed below the image (bottom right) */
  footer: string;
  /** Optional className for additional styling */
  className?: string;
}

/**
 * Vintage Postcard Component
 * Creates a styled postcard with border and text overlays
 */
export const VintagePostcard: React.FC<VintagePostcardProps> = ({
  imageUrl,
  title,
  footer,
  className = '',
}) => {
  return (  
    <div className={`bg-[#f4ece1] px-6 shadow-2xl ${className}`}>
      {/* Top text */}
      <div className="text-right pr-6 pt-2">
        <p 
          className="text-gray-700 tracking-wide" 
          style={{ 
            fontFamily: 'American Typewriter, serif',
            fontSize: '14px',
            fontStyle: 'italic',
            letterSpacing: '0.5px'
          }}
        >
          {title}
        </p>
      </div>

      {/* Image */}
      <div className="digital-photo">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-auto block"
          style={{ aspectRatio: '8/5', objectFit: 'fill' }}
        />
      </div>

      {/* Bottom text */}
      <div className="text-right pb-[0.25rem] pr-2">
        <p 
          className="text-gray-600 text-xs tracking-widest" 
          style={{ 
            fontFamily: 'Courier New, monospace',
            fontSize: '11px'
          }}
        >
          {footer}
        </p>
      </div>
    </div>
  );
};


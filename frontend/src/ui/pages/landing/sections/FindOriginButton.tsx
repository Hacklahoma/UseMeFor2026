import React, { useState } from 'react';
import { useOriginDetection } from './OriginContext';

const FindOriginButton: React.FC = () => {
  const [showOriginDetection, setShowOriginDetection] = useState<boolean>(false);
  const [originBounds, setOriginBounds] = useState<DOMRect | null>(null);
  const { getOriginCenter, getAllOrigins } = useOriginDetection();

  const handleFindOrigin = () => {
    if (!showOriginDetection) {
      // First press: Show crosshair and capture origin bounds
      const origins = getAllOrigins();
      if (origins.length === 0) {
        alert('No origin targets found! Make sure a component is registered with useOriginTarget.');
        return;
      }
      
      // Use the first registered origin (or could add logic to select specific one)
      const targetOrigin = origins[0];
      const bounds = targetOrigin.element.getBoundingClientRect();
      setOriginBounds(bounds);
      setShowOriginDetection(true);
    } else {
      // Second press: Export origin
      const origin = getOriginCenter('final-logo');
      if (!origin) {
        alert('Origin not found! Make sure the logo component is mounted and registered.');
        return;
      }
      
      const exportData = JSON.stringify(origin, null, 2);
      
      navigator.clipboard.writeText(exportData).then(() => {
        alert(`Origin exported to clipboard!\nPosition: (${origin.x.toFixed(4)}, ${origin.y.toFixed(4)})`);
        setShowOriginDetection(false);
        setOriginBounds(null);
      }).catch(() => {
        alert('Failed to copy to clipboard. Check console for coordinates.');
        console.log('Logo Origin Coordinates:', exportData);
        setShowOriginDetection(false);
        setOriginBounds(null);
      });
    }
  };

  return (
    <>
      {/* Find Origin Button */}
      <button 
        onClick={handleFindOrigin}
        className={`px-6 py-3 font-semibold rounded-lg shadow-lg transition-colors flex items-center gap-2 ${
          showOriginDetection 
            ? 'bg-green-500 hover:bg-green-600 text-white' 
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        }`}
      >
        {showOriginDetection ? '📋 Export Origin' : '🎯 Find Origin'}
      </button>

      {/* Origin Detection Crosshair Overlay */}
      {showOriginDetection && originBounds && (
        <div className="fixed inset-0 z-[70] pointer-events-none">
          {/* Logo Border Box */}
          <div 
            className="absolute border-4 border-red-500 border-dashed bg-red-500/10"
            style={{
              left: `${originBounds.left}px`,
              top: `${originBounds.top}px`, 
              width: `${originBounds.width}px`,
              height: `${originBounds.height}px`
            }}
          >
            {/* Crosshair */}
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Horizontal line */}
              <div className="absolute w-full h-0.5 bg-red-600"></div>
              {/* Vertical line */}
              <div className="absolute h-full w-0.5 bg-red-600"></div>
              {/* Center dot */}
              <div className="absolute w-2 h-2 bg-red-600 rounded-full"></div>
            </div>
            
            {/* Label */}
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold whitespace-nowrap">
              LOGO CENTER
            </div>
          </div>
          
          {/* Instructions */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-lg text-sm font-medium">
            Click "Export Origin" to copy coordinates to clipboard
          </div>
        </div>
      )}
    </>
  );
};

export default FindOriginButton;

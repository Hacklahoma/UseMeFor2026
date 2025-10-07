import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Position,
  Waypoint,
  NormalizedWaypoint,
  sanitizeWaypoints,
  generateLinearTiming,
  generateCustomAnimationPath,
  getTrueCenter,
  exportPathToNormalized,
  importPathFromNormalized,
  validateNormalizedWaypoints
} from './beeFlight.utils';

function BeeAnimation() {
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [initialPosition, setInitialPosition] = useState<Position | null>(null);
  const [debugMode, setDebugMode] = useState<boolean>(false);
  const [customWaypoints, setCustomWaypoints] = useState<Waypoint[]>([]);
  const [normalizedWaypoints, setNormalizedWaypoints] = useState<NormalizedWaypoint[]>([]);
  const [selectedWaypoint, setSelectedWaypoint] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<'none' | 'add' | 'move' | 'remove' | 'center'>('none');
  const [useCustomPath, setUseCustomPath] = useState<boolean>(false);
  const [showImportDialog, setShowImportDialog] = useState<boolean>(false);
  const [importText, setImportText] = useState<string>('');
  const [showReplotNotification, setShowReplotNotification] = useState<boolean>(false);
  const beeRef = useRef<HTMLDivElement>(null);
  const nextIdRef = useRef<number>(0);
  const lastWindowSize = useRef<{width: number, height: number} | null>(null);

  // Capture the initial position of where the bee should be
  useEffect(() => {
    if (beeRef.current && !initialPosition) {
      const rect = beeRef.current.getBoundingClientRect();
      setInitialPosition({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
    }
  }, [initialPosition]);

  // Detect window resize and suggest replotting
  useEffect(() => {
    const handleResize = () => {
      const currentSize = {
        width: window.innerWidth,
        height: window.innerHeight
      };

      // If we have waypoints and window size changed significantly
      if (customWaypoints.length > 0 && lastWindowSize.current) {
        const widthChange = Math.abs(currentSize.width - lastWindowSize.current.width);
        const heightChange = Math.abs(currentSize.height - lastWindowSize.current.height);
        
        // Show notification if size changed by more than 50px in either dimension
        if (widthChange > 50 || heightChange > 50) {
          setShowReplotNotification(true);
        }
      }

      lastWindowSize.current = currentSize;
    };

    // Set initial size
    if (!lastWindowSize.current) {
      lastWindowSize.current = {
        width: window.innerWidth,
        height: window.innerHeight
      };
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [customWaypoints.length]);

  const startAnimation = () => {
    if (initialPosition) {
      setIsAnimating(true);
      setIsComplete(false);
    }
  };

  const resetAnimation = () => {
    setIsAnimating(false);
    setIsComplete(false);
  };

  // Calculate center of screen
  const centerX = typeof window !== 'undefined' ? window.innerWidth / 2 : 0;
  const centerY = typeof window !== 'undefined' ? window.innerHeight / 2 : 0;

  // Loop radius based on screen size
  const loopRadius = typeof window !== 'undefined' ? Math.min(window.innerWidth, window.innerHeight) * 0.15 : 100;

  // Create loop-de-loop waypoints relative to center
  const createLoopPath = () => {
    if (!initialPosition) return {};

    return {
      x: [
        initialPosition.x,           // start at logo position (invisible)
        centerX,                     // move to center
        centerX + loopRadius * 1.5,  // move right
        centerX + loopRadius * 2,    // top right of loop
        centerX + loopRadius * 1.5,  // right side going down
        centerX,                     // bottom of loop
        centerX - loopRadius * 1.5,  // left side going up  
        centerX - loopRadius * 1,    // complete loop
        centerX - loopRadius * 0.5,  // start heading back
        initialPosition.x,           // back to logo position
      ],
      y: [
        initialPosition.y,           // start at logo position (invisible)
        centerY,                     // move to center
        centerY - loopRadius * 0.5,  // move up slightly
        centerY - loopRadius * 1.5,  // top of loop
        centerY - loopRadius * 0.5,  // coming down
        centerY + loopRadius * 0.5,  // bottom of loop
        centerY - loopRadius * 0.5,  // coming up left
        centerY - loopRadius * 1.5,  // top of loop again
        centerY - loopRadius,        // heading back
        initialPosition.y,           // back to logo position
      ],
      rotate: [
        0,      // start
        0,      // center (face forward)
        -20,    // tilt right
        -90,    // top of loop (upside down)
        -160,   // coming down right
        -180,   // bottom
        -200,   // going up left
        -270,   // top again
        -320,   // heading home
        -360,   // back to start orientation
      ],
      scale: [
        1,      // start normal (invisible)
        1.5,    // big at center
        1.3,    // 
        1.2,    // smaller at top
        1.2,    //
        1.3,    // bigger at bottom
        1.2,    //
        1.1,    //
        1.0,    // back to normal
        1.0,    // final
      ],
      opacity: [
        0,      // invisible at start
        1,      // fade in at center
        1,      // visible throughout loop
        1,      //
        1,      //
        1,      //
        1,      //
        1,      //
        1,      // visible until end
        1,      // stay visible at landing
      ],
    };
  };

  const loopPath = createLoopPath();

  // Handle click on canvas to add waypoints
  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!debugMode || editMode !== 'add') return;
    
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (editMode === 'add') {
      const newWaypoint = { x, y, id: nextIdRef.current++ };
      setCustomWaypoints([...customWaypoints, newWaypoint]);
      
      // Update normalized data when manually adding waypoints
      const newNormalized = { 
        x: x / window.innerWidth, 
        y: y / window.innerHeight, 
        id: newWaypoint.id 
      };
      setNormalizedWaypoints([...normalizedWaypoints, newNormalized]);
    }
  };

  // Handle waypoint selection and dragging
  const handleWaypointMouseDown = (e: React.MouseEvent, waypointId: number) => {
    e.stopPropagation();
    
    if (editMode === 'remove') {
      setCustomWaypoints(customWaypoints.filter(w => w.id !== waypointId));
      setNormalizedWaypoints(normalizedWaypoints.filter(w => w.id !== waypointId));
      return;
    }
    
    if (editMode === 'center') {
      handleTrueCenterClick(waypointId);
      return;
    }
    
    if (editMode === 'move') {
      setSelectedWaypoint(waypointId);
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDragging || selectedWaypoint === null) return;

    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCustomWaypoints(customWaypoints.map(w => 
      w.id === selectedWaypoint ? { ...w, x, y } : w
    ));
    
    // Update normalized data when dragging waypoints
    setNormalizedWaypoints(normalizedWaypoints.map(w => 
      w.id === selectedWaypoint 
        ? { ...w, x: x / window.innerWidth, y: y / window.innerHeight } 
        : w
    ));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setSelectedWaypoint(null);
  };

  const clearWaypoints = () => {
    setCustomWaypoints([]);
    setNormalizedWaypoints([]);
    nextIdRef.current = 0;
  };


  const customPath = generateCustomAnimationPath(customWaypoints);


  // Handle waypoint click in true center mode
  const handleTrueCenterClick = (waypointId: number) => {
    const center = getTrueCenter();
    setCustomWaypoints(customWaypoints.map(w => 
      w.id === waypointId 
        ? { ...w, x: center.x, y: center.y }
        : w
    ));
    
    // Update normalized data when centering waypoints
    setNormalizedWaypoints(normalizedWaypoints.map(w => 
      w.id === waypointId 
        ? { ...w, x: 0.5, y: 0.5 } // True center is always 0.5, 0.5
        : w
    ));
  };


  // Copy normalized path to clipboard
  const handleExportPath = async () => {
    if (customWaypoints.length === 0) return;
    
    const normalized = exportPathToNormalized(customWaypoints);
    const jsonString = JSON.stringify(normalized, null, 2);
    
    try {
      await navigator.clipboard.writeText(jsonString);
      alert('Path exported to clipboard!');
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      alert('Failed to copy to clipboard. Check console for details.');
    }
  };

  // Import path from clipboard/input
  const handleImportPath = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      
      // Validate format
      if (!Array.isArray(parsed)) {
        throw new Error('Path must be an array');
      }
      
      // Validate each waypoint
      if (!validateNormalizedWaypoints(parsed)) {
        throw new Error('Invalid waypoint format. Each waypoint must have x, y (0-1), and id properties.');
      }
      
      const imported = importPathFromNormalized(parsed);
      setCustomWaypoints(imported);
      
      // Store the original normalized data for accurate replotting
      setNormalizedWaypoints(parsed);
      
      // Update next ID to avoid conflicts
      const maxId = Math.max(...imported.map(w => w.id), -1);
      nextIdRef.current = maxId + 1;
      
      alert(`Successfully imported ${imported.length} waypoints!`);
    } catch (err) {
      console.error('Import error:', err);
      alert(`Import failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // Replot waypoints after window resize
  const handleReplotWaypoints = () => {
    if (customWaypoints.length === 0) return;
    
    // Use stored normalized data if available (from imports), otherwise convert current waypoints
    const normalizedToUse = normalizedWaypoints.length > 0 
      ? normalizedWaypoints 
      : exportPathToNormalized(customWaypoints);
    
    const reploted = importPathFromNormalized(normalizedToUse);
    setCustomWaypoints(reploted);
    
    // Also recalculate the initial position (bee start/end point)
    if (beeRef.current) {
      const rect = beeRef.current.getBoundingClientRect();
      setInitialPosition({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
    }
    
    const dataSource = normalizedWaypoints.length > 0 ? "original imported" : "current";
    alert(`Replotted ${reploted.length} waypoints and bee position using ${dataSource} data!`);
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-sky-100 to-blue-200 overflow-hidden">
      {/* Replot Notification */}
      {showReplotNotification && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-yellow-900 px-6 py-3 rounded-lg shadow-lg z-[70] flex items-center gap-3">
          <span className="font-medium">🔄 Window size changed! Waypoints may be misaligned.</span>
          <button
            onClick={() => {
              handleReplotWaypoints();
              setShowReplotNotification(false);
            }}
            className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded font-medium text-sm transition-colors"
          >
            Replot Now
          </button>
          <button
            onClick={() => setShowReplotNotification(false)}
            className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded font-medium text-sm transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}
      {/* Debug Grid Overlay */}
      {debugMode && (
        <svg 
          className="absolute inset-0 w-full h-full z-50"
          style={{ cursor: editMode === 'add' ? 'crosshair' : editMode === 'remove' ? 'not-allowed' : editMode === 'move' ? 'default' : editMode === 'center' ? 'crosshair' : 'default' }}
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Fine grid - 12.5px spacing */}
          <defs>
            <pattern id="grid" width="12.5" height="12.5" patternUnits="userSpaceOnUse">
              <path d="M 12.5 0 L 0 0 0 12.5" fill="none" stroke="rgba(156, 163, 175, 0.3)" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" className="pointer-events-none" />
          
          {/* True Center Crosshair */}
          {editMode === 'center' && (
            <g className="pointer-events-none">
              <circle
                cx={getTrueCenter().x}
                cy={getTrueCenter().y}
                r="12"
                fill="none"
                stroke="rgb(234, 179, 8)"
                strokeWidth="3"
                strokeDasharray="6,3"
              />
              <line
                x1={getTrueCenter().x - 20}
                y1={getTrueCenter().y}
                x2={getTrueCenter().x + 20}
                y2={getTrueCenter().y}
                stroke="rgb(234, 179, 8)"
                strokeWidth="2"
              />
              <line
                x1={getTrueCenter().x}
                y1={getTrueCenter().y - 20}
                x2={getTrueCenter().x}
                y2={getTrueCenter().y + 20}
                stroke="rgb(234, 179, 8)"
                strokeWidth="2"
              />
            </g>
          )}
          
          {/* Original flight path (dimmed when in debug) */}
          {initialPosition && loopPath.x && loopPath.y && (
            <>
              {/* Path line */}
              <polyline
                points={loopPath.x.map((x, i) => `${x},${loopPath.y[i]}`).join(' ')}
                fill="none"
                stroke="rgba(59, 130, 246, 0.3)"
                strokeWidth="2"
                strokeDasharray="5,5"
                className="pointer-events-none"
              />
              
              {/* Waypoint markers */}
              {loopPath.x.map((x, i) => (
                <g key={`original-${i}`} className="pointer-events-none">
                  <circle
                    cx={x}
                    cy={loopPath.y[i]}
                    r="4"
                    fill="rgba(59, 130, 246, 0.4)"
                    stroke="white"
                    strokeWidth="1"
                  />
                  <text
                    x={x}
                    y={loopPath.y[i] - 10}
                    textAnchor="middle"
                    fill="rgba(30, 64, 175, 0.6)"
                    fontSize="10"
                    fontWeight="bold"
                  >
                    {i}
                  </text>
                </g>
              ))}
            </>
          )}

          {/* Custom waypoints */}
          {customWaypoints.length > 1 && (
            <polyline
              points={customWaypoints.map(w => `${w.x},${w.y}`).join(' ')}
              fill="none"
              stroke="rgb(16, 185, 129)"
              strokeWidth="3"
              strokeDasharray="8,4"
              className="pointer-events-none"
            />
          )}

          {customWaypoints.map((waypoint, index) => (
            <g 
              key={waypoint.id}
              style={{ cursor: editMode === 'move' ? 'move' : editMode === 'remove' ? 'pointer' : editMode === 'center' ? 'crosshair' : 'default' }}
              onMouseDown={(e) => handleWaypointMouseDown(e, waypoint.id)}
            >
              <circle
                cx={waypoint.x}
                cy={waypoint.y}
                r="8"
                fill={editMode === 'remove' ? 'rgb(239, 68, 68)' : 'rgb(16, 185, 129)'}
                stroke="white"
                strokeWidth="2"
                className="transition-colors"
              />
              <text
                x={waypoint.x}
                y={waypoint.y - 14}
                textAnchor="middle"
                fill={editMode === 'remove' ? 'rgb(220, 38, 38)' : 'rgb(5, 150, 105)'}
                fontSize="14"
                fontWeight="bold"
                className="pointer-events-none"
              >
                {index}
              </text>
            </g>
          ))}
        </svg>
      )}

      {/* Debug Controls */}
      {debugMode && (
        <div className="absolute top-24 right-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl p-5 z-50 w-72">
          <h3 className="font-bold text-gray-800 mb-3 text-lg">Path Editor</h3>
          
          {/* Mode Selection */}
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2 uppercase font-semibold">Edit Mode</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setEditMode('none')}
                className={`px-3 py-2 rounded font-medium text-sm transition-all ${
                  editMode === 'none' 
                    ? 'bg-gray-600 text-white shadow-md' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                👁️ View
              </button>
              <button
                onClick={() => setEditMode('add')}
                className={`px-3 py-2 rounded font-medium text-sm transition-all ${
                  editMode === 'add' 
                    ? 'bg-green-500 text-white shadow-md' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                ➕ Add
              </button>
              <button
                onClick={() => setEditMode('move')}
                className={`px-3 py-2 rounded font-medium text-sm transition-all ${
                  editMode === 'move' 
                    ? 'bg-blue-500 text-white shadow-md' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                ✋ Move
              </button>
              <button
                onClick={() => setEditMode('remove')}
                className={`px-3 py-2 rounded font-medium text-sm transition-all ${
                  editMode === 'remove' 
                    ? 'bg-red-500 text-white shadow-md' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                🗑️ Remove
              </button>
              <button
                onClick={() => setEditMode('center')}
                className={`px-3 py-2 rounded font-medium text-sm transition-all ${
                  editMode === 'center' 
                    ? 'bg-yellow-500 text-white shadow-md' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                🎯 Center
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
            <p className="text-xs text-blue-800 leading-relaxed">
              {editMode === 'none' && '💡 Viewing mode - no edits will be made'}
              {editMode === 'add' && '💡 Click anywhere to add waypoints'}
              {editMode === 'move' && '💡 Click and drag waypoints to reposition'}
              {editMode === 'remove' && '💡 Click waypoints to delete them'}
              {editMode === 'center' && '💡 Click waypoints to move them to true center'}
            </p>
          </div>

          {/* Stats */}
          <div className="mb-4 p-3 bg-gray-50 rounded">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Waypoints:</span>
              <span className="font-bold text-gray-800">{customWaypoints.length}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <button
              onClick={() => setUseCustomPath(!useCustomPath)}
              disabled={customWaypoints.length < 2}
              className="w-full px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded transition-colors text-sm"
            >
              {useCustomPath ? 'Use Original Path' : 'Use Custom Path'}
            </button>
            <button
              onClick={handleExportPath}
              disabled={customWaypoints.length === 0}
              className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded transition-colors text-sm"
            >
              📋 Export Path
            </button>
            <button
              onClick={() => setShowImportDialog(true)}
              className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded transition-colors text-sm"
            >
              📥 Import Path
            </button>
            <button
              onClick={handleReplotWaypoints}
              disabled={customWaypoints.length === 0}
              className="w-full px-4 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded transition-colors text-sm"
            >
              🔄 Replot Points
            </button>
            <button
              onClick={clearWaypoints}
              disabled={customWaypoints.length === 0}
              className="w-full px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded transition-colors text-sm"
            >
              Clear All Waypoints
            </button>
            <button
              onClick={() => setDebugMode(false)}
              className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded transition-colors text-sm"
            >
              Exit Debug Mode
            </button>
          </div>
        </div>
      )}

      {/* Import Dialog */}
      {showImportDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
          <div className="bg-white rounded-lg shadow-2xl p-6 w-96 max-w-[90vw]">
            <h3 className="font-bold text-gray-800 mb-4 text-lg">Import Path</h3>
            <p className="text-sm text-gray-600 mb-4">
              Paste normalized path JSON (0-1 scale coordinates):
            </p>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder='[{"x": 0.5, "y": 0.3, "id": 0}, {"x": 0.7, "y": 0.6, "id": 1}]'
              className="w-full h-32 p-3 border border-gray-300 rounded text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  if (importText.trim()) {
                    handleImportPath(importText);
                    setImportText('');
                    setShowImportDialog(false);
                  }
                }}
                disabled={!importText.trim()}
                className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded transition-colors"
              >
                Import
              </button>
              <button
                onClick={() => {
                  setImportText('');
                  setShowImportDialog(false);
                }}
                className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-sm shadow-md z-10 flex items-center px-10">
        {/* Static bee position reference (invisible) */}
        <div ref={beeRef} className="w-12 h-12 flex items-center justify-center">
          {!isAnimating && !isComplete && (
            <div className="w-12 h-12 border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-xs text-gray-400">
              Logo
            </div>
          )}
        </div>
        <span className="ml-4 text-gray-600 font-medium">Your Company</span>
      </div>

      {/* Animated Bee - only render during animation */}
      {initialPosition && !isComplete && isAnimating && (
        <motion.div
          className="fixed top-0 left-0 z-[9999]"
          style={{ 
            x: initialPosition.x,
            y: initialPosition.y,
            translateX: '-50%',
            translateY: '-50%',
          }}
          animate={isAnimating ? (useCustomPath && customPath ? customPath : loopPath) : {}}
          transition={{
            duration: 5,
            ease: [0.43, 0.13, 0.23, 0.96],
            times: useCustomPath && customPath 
              ? generateLinearTiming(customPath.x.length)
              : [0, 0.08, 0.16, 0.24, 0.32, 0.4, 0.48, 0.56, 0.68, 0.8],
          }}
          onAnimationComplete={() => {
            if (isAnimating) {
              // Wait 1 second before completing
              setTimeout(() => {
                setIsComplete(true);
              }, 1000);
            }
          }}
        >
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="drop-shadow-lg">
            <ellipse cx="24" cy="24" rx="12" ry="16" fill="#FFD700" />
            <rect x="16" y="16" width="16" height="3" fill="#000" rx="1.5" />
            <rect x="16" y="24" width="16" height="3" fill="#000" rx="1.5" />
            <rect x="16" y="32" width="16" height="3" fill="#000" rx="1.5" />
            <ellipse cx="16" cy="18" rx="8" ry="10" fill="#E0F2FE" opacity="0.7" transform="rotate(-20 16 18)" />
            <ellipse cx="32" cy="18" rx="8" ry="10" fill="#E0F2FE" opacity="0.7" transform="rotate(20 32 18)" />
            <circle cx="20" cy="14" r="2" fill="#000" />
            <circle cx="28" cy="14" r="2" fill="#000" />
            <path d="M 24 38 L 24 42 L 22 44 L 24 42 L 26 44 L 24 42 Z" fill="#333" />
          </svg>
        </motion.div>
      )}

      {/* Final static bee in header - appears during the wait */}
      {isAnimating && (
        <motion.div
          className="absolute top-4 left-10 z-19"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 4, duration: 0.3 }}
        >
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="drop-shadow-lg">
            <ellipse cx="24" cy="24" rx="12" ry="16" fill="#FFD700" />
            <rect x="16" y="16" width="16" height="3" fill="#000" rx="1.5" />
            <rect x="16" y="24" width="16" height="3" fill="#000" rx="1.5" />
            <rect x="16" y="32" width="16" height="3" fill="#000" rx="1.5" />
            <ellipse cx="16" cy="18" rx="8" ry="10" fill="#E0F2FE" opacity="0.7" transform="rotate(-20 16 18)" />
            <ellipse cx="32" cy="18" rx="8" ry="10" fill="#E0F2FE" opacity="0.7" transform="rotate(20 32 18)" />
            <circle cx="20" cy="14" r="2" fill="#000" />
            <circle cx="28" cy="14" r="2" fill="#000" />
            <path d="M 24 38 L 24 42 L 22 44 L 24 42 L 26 44 L 24 42 Z" fill="#333" />
          </svg>
        </motion.div>
      )}
      
      {/* Keep showing static bee after complete */}
      {isComplete && (
        <div className="absolute top-4 left-10 z-19">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="drop-shadow-lg">
            <ellipse cx="24" cy="24" rx="12" ry="16" fill="#FFD700" />
            <rect x="16" y="16" width="16" height="3" fill="#000" rx="1.5" />
            <rect x="16" y="24" width="16" height="3" fill="#000" rx="1.5" />
            <rect x="16" y="32" width="16" height="3" fill="#000" rx="1.5" />
            <ellipse cx="16" cy="18" rx="8" ry="10" fill="#E0F2FE" opacity="0.7" transform="rotate(-20 16 18)" />
            <ellipse cx="32" cy="18" rx="8" ry="10" fill="#E0F2FE" opacity="0.7" transform="rotate(20 32 18)" />
            <circle cx="20" cy="14" r="2" fill="#000" />
            <circle cx="28" cy="14" r="2" fill="#000" />
            <path d="M 24 38 L 24 42 L 22 44 L 24 42 L 26 44 L 24 42 Z" fill="#333" />
          </svg>
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4 z-[60]">
        <button
          onClick={startAnimation}
          disabled={isAnimating || isComplete || !initialPosition}
          className="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-300 disabled:cursor-not-allowed text-gray-900 font-semibold rounded-lg shadow-lg transition-colors"
        >
          {isComplete ? 'Animation Complete' : isAnimating ? 'Flying...' : !initialPosition ? 'Loading...' : 'Start Animation'}
        </button>
        {(isAnimating || isComplete) && (
          <button
            onClick={resetAnimation}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg shadow-lg transition-colors"
          >
            Reset
          </button>
        )}
        {!debugMode && !isAnimating && (
          <button
            onClick={() => setDebugMode(true)}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow-lg transition-colors"
          >
            🐛 Debug Mode
          </button>
        )}
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">Welcome to BeeMotion</h1>
          <p className="text-xl text-gray-600">Watch our bee take flight! 🐝</p>
        </div>
      </div>
    </div>
  );
}

export default BeeAnimation;
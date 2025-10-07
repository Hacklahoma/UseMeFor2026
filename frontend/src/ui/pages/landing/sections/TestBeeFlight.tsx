import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Position,
  Waypoint,
  NormalizedWaypoint,
  CurveSegment,
  SmoothedPath,
  sanitizeWaypoints,
  generateLinearTiming,
  generateCustomAnimationPath,
  getTrueCenter,
  exportPathToNormalized,
  importPathFromNormalized,
  validateNormalizedWaypoints,
  replaceStartEndPosition,
  replaceStartEndNormalized,
  generateSmoothedPath,
  generateSmoothedPathWithCustomControls,
  generateBezierPoints,
  calculateDirectionArrows,
  calculateLinearDirectionArrows,
  DirectionArrow,
  exportCompletePathData,
  importControlPointsFromNormalized,
  validateCompleteExportData
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
  const [editMode, setEditMode] = useState<'none' | 'add' | 'move' | 'remove' | 'center' | 'setOrigin'>('none');
  const [useCustomPath, setUseCustomPath] = useState<boolean>(false);
  const [showImportDialog, setShowImportDialog] = useState<boolean>(false);
  const [importText, setImportText] = useState<string>('');
  const [showOriginDialog, setShowOriginDialog] = useState<boolean>(false);
  const [originImportText, setOriginImportText] = useState<string>('');
  const [showReplotNotification, setShowReplotNotification] = useState<boolean>(false);
  const [customOrigin, setCustomOrigin] = useState<Position | null>(null);
  const [useSmoothPath, setUseSmoothPath] = useState<boolean>(false);
  const [showDirectionArrows, setShowDirectionArrows] = useState<boolean>(false);
  const [customControlPoints, setCustomControlPoints] = useState<Map<string, {cp1: Position, cp2: Position}>>(new Map());
  const [normalizedControlPoints, setNormalizedControlPoints] = useState<Map<string, {cp1: Position, cp2: Position}>>(new Map());
  const [selectedSegment, setSelectedSegment] = useState<number | null>(null);
  const [isDraggingControl, setIsDraggingControl] = useState<{segmentIndex: number, controlPoint: 'cp1' | 'cp2'} | null>(null);
  const [isNearOrigin, setIsNearOrigin] = useState<boolean>(false);
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
        centerX,                     // start at center (visible immediately)
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
        centerY,                     // start at center (visible immediately)
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
        0,      // start at center (face forward)
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
        1.5,    // start big at center
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
        1,      // visible immediately at center
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

  // Handle click on canvas to add waypoints or set origin
  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!debugMode || (editMode !== 'add' && editMode !== 'setOrigin')) return;
    
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

    if (editMode === 'setOrigin') {
      setCustomOrigin({ x, y });
      // Origin is set but waypoints remain independent
      // User can manually connect waypoints to origin if desired
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
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Handle waypoint dragging with origin snapping
    if (isDragging && selectedWaypoint !== null) {
      // Check if we're near origin for visual feedback
      const nearOrigin = isWithinOriginSnapRange(x, y);
      setIsNearOrigin(nearOrigin);
      
      // Apply origin snapping if close to origin
      const snappedPosition = snapToOriginIfClose(x, y);
      
      setCustomWaypoints(customWaypoints.map(w => 
        w.id === selectedWaypoint ? { ...w, x: snappedPosition.x, y: snappedPosition.y } : w
      ));
      
      // Update normalized data when dragging waypoints
      setNormalizedWaypoints(normalizedWaypoints.map(w => 
        w.id === selectedWaypoint 
          ? { ...w, x: snappedPosition.x / window.innerWidth, y: snappedPosition.y / window.innerHeight } 
          : w
      ));
    }

    // Handle control point dragging
    if (isDraggingControl) {
      const { segmentIndex, controlPoint } = isDraggingControl;
      const waypoints = getEffectiveWaypoints();
      
      if (segmentIndex < waypoints.length - 1) {
        const segment = waypoints[segmentIndex];
        const nextSegment = waypoints[segmentIndex + 1];
        const segmentKey = `${segment.id}-${nextSegment.id}`;
        
        const currentControls = customControlPoints.get(segmentKey) || {
          cp1: { x: segment.x + (nextSegment.x - segment.x) * 0.33, y: segment.y + (nextSegment.y - segment.y) * 0.33 },
          cp2: { x: nextSegment.x - (nextSegment.x - segment.x) * 0.33, y: nextSegment.y - (nextSegment.y - segment.y) * 0.33 }
        };

        const updatedControls = {
          ...currentControls,
          [controlPoint]: { x, y }
        };

        // Update absolute control points
        setCustomControlPoints(new Map(customControlPoints.set(segmentKey, updatedControls)));
        
        // Update normalized control points for replotting
        const normalizedControls = {
          ...currentControls,
          [controlPoint]: { 
            x: x / window.innerWidth, 
            y: y / window.innerHeight 
          }
        };
        setNormalizedControlPoints(new Map(normalizedControlPoints.set(segmentKey, normalizedControls)));
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setSelectedWaypoint(null);
    setIsDraggingControl(null);
    setIsNearOrigin(false);
  };

  // Handle control point mouse down
  const handleControlPointMouseDown = (e: React.MouseEvent, segmentIndex: number, controlPoint: 'cp1' | 'cp2') => {
    e.stopPropagation();
    setIsDraggingControl({ segmentIndex, controlPoint });
  };

  const clearWaypoints = () => {
    setCustomWaypoints([]);
    setNormalizedWaypoints([]);
    setCustomControlPoints(new Map());
    setNormalizedControlPoints(new Map());
    setCustomOrigin(null);
    nextIdRef.current = 0;
  };

  // Handle origin placement via click
  const handleOriginClickPlacement = () => {
    setShowOriginDialog(false);
    setEditMode('setOrigin');
  };

  // Check if a point is within origin snap range
  const isWithinOriginSnapRange = (x: number, y: number): boolean => {
    if (!customOrigin) return false;
    
    const distance = Math.sqrt(
      Math.pow(x - customOrigin.x, 2) + Math.pow(y - customOrigin.y, 2)
    );
    
    // Snap range is the outer circle radius (15px)
    return distance <= 15;
  };

  // Snap point to origin if within range
  const snapToOriginIfClose = (x: number, y: number): {x: number, y: number} => {
    if (isWithinOriginSnapRange(x, y)) {
      return { x: customOrigin!.x, y: customOrigin!.y };
    }
    return { x, y };
  };

  // Handle origin import from coordinates
  const handleOriginImport = () => {
    try {
      const parsed = JSON.parse(originImportText);
      
      // Validate format - expect {x: number, y: number} in 0-1 scale
      if (!parsed || typeof parsed !== 'object' || 
          typeof parsed.x !== 'number' || typeof parsed.y !== 'number' ||
          parsed.x < 0 || parsed.x > 1 || parsed.y < 0 || parsed.y > 1) {
        throw new Error('Invalid format. Expected {x: 0.5, y: 0.5} with values between 0-1');
      }
      
      // Convert normalized coordinates to absolute pixels
      const absoluteOrigin = {
        x: parsed.x * window.innerWidth,
        y: parsed.y * window.innerHeight
      };
      
      // Origin is imported but waypoints remain independent
      // User can manually connect waypoints to origin using snapping if desired
      
      setCustomOrigin(absoluteOrigin);
      setShowOriginDialog(false);
      setOriginImportText('');
      
      alert(`Origin imported and applied! Position: (${parsed.x.toFixed(3)}, ${parsed.y.toFixed(3)})`);
      
    } catch (err) {
      console.error('Origin import error:', err);
      alert(`Import failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };


  // Generate custom path - waypoints are independent, no auto-origin connection
  const getEffectiveWaypoints = () => {
    // Return waypoints as-is, no automatic origin connection
    return customWaypoints;
  };

  // Get waypoints with custom origin applied (only when explicitly needed)
  const getWaypointsWithOrigin = () => {
    if (customWaypoints.length < 2) return customWaypoints;
    
    if (customOrigin) {
      return replaceStartEndPosition(customWaypoints, customOrigin);
    }
    
    return customWaypoints;
  };

  // Generate smooth or linear path based on toggle (waypoints are independent)
  const generateEffectivePath = () => {
    const waypoints = getEffectiveWaypoints();
    
    if (useSmoothPath && waypoints.length >= 2) {
      const smoothedPath = generateSmoothedPathWithCustomControls(waypoints, customControlPoints, 15);
      return {
        x: smoothedPath.interpolatedPoints.map(p => p.x),
        y: smoothedPath.interpolatedPoints.map(p => p.y),
        rotate: new Array(smoothedPath.interpolatedPoints.length).fill(0),
        scale: new Array(smoothedPath.interpolatedPoints.length).fill(1),
        opacity: new Array(smoothedPath.interpolatedPoints.length).fill(1),
      };
    }
    
    return generateCustomAnimationPath(waypoints);
  };
  
  const customPath = generateEffectivePath();


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


  // Copy complete path data to clipboard (waypoints + control points + settings)
  const handleExportPath = async () => {
    if (customWaypoints.length === 0) return;
    
    const completeExportData = exportCompletePathData(
      customWaypoints,
      customControlPoints,
      customOrigin,
      useSmoothPath
    );
    const jsonString = JSON.stringify(completeExportData, null, 2);
    
    try {
      await navigator.clipboard.writeText(jsonString);
      alert(`Complete path exported! (${customWaypoints.length} waypoints, ${customControlPoints.size} control points)`);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      alert('Failed to copy to clipboard. Check console for details.');
    }
  };

  // Import complete path data (waypoints + control points + settings)
  const handleImportPath = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      
      // Check if this is complete export data or legacy waypoint-only data
      if (validateCompleteExportData(parsed)) {
        // New complete format
        const imported = importPathFromNormalized(parsed.waypoints);
        setCustomWaypoints(imported);
        setNormalizedWaypoints(parsed.waypoints);
        
        // Import control points
        const importedControlPoints = importControlPointsFromNormalized(parsed.controlPoints);
        setCustomControlPoints(importedControlPoints);
        
        // Convert normalized control points to Map for storage
        const normalizedControlMap = new Map<string, {cp1: Position, cp2: Position}>();
        for (const [key, pair] of Object.entries(parsed.controlPoints)) {
          if (pair && typeof pair === 'object' && 'cp1' in pair && 'cp2' in pair) {
            normalizedControlMap.set(key, pair as {cp1: Position, cp2: Position});
          }
        }
        setNormalizedControlPoints(normalizedControlMap);
        
        // Import settings
        setUseSmoothPath(parsed.useSmoothPath);
        
        // Import custom origin if present
        if (parsed.customOrigin) {
          setCustomOrigin({
            x: parsed.customOrigin.x * window.innerWidth,
            y: parsed.customOrigin.y * window.innerHeight
          });
        } else {
          setCustomOrigin(null);
        }
        
        // Update next ID to avoid conflicts
        const maxId = Math.max(...imported.map(w => w.id), -1);
        nextIdRef.current = maxId + 1;
        
        alert(`Complete path imported! ${imported.length} waypoints, ${Object.keys(parsed.controlPoints).length} control points, curves: ${parsed.useSmoothPath ? 'ON' : 'OFF'}`);
        
      } else if (Array.isArray(parsed) && validateNormalizedWaypoints(parsed)) {
        // Legacy waypoint-only format
        const imported = importPathFromNormalized(parsed);
        setCustomWaypoints(imported);
        setNormalizedWaypoints(parsed);
        
        // Clear control points for legacy imports
        setCustomControlPoints(new Map());
        setNormalizedControlPoints(new Map());
        setCustomOrigin(null);
        
        // Update next ID to avoid conflicts
        const maxId = Math.max(...imported.map(w => w.id), -1);
        nextIdRef.current = maxId + 1;
        
        alert(`Legacy path imported! ${imported.length} waypoints (control points cleared)`);
        
      } else {
        // Try relaxed import - accept any object with waypoints array
        if (parsed && typeof parsed === 'object' && Array.isArray(parsed.waypoints)) {
          try {
            const imported = importPathFromNormalized(parsed.waypoints);
            setCustomWaypoints(imported);
            setNormalizedWaypoints(parsed.waypoints);
            
            // Try to import control points if they exist
            if (parsed.controlPoints && typeof parsed.controlPoints === 'object') {
              try {
                const importedControlPoints = importControlPointsFromNormalized(parsed.controlPoints);
                setCustomControlPoints(importedControlPoints);
                
                const normalizedControlMap = new Map<string, {cp1: Position, cp2: Position}>();
                for (const [key, pair] of Object.entries(parsed.controlPoints)) {
                  if (pair && typeof pair === 'object' && 'cp1' in pair && 'cp2' in pair) {
                    normalizedControlMap.set(key, pair as {cp1: Position, cp2: Position});
                  }
                }
                setNormalizedControlPoints(normalizedControlMap);
              } catch {
                // If control points fail, just clear them
                setCustomControlPoints(new Map());
                setNormalizedControlPoints(new Map());
              }
            } else {
              setCustomControlPoints(new Map());
              setNormalizedControlPoints(new Map());
            }
            
            // Try to import settings
            if (typeof parsed.useSmoothPath === 'boolean') {
              setUseSmoothPath(parsed.useSmoothPath);
            }
            
            // Try to import custom origin
            if (parsed.customOrigin && typeof parsed.customOrigin === 'object') {
              setCustomOrigin({
                x: parsed.customOrigin.x * window.innerWidth,
                y: parsed.customOrigin.y * window.innerHeight
              });
            } else {
              setCustomOrigin(null);
            }
            
            // Update next ID to avoid conflicts
            const maxId = Math.max(...imported.map(w => w.id), -1);
            nextIdRef.current = maxId + 1;
            
            alert(`Relaxed import successful! ${imported.length} waypoints imported (some data may have been skipped if invalid)`);
            
          } catch (relaxedError) {
            throw new Error('Could not parse waypoints data. Check format and try again.');
          }
        } else {
          throw new Error('Invalid format. Expected object with waypoints array or legacy waypoint array.');
        }
      }
      
    } catch (err) {
      console.error('Import error:', err);
      alert(`Import failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // Replot waypoints and control points after window resize
  const handleReplotWaypoints = () => {
    if (customWaypoints.length === 0) return;
    
    // Use stored normalized data if available (from imports), otherwise convert current waypoints
    const normalizedToUse = normalizedWaypoints.length > 0 
      ? normalizedWaypoints 
      : exportPathToNormalized(customWaypoints);
    
    const reploted = importPathFromNormalized(normalizedToUse);
    setCustomWaypoints(reploted);
    
    // Replot control points from normalized data
    if (normalizedControlPoints.size > 0) {
      const replotedControlPoints = new Map<string, {cp1: Position, cp2: Position}>();
      for (const [key, normalizedPair] of normalizedControlPoints) {
        replotedControlPoints.set(key, {
          cp1: {
            x: normalizedPair.cp1.x * window.innerWidth,
            y: normalizedPair.cp1.y * window.innerHeight
          },
          cp2: {
            x: normalizedPair.cp2.x * window.innerWidth,
            y: normalizedPair.cp2.y * window.innerHeight
          }
        });
      }
      setCustomControlPoints(replotedControlPoints);
    }
    
    // Replot custom origin if it exists
    if (customOrigin) {
      // Convert current origin to normalized, then back to new screen size
      const normalizedOrigin = {
        x: customOrigin.x / window.innerWidth,
        y: customOrigin.y / window.innerHeight
      };
      setCustomOrigin({
        x: normalizedOrigin.x * window.innerWidth,
        y: normalizedOrigin.y * window.innerHeight
      });
    }
    
    // Also recalculate the initial position (bee start/end point)
    if (beeRef.current) {
      const rect = beeRef.current.getBoundingClientRect();
      setInitialPosition({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
    }
    
    const dataSource = normalizedWaypoints.length > 0 ? "original imported" : "current";
    const controlPointCount = normalizedControlPoints.size;
    alert(`Replotted ${reploted.length} waypoints, ${controlPointCount} control points, and bee position using ${dataSource} data!`);
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
          style={{ cursor: editMode === 'add' ? 'crosshair' : editMode === 'remove' ? 'not-allowed' : editMode === 'move' ? 'default' : editMode === 'center' ? 'crosshair' : editMode === 'setOrigin' ? 'crosshair' : 'default' }}
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

          {/* Custom Origin Indicator */}
          {customOrigin && (
            <g className="pointer-events-none">
              {/* Snap zone indicator - shows when dragging near origin */}
              {isNearOrigin && (
                <circle
                  cx={customOrigin.x}
                  cy={customOrigin.y}
                  r="15"
                  fill="rgba(34, 197, 94, 0.3)"
                  stroke="rgb(34, 197, 94)"
                  strokeWidth="2"
                  strokeDasharray="4,4"
                  className="animate-pulse"
                />
              )}
              
              {/* Outer circle */}
              <circle
                cx={customOrigin.x}
                cy={customOrigin.y}
                r="16"
                fill="rgba(236, 72, 153, 0.2)"
                stroke={isNearOrigin ? "rgb(34, 197, 94)" : "rgb(236, 72, 153)"}
                strokeWidth="3"
              />
              
              {/* Inner circle */}
              <circle
                cx={customOrigin.x}
                cy={customOrigin.y}
                r="6"
                fill={isNearOrigin ? "rgb(34, 197, 94)" : "rgb(236, 72, 153)"}
              />
              
              {/* Label */}
              <text
                x={customOrigin.x}
                y={customOrigin.y - 25}
                textAnchor="middle"
                fill={isNearOrigin ? "rgb(21, 128, 61)" : "rgb(190, 24, 93)"}
                fontSize="12"
                fontWeight="bold"
                className="pointer-events-none"
              >
                {isNearOrigin ? "🎯 SNAP!" : "📍 ORIGIN"}
              </text>
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

          {/* Custom waypoints path */}
          {customWaypoints.length > 1 && (
            <>
              {useSmoothPath ? (
                // Render smooth curves
                (() => {
                  const waypoints = getEffectiveWaypoints();
                  const smoothedPath = generateSmoothedPathWithCustomControls(waypoints, customControlPoints, 10);
                  return (
                    <path
                      d={`M ${smoothedPath.interpolatedPoints.map((p, i) => 
                        i === 0 ? `${p.x} ${p.y}` : `L ${p.x} ${p.y}`
                      ).join(' ')}`}
                      fill="none"
                      stroke="rgb(16, 185, 129)"
                      strokeWidth="3"
                      strokeDasharray="8,4"
                      className="pointer-events-none"
                    />
                  );
                })()
              ) : (
                // Render straight lines
                <polyline
                  points={getEffectiveWaypoints().map(w => `${w.x},${w.y}`).join(' ')}
                  fill="none"
                  stroke="rgb(16, 185, 129)"
                  strokeWidth="3"
                  strokeDasharray="8,4"
                  className="pointer-events-none"
                />
              )}
            </>
          )}

          {/* Control points visualization (interactive gray dots) */}
          {useSmoothPath && customWaypoints.length > 1 && (
            (() => {
              const waypoints = getEffectiveWaypoints();
              const smoothedPath = generateSmoothedPathWithCustomControls(waypoints, customControlPoints, 10);
              return smoothedPath.segments.map((segment, segmentIndex) => (
                <g key={`control-${segmentIndex}`}>
                  {/* Control point 1 */}
                  <circle
                    cx={segment.controlPoint1.x}
                    cy={segment.controlPoint1.y}
                    r="6"
                    fill="rgba(156, 163, 175, 0.9)"
                    stroke="white"
                    strokeWidth="2"
                    style={{ cursor: 'move' }}
                    onMouseDown={(e) => handleControlPointMouseDown(e, segmentIndex, 'cp1')}
                    className="transition-all hover:fill-gray-500"
                  />
                  {/* Control point 2 */}
                  <circle
                    cx={segment.controlPoint2.x}
                    cy={segment.controlPoint2.y}
                    r="6"
                    fill="rgba(156, 163, 175, 0.9)"
                    stroke="white"
                    strokeWidth="2"
                    style={{ cursor: 'move' }}
                    onMouseDown={(e) => handleControlPointMouseDown(e, segmentIndex, 'cp2')}
                    className="transition-all hover:fill-gray-500"
                  />
                  {/* Control lines */}
                  <line
                    x1={segment.start.x}
                    y1={segment.start.y}
                    x2={segment.controlPoint1.x}
                    y2={segment.controlPoint1.y}
                    stroke="rgba(156, 163, 175, 0.6)"
                    strokeWidth="1"
                    strokeDasharray="3,3"
                    className="pointer-events-none"
                  />
                  <line
                    x1={segment.end.x}
                    y1={segment.end.y}
                    x2={segment.controlPoint2.x}
                    y2={segment.controlPoint2.y}
                    stroke="rgba(156, 163, 175, 0.6)"
                    strokeWidth="1"
                    strokeDasharray="3,3"
                    className="pointer-events-none"
                  />
                </g>
              ));
            })()
          )}

          {/* Direction arrows */}
          {showDirectionArrows && customWaypoints.length > 1 && (
            (() => {
              const waypoints = getEffectiveWaypoints();
              const arrows = useSmoothPath 
                ? calculateDirectionArrows(waypoints, customControlPoints, 4)
                : calculateLinearDirectionArrows(waypoints, 3);
              
              return arrows.map((arrow, index) => (
                <g key={`arrow-${index}`} className="pointer-events-none">
                  {/* Simple equilateral triangle arrow */}
                  <polygon
                    points={`${arrow.position.x + 6},${arrow.position.y} ${arrow.position.x - 3},${arrow.position.y - 5} ${arrow.position.x - 3},${arrow.position.y + 5}`}
                    fill="rgb(16, 185, 129)"
                    stroke="white"
                    strokeWidth="1"
                    transform={`rotate(${arrow.angle} ${arrow.position.x} ${arrow.position.y})`}
                  />
                </g>
              ));
            })()
          )}

          {/* Waypoint markers */}
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
              <button
                onClick={() => setShowOriginDialog(true)}
                className="px-3 py-2 rounded font-medium text-sm transition-all bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                📍 Origin
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
              {editMode === 'setOrigin' && '💡 Click anywhere to set custom origin (start/end point)'}
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
            {/* Path Controls - 2x3 Grid */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setUseCustomPath(!useCustomPath)}
                disabled={customWaypoints.length < 2}
                className="px-2 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded transition-colors text-xs"
              >
                {useCustomPath ? '🔄 Original' : '🎯 Custom'}
              </button>
              <button
                onClick={handleExportPath}
                disabled={customWaypoints.length === 0}
                className="px-2 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded transition-colors text-xs"
              >
                📋 Export
              </button>
              <button
                onClick={() => setShowImportDialog(true)}
                className="px-2 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded transition-colors text-xs"
              >
                📥 Import
              </button>
              <button
                onClick={handleReplotWaypoints}
                disabled={customWaypoints.length === 0}
                className="px-2 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded transition-colors text-xs"
              >
                🔄 Replot
              </button>
              <button
                onClick={() => setUseSmoothPath(!useSmoothPath)}
                disabled={customWaypoints.length < 2}
                className="px-2 py-2 bg-teal-500 hover:bg-teal-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded transition-colors text-xs"
              >
                {useSmoothPath ? '📐 Linear' : '🌊 Smooth'}
              </button>
              <button
                onClick={() => setShowDirectionArrows(!showDirectionArrows)}
                disabled={customWaypoints.length < 2}
                className="px-2 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded transition-colors text-xs"
              >
                {showDirectionArrows ? '🔄 Hide Dir' : '➡️ Show Dir'}
              </button>
            </div>
            
            {/* Waypoint Management */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={clearWaypoints}
                disabled={customWaypoints.length === 0}
                className="px-2 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded transition-colors text-xs"
              >
                Clear Points
              </button>
              <button
                onClick={() => setCustomOrigin(null)}
                disabled={!customOrigin}
                className="px-2 py-2 bg-pink-500 hover:bg-pink-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded transition-colors text-xs"
              >
                Clear Origin
              </button>
            </div>
            
            {/* Exit Button - Full Width */}
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

      {/* Origin Dialog */}
      {showOriginDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
          <div className="bg-white rounded-lg shadow-2xl p-6 w-96 max-w-[90vw]">
            <h3 className="font-bold text-gray-800 mb-4 text-lg">Set Custom Origin</h3>
            <p className="text-sm text-gray-600 mb-6">
              Choose how to set the start/end point for your animation path:
            </p>
            
            {/* Click to Place Option */}
            <div className="mb-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <button
                onClick={handleOriginClickPlacement}
                className="w-full text-left"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">🎯</span>
                  <h4 className="font-semibold text-gray-800">Click to Place</h4>
                </div>
                <p className="text-sm text-gray-600 ml-9">
                  Click anywhere on the canvas to set the origin position
                </p>
              </button>
            </div>

            {/* Import Coordinates Option */}
            <div className="mb-6 p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">📋</span>
                <h4 className="font-semibold text-gray-800">Import Coordinates</h4>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Enter normalized coordinates (0-1 scale):
              </p>
              <input
                type="text"
                value={originImportText}
                onChange={(e) => setOriginImportText(e.target.value)}
                placeholder='{"x": 0.5, "y": 0.5}'
                className="w-full p-3 border border-gray-300 rounded text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleOriginImport}
                disabled={!originImportText.trim()}
                className="w-full mt-3 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded transition-colors"
              >
                Import Origin
              </button>
            </div>

            {/* Cancel Button */}
            <button
              onClick={() => {
                setOriginImportText('');
                setShowOriginDialog(false);
              }}
              className="w-full px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded transition-colors"
            >
              Cancel
            </button>
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
              : [0, 0.15, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 1.0],
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
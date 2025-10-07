import { useState, useRef } from 'react';
import {
  Position,
  Waypoint,
  NormalizedWaypoint,
  ControlPointPair,
  NormalizedControlPointPair,
  PathState,
  EditMode
} from '../beeFlight.types';
import {
  exportPathToNormalized,
  importPathFromNormalized,
  replaceStartEndPosition,
  replaceStartEndNormalized
} from '../beeFlight.utils';

export const usePathState = () => {
  // Core path state
  const [customWaypoints, setCustomWaypoints] = useState<Waypoint[]>([]);
  const [normalizedWaypoints, setNormalizedWaypoints] = useState<NormalizedWaypoint[]>([]);
  const [customControlPoints, setCustomControlPoints] = useState<Map<string, ControlPointPair>>(new Map());
  const [normalizedControlPoints, setNormalizedControlPoints] = useState<Map<string, NormalizedControlPointPair>>(new Map());
  const [customOrigin, setCustomOrigin] = useState<Position | null>(null);
  const [useSmoothPath, setUseSmoothPath] = useState<boolean>(false);
  const [showDirectionArrows, setShowDirectionArrows] = useState<boolean>(false);

  // Refs
  const nextIdRef = useRef<number>(0);

  // Helper functions
  const normalizePosition = (pos: Position): Position => ({
    x: pos.x / window.innerWidth,
    y: pos.y / window.innerHeight
  });

  const denormalizePosition = (pos: Position): Position => ({
    x: pos.x * window.innerWidth,
    y: pos.y * window.innerHeight
  });

  // Add waypoint with dual storage
  const addWaypoint = (position: Position) => {
    const newWaypoint = { ...position, id: nextIdRef.current++ };
    setCustomWaypoints(prev => [...prev, newWaypoint]);
    
    const normalized = {
      ...normalizePosition(position),
      id: newWaypoint.id
    };
    setNormalizedWaypoints(prev => [...prev, normalized]);
  };

  // Remove waypoint and clean up control points
  const removeWaypoint = (waypointId: number) => {
    setCustomWaypoints(prev => prev.filter(w => w.id !== waypointId));
    setNormalizedWaypoints(prev => prev.filter(w => w.id !== waypointId));
    
    // Clean up control points that reference this waypoint
    const newControlPoints = new Map(customControlPoints);
    const newNormalizedControlPoints = new Map(normalizedControlPoints);
    
    for (const [key] of customControlPoints) {
      if (key.includes(waypointId.toString())) {
        newControlPoints.delete(key);
        newNormalizedControlPoints.delete(key);
      }
    }
    
    setCustomControlPoints(newControlPoints);
    setNormalizedControlPoints(newNormalizedControlPoints);
  };

  // Update waypoint position with dual storage
  const updateWaypointPosition = (waypointId: number, newPosition: Position) => {
    setCustomWaypoints(prev => prev.map(w => 
      w.id === waypointId ? { ...w, ...newPosition } : w
    ));
    
    const normalized = normalizePosition(newPosition);
    setNormalizedWaypoints(prev => prev.map(w => 
      w.id === waypointId ? { ...w, ...normalized } : w
    ));
  };

  // Update control point with dual storage
  const updateControlPoint = (
    segmentKey: string,
    controlPoint: 'cp1' | 'cp2',
    newPosition: Position
  ) => {
    // Update absolute control points
    const currentControls = customControlPoints.get(segmentKey);
    if (currentControls) {
      const updatedControls = {
        ...currentControls,
        [controlPoint]: newPosition
      };
      setCustomControlPoints(new Map(customControlPoints.set(segmentKey, updatedControls)));
    }

    // Update normalized control points
    const normalized = normalizePosition(newPosition);
    const currentNormalizedControls = normalizedControlPoints.get(segmentKey);
    if (currentNormalizedControls) {
      const updatedNormalizedControls = {
        ...currentNormalizedControls,
        [controlPoint]: normalized
      };
      setNormalizedControlPoints(new Map(normalizedControlPoints.set(segmentKey, updatedNormalizedControls)));
    }
  };

  // Move waypoint to true center
  const moveWaypointToCenter = (waypointId: number) => {
    const center = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2
    };
    
    updateWaypointPosition(waypointId, center);
  };

  // Apply custom origin to waypoints
  const applyCustomOrigin = (origin: Position) => {
    setCustomOrigin(origin);
    
    if (customWaypoints.length >= 2) {
      const updatedWaypoints = replaceStartEndPosition(customWaypoints, origin);
      const updatedNormalized = replaceStartEndNormalized(normalizedWaypoints, {
        ...normalizePosition(origin),
        id: 0 // ID doesn't matter for origin replacement
      });
      
      setCustomWaypoints(updatedWaypoints);
      setNormalizedWaypoints(updatedNormalized);
    }
  };

  // Clear all waypoints and control points
  const clearAllWaypoints = () => {
    setCustomWaypoints([]);
    setNormalizedWaypoints([]);
    setCustomControlPoints(new Map());
    setNormalizedControlPoints(new Map());
    nextIdRef.current = 0;
  };

  // Replot everything using normalized data (THE FIX!)
  const replotFromNormalized = () => {
    if (normalizedWaypoints.length === 0) return;

    // Replot waypoints from normalized data
    const replotted = importPathFromNormalized(normalizedWaypoints);
    setCustomWaypoints(replotted);

    // Replot control points from normalized data
    const newControlPoints = new Map<string, ControlPointPair>();
    for (const [key, normalizedPair] of normalizedControlPoints) {
      newControlPoints.set(key, {
        cp1: denormalizePosition(normalizedPair.cp1),
        cp2: denormalizePosition(normalizedPair.cp2)
      });
    }
    setCustomControlPoints(newControlPoints);

    // Replot custom origin if it exists
    if (customOrigin) {
      const normalizedOrigin = normalizePosition(customOrigin);
      setCustomOrigin(denormalizePosition(normalizedOrigin));
    }
  };

  // Import waypoints with control points
  const importWaypoints = (normalizedData: NormalizedWaypoint[]) => {
    const imported = importPathFromNormalized(normalizedData);
    setCustomWaypoints(imported);
    setNormalizedWaypoints(normalizedData);
    
    // Update next ID to avoid conflicts
    const maxId = Math.max(...imported.map(w => w.id), -1);
    nextIdRef.current = maxId + 1;
    
    // Clear control points when importing new waypoints
    setCustomControlPoints(new Map());
    setNormalizedControlPoints(new Map());
  };

  // Get effective waypoints (with custom origin applied)
  const getEffectiveWaypoints = (): Waypoint[] => {
    if (customWaypoints.length < 2) return customWaypoints;
    
    if (customOrigin) {
      return replaceStartEndPosition(customWaypoints, customOrigin);
    }
    
    return customWaypoints;
  };

  return {
    // State
    customWaypoints,
    normalizedWaypoints,
    customControlPoints,
    normalizedControlPoints,
    customOrigin,
    useSmoothPath,
    showDirectionArrows,
    nextIdRef,

    // Setters
    setUseSmoothPath,
    setShowDirectionArrows,
    setCustomOrigin,

    // Actions
    addWaypoint,
    removeWaypoint,
    updateWaypointPosition,
    updateControlPoint,
    moveWaypointToCenter,
    applyCustomOrigin,
    clearAllWaypoints,
    replotFromNormalized, // THE KEY FIX!
    importWaypoints,
    getEffectiveWaypoints,

    // Utilities
    normalizePosition,
    denormalizePosition
  };
};

// Types and interfaces for bee flight animation
export interface Position {
  x: number;
  y: number;
}

export interface Waypoint {
  x: number;
  y: number;
  id: number;
}

export interface NormalizedWaypoint {
  x: number; // 0-1 scale
  y: number; // 0-1 scale
  id: number;
}

// Helper functions for waypoint management
export const sanitizeWaypoints = (waypoints: Waypoint[]): Waypoint[] => {
  return waypoints.map(w => ({
    ...w,
    x: Math.floor(w.x),
    y: Math.floor(w.y)
  }));
};

export const generateLinearTiming = (waypointCount: number): number[] => {
  return Array.from({ length: waypointCount }, (_, i) => i / (waypointCount - 1));
};

export const generateCustomAnimationPath = (customWaypoints: Waypoint[]) => {
  if (customWaypoints.length < 2) return null;
  
  const sanitized = sanitizeWaypoints(customWaypoints);
  
  return {
    x: sanitized.map(w => w.x),
    y: sanitized.map(w => w.y),
    rotate: new Array(sanitized.length).fill(0),
    scale: new Array(sanitized.length).fill(1),
    opacity: new Array(sanitized.length).fill(1),
  };
};

export const getTrueCenter = (): Position => ({
  x: window.innerWidth / 2,
  y: window.innerHeight / 2
});

export const exportPathToNormalized = (waypoints: Waypoint[]): NormalizedWaypoint[] => {
  return waypoints.map(w => ({
    x: w.x / window.innerWidth,
    y: w.y / window.innerHeight,
    id: w.id
  }));
};

export const importPathFromNormalized = (normalizedPath: NormalizedWaypoint[]): Waypoint[] => {
  return normalizedPath.map(w => ({
    x: w.x * window.innerWidth,
    y: w.y * window.innerHeight,
    id: w.id
  }));
};

export const validateNormalizedWaypoints = (parsed: any[]): boolean => {
  return parsed.every(item => 
    typeof item === 'object' &&
    typeof item.x === 'number' &&
    typeof item.y === 'number' &&
    typeof item.id === 'number' &&
    item.x >= 0 && item.x <= 1 &&
    item.y >= 0 && item.y <= 1
  );
};

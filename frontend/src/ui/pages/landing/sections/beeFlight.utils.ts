// Import and re-export types from dedicated types file
import type {
  Position,
  Waypoint,
  NormalizedWaypoint,
  CurveSegment,
  SmoothedPath,
  DirectionArrow,
  ControlPointPair,
  NormalizedControlPointPair
} from './beeFlight.types';

export type {
  Position,
  Waypoint,
  NormalizedWaypoint,
  CurveSegment,
  SmoothedPath,
  DirectionArrow,
  ControlPointPair,
  NormalizedControlPointPair,
  EditMode,
  AnimationPath,
  ExportablePathData,
  PathState,
  DebugState,
  MouseEventHandlers,
  PathGenerationOptions
} from './beeFlight.types';

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

// Replace first and last waypoints with a new origin position
export const replaceStartEndPosition = (waypoints: Waypoint[], newOrigin: Position): Waypoint[] => {
  if (waypoints.length < 2) return waypoints;
  
  return waypoints.map((waypoint, index) => {
    // Replace first and last waypoint with new origin
    if (index === 0 || index === waypoints.length - 1) {
      return {
        ...waypoint,
        x: newOrigin.x,
        y: newOrigin.y
      };
    }
    return waypoint;
  });
};

// Replace first and last normalized waypoints with a new normalized origin
export const replaceStartEndNormalized = (waypoints: NormalizedWaypoint[], newOrigin: NormalizedWaypoint): NormalizedWaypoint[] => {
  if (waypoints.length < 2) return waypoints;
  
  return waypoints.map((waypoint, index) => {
    // Replace first and last waypoint with new origin
    if (index === 0 || index === waypoints.length - 1) {
      return {
        ...waypoint,
        x: newOrigin.x,
        y: newOrigin.y
      };
    }
    return waypoint;
  });
};

// Bézier curve functions
export const cubicBezier = (t: number, p0: Position, p1: Position, p2: Position, p3: Position): Position => {
  const u = 1 - t;
  const tt = t * t;
  const uu = u * u;
  const uuu = uu * u;
  const ttt = tt * t;

  return {
    x: uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x,
    y: uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y
  };
};

// Generate points along a Bézier curve
export const generateBezierPoints = (p0: Position, p1: Position, p2: Position, p3: Position, steps: number = 20): Position[] => {
  const points: Position[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    points.push(cubicBezier(t, p0, p1, p2, p3));
  }
  return points;
};

// Auto-generate control points for smooth curves
export const generateControlPoints = (waypoints: Waypoint[]): CurveSegment[] => {
  if (waypoints.length < 2) return [];
  
  const segments: CurveSegment[] = [];
  
  for (let i = 0; i < waypoints.length - 1; i++) {
    const current = waypoints[i];
    const next = waypoints[i + 1];
    
    // Calculate control points for smooth curve
    const dx = next.x - current.x;
    const dy = next.y - current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Control points are 1/3 of the way along the segment
    const controlDistance = distance * 0.33;
    
    const controlPoint1: Position = {
      x: current.x + (dx * 0.33),
      y: current.y + (dy * 0.33)
    };
    
    const controlPoint2: Position = {
      x: next.x - (dx * 0.33),
      y: next.y - (dy * 0.33)
    };
    
    segments.push({
      start: current,
      end: next,
      controlPoint1,
      controlPoint2,
      isSmooth: true
    });
  }
  
  return segments;
};

// Generate smoothed path with interpolated points for animation
export const generateSmoothedPath = (waypoints: Waypoint[], stepsPerSegment: number = 20): SmoothedPath => {
  const segments = generateControlPoints(waypoints);
  const interpolatedPoints: Position[] = [];
  
  // Generate dense points for smooth animation
  segments.forEach(segment => {
    const bezierPoints = generateBezierPoints(
      segment.start,
      segment.controlPoint1,
      segment.controlPoint2,
      segment.end,
      stepsPerSegment
    );
    
    // Skip the first point of subsequent segments to avoid duplicates
    const pointsToAdd = interpolatedPoints.length === 0 ? bezierPoints : bezierPoints.slice(1);
    interpolatedPoints.push(...pointsToAdd);
  });
  
  return {
    waypoints,
    segments,
    interpolatedPoints
  };
};

// Generate smoothed path with custom control points
export const generateSmoothedPathWithCustomControls = (
  waypoints: Waypoint[], 
  customControlPoints: Map<string, {cp1: Position, cp2: Position}>,
  stepsPerSegment: number = 20
): SmoothedPath => {
  const segments = generateControlPoints(waypoints);
  
  // Override with custom control points where available
  const customizedSegments = segments.map((segment, index) => {
    const segmentKey = `${segment.start.id}-${segment.end.id}`;
    const customControls = customControlPoints.get(segmentKey);
    
    if (customControls) {
      return {
        ...segment,
        controlPoint1: customControls.cp1,
        controlPoint2: customControls.cp2
      };
    }
    
    return segment;
  });
  
  const interpolatedPoints: Position[] = [];
  
  // Generate dense points for smooth animation
  customizedSegments.forEach(segment => {
    const bezierPoints = generateBezierPoints(
      segment.start,
      segment.controlPoint1,
      segment.controlPoint2,
      segment.end,
      stepsPerSegment
    );
    
    // Skip the first point of subsequent segments to avoid duplicates
    const pointsToAdd = interpolatedPoints.length === 0 ? bezierPoints : bezierPoints.slice(1);
    interpolatedPoints.push(...pointsToAdd);
  });
  
  return {
    waypoints,
    segments: customizedSegments,
    interpolatedPoints
  };
};

// Calculate direction arrows along a path
export const calculateDirectionArrows = (
  waypoints: Waypoint[], 
  customControlPoints: Map<string, {cp1: Position, cp2: Position}>,
  arrowCount: number = 5
): DirectionArrow[] => {
  if (waypoints.length < 2) return [];
  
  const smoothedPath = generateSmoothedPathWithCustomControls(waypoints, customControlPoints, 20);
  const points = smoothedPath.interpolatedPoints;
  
  if (points.length < 2) return [];
  
  const arrows: DirectionArrow[] = [];
  const spacing = Math.max(1, Math.floor(points.length / (arrowCount + 1)));
  
  // Place arrows evenly along the path, skipping start and end
  for (let i = spacing; i < points.length - spacing; i += spacing) {
    const current = points[i];
    const next = points[Math.min(i + 3, points.length - 1)]; // Look ahead a bit for smoother direction
    
    // Calculate angle from current to next point
    const dx = next.x - current.x;
    const dy = next.y - current.y;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    
    arrows.push({
      position: current,
      angle
    });
  }
  
  return arrows;
};

// Calculate direction arrows for linear paths
export const calculateLinearDirectionArrows = (waypoints: Waypoint[], arrowCount: number = 3): DirectionArrow[] => {
  if (waypoints.length < 2) return [];
  
  const arrows: DirectionArrow[] = [];
  
  // Place arrows on each segment
  for (let i = 0; i < waypoints.length - 1; i++) {
    const start = waypoints[i];
    const end = waypoints[i + 1];
    
    // Calculate direction angle
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    
    // Place arrow at midpoint of segment
    const midpoint = {
      x: start.x + dx * 0.5,
      y: start.y + dy * 0.5
    };
    
    arrows.push({
      position: midpoint,
      angle
    });
  }
  
  return arrows;
};

// Control point export/import utilities
export const exportControlPointsToNormalized = (
  controlPoints: Map<string, ControlPointPair>
): Record<string, NormalizedControlPointPair> => {
  const normalized: Record<string, NormalizedControlPointPair> = {};
  
  for (const [key, pair] of controlPoints) {
    normalized[key] = {
      cp1: {
        x: pair.cp1.x / window.innerWidth,
        y: pair.cp1.y / window.innerHeight
      },
      cp2: {
        x: pair.cp2.x / window.innerWidth,
        y: pair.cp2.y / window.innerHeight
      }
    };
  }
  
  return normalized;
};

export const importControlPointsFromNormalized = (
  normalizedControlPoints: Record<string, NormalizedControlPointPair>
): Map<string, ControlPointPair> => {
  const controlPoints = new Map<string, ControlPointPair>();
  
  for (const [key, normalizedPair] of Object.entries(normalizedControlPoints)) {
    controlPoints.set(key, {
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
  
  return controlPoints;
};

// Complete path export with all data
export const exportCompletePathData = (
  waypoints: Waypoint[],
  controlPoints: Map<string, ControlPointPair>,
  customOrigin: Position | null,
  useSmoothPath: boolean
) => {
  const exportData = {
    waypoints: exportPathToNormalized(waypoints),
    controlPoints: exportControlPointsToNormalized(controlPoints),
    customOrigin: customOrigin ? {
      x: customOrigin.x / window.innerWidth,
      y: customOrigin.y / window.innerHeight
    } : null,
    useSmoothPath,
    metadata: {
      version: "2.0",
      created: new Date().toISOString(),
      totalWaypoints: waypoints.length,
      totalControlPoints: controlPoints.size,
      exportType: "complete"
    }
  };
  
  return exportData;
};

// Validate complete export data
export const validateCompleteExportData = (data: any): boolean => {
  try {
    // Check required fields
    if (!data || typeof data !== 'object') return false;
    if (!Array.isArray(data.waypoints)) return false;
    if (typeof data.controlPoints !== 'object') return false;
    if (typeof data.useSmoothPath !== 'boolean') return false;
    
    // Validate waypoints
    if (!validateNormalizedWaypoints(data.waypoints)) return false;
    
    // Validate control points
    for (const [key, pair] of Object.entries(data.controlPoints as Record<string, any>)) {
      if (!pair || typeof pair !== 'object') return false;
      if (!pair.cp1 || !pair.cp2) return false;
      if (typeof pair.cp1.x !== 'number' || typeof pair.cp1.y !== 'number') return false;
      if (typeof pair.cp2.x !== 'number' || typeof pair.cp2.y !== 'number') return false;
      if (pair.cp1.x < 0 || pair.cp1.x > 1 || pair.cp1.y < 0 || pair.cp1.y > 1) return false;
      if (pair.cp2.x < 0 || pair.cp2.x > 1 || pair.cp2.y < 0 || pair.cp2.y > 1) return false;
    }
    
    // Validate custom origin if present
    if (data.customOrigin !== null) {
      if (typeof data.customOrigin !== 'object') return false;
      if (typeof data.customOrigin.x !== 'number' || typeof data.customOrigin.y !== 'number') return false;
      if (data.customOrigin.x < 0 || data.customOrigin.x > 1) return false;
      if (data.customOrigin.y < 0 || data.customOrigin.y > 1) return false;
    }
    
    return true;
  } catch {
    return false;
  }
};

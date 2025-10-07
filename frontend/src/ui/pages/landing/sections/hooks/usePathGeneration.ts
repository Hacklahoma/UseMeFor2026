import { useMemo } from 'react';
import {
  Waypoint,
  ControlPointPair,
  AnimationPath,
  DirectionArrow,
  PathGenerationOptions
} from '../beeFlight.types';
import {
  generateCustomAnimationPath,
  generateSmoothedPathWithCustomControls,
  generateLinearTiming,
  calculateDirectionArrows,
  calculateLinearDirectionArrows
} from '../beeFlight.utils';

interface UsePathGenerationProps {
  waypoints: Waypoint[];
  customControlPoints: Map<string, ControlPointPair>;
  useSmoothPath: boolean;
  showDirectionArrows: boolean;
  options?: Partial<PathGenerationOptions>;
}

export const usePathGeneration = ({
  waypoints,
  customControlPoints,
  useSmoothPath,
  showDirectionArrows,
  options = {}
}: UsePathGenerationProps) => {
  
  const defaultOptions: PathGenerationOptions = {
    stepsPerSegment: 15,
    arrowCount: 4,
    useCustomOrigin: false,
    ...options
  };

  // Generate the main animation path
  const animationPath = useMemo((): AnimationPath | null => {
    if (waypoints.length < 2) return null;

    if (useSmoothPath) {
      const smoothedPath = generateSmoothedPathWithCustomControls(
        waypoints, 
        customControlPoints, 
        defaultOptions.stepsPerSegment
      );
      
      return {
        x: smoothedPath.interpolatedPoints.map(p => p.x),
        y: smoothedPath.interpolatedPoints.map(p => p.y),
        rotate: new Array(smoothedPath.interpolatedPoints.length).fill(0),
        scale: new Array(smoothedPath.interpolatedPoints.length).fill(1),
        opacity: new Array(smoothedPath.interpolatedPoints.length).fill(1),
      };
    }

    return generateCustomAnimationPath(waypoints);
  }, [waypoints, customControlPoints, useSmoothPath, defaultOptions.stepsPerSegment]);

  // Generate timing array for animation
  const animationTiming = useMemo((): number[] => {
    if (!animationPath) return [];
    
    return generateLinearTiming(animationPath.x.length);
  }, [animationPath]);

  // Generate direction arrows
  const directionArrows = useMemo((): DirectionArrow[] => {
    if (!showDirectionArrows || waypoints.length < 2) return [];

    if (useSmoothPath) {
      return calculateDirectionArrows(
        waypoints, 
        customControlPoints, 
        defaultOptions.arrowCount
      );
    }

    return calculateLinearDirectionArrows(waypoints, 3);
  }, [waypoints, customControlPoints, useSmoothPath, showDirectionArrows, defaultOptions.arrowCount]);

  // Generate smoothed path for visualization (separate from animation)
  const visualizationPath = useMemo(() => {
    if (waypoints.length < 2 || !useSmoothPath) return null;
    
    return generateSmoothedPathWithCustomControls(waypoints, customControlPoints, 10);
  }, [waypoints, customControlPoints, useSmoothPath]);

  // Generate SVG path string for curved lines
  const svgPathString = useMemo((): string => {
    if (!visualizationPath) return '';
    
    return `M ${visualizationPath.interpolatedPoints.map((p, i) => 
      i === 0 ? `${p.x} ${p.y}` : `L ${p.x} ${p.y}`
    ).join(' ')}`;
  }, [visualizationPath]);

  // Calculate path statistics
  const pathStats = useMemo(() => {
    if (!animationPath) return null;

    const totalPoints = animationPath.x.length;
    let totalDistance = 0;

    // Calculate approximate path length
    for (let i = 1; i < totalPoints; i++) {
      const dx = animationPath.x[i] - animationPath.x[i - 1];
      const dy = animationPath.y[i] - animationPath.y[i - 1];
      totalDistance += Math.sqrt(dx * dx + dy * dy);
    }

    return {
      totalPoints,
      totalDistance: Math.round(totalDistance),
      pathType: useSmoothPath ? 'curved' : 'linear',
      segments: waypoints.length - 1,
      customControlPoints: customControlPoints.size
    };
  }, [animationPath, waypoints.length, useSmoothPath, customControlPoints.size]);

  return {
    // Main outputs
    animationPath,
    animationTiming,
    directionArrows,
    visualizationPath,
    svgPathString,
    pathStats,

    // Validation
    isValidPath: waypoints.length >= 2,
    hasCustomControls: customControlPoints.size > 0,
    
    // Configuration
    options: defaultOptions
  };
};

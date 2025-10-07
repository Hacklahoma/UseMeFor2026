import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useOriginDetection } from './OriginContext';
import flightPathData from './flightpath1.json';

interface Position {
  x: number;
  y: number;
}

interface Waypoint extends Position {
  id: number;
}

interface ControlPointPair {
  cp1: Position;
  cp2: Position;
}

interface AnimationPath {
  x: number[];
  y: number[];
  rotate: number[];
  scale: number[];
  opacity: number[];
}

const BeeFlightOverlay: React.FC = () => {
  const [phase, setPhase] = useState<'measuring' | 'animating' | 'complete'>('measuring');
  const [initialPosition, setInitialPosition] = useState<Position | null>(null);
  const [finalPosition, setFinalPosition] = useState<Position | null>(null);
  const [animationPath, setAnimationPath] = useState<AnimationPath | null>(null);
  const { getOriginCenter } = useOriginDetection();

  // Cubic Bézier interpolation function
  const cubicBezier = (t: number, p0: Position, p1: Position, p2: Position, p3: Position): Position => {
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

  // Generate Bézier curve points between two waypoints
  const generateBezierPoints = (
    start: Waypoint,
    end: Waypoint,
    cp1: Position,
    cp2: Position,
    numPoints: number = 15
  ): Position[] => {
    const points: Position[] = [];
    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints;
      const point = cubicBezier(t, start, cp1, cp2, end);
      points.push(point);
    }
    return points;
  };

  // Convert normalized coordinates to absolute pixels
  const denormalizePosition = (normalized: Position): Position => ({
    x: normalized.x * window.innerWidth,
    y: normalized.y * window.innerHeight
  });

  // Convert normalized waypoints to absolute coordinates
  const denormalizeWaypoints = (normalizedWaypoints: any[]): Waypoint[] => {
    return normalizedWaypoints.map(w => ({
      x: w.x * window.innerWidth,
      y: w.y * window.innerHeight,
      id: w.id
    }));
  };

  // Convert normalized control points to absolute coordinates
  const denormalizeControlPoints = (normalizedControlPoints: any): Map<string, ControlPointPair> => {
    const controlPoints = new Map<string, ControlPointPair>();
    
    for (const [key, pair] of Object.entries(normalizedControlPoints)) {
      const typedPair = pair as { cp1: Position; cp2: Position };
      controlPoints.set(key, {
        cp1: denormalizePosition(typedPair.cp1),
        cp2: denormalizePosition(typedPair.cp2)
      });
    }
    
    return controlPoints;
  };

  // Generate smooth animation path using imported data
  const generateSmoothAnimationPath = (
    waypoints: Waypoint[],
    controlPoints: Map<string, ControlPointPair>
  ): AnimationPath => {
    if (waypoints.length < 2) {
      return { x: [], y: [], rotate: [], scale: [], opacity: [] };
    }

    const allPoints: Position[] = [];
    
    // Generate smooth curves between waypoints
    for (let i = 0; i < waypoints.length - 1; i++) {
      const current = waypoints[i];
      const next = waypoints[i + 1];
      const segmentKey = `${current.id}-${next.id}`;
      
      // Get control points for this segment
      const controls = controlPoints.get(segmentKey);
      
      if (controls) {
        // Use custom control points for smooth curves
        const curvePoints = generateBezierPoints(current, next, controls.cp1, controls.cp2, 15);
        allPoints.push(...curvePoints.slice(0, -1)); // Avoid duplicating end point
      } else {
        // Fallback to auto-generated control points
        const cp1 = {
          x: current.x + (next.x - current.x) * 0.33,
          y: current.y + (next.y - current.y) * 0.33
        };
        const cp2 = {
          x: next.x - (next.x - current.x) * 0.33,
          y: next.y - (next.y - current.y) * 0.33
        };
        const curvePoints = generateBezierPoints(current, next, cp1, cp2, 15);
        allPoints.push(...curvePoints.slice(0, -1));
      }
    }
    
    // Add the final waypoint
    allPoints.push(waypoints[waypoints.length - 1]);

    // No rotation for now - keep bee upright
    const rotations = new Array(allPoints.length).fill(0);

    return {
      x: allPoints.map(p => p.x),
      y: allPoints.map(p => p.y),
      rotate: rotations,
      scale: new Array(allPoints.length).fill(1),
      opacity: new Array(allPoints.length).fill(1)
    };
  };

  // Measure positions when component mounts
  useEffect(() => {
    const measurePositions = async () => {
      // Small delay to ensure DOM is ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      try {
        // Measure initial position (center bee in landing view)
        const centerBeeElement = document.querySelector('.initial-bee-location img') as HTMLElement;
        let initialPos: Position | null = null;
        
        if (centerBeeElement) {
          const rect = centerBeeElement.getBoundingClientRect();
          initialPos = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
          };
          setInitialPosition(initialPos);
        }

        // Measure final position (header logo via origin context)
        const finalPos = getOriginCenter('final-logo');
        if (finalPos) {
          setFinalPosition({
            x: finalPos.x * window.innerWidth,
            y: finalPos.y * window.innerHeight
          });
        }

        // If both positions measured successfully, prepare animation
        if (initialPos && finalPos) {
          // Convert imported path data to absolute coordinates
          const absoluteWaypoints = denormalizeWaypoints(flightPathData.waypoints);
          const absoluteControlPoints = denormalizeControlPoints(flightPathData.controlPoints);
          
          // Replace first waypoint with initial position
          if (absoluteWaypoints.length > 0) {
            absoluteWaypoints[0] = {
              x: initialPos.x,
              y: initialPos.y,
              id: 0
            };
          }
          
          // Replace last waypoint with final position
          if (absoluteWaypoints.length > 1) {
            absoluteWaypoints[absoluteWaypoints.length - 1] = {
              x: finalPos.x * window.innerWidth,
              y: finalPos.y * window.innerHeight,
              id: 999
            };
          }

          // Generate smooth animation path
          const path = generateSmoothAnimationPath(absoluteWaypoints, absoluteControlPoints);
          setAnimationPath(path);
          
          // Start animation
          setPhase('animating');
        }
      } catch (error) {
        console.error('Failed to measure positions:', error);
        // Graceful fallback - no animation
        setPhase('complete');
      }
    };

    measurePositions();
  }, [getOriginCenter]);

  // Generate linear timing for smooth animation
  const generateLinearTiming = (length: number): number[] => {
    return Array.from({ length }, (_, i) => i / (length - 1));
  };

  // Don't render anything if measurement failed or animation complete
  if (phase === 'complete' || !initialPosition || !finalPosition || !animationPath) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      {phase === 'animating' && animationPath && (
        <motion.div
          className="absolute"
          style={{ 
            x: initialPosition.x,
            y: initialPosition.y,
            translateX: '-50%',
            translateY: '-50%',
          }}
          animate={{
            x: animationPath.x,
            y: animationPath.y,
            rotate: animationPath.rotate,
            scale: animationPath.scale,
            opacity: animationPath.opacity
          }}
          transition={{
            duration: 6, // 6 second flight
            ease: [0.43, 0.13, 0.23, 0.96], // Smooth easing
            times: generateLinearTiming(animationPath.x.length)
          }}
          onAnimationComplete={() => {
            // Small delay before completing
            setTimeout(() => setPhase('complete'), 500);
          }}
        >
          {/* Animated Bee SVG - Same size as landing logo (64x64px) */}
          <svg width="64" height="64" viewBox="0 0 44 46" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-lg">
            <path d="M44 23.8676H42.2597V32.3504H44V23.8676Z" fill="#4E5B3B"/>
            <path d="M40.9733 19.8189H39.233V32.3504H40.9733V19.8189Z" fill="#4E5B3B"/>
            <path d="M38.0224 16.6186H36.282V31.0008H38.0224V16.6186Z" fill="#4E5B3B"/>
            <path d="M34.92 16.6186H33.2554V29.0344H34.92V16.6186Z" fill="#4E5B3B"/>
            <path d="M32.0069 19.8189H30.2666V27.2607H32.0069V19.8189Z" fill="#4E5B3B"/>
            <path d="M1.74033 23.8676H0V32.3504H1.74033V23.8676Z" fill="#4E5B3B"/>
            <path d="M4.80482 19.8189H3.06449V32.3504H4.80482V19.8189Z" fill="#4E5B3B"/>
            <path d="M7.7558 16.6186H6.01548V31.0008H7.7558V16.6186Z" fill="#4E5B3B"/>
            <path d="M10.7446 16.6186H9.07997V29.0344H10.7446V16.6186Z" fill="#4E5B3B"/>
            <path d="M13.7713 19.8189H12.031V27.2607H13.7713V19.8189Z" fill="#4E5B3B"/>
            <path d="M17.3276 0.0771165H15.5116V3.16178H17.3276V0.0771165Z" fill="#4E5B3B"/>
            <path d="M19.8246 4.4342H18.1221V8.02012H19.8246V4.4342Z" fill="#4E5B3B"/>
            <path d="M23.9862 40.9874V43.3395H22.8134V46H21.1488C21.1109 45.1132 21.0731 44.2649 21.0353 43.378H19.7489V40.9874H23.9862Z" fill="#4E5B3B"/>
            <path d="M25.7644 4.4342H24.0241V7.98156H25.7644V4.4342Z" fill="#4E5B3B"/>
            <path d="M26.5589 36.7846H17.2519V39.3294H26.5589V36.7846Z" fill="#4E5B3B"/>
            <path d="M17.1006 9.56245H26.8616C26.8616 11.259 26.8237 12.9556 26.7481 14.6521H24.7051C24.6294 15.3076 24.5537 15.9246 24.5159 16.58H19.4463C19.3328 15.9631 19.2571 15.3847 19.1814 14.7293H17.1006V9.52389V9.56245Z" fill="#4E5B3B"/>
            <path d="M28.3371 18.3152H15.5116V22.0553H28.3371V18.3152Z" fill="#4E5B3B"/>
            <path d="M28.3749 24.4074H15.5873V28.109H28.3749V24.4074Z" fill="#4E5B3B"/>
            <path d="M28.3749 30.6924H15.5873V34.3554H28.3749V30.6924Z" fill="#4E5B3B"/>
            <path d="M28.5262 0C28.5262 1.04107 28.5262 2.08215 28.4127 3.16178H26.6346V0H28.5262Z" fill="#4E5B3B"/>
        </svg>
        </motion.div>
      )}
    </div>
  );
};

export default BeeFlightOverlay;

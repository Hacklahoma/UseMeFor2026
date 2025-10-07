// Core types and interfaces for bee flight animation system
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

export interface CurveSegment {
  start: Waypoint;
  end: Waypoint;
  controlPoint1: Position;
  controlPoint2: Position;
  isSmooth: boolean;
}

export interface SmoothedPath {
  waypoints: Waypoint[];
  segments: CurveSegment[];
  interpolatedPoints: Position[];
}

export interface DirectionArrow {
  position: Position;
  angle: number; // in degrees
}

// Control point storage types
export interface ControlPointPair {
  cp1: Position;
  cp2: Position;
}

export interface NormalizedControlPointPair {
  cp1: Position; // 0-1 scale
  cp2: Position; // 0-1 scale
}

// Edit modes
export type EditMode = 'none' | 'add' | 'move' | 'remove' | 'center' | 'setOrigin';

// Animation path format
export interface AnimationPath {
  x: number[];
  y: number[];
  rotate: number[];
  scale: number[];
  opacity: number[];
}

// Complete path data for export/import
export interface ExportablePathData {
  waypoints: NormalizedWaypoint[];
  controlPoints: Map<string, NormalizedControlPointPair>;
  customOrigin: Position | null; // normalized
  useSmoothPath: boolean;
  metadata: {
    version: string;
    created: Date;
    totalPoints: number;
  };
}

// State management types
export interface PathState {
  customWaypoints: Waypoint[];
  normalizedWaypoints: NormalizedWaypoint[];
  customControlPoints: Map<string, ControlPointPair>;
  normalizedControlPoints: Map<string, NormalizedControlPointPair>;
  customOrigin: Position | null;
  useSmoothPath: boolean;
  showDirectionArrows: boolean;
}

export interface DebugState {
  debugMode: boolean;
  editMode: EditMode;
  selectedWaypoint: number | null;
  selectedSegment: number | null;
  isDragging: boolean;
  isDraggingControl: {segmentIndex: number, controlPoint: 'cp1' | 'cp2'} | null;
  showImportDialog: boolean;
  importText: string;
  showReplotNotification: boolean;
}

// Event handler types
export interface MouseEventHandlers {
  handleCanvasClick: (e: React.MouseEvent<SVGSVGElement>) => void;
  handleWaypointMouseDown: (e: React.MouseEvent, waypointId: number) => void;
  handleControlPointMouseDown: (e: React.MouseEvent, segmentIndex: number, controlPoint: 'cp1' | 'cp2') => void;
  handleMouseMove: (e: React.MouseEvent<SVGSVGElement>) => void;
  handleMouseUp: () => void;
}

// Path generation options
export interface PathGenerationOptions {
  stepsPerSegment: number;
  arrowCount: number;
  useCustomOrigin: boolean;
}

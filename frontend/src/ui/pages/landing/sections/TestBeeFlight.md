```markdown
# Bee Flight Animation System - Complete Technical Specification

## Core Concept
Professional-grade animation path editor with Bézier curves, normalized coordinates, and Figma-style interactions. Animate element from initial DOM position → custom curved/linear path → back to exact starting position. Uses getBoundingClientRect() to capture real pixel coordinates, eliminating unit conversion issues.

## 🏗️ Architecture Overview (2024 Refactor)

### File Structure
```
TestBeeFlight.tsx (1295+ lines) - Main component
├── beeFlight.types.ts - All TypeScript interfaces
├── beeFlight.utils.ts - Mathematical functions & utilities  
├── hooks/
│   ├── usePathState.ts - Waypoint & control point state management
│   └── usePathGeneration.ts - Path calculation & animation logic
├── OriginContext.tsx - Dynamic origin detection system
├── FindOriginButton.tsx - Reusable origin detection component
└── TestBeeFlight.md - This documentation
```

### Key Features
- ✅ **Bézier Curve Editor** - Drag control points like Figma/Photoshop
- ✅ **Normalized Coordinates** - Resolution-independent paths (0-1 scale)
- ✅ **Dual Storage System** - Absolute + normalized for perfect replotting
- ✅ **Visual Debug Mode** - Grid, waypoints, control points, direction arrows
- ✅ **Complete Export/Import** - Waypoints + control points + settings in JSON
- ✅ **Independent Waypoints** - No forced origin connections, full creative freedom
- ✅ **Origin Snapping** - Optional manual connection via drag-to-snap
- ✅ **Dynamic Origin Detection** - Components register themselves as origin targets
- ✅ **Smart Replotting** - Maintains curve shape across screen size changes

## Architecture Pattern

### The "Return to Origin" Technique
```
1. Mount element at final position (opacity: 0)
2. Measure real DOM coordinates via ref
3. Store as { x: pixels, y: pixels }
4. Animate away from origin (opacity: 1)
5. Execute path waypoints
6. Return to stored origin coordinates
7. Swap animated element for static element
```

**Why this works:** No vw/vh → px conversion. Path is circular. Works on any viewport as long as no resize during animation.

## Key Implementation Details

### Position Measurement
```tsx
const beeRef = useRef<HTMLDivElement>(null);
const [initialPosition, setInitialPosition] = useState<Position | null>(null);

useEffect(() => {
  if (beeRef.current && !initialPosition) {
    const rect = beeRef.current.getBoundingClientRect();
    setInitialPosition({
      x: rect.left + rect.width / 2,  // Center point
      y: rect.top + rect.height / 2,
    });
  }
}, [initialPosition]);
```

### Motion Configuration
```tsx
<motion.div
  className="fixed top-0 left-0"  // Fixed positioning required
  style={{ 
    x: initialPosition.x,
    y: initialPosition.y,
    translateX: '-50%',  // Center the element on coordinates
    translateY: '-50%',
  }}
  animate={isAnimating ? waypoints : {}}
/>
```

### Waypoint Structure
Arrays of equal length for x, y, rotate, scale, opacity:
```tsx
{
  x: [startX, waypoint1X, waypoint2X, ..., startX],
  y: [startY, waypoint1Y, waypoint2Y, ..., startY],
  rotate: [0, -90, -180, ..., -360],
  scale: [1, 1.5, 1.2, ..., 1],
  opacity: [0, 1, 1, ..., 1],
}
```

**Critical:** First and last waypoint must be identical (the origin).

### Timing Control
```tsx
transition={{
  duration: 5,
  ease: [0.43, 0.13, 0.23, 0.96],  // Cubic bezier
  times: [0, 0.08, 0.16, ..., 0.8, 1],  // Normalized 0-1
}}
```
`times` array maps waypoints to animation progress. Length must match waypoint arrays.

## Visual Path Editor

### State Management
```tsx
interface Waypoint {
  x: number;  // Absolute pixels
  y: number;
  id: number; // Unique identifier for React keys
}

const [customWaypoints, setCustomWaypoints] = useState<Waypoint[]>([]);
const [editMode, setEditMode] = useState<'none' | 'add' | 'move' | 'remove'>('none');
```

### Click Handling
```tsx
const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
  const svg = e.currentTarget;
  const rect = svg.getBoundingClientRect();
  const x = e.clientX - rect.left;  // Convert to SVG coordinates
  const y = e.clientY - rect.top;
  
  if (editMode === 'add') {
    setCustomWaypoints([...customWaypoints, { x, y, id: nextId++ }]);
  }
};
```

### Drag Implementation
```tsx
const [isDragging, setIsDragging] = useState(false);
const [selectedWaypoint, setSelectedWaypoint] = useState<number | null>(null);

// On waypoint mousedown
setSelectedWaypoint(waypointId);
setIsDragging(true);

// On SVG mousemove
if (isDragging && selectedWaypoint !== null) {
  setCustomWaypoints(waypoints.map(w => 
    w.id === selectedWaypoint ? { ...w, x: newX, y: newY } : w
  ));
}

// On mouseup/mouseleave
setIsDragging(false);
setSelectedWaypoint(null);
```

## Grid Overlay

### SVG Pattern for Infinite Grid
```tsx
<svg className="absolute inset-0 w-full h-full">
  <defs>
    <pattern id="grid" width="12.5" height="12.5" patternUnits="userSpaceOnUse">
      <path d="M 12.5 0 L 0 0 0 12.5" fill="none" stroke="rgba(156, 163, 175, 0.3)" strokeWidth="0.5"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#grid)" />
</svg>
```

### Path Visualization
```tsx
<polyline
  points={waypoints.map(w => `${w.x},${w.y}`).join(' ')}
  fill="none"
  stroke="rgb(16, 185, 129)"
  strokeWidth="3"
/>
```

## Z-Index Hierarchy
```
z-[60]: Control buttons (always clickable)
z-50: Debug overlay + grid
z-20: Animated bee
z-19: Static bee (final position)
z-10: Header
z-0: Background
```

## Performance Optimizations

1. **Use `pointer-events-none`** on non-interactive overlays
2. **`translate` over `left/top`** - GPU accelerated
3. **`fixed` positioning** for animated element - avoids layout recalc
4. **Single ref measurement** - don't recalculate on every render

## Edge Cases

- **Resize during animation:** Path endpoints become incorrect. Add resize listener to cancel animation if needed.
- **Initial position not ready:** Disable animation until `initialPosition !== null`
- **Debug mode z-index conflicts:** Ensure controls have higher z-index than overlay

## Exportable Path Format (Future)

Normalize waypoints to 0-1 scale for resolution independence:
```tsx
const normalized = waypoints.map(w => ({
  x: w.x / window.innerWidth,
  y: w.y / window.innerHeight,
}));

// Convert back at runtime
const absolute = normalized.map(w => ({
  x: w.x * window.innerWidth,
  y: w.y * window.innerHeight,
}));
```

## 🔧 The Normalized Control Point Fix

### Problem: Curve Replotting
When resizing windows and clicking replot, curves would distort because:
- ❌ Control points stored in absolute pixels only
- ❌ Interpolated curve points regenerated from wrong control points
- ❌ Lost curve shape after resize

### Solution: Dual Storage System
```tsx
// Store BOTH absolute and normalized control points
const [customControlPoints, setCustomControlPoints] = useState<Map<string, ControlPointPair>>(new Map());
const [normalizedControlPoints, setNormalizedControlPoints] = useState<Map<string, NormalizedControlPointPair>>(new Map());

// Replot using normalized data (THE FIX!)
const replotFromNormalized = () => {
  // Replot control points from normalized data
  const newControlPoints = new Map<string, ControlPointPair>();
  for (const [key, normalizedPair] of normalizedControlPoints) {
    newControlPoints.set(key, {
      cp1: denormalizePosition(normalizedPair.cp1),
      cp2: denormalizePosition(normalizedPair.cp2)
    });
  }
  setCustomControlPoints(newControlPoints);
};
```

### Result
- ✅ Perfect curve preservation across any screen size/ratio
- ✅ Maintains exact curve shape even with extreme stretching
- ✅ Control point adjustments persist through resize cycles

## 🆓 Independent Waypoint System

### Design Philosophy
Waypoints are completely independent - no automatic origin connections:

```tsx
const getEffectiveWaypoints = () => {
  // Return waypoints as-is, no automatic origin connection
  return customWaypoints; // INDEPENDENT!
};
```

### Benefits
- **🎨 Creative Freedom**: Create any path shape - open paths, spirals, artistic curves
- **🎯 Precise Control**: Waypoints go exactly where you place them
- **🔄 Optional Loops**: Manual connection via origin snapping when desired
- **📍 True WYSIWYG**: Animation follows exact waypoint path

### Origin Snapping
- **Manual Connection**: Drag waypoints near origin (15px range) to snap
- **Visual Feedback**: Green pulsing circle shows snap zone
- **User Choice**: Connect only when intentionally desired

## 🎯 Dynamic Origin Detection System

### Architecture Overview
The origin detection system uses React Context to allow any component to register itself as an origin target:

```tsx
// OriginContext.tsx - Core system
export const OriginProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const originsRef = useRef<Map<string, HTMLElement>>(new Map());
  
  const registerOrigin = (element: HTMLElement, id: string) => {
    originsRef.current.set(id, element);
  };
  
  const getOriginCenter = (id?: string) => {
    const element = originsRef.current.get(id);
    const rect = element.getBoundingClientRect();
    return {
      x: (rect.left + rect.width / 2) / window.innerWidth,   // Normalized
      y: (rect.top + rect.height / 2) / window.innerHeight   // Normalized
    };
  };
};
```

### Component Registration
Any component can register itself as an origin target:

```tsx
// In LandingView.tsx
const logoOriginRef = useOriginTarget('final-logo');

<div ref={logoOriginRef}>
  <img src={BeeLogo} alt="Logo" />
</div>
```

### Dynamic Detection
FindOriginButton automatically discovers registered origins:

```tsx
// In FindOriginButton.tsx
const { getOriginCenter, getAllOrigins } = useOriginDetection();

const handleFindOrigin = () => {
  const origins = getAllOrigins();
  const bounds = targetOrigin.element.getBoundingClientRect();
  // Dynamic crosshair positioning based on real element bounds
};
```

### Benefits
- **🎯 No Hardcoding**: Works with any element size/position
- **🔄 Responsive**: Adapts to CSS changes automatically  
- **🎨 Reusable**: Same system works across different pages/components
- **📍 Accurate**: Uses real DOM measurements via getBoundingClientRect()
- **🛡️ Error Handling**: Graceful fallbacks when no origins registered

### Usage Pattern
```tsx
// 1. Wrap page with OriginProvider
<OriginProvider>
  <YourPage />
</OriginProvider>

// 2. Register origin targets in components
const logoRef = useOriginTarget('my-logo');
<div ref={logoRef}>Logo</div>

// 3. Use FindOriginButton anywhere
<FindOriginButton />
```

## 🎨 Bézier Curve System

### Interactive Control Points
```tsx
// Figma-style control point dragging
const updateControlPoint = (segmentKey: string, controlPoint: 'cp1' | 'cp2', newPosition: Position) => {
  // Update absolute control points
  setCustomControlPoints(/* absolute position */);
  
  // Update normalized control points (for replotting)
  const normalized = normalizePosition(newPosition);
  setNormalizedControlPoints(/* normalized position */);
};
```

### Curve Generation
- **Auto-generated**: Control points at 1/3 distance along segments
- **User-adjustable**: Drag gray dots to reshape curves
- **Real-time updates**: Curves redraw as you drag
- **Persistent storage**: Custom adjustments survive resize/replot

## 📊 State Management Architecture

### usePathState Hook
```tsx
const {
  customWaypoints,           // Absolute pixel coordinates
  normalizedWaypoints,       // 0-1 scale coordinates
  customControlPoints,       // Absolute control points
  normalizedControlPoints,   // 0-1 scale control points
  replotFromNormalized,      // THE KEY FIX FUNCTION
  addWaypoint,
  updateControlPoint,
  // ... other actions
} = usePathState();
```

### usePathGeneration Hook
```tsx
const {
  animationPath,      // Final animation coordinates
  animationTiming,    // Timing array for Framer Motion
  directionArrows,    // Arrow positions and angles
  svgPathString,      // SVG path for visualization
  pathStats          // Path analytics
} = usePathGeneration({
  waypoints,
  customControlPoints,
  useSmoothPath,
  showDirectionArrows
});
```

## 🎛️ UI Control System

### Edit Modes
```tsx
type EditMode = 'none' | 'add' | 'move' | 'remove' | 'center' | 'setOrigin';
```

### Control Layout (2x3 Grid)
```
[🎯 Custom] [📋 Export]
[📥 Import] [🔄 Replot]  
[🌊 Smooth] [➡️ Show Dir]
```

### Visual Elements
- **🔵 Blue waypoints**: User-placed points (independent positioning)
- **⚪ Gray control points**: Draggable curve handles (Bézier controls)
- **🟢 Green path**: Animation route (follows exact waypoints)
- **🔺 Green arrows**: Direction indicators along path
- **📍 Pink origin**: Optional reference point with snapping
- **🎯 Yellow crosshair**: True center indicator
- **🟢 Snap zone**: Pulsing green circle when dragging near origin

## 📁 TypeScript Interfaces

### Core Types (beeFlight.types.ts)
```tsx
interface Position {
  x: number;
  y: number;
}

interface Waypoint extends Position {
  id: number;
}

interface NormalizedWaypoint {
  x: number; // 0-1 scale
  y: number; // 0-1 scale  
  id: number;
}

interface ControlPointPair {
  cp1: Position;
  cp2: Position;
}

interface NormalizedControlPointPair {
  cp1: Position; // 0-1 scale
  cp2: Position; // 0-1 scale
}

interface CurveSegment {
  start: Waypoint;
  end: Waypoint;
  controlPoint1: Position;
  controlPoint2: Position;
  isSmooth: boolean;
}

interface DirectionArrow {
  position: Position;
  angle: number; // in degrees
}

interface ExportablePathData {
  waypoints: NormalizedWaypoint[];
  controlPoints: Map<string, NormalizedControlPointPair>;
  customOrigin: Position | null;
  useSmoothPath: boolean;
  metadata: {
    version: string;
    created: Date;
    totalPoints: number;
  };
}
```

## Critical Dependencies
- `framer-motion`: Animation engine
- `react`: State + refs + effects
- `tailwindcss`: Styling (no custom CSS needed)

## 🚀 Future Development Notes

### When Returning to This Project
1. **Main entry point**: `TestBeeFlight.tsx` - Core animation component
2. **State management**: `hooks/usePathState.ts` - Contains the replot fix
3. **Path calculations**: `hooks/usePathGeneration.ts` - Math & curve generation
4. **Origin system**: `OriginContext.tsx` - Dynamic origin detection
5. **Origin UI**: `FindOriginButton.tsx` - Reusable origin detection component
6. **Type definitions**: `beeFlight.types.ts` - All interfaces
7. **Utilities**: `beeFlight.utils.ts` - Pure functions

### Key Architectural Decisions
- **Dual storage pattern**: Always store both absolute + normalized coordinates
- **Hook-based state**: Separated concerns for maintainability  
- **Context-based origin detection**: Components register themselves dynamically
- **Immutable updates**: All state changes create new objects/maps
- **Type safety**: Comprehensive TypeScript coverage

### Performance Considerations
- **Memoized calculations**: `useMemo` for expensive path generation
- **Efficient re-renders**: Only update when dependencies change
- **GPU acceleration**: Use `transform` properties for animations
- **Event delegation**: Single SVG handles all mouse events

## ⚠️ Don't Do This
❌ Mix viewport units in waypoints (causes teleporting)
❌ Modify control points without updating normalized storage
❌ Force automatic origin connections (breaks creative freedom)
❌ Hardcode origin positions (use dynamic detection instead)
❌ Use `localStorage` (not supported in Claude artifacts)  
❌ Forget to set `pointer-events-none` on overlays
❌ Use `absolute` positioning for animated element (use `fixed`)
❌ Modify waypoints during animation (causes jank)
❌ Skip the dual storage system (breaks replotting)

## ✅ Best Practices
✅ Always update both absolute and normalized coordinates together
✅ Use the `replotFromNormalized()` function for window resize handling
✅ Let waypoints be independent - no forced origin connections
✅ Use origin snapping for manual connections when desired
✅ Register components as origin targets with `useOriginTarget(id)`
✅ Wrap pages with `<OriginProvider>` for origin detection
✅ Export complete data (waypoints + control points + settings)
✅ Leverage TypeScript interfaces for type safety
✅ Keep mathematical functions pure (no side effects)
✅ Use hooks for state management separation
✅ Test curve replotting across different screen sizes
✅ Maintain backwards compatibility with existing path exports
```
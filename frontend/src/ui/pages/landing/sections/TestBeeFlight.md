```markdown
# Framer Motion Logo Flight Animation - Technical Specification

## Core Concept
Animate element from initial DOM position → path → back to exact starting position. Uses getBoundingClientRect() to capture real pixel coordinates, eliminating unit conversion issues.

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

## TypeScript Interfaces
```tsx
interface Position {
  x: number;
  y: number;
}

interface Waypoint extends Position {
  id: number;
}

type EditMode = 'none' | 'add' | 'move' | 'remove';
```

## Critical Dependencies
- `framer-motion`: Animation engine
- `react`: State + refs + effects
- `tailwindcss`: Styling (no custom CSS needed)

## Don't Do This
❌ Mix viewport units in waypoints (causes teleporting)
❌ Use `localStorage` (not supported in Claude artifacts)
❌ Forget to set `pointer-events-none` on overlays
❌ Use `absolute` positioning for animated element (use `fixed`)
❌ Modify waypoints during animation (causes jank)
```
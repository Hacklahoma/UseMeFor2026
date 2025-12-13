import React, { useEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";

gsap.registerPlugin(Draggable);

export type Sticker = {
  id: string;
  src: string;
  x: number;   // percent
  y: number;   // percent
  rotate?: number;
  scale?: number;
  onClick?: () => void;
  // Hover animation properties
  hoverMoveX?: number;   // pixels to move on hover
  hoverMoveY?: number;   // pixels to move on hover
  hoverRotate?: number;  // additional rotation on hover (degrees)
  hoverScale?: number;   // scale multiplier on hover
  hoverSpin?: boolean;   // continuous rotation animation on hover
};

type FlipSpreadProps = {
  leftSrc: string;
  rightSrc: string;

  nextRightSrc?: string;
  prevLeftSrc?: string;

  leftStickers?: Sticker[];
  rightStickers?: Sticker[];
  nextRightStickers?: Sticker[];
  prevLeftStickers?: Sticker[];

  onAdvance: () => void;
  onBack: () => void;
  onFinish: () => void;
  onCloseFront: () => void;

  disabled?: boolean;
};

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

const FlipSpread: React.FC<FlipSpreadProps> = ({
  leftSrc,
  rightSrc,
  nextRightSrc,
  prevLeftSrc,
  leftStickers = [],
  rightStickers = [],
  nextRightStickers = [],

  onAdvance,
  onBack,
  onFinish,
  onCloseFront,
  disabled = false,
}) => {
  const fwdRef = useRef<HTMLDivElement | null>(null);
  const backRef = useRef<HTMLDivElement | null>(null);

  const fwdTl = useRef<gsap.core.Tween | null>(null);
  const backTl = useRef<gsap.core.Tween | null>(null);
  const fwdDragRef = useRef<Draggable | null>(null);
  const backDragRef = useRef<Draggable | null>(null);

  const fwdProxy = useMemo(() => document.createElement("div"), []);
  const backProxy = useMemo(() => document.createElement("div"), []);

  const locked = useRef(false);

  const canGoNext = !!nextRightSrc;
  const canGoBack = !!prevLeftSrc;

  /* ---------------- FORWARD FLIP ---------------- */
  useEffect(() => {
    const el = fwdRef.current;
    if (!el) return;

    gsap.set(el, {
      rotationY: 0,
      transformOrigin: "left center",
      transformStyle: "preserve-3d",
      force3D: true,
    });

    fwdTl.current = gsap.to(el, {
      rotationY: -180,
      duration: 1.2,
      ease: "expo.out",
      paused: true,
    });

    fwdDragRef.current?.kill();
    fwdDragRef.current = Draggable.create(fwdProxy, {
      trigger: el,
      type: "x",
      bounds: { minX: -1, maxX: 0 },

      onPress() {
        if (disabled || locked.current) return;
        const w = el.offsetWidth || 300;
        (this as any).applyBounds({ minX: -w, maxX: 0 });
        gsap.set(fwdProxy, { x: -w * (fwdTl.current?.progress() || 0) });
      },

      onDrag() {
        if (disabled || locked.current) return;
        const w = el.offsetWidth || 300;
        fwdTl.current?.progress(clamp01(-this.x / w));
      },

      onRelease() {
        if (disabled || locked.current) return;
        const commit = (fwdTl.current?.progress() || 0) > 0.4;

        locked.current = true;
        gsap.to(fwdTl.current!, {
          progress: commit ? 1 : 0,
          duration: 0.6,
          ease: "expo.out",
          onComplete: () => {
            locked.current = false;
            if (!commit) return;
            if (!canGoNext) onFinish();
            else onAdvance();
          },
        });
      },
    })[0];

    return () => {
      fwdTl.current?.kill();
      fwdDragRef.current?.kill();
    };
  }, [disabled, canGoNext, onAdvance, onFinish, fwdProxy]);

  /* ---------------- BACKWARD FLIP ---------------- */
  useEffect(() => {
    const el = backRef.current;
    if (!el) return;

    gsap.set(el, {
      rotationY: 0,
      transformOrigin: "right center",
      transformStyle: "preserve-3d",
      force3D: true,
    });

    backTl.current = gsap.to(el, {
      rotationY: 180,
      duration: 1.2,
      ease: "expo.out",
      paused: true,
    });

    backDragRef.current?.kill();
    backDragRef.current = Draggable.create(backProxy, {
      trigger: el,
      type: "x",

      onPress() {
        if (disabled || locked.current || !canGoBack) return;
        const w = el.offsetWidth || 300;
        (this as any).applyBounds({ minX: 0, maxX: w });
        gsap.set(backProxy, { x: w * (backTl.current?.progress() || 0) });
      },

      onDrag() {
        if (disabled || locked.current || !canGoBack) return;
        const w = el.offsetWidth || 300;
        backTl.current?.progress(clamp01(this.x / w));
      },

      onRelease() {
        if (disabled || locked.current || !canGoBack) return;
        const commit = (backTl.current?.progress() || 0) > 0.4;

        locked.current = true;
        gsap.to(backTl.current!, {
          progress: commit ? 1 : 0,
          duration: 0.6,
          ease: "expo.out",
          onComplete: () => {
            locked.current = false;
            if (commit) onBack();
          },
        });
      },
    })[0];

    return () => {
      backTl.current?.kill();
      backDragRef.current?.kill();
    };
  }, [disabled, canGoBack, onBack, backProxy]);

  /* ---------------- STICKER RENDERER ---------------- */
  const StickerItem = ({ sticker }: { sticker: Sticker }) => {
    const imgRef = useRef<HTMLImageElement | null>(null);
    const spinTweenRef = useRef<gsap.core.Tween | null>(null);
    const hasHover = sticker.hoverMoveX !== undefined || sticker.hoverMoveY !== undefined || 
                    sticker.hoverRotate !== undefined || sticker.hoverScale !== undefined || 
                    sticker.hoverSpin === true;
    
    const baseTransform = `
      translate(-50%, -50%)
      rotate(${sticker.rotate ?? 0}deg)
      scale(${sticker.scale ?? 1})
    `;

    return (
      <img
        ref={imgRef}
        src={sticker.src}
        draggable={false}
        onClick={(e) => {
          e.stopPropagation();
          sticker.onClick?.();
        }}
        onMouseEnter={() => {
          if (!hasHover || !imgRef.current) return;
          const target = imgRef.current;
          const moveX = sticker.hoverMoveX ?? 0;
          const moveY = sticker.hoverMoveY ?? 0;
          const baseRotation = sticker.rotate ?? 0;
          const rotate = baseRotation + (sticker.hoverRotate ?? 0);
          const scale = (sticker.scale ?? 1) * (sticker.hoverScale ?? 1);
          
          // Kill any existing spin animation
          spinTweenRef.current?.kill();
          
          if (sticker.hoverSpin) {
            // Continuous spin animation
            gsap.to(target, {
              x: moveX,
              y: moveY,
              scale: scale,
              duration: 0.5,
              ease: "power2.out",
            });
            
            // Start continuous rotation from base rotation
            spinTweenRef.current = gsap.to(target, {
              rotation: baseRotation + 360,
              duration: 2,
              ease: "none",
              repeat: -1,
            });
          } else {
            // Regular hover animation
            gsap.to(target, {
              x: moveX,
              y: moveY,
              rotation: rotate,
              scale: scale,
              duration: 0.3,
              ease: "power2.out",
            });
          }
        }}
        onMouseLeave={() => {
          if (!hasHover || !imgRef.current) return;
          const target = imgRef.current;
          
          // Kill spin animation
          spinTweenRef.current?.kill();
          spinTweenRef.current = null;
          
          gsap.to(target, {
            x: 0,
            y: 0,
            rotation: sticker.rotate ?? 0,
            scale: sticker.scale ?? 1,
            duration: 0.3,
            ease: "power2.out",
          });
        }}
        style={{
          position: "absolute",
          left: `${sticker.x}%`,
          top: `${sticker.y}%`,
          transform: baseTransform,
          transformOrigin: "center center",
          cursor: sticker.onClick ? "pointer" : hasHover ? "pointer" : "default",
          filter: "drop-shadow(0 6px 10px rgba(0,0,0,.25))",
          willChange: "transform",
        }}
      />
    );
  };

  const Stickers = ({ items }: { items: Sticker[] }) => (
    <>
      {items.map((s) => (
        <StickerItem key={s.id} sticker={s} />
      ))}
    </>
  );

  return (
    <div className="relative w-full h-full" style={{ transformStyle: "preserve-3d" }}>
      {/* LEFT STATIC */}
      <div className="absolute left-0 top-0 w-1/2 h-full overflow-hidden rounded-l-xl">
        <img src={leftSrc} className="w-full h-full object-cover" draggable={false} />
        <Stickers items={leftStickers} />
        {/* Left side shadow gradient towards spine */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,0.08) 90%, rgba(0,0,0,0.4) 100%)",
            zIndex: 1,
          }}
        />
      </div>

      {/* RIGHT UNDERLAY */}
      <div className="absolute left-1/2 top-0 w-1/2 h-full overflow-hidden rounded-r-xl">
        <img src={nextRightSrc ?? rightSrc} className="w-full h-full object-cover" draggable={false} />
        <Stickers items={nextRightStickers.length ? nextRightStickers : rightStickers} />
        {/* Right side shadow gradient towards spine */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(to left, rgba(0,0,0,0) 0%, rgba(0,0,0,0.08) 90%, rgba(0,0,0,0.4) 100%)",
            zIndex: 1,
          }}
        />
      </div>

      {/* CENTER SPINE - Creates 3D binding effect */}
      <div
        className="absolute inset-y-0 left-1/2 pointer-events-none"
        style={{
          width: "2px",
          transform: "translateX(-50%)",
          zIndex: 15,
          background: "linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.4) 100%)",
          boxShadow: `
            -2px 0 4px rgba(0,0,0,0.3),
            2px 0 4px rgba(0,0,0,0.3),
            inset -1px 0 2px rgba(255,255,255,0.1),
            inset 1px 0 2px rgba(0,0,0,0.2)
          `,
        }}
      />
      
      {/* Center crease highlight (subtle) */}
      <div
        className="absolute inset-y-0 left-1/2 pointer-events-none"
        style={{
          width: "1px",
          transform: "translateX(-50%)",
          zIndex: 16,
          background: "rgba(255,255,255,0.08)",
        }}
      />

      {/* BACK TURN */}
      {canGoBack && (
        <div
          ref={backRef}
          className="absolute left-0 top-0 w-1/2 h-full"
          style={{ zIndex: 20 }}
        >
          <div className="absolute inset-0 overflow-hidden rounded-l-xl" style={{ transformStyle: "preserve-3d" }}>
            <img src={leftSrc} className="absolute inset-0 w-full h-full object-cover" />
            <Stickers items={leftStickers} />
            {/* Shadow gradient for turning left page */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,0.15) 95%, rgba(0,0,0,0.3) 100%)",
                zIndex: 1,
              }}
            />
          </div>
        </div>
      )}

      {/* FORWARD TURN */}
      <div
        ref={fwdRef}
        className="absolute left-1/2 top-0 w-1/2 h-full"
        style={{ zIndex: 30 }}
      >
        <div className="absolute inset-0 overflow-hidden rounded-r-xl" style={{ transformStyle: "preserve-3d" }}>
          <img src={rightSrc} className="absolute inset-0 w-full h-full object-cover" />
          <Stickers items={rightStickers} />
          {/* Shadow gradient for turning right page */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(to left, rgba(0,0,0,0) 0%, rgba(0,0,0,0.15) 95%, rgba(0,0,0,0.3) 100%)", // Change percentage to fix the shadow
              zIndex: 1,
            }}
          />
        </div>
      </div>

      {/* CLICK ZONES */}
      <div className="absolute left-0 top-0 w-1/5 h-full z-50" onClick={() => !disabled && (canGoBack ? onBack() : onCloseFront())} />
      <div className="absolute right-0 top-0 w-1/5 h-full z-50" onClick={() => !disabled && (canGoNext ? onAdvance() : onFinish())} />
    </div>
  );
};

export default FlipSpread;

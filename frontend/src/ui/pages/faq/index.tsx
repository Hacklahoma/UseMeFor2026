import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Draggable from "gsap/Draggable"; // ⬅️ default import is safer

import CoverFront from "./section/CoverFront";
import CoverBack from "./section/CoverBack";

gsap.registerPlugin(ScrollTrigger, Draggable);

const FaqPages: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const bookRef = useRef<HTMLDivElement | null>(null);
  const frontCoverRef = useRef<HTMLDivElement | null>(null);
  const backCoverRef = useRef<HTMLDivElement | null>(null);
  const flipTl = useRef<gsap.core.Timeline | null>(null);
  const dragInstance = useRef<Draggable | null>(null);

  useEffect(() => {
    if (!bookRef.current || !frontCoverRef.current || !backCoverRef.current) return;

    const MAX_DRAG = -300; // how far you can drag left

    // 3D transform base
    gsap.set(bookRef.current, {
      transformStyle: "preserve-3d",
    });

    // front cover
    gsap.set(frontCoverRef.current, {
      transformStyle: "preserve-3d",
      transformOrigin: "left center",
      backfaceVisibility: "hidden",
      rotationY: 0,
    });

    // back cover, hidden behind at start
    gsap.set(backCoverRef.current, {
      transformStyle: "preserve-3d",
      transformOrigin: "left center",
      backfaceVisibility: "hidden",
      rotationY: 180,
    });

    // timeline: 0 = front, 1 = back
    flipTl.current = gsap
      .timeline({ paused: true })
      .to(frontCoverRef.current, {
        rotationY: -180,
        duration: 1,
        ease: "power2.inOut",
      })
      .to(
        backCoverRef.current,
        {
          rotationY: 0,
          duration: 1,
          ease: "power2.inOut",
        },
        0 // in parallel
      );

    // ScrollTrigger drives flip
    const scrollTrigger = ScrollTrigger.create({
      trigger: containerRef.current ?? bookRef.current,
      start: "top center",
      end: "bottom center",
      scrub: 1,
      onUpdate: (self) => {
        flipTl.current?.progress(self.progress);
      },
    });

    // Draggable drives flip
    const [drag] = Draggable.create(bookRef.current, {
      type: "x",
      bounds: { minX: MAX_DRAG, maxX: 0 },
      onDrag() {
        const progress = gsap.utils.mapRange(0, MAX_DRAG, 0, 1, this.x);
        flipTl.current?.progress(gsap.utils.clamp(0, 1, progress));
      },
      onRelease() {
        const progress = gsap.utils.mapRange(0, MAX_DRAG, 0, 1, this.x);
        const snapTo = progress > 0.5 ? MAX_DRAG : 0;

        gsap.to(this, {
          x: snapTo,
          duration: 0.5,
          ease: "power2.out",
          onUpdate: () => {
            const p = gsap.utils.mapRange(0, MAX_DRAG, 0, 1, this.x);
            flipTl.current?.progress(gsap.utils.clamp(0, 1, p));
          },
        });
      },
    });

    dragInstance.current = drag;

    // cleanup
    return () => {
      flipTl.current?.kill();
      dragInstance.current?.kill();
      scrollTrigger?.kill();
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="min-h-screen flex items-center justify-center bg-[#121010] py-20"
      style={{
        perspective: "2000px",
        perspectiveOrigin: "center center",
      }}
    >
      {/* 3D book */}
      <div
        ref={bookRef}
        className="relative cursor-grab active:cursor-grabbing"
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        {/* front cover */}
        <div
          ref={frontCoverRef}
          className="relative"
          style={{
            transformStyle: "preserve-3d",
          }}
        >
          <CoverFront />
        </div>

        {/* back cover */}
        <div
          ref={backCoverRef}
          className="absolute top-0 left-0"
          style={{
            transformStyle: "preserve-3d",
            transform: "rotateY(180deg) translateZ(-1px)",
          }}
        >
          <CoverBack />
        </div>
      </div>
    </div>
  );
};

export default FaqPages;

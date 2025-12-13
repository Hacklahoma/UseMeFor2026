import React, { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";

import CoverFront from "./section/CoverFront";
import CoverBack from "./section/CoverBack";
import FlipSpread, { Sticker } from "./section/FlipSpread";

import InsideFrontCover from "../../common/assets/faq/cover_back.png";
import BrownPaper from "../../common/assets/faq/base_brownpaper.jpg";
import WhitePaper from "../../common/assets/faq/base_whitepaper.jpg";
import TexturedBrown from "../../common/assets/faq/base_texturedbrown.jpg";
import BrownPaper2 from "../../common/assets/faq/base_brownpaper.jpg";
import InsideBackCover from "../../common/assets/faq/inside_back_cover.png";


// Right One (index 0)page stickers
import HackQ from "../../common/assets/faq/hack_q.png";
import HackA from "../../common/assets/faq/hack_a.png";
import CostQ from "../../common/assets/faq/cost_q.png";
import CostA from "../../common/assets/faq/cost_a.png";
import Lightbulb from "../../common/assets/faq/lightbulb.png";
import Stars1 from "../../common/assets/faq/page1_stars.png";

//right page (index 1) stickers
import RightTwoAirplane from "../../common/assets/faq/rightp/right_2_plane.png";
import RightTwoSandwich from "../../common/assets/faq/rightp/right_2_sandwich.png";
import RightTwoCroissant from "../../common/assets/faq/rightp/right_2_croissiant.png";
import RightTwoExclam from "../../common/assets/faq/rightp/right_2_exclam.png";
import RightTwoQ from "../../common/assets/faq/rightp/right_2_q.png";
import RightTwoA from "../../common/assets/faq/rightp/right_2_a.png";
import RightTwoText from "../../common/assets/faq/rightp/right_2_texts.png";
//right page (index 2) stickers
import RightThreeQ from "../../common/assets/faq/rightp/right_3_q.png";
import RightThreeA from "../../common/assets/faq/rightp/right_3_a.png";
import RightThreeTicket from "../../common/assets/faq/rightp/right_3_ticket.png";
import RightThreeTicket2 from "../../common/assets/faq/rightp/right_3_ticket2.png";
import RightThreeTicket3 from "../../common/assets/faq/rightp/right_3_ticket3.png";
import RightThreeFish from "../../common/assets/faq/rightp/right_3_fish.png";

// right page (index 3) stickers
import RightFourQ from "../../common/assets/faq/rightp/right_4_q.png";
import RightFourA from "../../common/assets/faq/rightp/right_4_a.png";
import RightFourQ2 from "../../common/assets/faq/rightp/right_4_q2.png";
import RightFourA2 from "../../common/assets/faq/rightp/right_4_a2.png";
import RightFourFlower from "../../common/assets/faq/rightp/right_4_flower.png";
import RightFourPlant from "../../common/assets/faq/rightp/right_4_plant.png";
import RightFourSketch from "../../common/assets/faq/rightp/right_4_sketch.png";
import RightFourStar from "../../common/assets/faq/rightp/right_4_star.png";

// Left page (index 0)stickers
import LeftOnePhotoCard from "../../common/assets/faq/leftp/left_1_photocard.png";
import LeftOneHeart from "../../common/assets/faq/leftp/left_1_heart.png";
import LeftOneDate from "../../common/assets/faq/leftp/left_1_date.png";
import LeftOneStar from "../../common/assets/faq/leftp/left_1_star.png";

// Left page (index 1) stickers
import LeftTwoQ from "../../common/assets/faq/leftp/left_2_q.png";
import LeftTwoA from "../../common/assets/faq/leftp/left_2_a.png";
import LeftTwoFlowers from "../../common/assets/faq/leftp/left_2_flower.png";
import LeftTwoFlower2 from "../../common/assets/faq/leftp/left_2_flower.png";
import LeftTwoFlowerStem from "../../common/assets/faq/leftp/left_2_flowerstem.png";
import LeftTwoButterfly from "../../common/assets/faq/leftp/left_2_butterfly.png";
import LeftTwoStamp from "../../common/assets/faq/leftp/left_2_stamp.png";

// Left page (index 2) stickers
import LeftThreeQ from "../../common/assets/faq/leftp/left_3_q.png";
import LeftThreeA from "../../common/assets/faq/leftp/left_3_a.png";
import LeftThreeTicket from "../../common/assets/faq/leftp/left_3_ticket.png";
import LeftThreeStamp from "../../common/assets/faq/leftp/left_3_stamp.png";
import LeftThreeStar from "../../common/assets/faq/leftp/left_3_stars.png";
import LeftThreePriority from "../../common/assets/faq/leftp/left_3_priority.png";
import LeftThreePriorityA from "../../common/assets/faq/leftp/left_3_priorities_a.png";

// 

type Mode = "frontClosed" | "open" | "backClosed";

const FaqPages: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const bookRef = useRef<HTMLDivElement | null>(null);

  const frontCoverRef = useRef<HTMLDivElement | null>(null);

  // Spread container (2 pages wide)
  const spreadRef = useRef<HTMLDivElement | null>(null);

  // back cover underlay inside spread (right half)
  const backCoverUnderRef = useRef<HTMLDivElement | null>(null);

  // solo back cover (when closed to back)
  const backCoverSoloRef = useRef<HTMLDivElement | null>(null);

  const openFrontTl = useRef<gsap.core.Timeline | null>(null);
  const openBackTl = useRef<gsap.core.Timeline | null>(null);
  const closeTl = useRef<gsap.core.Timeline | null>(null);

  // History stacks for true backward navigation
  const history = useRef<string[]>([]);
  const [mode, setMode] = useState<Mode>("frontClosed");

  const rightPages = useMemo(
    () => [BrownPaper, WhitePaper, TexturedBrown, BrownPaper2, InsideBackCover],
    []
  );

  const [leftSrc, setLeftSrc] = useState<string>(InsideFrontCover);
  const [leftIndex, setLeftIndex] = useState<number>(-1); // -1 = inside front cover
  const leftIndexHistory = useRef<number[]>([]);

  const [rightIndex, setRightIndex] = useState<number>(0);

  const [popupImage, setPopupImage] = useState<string | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const popupContentRef = useRef<HTMLDivElement | null>(null);

  const rightSrc = rightPages[rightIndex];
  const nextRightSrc =
    rightIndex + 1 < rightPages.length ? rightPages[rightIndex + 1] : undefined;
  const prevLeftSrc = history.current.length
    ? history.current[history.current.length - 1]
    : undefined;



  const isOpen = mode === "open";
  const isBackClosed = mode === "backClosed";

  const coverWidth = () =>
    frontCoverRef.current?.getBoundingClientRect().width || 450;

  // ----------------------------
  // Right page stickers - customize based on rightIndex
  // ----------------------------
  const rightStickers: Sticker[] = useMemo(() => {
    if (rightIndex === 0) {
      return [
        {
          id: "cost-q",
          src: CostQ,
          x: 40, // %
          y: 70, // %
          rotate: 0,
          scale: .8,
          onClick: () => setPopupImage(CostA),
        },
        {
          id: "hack-q",
          src: HackQ,
          x: 62, // %
          y: 29, // %
          rotate: -15,
          scale: .68,
          onClick: () => setPopupImage(HackA),
        },
        {
          id: "lightbulb",
          src: Lightbulb,
          x: 74, // %
          y: 76, // %
          rotate: -10,
          scale: .50,
          hoverMoveX: -8,
          hoverMoveY: -5,
          hoverRotate: -10,
          hoverScale: 1,
        },
        {
          id: "stars",
          src: Stars1,
          x: 25, // %
          y: 19, // %
          rotate: -10,
          scale: .4,
        },
      ];
    }
    
    if (rightIndex === 1) {
      return [
        {
          id: "right-two-airplane",
          src: RightTwoAirplane,
          x: 40, // %
          y: 55, // %
          rotate: 10,
          scale: 1.0,
        },
        {
          id: "right-two-sandwich",
          src: RightTwoSandwich,
          x: 15, // %
          y: 25, // %
          rotate: -5,
          scale: 0.40,
          hoverMoveX: 5,
          hoverMoveY: -8,
          hoverRotate: 15,
          hoverScale: 1.15,
        },
        {
          id: "right-two-croissant",
          src: RightTwoCroissant,
          x: 42, // %
          y: 15, // %
          rotate: 10,
          scale: 0.40,
          hoverMoveX: -8,
          hoverMoveY: -5,
          hoverRotate: -10,
          hoverScale: 1.2,
        },
        {
           id: "right-two-q",
          src: RightTwoQ,
          x: 63, // %
          y: 80, // %
          rotate: 8,
          scale: 0.65,
          onClick: () => setPopupImage(RightTwoA),
        },
        {
         id: "right-two-exclam",
          src: RightTwoExclam,
          x: 33, // %
          y: 53, // %
          rotate: -10,
          scale: 0.3,
          hoverMoveX: -8,
          hoverMoveY: -5,
          hoverRotate: -10,
          hoverScale: 1,
        },
        {
          id: "right-two-text",
          src: RightTwoText,
          x: 32, // %
          y: 36, // %
          rotate: 0,
          scale: 0.43,
        },
      ];
    }
    if (rightIndex === 2) {
      return [
        {
          id: "right-three-q",
          src: RightThreeQ,
          x: 63, // %
          y: 80, // %
          rotate: -2,
          scale: 0.7,
          onClick: () => setPopupImage(RightThreeA),
        },
        {
          id: "right-three-ticket",
          src: RightThreeTicket,
          x: 50, // %
          y: 25, // %
          rotate: -5,
          scale: .9,
        },  
          {
            id: "right-three-ticket2",
            src: RightThreeTicket2,
            x: 17, // %
            y: 80, // %
            rotate: -5,
            scale: 0.50,
          },
          {
            id: "right-three-ticket3",
            src: RightThreeTicket3,
            x: 35, // %
            y: 54, // %
            rotate: -5,
            scale: 0.35,
          },
          {
            id: "right-three-fish",
            src: RightThreeFish,
            x: 65, // %
            y: 40, // %
            rotate: 0,
            scale: 0.6,
            hoverMoveX: -10,
            hoverMoveY: -20,
            hoverRotate: -20,
            hoverScale: 1,
          },
      ];
    }
    if (rightIndex === 3) {
      return [
        {
          id: "right-four-q",
          src: RightFourQ,
          x: 66, // %
          y: 20, // %
          rotate: 0,
          scale: 0.7,
          onClick: () => setPopupImage(RightFourA),
        },
        {
          id: "right-four-q2",
          src: RightFourQ2,
          x: 35, // %
          y: 75, // %
          rotate: -2,
          scale: 0.8,
          onClick: () => setPopupImage(RightFourA2),
        },
        {
          id: "right-four-flower",
          src: RightFourFlower,
          x: 33, // %
          y: 35, // %
          rotate: -2,
          scale: 0.37,
          hoverSpin: true,
        },
        
        {
          id: "right-four-plant",
          src: RightFourPlant,
          x: 63, // %
          y: 88, // %
          rotate: 0,
          scale: 0.8,
        },
        {
          id: "right-four-sketch",
          src: RightFourSketch,
          x: 83, // %
          y:40, // %
          rotate: -2,
          scale: 0.4,
        },
        {
          id: "right-four-star",
          src: RightFourStar,
          x: 2, // %
          y: 2, // %
          rotate: 0,
          scale: .5,
        },
      ];
    }
    return [];

  }, [rightIndex]);

  // Left page stickers - customize based on leftIndex
  const leftStickers: Sticker[] = useMemo(() => {
   
    if (leftIndex === 0 ) {
      return [
        {
          id: "left-one-photo-card",
          src: LeftOnePhotoCard,
          x: 40, // %
          y: 50, // %
          rotate: 10,
          scale: .9,
          onClick: () => setPopupImage(LeftOnePhotoCard),
          
        },
        {
          id: "left-one-heart",
          src: LeftOneHeart,
          x: 13, // %
          y: 87, // %
          rotate: 15,
          scale: .25,
        },
        {
          id: "left-one-date",
          src: LeftOneDate,
          x: 60, // %
          y: 87, // %
          rotate: 0,
          scale: .7,
        },
        {
          id: "left-one-star",
          src: LeftOneStar,
          x: 80, // %
          y: 20, // %
          rotate: 0,
          scale: .5,
        },
      ];
    }
    if (leftIndex === 1) {
      return [
        { 
          id: "left-two-flower-stem",
          src: LeftTwoFlowerStem,
          x: 42, // %
          y: 30, // %
          rotate: 0,
          scale: 0.8,
         
        },
        {
          id: "left-two-q",
          src: LeftTwoQ,
          x: 37, // %
          y: 70, // %
          rotate: 0,
          scale: 0.8,
          onClick: () => setPopupImage(LeftTwoA),
        },
        {
          id: "left-two-flowers",
          src: LeftTwoFlowers,
          x: 75, // %
          y: 82, // %
          rotate: 0,
          scale: 0.48,
          hoverSpin: true,
        },
        {
          id: "left-two-flower-2",
          src: LeftTwoFlower2,
          x: 85, // %
          y: 63, // %
          rotate: 0,
          scale: 0.2,
          hoverSpin: true,
        },
        {
          id: "left-two-butterfly",
          src: LeftTwoButterfly,
          x: 75, // %
          y: 20, // %
          rotate: 0,
          scale: 0.4,
          hoverMoveX: -8,
          hoverMoveY: -5,
          hoverRotate: -10,
          hoverScale: 1,
        },
        {
          id: "left-two-stamp",
          src: LeftTwoStamp,
          x: 20, // %
          y: 45, // %
          rotate: 0,
          scale: 0.38,
        
        },
      ];
    }
    if (leftIndex === 2) {
      return [
        {
          id: "left-three-q",
          src: LeftThreeQ,
          x: 49, // %
          y: 64, // %
          rotate: 0,
          scale: 1,
          onClick: () => setPopupImage(LeftThreeA),
        },
        {
          id: "left-three-stamp",
          src: LeftThreeStamp,
          x: 87, // %
          y: 15, // %
          rotate: 0,
          scale: 0.45,
        },
        {
          id: "left-three-star",
          src: LeftThreeStar,
          x: 65, // %
          y: 30, // %
          rotate: 0,
          scale: 0.5,
        },
        {
          id: "left-three-priority",
          src: LeftThreePriority,
          x: 20, // %
          y: 28, // %
          rotate: 0,
          scale: 0.7,
          onClick: () => setPopupImage(LeftThreePriorityA),
        },
        
        {
          id: "left-three-ticket",
          src: LeftThreeTicket,
          x: 20, // %
          y: 65, // %
          rotate: 0,
          scale: 0.38,
        },
      ];
    }
    return [];
  }, [leftIndex]);

  // The underlay (next right page) stickers (usually none)
  const nextRightStickers: Sticker[] = useMemo(() => [], []);

  // Prev-left stickers (for backward underface) (usually none)
  const prevLeftStickers: Sticker[] = useMemo(() => [], []);

  // ----------------------------
  // Page state actions
  // ----------------------------
  const advance = () => {
    if (!nextRightSrc) {
      closeToBackCover();
      return;
    }
  
    // save previous left state
    history.current.push(leftSrc);
    leftIndexHistory.current.push(leftIndex);
  
    // new left becomes current right (use current rightIndex BEFORE it increments)
    setLeftSrc(rightSrc);
    setLeftIndex(rightIndex);
  
    setRightIndex((i) => Math.min(i + 1, rightPages.length - 1));
  };
  
  const goBack = () => {
    if (rightIndex === 0) {
      closeToFrontCover();
      return;
    }
  
    const prev = history.current.pop();
    const prevIdx = leftIndexHistory.current.pop();
  
    setRightIndex((i) => Math.max(i - 1, 0));
  
    if (prev !== undefined) setLeftSrc(prev);
    if (prevIdx !== undefined) setLeftIndex(prevIdx);
  };
  

  // ----------------------------
  // Animations
  // ----------------------------
  const openFromFront = () => {
    if (mode !== "frontClosed") return;
    openFrontTl.current?.restart();
  };

  const openFromBack = () => {
    if (mode !== "backClosed") return;
    openBackTl.current?.restart();
  };

  const closeToBackCover = () => {
    const book = bookRef.current;
    const spread = spreadRef.current;
    const backUnder = backCoverUnderRef.current;
    if (!book || !spread) return;

    closeTl.current?.kill();
    closeTl.current = gsap.timeline({ defaults: { ease: "power3.inOut" } });

    closeTl.current
      .add(() => {
        gsap.set(spread, { pointerEvents: "none" });
      }, 0)
      .to(spread, { autoAlpha: 0, duration: 0.25 }, 0)
      .to(book, { x: 0, duration: 0.9 }, 0)
      .to(backUnder ?? {}, { autoAlpha: 0, duration: 0.2 }, 0.05)
      .add(() => {
        setMode("backClosed");
      }, 0.35);
  };

  const closeToFrontCover = () => {
    const cover = frontCoverRef.current;
    const book = bookRef.current;
    const spread = spreadRef.current;
    if (!cover || !book || !spread) return;

    closeTl.current?.kill();
    closeTl.current = gsap.timeline({ defaults: { ease: "power3.inOut" } });

    closeTl.current
      .add(() => {
        gsap.set(spread, { pointerEvents: "none" });
        gsap.set(cover, { pointerEvents: "auto" });
      }, 0)
      .to(spread, { autoAlpha: 0, duration: 0.25 }, 0)
      .to(book, { x: 0, duration: 0.9 }, 0)
      .to(cover, { rotationY: 0, duration: 0.9 }, 0)
      .add(() => {
        setMode("frontClosed");
      }, 0.35);
  };

  // ----------------------------
  // Popup
  // ----------------------------
  const closePopup = () => {
    if (!popupRef.current || !popupContentRef.current) {
      setPopupImage(null);
      return;
    }
    gsap.to(popupRef.current, {
      opacity: 0,
      duration: 0.2,
      ease: "power2.out",
      onComplete: () => setPopupImage(null),
    });
    gsap.to(popupContentRef.current, {
      scale: 0.9,
      opacity: 0,
      duration: 0.2,
      ease: "power2.out",
    });
  };

  useEffect(() => {
    if (popupImage && popupRef.current && popupContentRef.current) {
      gsap.fromTo(
        popupRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.2, ease: "power2.out" }
      );
      gsap.fromTo(
        popupContentRef.current,
        { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.7)" }
      );
    }
  }, [popupImage]);

  useEffect(() => {
    if (!popupImage) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePopup();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [popupImage]);
  useEffect(() => {
    if (popupImage) {
      // lock scroll
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;
  
      // prevent layout shift when scrollbar disappears
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
  
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;
  
      return () => {
        // restore scroll
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
      };
    }
  }, [popupImage]);
  
  // ----------------------------
  // Initial GSAP setup + timelines
  // ----------------------------
  useEffect(() => {
    const container = containerRef.current;
    const book = bookRef.current;
    const cover = frontCoverRef.current;
    const spread = spreadRef.current;
    const backUnder = backCoverUnderRef.current;

    if (!container || !book || !cover || !spread) return;

    gsap.set(container, { perspective: 3000, perspectiveOrigin: "center center" });
    gsap.set(book, { transformStyle: "preserve-3d", force3D: true, x: 0 });

    gsap.set(cover, {
      transformStyle: "preserve-3d",
      transformOrigin: "left center",
      backfaceVisibility: "hidden",
      force3D: true,
      rotationY: 0,
      z: 20,
    });

    gsap.set(spread, { autoAlpha: 0, pointerEvents: "none" });
    gsap.set(backUnder ?? {}, { autoAlpha: 0 });

    // --- open from front ---
    openFrontTl.current?.kill();
    openFrontTl.current = gsap
      .timeline({ paused: true, defaults: { ease: "power3.inOut" } })
      .add(() => {
        gsap.set(spread, { autoAlpha: 0, pointerEvents: "none" });
        gsap.set(backUnder ?? {}, { autoAlpha: 0 });
        gsap.set(book, { x: 0 });
        gsap.set(cover, { autoAlpha: 1, pointerEvents: "auto" });
      }, 0)
      .to(cover, { rotationY: -179.9, duration: 1.2 }, 0)
      .to(book, { x: coverWidth() / 2, duration: 1.2 }, 0)
      .add(() => setMode("open"), 0.12)
      .to(spread, { autoAlpha: 1, duration: 0.28, ease: "power2.out" }, 0.22)
      .to(backUnder ?? {}, { autoAlpha: 1, duration: 0.28, ease: "power2.out" }, 0.25)
      .add(() => {
        gsap.set(spread, { pointerEvents: "auto" });
        gsap.set(cover, { pointerEvents: "none" });
      }, 1.2);

    // --- open from back (hinge RIGHT) ---
    openBackTl.current?.kill();
    openBackTl.current = gsap
      .timeline({ paused: true, defaults: { ease: "power3.inOut" } })
      .add(() => {
        gsap.set(spread, { autoAlpha: 0, pointerEvents: "none" });
        gsap.set(backUnder ?? {}, { autoAlpha: 0 });
        gsap.set(book, { x: 0 });

        // keep front rotated away so it can't show
        gsap.set(cover, { rotationY: -179.9, autoAlpha: 1, pointerEvents: "none" });

        // ensure solo back cover is visible and ready
        gsap.set(backCoverSoloRef.current ?? {}, { autoAlpha: 1, rotationY: 0 });
      }, 0)
      .to(backCoverSoloRef.current ?? {}, { rotationY: 179.9, duration: 1.2 }, 0)
      .to(book, { x: coverWidth() / 2, duration: 1.2 }, 0)
      .add(() => setMode("open"), 0.12)
      .to(spread, { autoAlpha: 1, duration: 0.28, ease: "power2.out" }, 0.25)
      .to(backUnder ?? {}, { autoAlpha: 1, duration: 0.25, ease: "power2.out" }, 0.25)
      .add(() => {
        gsap.set(spread, { pointerEvents: "auto" });
      }, 1.2);

    return () => {
      openFrontTl.current?.kill();
      openBackTl.current?.kill();
      closeTl.current?.kill();
    };
  }, []);

  // cover click handler
  useEffect(() => {
    const cover = frontCoverRef.current;
    if (!cover) return;
    const onClick = () => openFromFront();
    cover.addEventListener("click", onClick);
    return () => cover.removeEventListener("click", onClick);
  }, [mode]);

  return (
    <div
      ref={containerRef}
      id="faq"
      className="min-h-screen flex items-center justify-center py-20 relative overflow-visible"
    >
      <div
        ref={bookRef}
        className="relative w-[85vw] max-w-[450px] aspect-[3/4] overflow-visible"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* FRONT COVER (hidden only when backClosed) */}
        <div
          ref={frontCoverRef}
          style={{
            transformStyle: "preserve-3d",
            transformOrigin: "left center",
            zIndex: 60,
            visibility: isBackClosed ? "hidden" : "visible",
            pointerEvents: isBackClosed ? "none" : "auto",
          }}
          title="Click to open"
        >
          <CoverFront />
        </div>

        {/* OPEN SPREAD */}
        <div
          ref={spreadRef}
          className="absolute inset-0 overflow-visible"
          style={{
            width: "200%",
            transform: "translateX(-50%)",
            transformStyle: "preserve-3d",
            opacity: 0,
            pointerEvents: "none",
            zIndex: 20,
            background: "transparent",
          }}
        >
          {/* BACK COVER UNDER RIGHT HALF */}
          <div
            ref={backCoverUnderRef}
            className="absolute top-0"
            style={{
              left: "50%",
              width: "50%",
              height: "100%",
              transformStyle: "preserve-3d",
              transform: "translateZ(-50px)",
              opacity: 0,
              pointerEvents: "none",
              zIndex: 0,
            }}
          >
            <CoverBack />
          </div>

          {/* FLIP SPREAD */}
          <div className="absolute inset-0" style={{ zIndex: 10 }}>
            <FlipSpread
              leftSrc={leftSrc}
              rightSrc={rightSrc}
              nextRightSrc={nextRightSrc}
              prevLeftSrc={prevLeftSrc}
              leftStickers={leftStickers}
              rightStickers={rightStickers}
              nextRightStickers={nextRightStickers}
              prevLeftStickers={prevLeftStickers}
              onAdvance={advance}
              onBack={goBack}
              onFinish={closeToBackCover}
              onCloseFront={closeToFrontCover}
              disabled={!isOpen}
            />
          </div>
        </div>

        {/* BACK CLOSED: show ONLY back cover; clicking opens from back at same page state */}
        {isBackClosed && (
          <div
            ref={backCoverSoloRef}
            className="absolute inset-0 cursor-pointer"
            style={{
              transformStyle: "preserve-3d",
              transformOrigin: "right center",
              zIndex: 80,
            }}
            onClick={openFromBack}
            title="Click to reopen from back"
          >
            <CoverBack />
          </div>
        )}
      </div>

      {/* POPUP MODAL */}
      {popupImage && (
        <div
          ref={popupRef}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={closePopup}
        >
          <div
            ref={popupContentRef}
            className="relative max-w-[90vw] max-h-[90vh] p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={popupImage}
              alt="Popup"
              className="max-w-full max-h-[90vh] object-contain drop-shadow-2xl rounded-lg"
              draggable={false}
            />
            <button
              onClick={closePopup}
              className="absolute top-2 right-2 w-10 h-10 flex items-center justify-center bg-white/90 hover:bg-white rounded-full text-2xl font-bold text-gray-800 shadow-lg transition-colors cursor-pointer"
              style={{ zIndex: 10000 }}
              aria-label="Close popup"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FaqPages;

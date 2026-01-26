import React, { useState, useEffect } from "react";
import * as motion from 'motion/react-client';
import MLHBanner2026 from "../../../common/assets/MLHBanner2026.png";
import Postcard from "../../../common/assets/Postcard.png";
import Mountain from "../../../common/assets/mountains.png";
import Header from "../components/Header";
import BeeLogo from "../../../common/assets/BeeLogo.png";

const LandingView: React.FC = () => {
  const [displayedText, setDisplayedText] = useState("");
  const [showElements, setShowElements] = useState(false);
  const [moveToFinal, setMoveToFinal] = useState(false);
  const [showFinalElements, setShowFinalElements] = useState(false);
  const fullText = "WE KINDLY INVITE YOU TO";

  // Countdown timer state
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Calculate countdown
  useEffect(() => {
    const targetDate = new Date('February 7, 2026 00:00:00').getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance > 0) {
        setCountdown({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      } else {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < fullText.length) {
        setDisplayedText(fullText.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(interval);
        // Show elements after typing finishes
        setTimeout(() => {
          setShowElements(true);
          // Start fade out after elements appear
          setTimeout(() => {
            setMoveToFinal(true);
            // Show final elements after fade out completes
            setTimeout(() => {
              setShowFinalElements(true);
            }, 700);
          }, 800);
        }, 800);
      }
    }, 60);

    return () => clearInterval(interval);
  }, []);

  return (
    // <div id="top" className="h-screen w-full min-w-[380px] bg-[#F5F5DC] relative overflow-hidden">
    <div
      id="top"
      className="relative min-h-[100svh] w-full min-w-[380px] overflow-hidden m-0"
    >
      {/* Uses global background from page wrapper */}

      {/* NEW: mountains bottom-right */}
      <img
        src={Mountain}
        alt="" // decorative
        aria-hidden
        className="pointer-events-none select-none
               absolute -bottom-12 -right-4
               w-[18rem] sm:w-[24rem] md:w-[30rem]
               opacity-85"
      />

      {/* Header - appears when final elements show */}
      <Header showFinalElements={showFinalElements} />

      {/* Centered content - fades out */}
      <div
        className={`min-h-[100svh] flex items-center justify-center transition-opacity duration-1000 ease-in-out ${
          moveToFinal ? "opacity-0" : "opacity-100"
        }`}
      >
        <div className="text-center px-6 py-16">
          {/* Bee logo - with placeholder */}
          <div className="mb-8 flex justify-center">
            {showElements ? (
              <img
                src={BeeLogo}
                alt="Hacklahoma Bee Logo"
                className="w-16 h-16 object-contain animate-fade-in"
              />
            ) : (
              <div className="w-16 h-16"></div>
            )}
          </div>

          {/* Invitation text */}
          <div className="mb-2">
            <h2 className="text-xl font-semibold text-[#575f49] mb-2">
              {displayedText}
            </h2>
          </div>

          {/* Hacklahoma title - with placeholder */}
          <div>
            {showElements ? (
              <h1
                className="text-6xl sm:text-4xl lg:text-8xl font-semibold text-[#575f49] font-serif animate-fade-in mt-2"
                style={{ transform: "scaleX(0.97)" }}
              >
                Hacklahoma
              </h1>
            ) : (
              <div className="text-5xl sm:text-4xl lg:text-7xl font-bold text-transparent">
                Hacklahoma
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MLH Banner - top right, extends past header */}
      <div
        className={`fixed top-0 right-7 z-[60] transition-opacity duration-1000 ease-in-out ${
          showFinalElements ? "opacity-100" : "opacity-0"
        }`}
      >
        <a
          href="https://mlh.io"
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <img
            src={MLHBanner2026}
            alt="MLH Banner 2026"
            className="h-32 w-auto object-contain hover:scale-105 transition-transform duration-300 origin-top"
          />
        </a>
      </div>

      {/* Bottom left content - fades in */}
      <div
        className={`absolute bottom-8 left-0 lg:bottom-12 lg:left-12 transition-opacity duration-1000 ease-in-out ${
          showFinalElements ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="text-left">
          {/* Invitation text */}
          <div className="mb-2 ml-3">
            <h2 className="text-xl sm:text-2xl font-semibold text-[#575f49]">
              WE KINDLY INVITE YOU TO
            </h2>
          </div>

          {/* Hacklahoma title */}
          <h1
            className="text-4xl sm:text-5xl lg:text-8xl font-semibold text-[#575f49] font-serif"
            style={{ transform: "scaleX(0.95)" }}
          >
            Hacklahoma
          </h1>

          {/* Date and Countdown */}
          <div className="mt-2 ml-5 max-w-[90vw] sm:max-w-none">
            {/* Date label */}
            <p className="text-[#575f49] text-[10px] sm:text-xs md:text-sm font-medium mb-1.5">
              February 7, 2026 | University of Oklahoma
            </p>
            
            {/* Countdown timer */}
            <div className="flex gap-1.5 sm:gap-2 md:gap-3 text-[#575f49] flex-wrap">
              <div className="flex items-center gap-0.5 sm:gap-1">
                <span className="bg-[#575f49] text-[#F5F5DC] px-1 sm:px-1.5 md:px-2 py-0.5 sm:py-1 rounded font-mono font-semibold min-w-[1.5rem] sm:min-w-[2rem] md:min-w-[2.5rem] text-center text-[10px] sm:text-xs md:text-sm">
                  {String(countdown.days).padStart(2, '0')}
                </span>
                <span className="font-medium text-[10px] sm:text-xs md:text-sm">Days</span>
              </div>
              <div className="flex items-center gap-0.5 sm:gap-1">
                <span className="bg-[#575f49] text-[#F5F5DC] px-1 sm:px-1.5 md:px-2 py-0.5 sm:py-1 rounded font-mono font-semibold min-w-[1.5rem] sm:min-w-[2rem] md:min-w-[2.5rem] text-center text-[10px] sm:text-xs md:text-sm">
                  {String(countdown.hours).padStart(2, '0')}
                </span>
                <span className="font-medium text-[10px] sm:text-xs md:text-sm">Hours</span>
              </div>
              <div className="flex items-center gap-0.5 sm:gap-1">
                <span className="bg-[#575f49] text-[#F5F5DC] px-1 sm:px-1.5 md:px-2 py-0.5 sm:py-1 rounded font-mono font-semibold min-w-[1.5rem] sm:min-w-[2rem] md:min-w-[2.5rem] text-center text-[10px] sm:text-xs md:text-sm">
                  {String(countdown.minutes).padStart(2, '0')}
                </span>
                <span className="font-medium text-[10px] sm:text-xs md:text-sm">Minutes</span>
              </div>
              <div className="flex items-center gap-0.5 sm:gap-1">
                <span className="bg-[#575f49] text-[#F5F5DC] px-1 sm:px-1.5 md:px-2 py-0.5 sm:py-1 rounded font-mono font-semibold min-w-[1.5rem] sm:min-w-[2rem] md:min-w-[2.5rem] text-center text-[10px] sm:text-xs md:text-sm">
                  {String(countdown.seconds).padStart(2, '0')}
                </span>
                <span className="font-medium text-[10px] sm:text-xs md:text-sm">Seconds</span>
              </div>
            </div>
          </div>

          {/* Register Now button - under title on small screens (hide from md up) */}
          <div className="flex justify-center mt-6 md:hidden w-full px-4 relative left-0">
            <motion.a 
              id="register-button-mobile" 
              href="https://register.hacklahoma.org"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-20 py-3 border-2 border-[#575f49] bg-[#575f49] text-[#F5F5DC] font-medium hover:bg-transparent hover:text-[#575f49] transition-colors duration-300 rounded"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              Register Now
            </motion.a>
          </div>
        </div>
      </div>

      {/* Large postcard on the right side - fades in */}
      <div
        className={`absolute top-[36%] sm:top-[34%] md:top-[45%] lg:top-1/2 right-2 sm:right-6 md:right-8 -translate-y-1/2 transition-all duration-500 ease-out pointer-events-none ${
          showFinalElements ? "opacity-100" : "opacity-0"
        }`}
        style={{ willChange: 'transform, opacity' }}
      >
        <img
          src={Postcard}
          alt="Vintage postcard"
          className="w-[22 rem] sm:w-[26rem] md:w-[30rem] lg:w-[40rem] xl:w-[49rem] rotate-[-1deg] drop-shadow-2xl select-none pointer-events-none"
        />
      </div>

      {/* Register Now button - bottom right on tablets/desktop only */}
      <div
        className={`absolute bottom-4 right-4 md:bottom-8 md:right-12 hidden md:block transition-opacity duration-1000 ease-in-out ${
          showFinalElements ? "opacity-100" : "opacity-0"
        }`}
      >
        <a 
          id="register-button-desktop" 
          href="https://register.hacklahoma.org"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-6 py-3 border-2 border-[#575f49] text-[#575f49] font-medium hover:bg-[#575f49] hover:text-[#F5F5DC] transition-colors duration-300 rounded"
        >
          Register Now
        </a>
      </div>
    </div>
  );
};

export default LandingView;

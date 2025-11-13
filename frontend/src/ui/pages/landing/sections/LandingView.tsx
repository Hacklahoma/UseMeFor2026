import React, { useState, useEffect } from "react";
import BeeLogo from "../../../common/assets/BeeLogo.png";
import MLHBanner2026 from "../../../common/assets/MLHBanner2026.png";
import Postcard from "../../../common/assets/Postcard.png";
import MapOutline from "../../../common/assets/OK_Norman_706465_1936_625001.png";
import Mountain from "../../../common/assets/mountains.png";
const LandingView: React.FC = () => {
  const [displayedText, setDisplayedText] = useState("");
  const [showElements, setShowElements] = useState(false);
  const [moveToFinal, setMoveToFinal] = useState(false);
  const [showFinalElements, setShowFinalElements] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const fullText = "WE KINDLY INVITE YOU TO";

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
      <header
        className={`fixed top-0 left-0 h-20 w-full bg-gradient-to-b from-[#FFFCF5] via-[#FFFCF5] to-transparent z-50 transition-opacity duration-1000 ease-in-out ${
          showFinalElements ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="h-full flex items-center px-6 md:px-12 relative">
          {/* Bee icon on the left */}
          <a
            href="https://hacklahoma.org"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center"
            aria-label="Hacklahoma home"
          >
            <img
              src={BeeLogo}
              alt="Hacklahoma Bee Logo"
              className="w-11 h-11 object-contain"
            />
          </a>

          {/* Desktop Navigation - centered links */}
          <nav className="hidden md:flex items-center space-x-12 text-[#3D472C] absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <a href="#top" className="hover:text-[#2a3a1f] transition-colors">
              home
            </a>
            <a href="#about" className="hover:text-[#2a3a1f] transition-colors">
              about
            </a>
            <a href="#faq" className="hover:text-[#2a3a1f] transition-colors">
              faq
            </a>
            <a
              href="#sponsors"
              className="hover:text-[#2a3a1f] transition-colors"
            >
              sponsors
            </a>
            <a href="#login" className="hover:text-[#2a3a1f] transition-colors">
              login
            </a>
          </nav>

          {/* Mobile Menu Button - centered on small screens */}
          <button
            className="md:hidden flex flex-col space-y-1 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            <span
              className={`w-6 h-0.5 bg-[#3D472C] transition-all duration-300 ${
                isMobileMenuOpen ? "rotate-45 translate-y-1.5" : ""
              }`}
            ></span>
            <span
              className={`w-6 h-0.5 bg-[#3D472C] transition-all duration-300 ${
                isMobileMenuOpen ? "opacity-0" : ""
              }`}
            ></span>
            <span
              className={`w-6 h-0.5 bg-[#3D472C] transition-all duration-300 ${
                isMobileMenuOpen ? "-rotate-45 -translate-y-1.5" : ""
              }`}
            ></span>
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        <div
          className={`md:hidden absolute top-20 left-0 w-full bg-[#FFFCF5] transition-all duration-300 ${
            isMobileMenuOpen
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-4 pointer-events-none"
          }`}
        >
          <nav className="flex flex-col py-4 items-start pl-6 space-y-1">
            <a
              href="#top"
              className="px-0 py-1 text-[#3D472C] hover:bg-[#e8e8c7] transition-colors"
            >
              home
            </a>
            <a
              href="#about"
              className="px-0 py-1 text-[#3D472C] hover:bg-[#e8e8c7] transition-colors"
            >
              about
            </a>
            <a
              href="#faq"
              className="px-0 py-1 text-[#3D472C] hover:bg-[#e8e8c7] transition-colors"
            >
              faq
            </a>
            <a
              href="#sponsors"
              className="px-0 py-1 text-[#3D472C] hover:bg-[#e8e8c7] transition-colors"
            >
              sponsors
            </a>
            <a
              href="#login"
              className="px-0 py-1 text-[#3D472C] hover:bg-[#e8e8c7] transition-colors"
            >
              login
            </a>
          </nav>
        </div>
      </header>

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
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-[#575f49] mb-2">
              {displayedText}
            </h2>
          </div>

          {/* Hacklahoma title - with placeholder */}
          <div>
            {showElements ? (
              <h1
                className="text-6xl lg:text-8xl font-semibold text-[#575f49] font-serif animate-fade-in mt-2"
                style={{ transform: "scaleX(0.97)" }}
              >
                Hacklahoma
              </h1>
            ) : (
              <div className="text-5xl lg:text-7xl font-bold text-transparent">
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
          <div className="mb-2 ml-5">
            <h2 className="text-2xl font-semibold text-[#575f49]">
              WE KINDLY INVITE YOU TO
            </h2>
          </div>

          {/* Hacklahoma title */}
          <h1
            className="text-5xl lg:text-8xl font-semibold text-[#575f49] font-serif"
            style={{ transform: "scaleX(0.95)" }}
          >
            Hacklahoma
          </h1>

          {/* Register Now button - under title on small screens */}
          <div className="mt-6 min-[600px]:hidden">
            <button className="px-6 py-3 border-2 border-[#575f49] text-[#575f49] font-medium hover:bg-[#575f49] hover:text-[#F5F5DC] transition-colors duration-300 rounded">
              Register Now
            </button>
          </div>
        </div>
      </div>

      {/* Large postcard on the right side - fades in */}
      <div
        className={`absolute top-1/2 right-8 lg:right-12 -translate-y-1/2 transition-opacity duration-1000 ease-in-out ${
          showFinalElements ? "opacity-100" : "opacity-0"
        }`}
      >
        <img
          src={Postcard}
          alt="Vintage postcard"
          className="w-[32.5rem] md:w-[38rem] lg:w-[43rem] xl:w-[49rem] rotate-[-1deg] drop-shadow-2xl select-none pointer-events-none"
        />
      </div>

      {/* Register Now button - bottom right on larger screens */}
      <div
        className={`absolute bottom-8 right-8 lg:bottom-12 lg:right-12 hidden min-[600px]:block transition-opacity duration-1000 ease-in-out ${
          showFinalElements ? "opacity-100" : "opacity-0"
        }`}
      >
        <button className="px-6 py-3 border-2 border-[#575f49] text-[#575f49] font-medium hover:bg-[#575f49] hover:text-[#F5F5DC] transition-colors duration-300 rounded">
          Register Now
        </button>
      </div>
    </div>
  );
};

export default LandingView;

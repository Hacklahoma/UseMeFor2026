import React, { useState } from "react";
import * as motion from 'motion/react-client';
import { AnimatePresence, LayoutGroup, useMotionValue, useSpring } from 'motion/react';
import BeeLogo from "../../../common/assets/BeeLogo.png";
import Patch from "../../../common/assets/header/Patch.png";
import HeaderRope from "../../../common/assets/header/HeaderRope.png";
import MobileHeader from "../../../common/assets/header/MobileHeader.png";
import RegisterButton from "../../../common/assets/header/RegisterButton.png";
import { ReactComponent as TreeIcon } from "../../../common/assets/header/basicTree.svg";
import { ReactComponent as LineIcon } from "../../../common/assets/header/line.svg";

interface HeaderProps {
  showFinalElements: boolean;
}

interface NavLinkProps {
  href: string;
  label: string;
  activeSection: string;
  hoveredSection: string | null;
  onHover: (section: string) => void;
  onLeave: () => void;
}

const NavLink = React.forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ href, label, activeSection, hoveredSection, onHover, onLeave }, ref) => {
    const sectionId = href.replace('#', '');
    // Jump if this link matches the triangle position (hover takes priority, then active)
    const shouldJump = (hoveredSection || activeSection) === sectionId;

    return (
      <motion.a 
        ref={ref}
        href={href} 
        className="hover:text-[#2a3a1f] transition-colors h-20 flex items-center px-3 md:px-4 lg:px-6"
        onMouseEnter={() => onHover(sectionId)}
        onMouseLeave={onLeave}
        data-section={sectionId}
        layout
        animate={{
          y: shouldJump ? -4 : 0,
          scale: shouldJump ? 1.1 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20,
          mass: 0.8,
          layout: {
            type: "spring",
            stiffness: 300,
            damping: 20
          }
        }}
      >
        {label}
      </motion.a>
    );
  }
);

const Header: React.FC<HeaderProps> = ({ showFinalElements }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('top');
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const [isRegisterButtonVisible, setIsRegisterButtonVisible] = useState(true); // Start hidden
  const [triangleMoveReason, setTriangleMoveReason] = useState<'layout' | 'navigation'>('navigation');
  const navRef = React.useRef<HTMLElement>(null);
  const hoverTimeoutRef = React.useRef<number | null>(null);
  
  // Track when REGISTER visibility changes (causes layout shift)
  const prevRegisterVisible = React.useRef(isRegisterButtonVisible);
  React.useEffect(() => {
    if (prevRegisterVisible.current !== isRegisterButtonVisible) {
      setTriangleMoveReason('layout');
      prevRegisterVisible.current = isRegisterButtonVisible;
    }
  }, [isRegisterButtonVisible]);
  
  // Track when user navigates (scroll or hover)
  React.useEffect(() => {
    setTriangleMoveReason('navigation');
  }, [hoveredSection, activeSection]);
  
  // MotionValue to track triangle position
  const triangleXRaw = useMotionValue(0);
  // Create spring (always called per React rules)
  const triangleXSpring = useSpring(triangleXRaw, {
    stiffness: 300,
    damping: 20,
    mass: 0.4
  });
  
  // Choose which MotionValue to use: raw (instant) or spring (animated)
  const triangleX = triangleMoveReason === 'layout' ? triangleXRaw : triangleXSpring;
  
  // Debounced hover handlers to prevent triangle jumping on diamond hovers
  const handleNavHover = (sectionId: string) => {
    // Clear any pending timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    // Immediately set hover
    setHoveredSection(sectionId);
  };
  
  const handleNavLeave = () => {
    // Clear any pending timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    // Delay clearing hover to avoid jumping during brief gaps (like diamonds)
    hoverTimeoutRef.current = window.setTimeout(() => {
      setHoveredSection(null);
    }, 300); // 300ms delay
  };
  
  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);
  
  // Track ALL nav links' positions in real-time and animate triangle
  React.useEffect(() => {
    const updateTrianglePosition = () => {
      if (!navRef.current) return;
      
      const headerElement = document.querySelector('header');
      if (!headerElement) return;
      
      const headerRect = headerElement.getBoundingClientRect();
      const headerCenter = headerRect.left + headerRect.width / 2;
      
      // Find the active/hovered link
      const targetSection = hoveredSection || activeSection;
      const targetLink = navRef.current.querySelector(`[data-section="${targetSection}"]`);
      
      if (targetLink) {
        const linkRect = targetLink.getBoundingClientRect();
        const linkCenter = linkRect.left + linkRect.width / 2;
        const offsetFromCenter = linkCenter - headerCenter;
        
        // Update raw MotionValue (spring will smoothly follow)
        triangleXRaw.set(offsetFromCenter - 10);
      }
    };
    
    // Track continuously during animations
    let frameId: number;
    const trackLoop = () => {
      updateTrianglePosition();
      frameId = requestAnimationFrame(trackLoop);
    };
    
    trackLoop();
    
    return () => cancelAnimationFrame(frameId);
  }, [hoveredSection, activeSection, isRegisterButtonVisible, triangleXRaw]);

  // Track active section based on scroll position
  React.useEffect(() => {
    const handleScroll = () => {
      const sections = ['top', 'about', 'faq', 'sponsors', 'register'];
      const scrollPosition = window.scrollY + window.innerHeight / 2;
      
      // Hide nav REGISTER at very top of page (< 100px scrolled)
      if (window.scrollY < 100) {
        setIsRegisterButtonVisible(true); // Hide nav link
        return;
      }
      
      // Check if "Register Now" button is visible in viewport
      // Check both mobile and desktop buttons
      const mobileButton = document.getElementById('register-button-mobile');
      const desktopButton = document.getElementById('register-button-desktop');
      
      let buttonVisible = false;
      
      // Check mobile button (visible on screens < 600px)
      if (mobileButton && window.innerWidth < 600) {
        const rect = mobileButton.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(mobileButton.parentElement || mobileButton);
        const isActuallyVisible = computedStyle.opacity !== '0' && computedStyle.display !== 'none';
        buttonVisible = isActuallyVisible && rect.top < window.innerHeight && rect.bottom > 0;
      }
      
      // Check desktop button (visible on screens >= 600px)
      if (desktopButton && window.innerWidth >= 600) {
        const rect = desktopButton.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(desktopButton.parentElement || desktopButton);
        const isActuallyVisible = computedStyle.opacity !== '0' && computedStyle.display !== 'none';
        buttonVisible = isActuallyVisible && rect.top < window.innerHeight && rect.bottom > 0;
      }
      
      setIsRegisterButtonVisible(buttonVisible);
      
      // Check if sponsors section is in viewport
      const sponsorsEl = document.getElementById('sponsors');
      if (sponsorsEl) {
        const sponsorsRect = sponsorsEl.getBoundingClientRect();
        // Only activate sponsors if at least 40% of viewport shows sponsors
        const sponsorsVisible = Math.max(0, Math.min(window.innerHeight, sponsorsRect.bottom) - Math.max(0, sponsorsRect.top));
        if (sponsorsVisible > window.innerHeight * 0.4) {
          setActiveSection('sponsors');
          return;
        }
      }

      // Find the section that's currently in view (check from bottom to top)
      for (let i = sections.length - 1; i >= 0; i--) {
        const sectionId = sections[i];
        if (sectionId === 'sponsors') continue; // Already handled above
        
        const element = document.getElementById(sectionId);
        if (element) {
          const { offsetTop } = element;
          if (scrollPosition >= offsetTop) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 md:top-5 left-1/2 -translate-x-1/2 h-20 w-full z-[100] transition-opacity duration-1000 ease-in-out ${
        showFinalElements ? "opacity-100" : "opacity-0"
      }`}
    >
        <div 
        className="h-full flex items-center px-6 md:px-12 relative"
      >
        {/* Bee icon on the left */}
        <a
          href="https://hacklahoma.org"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center z-10"
          aria-label="Hacklahoma home"
        >
          <img
            src={BeeLogo}
            alt="Hacklahoma Bee Logo"
            className="w-11 h-11 object-contain"
          />
        </a>

        {/* Background for nav section only */}
        <div
          className="absolute left-1/2 -translate-x-1/2 h-20 rounded-2xl overflow-hidden hidden md:block transition-all duration-300 w-[70%] max-w-[600px] min-w-[550px] lg:max-w-[750px] lg:min-w-[750px] xl:max-w-[800px]"
          style={{
            backgroundImage: `url(${Patch})`,
            backgroundSize: 'auto 100%',
            backgroundPosition: 'center',
            backgroundRepeat: 'repeat',
            imageRendering: 'auto',
            filter: 'brightness(1.05)',
            pointerEvents: 'none'
          }}
        >
          {/* Rope pattern at the bottom of nav background */}
          <div 
            className="absolute bottom-0 left-0 w-full pointer-events-none"
            style={{ 
              height: '.75rem',
              backgroundImage: `url(${HeaderRope})`,
              backgroundRepeat: 'repeat-x',
              backgroundSize: 'auto 100%',
              backgroundPosition: 'center',
              filter: 'sepia(0.4) hue-rotate(2deg) saturate(0.8) brightness(0.85)'
            }}
          />
        </div>

        {/* Desktop Navigation - centered links */}
        <nav 
          ref={navRef}
          className="hidden md:flex md:text-lg lg:text-xl items-center text-[#3D472C] font-serif absolute left-1/2 -translate-x-1/2 top-0 h-20 select-none z-10"
        >
          <LayoutGroup>
            <NavLink 
              href="#top" 
              label="HOME" 
              activeSection={activeSection}
              hoveredSection={hoveredSection}
              onHover={handleNavHover}
              onLeave={handleNavLeave}
            />
            
            <motion.div 
              layout 
              transition={{ layout: { type: "spring", stiffness: 300, damping: 20 } }}
              className="flex items-center cursor-default"
            >
              <TreeIcon className="h-5 w-auto fill-[#3D472C]" />
            </motion.div>
            
            <NavLink 
              href="#about" 
              label="ABOUT" 
              activeSection={activeSection}
              hoveredSection={hoveredSection}
              onHover={handleNavHover}
              onLeave={handleNavLeave}
            />
            
            <motion.div 
              layout 
              transition={{ layout: { type: "spring", stiffness: 300, damping: 20 } }}
              className="flex items-center cursor-default"
            >
              <TreeIcon className="h-5 w-auto fill-[#3D472C]" />
            </motion.div>
            
            <NavLink 
              href="#faq" 
              label="FAQ" 
              activeSection={activeSection}
              hoveredSection={hoveredSection}
              onHover={handleNavHover}
              onLeave={handleNavLeave}
            />
            
            <motion.div 
              layout 
              transition={{ layout: { type: "spring", stiffness: 300, damping: 20 } }}
              className="flex items-center cursor-default"
            >
              <TreeIcon className="h-5 w-auto fill-[#3D472C]" />
            </motion.div>
            
            <NavLink 
              href="#sponsors" 
              label="SPONSORS" 
              activeSection={activeSection}
              hoveredSection={hoveredSection}
              onHover={handleNavHover}
              onLeave={handleNavLeave}
            />
            
            <AnimatePresence mode="popLayout">
              {!isRegisterButtonVisible && (
                <motion.div
                  key="register-nav"
                  layout
                  className="flex items-center"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 30 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20
                  }}
                >
                  <motion.div
                    layout
                    className="flex items-center cursor-default"
                  >
                    <TreeIcon className="h-5 w-auto fill-[#3D472C]" />
                  </motion.div>
                  
                  <motion.a
                    href="https://register.hacklahoma.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#2a3a1f] transition-colors h-20 flex items-center px-6"
                    data-section="register"
                    onMouseEnter={() => handleNavHover('register')}
                    onMouseLeave={handleNavLeave}
                    layout
                    animate={{
                      y: (hoveredSection === 'register') ? -4 : 0,
                      scale: (hoveredSection === 'register') ? 1.1 : 1,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                      mass: 0.8,
                      layout: {
                        type: "spring",
                        stiffness: 300,
                        damping: 20
                      }
                    }}
                  >
                    REGISTER
                  </motion.a>
                </motion.div>
              )}
            </AnimatePresence>
          </LayoutGroup>
        </nav>

        {/* Mobile Menu Button - centered on small screens */}
        <button
          className={`md:hidden flex flex-col space-y-1 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300 ${
            isMobileMenuOpen ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="Open mobile menu"
        >
          <span className="w-6 h-0.5 bg-[#3D472C]"></span>
          <span className="w-6 h-0.5 bg-[#3D472C]"></span>
          <span className="w-6 h-0.5 bg-[#3D472C]"></span>
        </button>
      </div>

      {/* Animated triangle that smoothly flies to active/hovered nav link */}
      <motion.div
        className="absolute w-0 h-0 hidden md:block"
        style={{
          top: '60%',
          left: '50%',
          x: triangleX, // Spring-animated position (stiffness: 300, damping: 20, mass: 0.8)
          borderLeft: '10px solid transparent',
          borderRight: '10px solid transparent',
          borderBottom: '10px solid #3D472C',
          pointerEvents: 'none',
          zIndex: 9999
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ opacity: { duration: 0.2 } }}
      />

      {/* Mobile Menu Modal */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="md:hidden fixed top-4 right-4 z-[75]"
            style={{
              filter: 'drop-shadow(0 10px 25px rgba(0, 0, 0, 0.3))'
            }}
            initial={{ opacity: 0, x: 300, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.9 }}
            transition={{
              duration: 0.6,
              ease: [0.22, 1, 0.36, 1]
            }}
          >
        <img 
          src={MobileHeader} 
          alt="Mobile menu background" 
          className="w-[260px] h-auto"
          style={{ pointerEvents: 'none', filter: 'brightness(1.01)' }}
        />
        
        <nav 
          className="absolute inset-0 flex flex-col py-2 px-2 items-center font-serif text-lg"
        >
          <motion.button
            onClick={() => setIsMobileMenuOpen(false)}
            className="px-4 py-3 text-[#3D472C] hover:text-[#2a3a1f] transition-colors rounded flex items-center gap-2 mb-4 self-end pr-6"
            aria-label="Close menu"
            whileTap={{ scale: 0.85, opacity: 0.7 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <span className="text-xl">←</span>
            <span>BACK</span>
          </motion.button>
          <div className="flex flex-col w-[90%]">
            <motion.a
              href="#top"
              className="w-full px-2 py-3 text-[#3D472C] hover:text-[#2a3a1f] transition-colors flex items-center justify-center"
              onClick={() => setIsMobileMenuOpen(false)}
              whileTap={{ scale: 0.92, x: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              style={{ originX: 0 }}
            >
              HOME
            </motion.a>
            <div 
              className="w-full h-[2px]"
              style={{
                WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
                maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)'
              }}
            >
              <LineIcon className="w-full h-full fill-[#3D472C]" preserveAspectRatio="none" />
            </div>
            <motion.a
              href="#about"
              className="w-full px-2 py-3 text-[#3D472C] hover:text-[#2a3a1f] transition-colors flex items-center justify-center"
              onClick={() => setIsMobileMenuOpen(false)}
              whileTap={{ scale: 0.92, x: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              style={{ originX: 0 }}
            >
              ABOUT
            </motion.a>
            <div 
              className="w-full h-[2px]"
              style={{
                WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
                maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
                transform: 'rotate(180deg)'
              }}
            >
              <LineIcon className="w-full h-full fill-[#3D472C]" preserveAspectRatio="none" />
            </div>
            <motion.a
              href="#faq"
              className="w-full px-2 py-3 text-[#3D472C] hover:text-[#2a3a1f] transition-colors flex items-center justify-center"
              onClick={() => setIsMobileMenuOpen(false)}
              whileTap={{ scale: 0.92, x: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              style={{ originX: 0 }}
            >
              FAQ
            </motion.a>
            <div 
              className="w-full h-[2px]"
              style={{
                WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
                maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)'
              }}
            >
              <LineIcon className="w-full h-full fill-[#3D472C]" preserveAspectRatio="none" />
            </div>
            <motion.a
              href="#sponsors"
              className="w-full px-2 py-3 text-[#3D472C] hover:text-[#2a3a1f] transition-colors flex items-center justify-center"
              onClick={() => setIsMobileMenuOpen(false)}
              whileTap={{ scale: 0.92, x: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              style={{ originX: 0 }}
            >
              SPONSORS
            </motion.a>
          </div>
          <motion.a
            href="https://register.hacklahoma.org"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto self-center"
            whileTap={{ scale: 0.88, rotate: -2 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <img 
              src={RegisterButton} 
              alt="Register" 
              className="w-48 h-auto hover:opacity-80 transition-opacity px-2 py-4"
              style={{ pointerEvents: 'none', filter: 'saturate(0.5)'}}
            />
          </motion.a>
        </nav>
      </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;

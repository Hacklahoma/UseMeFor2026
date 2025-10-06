import React from 'react';
import MapOutline from '../../common/assets/OK_Norman_706465_1936_625001.png';
import LandingView from './sections/LandingView';
import SplashQuote from './sections/SplashQuote';
import PhotoCollage from './sections/PhotoCollage';
import About from '../about/sections/About';
import Testing from './sections/Testing';

const LandingPage: React.FC = () => {
  // Toggle to enable/disable the fruits section at the bottom
  const showFruitsSection = false;

  return (
    <div className="relative min-h-[100svh] w-full overflow-x-hidden">
      {/* Global fixed background so sections share the same image */}
      <div className="fixed inset-0 -z-50 pointer-events-none select-none">
        <div
          className="absolute inset-0 bg-center bg-no-repeat bg-cover"
          style={{ backgroundImage: `url(${MapOutline})` }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-[#FFFCF5]/15" aria-hidden />
      </div>

      <LandingView />
      <SplashQuote />
      <PhotoCollage />
      <About />
      {showFruitsSection && <Testing />}
    </div>
  );
};

export default LandingPage;

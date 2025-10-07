import React from 'react';
import { useNavigate } from 'react-router-dom';
import MapOutline from '../../common/assets/OK_Norman_706465_1936_625001.png';
import LandingView from './sections/LandingView';
import SplashQuote from './sections/SplashQuote';
import PhotoCollage from './sections/PhotoCollage';
import About from '../about/sections/About';
import FindOriginButton from './sections/FindOriginButton';
import { OriginProvider } from './sections/OriginContext';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <OriginProvider>
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
        
        {/* Action Buttons */}
        <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-3">
          <button 
            onClick={() => navigate('/bee')}
            className="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-lg shadow-lg transition-colors flex items-center gap-2"
          >
            🐝 Bee Animation
          </button>
          <FindOriginButton />
        </div>
      </div>
    </OriginProvider>
  );
};

export default LandingPage;

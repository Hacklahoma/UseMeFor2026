import React from "react";
import MapOutline from "../../common/assets/OK_Norman_706465_1936_625001.png";
import LandingView from "./sections/LandingView";
import SplashQuote from "./sections/SplashQuote";
import PhotoCollage from "./components/photoCollage/PhotoCollage";
import About from "../about/sections/About";
import Sponsors from "./sections/Sponsors";
const LandingPage: React.FC = () => {

  return (
    <div className="relative min-h-[100svh] w-full overflow-x-hidden">
      {/* Global fixed background so sections share the same image */}
      <div className="absolute inset-0 -z-50 pointer-events-none select-none">
        <div
          className="absolute inset-0 bg-no-repeat bg-cover"
          style={{ backgroundImage: `url(${MapOutline})`, backgroundSize: 'cover' }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-[#FFFCF5]/15" aria-hidden />
      </div>
      <LandingView />
      <SplashQuote />
      <PhotoCollage />
      <About />
      <Sponsors />
      
      {/* Footer with MLH Code of Conduct */}
      <footer className="relative py-8 text-center">
        <a 
          href="https://github.com/MLH/mlh-policies/blob/main/code-of-conduct.md"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#575f49] hover:text-[#2a3a1f] transition-colors underline"
        >
          MLH Code of Conduct
        </a>
      </footer>
    </div>
  );
};

export default LandingPage;

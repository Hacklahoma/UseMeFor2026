import React from "react";
import LandingView from "./sections/LandingView";
import SplashQuote from "./sections/SplashQuote";
import PhotoCollage from "./sections/PhotoCollage";
import About from "../about/sections/About";
import Sponsors from "./sections/Sponsors";

const LandingPage: React.FC = () => {
  return (
    <div>
      <LandingView />
      <SplashQuote />
      <PhotoCollage />
      <About />
      <Sponsors />
    </div>
  );
};

export default LandingPage;

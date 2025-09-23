import React from 'react';
import LandingView from './sections/LandingView';
import SplashQuote from './sections/SplashQuote';

const LandingPage: React.FC = () => {
  return (
    <div>
      <LandingView />
      <SplashQuote />
    </div>
  );
};

export default LandingPage;

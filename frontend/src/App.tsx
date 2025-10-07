import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './ui/pages/landing';
import BeeAnimation from './ui/pages/landing/sections/TestBeeFlight';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/bee" element={<BeeAnimation />} />
      </Routes>
    </Router>
  );
};

export default App;
import React from 'react';
import BeeLogo from '../../../common/assets/BeeLogo.png';

const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 p-6 z-50">
      <img 
        src={BeeLogo} 
        alt="Hacklahoma Bee Logo" 
        className="w-16 h-16 object-contain"
      />
    </header>
  );
};

export default Header;

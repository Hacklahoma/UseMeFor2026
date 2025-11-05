import React from 'react';
import { Link } from 'react-router-dom';
import BeeLogo from '../../../common/assets/BeeLogo.png';

interface HeaderProps {
  hideBee?: boolean;
}

const Header: React.FC<HeaderProps> = ({ hideBee = false }) => {
  return (
    <header className="fixed top-0 left-0 h-20 w-full bg-gradient-to-b from-[#FFFCF5] via-[#FFFCF5] to-transparent z-50">
      <div className="h-full flex top-1 items-center justify-start px-6 relative">
        {!hideBee && (
          <Link to="/" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 block">
            <img 
              src={BeeLogo}
              alt="Hacklahoma Bee Logo"
              className="w-11 h-11 object-contain"
            />
          </Link>
        )}
        <nav className="hidden min-[600px]:flex flex-col items-start space-y-[-0.25rem] mt-8 ml-3">
          <Link to="/" className="text-[#3D472C] hover:text-[#2a3a1f] transition-colors">home</Link>
          <Link to="#" className="text-[#3D472C] hover:text-[#2a3a1f] transition-colors">login</Link>
          <Link to="#" className="text-[#3D472C] hover:text-[#2a3a1f] transition-colors">faq</Link>
          <Link to="/register" className="text-[#3D472C] hover:text-[#2a3a1f] transition-colors">apply</Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;


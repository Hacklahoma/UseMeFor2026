import React from 'react';
import CoverBackImage from '../../../common/assets/faq/cover_back.png';

const CoverBack: React.FC = () => {
    return (
      <div 
        className="relative w-[85vw] max-w-[320px] sm:max-w-[420px] md:max-w-[500px] lg:max-w-[450px] aspect-[3/4] mx-auto overflow-hidden rounded-xl"
        style={{
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 10px 30px rgba(0, 0, 0, 0.2)',
        }}
      >      
        {/* background cover image */}
        <img
          src= {CoverBackImage}
          alt="Diary back cover"
          className="w-full h-full object-fill"
        />
    </div>
    );
  };
  
  export default CoverBack;
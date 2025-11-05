import React from 'react';
import * as motion from "motion/react-client";

const TypingIndicator: React.FC = () => {
  // Create a seamless wave animation by using different animation phases
  // Each bubble animates at a different phase to create continuous motion
  // The total cycle is 0.6s, so delays are 0, 0.2, 0.4 to create a wave
  const cycleDuration = 0.6;
  const bubbleDelay = 0.2; // 1/3 of cycle for seamless wave

  return (
    <motion.div
      className="flex justify-start"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-[#e8e8c7] text-[#3D472C] rounded-lg px-4 py-3">
        <div className="flex gap-1.5">
          {/* First bubble - starts at 0% of cycle */}
          <motion.span
            className="w-2 h-2 bg-[#3D472C] rounded-full"
            animate={{ 
              y: [0, -8, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: cycleDuration, 
              repeat: Infinity, 
              delay: 0,
              ease: "easeInOut",
              times: [0, 0.5, 1]
            }}
          />
          {/* Second bubble - starts at 33% of cycle (seamless transition) */}
          <motion.span
            className="w-2 h-2 bg-[#3D472C] rounded-full"
            animate={{ 
              y: [0, -8, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: cycleDuration, 
              repeat: Infinity, 
              delay: bubbleDelay,
              ease: "easeInOut",
              times: [0, 0.5, 1]
            }}
          />
          {/* Third bubble - starts at 67% of cycle (seamless transition) */}
          <motion.span
            className="w-2 h-2 bg-[#3D472C] rounded-full"
            animate={{ 
              y: [0, -8, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: cycleDuration, 
              repeat: Infinity, 
              delay: bubbleDelay * 2,
              ease: "easeInOut",
              times: [0, 0.5, 1]
            }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default TypingIndicator;


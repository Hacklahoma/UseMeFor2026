import React, { useState, useEffect } from 'react';
import * as motion from "motion/react-client";

interface ConnectingAnimationProps {
  onComplete: () => void;
}

const ConnectingAnimation: React.FC<ConnectingAnimationProps> = ({ onComplete }) => {
  const [showText, setShowText] = useState(false);
  const [showIcon, setShowIcon] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [showCheckmark, setShowCheckmark] = useState(false);

  useEffect(() => {
    // Show icon first
    const iconTimer = setTimeout(() => {
      setShowIcon(true);
    }, 300);

    // Then show connecting text
    const textTimer = setTimeout(() => {
      setShowText(true);
    }, 800);

    // Show "Connected!" after a delay
    const connectedTimer = setTimeout(() => {
      setIsConnected(true);
    }, 2000);

    // Show checkmark after connected text
    const checkmarkTimer = setTimeout(() => {
      setShowCheckmark(true);
    }, 2200);

    // Complete after connected animation
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => {
      clearTimeout(iconTimer);
      clearTimeout(textTimer);
      clearTimeout(connectedTimer);
      clearTimeout(checkmarkTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <motion.div
      className="w-full max-w-2xl flex flex-col items-center justify-center min-h-[400px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Profile Icon */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={showIcon ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="mb-6"
      >
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-[#575f49] flex items-center justify-center">
          <svg
            className="w-10 h-10 md:w-12 md:h-12 text-[#F5F5DC]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
      </motion.div>

      {/* Connecting/Connected Text - Fixed height container */}
      <div className="text-center min-h-[60px] flex items-center justify-center">
        <motion.div
          key={isConnected ? 'connected' : 'connecting'}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <p className="text-base md:text-lg text-[#3D472C] font-medium">
            {isConnected ? 'Connected!' : 'Connecting you to a travel advisor...'}
          </p>
        </motion.div>
      </div>

      {/* Animated dots or checkmark - Fixed height container */}
      <div className="h-[48px] flex items-center justify-center mt-4 relative">
        {/* Animated dots */}
        {showText && !showCheckmark && (
          <motion.div
            className="flex gap-1 justify-center items-center absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                className="w-2 h-2 rounded-full bg-[#575f49]"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: index * 0.2,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </motion.div>
        )}

        {/* Checkmark */}
        {showCheckmark && (
          <motion.div
            className="flex justify-center items-center absolute inset-0"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <div className="w-10 h-10 rounded-full bg-[#575f49] flex items-center justify-center flex-shrink-0">
              <svg
                className="w-6 h-6 text-[#F5F5DC] flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default ConnectingAnimation;


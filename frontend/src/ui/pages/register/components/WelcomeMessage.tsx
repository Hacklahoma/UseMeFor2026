import React from 'react';
import * as motion from "motion/react-client";

interface WelcomeMessageProps {
  firstName: string;
  lastName: string;
}

/**
 * Welcome message component displayed above the registration form
 */
export const WelcomeMessage: React.FC<WelcomeMessageProps> = ({ firstName, lastName }) => {
  return (
    <motion.p
      className="text-lg text-[#575f49] opacity-90 mb-4 text-center"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      Welcome, <span className="font-medium">{firstName} {lastName}</span>
    </motion.p>
  );
};


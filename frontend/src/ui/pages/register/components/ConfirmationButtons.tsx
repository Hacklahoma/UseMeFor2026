import React from 'react';
import * as motion from "motion/react-client";

interface ConfirmationButtonsProps {
  onConfirm: () => void;
  onCancel: () => void;
  disabled?: boolean;
}

const ConfirmationButtons: React.FC<ConfirmationButtonsProps> = ({ onConfirm, onCancel, disabled = false }) => {
  return (
    <motion.div
      className="flex gap-4 px-4 justify-center"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: disabled ? 0.5 : 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <button
        onClick={onCancel}
        disabled={disabled}
        className="px-6 py-3 border-2 border-[#575f49] text-[#575f49] font-medium hover:bg-[#575f49] hover:text-[#F5F5DC] transition-colors duration-300 rounded shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        No
      </button>
      <button
        onClick={onConfirm}
        disabled={disabled}
        className="px-6 py-3 border-2 border-[#575f49] bg-[#575f49] text-[#F5F5DC] font-medium hover:bg-[#2a3a1f] transition-colors duration-300 rounded shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Yes
      </button>
    </motion.div>
  );
};

export default ConfirmationButtons;


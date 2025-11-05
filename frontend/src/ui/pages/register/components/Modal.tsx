import React from 'react';
import { createPortal } from 'react-dom';
import * as motion from "motion/react-client";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  bodyText: string;
  downloadUrl?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, bodyText, downloadUrl }) => {
  if (!isOpen) return null;

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Modal Content */}
      <motion.div
        className="relative bg-[#FFFCF5] rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-[#575f49]">
          <h2 className="text-2xl font-semibold text-[#3D472C] font-serif">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-[#575f49] hover:text-[#2a3a1f] transition-colors"
            aria-label="Close modal"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        
        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          <p className="text-[#3D472C] leading-relaxed whitespace-pre-wrap">
            {bodyText}
          </p>
        </div>
        
        {/* Footer */}
        <div className="p-6 border-t-2 border-[#575f49] flex gap-3">
          {downloadUrl && (
            <a
              href={downloadUrl}
              download
              className="flex-1 px-6 py-3 border-2 border-[#575f49] text-[#575f49] font-medium hover:bg-[#e8e8c7] transition-colors duration-300 rounded text-center"
            >
              Download PDF
            </a>
          )}
          <button
            onClick={onClose}
            className={`px-6 py-3 border-2 border-[#575f49] bg-[#575f49] text-[#F5F5DC] font-medium hover:bg-[#2a3a1f] transition-colors duration-300 rounded ${downloadUrl ? 'flex-1' : 'w-full'}`}
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
};

export default Modal;


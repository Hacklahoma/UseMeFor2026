import React, { useState } from 'react';
import * as motion from "motion/react-client";
import { createPortal } from 'react-dom';

interface SocialMediaLinksProps {
  github: string;
  linkedin: string;
  discord: string;
  instagram: string;
  onChange: (platform: 'github' | 'linkedin' | 'discord' | 'instagram', value: string) => void;
}

const SocialMediaLinks: React.FC<SocialMediaLinksProps> = ({
  github,
  linkedin,
  discord,
  instagram,
  onChange,
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editValues, setEditValues] = useState({
    github,
    linkedin,
    discord,
    instagram,
  });

  const getPlatformIcon = (platform: 'github' | 'linkedin' | 'discord' | 'instagram') => {
    switch (platform) {
      case 'github':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
        );
      case 'linkedin':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
        );
      case 'discord':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928-1.793 6.4-2.221 8.372-2.221s4.444.428 8.372 2.221a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.872.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
          </svg>
        );
      case 'instagram':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
        );
    }
  };

  const getPlatformLabel = (platform: 'github' | 'linkedin' | 'discord' | 'instagram') => {
    switch (platform) {
      case 'github':
        return 'GitHub';
      case 'linkedin':
        return 'LinkedIn';
      case 'discord':
        return 'Discord';
      case 'instagram':
        return 'Instagram';
    }
  };

  const handleSave = () => {
    onChange('github', editValues.github);
    onChange('linkedin', editValues.linkedin);
    onChange('discord', editValues.discord);
    onChange('instagram', editValues.instagram);
    setIsEditModalOpen(false);
  };

  const handleCancel = () => {
    setEditValues({ github, linkedin, discord, instagram });
    setIsEditModalOpen(false);
  };

  const platforms: Array<'github' | 'linkedin' | 'discord' | 'instagram'> = ['github', 'linkedin', 'discord', 'instagram'];
  const values = { github, linkedin, discord, instagram };

  const getPlatformUrl = (platform: 'github' | 'linkedin' | 'discord' | 'instagram', value: string) => {
    if (!value) return null;
    
    // If it already starts with http:// or https://, return as is
    if (value.startsWith('http://') || value.startsWith('https://')) {
      return value;
    }
    
    // Otherwise, construct the URL based on platform
    switch (platform) {
      case 'github':
        return `https://github.com/${value}`;
      case 'linkedin':
        return value.includes('linkedin.com') ? `https://${value}` : `https://linkedin.com/in/${value}`;
      case 'discord':
        return value; // Discord usernames are typically just usernames
      case 'instagram':
        return `https://instagram.com/${value}`;
    }
  };

  return (
    <>
      <div className="flex items-center justify-center gap-4">
        {/* Social Media Icons */}
        <div className="flex items-center gap-3">
          {platforms.map((platform) => {
            const value = values[platform];
            const url = getPlatformUrl(platform, value);
            const hasValue = !!value;
            
            const iconElement = (
              <div 
                key={platform} 
                className={`text-[#575f49] transition-opacity ${
                  hasValue ? 'opacity-100' : 'opacity-30'
                }`}
              >
                {getPlatformIcon(platform)}
              </div>
            );

            if (url && platform !== 'discord') {
              return (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-70 transition-opacity"
                  title={`Visit ${getPlatformLabel(platform)}`}
                >
                  {iconElement}
                </a>
              );
            }
            
            return iconElement;
          })}
        </div>
        
        {/* Edit Button */}
        <button
          onClick={() => {
            setEditValues({ github, linkedin, discord, instagram });
            setIsEditModalOpen(true);
          }}
          className="text-[#575f49] hover:text-[#2a3a1f] transition-colors"
          title="Edit social media links"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
        </button>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && createPortal(
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          onClick={handleCancel}
        >
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />

          {/* Modal Content */}
          <motion.div
            className="relative bg-[#FFFCF5] rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b-2 border-[#575f49]">
              <h2 className="text-2xl font-semibold text-[#3D472C] font-serif">
                Edit Social Media Links
              </h2>
              <button
                onClick={handleCancel}
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
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {platforms.map((platform) => (
                <div key={platform}>
                  <label className="block text-[#3D472C] font-medium mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[#575f49]">{getPlatformIcon(platform)}</span>
                      <span>{getPlatformLabel(platform)}</span>
                    </div>
                  </label>
                  <input
                    type="text"
                    value={editValues[platform]}
                    onChange={(e) => setEditValues({ ...editValues, [platform]: e.target.value })}
                    placeholder={`Enter your ${getPlatformLabel(platform)} username or URL`}
                    className="w-full px-4 py-2 border-2 border-[#575f49] rounded bg-white text-[#3D472C] text-sm focus:outline-none focus:ring-2 focus:ring-[#575f49] focus:border-transparent"
                  />
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-6 border-t-2 border-[#575f49] flex gap-3">
              <button
                onClick={handleSave}
                className="flex-1 px-6 py-3 border-2 border-[#575f49] bg-[#575f49] text-[#F5F5DC] font-medium hover:bg-[#2a3a1f] transition-colors duration-300 rounded"
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 px-6 py-3 border-2 border-[#575f49] text-[#575f49] font-medium hover:bg-[#e8e8c7] transition-colors duration-300 rounded"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>,
        document.body
      )}
    </>
  );
};

export default SocialMediaLinks;


import React, { useRef, useEffect } from 'react';
import * as motion from "motion/react-client";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  placeholder: string;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ value, onChange, onSubmit, placeholder, disabled = false }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  }, [disabled]);

  return (
    <motion.form
      onSubmit={onSubmit}
      className="flex gap-2 px-4"
      initial={{ opacity: 1 }}
      animate={{ opacity: disabled ? 0.5 : 1 }}
      transition={{ duration: 0.3 }}
    >
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 px-4 py-3 border-2 border-[#575f49] rounded bg-[#FFFCF5] text-[#3D472C] focus:outline-none focus:ring-2 focus:ring-[#575f49] focus:border-transparent shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-opacity duration-300"
        required
      />
      <button
        type="submit"
        disabled={disabled}
        className="px-6 py-3 border-2 border-[#575f49] text-[#575f49] font-medium hover:bg-[#575f49] hover:text-[#F5F5DC] transition-colors duration-300 rounded shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Send
      </button>
    </motion.form>
  );
};

export default ChatInput;


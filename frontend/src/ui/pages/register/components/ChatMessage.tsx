import React from 'react';
import * as motion from "motion/react-client";

interface ChatMessageProps {
  text: string;
  sender: 'bot' | 'user';
}

const ChatMessage: React.FC<ChatMessageProps> = ({ text, sender }) => {

  return (
    <motion.div
      className={`flex ${sender === 'user' ? 'justify-end' : 'justify-start'}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className={`max-w-[80%] rounded-lg px-4 py-3 ${
          sender === 'user'
            ? 'bg-[#575f49] text-[#F5F5DC]'
            : 'bg-[#e8e8c7] text-[#3D472C]'
        }`}
      >
            <p className="text-sm md:text-lg">{text}</p>
      </div>
    </motion.div>
  );
};

export default ChatMessage;


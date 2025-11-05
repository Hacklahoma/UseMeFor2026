import React, { useRef, useEffect } from 'react';
import * as motion from "motion/react-client";
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';
import ChatInput from './ChatInput';
import ConfirmationButtons from './ConfirmationButtons';
import { Message, ChatStage } from '../types';

interface ChatInterfaceProps {
  messages: Message[];
  isTyping: boolean;
  inputValue: string;
  inputDisabled?: boolean;
  stage: ChatStage;
  hideButtons?: boolean;
  onInputChange: (value: string) => void;
  onInputSubmit: (e: React.FormEvent) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  isTyping,
  inputValue,
  inputDisabled = false,
  stage,
  hideButtons = false,
  onInputChange,
  onInputSubmit,
  onConfirm,
  onCancel,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const getPlaceholder = () => {
    if (stage === 'chat-lastname') {
      return "Enter your last name...";
    }
    if (stage === 'chat-email') {
      return "Enter your email address...";
    }
    return "Enter your name...";
  };

  return (
    <motion.div
      className="w-full max-w-2xl flex flex-col"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Messages */}
      <motion.div 
        className="flex-1 overflow-y-auto mb-6 space-y-4 min-h-[400px] max-h-[60vh] px-4"
        initial={{ opacity: 1 }}
        animate={{ opacity: stage === 'form' ? 0 : 1 }}
        transition={{ duration: 1, delay: stage === 'form' ? 1.5 : 0 }}
      >
        {messages.map((message) => (
          <ChatMessage key={message.id} text={message.text} sender={message.sender} />
        ))}
        
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </motion.div>

      {/* Input or Confirmation Buttons Container - maintains fixed height to prevent layout shift */}
      <div 
        className="min-h-[60px] flex items-center justify-center relative"
        style={{ 
          height: (isTyping || stage === 'form') ? '60px' : 'auto'
        }}
      >
        {/* Confirmation Buttons - always rendered but hidden when not needed */}
        <motion.div
          className="w-full"
          initial={{ opacity: 1 }}
          animate={{ 
            opacity: (stage === 'chat-confirm' || stage === 'chat-email-confirm') && !isTyping && !hideButtons ? 1 : 0,
            visibility: (stage === 'chat-confirm' || stage === 'chat-email-confirm') && !isTyping && !hideButtons ? 'visible' : 'hidden'
          }}
          transition={{ duration: 0.3 }}
          style={{ 
            pointerEvents: (stage === 'chat-confirm' || stage === 'chat-email-confirm') && !isTyping && !hideButtons ? 'auto' : 'none',
            position: 'absolute',
            width: '100%'
          }}
        >
          <ConfirmationButtons
            onConfirm={onConfirm}
            onCancel={onCancel}
            disabled={inputDisabled}
          />
        </motion.div>
        
        {/* Input field - always rendered but hidden when not needed */}
        <motion.div
          className="w-full"
          animate={{ 
            opacity: (stage === 'chat-name' || stage === 'chat-email' || stage === 'chat-lastname') && !isTyping && !hideButtons ? 1 : 0,
            visibility: (stage === 'chat-name' || stage === 'chat-email' || stage === 'chat-lastname') && !isTyping && !hideButtons ? 'visible' : 'hidden'
          }}
          transition={{ duration: 0.3 }}
          style={{ 
            pointerEvents: (stage === 'chat-name' || stage === 'chat-email' || stage === 'chat-lastname') && !isTyping && !hideButtons ? 'auto' : 'none',
            position: 'absolute',
            width: '100%'
          }}
        >
          <ChatInput
            value={inputValue}
            onChange={onInputChange}
            onSubmit={onInputSubmit}
            placeholder={getPlaceholder()}
            disabled={inputDisabled}
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ChatInterface;


import { useState, useCallback } from 'react';
import { Message, ChatStage, FormData } from '../types';
import { ANIMATION_TIMINGS, INITIAL_MESSAGE } from '../constants';
import { parseName } from '../utils/nameParser';
import { isValidEmail } from '../utils/validators';

interface UseChatFlowReturn {
  messages: Message[];
  stage: ChatStage;
  inputValue: string;
  isTyping: boolean;
  inputDisabled: boolean;
  hideButtons: boolean;
  showForm: boolean;
  setInputValue: (value: string) => void;
  handleInputSubmit: (e: React.FormEvent, formData: FormData, updateField: (field: keyof FormData, value: any) => void) => void;
  handleConfirm: (formData: FormData) => void;
  handleCancel: (formData: FormData, updateField: (field: keyof FormData, value: any) => void) => void;
}

/**
 * Custom hook for managing chat flow state and logic
 * Handles all chat interactions, stage transitions, and bot messages
 */
export const useChatFlow = (): UseChatFlowReturn => {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [stage, setStage] = useState<ChatStage>('chat-name');
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [inputDisabled, setInputDisabled] = useState(false);
  const [hideButtons, setHideButtons] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const addUserMessage = useCallback((text: string) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      text,
      sender: 'user'
    }]);
  }, []);

  const addBotMessage = useCallback((text: string, delay: number = ANIMATION_TIMINGS.TYPING_DELAY) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text,
        sender: 'bot'
      }]);
      // Enable input after bot message appears
      setTimeout(() => {
        setInputDisabled(false);
      }, ANIMATION_TIMINGS.INPUT_ENABLE_DELAY);
    }, delay);
  }, []);

  const handleInputSubmit = useCallback((
    e: React.FormEvent, 
    formData: FormData,
    updateField: (field: keyof FormData, value: any) => void
  ) => {
    e.preventDefault();
    
    if (!inputValue.trim() || inputDisabled) return;

    const trimmedValue = inputValue.trim();
    setInputDisabled(true);
    
    if (stage === 'chat-name') {
      const { firstName, lastName } = parseName(trimmedValue);
      addUserMessage(trimmedValue);
      updateField('firstName', firstName);
      updateField('lastName', lastName);

      if (!lastName) {
        addBotMessage(`Nice to meet you, ${firstName}! What's your last name?`);
        setStage('chat-lastname');
      } else {
        addBotMessage(`Got it! So your name is ${firstName} ${lastName}?`);
        setStage('chat-confirm');
      }
      setInputValue('');
    } else if (stage === 'chat-lastname') {
      const lastName = trimmedValue;
      addUserMessage(trimmedValue);
      updateField('lastName', lastName);
      addBotMessage(`Perfect! So your name is ${formData.firstName} ${lastName}?`);
      setStage('chat-confirm');
      setInputValue('');
    } else if (stage === 'chat-email') {
      const email = trimmedValue;
      
      if (!isValidEmail(email)) {
        addUserMessage(trimmedValue);
        addBotMessage("Please enter a valid email address.");
        setInputValue('');
        return;
      }
      
      addUserMessage(trimmedValue);
      updateField('email', email);
      addBotMessage(`Got it! So your email is ${email}?`);
      setStage('chat-email-confirm');
      setInputValue('');
    }
  }, [inputValue, inputDisabled, stage, addBotMessage, addUserMessage]);

  const handleConfirm = useCallback((formData: FormData) => {
    if (inputDisabled) return;
    
    setInputDisabled(true);
    addUserMessage("Yes");

    if (stage === 'chat-confirm') {
      setStage('chat-email');
      addBotMessage("Great! What's your email address?");
    } else if (stage === 'chat-email-confirm') {
      setHideButtons(true);
      addBotMessage("Perfect! Your registration has been created. Let's add some more information.");
      
      console.log('Registering user:', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email
      });
      
      setTimeout(() => {
        setStage('form');
      }, ANIMATION_TIMINGS.STAGE_TRANSITION_DELAY);
      
      setTimeout(() => {
        setShowForm(true);
      }, ANIMATION_TIMINGS.FORM_SHOW_DELAY);
    }
  }, [inputDisabled, stage, addBotMessage, addUserMessage]);

  const handleCancel = useCallback((
    formData: FormData,
    updateField: (field: keyof FormData, value: any) => void
  ) => {
    if (inputDisabled) return;
    
    setInputDisabled(true);
    addUserMessage("No");

    if (stage === 'chat-confirm') {
      setStage('chat-name');
      updateField('firstName', '');
      updateField('lastName', '');
      addBotMessage("No problem! What is your name?");
    } else if (stage === 'chat-email-confirm') {
      setStage('chat-email');
      updateField('email', '');
      addBotMessage("No problem! What's your email address?");
    }
  }, [inputDisabled, stage, addBotMessage, addUserMessage]);

  return {
    messages,
    stage,
    inputValue,
    isTyping,
    inputDisabled,
    hideButtons,
    showForm,
    setInputValue,
    handleInputSubmit,
    handleConfirm,
    handleCancel,
  };
};


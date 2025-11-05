import React, { useEffect } from 'react';
import * as motion from "motion/react-client";
import Header from './components/Header';
import ChatInterface from './components/ChatInterface';
import RegistrationForm from './components/RegistrationForm';
import ConnectingAnimation from './components/ConnectingAnimation';
import { Background } from './components/Background';
import { WelcomeMessage } from './components/WelcomeMessage';
import { useChatFlow } from './hooks/useChatFlow';
import { useFormData } from './hooks/useFormData';

const RegisterPage: React.FC = () => {
  const {
    messages,
    stage,
    inputValue,
    isTyping,
    inputDisabled,
    hideButtons,
    showForm,
    showConnecting,
    initializeChat,
    setInputValue,
    handleInputSubmit,
    handleConfirm,
    handleCancel,
  } = useChatFlow();

  const {
    formData,
    updateField,
  } = useFormData();

  // Auto-submit when all required fields are filled (optional - can be used for API calls)
  useEffect(() => {
    if (showForm && formData.firstName && formData.lastName && formData.school && formData.major && formData.grade) {
      const dietaryComplete = !formData.dietaryRestriction || 
        (formData.dietaryRestriction !== 'other' || formData.dietaryOther);
      
      if (dietaryComplete) {
        console.log('Form completed:', formData);
        // TODO: Update user with school, major, grade, dietary restrictions
        // This is where you would make the API call to update the user
      }
    }
  }, [showForm, formData]);

  return (
    <div className="relative min-h-[100svh] w-full overflow-x-hidden">
      <Background />

      <Header hideBee={showForm} />

      <div className="relative min-h-[100svh] w-full flex items-center justify-center px-4 py-20">
        <motion.div 
          className="max-w-2xl w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {showConnecting && (
            <ConnectingAnimation onComplete={initializeChat} />
          )}

          {!showForm && !showConnecting && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <ChatInterface
                messages={messages}
                isTyping={isTyping}
                inputValue={inputValue}
                inputDisabled={inputDisabled}
                stage={stage}
                hideButtons={hideButtons}
                onInputChange={setInputValue}
                onInputSubmit={(e) => handleInputSubmit(e, formData, updateField)}
                onConfirm={() => handleConfirm(formData)}
                onCancel={() => handleCancel(formData, updateField)}
              />
            </motion.div>
          )}

              {showForm && (
                <motion.div
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <WelcomeMessage firstName={formData.firstName} lastName={formData.lastName} />
                  <RegistrationForm
                    formData={formData}
                    onFieldChange={updateField}
                  />
                </motion.div>
              )}
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;

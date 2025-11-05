import React, { useState } from 'react';
import * as motion from "motion/react-client";
import MapOutline from '../../common/assets/OK_Norman_706465_1936_625001.png';
import Header from './components/Header';
import ChatInterface from './components/ChatInterface';
import RegistrationForm from './components/RegistrationForm';

interface Message {
  id: string;
  text: string;
  sender: 'bot' | 'user';
}

const RegisterPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: "Hello. What is your name?", sender: 'bot' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    school: '',
    major: '',
    grade: '',
    dietaryRestriction: '',
    dietaryOther: '',
    profilePicture: null as File | null,
    github: '',
    linkedin: '',
    discord: '',
    instagram: '',
    resume: null as File | null,
  });
  const [stage, setStage] = useState<'chat-name' | 'chat-confirm' | 'chat-lastname' | 'chat-email' | 'chat-email-confirm' | 'form'>('chat-name');
  const [showForm, setShowForm] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [inputDisabled, setInputDisabled] = useState(false);
  const [waitingForResponse, setWaitingForResponse] = useState(false);
  const [hideButtons, setHideButtons] = useState(false); // Track when to hide buttons during transition

  const parseName = (nameInput: string): { firstName: string; lastName: string } => {
    const parts = nameInput.trim().split(/\s+/);
    const firstName = parts[0] || '';
    const lastName = parts.slice(1).join(' ') || '';
    return { firstName, lastName };
  };

  const addBotMessage = (text: string, delay: number = 1500) => {
    setIsTyping(true);
    setWaitingForResponse(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        text, 
        sender: 'bot'
      }]);
      // Enable input after bot message appears
      setTimeout(() => {
        setWaitingForResponse(false);
        setInputDisabled(false);
      }, 300);
    }, delay);
  };

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || inputDisabled) return;

    const trimmedValue = inputValue.trim();
    
    // Disable input immediately after user sends message
    setInputDisabled(true);
    
    if (stage === 'chat-name') {
      const { firstName, lastName } = parseName(trimmedValue);
      
      // Add user message
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        text: trimmedValue, 
        sender: 'user' 
      }]);

      // Update form data
      setFormData(prev => ({ ...prev, firstName, lastName }));

      // If no last name, ask for it
      if (!lastName) {
        addBotMessage(`Nice to meet you, ${firstName}! What's your last name?`, 1500);
        setStage('chat-lastname');
      } else {
        // Confirm name
        addBotMessage(`Got it! So your name is ${firstName} ${lastName}?`, 1500);
        setStage('chat-confirm');
      }

      setInputValue('');
    } else if (stage === 'chat-lastname') {
      const lastName = trimmedValue;
      
      // Add user message
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        text: trimmedValue, 
        sender: 'user' 
      }]);

      // Update form data
      setFormData(prev => ({ ...prev, lastName }));

      // Confirm name
      addBotMessage(`Perfect! So your name is ${formData.firstName} ${lastName}?`, 1500);
      setStage('chat-confirm');

      setInputValue('');
    } else if (stage === 'chat-email') {
      const email = trimmedValue;
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        // Add user message
        setMessages(prev => [...prev, { 
          id: Date.now().toString(), 
          text: trimmedValue, 
          sender: 'user' 
        }]);

        // Ask for valid email
        addBotMessage("Please enter a valid email address.", 1500);
        setInputValue('');
        return;
      }
      
      // Add user message
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        text: trimmedValue, 
        sender: 'user' 
      }]);

      // Update form data
      setFormData(prev => ({ ...prev, email }));

      // Confirm email
      addBotMessage(`Got it! So your email is ${email}?`, 1500);
      setStage('chat-email-confirm');

      setInputValue('');
    }
  };

  const handleConfirm = () => {
    if (inputDisabled) return;
    
    // Disable input immediately
    setInputDisabled(true);
    
    // Add user message (Yes)
    setMessages(prev => [...prev, { 
      id: Date.now().toString(), 
      text: "Yes", 
      sender: 'user' 
    }]);

    if (stage === 'chat-confirm') {
      // Name confirmed, ask for email - hide buttons immediately
      setStage('chat-email');
      addBotMessage("Great! What's your email address?", 1500);
    } else if (stage === 'chat-email-confirm') {
      // Email confirmed, register user and show form - hide buttons immediately
      setHideButtons(true); // Hide buttons immediately
      addBotMessage("Perfect! Your registration has been created. Let's add some more information.");
      
      // TODO: Register user with firstName, lastName, email
      // This is where you would make the API call to create the user
      console.log('Registering user:', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email
      });
      
      // Wait for message to appear (1.5s typing) and be visible for a moment (1.5s)
      // Then fade everything except messages (1s)
      // Then fade messages (1s)
      // Then show form
      setTimeout(() => {
        // After message appears and is visible, start fading everything except messages
        setStage('form'); // This will trigger fade of input/buttons
      }, 3000); // 1.5s typing + 1.5s visible
      
      // Show form after everything fades
      setTimeout(() => {
        setShowForm(true);
      }, 5500); // 1.5s typing + 1.5s visible + 1s fade input/buttons + 1s fade messages + 0.5s buffer
    }
  };

  const handleCancel = () => {
    if (inputDisabled) return;
    
    // Disable input immediately
    setInputDisabled(true);
    
    // Add user message (No)
    setMessages(prev => [...prev, { 
      id: Date.now().toString(), 
      text: "No", 
      sender: 'user' 
    }]);

    if (stage === 'chat-confirm') {
      // Name not correct, ask for name again - hide buttons immediately
      setStage('chat-name');
      setFormData(prev => ({ ...prev, firstName: '', lastName: '' }));
      addBotMessage("No problem! What is your name?", 1500);
    } else if (stage === 'chat-email-confirm') {
      // Email not correct, ask for email again - hide buttons immediately
      setStage('chat-email');
      setFormData(prev => ({ ...prev, email: '' }));
      addBotMessage("No problem! What's your email address?", 1500);
    }
  };

  const handleSchoolChange = (school: string) => {
    setFormData(prev => ({ ...prev, school }));
  };

  const handleMajorChange = (major: string) => {
    setFormData(prev => ({ ...prev, major }));
  };

  const handleGradeChange = (grade: string) => {
    setFormData(prev => ({ ...prev, grade }));
  };

  const handleDietaryRestrictionChange = (restriction: string) => {
    setFormData(prev => ({ ...prev, dietaryRestriction: restriction }));
  };

  const handleDietaryOtherChange = (other: string) => {
    setFormData(prev => ({ ...prev, dietaryOther: other }));
  };

  const handleProfilePictureChange = (file: File | null) => {
    setFormData(prev => ({ ...prev, profilePicture: file }));
  };

  const handleGithubChange = (github: string) => {
    setFormData(prev => ({ ...prev, github }));
  };

  const handleLinkedinChange = (linkedin: string) => {
    setFormData(prev => ({ ...prev, linkedin }));
  };

  const handleDiscordChange = (discord: string) => {
    setFormData(prev => ({ ...prev, discord }));
  };

  const handleInstagramChange = (instagram: string) => {
    setFormData(prev => ({ ...prev, instagram }));
  };

  const handleResumeChange = (file: File | null) => {
    setFormData(prev => ({ ...prev, resume: file }));
  };

  const handleFirstNameChange = (firstName: string) => {
    setFormData(prev => ({ ...prev, firstName }));
  };

  const handleLastNameChange = (lastName: string) => {
    setFormData(prev => ({ ...prev, lastName }));
  };

  // Auto-submit when all required fields are filled (optional - can be used for API calls)
  React.useEffect(() => {
    if (showForm && formData.firstName && formData.lastName && formData.school && formData.major && formData.grade) {
      // Check if dietary restrictions are properly handled
      // If dietaryRestriction is empty, it means user hasn't answered yet or selected "No"
      // If dietaryRestriction is "other", dietaryOther must be filled
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
      {/* Global fixed background */}
      <div className="absolute inset-0 -z-50 pointer-events-none select-none">
        <div
          className="absolute inset-0 bg-no-repeat bg-cover"
          style={{ backgroundImage: `url(${MapOutline})`, backgroundSize: 'cover' }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-[#FFFCF5]/15" aria-hidden />
      </div>

      {/* Header - hide bee logo when form is shown */}
      <Header hideBee={showForm} />

      {/* Main Content */}
      <div className="relative min-h-[100svh] w-full flex items-center justify-center px-4 py-20">
        <motion.div 
          className="max-w-2xl w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Chat Interface - keep visible until form appears */}
          {!showForm && (
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: stage === 'form' ? 0 : 1 }}
              transition={{ duration: 1, delay: stage === 'form' ? 1 : 0 }}
            >
              <ChatInterface
                messages={messages}
                isTyping={isTyping}
                inputValue={inputValue}
                inputDisabled={inputDisabled}
                stage={stage as 'chat-name' | 'chat-confirm' | 'chat-lastname' | 'chat-email' | 'chat-email-confirm' | 'form'}
                hideButtons={hideButtons}
                onInputChange={setInputValue}
                onInputSubmit={handleInputSubmit}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
              />
            </motion.div>
          )}

          {/* Welcome Message */}
          {showForm && (
            <motion.p
              className="text-lg text-[#575f49] opacity-90 mb-4 text-center"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Welcome, <span className="font-medium">{formData.firstName} {formData.lastName}</span>
            </motion.p>
          )}

          {/* Form Interface */}
          {showForm && (
              <RegistrationForm
                firstName={formData.firstName}
                lastName={formData.lastName}
                email={formData.email}
                school={formData.school}
                major={formData.major}
                grade={formData.grade}
                dietaryRestriction={formData.dietaryRestriction}
                dietaryOther={formData.dietaryOther}
                profilePicture={formData.profilePicture}
                github={formData.github}
                linkedin={formData.linkedin}
                discord={formData.discord}
                instagram={formData.instagram}
                resume={formData.resume}
                onFirstNameChange={handleFirstNameChange}
                onLastNameChange={handleLastNameChange}
                onSchoolChange={handleSchoolChange}
                onMajorChange={handleMajorChange}
                onGradeChange={handleGradeChange}
                onDietaryRestrictionChange={handleDietaryRestrictionChange}
                onDietaryOtherChange={handleDietaryOtherChange}
                onProfilePictureChange={handleProfilePictureChange}
                onGithubChange={handleGithubChange}
                onLinkedinChange={handleLinkedinChange}
                onDiscordChange={handleDiscordChange}
                onInstagramChange={handleInstagramChange}
                onResumeChange={handleResumeChange}
              />
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;

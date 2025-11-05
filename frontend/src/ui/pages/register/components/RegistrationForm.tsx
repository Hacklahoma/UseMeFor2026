import React, { useState, useEffect, useRef } from 'react';
import * as motion from "motion/react-client";
import { useNavigate } from 'react-router-dom';
import ConfirmationButtons from './ConfirmationButtons';
import Modal from './Modal';
import BeeLogo from '../../../common/assets/BeeLogo.png';
import { FormData } from '../types';

// Signature Component
interface SignatureComponentProps {
  firstName: string;
  lastName: string;
  onComplete: () => void;
}

const SignatureComponent: React.FC<SignatureComponentProps> = ({ firstName, lastName, onComplete }) => {
  const [isWriting, setIsWriting] = useState(false);
  const [displayedName, setDisplayedName] = useState('');
  const [isCompleting, setIsCompleting] = useState(false);
  const fullName = `${firstName} ${lastName}`.trim();

  const handleSignatureClick = () => {
    if (isWriting) return; // Prevent multiple clicks
    
    setIsWriting(true);
    setDisplayedName('');
    
    // Animate writing the name letter by letter
    fullName.split('').forEach((char, index) => {
      setTimeout(() => {
        setDisplayedName(prev => prev + char);
        
        // When finished, stop writing animation and navigate
        if (index === fullName.length - 1) {
          setTimeout(() => {
            setIsWriting(false);
            setIsCompleting(true);
            // Add a brief delay before navigation to show completion
            setTimeout(() => {
              onComplete();
            }, 800); // Delay before navigation
          }, 500); // Small delay after animation completes
        }
      }, index * 50); // 50ms per character for smooth animation
    });
  };

  return (
    <div className="w-full">
      <div className="relative">
        {/* Signature line */}
        <div className="border-b-2 border-[#575f49] pb-1 min-h-[60px] flex items-center justify-center relative">
          {/* Pen icon on the left */}
          {!displayedName && (
            <svg
              className="absolute left-0 w-6 h-6 text-[#575f49]"
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
          )}
          
          {/* Click to sign button in the middle */}
          {!displayedName && (
            <button
              type="button"
              onClick={handleSignatureClick}
              className="text-[#575f49] hover:text-[#2a3a1f] transition-colors text-sm font-medium"
            >
              Click to sign and submit
            </button>
          )}
          
          {/* Signature text */}
          {displayedName && (
            <motion.span
              className="text-[#575f49] text-3xl font-serif italic inline-block"
              style={{ fontFamily: 'cursive, serif' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {displayedName}
              {/* Cursor effect while writing */}
              {isWriting && (
                <motion.span
                  className="inline-block w-0.5 h-8 bg-[#575f49] ml-1"
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                />
              )}
            </motion.span>
          )}
        </div>
      </div>
    </div>
  );
};

interface RegistrationFormProps {
  formData: FormData;
  onFieldChange: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({
  formData,
  onFieldChange,
}) => {
  const navigate = useNavigate();
  const [isNavigating, setIsNavigating] = useState(false);
  
  const {
    firstName,
    lastName,
    email,
    school,
    major,
    grade,
    dietaryRestriction,
    dietaryOther,
    profilePicture,
    github,
    linkedin,
    discord,
    instagram,
    resume,
  } = formData;

  const handleNavigation = () => {
    setIsNavigating(true);
    // Small delay to allow fade-out animation
    setTimeout(() => {
      navigate('/account', { state: { formData } });
    }, 300);
  };

  const [showSchoolSection, setShowSchoolSection] = useState(false);
  const [showMajorGradeSection, setShowMajorGradeSection] = useState(false);
  const [showDietarySection, setShowDietarySection] = useState(false);
  const [showReleaseForms, setShowReleaseForms] = useState(false);
  const [photoReleaseAccepted, setPhotoReleaseAccepted] = useState(false);
  const [liabilityReleaseAccepted, setLiabilityReleaseAccepted] = useState(false);
  const [hasDietaryRestriction, setHasDietaryRestriction] = useState<boolean | null>(null);
  const [formInitialized, setFormInitialized] = useState(false);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [liabilityModalOpen, setLiabilityModalOpen] = useState(false);

  // Initialize form and show school section after a delay
  useEffect(() => {
    if (firstName && lastName && !formInitialized) {
      // Show school section after form appears (after name/email are visible)
      const timer = setTimeout(() => {
        setFormInitialized(true);
        setShowSchoolSection(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [firstName, lastName, formInitialized]);

  // Show major/grade section when school is filled
  useEffect(() => {
    if (school && !showMajorGradeSection) {
      setShowMajorGradeSection(true);
    }
  }, [school, showMajorGradeSection]);

  // Show dietary section when school, major, and grade are filled
  useEffect(() => {
    if (school && major && grade && !showDietarySection) {
      setShowDietarySection(true);
    }
  }, [school, major, grade, showDietarySection]);

  // Show release forms section when dietary restrictions are fully answered
  useEffect(() => {
    // Show release forms only if:
    // 1. User selected "No" for dietary restrictions, OR
    // 2. User selected "Yes" AND has selected a restriction option (and filled "other" if needed)
    const isDietaryComplete = hasDietaryRestriction === false || 
      (hasDietaryRestriction === true && dietaryRestriction && 
       (dietaryRestriction !== 'other' || dietaryOther));
    
    if (isDietaryComplete && !showReleaseForms) {
      setShowReleaseForms(true);
    }
  }, [hasDietaryRestriction, dietaryRestriction, dietaryOther, showReleaseForms]);

  const [dietaryAnswer, setDietaryAnswer] = useState<'yes' | 'no' | null>(null);

  const handleDietaryYes = () => {
    setDietaryAnswer('yes');
    setHasDietaryRestriction(true);
  };

      const handleDietaryNo = () => {
        setDietaryAnswer('no');
        setHasDietaryRestriction(false);
        onFieldChange('dietaryRestriction', '');
        onFieldChange('dietaryOther', '');
      };

  const dietaryOptions = [
    { value: 'vegetarian', label: 'Vegetarian' },
    { value: 'vegan', label: 'Vegan' },
    { value: 'no-beef', label: 'No Beef' },
    { value: 'halal-only', label: 'Halal Only' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ 
        opacity: isNavigating ? 0 : 1, 
        scale: isNavigating ? 0.98 : 1, 
        y: isNavigating ? -10 : 0 
      }}
      exit={{ opacity: 0, scale: 0.98, y: -10 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="bg-[#FFFCF5]/95 backdrop-blur-sm rounded-lg shadow-lg p-6 md:p-8 relative"
    >
      {/* Bee Logo in top right corner */}
      <motion.div
        className="absolute top-4 right-4 md:top-6 md:right-6"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <img 
          src={BeeLogo}
          alt="Hacklahoma Bee Logo"
          className="w-10 h-10 md:w-12 md:h-12 object-contain"
        />
      </motion.div>

      <div className="mb-6 pr-16">
        <h1 className="text-3xl md:text-4xl font-semibold text-[#3D472C] font-serif">
          Register for Hacklahoma
        </h1>
      </div>

      <div className="space-y-6 overflow-visible">
        {/* Name and Email Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-[#3D472C] font-medium mb-2">
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={firstName}
              onChange={(e) => onFieldChange('firstName', e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-[#575f49] rounded bg-[#FFFCF5] text-[#3D472C] focus:outline-none focus:ring-2 focus:ring-[#575f49] focus:border-transparent transition-all"
              placeholder="Enter your first name"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-[#3D472C] font-medium mb-2">
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={lastName}
              onChange={(e) => onFieldChange('lastName', e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-[#575f49] rounded bg-[#FFFCF5] text-[#3D472C] focus:outline-none focus:ring-2 focus:ring-[#575f49] focus:border-transparent transition-all"
              placeholder="Enter your last name"
            />
          </div>
        </div>

        {/* Email Field (Read-only) */}
        <div>
          <label className="block text-[#3D472C] font-medium mb-2">
            Email
          </label>
          <div className="px-4 py-3 border-2 border-[#575f49]/50 rounded bg-[#FFFCF5] text-[#3D472C] opacity-75">
            {email}
          </div>
        </div>

        {/* School Field (Full Width) - appears after name fields are filled */}
        {showSchoolSection && (
          <motion.div
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="overflow-visible"
          >
            <label htmlFor="school" className="block text-[#3D472C] font-medium mb-2">
              School
            </label>
            <input
              type="text"
              id="school"
              name="school"
              value={school}
                  onChange={(e) => onFieldChange('school', e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-[#575f49] rounded bg-[#FFFCF5] text-[#3D472C] focus:outline-none focus:ring-2 focus:ring-[#575f49] focus:border-transparent transition-all"
              placeholder="Enter your school"
            />
          </motion.div>
        )}

        {/* Major and Grade Fields (2 units and 1 unit) - appears after school is filled */}
        {showMajorGradeSection && (
          <motion.div
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 overflow-visible"
          >
            {/* Major Field - 2 units */}
            <motion.div
              className="md:col-span-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <label htmlFor="major" className="block text-[#3D472C] font-medium mb-2">
                Major
              </label>
              <input
                type="text"
                id="major"
                name="major"
                value={major}
                    onChange={(e) => onFieldChange('major', e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-[#575f49] rounded bg-[#FFFCF5] text-[#3D472C] focus:outline-none focus:ring-2 focus:ring-[#575f49] focus:border-transparent transition-all"
                placeholder="Enter your major"
              />
            </motion.div>

            {/* Grade Field - 1 unit */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <label htmlFor="grade" className="block text-[#3D472C] font-medium mb-2">
                Grade
              </label>
              <input
                type="text"
                id="grade"
                name="grade"
                value={grade}
                    onChange={(e) => onFieldChange('grade', e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-[#575f49] rounded bg-[#FFFCF5] text-[#3D472C] focus:outline-none focus:ring-2 focus:ring-[#575f49] focus:border-transparent transition-all"
                placeholder="Enter your grade"
              />
            </motion.div>
          </motion.div>
        )}

        {/* Dietary Restrictions Section - appears after major and grade are filled */}
        {showDietarySection && (
          <motion.div
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="space-y-4 overflow-visible"
          >
            <div className="flex items-center justify-between gap-4">
              <label className="text-[#3D472C] font-medium">
                Do you have any dietary restrictions?
              </label>
              
              {/* Yes/No buttons - on the same line, to the right */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleDietaryYes}
                  className={`px-4 py-2 border-2 rounded text-sm font-medium transition-colors ${
                    hasDietaryRestriction === true
                      ? 'border-[#575f49] bg-[#575f49] text-[#F5F5DC]'
                      : 'border-[#575f49] text-[#575f49] hover:bg-[#575f49] hover:text-[#F5F5DC]'
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={handleDietaryNo}
                  className={`px-4 py-2 border-2 rounded text-sm font-medium transition-colors ${
                    hasDietaryRestriction === false
                      ? 'border-[#575f49] bg-[#575f49] text-[#F5F5DC]'
                      : 'border-[#575f49] text-[#575f49] hover:bg-[#575f49] hover:text-[#F5F5DC]'
                  }`}
                >
                  No
                </button>
              </div>
            </div>
            
            {/* Show options if Yes was selected */}
            {hasDietaryRestriction === true && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {dietaryOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => onFieldChange('dietaryRestriction', option.value)}
                      className={`flex items-center gap-2 p-3 border-2 border-[#575f49] rounded transition-colors ${
                        dietaryRestriction === option.value
                          ? 'bg-[#575f49] text-[#F5F5DC]'
                          : 'bg-[#FFFCF5] text-[#3D472C] hover:bg-[#e8e8c7]'
                      } ${option.value === 'other' ? 'md:col-span-2' : ''}`}
                    >
                      <span className="flex-shrink-0">{option.label}</span>
                      {option.value === 'other' && (
                        <input
                          type="text"
                          value={dietaryOther}
                          onChange={(e) => onFieldChange('dietaryOther', e.target.value)}
                          disabled={dietaryRestriction !== 'other'}
                          required={dietaryRestriction === 'other'}
                          placeholder="Please specify"
                          onClick={(e) => e.stopPropagation()}
                          className={`flex-1 px-3 py-1.5 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#575f49] transition-all ${
                            dietaryRestriction === 'other'
                              ? dietaryRestriction === option.value
                                ? 'bg-[#F5F5DC] text-[#575f49] placeholder:text-[#575f49]/60 border-[#F5F5DC] focus:border-[#575f49]'
                                : 'bg-[#FFFCF5] text-[#3D472C] border-[#575f49]'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-300'
                          }`}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Release Forms Section - appears after dietary restrictions are answered */}
        {showReleaseForms && (
          <motion.div
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
            className="space-y-4 overflow-visible"
          >
            <label className="block text-[#3D472C] font-medium mb-2">
              Please review and agree to the following:
            </label>
            
            <div className="space-y-4">
              {/* Photo and Recording Release */}
              <motion.div
                className="flex items-center justify-between gap-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <span className="text-[#3D472C] flex-1">
                  I agree to the{' '}
                  <button
                    type="button"
                    onClick={() => setPhotoModalOpen(true)}
                    className="text-[#575f49] underline hover:text-[#2a3a1f] transition-colors"
                  >
                    Photo and Recording Release Form
                  </button>
                </span>
                <input
                  type="checkbox"
                  checked={photoReleaseAccepted}
                  onChange={(e) => setPhotoReleaseAccepted(e.target.checked)}
                  required
                  className="w-5 h-5 text-[#575f49] focus:ring-[#575f49] rounded border-2 border-[#575f49] cursor-pointer"
                />
              </motion.div>

              {/* Release of Liability */}
              <motion.div
                className="flex items-center justify-between gap-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <span className="text-[#3D472C] flex-1">
                  I agree to the{' '}
                  <button
                    type="button"
                    onClick={() => setLiabilityModalOpen(true)}
                    className="text-[#575f49] underline hover:text-[#2a3a1f] transition-colors"
                  >
                    Release of Liability Form
                  </button>
                </span>
                <input
                  type="checkbox"
                  checked={liabilityReleaseAccepted}
                  onChange={(e) => setLiabilityReleaseAccepted(e.target.checked)}
                  required
                  className="w-5 h-5 text-[#575f49] focus:ring-[#575f49] rounded border-2 border-[#575f49] cursor-pointer"
                />
              </motion.div>
            </div>
          </motion.div>
        )}

            {/* Modals */}
            <Modal
              isOpen={photoModalOpen}
              onClose={() => setPhotoModalOpen(false)}
              title="Photo and Recordings Release Form"
              bodyText={
`In consideration of my opportunity to participate in the University of Oklahoma ("OU") Hacklahoma 2026 Program (the "Program"), I, the undersigned, give my permission for and grand OU the irrevocable right to:
● Interview me and/or record my participation in the Program and appearance on video tape, audio tape, film, photograph, or any other media, whether now known or hereafter existing (the "Recordings").
● Use my name, likeness, image, and/or voice in connection with the Recordings.
● Use, reproduce, distribute, publicly display and/or publicly perform, either electronically or by any other media whether now known or hereafter existing, and to allow others to do the same, my name, likeness, or voice, the Recordings, and/or copies of the materials listed below (the "Materials"), in whole or in part worldwide, without restrictions or limitations, in perpetuity, for any purpose including without limitation, promotional, educational or commercial use.
● I agree to release OU, its trustees, officers, employees, students, and agents from any liability to me, and on behalf of my heirs, executors, administrators, legal representatives and assigns, based on or arising out of the use of my name, likeness, or voice, or the Recordings or Materials.
● I agree to make no accounting, monetary or other claims against OU for use of my name, likeness, or voice, the Recordings, or the Materials.
I have read this Photo and Recordings Release Form and understand its terms. I sign it voluntarily and with full knowledge of its significance.`}
              downloadUrl="/docs/Photo and Recordings Release Form 2026.pdf"
            />
            <Modal
              isOpen={liabilityModalOpen}
              onClose={() => setLiabilityModalOpen(false)}
              title="Release for The University of Oklahoma Liability Release and Acknowledgement of Rules and Guidelines"
              bodyText={
`This Release is executed and acknowledged on the day of submission of the confirmation form, (attendee) hereinafter referred to as "Releasor" for good and valuable consideration does for himself/herself and personal representatives, heirs, assigns, and next-of-kin hereby release, waive, forever discharge, indemnify and covenant not to sue the Board of Regents of the University of Oklahoma, its officers, members, employees, volunteers, agents and representatives, hereinafter collectively referred to as 'Releasees," and agrees to hold harmless, defend and indemnify the same, for any and all loss, damages, claim, demand, action or right of action of whatsoever kind of nature, either in law or in equity, arising from or by reason of any personal injury, known or unknown, death and/or property damage resulting or to result from participation in Hacklahoma February 7 - 8, 2026 on the University of Oklahoma Norman campus whether sponsored by The University of Oklahoma or third party (collectively referred to as the "Activity" or "Program").
I know the nature of the Activity, and I certify that there are no health-related reasons that prevent me from safely participating in the Activity. However, I acknowledge that there are certain risks of physical injury or illness associated with the Activity. Further, I recognize and acknowledge the potential risks and dangers involved in such an Activity and its related activities associated with the Activity may include personal injury, death, and/or property damage.
I acknowledge and hereby state that my participation in this Activity is entered into as a free and voluntary act and is in no way connected with any course credit or requirements of the
Releasees. I acknowledge that I have read the OU rules stated herein or as otherwise advised at the time of the Activity, and as published on the University's websites, www.judicial.ou.edu and www.ou.edu/home/misc.html, and understand and agree to abide by all University and Activity rules and policies.
Failure to comply with these rules or any other rule established by the Program/Activity may result in immediate removal from the Program/Activity. I waive any claim for any contract right upon removal.
I recognize that the Releasees do not assume responsibility or liability for - including costs and attorney's fees - any accident or injury or damage resulting from any aspect of participating in the Activity. The Releasees are not liable for any special, incidental, or consequential damages arising out of or in connection with any aspect of participation in the Activity.
This Release contains the entire agreement between the parties hereto and the terms of this Release are contractual and not a mere recital. Releasor further states that s/he has carefully read the foregoing Release and Acknowledgement as his/her own free and voluntary act.
Further, I hereby give consent and authorize said Program, the University of Oklahoma, and its agents, representatives, and employees to secure emergency medical treatment for me while I am in attendance at said Program conducted by The University of Oklahoma and that I am responsible for any and all costs associated with the transportation and treatment.
I certify that I have read and understand the Activity rules. I understand and agree to notify the Program supervisor Anindya Maiti at (405) 325-4951 immediately of any injuries I sustain as a result of the Activity and of any inappropriate behavior I experience related to the Activity. I also understand and agree that should any issues of sexual misconduct, harassment, or assault occur, I will immediately report those to both the Program supervisor Anindya Maiti at (405) 325-4951 as well as the University's Title IX Coordinator, Christine Taylor at (405) 325-3546, www.ou.edu/home/misc.html.
I understand that by signing this document, I give up substantial rights that I would otherwise have to recover damages for any loss occasioned by Releasees' fault, and I sign it voluntarily and without inducement.`
}
              downloadUrl="/docs/Release of Liability 2026.pdf"
            />

        {/* Signature Component - appears after both release forms are accepted */}
        {showReleaseForms && photoReleaseAccepted && liabilityReleaseAccepted && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="pt-6"
          >
            <SignatureComponent 
              firstName={firstName} 
              lastName={lastName}
              onComplete={handleNavigation}
            />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default RegistrationForm;


import React, { useState, useEffect, useMemo } from 'react';
import * as motion from "motion/react-client";
import { useLocation, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { FormData } from '../register/types';
import Header from '../register/components/Header';
import { Background } from '../register/components/Background';
import EditableField from './components/EditableField';
import SocialMediaLinks from './components/SocialMediaLinks';
import BeeLogo from '../../common/assets/BeeLogo.png';

const AccountPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const formData = location.state?.formData as FormData | undefined;

  // If no form data, redirect to register
  useEffect(() => {
    if (!formData) {
      navigate('/register');
    }
  }, [formData, navigate]);

  if (!formData) {
    return null;
  }

  const [accountData, setAccountData] = useState({
    firstName: formData.firstName,
    lastName: formData.lastName,
    school: formData.school,
    major: formData.major,
    grade: formData.grade,
    streetAddress: '',
    city: '',
    state: '',
    zip: '',
    profilePicture: null as File | null,
    tshirtSize: '',
    sweatshirtSize: '',
    github: formData.github || '',
    linkedin: formData.linkedin || '',
    discord: formData.discord || '',
    instagram: formData.instagram || '',
  });
  const [useCustomAddress, setUseCustomAddress] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [checkIn, setCheckIn] = useState(false);
  const [merchReceived, setMerchReceived] = useState(false);
  const [lunchReceived, setLunchReceived] = useState(false);
  const [dinnerReceived, setDinnerReceived] = useState(false);
  const [midnightSnackReceived, setMidnightSnackReceived] = useState(false);
  const [breakfastReceived, setBreakfastReceived] = useState(false);
  const [workshopCount, setWorkshopCount] = useState(0);

  // Check if desktop (md breakpoint and above)
  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  // Generate JSON data for QR code
  const qrCodeData = useMemo(() => {
    return JSON.stringify({
      name: `${accountData.firstName} ${accountData.lastName}`,
      email: formData.email
    });
  }, [accountData.firstName, accountData.lastName, formData.email]);

  const handleFieldChange = <K extends keyof typeof accountData>(
    field: K,
    value: typeof accountData[K]
  ) => {
    setAccountData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="relative min-h-[100svh] w-full overflow-x-hidden">
      <Background />
      <Header hideBee={false} />

          <div className="relative min-h-[100svh] w-full flex items-center justify-center px-4 py-20">
            <motion.div
              className="max-w-5xl w-full"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
          {/* Flip Container */}
          <div style={{ perspective: '1000px' }}>
            <motion.div
              className="relative w-full"
              style={{ transformStyle: 'preserve-3d' }}
              animate={{ 
                rotateY: isDesktop ? 0 : (isFlipped ? 180 : 0),
                rotateX: isDesktop ? (isFlipped ? 180 : 0) : 0
              }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
            >
              {/* Front Side - US Passport Style Card */}
              <motion.div
                className="bg-[#1a3a2e] rounded-lg shadow-2xl overflow-hidden border-4 border-[#2a4a3e] w-full"
                style={{ 
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden'
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                    {/* Passport Cover - Blue */}
                    <div className="bg-gradient-to-b from-[#1a3a2e] via-[#2a4a3e] to-[#1a3a2e] py-4 px-6 border-b-3 border-[#3D472C]">
                      <div className="flex items-center justify-between">
                        <div className="text-[#F5F5DC]">
                          <h1 className="text-xl md:text-2xl font-serif font-bold">HACKLAHOMA 2026</h1>
                        </div>
                        <div className="flex items-center gap-3">
                          {/* Flip Button */}
                          <button
                            onClick={() => setIsFlipped(!isFlipped)}
                            className="text-[#F5F5DC] hover:text-[#e8e8c7] transition-colors"
                            title="Flip passport"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>

            {/* Passport Content - Horizontal Layout */}
            <div className="bg-[#FFFCF5] p-4 md:p-6 relative overflow-hidden">
              {/* Background Bee Logo */}
              <div className="absolute inset-0 flex pointer-events-none overflow-hidden">
                {/* Mobile: Center horizontally, positioned in bottom 40% */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-[10%] flex items-end justify-center md:hidden">
                  <img
                    src={BeeLogo}
                    alt="Hacklahoma Bee Logo"
                    className="opacity-20"
                    style={{ 
                      height: '75%',
                      width: 'auto',
                      maxWidth: 'none'
                    }}
                  />
                </div>
                {/* Desktop: Rule of thirds position, vertically centered */}
                <div className="hidden md:flex absolute left-[66.67%] -translate-x-1/2 items-center justify-center" style={{ height: '100%' }}>
                  <img
                    src={BeeLogo}
                    alt="Hacklahoma Bee Logo"
                    className="opacity-20"
                    style={{ 
                      height: '75%',
                      width: 'auto',
                      maxWidth: 'none'
                    }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4 relative z-10">
                {/* Left Column - Photo Section */}
                <div className="md:col-span-2">
                  <div className="bg-white border-3 border-[#575f49] rounded-lg p-2 aspect-square flex items-center justify-center relative">
                    {accountData.profilePicture ? (
                      <img
                        src={URL.createObjectURL(accountData.profilePicture)}
                        alt="Profile"
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <div className="text-center text-[#575f49]">
                        <svg
                          className="w-20 h-20 mx-auto mb-3 opacity-50"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        <label className="cursor-pointer text-xs font-medium hover:text-[#2a3a1f] transition-colors">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFieldChange('profilePicture', file);
                            }}
                          />
                          Upload Photo
                        </label>
                      </div>
                    )}
                    {accountData.profilePicture && (
                      <button
                        onClick={() => handleFieldChange('profilePicture', null)}
                        className="absolute top-2 right-2 bg-[#575f49] text-[#F5F5DC] rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-[#2a3a1f] transition-colors"
                        title="Remove photo"
                      >
                        ×
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-[#575f49] text-center mt-1.5 font-semibold mb-3">PHOTO</p>
                  
                  {/* Social Media Links */}
                  <div className="mt-4">
                    <SocialMediaLinks
                      github={accountData.github}
                      linkedin={accountData.linkedin}
                      discord={accountData.discord}
                      instagram={accountData.instagram}
                      onChange={(platform, value) => handleFieldChange(platform, value)}
                    />
                  </div>
                </div>

                {/* Right Column - Information Fields */}
                <div className="md:col-span-4 space-y-3">
                  {/* Name - First Name and Last Name */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-[#575f49] uppercase tracking-wider font-semibold block mb-1">
                        FIRST NAME
                      </label>
                      <div className="border-b-2 border-[#575f49] pb-0.5 min-h-[28px] flex items-center">
                        <EditableField
                          value={accountData.firstName}
                          onChange={(value) => handleFieldChange('firstName', value)}
                          isEditMode={isEditMode}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-[#575f49] uppercase tracking-wider font-semibold block mb-1">
                        LAST NAME
                      </label>
                      <div className="border-b-2 border-[#575f49] pb-0.5 min-h-[28px] flex items-center">
                        <EditableField
                          value={accountData.lastName}
                          onChange={(value) => handleFieldChange('lastName', value)}
                          isEditMode={isEditMode}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-[10px] text-[#575f49] uppercase tracking-wider font-semibold block mb-1">
                      EMAIL ADDRESS
                    </label>
                    <div className="border-b-2 border-[#575f49]/50 pb-0.5 min-h-[28px] flex items-center">
                      <span className="text-xs text-[#3D472C] font-serif opacity-75">
                        {formData.email}
                      </span>
                    </div>
                  </div>

                  {/* School, Major, Grade in a row with appropriate widths */}
                  <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-6">
                      <label className="text-[10px] text-[#575f49] uppercase tracking-wider font-semibold block mb-1">
                        SCHOOL
                      </label>
                      <div className="border-b-2 border-[#575f49] pb-0.5 min-h-[28px] flex items-center">
                        <EditableField
                          value={accountData.school}
                          onChange={(value) => handleFieldChange('school', value)}
                          isEditMode={isEditMode}
                        />
                      </div>
                    </div>
                    <div className="col-span-4">
                      <label className="text-[10px] text-[#575f49] uppercase tracking-wider font-semibold block mb-1">
                        MAJOR
                      </label>
                      <div className="border-b-2 border-[#575f49] pb-0.5 min-h-[28px] flex items-center">
                        <EditableField
                          value={accountData.major}
                          onChange={(value) => handleFieldChange('major', value)}
                          isEditMode={isEditMode}
                        />
                      </div>
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] text-[#575f49] uppercase tracking-wider font-semibold block mb-1">
                        GRADE
                      </label>
                      <div className="border-b-2 border-[#575f49] pb-0.5 min-h-[28px] flex items-center">
                        <EditableField
                          value={accountData.grade}
                          onChange={(value) => handleFieldChange('grade', value)}
                          isEditMode={isEditMode}
                        />
                      </div>
                    </div>
                  </div>

                  {/* T-Shirt / Sweatshirt Size Section */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-[#575f49] uppercase tracking-wider font-semibold block mb-1">
                        T-SHIRT SIZE
                      </label>
                      <div className="border-b-2 border-[#575f49] pb-0.5 min-h-[28px] flex items-center">
                        <EditableField
                          value={accountData.tshirtSize}
                          onChange={(value) => handleFieldChange('tshirtSize', value)}
                          type="select"
                          selectOptions={[
                            { value: '', label: 'Select' },
                            { value: 'XS', label: 'XS' },
                            { value: 'S', label: 'S' },
                            { value: 'M', label: 'M' },
                            { value: 'L', label: 'L' },
                            { value: 'XL', label: 'XL' },
                            { value: '2XL', label: '2XL' },
                            { value: '3XL', label: '3XL' },
                          ]}
                          isEditMode={isEditMode}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-[#575f49] uppercase tracking-wider font-semibold block mb-1">
                        SWEATSHIRT SIZE
                      </label>
                      <div className="border-b-2 border-[#575f49] pb-0.5 min-h-[28px] flex items-center">
                        <EditableField
                          value={accountData.sweatshirtSize}
                          onChange={(value) => handleFieldChange('sweatshirtSize', value)}
                          type="select"
                          selectOptions={[
                            { value: '', label: 'Select' },
                            { value: 'XS', label: 'XS' },
                            { value: 'S', label: 'S' },
                            { value: 'M', label: 'M' },
                            { value: 'L', label: 'L' },
                            { value: 'XL', label: 'XL' },
                            { value: '2XL', label: '2XL' },
                            { value: '3XL', label: '3XL' },
                          ]}
                          isEditMode={isEditMode}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Address Section */}
                  <div className="grid grid-cols-12 gap-3">
                    {/* Left Column - Title, Checkbox, and Question Mark */}
                    <div className="col-span-3">
                      <label className="text-[10px] text-[#575f49] uppercase tracking-wider font-semibold block mb-1">
                        ADDRESS
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="useCustomAddress"
                          checked={useCustomAddress}
                          onChange={(e) => setUseCustomAddress(e.target.checked)}
                          className="w-4 h-4 text-[#575f49] border-[#575f49] rounded focus:ring-[#575f49]"
                        />
                        <div className="relative">
                          <button
                            type="button"
                            className="text-[#575f49] hover:text-[#2a3a1f] transition-colors cursor-help"
                            onMouseEnter={() => setShowTooltip(true)}
                            onMouseLeave={() => setShowTooltip(false)}
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
                                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </button>
                          {showTooltip && (
                            <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-[#3D472C] text-[#F5F5DC] text-xs rounded-lg shadow-lg z-10">
                              <p className="text-center">
                                A special gift will be mailed out to participants after the event has ended.
                              </p>
                              <div className="absolute top-full left-4 -mt-1">
                                <div className="border-4 border-transparent border-t-[#3D472C]"></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Right Column - Address Lines */}
                    <div className="col-span-9 relative h-[60px]">
                      {useCustomAddress ? (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="space-y-1.5 h-full flex flex-col justify-between"
                        >
                          <div className="border-b-2 border-[#575f49] pb-0.5 min-h-[24px] flex items-center">
                            <EditableField
                              value={accountData.streetAddress}
                              onChange={(value) => handleFieldChange('streetAddress', value)}
                              placeholder="Street address"
                              isEditMode={isEditMode}
                            />
                          </div>
                          <div className="grid grid-cols-12 gap-2">
                            <div className="col-span-6">
                              <div className="border-b-2 border-[#575f49] pb-0.5 min-h-[24px] flex items-center">
                                <EditableField
                                  value={accountData.city}
                                  onChange={(value) => handleFieldChange('city', value)}
                                  placeholder="City"
                                  isEditMode={isEditMode}
                                />
                              </div>
                            </div>
                            <div className="col-span-3">
                              <div className="border-b-2 border-[#575f49] pb-0.5 min-h-[24px] flex items-center">
                                <EditableField
                                  value={accountData.state}
                                  onChange={(value) => handleFieldChange('state', value)}
                                  placeholder="State"
                                  isEditMode={isEditMode}
                                />
                              </div>
                            </div>
                            <div className="col-span-3">
                              <div className="border-b-2 border-[#575f49] pb-0.5 min-h-[24px] flex items-center">
                                <EditableField
                                  value={accountData.zip}
                                  onChange={(value) => handleFieldChange('zip', value)}
                                  placeholder="ZIP"
                                  isEditMode={isEditMode}
                                />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="space-y-1 h-full flex flex-col justify-center"
                        >
                          <div className="border-b-2 border-[#575f49]/50 pb-0.5 min-h-[24px] flex items-center">
                            <span className="text-xs text-[#3D472C] font-serif opacity-75">
                              101 Boyd Street
                            </span>
                          </div>
                          <div className="border-b-2 border-[#575f49]/50 pb-0.5 min-h-[24px] flex items-center">
                            <span className="text-xs text-[#3D472C] font-serif opacity-75">
                              Norman, OK 73069
                            </span>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* Signature */}
                  <div className="pt-1.5">
                    <label className="text-[10px] text-[#575f49] uppercase tracking-wider font-semibold block mb-1.5">
                      SIGNATURE
                    </label>
                    <div className="border-b-2 border-[#575f49] pb-1.5 min-h-[32px] flex items-center">
                      <p className="text-lg text-[#575f49] font-serif italic">
                        {accountData.firstName} {accountData.lastName}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Passport Footer - Official Text */}
            <div className="bg-[#e8e8c7] border-t-3 border-[#575f49] py-3 px-6 relative">
              <div className="text-center">
                <p className="text-[10px] text-[#575f49] font-serif italic mb-1.5">
                  This card certifies that the bearer is a registered participant of Hacklahoma 2026
                </p>
                <p className="text-[9px] text-[#575f49] opacity-75">
                  HACKLAHOMA 2026 • NORMAN, OKLAHOMA
                </p>
              </div>
              {/* Edit Button */}
              <button
                onClick={() => setIsEditMode(!isEditMode)}
                className="absolute top-1/2 -translate-y-1/2 right-6 text-[#575f49] hover:text-[#2a3a1f] transition-colors"
                title={isEditMode ? "Done editing" : "Edit passport"}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={isEditMode
                      ? "M5 13l4 4L19 7"
                      : "M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    }
                  />
                </svg>
              </button>
            </div>
              </motion.div>

              {/* Back Side - QR Code */}
              <motion.div
                className="bg-[#1a3a2e] rounded-lg shadow-2xl overflow-hidden border-4 border-[#2a4a3e] w-full absolute inset-0 flex flex-col"
                style={{ 
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: isDesktop ? 'rotateX(180deg)' : 'rotateY(180deg)'
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {/* Passport Cover - Blue (Back) */}
                <div className="bg-gradient-to-b from-[#1a3a2e] via-[#2a4a3e] to-[#1a3a2e] py-4 px-6 border-b-3 border-[#3D472C]">
                  <div className="flex items-center justify-between">
                    <div className="text-[#F5F5DC]">
                      <h1 className="text-xl md:text-2xl font-serif font-bold">HACKLAHOMA 2026</h1>
                    </div>
                    <div className="flex items-center gap-3">
                      {/* Flip Button */}
                      <button
                        onClick={() => setIsFlipped(!isFlipped)}
                        className="text-[#F5F5DC] hover:text-[#e8e8c7] transition-colors"
                        title="Flip passport"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* QR Code Content */}
                <div className="bg-[#FFFCF5] p-4 md:p-6 flex-1 flex items-center">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 w-full">
                    {/* Left Column - QR Code Section */}
                    <div className="flex flex-col items-center justify-center">
                      {/* QR Code */}
                      <div className="bg-white p-4 rounded-lg shadow-lg border-4 border-[#575f49] mb-4">
                        <QRCodeSVG
                          value={qrCodeData}
                          size={200}
                          level="H"
                          includeMargin={true}
                          fgColor="#575f49"
                          bgColor="#FFFFFF"
                        />
                      </div>

                      {/* Participant Name */}
                      <div className="text-center">
                        <p className="text-base md:text-lg font-serif text-[#3D472C] font-semibold">
                          {accountData.firstName} {accountData.lastName}
                        </p>
                      </div>
                    </div>

                    {/* Right Column - Three Subsections */}
                    <div className="flex flex-col justify-center space-y-6">
                      {/* Check-in Section */}
                      <div>
                        <h3 className="text-sm md:text-base font-serif font-bold text-[#3D472C] mb-3">
                          Check-In
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { label: 'Check In', checked: checkIn, onChange: setCheckIn },
                            { label: 'Merch Grab', checked: merchReceived, onChange: setMerchReceived },
                          ].map((item) => (
                            <label
                              key={item.label}
                              className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-[#e8e8c7] transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={item.checked}
                                onChange={(e) => item.onChange(e.target.checked)}
                                className="w-5 h-5 text-[#575f49] border-2 border-[#575f49] rounded focus:ring-[#575f49] cursor-pointer"
                              />
                              <span className="text-sm text-[#3D472C] font-medium">
                                {item.label}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Meals Section */}
                      <div>
                        <h3 className="text-sm md:text-base font-serif font-bold text-[#3D472C] mb-3">
                          Meals
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { label: 'Lunch', checked: lunchReceived, onChange: setLunchReceived },
                            { label: 'Dinner', checked: dinnerReceived, onChange: setDinnerReceived },
                            { label: 'Midnight Snack', checked: midnightSnackReceived, onChange: setMidnightSnackReceived },
                            { label: 'Breakfast', checked: breakfastReceived, onChange: setBreakfastReceived },
                          ].map((item) => (
                            <label
                              key={item.label}
                              className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-[#e8e8c7] transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={item.checked}
                                onChange={(e) => item.onChange(e.target.checked)}
                                className="w-5 h-5 text-[#575f49] border-2 border-[#575f49] rounded focus:ring-[#575f49] cursor-pointer"
                              />
                              <span className="text-sm text-[#3D472C] font-medium">
                                {item.label}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Workshops Section */}
                      <div>
                        <div className="flex items-center p-2 rounded mt-2">
                          <span className="text-sm text-[#3D472C] font-medium">
                            Workshops Attended:
                          </span>
                          <span className="ml-2 text-xl font-serif font-bold text-[#3D472C]">
                            {workshopCount}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Passport Footer - Official Text (Back) */}
                <div className="bg-[#e8e8c7] border-t-3 border-[#575f49] py-3 px-6 flex-shrink-0">
                  <div className="text-center">
                    <p className="text-[10px] text-[#575f49] font-serif italic mb-1.5">
                      This card certifies that the bearer is a registered participant of Hacklahoma 2026
                    </p>
                    <p className="text-[9px] text-[#575f49] opacity-75">
                      HACKLAHOMA 2026 • NORMAN, OKLAHOMA
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AccountPage;


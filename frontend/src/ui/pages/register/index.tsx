import React, { useState } from 'react';
import MapOutline from '../../common/assets/OK_Norman_706465_1936_625001.png';
import BeeLogo from '../../common/assets/BeeLogo.png';
import { Link } from 'react-router-dom';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Demo form - just log the data for now
    console.log('Form submitted:', formData);
  };

  return (
    <div className="relative min-h-[100svh] w-full overflow-x-hidden">
      {/* Global fixed background so sections share the same image */}
      <div className="absolute inset-0 -z-50 pointer-events-none select-none">
        <div
          className="absolute inset-0 bg-no-repeat bg-cover"
          style={{ backgroundImage: `url(${MapOutline})`, backgroundSize: 'cover' }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-[#FFFCF5]/15" aria-hidden />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 h-20 w-full bg-gradient-to-b from-[#FFFCF5] via-[#FFFCF5] to-transparent z-50">
        <div className="h-full flex top-1 items-center justify-start px-6 relative">
          {/* Centered bee icon */}
          <Link to="/" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 block">
            <img 
              src={BeeLogo}
              alt="Hacklahoma Bee Logo"
              className="w-11 h-11 object-contain"
            />
          </Link>
          {/* Desktop Navigation */}
          <nav className="hidden min-[600px]:flex flex-col items-start space-y-[-0.25rem] mt-8 ml-3">
            <Link to="/" className="text-[#3D472C] hover:text-[#2a3a1f] transition-colors">home</Link>
            <Link to="#" className="text-[#3D472C] hover:text-[#2a3a1f] transition-colors">login</Link>
            <Link to="#" className="text-[#3D472C] hover:text-[#2a3a1f] transition-colors">faq</Link>
            <Link to="/register" className="text-[#3D472C] hover:text-[#2a3a1f] transition-colors">apply</Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative min-h-[100svh] w-full flex items-center justify-center px-4 py-20">
        <div className="max-w-md w-full">
          <div className="mb-8 text-center">
            <h1 className="text-4xl md:text-5xl font-semibold text-[#3D472C] font-serif mb-2">
              Register for Hacklahoma
            </h1>
            <p className="text-lg text-[#575f49] opacity-90">
              Join Oklahoma's Largest Hackathon
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* First Name Field */}
            <div>
              <label htmlFor="firstName" className="block text-[#3D472C] font-medium mb-2">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-[#575f49] rounded bg-[#FFFCF5] text-[#3D472C] focus:outline-none focus:ring-2 focus:ring-[#575f49] focus:border-transparent transition-all"
                placeholder="Enter your first name"
              />
            </div>

            {/* Last Name Field */}
            <div>
              <label htmlFor="lastName" className="block text-[#3D472C] font-medium mb-2">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-[#575f49] rounded bg-[#FFFCF5] text-[#3D472C] focus:outline-none focus:ring-2 focus:ring-[#575f49] focus:border-transparent transition-all"
                placeholder="Enter your last name"
              />
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-[#3D472C] font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-[#575f49] rounded bg-[#FFFCF5] text-[#3D472C] focus:outline-none focus:ring-2 focus:ring-[#575f49] focus:border-transparent transition-all"
                placeholder="Enter your email address"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full px-6 py-3 border-2 border-[#575f49] text-[#575f49] font-medium hover:bg-[#575f49] hover:text-[#F5F5DC] transition-colors duration-300 rounded"
            >
              Continue Registration
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;


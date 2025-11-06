const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName:  { type: String, required: true },
  email:     { type: String, required: true, unique: true },
  password:  { type: String, required: true },
  school:    { type: String },
  major:     { type: String },
  grade:     { type: String },
  role:      { type: String, enum: ['hacker', 'staff'], default: 'hacker' },
  
  // Profile
  profilePicture: { type: String, default: '' },
  resume: { type: String, default: '' },
  
  // Social Links
  socialLinks: {
    github: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    discord: { type: String, default: '' },
    instagram: { type: String, default: '' }
  },
  
  // Dietary Information
  dietaryRestriction: { type: String, default: '' },
  dietaryOther: { type: String, default: '' },
  
  // Release Forms
  photoReleaseAccepted: { type: Boolean, default: false },
  liabilityReleaseAccepted: { type: Boolean, default: false },
  
  // Address Information
  address: {
    streetAddress: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    zip: { type: String, default: '' },
    useCustomAddress: { type: Boolean, default: false }
  },
  
  // Merchandise Sizes
  tshirtSize: { type: String, default: '' },
  sweatshirtSize: { type: String, default: '' },
  
  // Check-in and Meals
  checkIn: { type: Boolean, default: false },
  merchReceived: { type: Boolean, default: false },
  lunchReceived: { type: Boolean, default: false },
  dinnerReceived: { type: Boolean, default: false },
  midnightSnackReceived: { type: Boolean, default: false },
  breakfastReceived: { type: Boolean, default: false },

  // Workshops
  workshopCount: { type: Number, default: 0 }
  
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
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
  profilePicture: { type: String, default: '' },
  socialLinks: {
    github: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    discord: { type: String, default: '' },
    instagram: { type: String, default: '' }
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
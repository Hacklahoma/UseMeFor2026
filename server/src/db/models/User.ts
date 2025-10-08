import mongoose, { Document, Schema } from 'mongoose';

// User role enum
export enum UserRole {
  HACKER = 'hacker',
  STAFF = 'staff'
}

// Social links interface
export interface SocialLinks {
  github?: string;
  linkedin?: string;
  discord?: string;
  instagram?: string;
}

// User interface for TypeScript
export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  school?: string;
  major?: string;
  grade?: string;
  role: UserRole;
  profilePicture?: string;
  socialLinks: SocialLinks;
  createdAt: Date;
  updatedAt: Date;
}

// User schema
const userSchema = new Schema<IUser>({
  firstName: { 
    type: String, 
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: { 
    type: String, 
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'], 
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long']
  },
  school: { 
    type: String,
    trim: true,
    maxlength: [100, 'School name cannot exceed 100 characters']
  },
  major: { 
    type: String,
    trim: true,
    maxlength: [100, 'Major cannot exceed 100 characters']
  },
  grade: { 
    type: String,
    trim: true,
    maxlength: [50, 'Grade cannot exceed 50 characters']
  },
  role: { 
    type: String, 
    enum: Object.values(UserRole), 
    default: UserRole.HACKER 
  },
  profilePicture: { 
    type: String, 
    default: '',
    trim: true
  },
  socialLinks: {
    github: { 
      type: String, 
      default: '',
      trim: true
    },
    linkedin: { 
      type: String, 
      default: '',
      trim: true
    },
    discord: { 
      type: String, 
      default: '',
      trim: true
    },
    instagram: { 
      type: String, 
      default: '',
      trim: true
    }
  }
}, { 
  timestamps: true,
  toJSON: {
    transform: function(_doc, ret) {
      const { password, ...userWithoutPassword } = ret;
      return userWithoutPassword;
    }
  }
});

// Indexes for performance
// Note: email index is automatically created by unique: true
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for full name
userSchema.virtual('fullName').get(function(this: IUser) {
  return `${this.firstName} ${this.lastName}`;
});

const User = mongoose.model<IUser>('User', userSchema);

export default User;

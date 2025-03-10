import mongoose, { Document, Schema, CallbackWithoutResult } from 'mongoose';
import bcrypt from 'bcryptjs';

// Design interface
export interface IDesign {
  designId: string;
  title: string;
  imageUrl: string;
  createdAt: Date;
}

// User Profile interface with timestamps
export interface IUserProfile {
  name?: string;
  bio?: string;
  profilePictureUrl?: string;
  phoneNumber?: string;
  location?: string;
  specialization?: string;
  socialLinks?: {
    instagram?: string;
    linkedin?: string;
    website?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

// User interface extending IUserProfile
export interface IUser extends IUserProfile {
  email: string;
  password: string;
  designs?: IDesign[];
  isActive: boolean;
  isEmailVerified: boolean;
  verificationToken?: string;
  emailPreferences?: {
    accountActivity: boolean;
  };
  lastLogin?: Date;
}

// User document interface with Document
export interface IUserDocument extends IUser, Document {
  matchPassword(enteredPassword: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

// Design schema
const designSchema = new Schema<IDesign>({
  designId: { type: String, required: true },
  title: { type: String, required: true },
  imageUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Social links schema
const socialLinksSchema = new Schema({
  instagram: String,
  linkedin: String,
  website: String
}, { _id: false });

// User schema
const userSchema = new Schema<IUserDocument>({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    validate: {
      validator: function(v: string) {
        // Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/.test(v);
      },
      message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    }
  },
  name: {
    type: String,
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  bio: {
    type: String,
    trim: true,
    maxlength: [500, 'Bio cannot exceed 500 characters']
  },
  profilePictureUrl: {
    type: String,
    validate: {
      validator: function(v: string) {
        if (!v) return true; // Allow empty/undefined values
        // Accept both URLs and local file paths
        return /^(https?:\/\/|\/uploads\/).+/.test(v) || v.startsWith('/uploads/');
      },
      message: 'Profile picture URL must be a valid URL or local file path'
    }
  },
  phoneNumber: {
    type: String,
    trim: true,
    validate: {
      validator: function(v: string) {
        return !v || /^\+?[\d\s-]{10,}$/.test(v);
      },
      message: 'Please enter a valid phone number'
    }
  },
  location: {
    type: String,
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  specialization: {
    type: String,
    trim: true,
    maxlength: [100, 'Specialization cannot exceed 100 characters']
  },
  socialLinks: {
    type: socialLinksSchema,
    default: {}
  },
  designs: [designSchema],
  isActive: {
    type: Boolean,
    default: false
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: {
    type: String
  },
  emailPreferences: {
    accountActivity: {
      type: Boolean,
      default: true
    }
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(this: IUserDocument, next: CallbackWithoutResult): Promise<void> {
  if (!this.isModified('password')) {
    next(null);
    return;
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next(null);
  } catch (error) {
    next(error as Error);
  }
});

// Method to check password
userSchema.methods.matchPassword = async function(this: IUserDocument, enteredPassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Create and export the model
const User = mongoose.model<IUserDocument>('User', userSchema);
export default User;

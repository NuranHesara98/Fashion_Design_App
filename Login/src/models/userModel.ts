import mongoose, { Document, Schema, CallbackWithoutResult } from 'mongoose';
import bcrypt from 'bcryptjs';

// Design interface
export interface IDesign {
  designId: string;
  title: string;
  imageUrl: string;
  createdAt: Date;
}

// User interface
export interface IUser {
  email: string;
  password: string;
  name?: string;
  bio?: string;
  profilePictureUrl?: string;
  designs?: IDesign[];
}

// User document interface
export interface IUserDocument extends IUser, Document {
  matchPassword(enteredPassword: string): Promise<boolean>;
}

// Design schema
const designSchema = new Schema<IDesign>({
  designId: { type: String, required: true },
  title: { type: String, required: true },
  imageUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Password validation regex
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

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
        return passwordRegex.test(v);
      },
      message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    }
  },
  name: {
    type: String,
    trim: true
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters']
  },
  profilePictureUrl: String,
  designs: [designSchema]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', function(this: IUserDocument, next: CallbackWithoutResult): void {
  if (!this.isModified('password')) {
    next(null);
    return;
  }

  try {
    const salt = bcrypt.genSaltSync(10);
    this.password = bcrypt.hashSync(this.password, salt);
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

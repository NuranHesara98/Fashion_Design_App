import mongoose, { Document, Schema, CallbackWithoutResult } from 'mongoose';
import bcrypt from 'bcryptjs';

// Design interface
export interface IDesign {
  designId: string;
  title: string;
  imageUrl: string;
  createdAt: Date;
}

// Social links interface
export interface ISocialLinks {
  instagram?: string | null;
  linkedin?: string | null;
  website?: string | null;
}

// Change log interface
export interface IChangeLog {
  field: string;
  oldValue: any;
  newValue: any;
  changedAt: Date;
}

// User interface
export interface IUser {
  email: string;
  password: string;
  firstName: string;
  name: string | null;
  bio: string | null;
  profilePictureUrl: string | null;
  profilePictureBase64: string | null;
  phoneNumber: string | null;
  birthday: Date | null;
  address: string | null;
  location: string | null;
  specialization: string | null;
  socialLinks: ISocialLinks;
  passwordLastChanged: Date | null;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
  designs: IDesign[];
  isEmailVerified: boolean;
  verificationToken: string | null;
  resetPasswordToken: string | null;
  resetPasswordExpires: Date | null;
  changeHistory: IChangeLog[];
}

// User document interface
export interface IUserDocument extends Document, IUser {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Design schema
const designSchema = new Schema<IDesign>({
  designId: { type: String, required: true },
  title: { type: String, required: true },
  imageUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Social links schema
const socialLinksSchema = new Schema<ISocialLinks>({
  instagram: { type: String, default: null },
  linkedin: { type: String, default: null },
  website: { type: String, default: null }
}, { _id: false });

// Change log schema
const changeLogSchema = new Schema<IChangeLog>({
  field: { type: String, required: true },
  oldValue: { type: Schema.Types.Mixed },
  newValue: { type: Schema.Types.Mixed },
  changedAt: { type: Date, default: Date.now }
});

// User schema
const userSchema = new Schema<IUserDocument>({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v: any): boolean {
        return /^\S+@\S+\.\S+$/.test(v);
      },
      message: 'Please enter a valid email address'
    }
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    validate: {
      validator: function(v: any): boolean {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/.test(v);
      },
      message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    }
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    minlength: [2, 'First name must be at least 2 characters long'],
    maxlength: [50, 'First name cannot exceed 50 characters'],
    validate: {
      validator: function(v: any): boolean {
        return /^[a-zA-Z\s-]+$/.test(v);
      },
      message: 'First name can only contain letters, spaces, and hyphens'
    }
  },
  name: {
    type: String,
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters'],
    default: null
  },
  bio: {
    type: String,
    trim: true,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
    default: null
  },
  profilePictureUrl: {
    type: String,
    validate: {
      validator: function(v: any): boolean {
        if (!v) return true;
        return /^(https?:\/\/|\/uploads\/).+/.test(v);
      },
      message: 'Profile picture URL must be a valid URL or local file path'
    },
    default: null
  },
  profilePictureBase64: {
    type: String,
    default: null
  },
  phoneNumber: {
    type: String,
    trim: true,
    validate: {
      validator: function(v: any): boolean {
        if (!v) return true;
        return /^\+?[\d\s-]{10,}$/.test(v);
      },
      message: 'Please enter a valid phone number'
    },
    default: null
  },
  location: {
    type: String,
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters'],
    default: null
  },
  specialization: {
    type: String,
    trim: true,
    maxlength: [100, 'Specialization cannot exceed 100 characters'],
    default: null
  },
  socialLinks: {
    type: socialLinksSchema,
    default: () => ({
      instagram: null,
      linkedin: null,
      website: null
    })
  },
  birthday: {
    type: Date,
    default: null,
    validate: {
      validator: function(v: any): boolean {
        if (!v) return true;
        const date = new Date(v);
        return !isNaN(date.getTime());
      },
      message: 'Please enter a valid date'
    }
  },
  address: {
    type: String,
    maxlength: [200, 'Address cannot exceed 200 characters'],
    default: null
  },
  passwordLastChanged: {
    type: Date,
    default: null
  },
  lastLogin: {
    type: Date,
    default: null
  },
  designs: {
    type: [designSchema],
    default: []
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: {
    type: String,
    default: null
  },
  resetPasswordToken: {
    type: String,
    default: null
  },
  resetPasswordExpires: {
    type: Date,
    default: null
  },
  changeHistory: {
    type: [changeLogSchema],
    default: [],
    select: false
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(this: IUserDocument, next: CallbackWithoutResult): Promise<void> {
  try {
    if (!this.isModified('password')) {
      return next(null);
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    this.passwordLastChanged = new Date();
    next(null);
  } catch (error) {
    next(error as Error);
  }
});

// Hash password on findOneAndUpdate
userSchema.pre('findOneAndUpdate', async function(next: CallbackWithoutResult): Promise<void> {
  try {
    const update: any = this.getUpdate();
    if (update?.$set?.password) {
      const salt = await bcrypt.genSalt(10);
      update.$set.password = await bcrypt.hash(update.$set.password, salt);
      update.$set.passwordLastChanged = new Date();
    }

    const setUpdate = update?.$set || {};
    
    // Get the current document
    const doc = await this.model.findOne(this.getQuery());
    if (!doc) return next(null);

    const changes: IChangeLog[] = [];
    const importantFields = ['email', 'name', 'phoneNumber', 'address', 'location'];

    for (const field of importantFields) {
      if (setUpdate[field] !== undefined && setUpdate[field] !== doc[field]) {
        changes.push({
          field,
          oldValue: doc[field],
          newValue: setUpdate[field],
          changedAt: new Date()
        });
      }
    }

    if (changes.length > 0) {
      update.$push = {
        ...update.$push,
        changeHistory: { $each: changes }
      };
    }

    next(null);
  } catch (error) {
    next(error as Error);
  }
});

// Add comparePassword method to the schema
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Error comparing passwords');
  }
};

// Create and export the model
const UserModel = mongoose.model<IUserDocument>('User', userSchema);
export default UserModel;

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import User, { IUserDocument, IDesign, ISocialLinks } from '../models/userModel';
import mongoose from 'mongoose';
import { uploadImage, cleanupOldImage } from '../utils/fileUpload';
import fs from 'fs/promises';
import { ValidationError, NotFoundError, AuthenticationError, FileUploadError } from '../utils/errors';
import path from 'path';
import AWS from 'aws-sdk';
import { Request } from 'express';
import dotenv from 'dotenv';
import multer from 'multer';
import bcrypt from 'bcryptjs';

dotenv.config();

interface ProfileResponse {
  success: boolean;
  message?: string;
  profile?: {
    id: string;
    profilePictureBase64: string | null;
    name: string | null;
    bio: string | null;
    birthday: Date | null;
    phoneNumber: string | null;
    email: string;
    address: string | null;
    canChangePassword: boolean;
  };
}

interface DesignResponse {
  success: boolean;
  message?: string;
  design?: IDesign;
  designs?: IDesign[];
}

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

// Configure multer for file uploads
const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

async function uploadImageToS3(file: Express.Multer.File): Promise<string> {
  const bucketName = process.env.AWS_S3_BUCKET;
  
  if (!bucketName) {
    throw new Error('S3 bucket name is not defined in environment variables');
  }

  const timestamp = Date.now();
  const fileName = `profile-pictures/${timestamp}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

  console.log('Starting S3 upload:', {
    bucket: bucketName,
    fileName,
    contentType: file.mimetype,
    fileSize: file.size
  });

  const params = {
    Bucket: bucketName,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype
  };

  try {
    const uploadResult = await s3.upload(params).promise();
    console.log('S3 upload successful:', uploadResult);
    return uploadResult.Location;
  } catch (error) {
    console.error('S3 upload failed:', error);
    throw new FileUploadError('Failed to upload image to S3');
  }
}

// Get user profile with detailed information
export const getProfile = async (
  req: AuthRequest,
  res: Response<ProfileResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      throw new AuthenticationError('Invalid or missing authentication token');
    }

    console.log('Getting profile for user:', userId);

    // Query user profile with specific field selection
    const user = await User.findById(userId)
      .select('email name bio profilePictureUrl profilePictureBase64 phoneNumber birthday address')
      .lean();
    
    if (!user) {
      throw new NotFoundError('User profile not found');
    }

    console.log('Profile retrieved successfully for user:', userId);

    // Format the response
    res.status(200).json({
      success: true,
      profile: {
        id: user._id.toString(),
        profilePictureBase64: user.profilePictureBase64 || user.profilePictureUrl || null,
        name: user.name || null,
        bio: user.bio || null,
        birthday: user.birthday || null,
        phoneNumber: user.phoneNumber || null,
        email: user.email,
        address: user.address || null,
        canChangePassword: true
      }
    });
  } catch (error) {
    console.error('Error in getProfile:', error);
    next(error);
  }
};

// Update user profile
export const updateProfile = async (
  req: AuthRequest & { 
    body: { 
      name?: string;
      bio?: string;
      birthday?: string;
      phoneNumber?: string;
      email?: string;
      address?: string;
      password?: string;
    };
    file?: Express.Multer.File;
  },
  res: Response<ProfileResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      throw new AuthenticationError('Invalid or missing authentication token');
    }

    const currentTime = new Date();
    const updateData: any = {};

    // Step 1: Handle profile picture update
    if (req.file && req.file.buffer) {
      try {
        const profilePictureUrl = await uploadImageToS3(req.file);
        
        // Clean up old image if exists
        const currentUser = await User.findById(userId).select('profilePictureUrl').lean();
        if (currentUser?.profilePictureUrl) {
          await cleanupOldImage(currentUser.profilePictureUrl);
        }
        
        updateData.profilePictureUrl = profilePictureUrl;
        updateData.profilePictureBase64 = profilePictureUrl;
      } catch (error) {
        throw new FileUploadError('Failed to process profile picture');
      }
    }

    // Step 2: Handle name and bio updates
    const { name, bio } = req.body;
    
    if (name !== undefined) {
      if (typeof name !== 'string') {
        throw new ValidationError('Name must be text');
      }
      if (name.length > 50) {
        throw new ValidationError('Name cannot exceed 50 characters');
      }
      updateData.name = name || null;
    }

    if (bio !== undefined) {
      if (typeof bio !== 'string') {
        throw new ValidationError('Bio must be text');
      }
      if (bio.length > 500) {
        throw new ValidationError('Bio cannot exceed 500 characters');
      }
      updateData.bio = bio || null;
    }

    // Step 3: Handle personal information updates
    const { birthday, phoneNumber, email, address } = req.body;

    if (birthday !== undefined) {
      if (isNaN(Date.parse(birthday))) {
        throw new ValidationError('Birthday must be a valid date');
      }
      updateData.birthday = birthday ? new Date(birthday) : null;
    }

    if (phoneNumber !== undefined) {
      if (typeof phoneNumber !== 'string') {
        throw new ValidationError('Phone number must be text');
      }
      if (!/^\+?[\d\s-]{10,}$/.test(phoneNumber)) {
        throw new ValidationError('Phone number must be valid (minimum 10 digits, can include +, spaces, and hyphens)');
      }
      updateData.phoneNumber = phoneNumber || null;
    }

    if (email !== undefined) {
      if (typeof email !== 'string') {
        throw new ValidationError('Email must be text');
      }
      if (!/^[\w-.]+@[\w-]+\.[a-z]{2,}$/.test(email)) {
        throw new ValidationError('Please provide a valid email address');
      }
      updateData.email = email;
    }

    if (address !== undefined) {
      if (typeof address !== 'string') {
        throw new ValidationError('Address must be text');
      }
      if (address.length > 200) {
        throw new ValidationError('Address cannot exceed 200 characters');
      }
      updateData.address = address || null;
    }

    // Step 4: Handle password update
    const { password } = req.body;
    if (password !== undefined) {
      if (typeof password !== 'string') {
        throw new ValidationError('Password must be text');
      }
      if (password.length < 8) {
        throw new ValidationError('Password must be at least 8 characters long');
      }
      if (!/\d/.test(password)) {
        throw new ValidationError('Password must contain at least one number');
      }
      if (!/[A-Z]/.test(password)) {
        throw new ValidationError('Password must contain at least one uppercase letter');
      }
      if (!/[a-z]/.test(password)) {
        throw new ValidationError('Password must contain at least one lowercase letter');
      }
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        throw new ValidationError('Password must contain at least one special character');
      }

      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
      updateData.passwordLastChanged = currentTime;
    }

    // Update user data
    const user = await User.findByIdAndUpdate(
      userId,
      { 
        $set: updateData,
        $currentDate: { updatedAt: true }
      },
      {
        new: true,
        runValidators: true,
        select: 'email name bio profilePictureUrl profilePictureBase64 phoneNumber birthday address'
      }
    ).lean();

    if (!user) {
      throw new NotFoundError('Failed to update user profile');
    }

    // Send success response
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      profile: {
        id: user._id.toString(),
        profilePictureBase64: user.profilePictureBase64 || user.profilePictureUrl || null,
        name: user.name || null,
        bio: user.bio || null,
        birthday: user.birthday || null,
        phoneNumber: user.phoneNumber || null,
        email: user.email,
        address: user.address || null,
        canChangePassword: true
      }
    });
  } catch (error) {
    next(error);
  }
};

// Add a new design to user's history
export const addDesign = async (
  req: AuthRequest & { body: { title: string; imageUrl: string } },
  res: Response<DesignResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    // Explicitly verify token and extract user_id
    const userId = req.user._id;
    if (!userId) {
      throw new AuthenticationError('Invalid or missing authentication token');
    }

    const { title, imageUrl } = req.body;

    // Validate required fields
    if (!title || !imageUrl) {
      throw new ValidationError('Please provide both title and image URL');
    }

    // Validate URL format
    if (!/^https?:\/\/.+/.test(imageUrl)) {
      throw new ValidationError('Please provide a valid image URL');
    }

    const newDesign: IDesign = {
      designId: new mongoose.Types.ObjectId().toString(),
      title,
      imageUrl,
      createdAt: new Date()
    };

    // Add design to user's designs array
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $push: { designs: newDesign }
      },
      {
        new: true,
        runValidators: true
      }
    ).lean();

    if (!user) {
      throw new NotFoundError('User not found');
    }

    res.status(201).json({
      success: true,
      message: 'Design added successfully',
      design: newDesign
    });
  } catch (error) {
    next(error);
  }
};

// Get user's design history
export const getDesigns = async (
  req: AuthRequest,
  res: Response<DesignResponse>
): Promise<Response<DesignResponse>> => {
  try {
    // Explicitly verify token and extract user_id
    const userId = req.user._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or missing authentication token'
      });
    }

    const user = await User.findById(userId)
      .select('designs')
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      designs: user.designs || []
    });
  } catch (error: unknown) {
    console.error('Get designs error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving designs'
    });
  }
};

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import User, { IUserProfile, IUserDocument, IDesign } from '../models/userModel';
import mongoose from 'mongoose';
import { uploadImage, cleanupOldImage } from '../utils/fileUpload';
import fs from 'fs/promises';
import { ValidationError, NotFoundError, AuthenticationError, FileUploadError } from '../utils/errors';

interface ProfileResponse {
  success: boolean;
  message?: string;
  profile?: {
    id: string;
    email: string;
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
    designs?: Array<{
      designId: string;
      title: string;
      imageUrl: string;
      createdAt: Date;
    }>;
    lastLogin?: Date;
    createdAt: Date;
    updatedAt: Date;
  };
}

interface DesignResponse {
  success: boolean;
  message?: string;
  design?: IDesign;
  designs?: IDesign[];
}

// Get user profile with detailed information
export const getProfile = async (
  req: AuthRequest,
  res: Response<ProfileResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    // Explicitly verify token and extract user_id
    const userId = req.user._id;
    if (!userId) {
      throw new AuthenticationError('Invalid or missing authentication token');
    }

    // Query user profile with specific field selection
    const user = await User.findById(userId)
      .select('-password')
      .select('email name bio profilePictureUrl phoneNumber location specialization socialLinks designs lastLogin createdAt updatedAt')
      .lean();
    
    if (!user) {
      throw new NotFoundError('User profile not found');
    }

    // Update last login time
    await User.findByIdAndUpdate(userId, { lastLogin: new Date() });

    // Format the response
    res.status(200).json({
      success: true,
      profile: {
        id: user._id.toString(),
        email: user.email,
        name: user.name || '',
        bio: user.bio || '',
        profilePictureUrl: user.profilePictureUrl || '',
        phoneNumber: user.phoneNumber || '',
        location: user.location || '',
        specialization: user.specialization || '',
        socialLinks: user.socialLinks || {},
        designs: user.designs || [],
        lastLogin: user.lastLogin,
        createdAt: user.createdAt as Date,
        updatedAt: user.updatedAt as Date
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update user profile
export const updateProfile = async (
  req: AuthRequest & { body: IUserProfile, file?: Express.Multer.File },
  res: Response<ProfileResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      throw new AuthenticationError('Invalid or missing authentication token');
    }

    // Get current user to check old profile picture
    const currentUser = await User.findById(userId).select('profilePictureUrl').lean();
    if (!currentUser) {
      throw new NotFoundError('User not found');
    }

    // Handle file upload if present
    let profilePictureUrl = req.body.profilePictureUrl;
    if (req.file) {
      try {
        // Upload new image
        profilePictureUrl = await uploadImage(req.file);
        
        // Clean up old image if exists
        if (currentUser.profilePictureUrl) {
          await cleanupOldImage(currentUser.profilePictureUrl);
        }
      } catch (error) {
        throw new FileUploadError('Failed to process profile picture: ' + (error instanceof Error ? error.message : 'Unknown error'));
      }
    }

    // Skip URL validation if we're uploading a file
    if (!req.file && profilePictureUrl && !profilePictureUrl.startsWith('/uploads/')) {
      // Validate profile picture URL only for external URLs
      if (!/^https?:\/\/.+/.test(profilePictureUrl)) {
        throw new ValidationError('Profile picture URL must be a valid URL starting with http:// or https://');
      }
    }

    // Validate and update other fields
    const {
      name,
      bio,
      phoneNumber,
      location,
      specialization,
      socialLinks
    } = req.body;

    // Enhanced validation with detailed error messages
    if (name && (typeof name !== 'string' || name.length > 50)) {
      throw new ValidationError(`Name validation failed: ${typeof name !== 'string' ? 'Must be text' : 'Cannot exceed 50 characters'}`);
    }

    if (bio && (typeof bio !== 'string' || bio.length > 500)) {
      throw new ValidationError(`Bio validation failed: ${typeof bio !== 'string' ? 'Must be text' : 'Cannot exceed 500 characters'}`);
    }

    if (location && (typeof location !== 'string' || location.length > 100)) {
      throw new ValidationError(`Location validation failed: ${typeof location !== 'string' ? 'Must be text' : 'Cannot exceed 100 characters'}`);
    }

    if (specialization && (typeof specialization !== 'string' || specialization.length > 100)) {
      throw new ValidationError(`Specialization validation failed: ${typeof specialization !== 'string' ? 'Must be text' : 'Cannot exceed 100 characters'}`);
    }

    if (phoneNumber && (typeof phoneNumber !== 'string' || !/^\+?[\d\s-]{10,}$/.test(phoneNumber))) {
      throw new ValidationError('Phone number must be valid (minimum 10 digits, can include +, spaces, and hyphens)');
    }

    // Enhanced social links validation
    if (socialLinks) {
      if (typeof socialLinks !== 'object') {
        throw new ValidationError('Social links must be provided as an object');
      }

      const { instagram, linkedin, website } = socialLinks;
      const urlRegex = /^https?:\/\/.+/;

      if (instagram && (typeof instagram !== 'string' || !urlRegex.test(instagram))) {
        throw new ValidationError('Instagram link must be a valid URL starting with http:// or https://');
      }

      if (linkedin && (typeof linkedin !== 'string' || !urlRegex.test(linkedin))) {
        throw new ValidationError('LinkedIn link must be a valid URL starting with http:// or https://');
      }

      if (website && (typeof website !== 'string' || !urlRegex.test(website))) {
        throw new ValidationError('Website link must be a valid URL starting with http:// or https://');
      }
    }

    // Update user profile with validated data
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          ...(name && { name }),
          ...(bio && { bio }),
          ...(profilePictureUrl && { profilePictureUrl }),
          ...(phoneNumber && { phoneNumber }),
          ...(location && { location }),
          ...(specialization && { specialization }),
          ...(socialLinks && { socialLinks })
        }
      },
      {
        new: true,
        runValidators: true,
        select: '-password'
      }
    ).lean();

    if (!user) {
      throw new NotFoundError('Failed to update user profile');
    }

    // Send detailed success response
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      profile: {
        id: user._id.toString(),
        email: user.email,
        name: user.name || '',
        bio: user.bio || '',
        profilePictureUrl: user.profilePictureUrl || '',
        phoneNumber: user.phoneNumber || '',
        location: user.location || '',
        specialization: user.specialization || '',
        socialLinks: user.socialLinks || {},
        designs: user.designs || [],
        lastLogin: user.lastLogin,
        createdAt: user.createdAt as Date,
        updatedAt: user.updatedAt as Date
      }
    });
  } catch (error) {
    // Pass error to error handling middleware
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

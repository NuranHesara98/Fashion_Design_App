import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import User, { IUserProfile, IUserDocument, IDesign } from '../models/userModel';
import mongoose from 'mongoose';

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
  res: Response<ProfileResponse>
): Promise<Response<ProfileResponse>> => {
  try {
    // Explicitly verify token and extract user_id
    const userId = req.user._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or missing authentication token'
      });
    }

    // Query user profile with specific field selection
    const user = await User.findById(userId)
      .select('-password')
      .select('email name bio profilePictureUrl phoneNumber location specialization socialLinks designs lastLogin createdAt updatedAt')
      .lean();
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    // Update last login time
    await User.findByIdAndUpdate(userId, { lastLogin: new Date() });

    // Format the response
    return res.status(200).json({
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
  } catch (error: unknown) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving user profile'
    });
  }
};

// Update user profile
export const updateProfile = async (
  req: AuthRequest & { body: IUserProfile },
  res: Response<ProfileResponse>
): Promise<Response<ProfileResponse>> => {
  try {
    // Explicitly verify token and extract user_id
    const userId = req.user._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or missing authentication token'
      });
    }

    const {
      name,
      bio,
      profilePictureUrl,
      phoneNumber,
      location,
      specialization,
      socialLinks
    } = req.body;

    // Validate input lengths
    if (name && name.length > 50) {
      return res.status(400).json({
        success: false,
        message: 'Name cannot exceed 50 characters'
      });
    }

    if (bio && bio.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Bio cannot exceed 500 characters'
      });
    }

    if (location && location.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Location cannot exceed 100 characters'
      });
    }

    if (specialization && specialization.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Specialization cannot exceed 100 characters'
      });
    }

    // Validate phone number format
    if (phoneNumber && !/^\+?[\d\s-]{10,}$/.test(phoneNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid phone number'
      });
    }

    // Validate profile picture URL
    if (profilePictureUrl && !/^https?:\/\/.+/.test(profilePictureUrl)) {
      return res.status(400).json({
        success: false,
        message: 'Profile picture URL must be a valid URL'
      });
    }

    // Find and update user profile
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
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    // Log successful profile update
    console.log(`Profile updated successfully for user: ${userId}`);

    return res.status(200).json({
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
  } catch (error: unknown) {
    console.error('Update profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating user profile'
    });
  }
};

// Add a new design to user's history
export const addDesign = async (
  req: AuthRequest & { body: { title: string; imageUrl: string } },
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

    const { title, imageUrl } = req.body;

    // Validate required fields
    if (!title || !imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both title and image URL'
      });
    }

    // Validate URL format
    if (!/^https?:\/\/.+/.test(imageUrl)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid image URL'
      });
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
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Design added successfully',
      design: newDesign
    });
  } catch (error: unknown) {
    console.error('Add design error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error adding design to profile'
    });
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

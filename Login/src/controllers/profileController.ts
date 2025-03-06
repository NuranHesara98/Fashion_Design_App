import { Request, Response } from 'express';
import User from '../models/userModel';

interface Design {
  designId: string;
  title: string;
  imageUrl: string;
  createdAt: Date;
}

interface ErrorResponse {
  success: boolean;
  message: string;
  error?: string;
}

interface SuccessResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Get user profile
export const getUserProfile = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        name: user.name || '',
        bio: user.bio || '',
        profilePictureUrl: user.profilePictureUrl || '',
        designs: user.designs || []
      }
    });
  } catch (error: any) {
    console.error('Profile fetch error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update user profile
export const updateUserProfile = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { name, bio, profilePictureUrl } = req.body;

    // Validate inputs
    if (bio && bio.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Bio cannot exceed 500 characters'
      });
    }

    if (profilePictureUrl && !isValidUrl(profilePictureUrl)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid profile picture URL'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update only provided fields
    if (name !== undefined) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (profilePictureUrl !== undefined) user.profilePictureUrl = profilePictureUrl;

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: user._id,
        email: user.email,
        name: user.name,
        bio: user.bio,
        profilePictureUrl: user.profilePictureUrl,
        designs: user.designs || []
      }
    });
  } catch (error: any) {
    console.error('Profile update error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Add design to user's history
export const addDesignToHistory = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { designId, title, imageUrl } = req.body;

    if (!designId || !title || !imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Design ID, title, and image URL are required'
      });
    }

    if (!isValidUrl(imageUrl)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid image URL'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const newDesign: Design = {
      designId,
      title,
      imageUrl,
      createdAt: new Date()
    };

    if (!user.designs) {
      user.designs = [];
    }
    
    user.designs.push(newDesign);
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Design added to history',
      data: newDesign
    });
  } catch (error: any) {
    console.error('Add design error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error adding design to history',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Helper function to validate URLs
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

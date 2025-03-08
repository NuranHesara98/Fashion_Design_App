import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import User from '../models/userModel';

interface ProfileResponse {
  success: boolean;
  message?: string;
  profile?: {
    id: string;
    email: string;
    name?: string;
    bio?: string;
    profilePictureUrl?: string;
    designs?: Array<{
      designId: string;
      title: string;
      imageUrl: string;
      createdAt: Date;
    }>;
  };
}

// Get user profile
export const getProfile = async (
  req: AuthRequest,
  res: Response<ProfileResponse>
): Promise<Response<ProfileResponse>> => {
  try {
    // Get user from database (we don't want to return the password)
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      profile: {
        id: user._id,
        email: user.email,
        name: user.name || '',
        bio: user.bio || '',
        profilePictureUrl: user.profilePictureUrl || '',
        designs: user.designs || []
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving user profile'
    });
  }
};

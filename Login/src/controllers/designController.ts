import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import Design, { IDesign } from '../models/designModel';
import mongoose from 'mongoose';

interface GetDesignsResponse {
  success: boolean;
  message?: string;
  count?: number;
  data?: IDesign[];
}

// @desc    Get designs by user ID
// @route   GET /api/designs/user/:userId
// @access  Private
export const getUserDesigns = asyncHandler(async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.params;

  // Validate userId format
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    res.status(400).json({
      success: false,
      message: 'Invalid user ID format'
    });
    return;
  }

  try {
    // Query designs for the user
    const designs = await Design.find({ userId })
      .sort({ createdAt: -1 }) // Sort by newest first
      .select('-__v') // Exclude version key
      .lean(); // Convert to plain JavaScript objects

    res.status(200).json({
      success: true,
      count: designs.length,
      data: designs
    });
  } catch (error) {
    console.error('Error fetching designs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching designs'
    });
  }
}); 
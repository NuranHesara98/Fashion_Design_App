import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Design from '../models/designModel';
import { AppError, NotFoundError } from '../utils/errors';
import mongoose from 'mongoose';

// @desc    Get designs by user ID
// @route   GET /api/designs/user/:userId
// @access  Public
export const getUserDesigns = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;

  // Validate userId format
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new AppError('Invalid user ID format', 400);
  }

  const designs = await Design.find({ userId })
    .sort({ createdAt: -1 }) // Sort by newest first
    .select('-__v'); // Exclude version key

  if (!designs || designs.length === 0) {
    throw new NotFoundError('No designs found for this user');
  }

  res.status(200).json({
    success: true,
    count: designs.length,
    data: designs
  });
}); 
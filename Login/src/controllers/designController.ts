import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Design from '../models/designModel';
import { AppError } from '../middleware/errorMiddleware';

// @desc    Get designs by user ID
// @route   GET /api/designs/user/:userId
// @access  Public
export const getUserDesigns = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;

  if (!userId) {
    throw new AppError('User ID is required', 400);
  }

  const designs = await Design.find({ userId })
    .sort({ createdAt: -1 }) // Sort by newest first
    .select('-__v'); // Exclude version key

  if (!designs) {
    throw new AppError('No designs found for this user', 404);
  }

  res.status(200).json({
    success: true,
    count: designs.length,
    data: designs
  });
}); 
import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import Design, { IDesign } from '../models/designModel';
import mongoose from 'mongoose';

interface DesignResponse {
  id: string;
  name: string;
  imageUrl: string;
  createdAt: string;
  description?: string;
  category?: string;
  tags?: string[];
}

interface GetDesignsResponse {
  success: boolean;
  message?: string;
  count?: number;
  data?: DesignResponse[];
}

// @desc    Create a new design
// @route   POST /api/designs
// @access  Private
export const createDesign = asyncHandler(async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, imageUrl = '', description = '', category = 'uncategorized', tags = [] } = req.body;
    
    // Get userId from authenticated user
    const userId = (req as any).user._id;

    if (!name) {
      res.status(400).json({
        success: false,
        message: 'Design name is required'
      });
      return;
    }

    // Set a default image URL if none provided
    const finalImageUrl = imageUrl || 'https://via.placeholder.com/300x300?text=Design+Image';

    const design = await Design.create({
      userId,
      name,
      imageUrl: finalImageUrl,
      description,
      category,
      tags
    });

    const formattedDesign = {
      id: design._id.toString(),
      name: design.name,
      imageUrl: design.imageUrl,
      createdAt: design.createdAt.toISOString(),
      description: design.description,
      category: design.category,
      tags: design.tags
    };

    res.status(201).json({
      success: true,
      message: 'Design created successfully',
      data: formattedDesign
    });
  } catch (error: any) {
    console.error('Error creating design:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating design'
    });
  }
});

// @desc    Get designs by user ID
// @route   GET /api/designs/user/:userId
// @access  Private
export const getUserDesigns = asyncHandler(async (
  req: Request,
  res: Response<GetDesignsResponse>
) => {
  const { userId } = req.params;0
  console.log('Fetching designs for userId:', userId);

  // Validate userId format
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    console.log('Invalid userId format:', userId);
    res.status(400).json({
      success: false,
      message: 'Invalid user ID format'
    });
    return;
  }

  // Query designs for the user
  console.log('Querying designs with userId:', userId);
  const designs = await Design.find({ userId })
    .sort({ createdAt: -1 }) // Sort by newest first
    .select('-__v') // Exclude version key
    .lean(); // Convert to plain JavaScript objects

  console.log('Found designs:', designs);

  // Format the response data
  const formattedDesigns: DesignResponse[] = designs.map(design => ({
    id: design._id.toString(),
    name: design.name,
    imageUrl: design.imageUrl,
    createdAt: design.createdAt.toISOString(),
    description: design.description,
    category: design.category,
    tags: design.tags
  }));

  console.log('Formatted designs:', formattedDesigns);

  // Return the formatted designs
  res.status(200).json({
    success: true,
    count: formattedDesigns.length,
    data: formattedDesigns
  });
}); 
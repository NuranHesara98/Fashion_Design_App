import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import getSketchModel from '../models/sketchModel';

// @desc    Get all sketches or filter by category
// @route   GET /api/sketches
// @access  Public
export const getSketches = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const category = req.query.category as string;
    
    // Build query based on category
    const query = category && category !== 'All' 
      ? { category } 
      : {};
    
    console.log('Fetching sketches with query:', query);
    
    // Get the Sketch model - if null, database connection isn't ready
    const Sketch = getSketchModel();
    if (!Sketch) {
      res.status(503).json({
        success: false,
        message: 'Sketches database connection not available. Please try again later.'
      });
      return;
    }
    
    const sketches = await Sketch.find(query)
      .sort({ createdAt: -1 })
      .lean();
    
    console.log(`Found ${sketches.length} sketches`);
    
    res.status(200).json({
      success: true,
      count: sketches.length,
      data: sketches.map((sketch: any) => ({
        id: sketch._id.toString(),
        name: sketch.name,
        s3Uri: sketch.s3Uri,
        category: sketch.category,
        createdAt: sketch.createdAt
      }))
    });
  } catch (error: any) {
    console.error('Error fetching sketches:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching sketches'
    });
  }
});

// @desc    Get sketch by ID
// @route   GET /api/sketches/:id
// @access  Public
export const getSketchById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Get the Sketch model - if null, database connection isn't ready
    const Sketch = getSketchModel();
    if (!Sketch) {
      res.status(503).json({
        success: false,
        message: 'Sketches database connection not available. Please try again later.'
      });
      return;
    }
    
    const sketch = await Sketch.findById(id).lean();
    
    if (!sketch) {
      res.status(404).json({
        success: false,
        message: 'Sketch not found'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: {
        id: sketch._id.toString(),
        name: sketch.name,
        s3Uri: sketch.s3Uri,
        category: sketch.category,
        createdAt: sketch.createdAt
      }
    });
  } catch (error: any) {
    console.error('Error fetching sketch by ID:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching sketch'
    });
  }
});

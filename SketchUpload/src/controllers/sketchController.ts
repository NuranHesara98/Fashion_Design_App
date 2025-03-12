import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { uploadFileToS3, getSignedS3Url, deleteFileFromS3 } from '../services/s3Service';
import Sketch from '../models/Sketch';

/**
 * Upload a sketch to S3 and save metadata to MongoDB
 * @param req Express request
 * @param res Express response
 */
export const uploadSketch = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded' });
      return;
    }

    const { path: filePath, originalname, mimetype } = req.file;

    // Upload file to S3
    const s3Result = await uploadFileToS3(filePath, mimetype);

    // Create new sketch document
    const sketch = new Sketch({
      originalFilename: originalname,
      s3Key: s3Result.s3Key,
      s3Url: s3Result.s3Url,
      contentType: mimetype
    });

    // Save sketch to MongoDB
    await sketch.save();

    // Delete temporary file
    fs.unlinkSync(filePath);

    // Return success response
    res.status(201).json({
      success: true,
      message: 'Sketch uploaded successfully',
      sketch
    });
  } catch (error) {
    console.error('Error uploading sketch:', error);
    res.status(500).json({
      success: false,
      message: `Failed to upload sketch: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
};

/**
 * Get all sketches
 * @param req Express request
 * @param res Express response
 */
export const getSketches = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get all sketches from MongoDB, sorted by uploadedAt in descending order
    const sketches = await Sketch.find().sort({ uploadedAt: -1 });

    // Return sketches
    res.status(200).json({
      success: true,
      count: sketches.length,
      sketches
    });
  } catch (error) {
    console.error('Error getting sketches:', error);
    res.status(500).json({
      success: false,
      message: `Failed to get sketches: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
};

/**
 * Get a sketch by ID
 * @param req Express request
 * @param res Express response
 */
export const getSketchById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Find sketch by ID
    const sketch = await Sketch.findById(id);

    // Check if sketch exists
    if (!sketch) {
      res.status(404).json({ success: false, message: 'Sketch not found' });
      return;
    }

    // Generate a fresh signed URL
    const freshSignedUrl = await getSignedS3Url(sketch.s3Key);
    sketch.s3Url = freshSignedUrl;
    await sketch.save();

    // Return sketch
    res.status(200).json({
      success: true,
      sketch
    });
  } catch (error) {
    console.error('Error getting sketch:', error);
    res.status(500).json({
      success: false,
      message: `Failed to get sketch: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
};

/**
 * Delete a sketch
 * @param req Express request
 * @param res Express response
 */
export const deleteSketch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Find sketch by ID
    const sketch = await Sketch.findById(id);

    // Check if sketch exists
    if (!sketch) {
      res.status(404).json({ success: false, message: 'Sketch not found' });
      return;
    }

    // Delete file from S3
    await deleteFileFromS3(sketch.s3Key);

    // Delete sketch from MongoDB
    await Sketch.findByIdAndDelete(id);

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Sketch deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting sketch:', error);
    res.status(500).json({
      success: false,
      message: `Failed to delete sketch: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
};

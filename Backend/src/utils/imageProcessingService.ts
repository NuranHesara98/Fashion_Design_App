import * as fs from 'fs';
import * as path from 'path';
import { Request } from 'express';
import { ImageProcessingResult } from '../types';

/**
 * Process a sketch image to extract features
 * 
 * @param imagePath Path to the sketch image
 * @returns Promise with the processing result
 */
export const processSketchImage = async (imagePath: string): Promise<ImageProcessingResult> => {
  try {
    // For now, we're just returning basic information about the image
    // In a real implementation, we might use image processing libraries to extract features
    const stats = fs.statSync(imagePath);
    
    return {
      imagePath,
      features: {
        size: stats.size,
        lastModified: stats.mtime,
        type: path.extname(imagePath).slice(1) // Remove the dot from extension
      }
    };
  } catch (error) {
    console.error('Error processing sketch image:', error);
    throw error;
  }
};

/**
 * Process an image to extract features
 * 
 * @param imagePath Path to the image
 * @returns Promise with the processing result
 */
export const processImage = async (imagePath: string): Promise<ImageProcessingResult> => {
  // Currently this is the same as processSketchImage, but could be extended for different processing
  return processSketchImage(imagePath);
};

/**
 * Get the full URL for an image
 * 
 * @param req Express request object
 * @param imagePath Path to the image
 * @returns Full URL to the image
 */
export const getImageUrl = (req: Request, imagePath: string): string => {
  // Convert backslashes to forward slashes for URLs
  const normalizedPath = imagePath.replace(/\\/g, '/');
  
  // Extract the relative path (everything after 'uploads/')
  const relativePath = normalizedPath.includes('uploads/') 
    ? normalizedPath.split('uploads/')[1] 
    : path.basename(normalizedPath);
  
  // Construct the full URL
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const host = req.headers.host;
  
  return `${protocol}://${host}/uploads/${relativePath}`;
};

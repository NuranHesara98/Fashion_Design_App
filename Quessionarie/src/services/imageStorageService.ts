import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import GeneratedImage, { IGeneratedImage } from '../models/generatedImage';
import { uploadToS3 } from './s3Service';
import { ImageGenerationMetadata } from '../types/metadataTypes';

/**
 * Stores a generated image in both MongoDB and AWS S3
 * 
 * @param imageUrl URL of the image to download
 * @param localImagePath Local path where the image is saved
 * @param prompt Original prompt used to generate the image
 * @param enhancedPrompt Enhanced prompt used for image generation
 * @param originalImagePath Path to the original sketch or cloth image
 * @param metadata Additional metadata about the image generation request
 * @returns Promise with the stored image data
 */
export const storeGeneratedImage = async (
  imageUrl: string,
  localImagePath: string,
  prompt: string,
  enhancedPrompt?: string,
  originalImagePath?: string,
  metadata?: ImageGenerationMetadata
): Promise<IGeneratedImage> => {
  try {
    // Get the absolute path to the local image
    const absoluteLocalPath = path.resolve(__dirname, '../../public', localImagePath.replace(/^\//, ''));
    
    // Check if the file exists
    if (!fs.existsSync(absoluteLocalPath)) {
      throw new Error(`Local image file not found: ${absoluteLocalPath}`);
    }
    
    // Generate a unique key for S3
    const filename = path.basename(absoluteLocalPath);
    const s3Key = `generated-images/${Date.now()}-${uuidv4().substring(0, 8)}-${filename}`;
    
    // Upload the image to S3
    const s3Url = await uploadToS3(absoluteLocalPath, s3Key);
    
    // Create a new document in MongoDB
    const generatedImage = new GeneratedImage({
      prompt,
      enhancedPrompt,
      originalImagePath,
      s3Url,
      localPath: localImagePath,
      metadata
    });
    
    // Save to MongoDB
    await generatedImage.save();
    console.log(`Image metadata saved to MongoDB with ID: ${generatedImage._id}`);
    
    return generatedImage;
  } catch (error) {
    console.error('Error storing generated image:', error);
    throw error;
  }
};

/**
 * Retrieves all generated images from MongoDB
 * 
 * @returns Promise with an array of generated images
 */
export const getAllGeneratedImages = async (): Promise<IGeneratedImage[]> => {
  try {
    return await GeneratedImage.find().sort({ createdAt: -1 });
  } catch (error) {
    console.error('Error retrieving generated images:', error);
    throw error;
  }
};

/**
 * Retrieves a generated image by ID
 * 
 * @param id MongoDB ID of the image
 * @returns Promise with the generated image
 */
export const getGeneratedImageById = async (id: string): Promise<IGeneratedImage | null> => {
  try {
    return await GeneratedImage.findById(id);
  } catch (error) {
    console.error(`Error retrieving generated image with ID ${id}:`, error);
    throw error;
  }
};

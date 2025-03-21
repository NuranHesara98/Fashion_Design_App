import { Request, Response } from 'express';
import { PromptGenerationRequest, FileRequest, ImageProcessingResult } from '../types';
import { ImageGenerationMetadata } from '../types/metadataTypes';
import { generateComplementaryPalette } from '../utils/colorUtils';
import { processSketchImage, getImageUrl, processImage } from '../utils/imageProcessingService';
import { generateImage, generateText } from '../services/aiServiceFactory';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { AuthRequest } from '../middleware/authMiddleware';
import mongoose from 'mongoose';

// Load environment variables with explicit path
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Get API keys from environment variables
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Check for API keys on startup
if (!OPENAI_API_KEY) {
  console.error('WARNING: OpenAI API key is not properly configured.');
} else {
  console.log('Controller: OpenAI API key is configured successfully.');
}

/**
 * Generate an AI image prompt based on user input and predefined dress sketch
 * 
 * This function takes user preferences and combines them with the predefined
 * dress sketch to create a detailed prompt for AI image generation.
 * 
 * @param req Express request object containing user preferences
 * @param res Express response object
 */
export const generateImagePrompt = async (
  req: Request<{}, {}, PromptGenerationRequest>, 
  res: Response
): Promise<void> => {
  try {
    console.log('Received prompt generation request:', req.body);
    
    // Extract user input from request body
    const { 
      primaryPurpose, 
      occasion, 
      materialPreference, 
      timeOfDay, 
      skinTone,
      styleKeywords = '' // Default to empty string if not provided
    } = req.body;

    console.log('Extracted parameters:', { 
      primaryPurpose, 
      occasion, 
      materialPreference, 
      timeOfDay, 
      skinTone,
      styleKeywords 
    });

    // Validate required inputs
    if (!primaryPurpose || !occasion || !materialPreference || !timeOfDay || !skinTone) {
      console.log('Missing required fields:', { 
        primaryPurpose: !!primaryPurpose, 
        occasion: !!occasion, 
        materialPreference: !!materialPreference, 
        timeOfDay: !!timeOfDay, 
        skinTone: !!skinTone 
      });
      
      res.status(400).json({
        error: 'Missing required fields. Please provide primaryPurpose, occasion, materialPreference, timeOfDay, and skinTone.'
      });
      return;
    }

    // Generate complementary color palette based on skin tone
    console.log('Generating color palette for skin tone:', skinTone);
    const colorPalette = generateComplementaryPalette(skinTone);
    console.log('Generated color palette:', colorPalette);
    
    // Format color palette as a readable string (use only first 2 colors to reduce tokens)
    const colorDescription = colorPalette.slice(0, 2).join(' and ');

    // Simplified time-based description
    const timeStyle = timeOfDay === 'Night' ? 'deep tones, subtle shimmer' : 'bright colors, airy textures';

    // Get concise material description
    const materialDescription = getSimpleMaterialDescription(materialPreference);
    console.log('Material description:', materialDescription);

    // Construct a more concise prompt
    const prompt = `${primaryPurpose} dress for ${occasion}. ` +
      `${materialDescription}. ${timeStyle}. ` +
      `Colors: ${colorDescription}. ` +
      `${styleKeywords ? `Style: ${styleKeywords}. ` : ''}` +
      `Fashion atelier photo. Garment on dress form only, not human. Studio setting, professional lighting. Photorealistic.`;

    console.log('Generated prompt:', prompt);

    // Return just the prompt without calling OpenAI API
    res.json({ prompt });
  } catch (error) {
    console.error('Error generating prompt:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * Generate an image prompt with a sketch
 * 
 * @param req Request with sketch file and prompt parameters
 * @param res Response
 */
export const generateImagePromptWithSketch = async (req: FileRequest & AuthRequest, res: Response): Promise<void> => {
  try {
    // Validate request
    if (!req.file) {
      res.status(400).json({ error: 'No sketch file uploaded' });
      return;
    }

    // Extract parameters from request
    const { 
      primaryPurpose,
      occasion,
      materialPreference,
      timeOfDay,
      skinTone,
      styleKeywords
    } = req.body;

    // Get user ID if available
    const userId = req.user?.id;

    // Process the uploaded sketch image
    const sketchPath = req.file.path;
    console.log(`Sketch uploaded to: ${sketchPath}`);
    
    // Verify the sketch file exists
    if (!fs.existsSync(sketchPath)) {
      console.error(`Sketch file does not exist at path: ${sketchPath}`);
      res.status(400).json({ error: 'Sketch file could not be processed' });
      return;
    }
    
    const processedSketch = await processSketchImage(sketchPath);
    
    // Generate a prompt based on the parameters and sketch
    const prompt = constructPrompt({
      primaryPurpose,
      occasion,
      materialPreference,
      timeOfDay,
      skinTone,
      styleKeywords,
      sketchFeatures: processedSketch.features
    });

    console.log('Generated prompt:', prompt);

    try {
      // Generate the image using AI service factory with metadata
      const result = await generateImage(
        prompt, 
        sketchPath, // Pass the full path to the sketch file
        {
          primaryPurpose,
          occasion,
          materialPreference,
          timeOfDay,
          skinTone,
          styleKeywords
        },
        userId // Pass user ID to associate the image with the user
      );

      // Prepare the response
      const response: any = {
        prompt,
        enhancedPrompt: result.enhancedPrompt || prompt, // Include the enhanced prompt
        sketchImage: {
          url: getImageUrl(req, sketchPath),
          ...processedSketch
        }
      };

      // Add the generated image URL if available
      if (result.imageUrl) {
        response.generatedImage = {
          url: result.imageUrl
        };
        
        // Add the local image path if available
        if (result.localImagePath) {
          response.generatedImage.localPath = result.localImagePath;
        }
      }

      // Add the text response if no image was generated
      if (result.textResponse) {
        response.aiResponse = result.textResponse;
      }

      res.json(response);
    } catch (error) {
      console.error('Error generating image:', error);
      
      // Check if it's an API key error
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('API key')) {
        res.status(500).json({ 
          error: 'API configuration error', 
          details: errorMessage,
          prompt
        });
      } else {
        res.status(500).json({ 
          error: 'Failed to generate image', 
          details: errorMessage,
          prompt
        });
      }
    }
  } catch (error) {
    console.error('Error processing sketch:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * Construct a prompt based on user input and sketch features
 * 
 * @param params Object containing user input and sketch features
 * @returns Constructed prompt string
 */
const constructPrompt = (params: {
  primaryPurpose: string;
  occasion: string;
  materialPreference: string;
  timeOfDay: string;
  skinTone: string;
  styleKeywords?: string;
  sketchFeatures?: any;
}): string => {
  const { 
    primaryPurpose, 
    occasion, 
    materialPreference, 
    timeOfDay, 
    skinTone,
    styleKeywords = '',
    sketchFeatures = {}
  } = params;

  // Generate complementary color palette
  const colorPalette = generateComplementaryPalette(skinTone);
  const colorDescription = colorPalette.slice(0, 2).join(' and ');

  // Time-based description
  const timeStyle = timeOfDay === 'Night' ? 'deep tones, subtle shimmer' : 'bright colors, airy textures';

  // Material description
  const materialDescription = getSimpleMaterialDescription(materialPreference);

  // Sketch information - just a simple indicator that a sketch was provided
  // The detailed sketch analysis will be added by the OpenAI service
  const sketchInfo = Object.keys(sketchFeatures).length > 0 ? `based on the provided sketch` : '';

  // Construct the prompt
  return `${primaryPurpose} dress for ${occasion} ${sketchInfo}. ` +
    `${materialDescription}. ${timeStyle}. ` +
    `Colors: ${colorDescription}. ` +
    `${styleKeywords ? `Style: ${styleKeywords}. ` : ''}` +
    `Fashion atelier photo. Garment on dress form only, not human. Studio setting, professional lighting. Photorealistic luxury fashion catalog style.`;
};

/**
 * Helper function to generate simplified material descriptions
 * @param material The base material preference
 * @returns A concise description of the material
 */
const getSimpleMaterialDescription = (material: string): string => {
  switch (material.toLowerCase()) {
    case 'cotton':
      return 'soft, breathable cotton';
    case 'silk':
      return 'smooth, luxurious silk';
    case 'linen':
      return 'light, textured linen';
    case 'wool':
      return 'warm, natural wool';
    case 'leather':
      return 'supple leather';
    case 'denim':
      return 'sturdy denim';
    case 'polyester':
      return 'durable polyester';
    case 'velvet':
      return 'plush velvet';
    default:
      return material;
  }
};

/**
 * Generate an image from a cloth image
 * 
 * This function takes an uploaded cloth image and generates a new image based on it
 * using AI image generation.
 * 
 * @param req Express request object containing the cloth image and options
 * @param res Express response object
 */
export const generateImageFromCloth = async (
  req: FileRequest & AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // Validate request
    if (!req.file) {
      res.status(400).json({ error: 'No cloth image uploaded' });
      return;
    }

    // Get user ID if available
    const userId = req.user?.id;

    // Extract parameters from request
    const { 
      enhanceDetails = 'true',
      preserveColors = 'true',
      styleKeywords = ''
    } = req.body;

    // Process the uploaded cloth image
    const clothImagePath = req.file.path;
    console.log(`Cloth image uploaded to: ${clothImagePath}`);
    
    // Verify the cloth image file exists
    if (!fs.existsSync(clothImagePath)) {
      console.error(`Cloth image file does not exist at path: ${clothImagePath}`);
      res.status(400).json({ error: 'Cloth image file could not be processed' });
      return;
    }
    
    // Process the image to get features if needed
    const processedImage = await processImage(clothImagePath);
    
    // Generate a prompt based on the cloth image
    const prompt = constructClothImagePrompt({
      clothImagePath,
      enhanceDetails: enhanceDetails === 'true',
      preserveColors: preserveColors === 'true',
      styleKeywords
    });

    console.log('Generated cloth image prompt:', prompt);

    try {
      // Generate the image using AI service factory with metadata
      const result = await generateImage(
        prompt, 
        clothImagePath, // Pass the full path to the cloth image file
        {
          styleKeywords,
          enhanceDetails: enhanceDetails,
          preserveColors: preserveColors
        },
        userId // Pass user ID to associate the image with the user
      );

      // Prepare the response
      const response: any = {
        prompt,
        enhancedPrompt: result.enhancedPrompt || prompt, // Include the enhanced prompt
        clothImage: {
          url: getImageUrl(req, clothImagePath),
          ...processedImage
        }
      };

      // Add the generated image URL if available
      if (result.imageUrl) {
        response.generatedImage = {
          url: result.imageUrl
        };
        
        // Add the local image path if available
        if (result.localImagePath) {
          response.generatedImage.localPath = result.localImagePath;
        }
      }

      // Add the text response if no image was generated
      if (result.textResponse) {
        response.aiResponse = result.textResponse;
      }

      res.json(response);
    } catch (error) {
      console.error('Error generating image from cloth:', error);
      
      // Check if it's an API key error
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('API key')) {
        res.status(500).json({ 
          error: 'API configuration error', 
          details: errorMessage,
          prompt
        });
      } else {
        res.status(500).json({ 
          error: 'Failed to generate image from cloth', 
          details: errorMessage,
          prompt
        });
      }
    }
  } catch (error) {
    console.error('Error processing cloth image:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * Constructs a prompt for cloth image generation
 * 
 * @param params Object containing parameters for cloth image prompt generation
 * @returns Constructed prompt string
 */
const constructClothImagePrompt = (params: {
  clothImagePath: string;
  enhanceDetails: boolean;
  preserveColors: boolean;
  styleKeywords: string;
}): string => {
  const { 
    clothImagePath,
    enhanceDetails,
    preserveColors,
    styleKeywords
  } = params;

  // Base prompt
  let prompt = 'Create a professional fashion photograph of this clothing item ';
  
  // Add enhancement details
  if (enhanceDetails) {
    prompt += 'with enhanced details, texture, and clarity. ';
  } else {
    prompt += 'maintaining its original details and texture. ';
  }
  
  // Add color preservation
  if (preserveColors) {
    prompt += 'Preserve the original colors exactly. ';
  } else {
    prompt += 'Feel free to adjust colors for better visual appeal. ';
  }
  
  // Add style keywords if provided
  if (styleKeywords) {
    prompt += `Style: ${styleKeywords}. `;
  }
  
  // Add final details
  prompt += 'Fashion atelier photo. Garment on dress form only, not human. Studio setting, professional lighting. Photorealistic luxury fashion catalog style.';
  
  return prompt;
};

/**
 * Get user's generated images history
 * 
 * This function retrieves all images that were generated by the user
 * 
 * @param req Express request object with user authentication
 * @param res Express response object
 */
export const getGeneratedImages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    console.log('Request for generated images received');
    console.log('User authentication status:', userId ? 'Authenticated' : 'Not authenticated');
    
    // Import the GeneratedImage model
    const GeneratedImage = mongoose.model('GenCloths');
    
    // If user is authenticated, try to find their images first
    let userGeneratedImages: any[] = [];
    
    if (userId) {
      console.log(`Fetching generated images for user: ${userId}`);
      userGeneratedImages = await GeneratedImage.find({ user: userId })
        .sort({ createdAt: -1 }) // Sort by creation date, newest first
        .lean(); // Convert to plain JavaScript objects for better performance
      
      console.log(`Found ${userGeneratedImages.length} images for user ${userId}`);
    }
    
    // If no user-specific images found or user not authenticated, get all images
    if (!userGeneratedImages || userGeneratedImages.length === 0) {
      console.log('No user-specific images found or user not authenticated, fetching all images');
      userGeneratedImages = await GeneratedImage.find({})
        .sort({ createdAt: -1 })
        .limit(20) // Limit to 20 most recent images
        .lean();
      
      console.log(`Found ${userGeneratedImages.length} images in total`);
      
      // Debug: Print the first image to see its structure
      if (userGeneratedImages.length > 0) {
        console.log('Sample image structure:', JSON.stringify(userGeneratedImages[0], null, 2));
      }
    }

    // If still no images found, return mock data for testing
    if (!userGeneratedImages || userGeneratedImages.length === 0) {
      console.log('No images found in database, returning mock data');
      // If no real images are found, return some mock data for testing
      // In production, you would remove this and just return an empty array
      const mockGeneratedImages = [
        {
          id: '1',
          image_url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000',
          prompt: 'Summer dress with floral pattern',
          created_at: new Date().toISOString(),
          user_id: userId || 'guest'
        },
        {
          id: '2',
          image_url: 'https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?q=80&w=1000',
          prompt: 'Winter jacket with fur collar',
          created_at: new Date(Date.now() - 86400000).toISOString(), // Yesterday
          user_id: userId || 'guest'
        },
        {
          id: '3',
          image_url: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=1000',
          prompt: 'Business casual outfit',
          created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          user_id: userId || 'guest'
        },
        {
          id: '4',
          image_url: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=1000',
          prompt: 'Evening gown with sequins',
          created_at: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
          user_id: userId || 'guest'
        }
      ];
      
      res.status(200).json({
        success: true,
        data: mockGeneratedImages,
        message: 'No real generated images found, returning mock data for testing'
      });
      return;
    }

    console.log(`Found ${userGeneratedImages.length} generated images to return`);

    // Format the response data to match what the frontend expects
    const formattedImages = userGeneratedImages.map((image: any) => {
      // Ensure the image URL is properly formatted
      let imageUrl = image.s3Url || image.publicUrl || '';
      // Use publicUrl as a fallback if available
      let fallbackUrl = image.publicUrl || image.s3Url || '';
      
      // Log the image data for debugging
      console.log('Processing image:', {
        id: image._id,
        s3Url: image.s3Url,
        publicUrl: image.publicUrl,
        prompt: image.prompt
      });
      
      return {
        id: image._id ? image._id.toString() : 'unknown',
        image_url: imageUrl, // Use the validated/fixed URL
        s3Url: image.s3Url, // Include original s3Url for the frontend
        publicUrl: image.publicUrl, // Include original publicUrl for the frontend
        fallback_url: fallbackUrl, // Include fallback URL for the frontend
        prompt: image.prompt || 'Generated Design',
        created_at: image.createdAt,
        user_id: image.user ? image.user.toString() : (userId || 'guest'),
        // Include any other fields needed by the frontend
        metadata: image.metadata,
        enhancedPrompt: image.enhancedPrompt || ''
      };
    });

    // Return the generated images
    res.status(200).json({
      success: true,
      data: formattedImages,
      message: 'Generated images retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching generated images:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch generated images',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Check if the AI provider API key is configured
 * @param req - Express request object
 * @param res - Express response object
 */
export const checkApiConfig = (req: Request, res: Response): void => {
  if (OPENAI_API_KEY) {
    res.json({
      status: 'configured',
      provider: 'openai',
      message: 'OpenAI API key is properly configured'
    });
  } else {
    res.json({
      status: 'not_configured',
      provider: 'openai',
      message: 'OpenAI API key is not properly configured'
    });
  }
};

/**
 * Save an image from an external URL to AWS S3 and MongoDB
 * 
 * This function takes an external image URL (like from DALL-E) and saves it to
 * AWS S3 and MongoDB for future use in the application.
 * 
 * @param req Express request object containing the image URL and metadata
 * @param res Express response object
 */
export const saveExternalImage = async (
  req: Request & AuthRequest,
  res: Response
): Promise<void> => {
  try {
    console.log('Received external image save request:', req.body);
    
    const { imageUrl, metadata } = req.body;
    
    if (!imageUrl) {
      res.status(400).json({
        success: false,
        message: 'Image URL is required'
      });
      return;
    }
    
    // Get user ID from authenticated user or use null for anonymous
    const userId = req.user?._id || null;
    
    // Import the storeImageFromUrl function
    const { storeImageFromUrl } = await import('../services/imageStorageService');
    
    // Store the image from URL
    const s3Url = await storeImageFromUrl(imageUrl, metadata, userId);
    
    if (!s3Url) {
      res.status(500).json({
        success: false,
        message: 'Failed to save image from URL'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      message: 'Image saved successfully',
      data: {
        imageUrl: s3Url
      }
    });
  } catch (error: any) {
    console.error('Error saving external image:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error saving external image'
    });
  }
};

/**
 * Save an existing S3 image to MongoDB
 * 
 * This function takes an S3 URL that already exists and saves it to MongoDB
 * for future use in the application.
 * 
 * @param req Express request object containing the S3 URL and metadata
 * @param res Express response object
 */
export const saveS3ImageToMongoDB = async (
  req: Request & AuthRequest,
  res: Response
): Promise<void> => {
  try {
    console.log('Received S3 image save request:', req.body);
    
    const { s3Url, metadata } = req.body;
    
    if (!s3Url) {
      res.status(400).json({
        success: false,
        message: 'S3 URL is required'
      });
      return;
    }
    
    // Get user ID from authenticated user or use null for anonymous
    const userId = req.user?._id || null;
    
    // Import the saveS3ImageToMongoDB function
    const { saveS3ImageToMongoDB: saveS3Image } = await import('../services/imageStorageService');
    
    // Save the S3 image to MongoDB
    const savedUrl = await saveS3Image(s3Url, metadata, userId);
    
    if (!savedUrl) {
      res.status(500).json({
        success: false,
        message: 'Failed to save S3 image to MongoDB'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      message: 'S3 image saved to MongoDB successfully',
      data: {
        imageUrl: savedUrl
      }
    });
  } catch (error: any) {
    console.error('Error saving S3 image to MongoDB:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error saving S3 image to MongoDB'
    });
  }
};

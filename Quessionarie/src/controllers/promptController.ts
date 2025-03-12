import { Request, Response } from 'express';
import { PromptGenerationRequest, FileRequest, ImageProcessingResult } from '../types';
import { ImageGenerationMetadata } from '../types/metadataTypes';
import { generateComplementaryPalette } from '../utils/colorUtils';
import { processSketchImage, getImageUrl, processImage } from '../utils/imageProcessingService';
import { generateImage, generateText } from '../services/aiServiceFactory';
import * as dotenv from 'dotenv';
import * as path from 'path';

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
    const prompt = `Fashion photo: ${primaryPurpose} dress for ${occasion}. ` +
      `Made of ${materialDescription}. ${timeStyle}. ` +
      `Colors: ${colorDescription}, would match ${skinTone} skin tone. ` +
      `${styleKeywords ? `Style: ${styleKeywords}. ` : ''}` +
      `High-res, studio lighting, neutral background. Photorealistic, not AI-generated looking.`;

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
export const generateImagePromptWithSketch = async (req: FileRequest, res: Response): Promise<void> => {
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

    // Process the uploaded sketch image
    const sketchPath = req.file.path;
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
        sketchPath,
        {
          primaryPurpose,
          occasion,
          materialPreference,
          timeOfDay,
          skinTone,
          styleKeywords
        }
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
    console.error('Error generating image prompt with sketch:', error);
    res.status(500).json({ 
      error: 'Failed to generate image prompt with sketch', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

/**
 * Construct a prompt based on user input and sketch features
 * 
 * @param params Object containing user input and sketch features
 * @returns Constructed prompt string
 */
function constructPrompt(params: {
  primaryPurpose: string;
  occasion: string;
  materialPreference: string;
  timeOfDay: string;
  skinTone: string;
  styleKeywords?: string;
  sketchFeatures?: any;
}): string {
  const {
    primaryPurpose,
    occasion,
    materialPreference,
    timeOfDay,
    skinTone,
    styleKeywords = '',
    sketchFeatures = {}
  } = params;

  // Generate complementary color palette based on skin tone
  const colorPalette = generateComplementaryPalette(skinTone);
  
  // Format color palette as a readable string (use only first 2 colors to reduce tokens)
  const colorDescription = colorPalette.slice(0, 2).join(' and ');

  // Simplified time-based description
  const timeStyle = timeOfDay === 'Night' ? 'deep tones, subtle shimmer' : 'bright colors, airy textures';

  // Get concise material description
  const materialDescription = getSimpleMaterialDescription(materialPreference);

  // Construct a more concise prompt with reference to the uploaded sketch
  return `Fashion photo: dress based on the uploaded sketch. ` +
    `For ${primaryPurpose} at ${occasion}, made of ${materialDescription}. ` +
    `${timeStyle}. Colors: ${colorDescription}, would match ${skinTone} skin tone. ` +
    `${styleKeywords ? `Style: ${styleKeywords}. ` : ''}` +
    `High-res, studio lighting, neutral background. Photorealistic, not AI-generated looking.`;
}

/**
 * Helper function to generate simplified material descriptions
 * @param material The base material preference
 * @returns A concise description of the material
 */
function getSimpleMaterialDescription(material: string): string {
  // Map common materials to concise descriptions
  const materialDescriptions: Record<string, string> = {
    'cotton': 'breathable cotton',
    'silk': 'lustrous silk',
    'satin': 'smooth satin',
    'linen': 'textured linen',
    'velvet': 'plush velvet',
    'leather': 'supple leather',
    'lace': 'intricate lace',
    'chiffon': 'flowing chiffon',
    'denim': 'structured denim',
    'wool': 'fine wool'
  };

  // Return simplified description if available, otherwise create a generic one
  return materialDescriptions[material.toLowerCase()] || `${material} fabric`;
}

/**
 * Original helper function kept for reference
 * @deprecated Use getSimpleMaterialDescription instead
 */
function getMaterialDescription(material: string): string {
  // Map common materials to detailed descriptions
  const materialDescriptions: Record<string, string> = {
    'cotton': `crafted from premium cotton that provides a comfortable, breathable structure while maintaining the dress's shape`,
    'silk': `made from luxurious silk that drapes elegantly and creates a subtle sheen that catches the light with every movement`,
    'satin': `constructed with smooth satin that creates a lustrous surface and flows gracefully with the body's contours`,
    'linen': `tailored from textured linen that offers a natural, relaxed appearance with subtle structural integrity`,
    'velvet': `fashioned from plush velvet that adds depth and richness to the silhouette with its dense, soft texture`,
    'leather': `designed with supple leather that creates a bold, edgy statement while conforming perfectly to the body`,
    'lace': `detailed with intricate lace that adds delicate texture and romantic transparency to the design`,
    'chiffon': `created with flowing chiffon that brings ethereal lightness and gentle movement to the dress`,
    'denim': `constructed from structured denim that provides a casual yet tailored appearance with distinctive texture`,
    'wool': `made from fine wool that offers warmth and structure with a refined, sophisticated finish`
  };

  // Return detailed description if available, otherwise create a generic one
  return materialDescriptions[material.toLowerCase()] || 
    `crafted from ${material} fabric that drapes beautifully, highlighting the dress structure and adding texture to the overall design`;
}

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
  req: FileRequest,
  res: Response
): Promise<void> => {
  try {
    // Validate request
    if (!req.file) {
      res.status(400).json({ error: 'No cloth image uploaded' });
      return;
    }

    console.log('Received cloth image generation request');
    
    // Extract parameters from request
    const { 
      enhanceDetails = 'true', 
      preserveColors = 'true',
      styleKeywords = ''
    } = req.body;

    // Convert string parameters to boolean
    const shouldEnhanceDetails = enhanceDetails === 'true';
    const shouldPreserveColors = preserveColors === 'true';

    // Process the uploaded cloth image
    const clothImagePath = req.file.path;
    const processedImage = await processImage(clothImagePath);
    
    // Generate a prompt based on the parameters and cloth image
    const prompt = constructClothImagePrompt({
      clothImagePath,
      enhanceDetails: shouldEnhanceDetails,
      preserveColors: shouldPreserveColors,
      styleKeywords
    });

    console.log('Generated cloth image prompt:', prompt);

    try {
      // Generate the image using AI service factory with metadata
      const result = await generateImage(
        prompt, 
        clothImagePath,
        {
          styleKeywords,
          enhanceDetails: shouldEnhanceDetails.toString(),
          preserveColors: shouldPreserveColors.toString()
        }
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
          error: 'Failed to generate image', 
          details: errorMessage,
          prompt
        });
      }
    }
  } catch (error) {
    console.error('Error generating image from cloth:', error);
    res.status(500).json({ 
      error: 'Failed to generate image from cloth', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

/**
 * Constructs a prompt for cloth image generation
 * 
 * @param params Object containing parameters for cloth image prompt generation
 * @returns Constructed prompt string
 */
function constructClothImagePrompt(params: {
  clothImagePath: string;
  enhanceDetails: boolean;
  preserveColors: boolean;
  styleKeywords: string;
}): string {
  const { clothImagePath, enhanceDetails, preserveColors, styleKeywords } = params;
  
  // Base prompt
  let prompt = 'Generate a high-quality fashion product image of this clothing item. ';
  
  // Add enhancement details if requested
  if (enhanceDetails) {
    prompt += 'Enhance the details and textures of the fabric. ';
  }
  
  // Add color preservation if requested
  if (preserveColors) {
    prompt += 'Preserve the original colors and patterns of the clothing. ';
  }
  
  // Add style keywords if provided
  if (styleKeywords && styleKeywords.trim() !== '') {
    prompt += `Apply the following style: ${styleKeywords}. `;
  }
  
  // Add general quality instructions
  prompt += 'The clothing should be displayed on a mannequin/dress form, not on a human model. ';
  prompt += 'Use a clean white background. ';
  prompt += 'The image should be photorealistic, high-quality fashion photography, not looking AI-generated. ';
  prompt += 'Make it look like a professional product photograph from a high-end fashion catalog.';
  
  return prompt;
}

/**
 * Check if the AI provider API key is configured
 * @param req - Express request object
 * @param res - Express response object
 */
export const checkApiConfig = (req: Request, res: Response): void => {
    const isConfigured = OPENAI_API_KEY;
    
    res.json({
        status: isConfigured ? 'API key is configured' : 'API key is not configured',
        provider: 'OpenAI'
    });
};

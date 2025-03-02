import { Request, Response } from 'express';
import { PromptGenerationRequest, FileRequest, ImageProcessingResult } from '../types';
import { generateComplementaryPalette } from '../utils/colorUtils';
import { processSketchImage, getImageUrl, processImage } from '../utils/imageProcessingService';
import { generateTextWithGemini } from '../services/geminiService';

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
    // Extract user input from request body
    const {
      primaryPurpose,
      occasion,
      materialPreference,
      timeOfDay,
      skinTone,
      styleKeywords = '' // Default to empty string if not provided
    } = req.body;

    // Validate required inputs
    if (!primaryPurpose || !occasion || !materialPreference || !timeOfDay || !skinTone) {
      res.status(400).json({
        error: 'Missing required fields. Please provide primaryPurpose, occasion, materialPreference, timeOfDay, and skinTone.'
      });
      return;
    }

    // Validate skin tone format (should be a hex color code)
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!hexColorRegex.test(skinTone)) {
      res.status(400).json({
        error: 'Invalid skin tone format. Please provide a valid hex color code (e.g., "#9F8880").'
      });
      return;
    }

    // Generate complementary color palette based on skin tone
    const colorPalette = generateComplementaryPalette(skinTone);
    
    // Format color palette as a readable string (use only first 2 colors to reduce tokens)
    const colorDescription = colorPalette.slice(0, 2).join(' and ');

    // Simplified dress sketch description
    const dressBaseDescription = 
      'mini dress with fitted bustier top, puff sleeves, ruffled collar, chest cutout, flared skirt with vertical panels';

    // Simplified time-based description
    const timeStyle = timeOfDay === 'Night' ? 'deep tones, subtle shimmer' : 'bright colors, airy textures';

    // Get concise material description
    const materialDescription = getSimpleMaterialDescription(materialPreference);

    // Construct a more concise prompt
    const prompt = `Fashion photo: dress on mannequin/dummy. ${dressBaseDescription}. ` +
      `For ${primaryPurpose} at ${occasion}, ${materialDescription}. ` +
      `${timeStyle}. Colors: ${colorDescription}, would match ${skinTone} skin tone. ` +
      `${styleKeywords ? `Style: ${styleKeywords}. ` : ''}` +
      `High-res, studio lighting, neutral background. Photorealistic, not AI-generated looking.`;

    try {
      // Generate text response using Gemini API
      const aiResponse = await generateTextWithGemini(prompt);
      
      // Return the generated prompt and AI response
      res.status(200).json({ 
        prompt,
        aiResponse
      });
    } catch (error) {
      console.error('Error generating text response:', error);
      // If text generation fails, still return the prompt
      res.status(200).json({ 
        prompt,
        error: 'Text generation failed, but prompt was created successfully'
      });
    }
  } catch (error) {
    console.error('Error generating prompt:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    });
  }
};

/**
 * Generate an AI image prompt based on user input and an uploaded sketch image
 * 
 * @param req Express request object containing user preferences and file
 * @param res Express response object
 */
export const generateImagePromptWithSketch = async (
  req: FileRequest,
  res: Response
): Promise<void> => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      res.status(400).json({ error: 'No sketch image uploaded' });
      return;
    }

    // Extract user input from request body
    const {
      primaryPurpose,
      occasion,
      materialPreference,
      timeOfDay,
      skinTone,
      styleKeywords = '' // Default to empty string if not provided
    } = req.body;

    // Validate required inputs
    if (!primaryPurpose || !occasion || !materialPreference || !timeOfDay || !skinTone) {
      res.status(400).json({
        error: 'Missing required fields. Please provide primaryPurpose, occasion, materialPreference, timeOfDay, and skinTone.'
      });
      return;
    }

    // Process the uploaded sketch image
    const sketchImageResult: ImageProcessingResult = await processSketchImage(req.file.path);
    
    // Generate image URL
    const imageUrl = getImageUrl(req, req.file.path);

    // Generate complementary color palette based on skin tone
    const colorPalette = generateComplementaryPalette(skinTone);
    
    // Format color palette as a readable string (use only first 2 colors to reduce tokens)
    const colorDescription = colorPalette.slice(0, 2).join(' and ');

    // Simplified time-based description
    const timeStyle = timeOfDay === 'Night' ? 'deep tones, subtle shimmer' : 'bright colors, airy textures';

    // Get concise material description
    const materialDescription = getSimpleMaterialDescription(materialPreference);

    // Construct a more concise prompt with reference to the uploaded sketch
    const prompt = `Fashion photo: dress from uploaded sketch on mannequin/dummy. ` +
      `For ${primaryPurpose} at ${occasion}, ${materialDescription}. ` +
      `${timeStyle}. Colors: ${colorDescription}, would match ${skinTone} skin tone. ` +
      `${styleKeywords ? `Style: ${styleKeywords}. ` : ''}` +
      `High-res, studio lighting, neutral background. Photorealistic, not AI-generated looking.`;

    try {
      // Generate text response using Gemini API with the sketch as reference
      const aiResponse = await generateTextWithGemini(prompt);
      
      // Return the generated prompt, sketch info, and AI response
      res.status(200).json({ 
        prompt,
        sketchImage: {
          url: imageUrl,
          path: req.file.path,
          features: sketchImageResult.features
        },
        aiResponse
      });
    } catch (error) {
      console.error('Error generating text response with sketch:', error);
      // If text generation fails, still return the prompt and sketch info
      res.status(200).json({ 
        prompt,
        sketchImage: {
          url: imageUrl,
          path: req.file.path,
          features: sketchImageResult.features
        },
        error: 'Text generation failed, but prompt was created successfully'
      });
    }
  } catch (error) {
    console.error('Error generating prompt with sketch:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    });
  }
};

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

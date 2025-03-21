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

// Helper function to process image URLs for frontend
const processImageUrl = (imageUrl: string): { imageUrl: string } => {
  if (!imageUrl) return { imageUrl: 'https://via.placeholder.com/300x300?text=Design+Image' };
  
  let processedUrl = imageUrl;
  
  // Ensure URL has proper protocol
  if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
    processedUrl = `https://${processedUrl}`;
  }
  
  return { imageUrl: processedUrl };
};

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

    const { imageUrl: processedImageUrl } = processImageUrl(design.imageUrl);

    const formattedDesign = {
      id: design._id.toString(),
      name: design.name,
      imageUrl: processedImageUrl,
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
  const formattedDesigns: DesignResponse[] = designs.map(design => {
    const { imageUrl: processedImageUrl } = processImageUrl(design.imageUrl);
    return {
      id: design._id.toString(),
      name: design.name,
      imageUrl: processedImageUrl,
      createdAt: design.createdAt.toISOString(),
      description: design.description,
      category: design.category,
      tags: design.tags
    };
  });

  console.log('Formatted designs:', formattedDesigns);

  // Return the formatted designs
  res.status(200).json({
    success: true,
    count: formattedDesigns.length,
    data: formattedDesigns
  });
}); 

// @desc    Generate a design using AI
// @route   POST /api/designs/generate
// @access  Public
export const generateDesign = asyncHandler(async (
  req: Request,
  res: Response
) => {
  try {
    const { 
      primaryPurpose, 
      occasion, 
      materialPreference, 
      timeOfDay, 
      skinTone,
      styleKeywords = '',
      sketchUrl,
      userId = null // Allow userId to be passed from frontend
    } = req.body;

    console.log('Received design generation request:', req.body);

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
        success: false,
        message: 'Missing required fields. Please provide primaryPurpose, occasion, materialPreference, timeOfDay, and skinTone.'
      });
      return;
    }

    // Check if OpenAI API key is configured
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      console.error('OpenAI API key is not configured');
      res.status(500).json({
        success: false,
        message: 'Server configuration error: OpenAI API key is not configured'
      });
      return;
    }

    // First, generate the prompt using the existing prompt generation API
    const axios = require('axios');
    const baseUrl = `http://localhost:${process.env.PORT || 5024}`;
    
    // Call the prompt generation API
    const promptResponse = await axios.post(`${baseUrl}/api/prompts/generate-prompt`, {
      primaryPurpose,
      occasion,
      materialPreference,
      timeOfDay,
      skinTone,
      styleKeywords
    });
    
    if (!promptResponse.data || !promptResponse.data.prompt) {
      throw new Error('Failed to generate prompt from API');
    }
    
    let basePrompt = promptResponse.data.prompt;
    console.log('Generated base prompt:', basePrompt);
    
    // Import required modules
    const { generateImageWithOpenAI, analyzeSketchWithOpenAI } = require('../services/openaiService');
    const fs = require('fs');
    const path = require('path');
    const { v4: uuidv4 } = require('uuid');
    
    // Analyze sketch if URL is provided
    let sketchAnalysis = '';
    let sketchSavePath = '';
    
    if (sketchUrl) {
      try {
        console.log('Analyzing sketch from URL:', sketchUrl);
        
        // Create a unique filename for the downloaded sketch
        const sketchFilename = `sketch_${Date.now()}_${uuidv4().substring(0, 8)}.png`;
        sketchSavePath = path.resolve(__dirname, '../../uploads', sketchFilename);
        
        // Ensure the directory exists
        const saveDir = path.dirname(sketchSavePath);
        if (!fs.existsSync(saveDir)) {
          fs.mkdirSync(saveDir, { recursive: true });
        }
        
        // Download the sketch image
        const response = await axios({
          method: 'GET',
          url: sketchUrl,
          responseType: 'stream'
        });
        
        // Save the sketch image
        const writer = fs.createWriteStream(sketchSavePath);
        response.data.pipe(writer);
        
        await new Promise((resolve, reject) => {
          writer.on('finish', resolve);
          writer.on('error', reject);
        });
        
        console.log('Sketch downloaded to:', sketchSavePath);
        
        // Directly analyze the sketch using OpenAI's GPT-4 Vision
        const analysisResult = await analyzeSketchWithOpenAI(sketchSavePath);
        
        if (analysisResult.success && analysisResult.textResponse) {
          sketchAnalysis = analysisResult.textResponse;
          console.log('Sketch analysis successful. Description:', sketchAnalysis.substring(0, 100) + '...');
        } else {
          console.warn('Could not analyze sketch. Using original prompt.');
        }
      } catch (error) {
        console.error('Error analyzing sketch:', error);
      }
    }
    
    // Generate the image using OpenAI's DALL-E 3 with the enhanced prompt
    console.log('Generating image with DALL-E 3...');
    const imageResult = await generateImageWithOpenAI(basePrompt, sketchSavePath, {
      primaryPurpose,
      occasion,
      materialPreference,
      timeOfDay,
      skinTone,
      styleKeywords
    });
    
    if (!imageResult.success) {
      throw new Error(`Failed to generate image: ${imageResult.error}`);
    }
    
    console.log('Generated image URL:', imageResult.imageUrl);

    // Create a design in the database with the generated image
    const designName = `${primaryPurpose} ${occasion} Outfit`;
    
    // Use a default system user ID for AI-generated designs if no user ID is provided
    // Create a valid MongoDB ObjectId for the system user
    const systemUserId = new mongoose.Types.ObjectId();
    
    const design = await Design.create({
      userId: userId || systemUserId, // Use provided userId or default to system user
      name: designName,
      imageUrl: imageResult.imageUrl,
      description: sketchAnalysis || imageResult.enhancedPrompt || basePrompt,
      category: primaryPurpose,
      tags: [primaryPurpose, occasion, materialPreference, timeOfDay]
    });

    // Return success with the design data
    const { imageUrl: processedImageUrl } = processImageUrl(design.imageUrl);
    res.status(200).json({
      success: true,
      message: 'Design generated successfully',
      data: {
        id: design._id.toString(),
        name: design.name,
        imageUrl: processedImageUrl,
        createdAt: design.createdAt.toISOString(),
        description: design.description,
        category: design.category,
        tags: design.tags,
        primaryPurpose,
        occasion,
        materialPreference,
        timeOfDay,
        prompt: imageResult.enhancedPrompt || basePrompt,
        sketchAnalysis: sketchAnalysis
      }
    });
  } catch (error: any) {
    console.error('Error generating design:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error generating design'
    });
  }
});
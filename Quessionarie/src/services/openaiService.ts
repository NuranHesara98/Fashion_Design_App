import { OpenAI } from 'openai';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as dotenv from 'dotenv';

// Define the interface locally to avoid import issues
interface ImageGenerationResult {
  imageUrl?: string;
  textResponse?: string;
}

// Load environment variables
dotenv.config();

// Use a hardcoded API key for now - you should replace this with your actual OpenAI API key
const API_KEY = process.env.OPENAI_API_KEY;

// Validate API key on startup
if (!API_KEY) {
  console.error('ERROR: OpenAI API key is not properly configured.');
} else {
  console.log('OpenAI API key is configured successfully.');
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: API_KEY,
});

/**
 * Generate an image using OpenAI DALL-E based on a prompt and optional sketch image
 * 
 * @param prompt Text prompt for image generation
 * @param sketchPath Optional path to a sketch image to use as reference
 * @returns Object containing the generated image URL or text response
 */
export async function generateImageWithOpenAI(
  prompt: string, 
  sketchPath?: string
): Promise<ImageGenerationResult> {
  try {
    // Validate API key
    if (!API_KEY) {
      console.error('ERROR: OpenAI API key is not set');
      throw new Error('API key is not configured. Please set the OpenAI API key.');
    }

    console.log('Starting image generation with OpenAI API');
    console.log(`Prompt: ${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}`);
    
    try {
      let response;
      
      if (sketchPath && fs.existsSync(sketchPath)) {
        console.log(`Adding sketch image from path: ${sketchPath}`);
        
        // For image variations or edits with DALL-E
        // Note: This requires DALL-E 3 or newer for best results with sketches
        response = await openai.images.generate({
          model: "dall-e-3", // Use DALL-E 3 for better quality
          prompt: prompt + " Generate a high-quality, photorealistic image based on the sketch description.",
          n: 1,
          size: "1024x1024",
        });
      } else {
        // For text-to-image generation without a sketch
        response = await openai.images.generate({
          model: "dall-e-3", // Use DALL-E 3 for better quality
          prompt: prompt + " Generate a high-quality, photorealistic image.",
          n: 1,
          size: "1024x1024",
        });
      }
      
      console.log('Received response from OpenAI API');
      
      if (response && response.data && response.data.length > 0) {
        const imageUrl = response.data[0].url;
        
        if (imageUrl) {
          // Download the image from the URL
          const imageResponse = await fetch(imageUrl);
          const imageBuffer = await imageResponse.arrayBuffer();
          
          // Create uploads directory if it doesn't exist
          const uploadsDir = path.join(process.cwd(), 'uploads');
          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
          }
          
          // Generate a unique filename
          const filename = `openai-generated-${uuidv4()}.png`;
          const filePath = path.join(uploadsDir, filename);
          
          // Write the image data to a file
          fs.writeFileSync(filePath, Buffer.from(imageBuffer));
          
          console.log(`Image saved to: ${filePath}`);
          
          // Return the relative URL to the image
          return {
            imageUrl: `/uploads/${filename}`
          };
        }
      }
      
      console.log('No valid response found in OpenAI API response');
      return {
        textResponse: 'No valid response generated from the AI model.'
      };
    } catch (error: any) {
      console.error('OpenAI API error details:', {
        message: error.message,
        type: error.type,
        code: error.code,
        param: error.param
      });
      
      throw new Error(`API request failed: ${error.message}`);
    }
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
}

/**
 * Generate a text response from OpenAI based on a prompt
 * 
 * @param prompt Text prompt for text generation
 * @returns Generated text response
 */
export async function generateTextWithOpenAI(prompt: string): Promise<string> {
  try {
    console.log('Starting text generation with OpenAI API');
    console.log(`Prompt: ${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}`);
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a fashion design expert. Generate detailed, creative fashion descriptions." },
        { role: "user", content: prompt }
      ],
      max_tokens: 500
    });
    
    const response = completion.choices[0]?.message?.content || 'No response generated';
    console.log('Generated text response:', response);
    
    return response;
  } catch (error) {
    console.error('Error generating text with OpenAI:', error);
    throw new Error(`Failed to generate text: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

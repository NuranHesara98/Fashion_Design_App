import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// API configuration - Using a valid API key
const API_KEY = 'AIzaSyCFa23ClOv6vBCrrLb8g3lzwB4m-KGmw5M'; // Your Gemini API key
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
const GEMINI_VISION_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent';

// Validate API key on startup
if (!API_KEY) {
  console.error('ERROR: API key is not properly configured.');
} else {
  console.log('Gemini API key is configured successfully.');
}

/**
 * Interface for Gemini API response
 */
interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text?: string;
        inlineData?: {
          mimeType: string;
          data: string;
        };
      }[];
    };
  }[];
}

/**
 * Interface for image generation result
 */
interface ImageGenerationResult {
  imageUrl?: string;
  textResponse?: string;
}

/**
 * Generate an image using Gemini based on a prompt and optional sketch image
 * 
 * @param prompt Text prompt for image generation
 * @param sketchPath Optional path to a sketch image to use as reference
 * @returns Object containing the generated image URL or text response
 */
export async function generateImageWithGemini(
  prompt: string, 
  sketchPath?: string
): Promise<ImageGenerationResult> {
  try {
    // Validate API key
    if (!API_KEY) {
      console.error('ERROR: GEMINI_API_KEY is not set');
      throw new Error('API key is not configured. Please set the GEMINI_API_KEY environment variable.');
    }

    console.log('Starting image generation with Gemini API');
    console.log(`Prompt: ${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}`);
    
    // Create the request payload
    const payload: any = {
      contents: [
        {
          parts: [
            { text: prompt + " Generate a high-quality, photorealistic image." }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.4,
        topK: 32,
        topP: 1,
        maxOutputTokens: 2048,
      }
    };

    // Add the sketch image to the payload if provided
    if (sketchPath && fs.existsSync(sketchPath)) {
      console.log(`Adding sketch image from path: ${sketchPath}`);
      const imageBuffer = fs.readFileSync(sketchPath);
      const base64Image = imageBuffer.toString('base64');
      const mimeType = path.extname(sketchPath).toLowerCase() === '.png' ? 'image/png' : 'image/jpeg';
      
      // Add the image to the parts array
      payload.contents[0].parts.push({
        inlineData: {
          mimeType: mimeType,
          data: base64Image
        }
      });
    }

    console.log('Sending request to Gemini API...');
    console.log('Using API URL:', sketchPath ? GEMINI_VISION_API_URL : GEMINI_API_URL);
    
    // Use the vision API URL if a sketch is provided, otherwise use the regular API URL
    const apiUrl = sketchPath ? GEMINI_VISION_API_URL : GEMINI_API_URL;
    
    try {
      // Make the API request with the API key in the URL
      const response = await axios.post(
        `${apiUrl}?key=${API_KEY}`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 60000 // 60 second timeout for image generation
        }
      );
      
      console.log('Received response from Gemini API');
      
      // Check if the response contains an image
      if (response.data && 
          response.data.candidates && 
          response.data.candidates[0] && 
          response.data.candidates[0].content && 
          response.data.candidates[0].content.parts) {
        
        const parts = response.data.candidates[0].content.parts;
        
        // Look for inline data (image)
        for (const part of parts) {
          if (part.inlineData && part.inlineData.data) {
            // Save the image to a file
            const imageData = part.inlineData.data;
            const mimeType = part.inlineData.mimeType || 'image/jpeg';
            const fileExt = mimeType === 'image/png' ? '.png' : '.jpg';
            
            // Create uploads directory if it doesn't exist
            const uploadsDir = path.join(process.cwd(), 'uploads');
            if (!fs.existsSync(uploadsDir)) {
              fs.mkdirSync(uploadsDir, { recursive: true });
            }
            
            // Generate a unique filename
            const filename = `gemini-generated-${uuidv4()}${fileExt}`;
            const filePath = path.join(uploadsDir, filename);
            
            // Write the image data to a file
            fs.writeFileSync(filePath, Buffer.from(imageData, 'base64'));
            
            console.log(`Image saved to: ${filePath}`);
            
            // Return the relative URL to the image
            return {
              imageUrl: `/uploads/${filename}`
            };
          }
        }
        
        // If no image was found, look for text response
        for (const part of parts) {
          if (part.text) {
            console.log('Received text response from Gemini API:', part.text);
            return {
              textResponse: part.text
            };
          }
        }
      }
      
      console.log('No valid response found in Gemini API response');
      return {
        textResponse: 'No valid response generated from the AI model.'
      };
    } catch (axiosError: any) {
      console.error('Axios error details:', {
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        data: axiosError.response?.data,
        message: axiosError.message
      });
      
      if (axiosError.response?.data) {
        console.error('API Error Response:', JSON.stringify(axiosError.response.data, null, 2));
      }
      
      throw new Error(`API request failed: ${axiosError.message}`);
    }
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
};

/**
 * Generate a text response from Gemini based on a prompt
 * 
 * @param prompt Text prompt for text generation
 * @returns Generated text response
 */
export async function generateTextWithGemini(prompt: string): Promise<string> {
  try {
    console.log('Starting text generation with Gemini API');
    console.log(`Prompt: ${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}`);
    
    // Create the request payload
    const payload: any = {
      contents: [
        {
          parts: [
            { text: prompt }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.4,
        topK: 32,
        topP: 1,
        maxOutputTokens: 2048,
      }
    };

    console.log('Sending request to Gemini API...');

    // Make the API request
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${API_KEY}`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 second timeout
      }
    );

    console.log('Received response from Gemini API');
    
    // Extract the text from the response
    const textResponse = extractTextFromResponse(response.data);
    
    if (!textResponse) {
      console.log('No text found in the response');
      throw new Error('No text was generated in the response');
    }

    return textResponse;
  } catch (error) {
    console.error('Error generating text with Gemini:', error);
    
    // Enhanced error logging
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:');
      console.error(`Status: ${error.response?.status}`);
      console.error(`Status Text: ${error.response?.statusText}`);
      console.error('Response data:', error.response?.data);
    }
    
    throw new Error(`Failed to generate text: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extract text data from Gemini API response
 * 
 * @param response The Gemini API response
 * @returns Text content or null if no text found
 */
function extractTextFromResponse(response: GeminiResponse): string | null {
  try {
    if (response.candidates && 
        response.candidates[0] && 
        response.candidates[0].content && 
        response.candidates[0].content.parts) {
      
      const parts = response.candidates[0].content.parts;
      
      // Look for text content
      for (const part of parts) {
        if (part.text) {
          return part.text;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting text from response:', error);
    return null;
  }
}

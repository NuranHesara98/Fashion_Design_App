import { OpenAI } from 'openai';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ImageGenerationResult } from '../types/imageTypes';
import { ImageGenerationMetadata } from '../types/metadataTypes';
import axios from 'axios';
import { storeGeneratedImage } from './imageStorageService';
import { APIKeyError } from '../utils/errors';

/**
 * Get OpenAI API key from environment variables
 * Checks multiple possible environment variable names
 * 
 * @returns The OpenAI API key
 * @throws Error if API key is not found
 */
const getOpenAIApiKey = (): string => {
  // Check for both possible environment variable names
  const apiKey = process.env.OPENAI_API_KEY || process.env.OPENAI_KEY;
  
  if (!apiKey) {
    throw new APIKeyError('OpenAI API key not found in environment variables. Please set OPENAI_API_KEY in your .env file.');
  }
  
  return apiKey;
};

/**
 * Generates an image using OpenAI's DALL-E API
 * 
 * @param prompt The text prompt to generate an image from
 * @param sketchPath Optional path to a sketch image to use as a reference
 * @param metadata Optional metadata about the image generation request
 * @param userId Optional user ID to associate the image with
 * @returns Promise with the result containing either an image URL or error
 */
export const generateImageWithOpenAI = async (
  prompt: string,
  sketchPath?: string,
  metadata?: ImageGenerationMetadata,
  userId?: string
): Promise<ImageGenerationResult> => {
  try {
    const apiKey = getOpenAIApiKey();
    
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not set in environment variables');
    }

    console.log(`Generating image with OpenAI DALL-E. Prompt: "${prompt.substring(0, 100)}..."`);
    
    // Create OpenAI client
    const openai = new OpenAI({
      apiKey: apiKey
    });
    
    // If a sketch path is provided, analyze it and enhance the prompt
    let enhancedPrompt = prompt;
    if (sketchPath && fs.existsSync(sketchPath)) {
      console.log(`Sketch provided at path: ${sketchPath}. Analyzing sketch...`);
      
      try {
        // Analyze the sketch to get a description
        const analysisResult = await analyzeSketchWithOpenAI(sketchPath);
        
        if (analysisResult.success && analysisResult.textResponse) {
          // Add the sketch description to the prompt
          const sketchDescription = analysisResult.textResponse;
          console.log(`Sketch analysis successful. Description: ${sketchDescription.substring(0, 100)}...`);
          
          // Create a more structured enhanced prompt that clearly incorporates the sketch analysis
          enhancedPrompt = `${prompt}\n\n===== SKETCH DETAILS - FOLLOW EXACTLY =====\n${sketchDescription}\n===== END SKETCH DETAILS =====\n\nCreate a fashion design that EXACTLY matches the sketch details above. The design must precisely follow the silhouette, neckline, sleeves, waistline, and all special details described in the analysis.\n\nThe clothing should be displayed on a mannequin/dress form. Use a clean neutral background. The image should be high-quality fashion photography suitable for a fashion catalog.`;
          
          console.log(`Enhanced prompt with sketch description. New prompt length: ${enhancedPrompt.length}`);
        } else {
          console.warn('Could not analyze sketch. Using original prompt. Error:', analysisResult.error);
          enhancedPrompt = `${prompt}\n\nThe clothing should be displayed on a mannequin/dress form. Use a clean neutral background. The image should be high-quality fashion photography suitable for a fashion catalog.`;
        }
      } catch (error) {
        console.error('Error during sketch analysis:', error);
        enhancedPrompt = `${prompt}\n\nThe clothing should be displayed on a mannequin/dress form. Use a clean neutral background. The image should be high-quality fashion photography suitable for a fashion catalog.`;
      }
    } else {
      if (sketchPath) {
        console.warn(`Sketch file not found at path: ${sketchPath}`);
      } else {
        console.log('No sketch path provided. Using original prompt.');
      }
      // Even if no sketch is provided, add the mannequin and white background requirements
      enhancedPrompt = `${prompt}\n\nThe clothing should be displayed on a mannequin/dress form. Use a clean neutral background. The image should be high-quality fashion photography suitable for a fashion catalog.`;
    }
    
    // Prepare the request options
    const requestOptions: any = {
      model: "dall-e-3", // Using dall-e-3 for best quality
      prompt: `${enhancedPrompt}\n\nImportant: This is a technical fashion design request. Create an EXACT reproduction of the described garment. Every detail must match the description precisely. Display on a dress form/mannequin with neutral background and professional studio lighting to show all construction details clearly.`,
      n: 1, // Generate 2 images instead of 1
      size: "1024x1024", // Standard size
      quality: "hd", // Using HD quality for more detailed images
    };
    
    // Ensure the prompt doesn't exceed DALL-E's limit (approximately 4000 chars)
    if (requestOptions.prompt.length > 4000) {
      console.log(`Prompt too long (${requestOptions.prompt.length} chars), truncating...`);
      // Keep the beginning of the prompt and the important instructions at the end
      const firstPart = requestOptions.prompt.substring(0, 1000); // First 1000 chars
      const lastPart = requestOptions.prompt.substring(requestOptions.prompt.length - 3000); // Last 3000 chars
      requestOptions.prompt = firstPart + "\n[...additional details omitted for length...]\n" + lastPart;
      console.log(`Truncated prompt length: ${requestOptions.prompt.length}`);
    }
    
    console.log('Sending image generation request to OpenAI...');
    const response = await openai.images.generate(requestOptions);
    
    if (!response.data || response.data.length === 0) {
      throw new Error('No image data returned from OpenAI API');
    }
    
    console.log(`Received ${response.data.length} images from OpenAI`);
    
    // Process all generated images
    const processedImages = [];
    
    for (const imageData of response.data) {
      const imageUrl = imageData.url;
      if (!imageUrl) {
        console.warn('Image without URL found in response, skipping');
        continue;
      }
      
      console.log('Processing image with URL:', imageUrl);
      
      // Download and save the image
      const savedImagePath = await downloadAndSaveImage(imageUrl);
      console.log('Image saved to:', savedImagePath);
      
      // Add enhancedPrompt to the metadata
      const updatedMetadata = {
        ...metadata,
        enhancedPrompt: enhancedPrompt
      };
      
      // Store the image in the database or cloud storage if needed
      const storedImageUrl = await storeGeneratedImage(savedImagePath, updatedMetadata, userId);
      
      console.log('Stored image URL:', storedImageUrl);
      
      processedImages.push({
        imageUrl: storedImageUrl || imageUrl,
        enhancedPrompt: enhancedPrompt,
      });
    }
    
    console.log(`Successfully processed ${processedImages.length} images`);
    
    return {
      success: true,
      imageUrls: processedImages.map(img => img.imageUrl),
      imageUrl: processedImages[0]?.imageUrl, // For backward compatibility
      enhancedPrompt: enhancedPrompt,
      provider: 'openai',
      multipleImages: processedImages.length > 1
    };
  } catch (error: any) {
    console.error('Error generating image with OpenAI:', error);
    
    let errorMessage = 'Failed to generate image with OpenAI';
    
    if (error.response) {
      console.error('OpenAI API error response:', error.response.data);
      errorMessage = `OpenAI API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`;
    } else if (error.message) {
      errorMessage = `Error: ${error.message}`;
    }
    
    return {
      success: false,
      error: errorMessage,
      provider: 'openai'
    };
  }
};

/**
 * Downloads an image from a URL and saves it to the local filesystem
 * 
 * @param imageUrl URL of the image to download
 * @returns Path to the saved image file
 */
async function downloadAndSaveImage(imageUrl: string): Promise<string> {
  try {
    // Create a unique filename with timestamp
    const filename = `image_${Date.now()}_${uuidv4().substring(0, 8)}.png`;
    
    // Define the path to save the image
    const savePath = path.resolve(__dirname, '../../public/generated-images', filename);
    const saveDir = path.dirname(savePath);
    
    // Ensure the directory exists
    if (!fs.existsSync(saveDir)) {
      fs.mkdirSync(saveDir, { recursive: true });
      console.log(`Created directory: ${saveDir}`);
    }
    
    console.log(`Downloading image from ${imageUrl} to ${savePath}`);
    
    // Download the image
    const response = await axios({
      method: 'GET',
      url: imageUrl,
      responseType: 'stream'
    });
    
    // Create a write stream to save the image
    const writer = fs.createWriteStream(savePath);
    
    // Pipe the image data to the file
    response.data.pipe(writer);
    
    // Return a promise that resolves when the file is saved
    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        console.log(`Image saved successfully to ${savePath}`);
        // Return the absolute path for storeGeneratedImage function
        resolve(savePath);
      });
      writer.on('error', (err) => {
        console.error(`Error saving image: ${err.message}`);
        reject(err);
      });
    });
  } catch (error) {
    console.error('Error downloading and saving image:', error);
    throw error;
  }
}

/**
 * Analyzes a sketch image using OpenAI's GPT API
 * 
 * @param sketchPath Path to the sketch image file
 * @returns Promise with the description of the sketch
 */
export const analyzeSketchWithOpenAI = async (
  sketchPath: string
): Promise<ImageGenerationResult> => {
  try {
    const apiKey = getOpenAIApiKey();

    if (!fs.existsSync(sketchPath)) {
      throw new Error(`Sketch file not found at path: ${sketchPath}`);
    }

    console.log(`Analyzing sketch at path: ${sketchPath}`);
    
    // Create OpenAI client
    const openai = new OpenAI({
      apiKey: apiKey
    });
    
    // Read the image file as base64
    const imageBuffer = fs.readFileSync(sketchPath);
    const base64Image = imageBuffer.toString('base64');
    
    // Prepare the request with a more detailed system prompt
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Using GPT-4o for best vision analysis
      messages: [
        {
          role: "system",
          content: "You are a master fashion designer and pattern maker with expertise in technical garment analysis. When analyzing fashion sketches, provide extremely detailed and precise descriptions covering:\n\n1. Silhouette & Cut: Precise shape, structure, and fit (e.g., A-line, pencil, empire, fitted)\n2. Neckline & Collar: Exact type with specific details (e.g., V-neck depth, collar width)\n3. Sleeves: Precise style, length, and all details (e.g., cap sleeve, bishop sleeve, cuff design)\n4. Waistline: Exact placement, shape, and construction details\n5. Hemline: Length, shape, and any special finishing\n6. Closures & Fastenings: All buttons, zippers, ties with their exact placement\n7. Darts, Seams & Construction: All visible construction elements\n8. Pockets: Type, placement, and details if present\n9. Special Details: Every embellishment, trim, or unique element\n10. Fabric Suggestions: Appropriate materials based on the design\n11. Color Palette: Suggested colors that would work well with this design\n\nYour analysis must be extremely technical, precise, and use proper fashion terminology. Focus ONLY on what is explicitly shown in the sketch - do not make assumptions about details that aren't visible. Format your response in a structured way with clear headings for each section."
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Analyze this fashion sketch with extreme precision. Provide a detailed technical description that would allow a pattern maker to recreate this exact design. Include every visible detail and specify exact measurements and construction elements:" },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 1200 // Increased token limit for more detailed analysis
    });
    
    // Extract the description from the response
    const description = response.choices[0]?.message?.content;
    
    if (!description) {
      throw new Error('No description returned from OpenAI API');
    }
    
    console.log('Sketch analysis completed successfully');
    console.log('Analysis result:', description.substring(0, 100) + '...');
    
    return {
      success: true,
      textResponse: description,
      provider: 'openai'
    };
  } catch (error: any) {
    console.error('Error analyzing sketch with OpenAI:', error);
    
    let errorMessage = 'Failed to analyze sketch with OpenAI';
    
    if (error.response) {
      console.error('OpenAI API error response:', error.response.data);
      errorMessage = `OpenAI API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`;
    } else if (error.message) {
      errorMessage = `Error: ${error.message}`;
    }
    
    return {
      success: false,
      error: errorMessage,
      provider: 'openai'
    };
  }
};

/**
 * Generates text using OpenAI's GPT API
 * 
 * @param prompt The prompt to generate text from
 * @returns Promise with the generated text
 */
export const generateTextWithOpenAI = async (
  prompt: string
): Promise<ImageGenerationResult> => {
  try {
    const apiKey = getOpenAIApiKey();
    console.log(`Generating text with OpenAI GPT. Prompt: "${prompt}"`);
    
    // Create OpenAI client
    const openai = new OpenAI({
      apiKey: apiKey
    });
    
    // Make the API request
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a fashion design expert. Provide detailed, helpful responses about fashion design, clothing, and style."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 500
    });
    
    // Extract the text from the response
    const generatedText = response.choices[0]?.message?.content;
    
    if (!generatedText) {
      throw new Error('No text returned from OpenAI API');
    }
    
    console.log('Text generated successfully with OpenAI GPT');
    
    return {
      success: true,
      textResponse: generatedText,
      provider: 'openai'
    };
  } catch (error: any) {
    console.error('Error generating text with OpenAI GPT:', error);
    
    let errorMessage = 'Failed to generate text with OpenAI';
    
    if (error.response) {
      console.error('OpenAI API error response:', error.response.data);
      errorMessage = `OpenAI API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`;
    } else if (error.message) {
      errorMessage = `Error: ${error.message}`;
    }
    
    return {
      success: false,
      error: errorMessage,
      provider: 'openai'
    };
  }
};

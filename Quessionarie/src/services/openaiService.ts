import { OpenAI } from 'openai';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ImageGenerationResult } from '../types/imageTypes';
import { ImageGenerationMetadata } from '../types/metadataTypes';
import axios from 'axios';
import { storeGeneratedImage } from './imageStorageService';

/**
 * Generates an image using OpenAI's DALL-E API
 * 
 * @param prompt The text prompt to generate an image from
 * @param sketchPath Optional path to a sketch image to use as a reference
 * @param metadata Optional metadata about the image generation request
 * @returns Promise with the result containing either an image URL or error
 */
export const generateImageWithOpenAI = async (
  prompt: string,
  sketchPath?: string,
  metadata?: ImageGenerationMetadata
): Promise<ImageGenerationResult> => {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not set in environment variables');
    }

    console.log(`Generating image with OpenAI DALL-E. Prompt: "${prompt}"`);
    
    // Create OpenAI client
    const openai = new OpenAI({
      apiKey: apiKey
    });
    
    // If a sketch path is provided, analyze it and enhance the prompt
    let enhancedPrompt = prompt;
    if (sketchPath && fs.existsSync(sketchPath)) {
      console.log(`Sketch provided at path: ${sketchPath}. Analyzing sketch...`);
      
      // Analyze the sketch to get a description
      const analysisResult = await analyzeSketchWithOpenAI(sketchPath);
      
      if (analysisResult.success && analysisResult.textResponse) {
        // Add the sketch description to the prompt
        const sketchDescription = analysisResult.textResponse;
        enhancedPrompt = `${prompt}\n\nBased on this sketch description: ${sketchDescription}\n\nThe clothing should be displayed on a mannequin/dress form, not on a human model. Use a clean white background. The image should be photorealistic, high-quality fashion photography, not looking AI-generated. Make it look like a professional product photograph from a high-end fashion catalog.`;
        console.log(`Enhanced prompt with sketch description. New prompt length: ${enhancedPrompt.length}`);
      } else {
        console.warn('Could not analyze sketch. Using original prompt.');
        enhancedPrompt = `${prompt}\n\nThe clothing should be displayed on a mannequin/dress form, not on a human model. Use a clean white background. The image should be photorealistic, high-quality fashion photography, not looking AI-generated. Make it look like a professional product photograph from a high-end fashion catalog.`;
      }
    } else {
      // Even if no sketch is provided, add the mannequin and white background requirements
      enhancedPrompt = `${prompt}\n\nThe clothing should be displayed on a mannequin/dress form, not on a human model. Use a clean white background. The image should be photorealistic, high-quality fashion photography, not looking AI-generated. Make it look like a professional product photograph from a high-end fashion catalog.`;
    }
    
    // Prepare the request options
    const requestOptions: any = {
      model: "dall-e-3", // Using dall-e-3 for better quality
      prompt: enhancedPrompt,
      n: 1,
      size: "1024x1024", // Using 1024x1024 size
      response_format: "url" // Options: "url" or "b64_json"
    };

    // Make the API request using the OpenAI SDK
    const response = await openai.images.generate(requestOptions);
    
    // Extract the image URL from the response
    const imageUrl = response.data[0].url;
    
    if (!imageUrl) {
      throw new Error('No image URL returned from OpenAI API');
    }

    console.log('Image generated successfully with OpenAI DALL-E');
    
    // Download and save the image locally
    const localImagePath = await downloadAndSaveImage(imageUrl);
    
    // Store the generated image in MongoDB and AWS S3
    try {
      const storedImage = await storeGeneratedImage(
        imageUrl,
        localImagePath,
        prompt,
        enhancedPrompt,
        sketchPath,
        metadata
      );
      
      console.log(`Image stored successfully in MongoDB and S3. MongoDB ID: ${storedImage._id}, S3 URL: ${storedImage.s3Url}`);
    } catch (storageError) {
      console.error('Error storing image in MongoDB and S3:', storageError);
      // Continue even if storage fails, as we still have the local image
    }
    
    return {
      success: true,
      imageUrl: imageUrl,
      localImagePath: localImagePath, // Add the local path to the result
      enhancedPrompt: enhancedPrompt, // Include the enhanced prompt in the result
      provider: 'openai'
    };
  } catch (error: any) {
    console.error('Error generating image with OpenAI DALL-E:', error);
    
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
        // Return the relative path from the public folder for use in URLs
        const relativePath = `/generated-images/${filename}`;
        resolve(relativePath);
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
 * Analyzes a sketch image using OpenAI's GPT-4 Vision API
 * 
 * @param sketchPath Path to the sketch image file
 * @returns Promise with the description of the sketch
 */
export const analyzeSketchWithOpenAI = async (
  sketchPath: string
): Promise<ImageGenerationResult> => {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not set in environment variables');
    }

    if (!fs.existsSync(sketchPath)) {
      throw new Error(`Sketch file not found at path: ${sketchPath}`);
    }

    console.log(`Analyzing sketch image with OpenAI Vision API: ${sketchPath}`);
    
    // Create OpenAI client
    const openai = new OpenAI({
      apiKey: apiKey
    });
    
    // Read the image file and convert to base64
    const imageBuffer = fs.readFileSync(sketchPath);
    const base64Image = imageBuffer.toString('base64');
    
    // Prepare the request options
    const requestOptions: any = {
      model: "gpt-4o", // Using GPT-4 with vision capabilities
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "This is a fashion design sketch. Please provide a detailed description of the design, including the type of garment, style elements, silhouette, and any notable features. Focus on describing it in a way that would help generate a similar design as a photorealistic image of the garment on a mannequin with a white background. Be specific but concise."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 500
    };

    // Make the API request using the OpenAI SDK
    const response = await openai.chat.completions.create(requestOptions);
    
    // Extract the generated description from the response
    const description = response.choices[0]?.message?.content?.trim() || '';
    
    if (!description) {
      throw new Error('No description generated by OpenAI Vision API');
    }

    console.log('Sketch analysis completed successfully');
    console.log('Generated description:', description);
    
    return {
      success: true,
      textResponse: description,
      provider: 'openai'
    };
  } catch (error: any) {
    console.error('Error analyzing sketch with OpenAI Vision API:', error);
    
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
export const generateTextWithOpenAI = async (prompt: string): Promise<ImageGenerationResult> => {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not set in environment variables');
    }

    console.log(`Generating text with OpenAI GPT. Prompt: "${prompt}"`);
    
    // Create OpenAI client
    const openai = new OpenAI({
      apiKey: apiKey
    });
    
    // Prepare the request options
    const requestOptions: any = {
      model: "gpt-4o", // You can also use "gpt-3.5-turbo" for a more cost-effective option
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant specializing in fashion design and clothing descriptions."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    };

    // Make the API request using the OpenAI SDK
    const response = await openai.chat.completions.create(requestOptions);
    
    // Extract the generated text from the response
    const generatedText = response.choices[0]?.message?.content?.trim() || '';
    
    if (!generatedText) {
      throw new Error('No text generated by OpenAI API');
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
